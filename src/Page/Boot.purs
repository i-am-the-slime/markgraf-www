module Page.Boot (default) where

import Effect.Unsafe (unsafePerformEffect)
import Page.Home (mkHomePage)
import React.Basic (JSX)

-- | Default-export a singleton component-as-function built once at module
-- | init. The thin app/page.js stub re-exports this as the page's default
-- | export; everything user-visible is authored in PureScript.
default :: {} -> JSX
default = unsafePerformEffect mkHomePage
