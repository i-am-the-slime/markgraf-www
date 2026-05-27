module Page.Privacy (mkPrivacyPage) where

import Prelude

import React.Basic (JSX)
import React.Basic.Hooks (Component, component)
import Yoga.React.DOM.HTML.A (a)
import Yoga.React.DOM.HTML.Code (code) as H
import Yoga.React.DOM.HTML.H (h1, h2)
import Yoga.React.DOM.HTML.Main (main)
import Yoga.React.DOM.HTML.P (p)
import Yoga.React.DOM.HTML.Section (section) as H
import Yoga.React.DOM.HTML.Strong (strong)
import Yoga.React.DOM.Internal (text)

mkPrivacyPage :: Component {}
mkPrivacyPage =
  component "PrivacyPage" \_ ->
    pure $
      main
        { className: "min-h-screen px-6 py-16 sm:py-24 max-w-2xl mx-auto" }
        [ heading
        , updated
        , section "What the markgraf browser extension does"
            [ text "The extension scans rendered markdown pages on github.com and gist.github.com for "
            , code "```markgraf"
            , text " fenced code blocks and replaces each one with an inline animation player. "
            , text "All parsing, layout, and rendering happens locally in your browser."
            ]
        , section "Data we collect"
            [ strong {} [ text "None." ]
            , text " The extension does not collect, transmit, sell, or share any personal data. "
            , text "It performs no analytics, no telemetry, and no remote logging."
            ]
        , section "Network requests"
            [ text "The extension makes no network requests of its own. The web pages you visit may "
            , text "continue to load their own resources as they normally would; the extension does not "
            , text "intercept, modify, or proxy them."
            ]
        , section "Storage and permissions"
            [ text "The extension requests access only to "
            , code "github.com"
            , text " and "
            , code "gist.github.com"
            , text " so it can find markgraf code blocks on pages you already visit. It stores no data "
            , text "in browser storage and uses no cookies."
            ]
        , section "Source code"
            [ text "The full source is published at "
            , link "https://github.com/markgrafhq/markgraf-browser-extension"
                "github.com/markgrafhq/markgraf-browser-extension"
            , text "."
            ]
        , section "Contact"
            [ text "Questions about this policy: open an issue on the GitHub repository above."
            ]
        ]

heading :: JSX
heading =
  h1 { className: "text-2xl font-medium tracking-tight mb-2" } [ text "Privacy" ]

updated :: JSX
updated =
  p { className: "text-xs uppercase tracking-widest text-muted-foreground mb-10" }
    [ text "Last updated 2026-05-25" ]

section :: String -> Array JSX -> JSX
section title body =
  H.section { className: "mb-10" }
    [ h2 { className: "text-xs uppercase tracking-widest text-muted-foreground mb-3" }
        [ text title ]
    , p { className: "text-foreground leading-relaxed" } body
    ]

code :: String -> JSX
code t =
  H.code
    { className: "font-mono text-foreground bg-muted px-1.5 py-0.5 rounded" }
    [ text t ]

link :: String -> String -> JSX
link href t =
  a { href, className: "underline hover:text-foreground transition-colors" }
    [ text t ]
