module Layout.Root (default, metadata) where

import Prelude

import React.Basic (JSX)
import Yoga.React.DOM.HTML.HTML (html)
import Yoga.React.DOM.HTML.Body (body)
import Yoga.React.DOM.HTML.Script (scriptInline)

default :: { children :: JSX } -> JSX
default { children } =
  html { lang: "en" } [ body {} [ scriptInline {} fontGate, children ] ]

-- Hold the whole page hidden until every webfont has loaded, then reveal it in
-- one go — no fallback-to-webfont swap is ever visible. Runs inline at the top
-- of <body> so it hides before any content paints; explicitly kicks off all
-- three font loads so the gate doesn't depend on render timing; falls back to
-- revealing on a timeout, on error, or when the Font Loading API is absent, so
-- the page can never get stuck blank.
fontGate :: String
fontGate =
  "(function(){var d=document,r=d.documentElement;r.classList.add('fonts-loading');"
    <> "function reveal(){r.classList.remove('fonts-loading');r.classList.add('fonts-ready');}"
    <> "if(d.fonts&&d.fonts.load){Promise.all(["
    <> "d.fonts.load('1em Sinistre'),"
    <> "d.fonts.load('600 1em Ilisarniq'),"
    <> "d.fonts.load('1em \"Commit Mono\"')"
    <> "]).then(reveal).catch(reveal);setTimeout(reveal,3000);}else{reveal();}})();"

metadata ::
  { title :: String
  , description :: String
  }
metadata =
  { title: "markgraf — animated graph diagrams"
  , description: "Render short animated graph diagrams from a tiny declarative source language."
  }
