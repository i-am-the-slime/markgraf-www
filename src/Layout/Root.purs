module Layout.Root (default, metadata) where

import Prelude

import React.Basic (JSX)
import React.Basic.DOM as D

default :: { children :: JSX } -> JSX
default { children } =
  D.html
    { lang: "en"
    , children:
        [ D.body_ [ children ]
        ]
    }

metadata ::
  { title :: String
  , description :: String
  }
metadata =
  { title: "markgraf — animated graph diagrams"
  , description: "Render short animated graph diagrams from a tiny declarative source language."
  }
