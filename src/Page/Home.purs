-- @client
module Page.Home where

import Prelude

import Component.HeroPreview (mkHeroPreview)
import Effect.Unsafe (unsafePerformEffect)
import Next (Page, Root, nextPage)
import React.Basic (ReactComponent, element)
import Unsafe.Coerce (unsafeCoerce)
import Yoga.React.Om as Om

-- The home route: the scrolling magazine (HeroPreview). A client component — it
-- owns the r3f canvas, the offscreen worker and all the scroll/intersection state.
-- Rendered as a React component element (it has hooks), not called inline.
page :: Page Root
page = nextPage {} $ pure \_ -> Om.pure (element heroComponent {})
  where
  heroComponent :: ReactComponent {}
  heroComponent = unsafeCoerce (unsafePerformEffect mkHeroPreview)
