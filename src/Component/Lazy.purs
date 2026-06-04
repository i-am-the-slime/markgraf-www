module Component.Lazy
  ( LazyGate(..)
  , LazyComponent
  , lazyComponent
  , renderLazy
  ) where

import Prelude

import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype, un)
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import Effect.Aff (launchAff)
import Effect.Class (liftEffect)
import Effect.Ref (Ref)
import Effect.Ref as Ref
import Effect.Unsafe (unsafePerformEffect)
import Promise (Promise)
import Promise.Aff (toAffE)
import React.Basic (JSX, ReactComponent, element)
import React.Basic.Hooks (reactComponent, useEffectOnce, useState')
import React.Basic.Hooks as React
import React.Basic.Hooks.Suspense (Suspended(..), SuspenseResult(..), suspend, suspense)
import Web.HTML (window)
import Web.HTML.Window (cancelIdleCallback, requestIdleCallback)

-- | When a lazy island is allowed to begin its dynamic import().
-- |
-- | `Eager` fires on first render — right for above-the-fold content whose
-- | chunk you want in flight immediately. `OnIdle` waits for a
-- | `requestIdleCallback` after first paint, so a heavy chunk (three/r3f)
-- | stops competing with the hero's critical render and streams in once the
-- | main thread is quiet.
data LazyGate = Eager | OnIdle

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
    OnIdle -> reactComponent opts.name (gated loader opts.fallback)
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
gated
  :: forall a
   . ReactComponent { render :: a -> JSX }
  -> JSX
  -> { render :: a -> JSX }
  -> React.Render Unit _ JSX
gated loader fallback { render } = React.do
  armed /\ setArmed <- useState' false
  useEffectOnce do
    win <- window
    id <- requestIdleCallback { timeout: 2000 } (setArmed true) win
    pure (cancelIdleCallback id win)
  pure (if armed then element loader { render } else fallback)

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
