module Page.Privacy (mkPrivacyPage) where

import Prelude

import React.Basic (JSX)
import React.Basic.DOM as D
import React.Basic.Hooks (Component, component)

mkPrivacyPage :: Component {}
mkPrivacyPage =
  component "PrivacyPage" \_ ->
    pure $
      D.main
        { className: "min-h-screen px-6 py-16 sm:py-24 max-w-2xl mx-auto"
        , children:
            [ heading
            , updated
            , section "What the markgraf browser extension does"
                [ D.text "The extension scans rendered markdown pages on github.com and gist.github.com for "
                , code "```markgraf"
                , D.text " fenced code blocks and replaces each one with an inline animation player. "
                , D.text "All parsing, layout, and rendering happens locally in your browser."
                ]
            , section "Data we collect"
                [ D.strong_ [ D.text "None." ]
                , D.text " The extension does not collect, transmit, sell, or share any personal data. "
                , D.text "It performs no analytics, no telemetry, and no remote logging."
                ]
            , section "Network requests"
                [ D.text "The extension makes no network requests of its own. The web pages you visit may "
                , D.text "continue to load their own resources as they normally would; the extension does not "
                , D.text "intercept, modify, or proxy them."
                ]
            , section "Storage and permissions"
                [ D.text "The extension requests access only to "
                , code "github.com"
                , D.text " and "
                , code "gist.github.com"
                , D.text " so it can find markgraf code blocks on pages you already visit. It stores no data "
                , D.text "in browser storage and uses no cookies."
                ]
            , section "Source code"
                [ D.text "The full source is published at "
                , link "https://github.com/markgrafhq/markgraf-browser-extension"
                    "github.com/markgrafhq/markgraf-browser-extension"
                , D.text "."
                ]
            , section "Contact"
                [ D.text "Questions about this policy: open an issue on the GitHub repository above."
                ]
            ]
        }

heading :: JSX
heading =
  D.h1
    { className: "text-2xl font-medium tracking-tight mb-2"
    , children: [ D.text "Privacy" ]
    }

updated :: JSX
updated =
  D.p
    { className: "text-xs uppercase tracking-widest text-muted-foreground mb-10"
    , children: [ D.text "Last updated 2026-05-25" ]
    }

section :: String -> Array JSX -> JSX
section title body =
  D.section
    { className: "mb-10"
    , children:
        [ D.h2
            { className: "text-xs uppercase tracking-widest text-muted-foreground mb-3"
            , children: [ D.text title ]
            }
        , D.p
            { className: "text-foreground leading-relaxed"
            , children: body
            }
        ]
    }

code :: String -> JSX
code text =
  D.code
    { className: "font-mono text-foreground bg-muted px-1.5 py-0.5 rounded"
    , children: [ D.text text ]
    }

link :: String -> String -> JSX
link href text =
  D.a
    { href
    , className: "underline hover:text-foreground transition-colors"
    , children: [ D.text text ]
    }
