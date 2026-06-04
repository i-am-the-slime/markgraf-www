module Component.PlayerLazy (markgrafPlayerLazy, PlayerProps) where

import Prelude

import Component.Lazy (LazyComponent, LazyGate(..), lazyComponent, renderLazy)
import Effect (Effect)
import Promise (Promise)
import React.Basic (JSX, ReactComponent, element)

type PlayerProps =
  { src :: String
  , renderer :: String
  , theme :: String
  , transparent :: Boolean
  , width :: Number
  , height :: Number
  }

-- markgraf-react's MarkgrafPlayer (~95KB-gz) is the largest single eager piece.
-- Load it through a dynamic import() behind a Suspense boundary so it lands in
-- its own async chunk. Eager rather than idle-gated because the caller already
-- holds it back until the preview is measured (size > 0) and the wordmark has
-- settled, so the import only fires when the player is genuinely about to show.
markgrafPlayerLazy :: PlayerProps -> JSX
markgrafPlayerLazy props = renderLazy playerLazy \component -> element component props

playerLazy :: LazyComponent (ReactComponent PlayerProps)
playerLazy = lazyComponent
  { name: "MarkgrafPlayer"
  , gate: Eager
  , fallback: mempty
  , load: importPlayerImpl
  }

-- Dynamic import of markgraf-react, resolving to the MarkgrafPlayer component.
-- Not a static import, so markgraf-react only enters this async chunk.
foreign import importPlayerImpl :: Effect (Promise (ReactComponent PlayerProps))
