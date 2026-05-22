module Page.Boot (default) where

import Effect.Unsafe (unsafePerformEffect)
import Page.HeroPreview (mkHeroPreview)
import React.Basic (JSX)

default :: {} -> JSX
default = unsafePerformEffect mkHeroPreview
