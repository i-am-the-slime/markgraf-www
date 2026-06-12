-- @client
module Page.SdfLab (page, mkSdfLabPage) where

import Prelude

import Component.SdfDiagram (sdfDiagram)
import Effect.Unsafe (unsafePerformEffect)
import Next (Page, nextPage)
import React.Basic (ReactComponent, element)
import React.Basic.Hooks (Component, component)
import Unsafe.Coerce (unsafeCoerce)
import Yoga.React.Om as Om
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.HTML.Main (main)

-- The /sdf-lab route — a bare full-bleed canvas hosting the SDF diagram spike.
page :: Page "sdf-lab"
page = nextPage {} $ pure \_ -> Om.pure (element sdfLabComponent {})
  where
  sdfLabComponent :: ReactComponent {}
  sdfLabComponent = unsafeCoerce (unsafePerformEffect mkSdfLabPage)

mkSdfLabPage :: Component {}
mkSdfLabPage =
  component "SdfLabPage" \_ ->
    pure $
      main
        { className: "relative h-screen w-screen bg-[#0b0b0d] overflow-hidden" }
        [ div { className: "absolute inset-0" } [ sdfDiagram ] ]
