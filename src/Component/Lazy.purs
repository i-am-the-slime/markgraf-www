module Component.Lazy
  ( LazyGate(..)
  , onVisiblePx
  , LazyComponent
  , lazyComponent
  , renderLazy
  ) where

import Prelude

import CSS.Size (px)
import Data.Either (Either(..))
import Data.Foldable (for_)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype, un)
import Data.Nullable (Nullable, null)
import Data.Options ((:=))
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import Effect.Aff (Milliseconds(..), delay, killFiber, launchAff, launchAff_)
import Effect.Class (liftEffect)
import Effect.Exception (error, try)
import Effect.Ref (Ref)
import Effect.Ref as Ref
import Effect.Unsafe (unsafePerformEffect)
import Promise (Promise)
import Promise.Aff (toAffE)
import React.Basic (JSX, ReactComponent, element)
import React.Basic.Hooks (reactComponent, readRefMaybe, useEffectOnce, useRef, useState')
import React.Basic.Hooks as React
import React.Basic.Hooks.Suspense (Suspended(..), SuspenseResult(..), suspend, suspense)
import Web.DOM.Element (Element)
import Web.HTML (window)
import Web.HTML.Window (cancelIdleCallback, requestIdleCallback)
import Web.Intersection.Observer as IO
import Web.Intersection.Observer.Options (RootMargin, rm)
import Web.Intersection.Observer.Options as IOpt
import Yoga.React.DOM.Attributes (reactRef)
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.Internal (css)

-- | When a lazy island is allowed to begin its dynamic import().
-- |
-- | `Eager` fires on first render — right for above-the-fold content whose
-- | chunk you want in flight immediately. `OnIdle` waits for an idle callback
-- | after first paint (a short delay on Safari, which lacks one), so a heavy
-- | chunk stops competing with the hero's critical render. `OnVisible` holds
-- | the import until a
-- | sentinel approaches the viewport (the `RootMargin` arms it early), so a
-- | below-the-fold chunk only loads as the reader scrolls toward it.
data LazyGate = Eager | OnIdle | OnVisible RootMargin

-- | `OnVisible` armed when the sentinel is within `n` px above or below the
-- | viewport, so the chunk has a head start before the content scrolls in.
onVisiblePx :: Number -> LazyGate
onVisiblePx n = OnVisible (rm (px n) (px 0.0) (px n) (px 0.0))

-- | A prepared lazy island: the stable component React mounts, plus the
-- | Suspense fallback shown while the chunk (or its gate) is pending. Build it
-- | once at module level so its identity — and its import cache — survive
-- | re-renders.
newtype LazyComponent a = LazyComponent
  { component :: ReactComponent { render :: a -> JSX }
  , fallback :: JSX
  }

derive instance Newtype (LazyComponent a) _

-- | Prepare a lazy island. Bind the result to a top-level value so the cache
-- | `Ref` and the components are created exactly once.
lazyComponent
  :: forall a
   . { name :: String
     , gate :: LazyGate
     , fallback :: JSX
     , load :: Effect (Promise a)
     }
  -> LazyComponent a
lazyComponent opts = unsafePerformEffect do
  cache <- Ref.new Nothing
  loader <- reactComponent (opts.name <> "Loader") \{ render } -> React.do
    value <- suspend (loadCached cache opts.load)
    pure (render value)
  component <- case opts.gate of
    Eager -> pure loader
    OnIdle -> reactComponent opts.name (idleGated loader opts.fallback)
    OnVisible margin -> reactComponent opts.name (visibleGated loader opts.fallback margin)
  pure (LazyComponent { component, fallback: opts.fallback })

-- | Render a prepared island with a per-call view of the resolved value. The
-- | `render` callback runs on every parent render, so props captured here stay
-- | live once the chunk has loaded.
renderLazy :: forall a. LazyComponent a -> (a -> JSX) -> JSX
renderLazy lazy render =
  suspense { fallback: l.fallback, children: [ element l.component { render } ] }
  where
  l = un LazyComponent lazy

-- A loader whose import is held back until an idle callback arms it. Before
-- arming it renders the fallback without suspending; once armed it delegates to
-- the inner loader, which suspends on the cached import.
idleGated
  :: forall a
   . ReactComponent { render :: a -> JSX }
  -> JSX
  -> { render :: a -> JSX }
  -> React.Render Unit _ JSX
idleGated loader fallback { render } = React.do
  armed /\ setArmed <- useState' false
  useEffectOnce (armWhenIdle (setArmed true))
  pure (if armed then element loader { render } else fallback)

-- Arm on the next idle period, deferring the chunk past the hero's first paint.
-- WebKit never shipped requestIdleCallback, and calling an absent one throws —
-- which here would blank the whole tree — so we `try` it and let Safari fall
-- back to a short Aff delay. Either branch returns its own canceller.
armWhenIdle :: Effect Unit -> Effect (Effect Unit)
armWhenIdle arm = do
  win <- window
  try (requestIdleCallback { timeout: 2000 } arm win) >>= case _ of
    Right id -> pure (cancelIdleCallback id win)
    Left _ -> delayArm
  where
  delayArm = do
    fiber <- launchAff do
      delay (Milliseconds 200.0)
      arm # liftEffect
    pure (launchAff_ (killFiber (error "arm cancelled") fiber))

-- A loader held back until a zero-height sentinel crosses into the viewport's
-- expanded margin. The sentinel sits in the scroll flow where the content will
-- land; once it arms, the inner loader suspends on the cached import.
visibleGated
  :: forall a
   . ReactComponent { render :: a -> JSX }
  -> JSX
  -> RootMargin
  -> { render :: a -> JSX }
  -> React.Render Unit _ JSX
visibleGated loader fallback margin { render } = React.do
  armed /\ setArmed <- useState' false
  nodeRef <- useRef (null :: Nullable Element)
  useEffectOnce (observeOnce margin nodeRef (setArmed true))
  pure
    ( if armed then element loader { render }
      else div { ref: reactRef nodeRef, style: css { height: "0px" } } [ fallback ]
    )

-- Observe the sentinel against the viewport (margin-expanded) and arm on the
-- first crossing. Returns a cleanup that unobserves.
observeOnce :: RootMargin -> React.Ref (Nullable Element) -> Effect Unit -> Effect (Effect Unit)
observeOnce margin nodeRef arm = readRefMaybe nodeRef >>= case _ of
  Nothing -> pure (pure unit)
  Just el -> do
    obs <- IO.newIntersectionObserver onCross (IOpt.rootMargin := margin)
    IO.observe obs el
    pure (IO.unobserve obs el)
  where
  onCross entries _ = for_ entries \e -> when e.isIntersecting arm

-- React.lazy-style cache: the first render starts the import and parks as
-- InProgress (suspend throws the promise, so Suspense shows the fallback); when
-- it resolves the cache flips to Complete and the value renders. The Ref lives
-- outside the component tree because that is where React needs the cache.
loadCached :: forall a. Ref (Maybe (SuspenseResult a)) -> Effect (Promise a) -> Suspended a
loadCached cache load = Suspended do
  Ref.read cache >>= case _ of
    Just result -> pure result
    Nothing -> do
      fiber <- launchAff do
        value <- toAffE load
        Ref.write (Just (Complete value)) cache # liftEffect
        pure value
      let pending = InProgress fiber
      Ref.write (Just pending) cache
      pure pending
