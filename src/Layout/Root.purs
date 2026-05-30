module Layout.Root (default, metadata) where

import Prelude

import React.Basic (JSX)
import Yoga.React.DOM.HTML.HTML (html)
import Yoga.React.DOM.HTML.Body (body)
import Yoga.React.DOM.HTML.Div (div)

default :: { children :: JSX } -> JSX
default { children } = html { lang: "en" } [ body {} [ children, playerShadeFilter ] ]

-- A hidden SVG filter the player references from CSS (filter: url(#player-shade)).
-- It darkens only the painted pixels of the graph by a top-to-bottom gradient, so
-- the graph reads as lit from the wordmark overhead and falling into shadow at its
-- foot while the transparent areas stay clear.
playerShadeFilter :: JSX
playerShadeFilter =
  div { dangerouslySetInnerHTML: { __html: markup } } []
  where
  -- feImage floods a vertical black ramp over the box; feComposite … in2=SourceAlpha
  -- clips that ramp to the graph's own shape; feMerge lays it back over the graph.
  -- Injected as raw SVG since the filter primitives have no PureScript bindings.
  markup =
    "<svg width=\"0\" height=\"0\" aria-hidden=\"true\" focusable=\"false\" style=\"position:absolute\">"
      <> "<filter id=\"player-shade\" x=\"0%\" y=\"0%\" width=\"100%\" height=\"100%\" color-interpolation-filters=\"sRGB\">"
      <> "<feImage preserveAspectRatio=\"none\" href=\"data:image/svg+xml,"
      <> "<svg xmlns='http://www.w3.org/2000/svg' width='1' height='100' preserveAspectRatio='none'>"
      <> "<linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>"
      <> "<stop offset='0' stop-color='black' stop-opacity='0'/>"
      <> "<stop offset='0.45' stop-color='black' stop-opacity='0'/>"
      <> "<stop offset='0.78' stop-color='black' stop-opacity='0.28'/>"
      <> "<stop offset='1' stop-color='black' stop-opacity='0.55'/>"
      <> "</linearGradient>"
      <> "<rect width='1' height='100' fill='url(%23g)'/>"
      <> "</svg>\" result=\"grad\"/>"
      <> "<feComposite in=\"grad\" in2=\"SourceAlpha\" operator=\"in\" result=\"shade\"/>"
      <> "<feMerge><feMergeNode in=\"SourceGraphic\"/><feMergeNode in=\"shade\"/></feMerge>"
      <> "</filter></svg>"

metadata ::
  { title :: String
  , description :: String
  }
metadata =
  { title: "markgraf — animated graph diagrams"
  , description: "Render short animated graph diagrams from a tiny declarative source language."
  }
