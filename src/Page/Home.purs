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
            , what
            , language
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
        , copy { value: "brew install i-am-the-slime/tap/markgraf" }
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

language :: JSX
language =
  D.section
    { className: "mb-14"
    , children:
        [ sectionHeading "Language"
        , D.p
            { className: "text-foreground leading-relaxed mb-6"
            , children:
                [ D.text "A "
                , code "frame"
                , D.text " is one beat in the animation. Statements inside a frame either change the graph "
                , D.text "shape (structural) or move data along it (flow)."
                ]
            }
        , subhead "Frames"
        , codeBlock "frame setup { +node a \"A\" +node b \"B\" +edge a b }\nframe \"first request\" { a -> b \"hello\" }"
        , prose
            [ D.text "Names are unquoted identifiers or quoted strings (use quotes for spaces)."
            ]
        , subhead "Adding and removing nodes"
        , codeBlock "+node api \"API\"        # introduce node\n-node api               # remove node"
        , subhead "Adding and removing edges"
        , codeBlock "+edge api db \"writes\"   # label is optional\n-edge api db"
        , prose [ D.text "Edges are directional. ", code "+edge a b", D.text " ≠ ", code "+edge b a", D.text "." ]
        , subhead "Tokens (data flow)"
        , codeBlock "client -> api \"GET /user\"\napi -> db \"SELECT\""
        , prose
            [ D.text "Each statement renders a circle that morphs out of the source, slides along the edge, "
            , D.text "and morphs into the target. Consecutive tokens that chain (the "
            , code "to"
            , D.text " of one matches the "
            , code "from"
            , D.text " of the next) render as ONE continuously travelling dot — that's how requests "
            , D.text "feel like one motion through a stack."
            ]
        , subhead "Bubbles (commentary)"
        , codeBlock "+bubble skip cache \"skipped DB!\"\n-bubble skip"
        , prose
            [ D.text "A bubble is anchored to a node and persists across frames until you remove it. "
            , D.text "Use bubbles for things the topology can't say on its own — \"async\", \"cache hit\", "
            , D.text "\"retry\". Use node/edge labels for everything else."
            ]
        , subhead "Concurrency: par and seq"
        , codeBlock "frame \"cache hit\" {\n  client -> api \"GET\"\n  par {\n    api -> cache \"HIT\"\n    +bubble skip cache \"skipped DB!\"\n  }\n  -bubble skip\n}"
        , prose
            [ D.text "The frame body is implicitly "
            , code "seq"
            , D.text " — children run one after another. Wrap children in "
            , code "par { ... }"
            , D.text " to play them at the same time. Without "
            , code "par"
            , D.text ", a token AND its bubble would appear in series, which reads as two unrelated steps."
            ]
        , subhead "Top of file: seed"
        , codeBlock "seed 1                  # optional, controls layout RNG (default 0)\nframe setup { ... }"
        , subhead "Putting it together"
        , codeBlock "frame setup {\n  +node client \"Client\"\n  +node api \"API\"\n  +node db \"Database\"\n  +edge client api\n  +edge api db\n}\n\nframe \"direct read\" {\n  client -> api \"GET /user/42\"\n  api -> db \"SELECT\"\n}\n\nframe \"introduce cache\" {\n  +node cache \"Cache\"\n  -edge api db\n  +edge api cache\n}\n\nframe \"cache hit\" {\n  client -> api \"GET /user/42\"\n  par {\n    api -> cache \"HIT\"\n    +bubble skip cache \"skipped DB!\"\n  }\n  -bubble skip\n}"
        , prose
            [ D.text "Pipe it: "
            , code "pbpaste | markgraf --play"
            ]
        ]
    }

subhead :: String -> JSX
subhead text =
  D.h3
    { className: "text-sm font-medium tracking-tight mt-8 mb-2"
    , children: [ D.text text ]
    }

prose :: Array JSX -> JSX
prose children =
  D.p
    { className: "text-sm text-muted-foreground leading-relaxed mt-2 mb-2"
    , children
    }

code :: String -> JSX
code text =
  D.code
    { className: "font-mono text-foreground bg-muted px-1.5 py-0.5 rounded"
    , children: [ D.text text ]
    }

codeBlock :: String -> JSX
codeBlock source =
  D.pre
    { className: "bg-muted rounded-md px-4 py-3 text-sm overflow-x-auto leading-relaxed"
    , children: [ D.code_ [ D.text source ] ]
    }

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
                , code "par"
                , D.text " blocks for simultaneity, one concept per frame. Run these as two separate slash commands in Claude Code:"
                ]
            }
        , codeBlock "/plugin marketplace add i-am-the-slime/claude-plugins"
        , D.div { className: "h-2", children: [] }
        , codeBlock "/plugin install markgraf@i-am-the-slime"
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
