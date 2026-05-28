module Page.Home (mkHomePage) where

import Prelude

import Data.Maybe (Maybe(..))
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import React.Basic (JSX)
import Web.Clipboard as Clipboard
import Web.HTML (window)
import Web.HTML.Window (navigator)
import React.Basic.Events (handler_)
import React.Basic.Hooks (Component, component, useState')
import React.Basic.Hooks as Hooks
import Yoga.React.DOM.HTML.A (a)
import Yoga.React.DOM.HTML.Button (button)
import Yoga.React.DOM.HTML.Code (code) as H
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.HTML.Em (em)
import Yoga.React.DOM.HTML.Footer (footer) as H
import Yoga.React.DOM.HTML.H (h1, h2, h3)
import Yoga.React.DOM.HTML.Header (header)
import Yoga.React.DOM.HTML.Li (li)
import Yoga.React.DOM.HTML.Main (main)
import Yoga.React.DOM.HTML.P (p)
import Yoga.React.DOM.HTML.Pre (pre)
import Yoga.React.DOM.HTML.Section (section) as H
import Yoga.React.DOM.HTML.Ul (ul)
import Yoga.React.DOM.Internal (text)
import Yoga.React.DOM.SVG.Circle (circle)
import Yoga.React.DOM.SVG.G (g)
import Yoga.React.DOM.SVG.Line (line)
import Yoga.React.DOM.SVG.Polygon (polygon)
import Yoga.React.DOM.SVG.Rect (rect)
import Yoga.React.DOM.SVG.Svg (svg)

mkHomePage :: Component {}
mkHomePage = do
  copy <- mkCopyButton
  component "HomePage" \_ -> Hooks.do
    pure $
      main { className: "min-h-screen px-6 py-16 sm:py-24 max-w-2xl mx-auto" }
        [ hero
        , install copy
        , what
        , language
        , output
        , aiAuthoring
        , footer
        ]

hero :: JSX
hero =
  header { className: "flex items-center gap-4 mb-12" }
    [ logo
    , h1 { className: "text-2xl font-medium tracking-tight" } [ text "markgraf" ]
    ]

install :: ({ value :: String } -> JSX) -> JSX
install copy =
  H.section { className: "mb-14" }
    [ tagline
    , sectionHeading "Install"
    , copy { value: "brew install markgrafhq/tap/markgraf" }
    , p { className: "text-sm text-muted-foreground mt-2" }
        [ text "macOS (Apple Silicon) only for now. Linux + Intel coming." ]
    ]

tagline :: JSX
tagline =
  p { className: "text-xl leading-relaxed mb-12 text-foreground" }
    [ text "Animated graph diagrams from a tiny declarative source language." ]

mkCopyButton :: Component { value :: String }
mkCopyButton = component "Copyable" \{ value } -> Hooks.do
  copied /\ setCopied <- useState' false
  pure $
    div { className: "bg-foreground text-background rounded-md px-4 py-3 flex items-center justify-between gap-4 font-mono text-sm" }
      [ H.code { className: "overflow-x-auto whitespace-nowrap" } [ text value ]
      , button
          { onClick: handler_ do
              writeClipboard value
              setCopied true
              scheduleReset (setCopied false)
          , className: "text-muted-foreground hover:text-foreground transition-colors text-xs uppercase tracking-wider cursor-pointer"
          , type: "button"
          }
          [ text (if copied then "copied" else "copy") ]
      ]

language :: JSX
language =
  H.section { className: "mb-14" }
    [ sectionHeading "Language"
    , p { className: "text-foreground leading-relaxed mb-6" }
        [ text "A "
        , code "frame"
        , text " is one beat in the animation. Statements inside a frame either change the graph "
        , text "shape (structural) or move data along it (flow)."
        ]
    , subhead "Frames"
    , codeBlock "frame setup { +node a \"A\" +node b \"B\" +edge a b }\nframe \"first request\" { a -> b \"hello\" }"
    , prose
        [ text "Names are unquoted identifiers or quoted strings (use quotes for spaces)."
        ]
    , subhead "Adding and removing nodes"
    , codeBlock "+node api \"API\"        # introduce node\n-node api               # remove node"
    , subhead "Adding and removing edges"
    , codeBlock "+edge api db\n-edge api db"
    , prose [ text "Edges are directional. ", code "+edge a b", text " ≠ ", code "+edge b a", text "." ]
    , subhead "Tokens (data flow)"
    , codeBlock "client -> api \"GET /user\"\napi -> db \"SELECT\""
    , prose
        [ text "Each statement renders a circle that morphs out of the source, slides along the edge, "
        , text "and morphs into the target. Consecutive tokens that chain (the "
        , code "to"
        , text " of one matches the "
        , code "from"
        , text " of the next) render as ONE continuously travelling dot — that's how requests "
        , text "feel like one motion through a stack."
        ]
    , subhead "Reverse-direction tokens"
    , codeBlock "client -> api \"GET\"        # forward along +edge client api\nclient <- api \"200 OK\"     # reverse along the same edge"
    , prose
        [ code "<-"
        , text " says \"same edge, motion reversed\" — it does "
        , em {} [ text "not" ]
        , text " create a second edge. Use it for every response/reply that flows back."
        ]
    , subhead "Concurrency: par and seq"
    , codeBlock "frame \"cache hit\" {\n  client -> api \"GET\"\n  par {\n    api -> cache \"HIT\"\n    api -> logger \"trace\"\n  }\n  client <- api \"value\"\n}"
    , prose
        [ text "The frame body is implicitly "
        , code "seq"
        , text " — children run one after another. Wrap children in "
        , code "par { ... }"
        , text " to play them at the same time."
        ]
    , subhead "Top of file: seed"
    , codeBlock "seed 1                  # optional, controls layout RNG (default 0)\nframe setup { ... }"
    , subhead "Putting it together"
    , codeBlock "frame setup {\n  +node client \"Client\"\n  +node api    \"API\"\n  +node db     \"Database\"\n  +node cache  \"Cache\"\n  +edge client api\n  +edge api db\n  +edge api cache\n}\n\nframe \"write request\" {\n  client -> api \"POST /user\"\n  api -> db \"INSERT\"\n}\n\nframe \"invalidate cache\" {\n  api -> cache \"DEL user:42\"\n}\n\nframe respond {\n  client <- api \"201\"\n}"
    , prose
        [ text "Pipe it: "
        , code "pbpaste | markgraf --play"
        ]
    ]

subhead :: String -> JSX
subhead label =
  h3 { className: "text-sm font-medium tracking-tight mt-8 mb-2" } [ text label ]

prose :: Array JSX -> JSX
prose body =
  p { className: "text-sm text-muted-foreground leading-relaxed mt-2 mb-2" } body

code :: String -> JSX
code source =
  H.code
    { className: "font-mono text-foreground bg-muted px-1.5 py-0.5 rounded" }
    [ text source ]

codeBlock :: String -> JSX
codeBlock source =
  pre { className: "bg-muted rounded-md px-4 py-3 text-sm overflow-x-auto leading-relaxed" }
    [ H.code {} [ text source ] ]

what :: JSX
what =
  H.section { className: "mb-14" }
    [ sectionHeading "What it does"
    , ul { className: "space-y-2 text-foreground" }
        [ bullet "Layered orthogonal graph layout (an Eclipse ELK port)."
        , bullet "Frames describe structural changes; tokens flow along edges between them."
        , bullet "Native macOS player with drag-and-drop reload, scrub bar, glass backdrop."
        , bullet "Encodes to mp4 — no external dependencies."
        ]
    ]

bullet :: String -> JSX
bullet label = li {} [ text ("• " <> label) ]

output :: JSX
output =
  H.section { className: "mb-14" }
    [ sectionHeading "Render"
    , prose [ text "Pipe a snippet straight from the clipboard, or pass a file path." ]
    , subhead "Preview in a window"
    , codeBlock "markgraf example.markgraf --play\npbpaste | markgraf --play"
    , prose [ text "On macOS this opens the native Metal/AppKit player (glass backdrop, scrub bar, drag-and-drop reload)." ]
    , subhead "Encode to mp4"
    , codeBlock "markgraf example.markgraf -o out.mp4\nmarkgraf example.markgraf -o out.mp4 --fps 60 --scale 2"
    , prose [ text "ffmpeg is embedded — no system dependency." ]
    , subhead "Animated GIF (keyframes only)"
    , codeBlock "markgraf example.markgraf --gif out.gif"
    , subhead "Animated SVG (vector)"
    , codeBlock "markgraf example.markgraf --svg out.svg"
    , subhead "Static sequence diagram (PNG)"
    , codeBlock "markgraf example.markgraf --sequence out.png"
    , subhead "Typecheck without rendering"
    , codeBlock "markgraf example.markgraf --check"
    ]

aiAuthoring :: JSX
aiAuthoring =
  H.section { className: "mb-14" }
    [ sectionHeading "AI authoring"
    , p { className: "text-foreground leading-relaxed mb-3" }
        [ text "Claude Code plugin teaches Claude the syntax and authoring rules — short labels, "
        , code "par"
        , text " blocks for simultaneity, one concept per frame. Run these as two separate slash commands in Claude Code:"
        ]
    , codeBlock "/plugin marketplace add i-am-the-slime/claude-plugins"
    , div { className: "h-2" } ([] :: Array JSX)
    , codeBlock "/plugin install markgraf@i-am-the-slime"
    ]

footer :: JSX
footer =
  H.footer { className: "pt-8 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" }
    [ link "https://discord.gg/tKfGrPYx" "discord"
    , link "https://github.com/markgrafhq/homebrew-tap" "tap"
    , link "https://github.com/markgrafhq/homebrew-tap/tree/main/examples" "examples"
    , link "https://github.com/i-am-the-slime/claude-plugins" "claude plugin"
    ]

link :: String -> String -> JSX
link href label =
  a { href, className: "hover:text-foreground transition-colors" } [ text label ]

sectionHeading :: String -> JSX
sectionHeading label =
  h2 { className: "text-xs uppercase tracking-widest text-muted-foreground mb-3" }
    [ text label ]

logo :: JSX
logo =
  svg { viewBox: "0 0 96 96", width: "40", height: "40" }
    [ g
        { fill: "none"
        , stroke: "currentColor"
        , strokeWidth: "6"
        , strokeLinecap: "round"
        , strokeLinejoin: "round"
        }
        [ rect { x: "14", y: "6", width: "68", height: "22", rx: "7" } ([] :: Array JSX)
        , rect { x: "14", y: "68", width: "68", height: "22", rx: "7" } ([] :: Array JSX)
        , line { x1: "48", y1: "28", x2: "48", y2: "60" } ([] :: Array JSX)
        ]
    , polygon { points: "48,68 41,58 55,58", fill: "currentColor" } ([] :: Array JSX)
    , circle { cx: "48", cy: "44", r: "9", fill: "currentColor" } ([] :: Array JSX)
    ]

writeClipboard :: String -> Effect Unit
writeClipboard value = do
  nav <- window >>= navigator
  Clipboard.clipboard nav >>= case _ of
    Nothing -> pure unit
    Just cb -> void $ Clipboard.writeText value cb

foreign import scheduleReset :: Effect Unit -> Effect Unit
