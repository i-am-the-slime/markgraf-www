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

-- markgraf-react's MarkgrafPlayer (~95KB-gz) is loaded through a dynamic import()
-- behind a Suspense boundary so it lands in its own async chunk. Gated Eager, not
-- idle: the player is hoisted into the hero, so it is the LCP subject — deferring
-- its ~1.5s init trims TTI but pushes the hero paint (and LCP) later, a net loss
-- (measured: LCP 2.4->2.9s, score 97->94 on Slow 4G). The fix for that 1.5s is to
-- make markgraf-react's init cheaper, or prerender the first frame as static SVG.
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
