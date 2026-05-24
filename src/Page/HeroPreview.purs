module Page.HeroPreview (mkHeroPreview) where

import Prelude

import Data.Tuple.Nested ((/\))
import Effect (Effect)
import React.Basic (JSX, ReactComponent, element)
import React.Basic.DOM as D
import React.Basic.Hooks (Component, component, useEffect, useState')
import React.Basic.Hooks as Hooks

mkHeroPreview :: Component {}
mkHeroPreview = component "HeroPreview" \_ -> Hooks.do
  progress /\ setProgress <- useState' 0.0
  useEffect unit do
    onScrollProgress "scroll-stage" setProgress
  pure $
    D.main
      { className: "bg-[#0a0e1a] text-[#f5f1e8] relative"
      , children:
          [ scrollStage progress
          , languageSection
          , renderSection
          , footerSection
          ]
      }

-- | A 4× viewport scroll container holding the sticky 3D stage. The longer
-- | run gives the camera real distance to travel through three acts.
scrollStage :: Number -> JSX
scrollStage progress =
  D.div
    { id: "scroll-stage"
    , className: "relative"
    , style: D.css { height: "420vh" }
    , children:
        [ D.div
            { className: "sticky top-0 h-screen w-full overflow-hidden"
            , children:
                [ D.div
                    { className: "absolute inset-0"
                    , children: [ element sceneComponent {} ]
                    }
                , topBar
                , heroLockup progress
                , captionLayer progress
                , bottomMeta progress
                ]
            }
        ]
    }

topBar :: JSX
topBar =
  D.div
    { className: "absolute top-0 inset-x-0 z-20 flex items-center justify-between px-8 py-5 font-mono text-[11px] uppercase tracking-[0.28em] text-[#8a94a8]"
    , children:
        [ D.span
            { style: D.css { fontFamily: "'Sinistre', serif", letterSpacing: "0.05em", fontSize: "15px" }
            , className: "text-[#f5f1e8] normal-case"
            , children: [ D.text "markgraf" ]
            }
        , D.div
            { className: "flex items-center gap-6"
            , children:
                [ navLink "language"
                , navLink "render"
                , navLink "install"
                , navLink "github ↗"
                ]
            }
        ]
    }

navLink :: String -> JSX
navLink t =
  D.a
    { href: "#"
    , className: "hover:text-[#f5f1e8] transition-colors"
    , children: [ D.text t ]
    }

-- | Act 0 lockup: huge Sinistre wordmark + tagline + install pill.
-- | Visible 0..0.18, fades out by 0.28.
heroLockup :: Number -> JSX
heroLockup progress =
  D.div
    { className: "absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6"
    , style: D.css
        { opacity: show (1.0 - smooth01 progress 0.16 0.30)
        , transform: "translateY(" <> show (progress * -100.0) <> "px)"
        }
    , children:
        [ D.div
            { className: "flex flex-col items-center gap-10 max-w-3xl text-center"
            , children:
                [ D.h1
                    { className: "text-[18vw] sm:text-[16vw] md:text-[13vw] leading-[0.82] tracking-[-0.045em] font-bold text-[#f5f1e8]"
                    , style: D.css
                        { fontFamily: "'Sinistre', serif"
                        , textShadow: "0 0 80px rgba(10,14,26,0.7)"
                        }
                    , children: [ D.text "markgraf" ]
                    }
                , D.p
                    { className: "max-w-xl text-lg sm:text-xl leading-snug text-[#c8cdd9]"
                    , children:
                        [ D.text "Animated graph diagrams from a tiny declarative source language. "
                        , D.span
                            { style: D.css { color: "#ff3b1a" }
                            , children: [ D.text "Watch your architecture move." ]
                            }
                        ]
                    }
                , installPill
                ]
            }
        ]
    }

-- | Cross-fading captions for Acts 1, 2, 3.
captionLayer :: Number -> JSX
captionLayer progress =
  D.div
    { className: "absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
    , children:
        [ caption progress 0.32 0.58 "Every Frame Is a State of Your System"
        , caption progress 0.58 0.82 "Tokens Carry Data Between Nodes"
        , caption progress 0.82 1.10 "Now Imagine Yours."
        ]
    }

caption :: Number -> Number -> Number -> String -> JSX
caption progress start endP text =
  D.p
    { className: "absolute max-w-3xl text-center text-3xl sm:text-5xl md:text-6xl leading-[0.95] font-bold text-[#f5f1e8] tracking-tight"
    , style: D.css
        { fontFamily: "'Sinistre', serif"
        , opacity: show (triangleFade progress start endP)
        , transform: "translateY(" <> show (captionYOffset progress start endP) <> "px)"
        , textShadow: "0 0 90px rgba(10,14,26,0.75)"
        }
    , children: [ D.text text ]
    }

-- Triangle fade: 0 at start, 1 at midpoint, 0 at end.
triangleFade :: Number -> Number -> Number -> Number
triangleFade p s e
  | p <= s    = 0.0
  | p >= e    = 0.0
  | otherwise =
      let
        mid = (s + e) / 2.0
        d   = abs (p - mid) / ((e - s) / 2.0)
      in max 0.0 (1.0 - d)

captionYOffset :: Number -> Number -> Number -> Number
captionYOffset p s e =
  let mid = (s + e) / 2.0
  in (p - mid) * -80.0

-- Smoothstep 0→1 in [s,e]
smooth01 :: Number -> Number -> Number -> Number
smooth01 p s e
  | p <= s    = 0.0
  | p >= e    = 1.0
  | otherwise =
      let t = (p - s) / (e - s)
      in t * t * (3.0 - 2.0 * t)

abs :: Number -> Number
abs n = if n < 0.0 then -n else n

installPill :: JSX
installPill =
  D.div
    { className: "inline-flex items-center gap-3 bg-[#11162280] backdrop-blur-md border border-[#2a3142] rounded-full pl-5 pr-2 py-2 font-mono text-sm pointer-events-auto"
    , children:
        [ D.span { style: D.css { color: "#ff3b1a" }, children: [ D.text "$" ] }
        , D.span { className: "text-[#f5f1e8]", children: [ D.text "brew install markgrafhq/tap/markgraf" ] }
        , D.button
            { type: "button"
            , className: "ml-2 text-[10px] uppercase tracking-[0.2em] text-[#8a94a8] hover:text-[#f5f1e8] transition-colors px-3 py-1.5 rounded-full bg-[#0a0e1a] border border-[#2a3142] cursor-pointer"
            , children: [ D.text "copy" ]
            }
        ]
    }

bottomMeta :: Number -> JSX
bottomMeta progress =
  D.div
    { className: "absolute bottom-0 inset-x-0 z-20 flex items-end justify-between px-8 py-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6478] pointer-events-none"
    , children:
        [ D.span_ [ D.text ("act " <> actLabel progress) ]
        , D.div
            { className: "flex items-center gap-3 opacity-70"
            , style: D.css { opacity: show (max 0.0 (1.0 - progress * 2.0)) }
            , children:
                [ D.text "scroll"
                , D.span_ [ D.text "↓" ]
                ]
            }
        ]
    }

actLabel :: Number -> String
actLabel p
  | p < 0.30  = "00 / hero"
  | p < 0.65  = "01 / build"
  | p < 0.85  = "02 / orbit"
  | otherwise = "03 / mesh"

-- ---------------------------------------------------------------------------
-- Content sections after the sticky hero
-- ---------------------------------------------------------------------------

languageSection :: JSX
languageSection =
  D.section
    { id: "language"
    , className: "relative z-10 bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-32"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto"
            , children:
                [ sectionLabel "01 / language"
                , D.h2
                    { className: "text-5xl sm:text-7xl font-bold tracking-tight leading-[0.95] mb-8 max-w-3xl"
                    , style: D.css { fontFamily: "'Sinistre', serif" }
                    , children: [ D.text "A Frame Is One Beat. A Token Is One Hop." ]
                    }
                , D.p
                    { className: "text-lg text-[#8a94a8] max-w-2xl leading-relaxed mb-16"
                    , children: [ D.text "Eight keywords. Everything else is naming things." ]
                    }
                , D.div
                    { className: "grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16"
                    , children:
                        [ codeExample "+node / +edge" "structure the graph"
                            "frame setup {\n  +node client \"Client\"\n  +node api    \"API\"\n  +edge client api\n}"
                        , codeExample "tokens" "data flow between nodes"
                            "frame \"request\" {\n  client -> api \"GET /user\"\n  client <- api \"200 OK\"\n}"
                        , codeExample "par" "things that happen at once"
                            "frame \"fanout\" {\n  par {\n    api -> cache \"WARM\"\n    api -> logger \"trace\"\n  }\n}"
                        , codeExample "chains" "one continuous motion through a stack"
                            "client -> api  \"GET\"\napi    -> db   \"SELECT\"\napi    <- db   \"row\"\nclient <- api  \"200\""
                        ]
                    }
                ]
            }
        ]
    }

codeExample :: String -> String -> String -> JSX
codeExample name what source =
  D.div
    { className: "flex flex-col gap-3"
    , children:
        [ D.div
            { className: "flex items-baseline gap-3"
            , children:
                [ D.span
                    { className: "font-mono text-sm text-[#ff3b1a]"
                    , children: [ D.text name ]
                    }
                , D.span
                    { className: "text-sm text-[#8a94a8]"
                    , children: [ D.text what ]
                    }
                ]
            }
        , D.pre
            { className: "bg-[#11162280] backdrop-blur-sm border border-[#2a3142] rounded-lg px-5 py-4 text-sm overflow-x-auto leading-relaxed text-[#c8cdd9] font-mono"
            , children: [ D.code_ [ D.text source ] ]
            }
        ]
    }

renderSection :: JSX
renderSection =
  D.section
    { id: "render"
    , className: "relative z-10 bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-32"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto"
            , children:
                [ sectionLabel "02 / render"
                , D.h2
                    { className: "text-5xl sm:text-7xl font-bold tracking-tight leading-[0.95] mb-8 max-w-3xl"
                    , style: D.css { fontFamily: "'Sinistre', serif" }
                    , children: [ D.text "Pipe In. Ship Anywhere." ]
                    }
                , D.p
                    { className: "text-lg text-[#8a94a8] max-w-2xl leading-relaxed mb-16"
                    , children: [ D.text "Native player on macOS, mp4 with ffmpeg embedded, animated SVG, gif, or a static sequence diagram." ]
                    }
                , D.div
                    { className: "grid grid-cols-2 md:grid-cols-3 gap-4"
                    , children:
                        [ renderCard "--play"     "native player"
                        , renderCard "-o out.mp4" "encode mp4"
                        , renderCard "--svg"      "vector"
                        , renderCard "--gif"      "keyframe gif"
                        , renderCard "--sequence" "sequence diagram"
                        , renderCard "--check"    "typecheck only"
                        ]
                    }
                ]
            }
        ]
    }

renderCard :: String -> String -> JSX
renderCard flag desc =
  D.div
    { className: "bg-[#11162260] backdrop-blur-sm border border-[#2a3142] rounded-lg p-5 hover:border-[#ff3b1a] hover:bg-[#1a1f2e] transition-colors cursor-default"
    , children:
        [ D.div
            { className: "font-mono text-[#ff3b1a] text-sm mb-2"
            , children: [ D.text flag ]
            }
        , D.div
            { className: "text-[#c8cdd9] text-sm"
            , children: [ D.text desc ]
            }
        ]
    }

footerSection :: JSX
footerSection =
  D.section
    { className: "relative z-10 bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-24"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto flex flex-col gap-12"
            , children:
                [ D.div
                    { className: "flex flex-col gap-6"
                    , children:
                        [ D.h2
                            { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95]"
                            , style: D.css { fontFamily: "'Sinistre', serif" }
                            , children: [ D.text "Now Imagine Yours." ]
                            }
                        , D.div { children: [ installPill ] }
                        ]
                    }
                , D.div
                    { className: "flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#8a94a8] font-mono pt-8 border-t border-[#1a1f2e]"
                    , children:
                        [ footerLink "https://github.com/markgrafhq/homebrew-tap" "tap"
                        , footerLink "https://github.com/markgrafhq/homebrew-tap/tree/main/examples" "examples"
                        , footerLink "https://github.com/i-am-the-slime/claude-plugins" "claude plugin"
                        , footerLink "https://discord.gg/tKfGrPYx" "discord"
                        ]
                    }
                ]
            }
        ]
    }

footerLink :: String -> String -> JSX
footerLink href text =
  D.a
    { href
    , className: "hover:text-[#f5f1e8] transition-colors"
    , children: [ D.text text ]
    }

sectionLabel :: String -> JSX
sectionLabel text =
  D.div
    { className: "font-mono text-[11px] uppercase tracking-[0.3em] text-[#ff3b1a] mb-8"
    , children: [ D.text text ]
    }

foreign import sceneComponent :: ReactComponent {}
foreign import onScrollProgress :: String -> (Number -> Effect Unit) -> Effect (Effect Unit)
