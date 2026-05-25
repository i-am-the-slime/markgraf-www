module Page.PrivacyBoot (default) where

import Effect.Unsafe (unsafePerformEffect)
import Page.Privacy (mkPrivacyPage)
import React.Basic (JSX)

default :: {} -> JSX
default = unsafePerformEffect mkPrivacyPage
