module Page.InstallButtonLazy (installButtonLazy) where

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
import React.Basic.Hooks.Suspense (Suspended(..), SuspenseResult(..), suspend, suspense)

-- The install button is the only main-thread three/r3f consumer (the diagram
-- Scene runs off-thread in a worker), so importing it statically drags ~378KB-gz
-- of three into the initial chunk. Here it is pulled through a dynamic import()
-- behind a Suspense boundary instead: three lands in its own async chunk that
-- streams in during the hero's neon intro, which covers the button for ~2.5s.
installButtonLazy :: JSX
installButtonLazy = suspense { fallback: mempty, children: [ element lazyInner {} ] }

lazyInner :: ReactComponent {}
lazyInner = unsafePerformEffect $ reactComponent "InstallButtonLazy" \(_ :: {}) ->
  suspend suspendedButton

-- React.lazy-style cache: the first render starts the import and parks as
-- InProgress (suspend throws the promise, so Suspense shows the empty fallback);
-- when it resolves the cache flips to Complete and the button's JSX renders. The
-- module-level Ref is the cache React needs to live outside the component tree.
suspendedButton :: Suspended JSX
suspendedButton = Suspended do
  Ref.read cacheRef >>= case _ of
    Just result -> pure result
    Nothing -> do
      fiber <- launchAff do
        jsx <- toAffE importInstallButtonImpl
        liftEffect (Ref.write (Just (Complete jsx)) cacheRef)
        pure jsx
      let pending = InProgress fiber
      Ref.write (Just pending) cacheRef
      pure pending

cacheRef :: Ref (Maybe (SuspenseResult JSX))
cacheRef = unsafePerformEffect (Ref.new Nothing)

-- Dynamic import of the compiled InstallButtonSDF module, resolving to its JSX.
-- Deliberately not a static import, so three only enters this async chunk.
foreign import importInstallButtonImpl :: Effect (Promise JSX)
