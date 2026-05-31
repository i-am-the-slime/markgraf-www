module Page.PlayerLazy (markgrafPlayerLazy, PlayerProps) where

import Prelude

import Promise (Promise)
import Promise.Aff (toAffE)
import Data.Maybe (Maybe(..))
import Effect (Effect)
import Effect.Aff (launchAff)
import Effect.Class (liftEffect)
import Effect.Ref (Ref)
import Effect.Ref as Ref
import Effect.Unsafe (unsafePerformEffect)
import React.Basic (JSX, ReactComponent, element)
import React.Basic.Hooks (reactComponent)
import React.Basic.Hooks as React
import React.Basic.Hooks.Suspense (Suspended(..), SuspenseResult(..), suspend, suspense)

type PlayerProps =
  { src :: String
  , renderer :: String
  , theme :: String
  , transparent :: Boolean
  , width :: Number
  , height :: Number
  }

-- markgraf-react's MarkgrafPlayer (~95KB-gz) is the largest single eager piece.
-- Load it through a dynamic import() behind a Suspense boundary so it lands in its
-- own async chunk, streamed in during the hero's neon intro. The player is already
-- .player-reveal-gated to ~2.5s, so the empty fallback is never actually seen.
markgrafPlayerLazy :: PlayerProps -> JSX
markgrafPlayerLazy props =
  suspense { fallback: mempty, children: [ element lazyPlayer props ] }

-- Suspends until the component is imported, then renders it with the forwarded
-- props. Once loaded the cache stays Complete, so prop changes (resize) just
-- re-render the already-loaded player.
lazyPlayer :: ReactComponent PlayerProps
lazyPlayer = unsafePerformEffect $ reactComponent "MarkgrafPlayerLazy" \props -> React.do
  component <- suspend suspendedPlayer
  pure (element component props)

suspendedPlayer :: Suspended (ReactComponent PlayerProps)
suspendedPlayer = Suspended do
  Ref.read cacheRef >>= case _ of
    Just result -> pure result
    Nothing -> do
      fiber <- launchAff do
        component <- toAffE importPlayerImpl
        liftEffect (Ref.write (Just (Complete component)) cacheRef)
        pure component
      let pending = InProgress fiber
      Ref.write (Just pending) cacheRef
      pure pending

cacheRef :: Ref (Maybe (SuspenseResult (ReactComponent PlayerProps)))
cacheRef = unsafePerformEffect (Ref.new Nothing)

-- Dynamic import of markgraf-react, resolving to the MarkgrafPlayer component.
-- Not a static import, so markgraf-react only enters this async chunk.
foreign import importPlayerImpl :: Effect (Promise (ReactComponent PlayerProps))
