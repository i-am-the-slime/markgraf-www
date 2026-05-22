module Page.HeroPreview (mkHeroPreview) where

import Prelude

import React.Basic (JSX)
import React.Basic.DOM as D
import React.Basic.DOM.SVG as S
import React.Basic.Hooks (Component, component)
import React.Basic.Hooks as Hooks

accent :: String
accent = "#ff3b1a"

ink :: String
ink = "#0a0e1a"

bone :: String
bone = "#f5f1e8"

mkHeroPreview :: Component {}
mkHeroPreview = component "HeroPreview" \_ -> Hooks.do
  pure $
    D.main
      { className: "bg-[#0a0e1a] text-[#f5f1e8] min-h-screen relative overflow-hidden"
      , children:
          [ backgroundGraph
          , topBar
          , D.section
              { className: "relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24 gap-12"
              , children:
                  [ wordmark
                  , liveGraph
                  , tagline
                  , installPill
                  , scrollCue
                  ]
              }
          ]
      }

topBar :: JSX
topBar =
  D.div
    { className: "absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#5a6478]"
    , children:
        [ D.div
            { className: "flex items-center gap-2"
            , children:
                [ dot accent "8"
                , D.span_ [ D.text "markgraf" ]
                ]
            }
        , D.div
            { className: "flex items-center gap-6"
            , children:
                [ navLink "language"
                , navLink "render"
                , navLink "install"
                , navLink "github"
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

dot :: String -> String -> JSX
dot color size =
  S.svg
    { width: size
    , height: size
    , viewBox: "0 0 10 10"
    , children: [ S.circle { cx: "5", cy: "5", r: "5", fill: color } ]
    }

wordmark :: JSX
wordmark =
  D.h1
    { className: "font-display font-bold text-[20vw] sm:text-[18vw] md:text-[15vw] leading-[0.85] tracking-[-0.04em] text-center"
    , style: D.css
        { fontFamily: "'Sinistre', ui-serif, Georgia, serif"
        , color: bone
        }
    , children:
        [ D.text "markgraf"
        ]
    }

-- | A small living markgraf running under the wordmark: three labeled nodes,
-- | a token making the round-trip request → response.
liveGraph :: JSX
liveGraph =
  S.svg
    { viewBox: "0 0 720 120"
    , width: "100%"
    , style: D.css { maxWidth: "640px" }
    , children:
        [ S.defs_
            [ S.filter
                { id: "glow"
                , x: "-50%"
                , y: "-50%"
                , width: "200%"
                , height: "200%"
                , children:
                    [ S.feGaussianBlur { stdDeviation: "5", result: "b" }
                    , S.feMerge_
                        [ S.feMergeNode { in: "b" }
                        , S.feMergeNode { in: "SourceGraphic" }
                        ]
                    ]
                }
            ]
        , -- edges
          S.g
            { stroke: "#2a3142", strokeWidth: "2", fill: "none"
            , children:
                [ S.line { x1: "120", y1: "60", x2: "360", y2: "60" }
                , S.line { x1: "360", y1: "60", x2: "600", y2: "60" }
                ]
            }
        , -- nodes
          graphNode { x: "120", label: "client" }
        , graphNode { x: "360", label: "api" }
        , graphNode { x: "600", label: "db" }
        , -- traveling token (forward + reverse)
          S.circle
            { r: "7"
            , fill: accent
            , filter: "url(#glow)"
            , children:
                [ S.animate
                    { attributeName: "cx"
                    , values: "120;360;600;360;120"
                    , keyTimes: "0;0.25;0.5;0.75;1"
                    , dur: "4s"
                    , repeatCount: "indefinite"
                    , calcMode: "spline"
                    , keySplines: "0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"
                    }
                , S.animate
                    { attributeName: "cy"
                    , values: "60;60;60;60;60"
                    , dur: "4s"
                    , repeatCount: "indefinite"
                    }
                ]
            }
        ]
    }

graphNode :: { x :: String, label :: String } -> JSX
graphNode { x, label } =
  S.g_
    [ S.circle
        { cx: x, cy: "60", r: "10"
        , fill: ink, stroke: bone, strokeWidth: "2"
        }
    , S.text
        { x: x, y: "98"
        , textAnchor: "middle"
        , fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace"
        , fontSize: "13"
        , fill: "#8a94a8"
        , children: [ D.text label ]
        }
    ]

tagline :: JSX
tagline =
  D.p
    { className: "max-w-xl text-center text-xl sm:text-2xl leading-snug text-[#c8cdd9]"
    , children:
        [ D.text "Animated graph diagrams from a tiny declarative source language. "
        , D.span
            { style: D.css { color: accent }
            , children: [ D.text "Watch your architecture move." ]
            }
        ]
    }

installPill :: JSX
installPill =
  D.div
    { className: "inline-flex items-center gap-3 bg-[#11162280] backdrop-blur-sm border border-[#2a3142] rounded-full pl-5 pr-2 py-2 font-mono text-sm"
    , children:
        [ D.span { style: D.css { color: accent }, children: [ D.text "$" ] }
        , D.span { className: "text-[#f5f1e8]", children: [ D.text "brew install i-am-the-slime/tap/markgraf" ] }
        , D.button
            { type: "button"
            , className: "ml-2 text-[10px] uppercase tracking-[0.2em] text-[#5a6478] hover:text-[#f5f1e8] transition-colors px-3 py-1.5 rounded-full bg-[#0a0e1a] border border-[#2a3142] cursor-pointer"
            , children: [ D.text "copy" ]
            }
        ]
    }

scrollCue :: JSX
scrollCue =
  D.div
    { className: "absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6478] flex items-center gap-2"
    , children:
        [ D.text "scroll"
        , D.span { children: [ D.text "↓" ] }
        ]
    }

-- | Faint living markgraf in the background, low opacity.
backgroundGraph :: JSX
backgroundGraph =
  S.svg
    { viewBox: "0 0 1440 900"
    , preserveAspectRatio: "xMidYMid slice"
    , className: "absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none"
    , children:
        [ S.g
            { stroke: "#2a3142", strokeWidth: "1.5", fill: "none"
            , children:
                [ S.line { x1: "120",  y1: "180", x2: "420",  y2: "240" }
                , S.line { x1: "420",  y1: "240", x2: "780",  y2: "160" }
                , S.line { x1: "780",  y1: "160", x2: "1180", y2: "300" }
                , S.line { x1: "420",  y1: "240", x2: "560",  y2: "560" }
                , S.line { x1: "560",  y1: "560", x2: "900",  y2: "700" }
                , S.line { x1: "900",  y1: "700", x2: "1280", y2: "620" }
                , S.line { x1: "560",  y1: "560", x2: "260",  y2: "740" }
                ]
            }
        , S.g
            { fill: "#1a1f2e", stroke: "#3a4258", strokeWidth: "1.5"
            , children:
                [ S.circle { cx: "120",  cy: "180", r: "5" }
                , S.circle { cx: "420",  cy: "240", r: "5" }
                , S.circle { cx: "780",  cy: "160", r: "5" }
                , S.circle { cx: "1180", cy: "300", r: "5" }
                , S.circle { cx: "560",  cy: "560", r: "5" }
                , S.circle { cx: "900",  cy: "700", r: "5" }
                , S.circle { cx: "1280", cy: "620", r: "5" }
                , S.circle { cx: "260",  cy: "740", r: "5" }
                ]
            }
        , S.circle
            { r: "4", fill: accent
            , children:
                [ S.animateMotion
                    { dur: "9s"
                    , repeatCount: "indefinite"
                    , path: "M120,180 L420,240 L780,160 L1180,300"
                    }
                ]
            }
        , S.circle
            { r: "4", fill: accent
            , children:
                [ S.animateMotion
                    { dur: "11s"
                    , repeatCount: "indefinite"
                    , path: "M420,240 L560,560 L900,700 L1280,620"
                    , begin: "2s"
                    }
                ]
            }
        ]
    }
