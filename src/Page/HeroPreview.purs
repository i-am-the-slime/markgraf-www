module Page.HeroPreview (mkHeroPreview) where

import Prelude

import Data.Maybe (Maybe(..))
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
    cleanup <- onScrollProgress "scroll-stage" setProgress
    pure cleanup
  pure $
    D.main
      { className: "bg-[#0a0e1a] text-[#f5f1e8] relative"
      , children:
          [ scrollStage progress
          , afterFold
          ]
      }

-- | A 3× viewport scroll container with the 3D scene + overlay sticky inside.
scrollStage :: Number -> JSX
scrollStage progress =
  D.div
    { id: "scroll-stage"
    , className: "relative"
    , style: D.css { height: "320vh" }
    , children:
        [ D.div
            { className: "sticky top-0 h-screen w-full overflow-hidden"
            , children:
                [ D.div
                    { className: "absolute inset-0"
                    , children: [ element sceneComponent {} ]
                    }
                , topBar
                , overlayCopy progress
                , bottomMeta progress
                ]
            }
        ]
    }

topBar :: JSX
topBar =
  D.div
    { className: "absolute top-0 inset-x-0 z-20 flex items-center justify-between px-8 py-5 font-mono text-[11px] uppercase tracking-[0.28em] text-[#8a94a8] mix-blend-difference"
    , children:
        [ D.span
            { style: D.css { fontFamily: "'Sinistre', serif", letterSpacing: "0.05em", fontSize: "14px" }
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

-- | Centered overlay copy: wordmark + tagline + install. Fades/morphs with progress.
overlayCopy :: Number -> JSX
overlayCopy progress =
  D.div
    { className: "absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6"
    , children:
        [ D.div
            { className: "flex flex-col items-center gap-10 max-w-3xl text-center"
            , style: D.css
                { opacity: show (max 0.0 (1.0 - progress * 1.4))
                , transform: "translateY(" <> show (progress * -40.0) <> "px)"
                }
            , children:
                [ D.h1
                    { className: "text-[18vw] sm:text-[16vw] md:text-[13vw] leading-[0.85] tracking-[-0.045em] font-bold text-[#f5f1e8]"
                    , style: D.css
                        { fontFamily: "'Sinistre', serif"
                        , textShadow: "0 0 60px rgba(10,14,26,0.55)"
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
        , stagedCaption progress
        ]
    }

-- | Captions that fade in/out across scroll progress. Each owns a slice of [0,1].
stagedCaption :: Number -> JSX
stagedCaption progress =
  D.div
    { className: "absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
    , children:
        [ caption progress 0.25 0.55 "every frame is a state of your system"
        , caption progress 0.55 0.85 "scroll is the playhead"
        , caption progress 0.85 1.05 "the site you're reading is one markgraf render"
        ]
    }

caption :: Number -> Number -> Number -> String -> JSX
caption progress start endP text =
  D.p
    { className: "absolute max-w-2xl text-center text-2xl sm:text-3xl md:text-5xl leading-tight font-bold text-[#f5f1e8] tracking-tight"
    , style: D.css
        { fontFamily: "'Sinistre', serif"
        , opacity: show (fadeIn progress start endP)
        , transform: "translateY(" <> show (yOffset progress start endP) <> "px)"
        , textShadow: "0 0 80px rgba(10,14,26,0.7)"
        }
    , children: [ D.text text ]
    }

fadeIn :: Number -> Number -> Number -> Number
fadeIn p s e =
  let
    mid = (s + e) / 2.0
    halfWidth = (e - s) / 2.0
    d = abs (p - mid) / halfWidth
  in
    max 0.0 (1.0 - d)

yOffset :: Number -> Number -> Number -> Number
yOffset p s e =
  let mid = (s + e) / 2.0
  in (p - mid) * -60.0

abs :: Number -> Number
abs n = if n < 0.0 then -n else n

installPill :: JSX
installPill =
  D.div
    { className: "inline-flex items-center gap-3 bg-[#11162280] backdrop-blur-md border border-[#2a3142] rounded-full pl-5 pr-2 py-2 font-mono text-sm pointer-events-auto"
    , children:
        [ D.span { style: D.css { color: "#ff3b1a" }, children: [ D.text "$" ] }
        , D.span { className: "text-[#f5f1e8]", children: [ D.text "brew install i-am-the-slime/tap/markgraf" ] }
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
        [ D.span_ [ D.text ("frame " <> frameLabel progress) ]
        , D.div
            { className: "flex items-center gap-3"
            , children:
                [ D.text "scroll"
                , D.span
                    { style: D.css { transform: "translateY(" <> show (progress * 4.0) <> "px)" }
                    , children: [ D.text "↓" ]
                    }
                ]
            }
        ]
    }

frameLabel :: Number -> String
frameLabel p
  | p < 0.25  = "00 / setup"
  | p < 0.55  = "01 / request"
  | p < 0.85  = "02 / reply"
  | otherwise = "03 / mesh"

afterFold :: JSX
afterFold =
  D.section
    { className: "relative z-10 bg-[#0a0e1a] border-t border-[#1a1f2e] px-8 py-32 text-center"
    , children:
        [ D.p
            { className: "text-sm uppercase tracking-[0.3em] text-[#5a6478] font-mono"
            , children: [ D.text "more shipping soon — language reference, examples, plugin ↓" ]
            }
        ]
    }

foreign import sceneComponent :: ReactComponent {}
foreign import onScrollProgress :: String -> (Number -> Effect Unit) -> Effect (Effect Unit)
