module Page.HeroPreview (mkHeroPreview) where

import Prelude

import Data.Array as Array
import Data.Maybe (Maybe(..), fromMaybe)
import Data.String.CodeUnits as CU
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import Effect.Aff (Milliseconds(..), delay, launchAff_)
import Effect.Class (liftEffect)
import Effect.Unsafe (unsafePerformEffect)
import Data.Nullable (Nullable)
import Framer.Motion.MotionComponent as Motion
import Framer.Motion.Types as Motion
import Framer.Motion.Types (VariantLabel(..))
import Yoga.React.DOM.Internal (css)
import React.Basic (JSX, ReactComponent, element, keyed)
import React.Basic.DOM as D
import React.Basic.DOM.SVG as S
import React.Basic.DOM.Events (targetValue)
import React.Basic.Events (handler, handler_)
import React.Basic.Hooks (Component, component, readRef, useEffectOnce, useEffect, useRef, useState', writeRef)
import React.Basic.Hooks as Hooks
import Untagged.Castable (cast)
import Web.DOM (Node)

mkHeroPreview :: Component {}
mkHeroPreview = component "HeroPreview" \_ -> Hooks.do
  ratiosRef <- useRef ([] :: Array { id :: String, ratio :: Number })
  activeRef <- useRef ""
  activeSection /\ setActiveSection <- useState' "page-hero"
  useEffectOnce $
    observeRatios "magazine" (_.id <$> sectionStates) \id ratio -> do
      ratios <- readRef ratiosRef
      let ratios' = Array.snoc (Array.filter (\x -> x.id /= id) ratios) { id, ratio }
      writeRef ratiosRef ratios'
      case mostVisible ratios' of
        Just best -> setActiveSection best.id
        Nothing -> pure unit
      dispatchActive activeRef ratios'
  pure $
    D.main
      { id: "magazine"
      , className: "relative bg-[#0a0e1a] text-[#f5f1e8] h-screen overflow-y-scroll snap-y snap-mandatory"
      , children:
          [ feltballsBackground
          , topBar
          , pageRail
          , heroPage
          , playground { section: activeSection }
          , playerSection
          , renderSection
          , aiSection
          , embedSection
          , footerSection
          ]
      }

-- Fixed full-viewport layer that the offscreen WebGL canvas paints into. Sits
-- behind every section so per-section camera arms + ball morphs are visible
-- as the user scrolls between spreads.
feltballsBackground :: JSX
feltballsBackground =
  D.div
    { className: "fixed inset-0 z-0 pointer-events-none"
    , children: [ element feltballsComponent {} ]
    }

-- ---------------------------------------------------------------------------
-- Per-section declarative state: each section declares both a ball morph
-- direction/amount and a camera arm pose. The controller watches which section
-- is most visible and posts both to the worker; the worker lerps current
-- toward target each frame.
-- ---------------------------------------------------------------------------

type Morph =
  { dx :: Number, dy :: Number, dz :: Number, amount :: Number }

type CameraArm =
  { px :: Number, py :: Number, pz :: Number
  , lx :: Number, ly :: Number, lz :: Number
  , fov :: Number
  }

-- Formations are declared per section. kind 0=stream (disorder), 1=ring,
-- 2=sphere, 3=helix. `order` blends between the stream and the formation
-- in the worker — 0 means the original wandering, 1 means fully choreographed.
type FormationPose =
  { kind :: Number
  , radius :: Number
  , length :: Number
  , speed :: Number
  , order :: Number
  }

stream :: FormationPose
stream = { kind: 0.0, radius: 0.0, length: 0.0, speed: 0.0, order: 0.0 }

ring :: { radius :: Number, speed :: Number } -> FormationPose
ring p = { kind: 1.0, radius: p.radius, length: 0.0, speed: p.speed, order: 1.0 }

sphere :: { radius :: Number, speed :: Number } -> FormationPose
sphere p = { kind: 2.0, radius: p.radius, length: 0.0, speed: p.speed, order: 1.0 }

helix :: { radius :: Number, length :: Number, speed :: Number } -> FormationPose
helix p = { kind: 3.0, radius: p.radius, length: p.length, speed: p.speed, order: 1.0 }

-- Fake sound-wave: balls strung along a horizontal axis, y traces a multi-
-- harmonic sine that scrolls with time.
wave :: { radius :: Number, length :: Number, speed :: Number } -> FormationPose
wave p = { kind: 4.0, radius: p.radius, length: p.length, speed: p.speed, order: 1.0 }

type SectionState =
  { id :: String
  , morph :: Morph
  , camera :: CameraArm
  , formation :: FormationPose
  }

home :: CameraArm
home = { px: 0.0, py: -3.0, pz: 9.0, lx: 0.0, ly: 0.0, lz: 0.0, fov: 85.0 }

gathered :: Morph
gathered = { dx: 0.0, dy: 0.0, dz: 0.0, amount: 0.0 }

sectionStates :: Array SectionState
sectionStates =
  [ { id: "page-hero",  morph: gathered
    , camera: home
    , formation: stream
    }
  , { id: "playground", morph: gathered
    , camera: home { py = -1.0, pz = 12.0, lx = 1.0, ly = -5.0, fov = 75.0 }
    , formation: ring { radius: 5.0, speed: 0.35 }
    }
  , { id: "player",     morph: gathered
    , camera: home { px = -4.0, lx = -1.8, fov = 80.0 }
    , formation: helix { radius: 4.0, length: 12.0, speed: 0.6 }
    }
  , { id: "render",     morph: gathered
    , camera: home { py = -6.0, lx = -0.8, ly = 2.0 }
    , formation: sphere { radius: 5.0, speed: 0.25 }
    }
  , { id: "ai",         morph: gathered
    , camera: home { px = 4.0, lx = 1.4, fov = 80.0 }
    , formation: ring { radius: 7.0, speed: 0.5 }
    }
  , { id: "embed",      morph: gathered
    , camera: home { pz = 16.0, fov = 70.0 }
    , formation: wave { radius: 2.4, length: 22.0, speed: 1.8 }
    }
  , { id: "install",    morph: gathered
    , camera: home { pz = 6.0, fov = 90.0 }
    , formation: stream
    }
  ]

-- ---------------------------------------------------------------------------
-- Page 0 — hero spread. One screen, no scroll-driven captions; the 3D scene
-- only paints behind this page, not the ones that follow.
-- ---------------------------------------------------------------------------

heroPage :: JSX
heroPage =
  D.section
    { id: "page-hero"
    , className: "relative z-10 snap-start snap-always h-screen w-full overflow-hidden"
    , children:
        [ D.div { className: "absolute inset-0", children: [ element sceneComponent {} ] }
        , heroLockup
        , spreadFolio "00" "hero"
        ]
    }

heroLockup :: JSX
heroLockup =
  D.div
    { className: "absolute inset-0 z-10 flex flex-col items-center justify-start pt-[12vh] pointer-events-none px-6"
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
                    , style: D.css { fontFamily: "ui-serif, Georgia, 'Times New Roman', serif" }
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

-- ---------------------------------------------------------------------------
-- Fixed chrome: top bar with brand + nav, side rail with page dots.
-- ---------------------------------------------------------------------------

topBar :: JSX
topBar =
  D.div
    { className: "fixed top-0 inset-x-0 z-30 flex items-center justify-between px-8 py-5 font-mono text-[11px] uppercase tracking-[0.28em] text-[#8a94a8] pointer-events-none"
    , children:
        [ D.span
            { style: D.css { fontFamily: "'Sinistre', serif", letterSpacing: "0.05em", fontSize: "15px" }
            , className: "text-[#f5f1e8] normal-case pointer-events-auto"
            , children: [ D.text "markgraf" ]
            }
        , D.div
            { className: "flex items-center gap-6 pointer-events-auto"
            , children:
                [ navLink "#playground" "playground"
                , navLink "#player" "player"
                , navLink "#render" "render"
                , navLink "#ai" "ai"
                , navLink "#embed" "integrations"
                , navLink "#install" "install"
                ]
            }
        ]
    }

navLink :: String -> String -> JSX
navLink href t =
  D.a
    { href
    , className: "hover:text-[#f5f1e8] transition-colors"
    , children: [ D.text t ]
    }

pageRail :: JSX
pageRail =
  D.nav
    { className: "fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4 pointer-events-auto"
    , children: railDot <$>
        [ "#page-hero"
        , "#playground"
        , "#player"
        , "#render"
        , "#ai"
        , "#embed"
        , "#install"
        ]
    }

railDot :: String -> JSX
railDot href =
  D.a
    { href
    , className: "block w-[7px] h-[7px] rounded-full bg-[#2a3142] hover:bg-[#ff3b1a] transition-colors"
    , children: []
    }

spreadFolio :: String -> String -> JSX
spreadFolio num label =
  D.div
    { className: "absolute bottom-0 left-0 z-20 px-8 py-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6478] pointer-events-none"
    , children: [ D.text (num <> " / " <> label) ]
    }

-- ---------------------------------------------------------------------------
-- Live playground: textarea + syntax-highlight overlay + markgraf preview.
-- ---------------------------------------------------------------------------

type Example = { name :: String, source :: String }

examples :: Array Example
examples =
  [ { name: "request"
    , source:
        "seed 1\n\n"
          <> "frame setup {\n"
          <> "  +node client \"Client\"\n"
          <> "  +node api    \"API\"\n"
          <> "  +node db     \"Database\"\n"
          <> "  +edge client api\n"
          <> "  +edge api db\n"
          <> "}\n\n"
          <> "frame \"request\" {\n"
          <> "  client -> api \"GET /user/42\"\n"
          <> "  api    -> db  \"SELECT *\"\n"
          <> "  api    <- db  \"row\"\n"
          <> "  client <- api \"200 OK\"\n"
          <> "}\n"
    }
  , { name: "cache hit"
    , source:
        "seed 2\n\n"
          <> "frame setup {\n"
          <> "  +node client \"Client\"\n"
          <> "  +node api    \"API\"\n"
          <> "  +node cache  \"Cache\"\n"
          <> "  +node logger \"Logger\"\n"
          <> "  +edge client api\n"
          <> "  +edge api cache\n"
          <> "  +edge api logger\n"
          <> "}\n\n"
          <> "frame \"hit\" {\n"
          <> "  client -> api \"GET\"\n"
          <> "  par {\n"
          <> "    api -> cache  \"HIT\"\n"
          <> "    api -> logger \"trace\"\n"
          <> "  }\n"
          <> "  client <- api \"200\"\n"
          <> "}\n"
    }
  , { name: "pub/sub"
    , source:
        "seed 3\n\n"
          <> "frame setup {\n"
          <> "  +node pub  \"Publisher\"\n"
          <> "  +node bus  \"Broker\"\n"
          <> "  +node a    \"Worker A\"\n"
          <> "  +node b    \"Worker B\"\n"
          <> "  +node c    \"Worker C\"\n"
          <> "  +edge pub bus\n"
          <> "  +edge bus a\n"
          <> "  +edge bus b\n"
          <> "  +edge bus c\n"
          <> "}\n\n"
          <> "frame \"fanout\" {\n"
          <> "  pub -> bus \"event\"\n"
          <> "  par {\n"
          <> "    bus -> a \"event\"\n"
          <> "    bus -> b \"event\"\n"
          <> "    bus -> c \"event\"\n"
          <> "  }\n"
          <> "}\n"
    }
  , { name: "auth"
    , source:
        "seed 4\n\n"
          <> "frame setup {\n"
          <> "  +node user \"User\"\n"
          <> "  +node app  \"App\"\n"
          <> "  +node idp  \"IdP\"\n"
          <> "  +edge user app\n"
          <> "  +edge app idp\n"
          <> "  +edge user idp\n"
          <> "}\n\n"
          <> "frame \"sign in\" {\n"
          <> "  user -> app \"open\"\n"
          <> "  app  -> user \"redirect\"\n"
          <> "  user -> idp \"login\"\n"
          <> "  user <- idp \"code\"\n"
          <> "  user -> app \"code\"\n"
          <> "  app  -> idp \"exchange\"\n"
          <> "  app  <- idp \"token\"\n"
          <> "  user <- app \"signed in\"\n"
          <> "}\n"
    }
  , { name: "queue"
    , source:
        "seed 5\n\n"
          <> "frame setup {\n"
          <> "  +node prod  \"Producer\"\n"
          <> "  +node q     \"Queue\"\n"
          <> "  +node w1    \"Worker 1\"\n"
          <> "  +node w2    \"Worker 2\"\n"
          <> "  +edge prod q\n"
          <> "  +edge q w1\n"
          <> "  +edge q w2\n"
          <> "}\n\n"
          <> "frame \"enqueue\" {\n"
          <> "  prod -> q \"job 1\"\n"
          <> "  prod -> q \"job 2\"\n"
          <> "}\n\n"
          <> "frame \"drain\" {\n"
          <> "  par {\n"
          <> "    q -> w1 \"job 1\"\n"
          <> "    q -> w2 \"job 2\"\n"
          <> "  }\n"
          <> "}\n"
    }
  ]

defaultSource :: String
defaultSource = case Array.head examples of
  Just e -> e.source
  Nothing -> ""

playground :: { section :: String } -> JSX
playground = unsafePerformEffect mkPlayground

data Pane = SourcePane | RenderPane

derive instance Eq Pane

mkPlayground :: Component { section :: String }
mkPlayground = component "Playground" \{ section } -> Hooks.do
  src /\ setSrc <- useState' defaultSource
  debounced /\ setDebounced <- useState' defaultSource
  size /\ setSize <- useState' { w: 0.0, h: 0.0 }
  active /\ setActive <- useState' RenderPane
  gen /\ setGen <- useState' 0
  useEffect src do
    launchAff_ do
      delay (Milliseconds 250.0)
      liftEffect (setDebounced src)
    pure (pure unit)
  useEffect unit do
    onElementResize "markgraf-preview" setSize
  useEffect unit do
    installScrollSync "mg-textarea" "mg-pre"
  useEffect debounced do
    setGen (gen + 1)
    pure (pure unit)
  pure (playgroundView { src, setSrc, rendered: debounced, size, visible: true, active, setActive, gen, section })

type PlaygroundProps =
  { src :: String
  , setSrc :: String -> Effect Unit
  , rendered :: String
  , size :: { w :: Number, h :: Number }
  , visible :: Boolean
  , active :: Pane
  , setActive :: Pane -> Effect Unit
  , gen :: Int
  , section :: String
  }

playgroundView :: PlaygroundProps -> JSX
playgroundView p =
  D.section
    { id: "playground"
    , className: "relative snap-start snap-always h-screen flex flex-col justify-center z-10 bg-[#0a0e1a]/60 backdrop-blur-sm border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto w-full"
            , children:
                [ D.div
                    { className: "flex items-baseline justify-between mb-8 gap-6 flex-wrap"
                    , children:
                        [ D.div_
                            [ sectionLabel "01 / playground"
                            , D.h2
                                { className: "text-3xl sm:text-5xl font-bold tracking-tight leading-[0.95] max-w-2xl"
                                , style: D.css { fontFamily: "'Sinistre', serif" }
                                , children: [ D.text "Type Left. Watch Right." ]
                                }
                            ]
                        , D.p
                            { className: "text-sm text-[#8a94a8] max-w-xs leading-snug"
                            , children: [ D.text "Edit the source. The diagram replays on every save." ]
                            }
                        ]
                    }
                , exampleStrip p.src p.setSrc
                , paneTabs p.active p.setActive
                , editorAndPreview p
                ]
            }
        , spreadFolio "01" "playground"
        ]
    }

exampleStrip :: String -> (String -> Effect Unit) -> JSX
exampleStrip current setSrc =
  D.div
    { className: "flex items-end gap-6 sm:gap-10 mb-5 border-b border-[#1a1f2e] pb-4 overflow-x-auto"
    , children: Array.mapWithIndex chip examples
    }
  where
    chip i ex =
      D.button
        { type: "button"
        , onClick: handler_ (setSrc ex.source)
        , className: "group flex flex-col items-start gap-1.5 text-left cursor-pointer transition-opacity whitespace-nowrap"
        , children:
            [ D.div
                { className:
                    "font-mono text-[10px] tracking-[0.3em] transition-colors "
                      <> if current == ex.source then "text-[#ff3b1a]" else "text-[#5a6478] group-hover:text-[#8a94a8]"
                , children: [ D.text (padIndex (i + 1)) ]
                }
            , D.div
                { className:
                    "font-mono text-sm sm:text-base leading-none tracking-[0.12em] uppercase transition-colors "
                      <> if current == ex.source then "text-[#f5f1e8]" else "text-[#5a6478] group-hover:text-[#c8cdd9]"
                , children: [ D.text ex.name ]
                }
            ]
        }

    padIndex n = if n < 10 then "0" <> show n else show n

-- Heroicons code-bracket (outline, 24×24, stroke 1.5).
codeIcon :: JSX
codeIcon =
  S.svg
    { width: "20"
    , height: "20"
    , viewBox: "0 0 24 24"
    , fill: "none"
    , stroke: "currentColor"
    , strokeWidth: "1.5"
    , children:
        [ S.path
            { strokeLinecap: "round"
            , strokeLinejoin: "round"
            , d: "M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
            }
        ]
    }

paneTabs :: Pane -> (Pane -> Effect Unit) -> JSX
paneTabs active setActive =
  D.div
    { className: "sm:hidden flex justify-end mb-3"
    , children:
        [ D.button
            { type: "button"
            , onClick: handler_ (setActive (if active == SourcePane then RenderPane else SourcePane))
            , className:
                "w-10 h-10 rounded-md border flex items-center justify-center transition-colors cursor-pointer "
                  <> if active == SourcePane
                       then "bg-[#ff3b1a] border-[#ff3b1a] text-[#0a0e1a]"
                       else "bg-transparent border-[#2a3142] text-[#8a94a8] hover:border-[#ff3b1a] hover:text-[#f5f1e8]"
            , children: [ codeIcon ]
            }
        ]
    }

-- The house spring. One feel everywhere the playground card morphs.
markgrafSpringRecord ::
  { type :: String, stiffness :: Int, damping :: Int, mass :: Number, restDelta :: Number }
markgrafSpringRecord =
  { type: "spring", stiffness: 140, damping: 20, mass: 1.0, restDelta: 0.001 }

markgrafSpring :: Motion.Transition
markgrafSpring = cast (css markgrafSpringRecord)

editorAndPreview :: PlaygroundProps -> JSX
editorAndPreview p =
  Motion.div
    { variants: Motion.variants cardVariants
    , initial: cast (VariantLabel "page-hero") :: Motion.Initial
    , animate: cast (VariantLabel p.section) :: Motion.Animate
    , transition: markgrafSpring
    , style: css { backgroundColor: "rgb(10 14 26 / var(--bg-a))" }
    , className:
        "grid gap-px rounded-xl overflow-hidden h-[60vh] sm:h-[520px] w-fit mx-auto"
    }
    [ editorPane p.src p.setSrc (p.active == SourcePane)
    , previewPane p.rendered p.size p.visible p.gen (p.active == RenderPane)
    ]
  where
    floatingCss = css
      { y: "-95vh", x: "0px"
      , gridTemplateColumns: "0px 560px"
      , "--bg-a": 0
      }
    settledCss = css
      { y: "0vh", x: "0px"
      , gridTemplateColumns: "560px 560px"
      , "--bg-a": 1
      , transition: css
          { default: markgrafSpringRecord
          , gridTemplateColumns: delayedSpring
          , "--bg-a": delayedSpring
          }
      }
    delayedSpring = css
      { type: "spring", stiffness: 160, damping: 24, mass: 1.0, delay: 0.55 }
    cardVariants =
      { "page-hero": floatingCss
      , playground:  settledCss
      , player:      settledCss
      , render:      settledCss
      , ai:          settledCss
      , embed:       settledCss
      , install:     settledCss
      }

editorPane :: String -> (String -> Effect Unit) -> Boolean -> JSX
editorPane src setSrc activeOnMobile =
  D.div
    { className:
        (if activeOnMobile then "flex " else "hidden ")
          <> "sm:flex flex-col overflow-hidden"
    , children:
        [ paneHeader "#ff3b1a" "source.mg"
        , D.div
            { style: D.css
                { position: "relative"
                , flex: "1"
                , minHeight: "0"
                , fontFamily: "'Commit Mono', ui-monospace, monospace"
                , fontSize: "13px"
                , lineHeight: "1.6"
                }
            , children:
                [ D.pre
                    { id: "mg-pre"
                    , style: D.css
                        { position: "absolute"
                        , inset: "0"
                        , margin: "0"
                        , padding: "14px 18px"
                        , whiteSpace: "pre-wrap"
                        , wordBreak: "break-word"
                        , overflow: "hidden"
                        , pointerEvents: "none"
                        , color: "#c8cdd9"
                        , fontFamily: "inherit"
                        , fontSize: "inherit"
                        , lineHeight: "inherit"
                        }
                    , children: highlight src <> [ D.text "\n" ]
                    }
                , D.textarea
                    { id: "mg-textarea"
                    , value: src
                    , onChange: handler targetValue (fromMaybe "" >>> setSrc)
                    , spellCheck: false
                    , autoCorrect: "off"
                    , autoCapitalize: "off"
                    , style: D.css
                        { position: "absolute"
                        , inset: "0"
                        , width: "100%"
                        , height: "100%"
                        , padding: "14px 18px"
                        , margin: "0"
                        , border: "0"
                        , outline: "none"
                        , resize: "none"
                        , background: "transparent"
                        , color: "transparent"
                        , caretColor: "#ff3b1a"
                        , whiteSpace: "pre-wrap"
                        , wordBreak: "break-word"
                        , overflow: "auto"
                        , overscrollBehavior: "contain"
                        , fontFamily: "inherit"
                        , fontSize: "inherit"
                        , lineHeight: "inherit"
                        }
                    }
                ]
            }
        ]
    }

previewPane :: String -> { w :: Number, h :: Number } -> Boolean -> Int -> Boolean -> JSX
previewPane src size visible gen activeOnMobile =
  D.div
    { className:
        (if activeOnMobile then "flex " else "hidden ")
          <> "sm:flex flex-col overflow-hidden"
    , children:
        [ D.div
            { id: "markgraf-preview"
            , style: D.css
                { flex: "1"
                , minHeight: "0"
                , position: "relative"
                , overflow: "hidden"
                }
            , children:
                if not visible || size.w <= 0.0 || size.h <= 0.0
                  then []
                  else
                    [ keyed (show gen) $ element markgrafPlayerComponent
                        { src
                        , renderer: "svg"
                        , theme: "dark"
                        , transparent: true
                        , width: size.w
                        , height: size.h
                        }
                    ]
            }
        ]
    }

paneHeader :: String -> String -> JSX
paneHeader dot label =
  D.div
    { className: "flex items-center gap-2 px-4 py-2.5 border-b border-[#1a1f2e] text-[11px] uppercase tracking-[0.25em] text-[#5a6478] font-mono"
    , children:
        [ D.span
            { style: D.css { width: "8px", height: "8px", borderRadius: "999px", background: dot }
            , children: []
            }
        , D.text label
        ]
    }

-- ---------------------------------------------------------------------------
-- Tokenizer: produces colored <span> children for the highlight overlay.
-- ---------------------------------------------------------------------------

highlight :: String -> Array JSX
highlight source = renderTok <$> tokenize source

renderTok :: { kind :: TokKind, text :: String } -> JSX
renderTok { kind, text } =
  D.span { style: D.css { color: tokColor kind }, children: [ D.text text ] }

data TokKind
  = TKeyword
  | TOperator
  | TString
  | TNumber
  | TComment
  | TBrace
  | TIdent
  | TPlain

derive instance Eq TokKind

tokColor :: TokKind -> String
tokColor TKeyword  = "#ff3b1a"
tokColor TOperator = "#ff8a5c"
tokColor TString   = "#a7e3a3"
tokColor TNumber   = "#d9c97a"
tokColor TComment  = "#5a6478"
tokColor TBrace    = "#8a94a8"
tokColor TIdent    = "#c8cdd9"
tokColor TPlain    = "#c8cdd9"

-- | Walk the source one position at a time, emitting tokens. Keeps adjacent
-- | runs of plain text fused so the overlay has fewer spans.
tokenize :: String -> Array { kind :: TokKind, text :: String }
tokenize input = fuse (go 0 [])
  where
    n = CU.length input

    go i acc
      | i >= n = acc
      | otherwise = case matchAt i of
          { tok: Just t, next } -> go next (acc <> [ t ])
          { next } ->
            let ch = fromMaybe "" (CU.singleton <$> CU.charAt i input)
            in go (i + 1) (acc <> [ { kind: TPlain, text: ch } ])

    matchAt i =
      case tryComment i of
        Just t -> { tok: Just t, next: i + CU.length t.text }
        Nothing -> case tryString i of
          Just t -> { tok: Just t, next: i + CU.length t.text }
          Nothing -> case tryOperator i of
            Just t -> { tok: Just t, next: i + CU.length t.text }
            Nothing -> case tryBrace i of
              Just t -> { tok: Just t, next: i + CU.length t.text }
              Nothing -> case tryPlusKw i of
                Just t -> { tok: Just t, next: i + CU.length t.text }
                Nothing -> case tryNumber i of
                  Just t -> { tok: Just t, next: i + CU.length t.text }
                  Nothing -> case tryIdent i of
                    Just t -> { tok: Just t, next: i + CU.length t.text }
                    Nothing -> { tok: Nothing, next: i + 1 }

    -- Slices the suffix starting at i. Used by all matchers.
    suffix i = CU.drop i input

    tryComment i = do
      let s = suffix i
      pref <- if startsWith "//" s then Just "//"
              else if startsWith "#" s then Just "#"
              else Nothing
      let line = takeWhileStr (\c -> c /= '\n') (CU.drop (CU.length pref) s)
      pure { kind: TComment, text: pref <> line }

    tryString i = do
      let s = suffix i
      _ <- if startsWith "\"" s then Just unit else Nothing
      let body = takeString (CU.drop 1 s)
      pure { kind: TString, text: "\"" <> body }

    -- Reads a string body up to and including the closing quote (or EOF).
    takeString s = go' 0
      where
        len = CU.length s
        go' k
          | k >= len = CU.take k s
          | otherwise = case CU.charAt k s of
              Just '\\' -> go' (k + 2)
              Just '"'  -> CU.take (k + 1) s
              _         -> go' (k + 1)

    tryOperator i =
      let s = suffix i in
      if startsWith "<-->" s then Just { kind: TOperator, text: "<-->" }
      else if startsWith "<->" s then Just { kind: TOperator, text: "<->" }
      else if startsWith "-->" s then Just { kind: TOperator, text: "-->" }
      else if startsWith "->"  s then Just { kind: TOperator, text: "->" }
      else if startsWith "<-"  s then Just { kind: TOperator, text: "<-" }
      else Nothing

    tryBrace i = case CU.charAt i input of
      Just '{' -> Just { kind: TBrace, text: "{" }
      Just '}' -> Just { kind: TBrace, text: "}" }
      _        -> Nothing

    tryPlusKw i = do
      let s = suffix i
      _ <- if startsWith "+" s then Just unit else Nothing
      let rest = takeWhileStr isIdentChar (CU.drop 1 s)
          full = "+" <> rest
      if rest == "node" || rest == "edge" || rest == "group"
        then Just { kind: TKeyword, text: full }
        else Nothing

    tryNumber i = do
      let s = suffix i
      _ <- case CU.charAt 0 s of
        Just c | isDigit c -> Just unit
        _ -> Nothing
      let whole = takeWhileStr isDigit s
          afterWhole = CU.drop (CU.length whole) s
          frac =
            if startsWith "." afterWhole
              then "." <> takeWhileStr isDigit (CU.drop 1 afterWhole)
              else ""
      pure { kind: TNumber, text: whole <> frac }

    tryIdent i = do
      let s = suffix i
      _ <- case CU.charAt 0 s of
        Just c | isIdentStart c -> Just unit
        _ -> Nothing
      let word = takeWhileStr isIdentChar s
          kind = if isKeyword word then TKeyword else TIdent
      pure { kind, text: word }

    isKeyword w =
      w == "seed" || w == "frame" || w == "par"
        || w == "chain" || w == "group" || w == "layout"

    fuse arr = fuseGo arr []
    fuseGo xs acc = case Array.uncons xs of
      Nothing -> acc
      Just { head: x, tail } -> case Array.unsnoc acc of
        Just { init, last } | last.kind == TPlain && x.kind == TPlain ->
          fuseGo tail (init <> [ { kind: TPlain, text: last.text <> x.text } ])
        _ -> fuseGo tail (acc <> [ x ])

-- ---------------------------------------------------------------------------
-- Tiny char/string helpers used by the tokenizer.
-- ---------------------------------------------------------------------------

startsWith :: String -> String -> Boolean
startsWith p s = CU.take (CU.length p) s == p

takeWhileStr :: (Char -> Boolean) -> String -> String
takeWhileStr pred s = CU.take (countMatching 0) s
  where
    n = CU.length s
    countMatching k
      | k >= n = k
      | otherwise = case CU.charAt k s of
          Just c | pred c -> countMatching (k + 1)
          _ -> k

isDigit :: Char -> Boolean
isDigit c = c >= '0' && c <= '9'

isIdentStart :: Char -> Boolean
isIdentStart c =
  (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'

isIdentChar :: Char -> Boolean
isIdentChar c = isIdentStart c || isDigit c || c == '-'

-- ---------------------------------------------------------------------------
-- Content spreads after the playground
-- ---------------------------------------------------------------------------

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

playerSection :: JSX
playerSection =
  D.section
    { id: "player"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 bg-[#0a0e1a]/60 backdrop-blur-sm border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto w-full"
            , children:
                [ sectionLabel "02 / player"
                , D.h2
                    { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] mb-6 max-w-3xl"
                    , style: D.css { fontFamily: "'Sinistre', serif" }
                    , children: [ D.text "Native macOS player." ]
                    }
                , D.p
                    { className: "text-base text-[#8a94a8] max-w-2xl leading-relaxed mb-10"
                    , children: [ D.text "Swift, Metal, AppKit. Opens .markgraf files, plays them, hot-reloads on save." ]
                    }
                , D.div
                    { className: "grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6"
                    , children:
                        [ featureRow "Drag-and-drop reload" "Drop a .markgraf file on the window. Edit in your editor of choice; the player picks up saves instantly."
                        , featureRow "Scrub bar" "Drag along the timeline to step through frames. Pause, rewind, hold on any moment."
                        , featureRow "Glass backdrop" "Vibrant blur over your desktop so the diagram floats. Looks at home next to your editor."
                        , featureRow "Pipe straight in" "pbpaste | markgraf --play opens a window without touching the filesystem."
                        ]
                    }
                ]
            }
        , spreadFolio "02" "player"
        ]
    }

featureRow :: String -> String -> JSX
featureRow heading body =
  D.div
    { className: "flex flex-col gap-1.5"
    , children:
        [ D.div
            { className: "font-mono text-xs uppercase tracking-[0.2em] text-[#ff3b1a]"
            , children: [ D.text heading ]
            }
        , D.p
            { className: "text-sm text-[#c8cdd9] leading-relaxed"
            , children: [ D.text body ]
            }
        ]
    }

renderSection :: JSX
renderSection =
  D.section
    { id: "render"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 bg-[#0a0e1a]/60 backdrop-blur-sm border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto w-full"
            , children:
                [ sectionLabel "03 / render"
                , D.h2
                    { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] mb-6 max-w-3xl"
                    , style: D.css { fontFamily: "'Sinistre', serif" }
                    , children: [ D.text "mp4, SVG, GIF, or sequence diagram." ]
                    }
                , D.p
                    { className: "text-base text-[#8a94a8] max-w-2xl leading-relaxed mb-10"
                    , children:
                        [ D.text "mp4, animated SVG, gif, or a static sequence diagram. ffmpeg is statically linked, so mp4 works on a fresh machine with nothing else installed."
                        ]
                    }
                , D.div
                    { className: "grid grid-cols-2 md:grid-cols-3 gap-4"
                    , children:
                        [ renderCard "--play"     "native macOS player"
                        , renderCard "-o out.mp4" "mp4 — ffmpeg embedded"
                        , renderCard "--svg"      "animated svg — vector"
                        , renderCard "--gif"      "keyframe gif"
                        , renderCard "--sequence" "static sequence diagram"
                        , renderCard "--check"    "typecheck without rendering"
                        ]
                    }
                ]
            }
        , spreadFolio "03" "render"
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

aiSection :: JSX
aiSection =
  D.section
    { id: "ai"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 bg-[#0a0e1a]/60 backdrop-blur-sm border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto w-full"
            , children:
                [ sectionLabel "04 / ai authoring"
                , D.h2
                    { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] mb-6 max-w-3xl"
                    , style: D.css { fontFamily: "'Sinistre', serif" }
                    , children: [ D.text "Claude writes the diagram." ]
                    }
                , D.p
                    { className: "text-base text-[#8a94a8] max-w-2xl leading-relaxed mb-10"
                    , children:
                        [ D.text "A Claude Code plugin teaches Claude the syntax and authoring rules. You describe the system in plain English, Claude produces the "
                        , code ".markgraf"
                        , D.text " source."
                        ]
                    }
                , D.div
                    { className: "flex flex-col gap-3 max-w-2xl"
                    , children:
                        [ aiCommand "/plugin marketplace add i-am-the-slime/claude-plugins"
                        , aiCommand "/plugin install markgraf@i-am-the-slime"
                        ]
                    }
                ]
            }
        , spreadFolio "04" "ai"
        ]
    }

embedSection :: JSX
embedSection =
  D.section
    { id: "embed"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 bg-[#0a0e1a]/60 backdrop-blur-sm border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto w-full"
            , children:
                [ sectionLabel "05 / integrations"
                , D.h2
                    { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] mb-6 max-w-3xl"
                    , style: D.css { fontFamily: "'Sinistre', serif" }
                    , children: [ D.text "GitHub and docs sites." ]
                    }
                , D.p
                    { className: "text-base text-[#8a94a8] max-w-2xl leading-relaxed mb-10"
                    , children:
                        [ D.text "The same "
                        , code "```markgraf"
                        , D.text " block plays in your README and in your docs."
                        ]
                    }
                , D.div
                    { className: "grid grid-cols-1 md:grid-cols-2 gap-6"
                    , children:
                        [ embedCard "GitHub integration" "Browser extension that renders markgraf code blocks inline on github.com."
                        , embedCard "Docs plugins" "Docusaurus, Astro Starlight, MkDocs."
                        ]
                    }
                ]
            }
        , spreadFolio "05" "integrations"
        ]
    }

embedCard :: String -> String -> JSX
embedCard heading body =
  D.div
    { className: "bg-[#11162260] backdrop-blur-sm border border-[#2a3142] rounded-lg p-6 hover:border-[#ff3b1a] hover:bg-[#1a1f2e] transition-colors cursor-default"
    , children:
        [ D.div
            { className: "font-mono text-xs uppercase tracking-[0.2em] text-[#ff3b1a] mb-3"
            , children: [ D.text heading ]
            }
        , D.p
            { className: "text-sm text-[#c8cdd9] leading-relaxed"
            , children: [ D.text body ]
            }
        ]
    }

aiCommand :: String -> JSX
aiCommand cmd =
  D.pre
    { className: "bg-[#11162280] backdrop-blur-sm border border-[#2a3142] rounded-lg px-5 py-4 text-sm leading-relaxed text-[#c8cdd9] font-mono overflow-x-auto"
    , children: [ D.code_ [ D.text cmd ] ]
    }

code :: String -> JSX
code text =
  D.code
    { className: "font-mono text-[#ff3b1a] bg-[#11162280] border border-[#2a3142] rounded px-1.5 py-0.5 text-[0.85em]"
    , children: [ D.text text ]
    }

footerSection :: JSX
footerSection =
  D.section
    { id: "install"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 bg-[#0a0e1a]/60 backdrop-blur-sm border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto w-full flex flex-col gap-10"
            , children:
                [ sectionLabel "06 / install"
                , D.div
                    { className: "flex flex-col gap-6"
                    , children:
                        [ D.h2
                            { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] max-w-3xl"
                            , style: D.css { fontFamily: "'Sinistre', serif" }
                            , children: [ D.text "Install" ]
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
        , spreadFolio "06" "install"
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
    { className: "flex items-center gap-4 mb-8 font-mono text-[10px] uppercase tracking-[0.35em]"
    , children:
        [ D.span { className: "h-px w-10 bg-[#ff3b1a]", children: [] }
        , D.span { className: "text-[#ff3b1a]", children: [ D.text text ] }
        ]
    }

foreign import sceneComponent :: ReactComponent {}
foreign import feltballsComponent :: ReactComponent {}
foreign import markgrafPlayerComponent
  :: ReactComponent
       { src :: String
       , renderer :: String
       , theme :: String
       , transparent :: Boolean
       , width :: Number
       , height :: Number
       }
foreign import lookupNode :: String -> Effect (Nullable Node)

foreign import onElementResize :: String -> ({ w :: Number, h :: Number } -> Effect Unit) -> Effect (Effect Unit)
foreign import onIntersect :: String -> (Boolean -> Effect Unit) -> Effect (Effect Unit)
foreign import installScrollSync :: String -> String -> Effect (Effect Unit)
-- Picks the most-visible section from the ratios so far and, when it changes,
-- posts its declared morph + camera arm to the worker.
dispatchActive
  :: Hooks.Ref String
  -> Array { id :: String, ratio :: Number }
  -> Effect Unit
dispatchActive activeRef ratios = case mostVisible ratios of
  Nothing -> pure unit
  Just best -> case Array.find (\s -> s.id == best.id) sectionStates of
    Nothing -> pure unit
    Just section -> do
      last <- readRef activeRef
      when (section.id /= last) do
        writeRef activeRef section.id
        postWorkerMessage "morph" section.morph
        postWorkerMessage "camera" section.camera
        postWorkerMessage "formation" section.formation

mostVisible
  :: Array { id :: String, ratio :: Number }
  -> Maybe { id :: String, ratio :: Number }
mostVisible = Array.foldl pick Nothing
  where
  pick Nothing x = Just x
  pick (Just best) x = Just (if x.ratio > best.ratio then x else best)

observeRatios
  :: String -> Array String -> (String -> Number -> Effect Unit)
  -> Effect (Effect Unit)
observeRatios root ids cb = observeRatiosImpl root ids cb

postWorkerMessage :: forall a. String -> a -> Effect Unit
postWorkerMessage = postWorkerMessageImpl

foreign import observeRatiosImpl
  :: String -> Array String -> (String -> Number -> Effect Unit)
  -> Effect (Effect Unit)
foreign import postWorkerMessageImpl :: forall a. String -> a -> Effect Unit
