module Component.InstallButtonLazy (installButtonLazy) where

import Prelude

import Component.Lazy (LazyComponent, LazyGate(..), lazyComponent, renderLazy)
import Effect (Effect)
import Promise (Promise)
import React.Basic (JSX)

-- The install button is the only main-thread three/r3f consumer (the diagram
-- Scene runs off-thread in a worker), so importing it statically drags ~378KB-gz
-- of three into the initial chunk. Here it is pulled through a dynamic import()
-- behind a Suspense boundary instead, gated on idle: three lands in its own
-- async chunk that streams in once the hero has painted, covered meanwhile by
-- the neon intro (~2.5s) so the empty fallback is never seen.
installButtonLazy :: JSX
installButtonLazy = renderLazy buttonLazy identity

buttonLazy :: LazyComponent JSX
buttonLazy = lazyComponent
  { name: "InstallButton"
  , gate: OnIdle
  , fallback: mempty
  , load: importInstallButtonImpl
  }

-- Dynamic import of the compiled InstallButtonSDF module, resolving to its JSX.
-- Deliberately not a static import, so three only enters this async chunk.
foreign import importInstallButtonImpl :: Effect (Promise JSX)
