module Page.Home (mkHomePage) where

import Prelude

import Data.Tuple.Nested ((/\))
import Effect (Effect)
import React.Basic (JSX)
import React.Basic.DOM as D
import React.Basic.DOM.SVG as S
import React.Basic.Events (handler_)
import React.Basic.Hooks (Component, component, useState')
import React.Basic.Hooks as Hooks

mkHomePage :: Component {}
mkHomePage = do
  copy <- mkCopyButton
  component "HomePage" \_ -> Hooks.do
    pure $
      D.main
        { className: "min-h-screen px-6 py-16 sm:py-24 max-w-2xl mx-auto"
        , children:
            [ hero
            , install copy
            , example
            , what
            , ai
            , footer
            ]
        }

hero :: JSX
hero =
  D.header
    { className: "flex items-center gap-4 mb-12"
    , children: [ logo, D.h1 { className: "text-2xl font-medium tracking-tight", children: [ D.text "markgraf" ] } ]
    }

install :: ({ value :: String } -> JSX) -> JSX
install copy =
  D.section
    { className: "mb-14"
    , children:
        [ tagline
        , sectionHeading "Install"
        , copy { value: "brew install --cask i-am-the-slime/tap/markgraf" }
        , D.p
            { className: "text-sm text-muted-foreground mt-2"
            , children: [ D.text "macOS (Apple Silicon) only for now. Linux + Intel coming." ]
            }
        ]
    }

tagline :: JSX
tagline =
  D.p
    { className: "text-xl leading-relaxed mb-12 text-foreground"
    , children: [ D.text "Animated graph diagrams from a tiny declarative source language." ]
    }

mkCopyButton :: Component { value :: String }
mkCopyButton = component "Copyable" \{ value } -> Hooks.do
  copied /\ setCopied <- useState' false
  pure $
    D.div
      { className: "bg-foreground text-background rounded-md px-4 py-3 flex items-center justify-between gap-4 font-mono text-sm"
      , children:
          [ D.code { className: "overflow-x-auto whitespace-nowrap", children: [ D.text value ] }
          , D.button
              { onClick: handler_ do
                  writeClipboard value
                  setCopied true
                  scheduleReset (setCopied false)
              , className: "text-muted-foreground hover:text-foreground transition-colors text-xs uppercase tracking-wider cursor-pointer"
              , children: [ D.text (if copied then "copied" else "copy") ]
              , type: "button"
              }
          ]
      }

example :: JSX
example =
  D.section
    { className: "mb-14"
    , children:
        [ sectionHeading "Example"
        , D.pre
            { className: "bg-muted rounded-md px-4 py-3 text-sm overflow-x-auto leading-relaxed"
            , children: [ D.code_ [ D.text exampleSource ] ]
            }
        , D.p
            { className: "text-sm text-muted-foreground mt-2"
            , children:
                [ D.text "Pipe it: "
                , D.code { className: "font-mono text-foreground", children: [ D.text "pbpaste | markgraf --play" ] }
                ]
            }
        ]
    }
  where
  exampleSource = "frame setup {\n  +node a \"A\"\n  +node b \"B\"\n  +edge a b\n}\n\nframe greet {\n  a -> b \"hello\"\n}"

what :: JSX
what =
  D.section
    { className: "mb-14"
    , children:
        [ sectionHeading "What it does"
        , D.ul
            { className: "space-y-2 text-foreground"
            , children:
                [ bullet "Layered orthogonal graph layout (an Eclipse ELK port)."
                , bullet "Frames describe structural changes; tokens flow along edges between them."
                , bullet "Native macOS player with drag-and-drop reload, scrub bar, glass backdrop."
                , bullet "Encodes to mp4 — no external dependencies."
                ]
            }
        ]
    }

bullet :: String -> JSX
bullet text = D.li_ [ D.text ("• " <> text) ]

ai :: JSX
ai =
  D.section
    { className: "mb-14"
    , children:
        [ sectionHeading "AI authoring"
        , D.p
            { className: "text-foreground leading-relaxed mb-3"
            , children:
                [ D.text "Claude Code plugin teaches Claude the syntax and authoring rules — short labels, "
                , D.code { className: "font-mono", children: [ D.text "par" ] }
                , D.text " blocks for simultaneity, one concept per frame."
                ]
            }
        , D.pre
            { className: "bg-muted rounded-md px-4 py-3 text-sm overflow-x-auto"
            , children: [ D.code_ [ D.text "/plugin marketplace add i-am-the-slime/claude-plugins\n/plugin install markgraf@i-am-the-slime" ] ]
            }
        ]
    }

footer :: JSX
footer =
  D.footer
    { className: "pt-8 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
    , children:
        [ link "https://github.com/i-am-the-slime/homebrew-tap" "tap"
        , link "https://github.com/i-am-the-slime/homebrew-tap/tree/main/examples" "examples"
        , link "https://github.com/i-am-the-slime/claude-plugins" "claude plugin"
        ]
    }

link :: String -> String -> JSX
link href text =
  D.a
    { href
    , className: "hover:text-foreground transition-colors"
    , children: [ D.text text ]
    }

sectionHeading :: String -> JSX
sectionHeading text =
  D.h2
    { className: "text-xs uppercase tracking-widest text-muted-foreground mb-3"
    , children: [ D.text text ]
    }

logo :: JSX
logo =
  S.svg
    { viewBox: "0 0 96 96"
    , width: "40"
    , height: "40"
    , children:
        [ S.g
            { fill: "none"
            , stroke: "currentColor"
            , strokeWidth: "6"
            , strokeLinecap: "round"
            , strokeLinejoin: "round"
            , children:
                [ S.rect { x: "14", y: "6", width: "68", height: "22", rx: "7" }
                , S.rect { x: "14", y: "68", width: "68", height: "22", rx: "7" }
                , S.line { x1: "48", y1: "28", x2: "48", y2: "60" }
                ]
            }
        , S.polygon { points: "48,68 41,58 55,58", fill: "currentColor" }
        , S.circle { cx: "48", cy: "44", r: "9", fill: "currentColor" }
        ]
    }

foreign import writeClipboard :: String -> Effect Unit
foreign import scheduleReset :: Effect Unit -> Effect Unit
