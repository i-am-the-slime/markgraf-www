module Page.HeroPreview (mkHeroPreview) where

import Prelude

import Data.Array as Array
import Data.Maybe (Maybe(..), fromMaybe)
import Data.String.CodeUnits as CU
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import Effect.Aff (Milliseconds(..), delay, launchAff_)
import Effect.Class (liftEffect)
import Effect.Uncurried (mkEffectFn1)
import Effect.Unsafe (unsafePerformEffect)
import Data.Nullable (Nullable)
import Components.Scene (writeSceneProgress)
import Framer.Motion.MotionComponent as Motion
import Framer.Motion.Types as Motion
import Framer.Motion.Types (VariantLabel(..))
import MotionValue (MotionValue)
import MotionValue as MV
import React.Basic (JSX, ReactComponent, element, keyed)
import React.Basic.Events (EventHandler, handler_)
import Unsafe.Coerce (unsafeCoerce)
import React.Basic.Hooks (Component, component, readRef, useEffectOnce, useEffect, useRef, useState', writeRef)
import React.Basic.Hooks as Hooks
import Untagged.Castable (cast)
import Web.DOM (Node)
import Yoga.React.DOM.Attributes.AutoCapitalize (autoCapitalizeOff)
import Yoga.React.DOM.HTML.A (a)
import Yoga.React.DOM.HTML.Button (button)
import Yoga.React.DOM.HTML.Code (code) as H
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.HTML.H (h1, h2)
import Yoga.React.DOM.HTML.Img (img)
import Yoga.React.DOM.HTML.Main (main)
import Yoga.React.DOM.HTML.Nav (nav)
import Yoga.React.DOM.HTML.P (p)
import Yoga.React.DOM.HTML.Pre (pre)
import Yoga.React.DOM.HTML.Section (section) as H
import Yoga.React.DOM.HTML.Span (span)
import Yoga.React.DOM.HTML.Textarea (textarea)
import Yoga.React.DOM.Internal (css, noJSX, text)
import Yoga.React.DOM.SVG.Path (path)
import Yoga.React.DOM.SVG.Svg (svg)
import Prim.Row (class Union)
import Data.Monoid as Monoid

onTargetValue :: (String -> Effect Unit) -> EventHandler
onTargetValue cb = mkEffectFn1 \e -> cb (unsafeCoerce e).target.value

mkHeroPreview :: Component {}
mkHeroPreview = component "HeroPreview" \_ -> Hooks.do
  ratiosRef <- useRef ([] :: Array { id :: String, ratio :: Number })
  activeRef <- useRef ""
  activeSection /\ setActiveSection <- useState' "page-hero"
  useEffectOnce $ installVhsBurst "vhs-text-wrap"
  useEffectOnce installWheelSnap
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
    main
      { id: "magazine"
      , className: "relative bg-[#0a0e1a] text-[#f5f1e8] h-screen overflow-y-scroll snap-y snap-mandatory"
      }
      [ feltballsBackground
      , scrim (activeSection == "playground")
      , topBar
      , pageRail
      , heroPage
      , playground { section: activeSection }
      , playerSection
      , renderSection
      , aiSection
      , embedSection
      , playSection
      , footerSection
      , labColumnsSection
      , labQuoteSection
      , labHangSection
      , labIconsSection
      , labPhotoSection
      , labRightHangSection
      ]

-- Fixed full-viewport layer that the offscreen WebGL canvas paints into. Sits
-- behind every section so per-section camera arms + ball morphs are visible
-- as the user scrolls between spreads.
feltballsBackground :: JSX
feltballsBackground =
  div { className: "fixed inset-0 z-0 pointer-events-none" }
    [ element feltballsComponent {} ]

-- ---------------------------------------------------------------------------
-- Per-section declarative state: each section declares both a ball morph
-- direction/amount and a camera arm pose. The controller watches which section
-- is most visible and posts both to the worker; the worker lerps current
-- toward target each frame.
-- ---------------------------------------------------------------------------

type Morph =
  { dx :: Number, dy :: Number, dz :: Number, amount :: Number }

type CameraArm =
  { px :: Number
  , py :: Number
  , pz :: Number
  , lx :: Number
  , ly :: Number
  , lz :: Number
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
ring fp = { kind: 1.0, radius: fp.radius, length: 0.0, speed: fp.speed, order: 1.0 }

sphere :: { radius :: Number, speed :: Number } -> FormationPose
sphere fp = { kind: 2.0, radius: fp.radius, length: 0.0, speed: fp.speed, order: 1.0 }

helix :: { radius :: Number, length :: Number, speed :: Number } -> FormationPose
helix fp = { kind: 3.0, radius: fp.radius, length: fp.length, speed: fp.speed, order: 1.0 }

-- Fake sound-wave: balls strung along a horizontal axis, y traces a multi-
-- harmonic sine that scrolls with time.
wave :: { radius :: Number, length :: Number, speed :: Number } -> FormationPose
wave fp = { kind: 4.0, radius: fp.radius, length: fp.length, speed: fp.speed, order: 1.0 }

tornado :: { radius :: Number, length :: Number, speed :: Number } -> FormationPose
tornado fp = { kind: 5.0, radius: fp.radius, length: fp.length, speed: fp.speed, order: 1.0 }

-- Right-pointing play-button outline. Balls trace the triangle perimeter at
-- `speed`; `radius` is the triangle half-extent.
playButton :: { radius :: Number, speed :: Number } -> FormationPose
playButton fp = { kind: 6.0, radius: fp.radius, length: 0.0, speed: fp.speed, order: 1.0 }

-- Heroicons code-bracket outline (`</>`). Three disconnected polylines.
code :: { radius :: Number, speed :: Number } -> FormationPose
code fp = { kind: 7.0, radius: fp.radius, length: 0.0, speed: fp.speed, order: 1.0 }

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
  [ { id: "page-hero"
    , morph: gathered
    , camera: home
    , formation: stream
    }
  , { id: "playground"
    , morph: gathered
    , camera: home { py = 0.0, pz = 24.0, fov = 55.0 }
    , formation: code { radius: 11.0, speed: 0.15 }
    }
  , { id: "player"
    , morph: gathered
    , camera: home { px = -4.0, lx = -1.8, fov = 80.0 }
    , formation: helix { radius: 4.0, length: 12.0, speed: 0.6 }
    }
  , { id: "render"
    , morph: gathered
    , camera: home { py = -6.0, lx = -0.8, ly = 2.0 }
    , formation: sphere { radius: 5.0, speed: 0.25 }
    }
  , { id: "ai"
    , morph: gathered
    , camera: home { px = 1.5, lx = -5.0, ly = 2.5, fov = 80.0 }
    , formation: tornado { radius: 3.5, length: 8.0, speed: 6.0 }
    }
  , { id: "embed"
    , morph: gathered
    , camera: home { pz = 28.0, fov = 70.0 }
    , formation: wave { radius: 2.4, length: 36.0, speed: 1.8 }
    }
  , { id: "play"
    , morph: gathered
    , camera: home { py = 0.0, pz = 24.0, fov = 55.0 }
    , formation: code { radius: 11.0, speed: 0.15 }
    }
  , { id: "install"
    , morph: gathered
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
  H.section
    { id: "page-hero"
    , className: "relative z-10 snap-start snap-always h-screen w-full overflow-hidden"
    }
    [ div { className: "absolute inset-0" } [ element sceneComponent {} ]
    , heroLockup
    , spreadFolio "00" "hero"
    ]

heroLockup :: JSX
heroLockup =
  div { className: "absolute inset-0 z-10 flex flex-col items-center justify-start pt-[12vh] pointer-events-none px-6" }
    [ div { className: "flex flex-col items-center gap-10 max-w-3xl text-center" }
        [ h1
            { className: "vhs-text-wrap text-[18vw] sm:text-[16vw] md:text-[13vw] leading-[0.82] tracking-[-0.045em] font-bold"
            , style: css
                { fontFamily: "'Sinistre', serif"
                , textShadow: "0 0 80px rgba(10,14,26,0.7)"
                }
            }
            [ span
                { className: "vhs-text"
                , style: css { "--vhs-text": "\"markgraf\"" }
                }
                [ text "markgraf" ]
            ]
        , p
            { className: "max-w-xl text-lg sm:text-xl leading-snug text-[#c8cdd9]"
            , style: css { fontFamily: "'Ilisarniq', ui-sans-serif, system-ui, sans-serif" }
            }
            [ text "A few words are worth a thousand pictures." ]
        , installPill
        ]
    ]

-- ---------------------------------------------------------------------------
-- Fixed chrome: top bar with brand + nav, side rail with page dots.
-- ---------------------------------------------------------------------------

topBar :: JSX
topBar =
  div { className: "fixed top-0 inset-x-0 z-30 flex items-center justify-between px-8 py-5 font-mono text-[11px] uppercase tracking-[0.28em] text-[#8a94a8] pointer-events-none" }
    [ span
        { style: css { fontFamily: "'Sinistre', serif", letterSpacing: "0.05em", fontSize: "15px" }
        , className: "text-[#f5f1e8] normal-case pointer-events-auto"
        }
        [ text "markgraf" ]
    , div { className: "flex items-center gap-6 pointer-events-auto" }
        [ navLink "#playground" "playground"
        , navLink "#player" "player"
        , navLink "#render" "render"
        , navLink "#ai" "ai"
        , navLink "#embed" "integrations"
        , navLink "#play" "play"
        , navLink "#install" "install"
        ]
    ]

navLink :: String -> String -> JSX
navLink href label =
  a { href, className: "hover:text-[#f5f1e8] transition-colors" } [ text label ]

pageRail :: JSX
pageRail =
  nav { className: "fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4 pointer-events-auto" } $
    railDot <$>
      [ "#page-hero"
      , "#playground"
      , "#player"
      , "#render"
      , "#ai"
      , "#embed"
      , "#play"
      , "#install"
      , "#lab-columns"
      , "#lab-quote"
      , "#lab-hang"
      , "#lab-icons"
      , "#lab-photo"
      , "#lab-right-hang"
      ]

railDot :: String -> JSX
railDot href =
  a
    { href
    , className: "block w-[7px] h-[7px] rounded-full bg-[#2a3142] hover:bg-[#ff3b1a] transition-colors"
    }
    noJSX

spreadFolio :: String -> String -> JSX
spreadFolio num label =
  div { className: "absolute bottom-0 left-0 z-20 px-8 py-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6478] pointer-events-none" }
    [ text (num <> " / " <> label) ]

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
  xMv <- MV.useMotionValue (-280.0)
  yMv <- MV.useMotionValue 0.0
  useEffect src do
    launchAff_ do
      delay (Milliseconds 250.0)
      liftEffect (setDebounced src)
    pure (pure unit)
  useEffect unit do
    onElementResize "markgraf-preview" setSize
  useEffect unit do
    installScrollSync "mg-textarea" "mg-pre"
  useEffect unit do
    onMagazineScroll \p -> do
      MV.set p.x xMv
      MV.set p.y yMv
      writeSceneProgress p.progress
  useEffect debounced do
    setGen (gen + 1)
    pure (pure unit)
  pure (playgroundView { src, setSrc, rendered: debounced, size, visible: true, active, setActive, gen, section, xMv, yMv })

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
  , xMv :: MotionValue Number
  , yMv :: MotionValue Number
  }

playgroundView :: PlaygroundProps -> JSX
playgroundView pp =
  H.section
    { id: "playground"
    , className: "relative snap-start snap-always h-screen flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ div { className: "flex items-baseline justify-between mb-8 gap-6 flex-wrap" }
            [ div {}
                [ sectionLabel "01 / playground"
                , h2
                    { className: "text-[clamp(1.875rem,4vw,4rem)] font-bold tracking-tight leading-[0.95] max-w-[20ch]"
                    , style: css { fontFamily: "'Sinistre', serif" }
                    }
                    "Try it out"
                ]
            ]
        , exampleStrip pp.src pp.setSrc
        , paneTabs pp.active pp.setActive
        , editorAndPreview pp
        ]
    , spreadFolio "01" "playground"
    ]

-- Fixed full-viewport scrim layered just above the 3D canvas (z-0) and below
-- everything else (sections start at z-10). Fades in/out via opacity based on
-- which section is active so the canvas reads darker and softer there
-- without affecting other sections.
scrim :: Boolean -> JSX
scrim isActive =
  div
    { className:
        "fixed inset-0 z-[1] bg-black/30 backdrop-blur-sm transition-opacity duration-700 pointer-events-none "
          <> (if isActive then "opacity-100" else "opacity-0")
    }
    noJSX

exampleStrip :: String -> (String -> Effect Unit) -> JSX
exampleStrip current setSrc =
  div { className: "flex items-end gap-6 sm:gap-10 mb-5 border-b border-[#1a1f2e] pb-4 overflow-x-auto" } $
    Array.mapWithIndex chip examples
  where
  chip i ex =
    button
      { type: "button"
      , onClick: handler_ (setSrc ex.source)
      , className: "group flex flex-col items-start gap-1.5 text-left cursor-pointer transition-opacity whitespace-nowrap"
      }
      [ div
          { className:
              "font-mono text-[10px] tracking-[0.3em] transition-colors "
                <> if current == ex.source then "text-[#ff3b1a]" else "text-[#5a6478] group-hover:text-[#8a94a8]"
          }
          [ text (padIndex (i + 1)) ]
      , div
          { className:
              "font-mono text-sm sm:text-base leading-none tracking-[0.12em] uppercase transition-colors "
                <> if current == ex.source then "text-[#f5f1e8]" else "text-[#5a6478] group-hover:text-[#c8cdd9]"
          }
          [ text ex.name ]
      ]

  padIndex n = if n < 10 then "0" <> show n else show n

-- Heroicons code-bracket (outline, 24×24, stroke 1.5).
codeIcon :: JSX
codeIcon =
  svg
    { width: "20"
    , height: "20"
    , viewBox: "0 0 24 24"
    , fill: "none"
    , stroke: "currentColor"
    , strokeWidth: "1.5"
    }
    [ path
        { strokeLinecap: "round"
        , strokeLinejoin: "round"
        , d: "M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
        }
        noJSX
    ]

paneTabs :: Pane -> (Pane -> Effect Unit) -> JSX
paneTabs active setActive =
  div { className: "sm:hidden flex justify-end mb-3" }
    [ button
        { type: "button"
        , onClick: handler_ (setActive (if active == SourcePane then RenderPane else SourcePane))
        , className:
            "w-10 h-10 rounded-md border flex items-center justify-center transition-colors cursor-pointer "
              <>
                if active == SourcePane then "bg-[#ff3b1a] border-[#ff3b1a] text-[#0a0e1a]"
                else "bg-transparent border-[#2a3142] text-[#8a94a8] hover:border-[#ff3b1a] hover:text-[#f5f1e8]"
        }
        codeIcon
    ]

-- The house spring. One feel everywhere the playground card morphs.
markgrafSpringRecord
  :: { type :: String, stiffness :: Int, damping :: Int, mass :: Number, restDelta :: Number }
markgrafSpringRecord =
  { type: "spring", stiffness: 140, damping: 20, mass: 1.0, restDelta: 0.001 }

markgrafSpring :: Motion.Transition
markgrafSpring = cast (css markgrafSpringRecord)

editorAndPreview :: PlaygroundProps -> JSX
editorAndPreview pp =
  div
    { className:
        "grid gap-px h-[60vh] sm:h-[520px] w-fit mx-auto"
    , style: css { gridTemplateColumns: "560px 560px" }
    }
    [ editorPane pp.src pp.setSrc (pp.active == SourcePane)
    , Motion.div
        { style: css { x: pp.xMv, y: pp.yMv }
        , className: "h-full"
        }
        $ previewPane pp.rendered pp.size pp.visible pp.gen (pp.active == RenderPane)
    ]

editorPane :: String -> (String -> Effect Unit) -> Boolean -> JSX
editorPane src setSrc activeOnMobile =
  div
    { className:
        (if activeOnMobile then "flex " else "hidden ")
          <> "sm:flex flex-col overflow-hidden"
    }
    [ div
        { style: css
            { position: "relative"
            , flex: "1"
            , minHeight: "0"
            , fontFamily: "'Commit Mono', ui-monospace, monospace"
            , fontSize: "13px"
            , lineHeight: "1.6"
            }
        }
        [ pre
            { id: "mg-pre"
            , style: css
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
            }
            (highlight src <> [ text "\n" ])
        , textarea
            { id: "mg-textarea"
            , value: src
            , onChange: onTargetValue setSrc
            , spellCheck: false
            , autoCapitalize: autoCapitalizeOff
            , style: css
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
    ]

previewPane :: String -> { w :: Number, h :: Number } -> Boolean -> Int -> Boolean -> JSX
previewPane src size visible gen activeOnMobile =
  div
    { className:
        (if activeOnMobile then "flex " else "hidden ")
          <> "sm:flex flex-col overflow-hidden h-full"
    }
    $ div
        { id: "markgraf-preview"
        , style: css
            { flex: "1"
            , minHeight: "0"
            , position: "relative"
            , overflow: "hidden"
            }
        }
    $ keyed (show gen)
    $
      markgrafPlayer
        { src
        , renderer: "svg"
        , theme: "dark"
        , transparent: true
        , width: size.w
        , height: size.h
        }
        # Monoid.guard (visible && size.w > 0.0 && size.h > 0.0)

-- ---------------------------------------------------------------------------
-- Tokenizer: produces colored <span> children for the highlight overlay.
-- ---------------------------------------------------------------------------

highlight :: String -> Array JSX
highlight source = renderTok <$> tokenize source

renderTok :: { kind :: TokKind, text :: String } -> JSX
renderTok tok =
  span { style: css { color: tokColor tok.kind } } [ text tok.text ]

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
tokColor TKeyword = "#ff3b1a"
tokColor TOperator = "#ff8a5c"
tokColor TString = "#a7e3a3"
tokColor TNumber = "#d9c97a"
tokColor TComment = "#5a6478"
tokColor TBrace = "#8a94a8"
tokColor TIdent = "#c8cdd9"
tokColor TPlain = "#c8cdd9"

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
          let
            ch = fromMaybe "" (CU.singleton <$> CU.charAt i input)
          in
            go (i + 1) (acc <> [ { kind: TPlain, text: ch } ])

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
    pref <-
      if startsWith "//" s then Just "//"
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
          Just '"' -> CU.take (k + 1) s
          _ -> go' (k + 1)

  tryOperator i =
    let
      s = suffix i
    in
      if startsWith "<-->" s then Just { kind: TOperator, text: "<-->" }
      else if startsWith "<->" s then Just { kind: TOperator, text: "<->" }
      else if startsWith "-->" s then Just { kind: TOperator, text: "-->" }
      else if startsWith "->" s then Just { kind: TOperator, text: "->" }
      else if startsWith "<-" s then Just { kind: TOperator, text: "<-" }
      else Nothing

  tryBrace i = case CU.charAt i input of
    Just '{' -> Just { kind: TBrace, text: "{" }
    Just '}' -> Just { kind: TBrace, text: "}" }
    _ -> Nothing

  tryPlusKw i = do
    let s = suffix i
    _ <- if startsWith "+" s then Just unit else Nothing
    let
      rest = takeWhileStr isIdentChar (CU.drop 1 s)
      full = "+" <> rest
    if rest == "node" || rest == "edge" || rest == "group" then Just { kind: TKeyword, text: full }
    else Nothing

  tryNumber i = do
    let s = suffix i
    _ <- case CU.charAt 0 s of
      Just c | isDigit c -> Just unit
      _ -> Nothing
    let
      whole = takeWhileStr isDigit s
      afterWhole = CU.drop (CU.length whole) s
      frac =
        if startsWith "." afterWhole then "." <> takeWhileStr isDigit (CU.drop 1 afterWhole)
        else ""
    pure { kind: TNumber, text: whole <> frac }

  tryIdent i = do
    let s = suffix i
    _ <- case CU.charAt 0 s of
      Just c | isIdentStart c -> Just unit
      _ -> Nothing
    let
      word = takeWhileStr isIdentChar s
      kind = if isKeyword word then TKeyword else TIdent
    pure { kind, text: word }

  isKeyword w =
    w == "seed" || w == "frame" || w == "par"
      || w == "chain"
      || w == "group"
      || w == "layout"

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
startsWith pref s = CU.take (CU.length pref) s == pref

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
  div { className: "inline-flex items-center gap-3 bg-[#11162280] backdrop-blur-md border border-[#2a3142] rounded-full pl-5 pr-2 py-2 font-mono text-sm pointer-events-auto" }
    [ span { style: css { color: "#ff3b1a" } } [ text "$" ]
    , span { className: "text-[#f5f1e8]" } [ text "brew install markgrafhq/tap/markgraf" ]
    , button
        { type: "button"
        , className: "ml-2 text-[10px] uppercase tracking-[0.2em] text-[#8a94a8] hover:text-[#f5f1e8] transition-colors px-3 py-1.5 rounded-full bg-[#0a0e1a] border border-[#2a3142] cursor-pointer"
        }
        [ text "copy" ]
    ]

playerSection :: JSX
playerSection =
  H.section
    { id: "player"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "02 / player"
        , h2
            { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] mb-6 max-w-3xl"
            , style: css { fontFamily: "'Sinistre', serif" }
            }
            "Native macOS player."
        , p { className: "text-base text-[#8a94a8] max-w-2xl leading-relaxed mb-10" }
            "Swift, Metal, AppKit. Opens .markgraf files, plays them, hot-reloads on save."
        , div { className: "grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6" }
            [ featureRow "Drag-and-drop reload" "Drop a .markgraf file on the window. Edit in your editor of choice; the player picks up saves instantly."
            , featureRow "Scrub bar" "Drag along the timeline to step through frames. Pause, rewind, hold on any moment."
            , featureRow "Glass backdrop" "Vibrant blur over your desktop so the diagram floats. Looks at home next to your editor."
            , featureRow "Pipe straight in" "pbpaste | markgraf --play opens a window without touching the filesystem."
            ]
        ]
    , spreadFolio "02" "player"
    ]

featureRow :: String -> String -> JSX
featureRow heading body =
  div { className: "flex flex-col gap-1.5" }
    [ div { className: "font-mono text-xs uppercase tracking-[0.2em] text-[#ff3b1a]" } heading
    , p { className: "text-sm text-[#c8cdd9] leading-relaxed" } body
    ]

renderSection :: JSX
renderSection =
  H.section
    { id: "render"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "03 / render"
        , h2
            { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] mb-6 max-w-3xl"
            , style: css { fontFamily: "'Sinistre', serif" }
            }
            "mp4, SVG, GIF, or sequence diagram."
        , p { className: "text-base text-[#8a94a8] max-w-2xl leading-relaxed mb-10" }
            "mp4, animated SVG, gif, or a static sequence diagram. ffmpeg is statically linked, so mp4 works on a fresh machine with nothing else installed."
        , div { className: "grid grid-cols-2 md:grid-cols-3 gap-4" }
            [ renderCard "--play" "native macOS player"
            , renderCard "-o out.mp4" "mp4 — ffmpeg embedded"
            , renderCard "--svg" "animated svg — vector"
            , renderCard "--gif" "keyframe gif"
            , renderCard "--sequence" "static sequence diagram"
            , renderCard "--check" "typecheck without rendering"
            ]
        ]
    , spreadFolio "03" "render"
    ]

renderCard :: String -> String -> JSX
renderCard flag desc =
  div { className: "bg-[#11162260] backdrop-blur-sm border border-[#2a3142] rounded-lg p-5 hover:border-[#ff3b1a] hover:bg-[#1a1f2e] transition-colors cursor-default" }
    [ div { className: "font-mono text-[#ff3b1a] text-sm mb-2" } flag
    , div { className: "text-[#c8cdd9] text-sm" } desc
    ]

aiSection :: JSX
aiSection =
  H.section
    { id: "ai"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "04 / ai authoring"
        , h2
            { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] mb-6 max-w-3xl"
            , style: css { fontFamily: "'Sinistre', serif" }
            }
            "Claude writes the diagram."
        , p { className: "text-base text-[#8a94a8] max-w-2xl leading-relaxed mb-10" }
            [ text "A Claude Code plugin teaches Claude the syntax and authoring rules. You describe the system in plain English, Claude produces the "
            , inlineCode ".markgraf"
            , text " source."
            ]
        , div { className: "flex flex-col gap-3 max-w-2xl" }
            [ aiCommand "/plugin marketplace add i-am-the-slime/claude-plugins"
            , aiCommand "/plugin install markgraf@i-am-the-slime"
            ]
        ]
    , spreadFolio "04" "ai"
    ]

embedSection :: JSX
embedSection =
  H.section
    { id: "embed"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "05 / integrations"
        , h2
            { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] mb-6 max-w-3xl"
            , style: css { fontFamily: "'Sinistre', serif" }
            }
            "GitHub and docs sites."
        , p { className: "text-base text-[#8a94a8] max-w-2xl leading-relaxed mb-10" }
            [ text "The same "
            , inlineCode "```markgraf"
            , text " block plays in your README and in your docs."
            ]
        , div { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }
            [ embedCard "GitHub integration" "Browser extension that renders markgraf code blocks inline on github.com."
            , embedCard "Docs plugins" "Docusaurus, Astro Starlight, MkDocs."
            ]
        ]
    , spreadFolio "05" "integrations"
    ]

playSection :: JSX
playSection =
  H.section
    { id: "play"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "06 / play"
        , h2
            { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] mb-6 max-w-3xl"
            , style: css { fontFamily: "'Sinistre', serif" }
            }
            "Trace any shape."
        , p { className: "text-base text-[#8a94a8] max-w-2xl leading-relaxed" }
            "Balls follow the play-button outline. Swap the path and the swarm traces anything — SVG next."
        ]
    , spreadFolio "06" "play"
    ]

embedCard :: String -> String -> JSX
embedCard heading body =
  div { className: "bg-[#11162260] backdrop-blur-sm border border-[#2a3142] rounded-lg p-6 hover:border-[#ff3b1a] hover:bg-[#1a1f2e] transition-colors cursor-default" }
    [ div { className: "font-mono text-xs uppercase tracking-[0.2em] text-[#ff3b1a] mb-3" } heading
    , p { className: "text-sm text-[#c8cdd9] leading-relaxed" } body
    ]

aiCommand :: String -> JSX
aiCommand cmd =
  pre { className: "bg-[#11162280] backdrop-blur-sm border border-[#2a3142] rounded-lg px-5 py-4 text-sm leading-relaxed text-[#c8cdd9] font-mono overflow-x-auto" }
    [ H.code {} cmd ]

inlineCode :: String -> JSX
inlineCode source =
  H.code
    { className: "font-mono text-[#ff3b1a] bg-[#11162280] border border-[#2a3142] rounded px-1.5 py-0.5 text-[0.85em]" }
    [ text source ]

footerSection :: JSX
footerSection =
  H.section
    { id: "install"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full flex flex-col gap-10" }
        [ sectionLabel "06 / install"
        , div { className: "flex flex-col gap-6" }
            [ h2
                { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95] max-w-3xl"
                , style: css { fontFamily: "'Sinistre', serif" }
                }
                "Install"
            , div {} [ installPill ]
            ]
        , div { className: "flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#8a94a8] font-mono pt-8 border-t border-[#1a1f2e]" }
            [ footerLink "https://github.com/markgrafhq/homebrew-tap" "tap"
            , footerLink "https://github.com/markgrafhq/homebrew-tap/tree/main/examples" "examples"
            , footerLink "https://github.com/i-am-the-slime/claude-plugins" "claude plugin"
            , footerLink "https://discord.gg/tKfGrPYx" "discord"
            ]
        ]
    , spreadFolio "07" "install"
    ]

footerLink :: String -> String -> JSX
footerLink href label =
  a { href, className: "hover:text-[#f5f1e8] transition-colors" } label

-- ---------------------------------------------------------------------------
-- Lab pages — experimental magazine typesetting. Non-destructive, appended at
-- the bottom of the magazine so existing sections are untouched. Each one
-- tries a different idea: three-column body, pull-quote spread, hanging
-- asymmetric headline.
--
-- Each lab uses framer-motion variants to fade-and-rise its top-level blocks
-- when the section enters the viewport. The page is snap-mandatory, so the
-- animation replays on every re-entry, which is the desired behaviour.
-- ---------------------------------------------------------------------------

parentVariants :: Motion.Variants
parentVariants = Motion.variants
  { hidden: {}
  , show: { transition: { staggerChildren: 0.06, delayChildren: 0.0 } }
  }

itemVariants :: Motion.Variants
itemVariants = Motion.variants
  { hidden: { y: 18.0 }
  , show:
      { y: 0.0
      , transition:
          { type: "spring"
          , stiffness: 220.0
          , damping: 22.0
          , mass: 0.6
          }
      }
  }

-- Drop through createMotionElement directly so we can pass `viewport` —
-- not exposed in the typed MotionBaseAttributes binding. `amount: 0.5` waits
-- until the section is half in view (snap settles), so the stagger doesn't
-- run while the page is still mid-scroll.
labStage :: String -> Array JSX -> JSX
labStage cls kids =
  Motion.createMotionElement "div"
    { className: cls
    , initial: Motion.initial (VariantLabel "hidden")
    , whileInView: Motion.whileInView (VariantLabel "show")
    , viewport: { amount: 0.5, once: false }
    , variants: parentVariants
    }
    kids

labItem :: String -> Array JSX -> JSX
labItem cls kids =
  Motion.div
    { className: cls
    , variants: itemVariants
    }
    kids

labColumnsSection :: JSX
labColumnsSection =
  H.section
    { id: "lab-columns"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10 px-6 sm:px-12 py-16"
    }
    [ labStage "max-w-[min(96rem,94vw)] mx-auto w-full h-full flex flex-col justify-center gap-12"
        [ labItem "" [ sectionLabel "lab-a / three columns" ]
        , labItem "" $
            [ h2
                { className: "text-[10vw] sm:text-[6.5vw] leading-[0.88] tracking-[-0.03em] font-bold max-w-[14ch]"
                , style: css { fontFamily: "'Sinistre', serif" }
                }
                "A few words, a thousand pictures."
            ]
        , labItem "columns-1 sm:columns-2 lg:columns-3 gap-10 text-[15px] leading-[1.6] text-[#c8cdd9]"
            [ p
                { className: "mb-4"
                , style: css { fontFamily: "'Ilisarniq', sans-serif" }
                }
                [ text "Write the edges. The compiler does the rest. Layout, morphs, camera — all from a few lines of text." ]
            , p
                { className: "mb-4"
                , style: css { fontFamily: "'Ilisarniq', sans-serif" }
                }
                [ text "It reads a fenced block. It writes an SVG and a timeline. The player runs the timeline back like a short film. Pause it. Scrub it. Play it again." ]
            , p
                { className: "mb-4"
                , style: css { fontFamily: "'Ilisarniq', sans-serif" }
                }
                [ text "The same source runs in your README. In your docs. In your slides. No frames. No tweens. No design tools." ]
            ]
        ]
    , spreadFolio "lab-a" "three-columns"
    ]

labQuoteSection :: JSX
labQuoteSection =
  H.section
    { id: "lab-quote"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10 px-6 sm:px-12 py-16 flex items-center"
    }
    [ labStage "max-w-[min(96rem,94vw)] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-10"
        [ labItem "md:col-span-8 flex flex-col gap-10"
            [ sectionLabel "lab-b / pull-quote"
            , div
                { className: "text-[9vw] sm:text-[6vw] leading-[0.95] tracking-[-0.02em] font-bold"
                , style: css { fontFamily: "'Sinistre', serif" }
                }
                [ text "“Pictures should move. Words should not.”" ]
            ]
        , labItem "md:col-span-4 md:pt-32 flex flex-col gap-6 max-w-[28ch]"
            [ div { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff3b1a] pb-3 border-b border-[#2a3142]" }
                [ text "On motion" ]
            , p { className: "text-[15px] leading-[1.6] text-[#c8cdd9]" }
                [ text "A still picture asks the reader to do the work. A moving one explains itself. The node arrives. The edge resolves. The cluster settles." ]
            , p { className: "text-[15px] leading-[1.6] text-[#c8cdd9]" }
                [ text "Motion is the medium. The still frame is the fallback." ]
            ]
        ]
    , spreadFolio "lab-b" "pull-quote"
    ]

labHangSection :: JSX
labHangSection =
  H.section
    { id: "lab-hang"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10 px-6 sm:px-12 py-16"
    }
    [ labStage "max-w-[min(96rem,94vw)] mx-auto w-full h-full grid grid-cols-12 gap-6 items-center"
        [ labItem "col-span-12 md:col-span-7 flex flex-col gap-10"
            [ sectionLabel "lab-c / hang"
            , h2
                { className: "text-[14vw] sm:text-[9vw] leading-[0.88] tracking-[-0.035em] font-bold -ml-1"
                , style: css { fontFamily: "'Sinistre', serif" }
                }
                "Markgraf."
            , p
                { className: "text-[22px] sm:text-[26px] leading-[1.35] max-w-[28ch] italic text-[#e8e4d8]"
                , style: css { fontFamily: "'Sinistre', serif", fontWeight: "300" }
                }
                [ text "A short language for short films." ]
            ]
        , labItem "col-span-12 md:col-span-4 md:col-start-9 flex flex-col gap-4"
            [ div { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff3b1a] pb-3 border-b border-[#2a3142]" }
                [ text "Standfirst" ]
            , p { className: "text-[15px] leading-[1.6] text-[#c8cdd9]" }
                [ text "The compiler is small. You can read it in an afternoon. It draws the rest of your documentation." ]
            , p { className: "text-[15px] leading-[1.6] text-[#c8cdd9]" }
                [ text "It runs on the command line. It runs in the browser. It runs inside Claude. Same source. Same film." ]
            ]
        ]
    , spreadFolio "lab-c" "hang"
    ]

-- Editorial glyphs used as marginalia / section ornaments. Stark, monochrome,
-- 24px boxes — no library, just hand-drawn paths so they sit alongside Sinistre
-- without fighting it.
glyph :: String -> JSX
glyph kind =
  svg
    { width: "28"
    , height: "28"
    , viewBox: "0 0 24 24"
    , fill: "none"
    , stroke: "currentColor"
    , strokeWidth: "1.5"
    , strokeLinecap: "square"
    }
    case kind of
      "asterisk" ->
        [ path { d: "M12 4v16M4 12h16M5.6 5.6l12.8 12.8M5.6 18.4l12.8-12.8" } noJSX ]
      "arrow" ->
        [ path { d: "M4 12h16M14 6l6 6-6 6" } noJSX ]
      "ring" ->
        [ path { d: "M12 4a8 8 0 100 16 8 8 0 000-16z" } noJSX ]
      "square" ->
        [ path { d: "M4 4h16v16H4z" } noJSX ]
      "plus" ->
        [ path { d: "M12 4v16M4 12h16" } noJSX ]
      _ ->
        [ path { d: "M4 12h16" } noJSX ]

labIconsSection :: JSX
labIconsSection =
  H.section
    { id: "lab-icons"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10 px-6 sm:px-12 py-16"
    }
    [ labStage "max-w-[min(96rem,94vw)] mx-auto w-full h-full flex flex-col justify-center gap-14"
        [ labItem "" [ sectionLabel "lab-d / iconography" ]
        , labItem "grid grid-cols-12 gap-10 items-start"
            [ div { className: "col-span-12 md:col-span-7" }
                [ h2
                    { className: "text-[10vw] sm:text-[6vw] leading-[0.9] tracking-[-0.025em] font-bold max-w-[12ch]"
                    , style: css { fontFamily: "'Sinistre', serif" }
                    }
                    "Marks in the margin."
                ]
            , div { className: "col-span-12 md:col-span-4 md:col-start-9 flex flex-col gap-3" }
                [ div { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff3b1a] pb-3 border-b border-[#2a3142]" }
                    [ text "Note" ]
                , p { className: "text-[15px] leading-[1.6] text-[#c8cdd9]" }
                    [ text "A glyph carries weight. Use it once. Use it well." ]
                ]
            ]
        , labItem "grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#2a3142] border border-[#2a3142]"
            [ iconCard "asterisk" "Layout" "ELK does the math. You write the edges."
            , iconCard "arrow" "Morphs" "Nodes arrive. Edges resolve. The picture lands."
            , iconCard "ring" "Camera" "Each section gets an arm. The arm picks the frame."
            ]
        ]
    , spreadFolio "lab-d" "iconography"
    ]

iconCard :: String -> String -> String -> JSX
iconCard kind heading body =
  div { className: "bg-[#0a0e1a] p-8 flex flex-col gap-6 min-h-[180px]" }
    [ div { className: "text-[#ff3b1a]" } [ glyph kind ]
    , div { className: "flex flex-col gap-2" }
        [ div
            { className: "text-2xl font-bold tracking-tight"
            , style: css { fontFamily: "'Sinistre', serif" }
            }
            [ text heading ]
        , p { className: "text-[14px] leading-[1.5] text-[#8a94a8]" }
            [ text body ]
        ]
    ]

labPhotoSection :: JSX
labPhotoSection =
  H.section
    { id: "lab-photo"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10"
    }
    [ labStage "absolute inset-0 grid grid-cols-12"
        [ labItem "col-span-12 md:col-span-7 relative bg-[#11162a] overflow-hidden"
            [ img
                { src: "/markgraf-www/mascot/christoph-source.png"
                , alt: "Christoph"
                , className: "absolute inset-0 w-full h-full object-cover grayscale contrast-125"
                , style: css { filter: "grayscale(1) contrast(1.15)" }
                }
            , div
                { className: "absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#f5f1e8]/70"
                }
                [ text "fig. 01 — christoph, source" ]
            ]
        , labItem "col-span-12 md:col-span-5 flex flex-col justify-center px-8 sm:px-12 py-12 gap-10"
            [ sectionLabel "lab-e / photo"
            , h2
                { className: "text-[9vw] sm:text-[5vw] leading-[0.9] tracking-[-0.025em] font-bold"
                , style: css { fontFamily: "'Sinistre', serif" }
                }
                "The mascot."
            , div { className: "flex flex-col gap-4 max-w-[34ch]" }
                [ p
                    { className: "text-[18px] leading-[1.5] text-[#e8e4d8] italic"
                    , style: css { fontFamily: "'Sinistre', serif", fontWeight: "300" }
                    }
                    [ text "His name is Christoph. He keeps the source." ]
                , p { className: "text-[15px] leading-[1.6] text-[#c8cdd9]" }
                    [ text "He does not draw. He does not animate. He waits for the compiler. The compiler does the work." ]
                ]
            ]
        ]
    , spreadFolio "lab-e" "photo"
    ]

-- Mirror of lab-c: skinny editorial sidebar hard-left, headline hangs right.
labRightHangSection :: JSX
labRightHangSection =
  H.section
    { id: "lab-right-hang"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10 px-6 sm:px-12 py-16"
    }
    [ labStage "max-w-[min(96rem,94vw)] mx-auto w-full h-full grid grid-cols-12 gap-6 items-center"
        [ labItem "col-span-12 md:col-span-3 flex flex-col gap-6 md:pr-6 md:border-r border-[#2a3142]"
            [ sectionLabel "lab-f / right hang"
            , div { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-[#8a94a8] flex flex-col gap-1" }
                [ div {} [ text "Issue 01" ]
                , div {} [ text "Spring 2026" ]
                , div {} [ text "Berlin" ]
                ]
            , p
                { className: "text-[15px] leading-[1.55] text-[#c8cdd9] max-w-[24ch]"
                , style: css { fontFamily: "'Ilisarniq', sans-serif" }
                }
                [ text "A short note on what the compiler does. And what it refuses to do." ]
            , div { className: "h-px w-12 bg-[#ff3b1a]" } noJSX
            , div { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6478]" }
                [ text "by mark" ]
            ]
        , labItem "col-span-12 md:col-span-9 flex flex-col gap-10"
            [ h2
                { className: "text-[14vw] sm:text-[9vw] leading-[0.88] tracking-[-0.035em] font-bold"
                , style: css { fontFamily: "'Sinistre', serif" }
                }
                "It draws. You write."
            , p
                { className: "text-[20px] sm:text-[24px] leading-[1.4] max-w-[32ch] italic text-[#e8e4d8]"
                , style: css { fontFamily: "'Sinistre', serif", fontWeight: "300" }
                }
                [ text "The compiler keeps its promises. The picture moves on its own." ]
            ]
        ]
    , spreadFolio "lab-f" "right-hang"
    ]

sectionLabel :: String -> JSX
sectionLabel label = element sectionLabelComponent { label }

foreign import sectionLabelComponent :: ReactComponent { label :: String }
foreign import sceneComponent :: ReactComponent {}
foreign import feltballsComponent :: ReactComponent {}
foreign import markgrafPlayerImpl :: forall a. ReactComponent { | a }

markgrafPlayer
  :: forall props props_
   . Union props props_
       ( src :: String
       , renderer :: String
       , theme :: String
       , transparent :: Boolean
       , width :: Number
       , height :: Number
       )
  => { | props }
  -> JSX
markgrafPlayer = element markgrafPlayerImpl

foreign import lookupNode :: String -> Effect (Nullable Node)

foreign import onElementResize :: String -> ({ w :: Number, h :: Number } -> Effect Unit) -> Effect (Effect Unit)
foreign import onIntersect :: String -> (Boolean -> Effect Unit) -> Effect (Effect Unit)
foreign import installScrollSync :: String -> String -> Effect (Effect Unit)
foreign import installVhsBurst :: String -> Effect (Effect Unit)

-- The magazine boots in snap-mandatory (best for trackpads). The first time we
-- see a real mouse wheel event we relax it to snap-proximity, so wheel users
-- get free-form scrolling with a gentle pull near each section instead of
-- being forced through one viewport per click.
onMouseWheelDetected :: Effect Unit -> Effect (Effect Unit)
onMouseWheelDetected = onMouseWheelDetectedImpl

foreign import onMouseWheelDetectedImpl
  :: Effect Unit -> Effect (Effect Unit)

swapClassUnder :: String -> String -> String -> Effect Unit
swapClassUnder = swapClassUnderImpl

foreign import swapClassUnderImpl
  :: String -> String -> String -> Effect Unit

swapClassOn :: String -> String -> String -> Effect Unit
swapClassOn = swapClassOnImpl

foreign import swapClassOnImpl
  :: String -> String -> String -> Effect Unit

installWheelSnap :: Effect (Effect Unit)
installWheelSnap = onMouseWheelDetected relaxSnap
  where
  relaxSnap = do
    swapClassOn "magazine" "snap-mandatory" "snap-proximity"
    swapClassUnder "magazine" "snap-always" "snap-normal"

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
    Just sect -> do
      last <- readRef activeRef
      when (sect.id /= last) do
        writeRef activeRef sect.id
        postWorkerMessage "morph" sect.morph
        postWorkerMessage "camera" sect.camera
        postWorkerMessage "formation" sect.formation

mostVisible
  :: Array { id :: String, ratio :: Number }
  -> Maybe { id :: String, ratio :: Number }
mostVisible = Array.foldl pick Nothing
  where
  pick Nothing x = Just x
  pick (Just best) x = Just (if x.ratio > best.ratio then x else best)

observeRatios
  :: String
  -> Array String
  -> (String -> Number -> Effect Unit)
  -> Effect (Effect Unit)
observeRatios root ids cb = observeRatiosImpl root ids cb

postWorkerMessage :: forall a. String -> a -> Effect Unit
postWorkerMessage = postWorkerMessageImpl

foreign import observeRatiosImpl
  :: String
  -> Array String
  -> (String -> Number -> Effect Unit)
  -> Effect (Effect Unit)

foreign import postWorkerMessageImpl :: forall a. String -> a -> Effect Unit

onMagazineScroll
  :: ({ x :: Number, y :: Number, progress :: Number } -> Effect Unit)
  -> Effect (Effect Unit)
onMagazineScroll = onMagazineScrollImpl

foreign import onMagazineScrollImpl
  :: ({ x :: Number, y :: Number, progress :: Number } -> Effect Unit)
  -> Effect (Effect Unit)
