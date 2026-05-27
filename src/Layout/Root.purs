module Layout.Root (default, metadata) where

import Prelude

import React.Basic (JSX)
import Yoga.React.DOM.HTML.HTML (html)
import Yoga.React.DOM.HTML.Body (body)

default :: { children :: JSX } -> JSX
default { children } = html { lang: "en" } [ body {} [ children ] ]

metadata ::
  { title :: String
  , description :: String
  }
metadata =
  { title: "markgraf — animated graph diagrams"
  , description: "Render short animated graph diagrams from a tiny declarative source language."
  }
