module Component.HeroPreview (mkHeroPreview) where

import Prelude

import Data.Array as Array
import Data.Foldable (for_, traverse_)
import Data.Int as Int
import Data.Maybe (Maybe(..), fromMaybe, maybe)
import Data.Newtype (un)
import Data.Options ((:=))
import Data.Traversable (traverse)
import Effect.Random (random)
import Effect.Ref as Ref
import Effect.Timer (clearTimeout, setTimeout)
import Data.String.CodeUnits as CU
import Data.Tuple.Nested (type (/\), (/\))
import Effect (Effect)
import Effect.Aff (Aff, Milliseconds(..), delay, launchAff_)
import Effect.Class (liftEffect)
import Effect.Uncurried (mkEffectFn1)
import Effect.Unsafe (unsafePerformEffect)
import Data.Nullable (Nullable, null)
import Data.String.Common (joinWith, toUpper)
import DiagramShapes.Offscreen as DiagramShapes
import Foreign (unsafeToForeign)
import Component.InstallButtonLazy (installButtonLazy)
import Component.LabSectionsLazy (labSectionsLazy)
import Component.PlayerLazy (markgrafPlayerLazy)
import Motion.Lazy (domAnimation, lazyMotion)
import Motion.Element as Motion
import Motion.Types as Motion
import Motion.Value (MotionValue)
import Motion.Value as MV
import React.Basic (JSX, ReactComponent, element, keyed)
import React.Basic.Events (EventHandler, handler_)
import Unsafe.Coerce (unsafeCoerce)
import React.Basic.Hooks (Component, Ref, component, reactComponent, readRef, readRefMaybe, useEffectOnce, useEffect, useRef, useState', writeRef)
import React.Basic.Hooks as Hooks
import Untagged.Castable (cast)
import Web.DOM.DOMTokenList as DOMTokenList
import Web.DOM.Document as Document
import Web.DOM.Element as Element
import Web.DOM.HTMLCollection as HTMLCollection
import Web.DOM.ClassName (ClassName(..))
import Web.DOM.ElementId (ElementId(..))
import Web.DOM.NonElementParentNode (getElementById)
import Web.Event.Event (EventType(..))
import Web.Event.EventTarget (addEventListenerWithOptions, eventListener, removeEventListener)
import Web.HTML (window)
import Web.HTML.HTMLDocument as HTMLDocument
import Web.HTML.HTMLDocument (toNonElementParentNode)
import Web.HTML.Window as Window
import Web.HTML.Window (document)
import Web.Intersection.Observer as IO
import Web.Intersection.Observer.Options as IO
import Web.ResizeObserver as RO
import Yoga.React.DOM.Attributes (reactRef)
import Yoga.React.DOM.Attributes.AutoCapitalize (autoCapitalizeOff)
import Yoga.React.DOM.HTML.A (a)
import Yoga.React.DOM.HTML.Button (button)
import Yoga.React.DOM.HTML.Code (code) as H
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.HTML.H (h1, h2)
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
  postRef <- useRef (Nothing :: Maybe DiagramShapes.WorkerPost)
  activeSection /\ setActiveSection <- useState' "page-hero"
  sceneLit /\ setSceneLit <- useState' false
  useEffectOnce $ installVhsBurst "vhs-text-wrap"
  useEffectOnce $ onWordmarkLit (setSceneLit true)
  useEffectOnce $
    observeRatios "magazine" (_.id <$> sectionStates) \id ratio -> do
      ratios <- readRef ratiosRef
      let ratios' = Array.snoc (Array.filter (\x -> x.id /= id) ratios) { id, ratio }
      writeRef ratiosRef ratios'
      case mostVisible ratios' of
        Just best -> setActiveSection best.id
        Nothing -> pure unit
      dispatchActive postRef activeRef ratios'
  pure $ lazyMotion { features: domAnimation }
    [ main
        { id: "magazine"
        , className: "relative bg-[#0f0f0f] text-[#f5f1e8] h-screen overflow-y-scroll snap-y snap-mandatory"
        }
        [ diagramShapesBackground postRef sceneLit
        , scrim (activeSection == "playground")
        , sideNav { active: activeSection }
        , heroPage
        , playground { section: activeSection }
        , integrationsSection
        , renderSection
        , aiSection
        , embedSection
        , playSection
        , footerSection
        , labSectionsLazy { sectionLabel, spreadFolio }
        , navArrows { active: activeSection }
        , crtOverlay
        ]
    ]

-- Fixed full-viewport layer that the offscreen WebGL canvas paints into. Sits
-- behind every section so per-section camera arms + ball morphs are visible
-- as the user scrolls between spreads.
-- Held dark until the wordmark's neon catches, then faded up — so the title
-- strikes on against black and the world powers up behind it. The worker is
-- mounted from the start (its per-section poses still land); only the reveal
-- waits on `lit`.
diagramShapesBackground :: Ref (Maybe DiagramShapes.WorkerPost) -> Boolean -> JSX
diagramShapesBackground postRef lit =
  div
    { className:
        "fixed inset-0 z-0 pointer-events-none transition-opacity duration-[1200ms] ease-out "
          <> if lit then "opacity-100" else "opacity-0"
    }
    [ element diagramShapesComponent { postRef } ]

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
stream = zero

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
  , { id: "integrations"
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
    [ heroLockup
    , div { className: "absolute left-8 bottom-16 z-20" } [ heroInstallCta ]
    , spreadFolio "00" "hero"
    ]

heroLockup :: JSX
heroLockup =
  div { className: "absolute inset-0 z-10 flex flex-col items-center justify-start pt-[12vh] pointer-events-none px-6" }
    [ div { className: "flex flex-col items-center gap-[clamp(1.5rem,4vw,4rem)] max-w-[min(64rem,92vw)] text-center" }
        [ h1
            { className: "display-glow hero-wordmark-in vhs-text-wrap text-[clamp(2.1875rem,10vw,8.75rem)] leading-[0.82] tracking-[-0.045em] font-bold"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            [ span
                { className: "vhs-text"
                , style: css { "--vhs-text": "\"markgraf\"" }
                }
                [ text "markgraf" ]
            ]
        , heroTagline
        ]
    ]

-- The hero's call to action is the raymarched SDF button: a grey glassy shape
-- morphing through markgraf's node silhouettes with the INSTALL text baked in,
-- gas-filling on hover. The shape is the button; clicking it rides the scroll-
-- snap magazine down to the install spread, same as the side nav.
heroInstallCta :: JSX
heroInstallCta = installButtonLazy

-- The tagline types itself in once the wordmark has caught: each word is its own
-- inline-block carrying a staggered animation-delay, so the line resolves left to
-- right rather than appearing whole. Delays start past the wordmark's settle and
-- step per word; the CSS (.hero-tagline-word) and reduced-motion fallback live in
-- globals.css.
heroTagline :: JSX
heroTagline =
  p
    { className: "max-w-[34ch] text-[clamp(1.125rem,2.2vw,2rem)] leading-snug text-[#f5f1e8]"
    , style: css
        { fontFamily: "'Ilisarniq', 'Ilisarniq Fallback', ui-sans-serif, system-ui, sans-serif"
        , textShadow: "0 1px 2px rgba(10,14,26,0.95), 0 0 18px rgba(10,14,26,0.92), 0 0 44px rgba(10,14,26,0.75)"
        }
    }
    (Array.concat (Array.mapWithIndex reveal words))
  where
  words = [ "A", "few", "words", "are", "worth", "a", "thousand", "pictures." ]
  reveal i w =
    [ span
        { className: "hero-tagline-word"
        , style: css { animationDelay: show (2700 + i * 120) <> "ms" }
        }
        [ text w ]
    , text " "
    ]

-- ---------------------------------------------------------------------------
-- Fixed chrome: top bar with brand + nav, side rail with page dots.
-- ---------------------------------------------------------------------------

-- Nav turned on its side: a full-height column hugging the right edge whose
-- single link row is rotated a quarter turn, so the labels run top-to-bottom
-- and read naturally with a head-tilt to the right. Hidden on phones, where the
-- nav arrows alone carry section navigation.
sideNav :: { active :: String } -> JSX
sideNav { active } =
  nav { className: "fixed right-0 inset-y-0 z-30 w-14 hidden sm:flex items-center justify-center pointer-events-none" }
    [ div
        { className: "flex items-center gap-8 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.28em] pointer-events-auto"
        , style: css { transform: "rotate(90deg)" }
        }
        -- A clockwise quarter-turn sends the first child to the top, so the
        -- labels lay out top-to-bottom in scroll order with no reversal.
        (navLink active <$> sections)
    ]
  where
  sections =
    [ "playground" /\ "playground"
    , "integrations" /\ "integrations"
    , "render" /\ "render"
    , "ai" /\ "ai"
    , "embed" /\ "integrations"
    , "play" /\ "play"
    , "install" /\ "install"
    ]

-- The active section's label goes bold red, the rest stay muted — the same
-- accent the page-dot rail uses, so both chrome rails agree on where you are.
navLink :: String -> String /\ String -> JSX
navLink active (sectionId /\ label) =
  a
    { href: "#" <> sectionId
    , className:
        "transition-colors hover:text-[#f5f1e8] "
          <> if active == sectionId then "text-[#ff3b1a] font-bold" else "text-[#8a94a8]"
    }
    [ text label ]

-- CRT scanlines, lifted out of the offscreen canvas's grain shader into a
-- top-level DOM layer so they ride above everything — the floating player and
-- the side nav included, which a section-scoped layer never could. The lines
-- loop slowly top-to-bottom (see .crt-overlay in globals.css).
crtOverlay :: JSX
crtOverlay =
  div { className: "fixed inset-0 z-[60] pointer-events-none crt-overlay" } noJSX

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
  -- Must start at 0 to agree with onMagazineScroll's lastXRef (also 0): the
  -- first `fire` derives the pane's natural centre from `r.left - lastX`, so a
  -- nonzero initial x here would over-correct the horizontal offset by that
  -- amount on first paint (shoving the hero player off-screen until a scroll).
  xMv <- MV.useMotionValue 0.0
  yMv <- MV.useMotionValue 0.0
  scaleMv <- MV.useMotionValue 1.0
  useEffect src do
    launchAff_ do
      delay (Milliseconds 250.0)
      setDebounced src # liftEffect
    pure (pure unit)
  useEffect unit do
    onElementResize "markgraf-preview" setSize
  useEffect unit do
    installScrollSync "mg-textarea" "mg-pre"
  useEffect unit do
    onMagazineScroll \p -> do
      MV.set p.x xMv
      MV.set p.y yMv
      MV.set p.scale scaleMv
  useEffect debounced do
    setGen (gen + 1)
    pure (pure unit)
  pure (playgroundView { src, setSrc, rendered: debounced, size, visible: true, active, setActive, gen, section, xMv, yMv, scaleMv })

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
  , scaleMv :: MotionValue Number
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
                    { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] max-w-[20ch]"
                    , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
                    }
                    "Try markgraf"
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
                if active == SourcePane then "bg-[#ff3b1a] border-[#ff3b1a] text-[#0f0f0f]"
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
        "grid gap-px grid-cols-1 sm:grid-cols-2 w-full max-w-[min(92vw,1640px)] mx-auto h-[60vh] sm:h-[clamp(520px,56vh,800px)]"
    }
    [ editorPane pp.src pp.setSrc (pp.active == SourcePane)
    , Motion.div
        { style: css { x: pp.xMv, y: pp.yMv, scale: pp.scaleMv }
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
        [ playerReveal ]
  where
  player =
    markgrafPlayerLazy
      { src
      , renderer: "svg"
      , theme: "dark"
      , transparent: true
      , width: size.w
      , height: size.h
      }
      # Monoid.guard (visible && size.w > 0.0 && size.h > 0.0)
  -- The graph holds back until the wordmark has settled, then fades in cleanly
  -- (.player-reveal). No flicker, no overlay — just a late reveal.
  playerReveal =
    div
      { className: "player-reveal pointer-events-none"
      , style: css { position: "absolute", inset: "0" }
      }
      [ keyed (show gen) player ]

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
tokColor TString = "#5b8fd6"
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
        { next } -> do
          let ch = fromMaybe "" (CU.singleton <$> CU.charAt i input)
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
    if startsWith "<-->" s then Just { kind: TOperator, text: "<-->" }
    else if startsWith "<->" s then Just { kind: TOperator, text: "<->" }
    else if startsWith "-->" s then Just { kind: TOperator, text: "-->" }
    else if startsWith "->" s then Just { kind: TOperator, text: "->" }
    else if startsWith "<-" s then Just { kind: TOperator, text: "<-" }
    else Nothing
    where
    s = suffix i

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
  div { className: "inline-flex items-center gap-3 bg-[#11162280] backdrop-blur-md border border-[#2a3142] rounded-full pl-5 pr-2 py-2 font-mono text-[clamp(0.875rem,1.4vw,1.25rem)] pointer-events-auto" }
    [ span { style: css { color: "#ff3b1a" } } [ text "$" ]
    , span { className: "text-[#f5f1e8]" } [ text "brew install markgrafhq/tap/markgraf" ]
    , button
        { type: "button"
        , className: "ml-2 text-[10px] uppercase tracking-[0.2em] text-[#8a94a8] hover:text-[#f5f1e8] transition-colors px-3 py-1.5 rounded-full bg-[#0f0f0f] border border-[#2a3142] cursor-pointer"
        }
        [ text "copy" ]
    ]

integrationsSection :: JSX
integrationsSection =
  H.section
    { id: "integrations"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ sectionLabel "02 / integrations"
        , h2
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "Integrations"
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
            [ text "One "
            , inlineCode "```markgraf"
            , text " block, every surface you work on — docs, code review, your editor, the command line."
            ]
        , div { className: "grid grid-cols-2 md:grid-cols-3 gap-4" }
            [ embedCard "GitHub" "Chrome extension renders markgraf blocks inline on github.com."
            , embedCard "MkDocs" "Python plugin — ```markgraf fences become live players."
            , embedCard "Starlight" "Astro Starlight docs."
            , embedCard "Astro" "Astro integration."
            , embedCard "React" "@markgrafhq/markgraf-react — drop-in component."
            , embedCard "macOS" "Native Metal player + CLI."
            , embedCard "Linux" "CLI, statically linked."
            , embedCard "Windows" "CLI."
            , embedCard "mp4" "Render to video — ffmpeg embedded, no deps."
            ]
        ]
    , spreadFolio "02" "integrations"
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
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "mp4, SVG, GIF, or sequence diagram."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
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
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "Claude writes the diagram."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
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
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "GitHub and docs sites."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed mb-10" }
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
            { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] mb-6 max-w-[min(56rem,90vw)]"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            "Trace any shape."
        , p { className: "text-base text-[#aeb7c8] max-w-2xl leading-relaxed" }
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
                { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] max-w-[min(56rem,90vw)]"
                , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
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
        , div { className: "flex flex-wrap items-baseline gap-x-8 gap-y-3 text-sm text-[#8a94a8] font-mono" }
            [ span { className: "text-[#5a6478] uppercase tracking-wider text-xs" } [ text "live demos" ]
            , footerLink "https://markgrafhq.github.io/markgraf-embed/" "embed"
            , footerLink "https://markgrafhq.github.io/markgraf-react/" "react · storybook"
            , footerLink "https://markgrafhq.github.io/mkdocs-markgraf/" "mkdocs"
            , footerLink "https://markgrafhq.github.io/docusaurus-plugin-markgraf/" "docusaurus"
            , footerLink "https://markgrafhq.github.io/starlight-markgraf/" "starlight"
            , footerLink "https://markgrafhq.github.io/markgraf-browser-extension/" "browser extension"
            ]
        ]
    , spreadFolio "07" "install"
    ]

footerLink :: String -> String -> JSX
footerLink href label =
  a { href, className: "hover:text-[#f5f1e8] transition-colors" } label

sectionLabel :: String -> JSX
sectionLabel label = element sectionLabelComponent { label }

-- | Editorial eyebrow: a short red rule that draws in left-to-right, then mono
-- | text that scrambles through random characters before settling on the real
-- | label. Re-fires every time the element scrolls into view (snap-mandatory
-- | pages retrigger on re-entry).
sectionLabelComponent :: ReactComponent { label :: String }
sectionLabelComponent = unsafePerformEffect $ reactComponent "SectionLabel" \{ label } -> Hooks.do
  let upper = toUpper label
  -- The line draws as the scramble is settling and lands on the very same beat
  -- as the last character: start it one full draw-duration before the scramble's
  -- stop, so `start + ruleDrawDuration` coincides with the text settling.
  let lastEnd = (CU.length upper - 1) * scrambleStagger + scrambleDuration
  let lineDelay = max 0.0 ((scrambleStartDelay + Int.toNumber lastEnd) / 1000.0 - ruleDrawDuration)
  nodeRef <- useRef (null :: Nullable Element.Element)
  inView /\ setInView <- useState' false
  shown /\ setShown <- useState' upper

  useEffect label $ observeInView nodeRef setInView

  useEffect (inView /\ upper) $ runScrambleWhileInView inView upper setShown

  pure $ div { className: eyebrowClass, ref: reactRef nodeRef }
    [ redRule inView lineDelay
    , span { className: "text-brand" } [ text shown ]
    ]
  where
  -- min-h reserves the row's full line height so the scramble's blank phase
  -- (label briefly set to collapsing whitespace) can't shrink the eyebrow to
  -- the 1px red rule and shunt the headline below it up and back down.
  eyebrowClass = "flex items-center gap-4 mb-8 min-h-[1.5em] font-mono text-[10px] uppercase tracking-[0.35em]"

-- The red rule draws right-to-left (origin-right) once the typing has settled,
-- then retracts immediately when out of view.
redRule :: Boolean -> Number -> JSX
redRule inView drawDelay =
  Motion.createMotionElement "span"
    { className: "h-px w-10 bg-brand block origin-right"
    , initial: { scaleX: 0.0 }
    , animate: { scaleX: if inView then 1.0 else 0.0 }
    , transition: { duration: ruleDrawDuration, delay: if inView then drawDelay else 0.0, ease: [ 0.65, 0.0, 0.35, 1.0 ] }
    }
    ([] :: Array JSX)

-- Observes the label's own node against the magazine scroller, toggling inView
-- as it crosses the halfway threshold. Returns a cleanup that unobserves.
observeInView :: Hooks.Ref (Nullable Element.Element) -> (Boolean -> Effect Unit) -> Effect (Effect Unit)
observeInView nodeRef setInView = readRefMaybe nodeRef >>= case _ of
  Nothing -> pure (pure unit)
  Just el -> do
    rootEl <- findElementById "magazine"
    let opts = IO.threshold := 0.5 <> maybe mempty (\r -> IO.root := r) rootEl
    obs <- IO.newIntersectionObserver onCross opts
    IO.observe obs el
    pure (IO.unobserve obs el)
  where
  onCross entries _ = for_ entries \e -> setInView e.isIntersecting

-- On entry, blank the text then kick off the scramble; on exit, cancel it. The
-- cancel ref lets the in-flight Aff loop bail the next time it ticks.
runScrambleWhileInView :: Boolean -> String -> (String -> Effect Unit) -> Effect (Effect Unit)
runScrambleWhileInView inView upper setShown =
  if not inView then pure (pure unit)
  else do
    cancelled <- Ref.new false
    setShown (Monoid.power " " (CU.length upper))
    launchAff_ do
      delay (Milliseconds scrambleStartDelay)
      scramble upper setShown cancelled
    pure (Ref.write true cancelled)

-- Walks the clock in fixed ticks, repainting the whole label each frame until
-- every character has settled. Bails early once the cancel ref is set.
scramble :: String -> (String -> Effect Unit) -> Ref.Ref Boolean -> Aff Unit
scramble target setShown cancelled = loop 0
  where
  lastEnd = (CU.length target - 1) * scrambleStagger + scrambleDuration

  loop elapsed = do
    stop <- Ref.read cancelled # liftEffect
    if stop then pure unit
    else tick elapsed

  tick elapsed = do
    frame <- renderFrame target elapsed' # liftEffect
    setShown frame # liftEffect
    if elapsed' >= lastEnd then setShown target # liftEffect
    else do
      delay (Milliseconds (Int.toNumber scrambleTickMs))
      loop elapsed'
    where
    elapsed' = elapsed + scrambleTickMs

-- One frame of the scramble: literals pass through, not-yet-started characters
-- read as blanks, settled characters are final, the rest flicker at random.
renderFrame :: String -> Int -> Effect String
renderFrame target elapsed = map (joinWith "") (traverse charFor (Array.range 0 (CU.length target - 1)))
  where
  charFor i = decide i (fromMaybe ' ' (CU.charAt i target))

  decide :: Int -> Char -> Effect String
  decide i ch
    | isScrambleLiteral ch = pure (CU.singleton ch)
    | elapsed < i * scrambleStagger = pure " "
    | elapsed >= i * scrambleStagger + scrambleDuration = pure (CU.singleton ch)
    | otherwise = randomScrambleChar

randomScrambleChar :: Effect String
randomScrambleChar = do
  r <- random
  let idx = Int.floor (r * Int.toNumber (CU.length scrambleChars))
  pure (fromMaybe "" (CU.singleton <$> CU.charAt idx scrambleChars))

scrambleChars :: String
scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

isScrambleLiteral :: Char -> Boolean
isScrambleLiteral c = c == ' ' || c == '/' || c == '-'

scrambleTickMs :: Int
scrambleTickMs = 40

scrambleStagger :: Int
scrambleStagger = 90

scrambleDuration :: Int
scrambleDuration = 550

scrambleStartDelay :: Number
scrambleStartDelay = 770.0

-- Seconds the rule takes to draw. Doubles as the lead time: starting the draw
-- this far ahead of the scramble's stop makes the line and text land together.
ruleDrawDuration :: Number
ruleDrawDuration = 0.4

diagramShapesComponent :: ReactComponent { postRef :: Ref (Maybe DiagramShapes.WorkerPost) }
diagramShapesComponent = DiagramShapes.diagramShapesOffscreen

onElementResize
  :: String -> ({ w :: Number, h :: Number } -> Effect Unit) -> Effect (Effect Unit)
onElementResize elemId cb = findElementById elemId >>= case _ of
  Nothing -> pure mempty
  Just el -> do
    ro <- RO.resizeObserver \entries _ -> for_ entries \e ->
      cb { w: e.contentRect.width, h: e.contentRect.height }
    RO.observe el {} ro
    pure (RO.disconnect ro)

findElementById :: String -> Effect (Maybe Element.Element)
findElementById elemId = do
  doc <- window >>= document
  getElementById (ElementId elemId) (toNonElementParentNode doc)

installScrollSync :: String -> String -> Effect (Effect Unit)
installScrollSync taId preId = do
  taM <- findElementById taId
  preM <- findElementById preId
  case taM, preM of
    Just ta, Just pre -> do
      let
        sync = do
          Element.scrollTop ta >>= flip Element.setScrollTop pre
          Element.scrollLeft ta >>= flip Element.setScrollLeft pre
      listener <- eventListener \_ -> sync
      let target = Element.toEventTarget ta
      addEventListenerWithOptions (EventType "scroll") listener passiveOpts target
      sync
      pure $ removeEventListener (EventType "scroll") listener false target
    _, _ -> pure mempty

installVhsBurst :: String -> Effect (Effect Unit)
installVhsBurst className = do
  scheduleRef <- Ref.new Nothing
  burstRef <- Ref.new Nothing
  let
    targets = do
      d <- window >>= document
      hc <- Document.getElementsByClassName (ClassName className) (HTMLDocument.toDocument d)
      HTMLCollection.toArray hc
    setVhs on = do
      els <- targets
      for_ els \el -> do
        cl <- Element.classList el
        if on then DOMTokenList.add cl "vhs-on"
        else DOMTokenList.remove cl "vhs-on"
    burst = do
      setVhs true
      tid <- setTimeout 1600 do
        setVhs false
        scheduleNext
      Ref.write (Just tid) burstRef
    scheduleNext = do
      r <- random
      tid <- setTimeout (Int.round ((40.0 + r * 30.0) * 1000.0)) burst
      Ref.write (Just tid) scheduleRef
  scheduleNext
  pure do
    Ref.read burstRef >>= traverse_ clearTimeout
    Ref.read scheduleRef >>= traverse_ clearTimeout
    setVhs false

-- Fire `done` the moment the title's neon-in animation finishes — the beat the
-- wordmark holds steady, "the light is on". Listening for animationend on the
-- .hero-wordmark-in element keeps this locked to the CSS timing, and the name
-- guard accepts the reduced-motion fade variant too. Returns a teardown.
onWordmarkLit :: Effect Unit -> Effect (Effect Unit)
onWordmarkLit done = do
  els <- targets
  listener <- eventListener \ev ->
    when (lit (unsafeCoerce ev).animationName) done
  for_ els \el -> addEventListenerWithOptions animationEnd listener passiveOpts (Element.toEventTarget el)
  pure $ for_ els \el -> removeEventListener animationEnd listener false (Element.toEventTarget el)
  where
  animationEnd = EventType "animationend"
  lit name = name == "hero-wordmark-in" || name == "hero-wordmark-fade"
  targets = do
    d <- window >>= document
    hc <- Document.getElementsByClassName (ClassName "hero-wordmark-in") (HTMLDocument.toDocument d)
    HTMLCollection.toArray hc

passiveOpts :: { capture :: Boolean, once :: Boolean, passive :: Boolean }
passiveOpts = { capture: false, once: false, passive: true }

-- Scroll the section with the given id into view. The magazine is snap-
-- mandatory, so the browser handles the actual easing; we just point at the
-- target element.
scrollSectionIntoView :: String -> Effect Unit
scrollSectionIntoView id = do
  doc <- window >>= document
  getElementById (ElementId id) (toNonElementParentNode doc) >>= case _ of
    Nothing -> pure unit
    Just el -> Element.scrollIntoViewWithOptions { behavior: Element.Smooth, block: Element.Start, inline: Element.Nearest } el

-- Find the neighbour of `current` in `sectionStates`, offset by `dir` (+1 down,
-- -1 up), clamped to the ends.
neighbourSection :: String -> Int -> Maybe String
neighbourSection current dir = do
  i <- Array.findIndex (\s -> s.id == current) sectionStates
  let j = max 0 (min (Array.length sectionStates - 1) (i + dir))
  s <- Array.index sectionStates j
  pure s.id

navArrows :: { active :: String } -> JSX
navArrows props =
  div
    { className: "fixed right-6 bottom-6 z-30 flex flex-col gap-2"
    }
    [ arrow (-1) "↑"
    , arrow 1 "↓"
    ]
  where
  arrow dir label =
    button
      { className:
          "h-10 w-10 rounded-full border border-white/20 bg-black/40 \
          \backdrop-blur text-[#f5f1e8] hover:bg-black/60 transition-colors \
          \font-mono text-sm leading-none"
      , onClick: handler_ $ case neighbourSection props.active dir of
          Just id -> scrollSectionIntoView id
          Nothing -> pure unit
      }
      [ text label ]

-- Picks the most-visible section from the ratios so far and, when it changes,
-- posts its declared morph + camera arm to the worker.
dispatchActive
  :: Ref (Maybe DiagramShapes.WorkerPost)
  -> Hooks.Ref String
  -> Array { id :: String, ratio :: Number }
  -> Effect Unit
dispatchActive postRef activeRef ratios = case mostVisible ratios of
  Nothing -> pure unit
  Just best -> case Array.find (\s -> s.id == best.id) sectionStates of
    Nothing -> pure unit
    Just sect -> do
      last <- readRef activeRef
      when (sect.id /= last) do
        writeRef activeRef sect.id
        postWorkerMessage postRef "morph" sect.morph
        postWorkerMessage postRef "camera" sect.camera
        postWorkerMessage postRef "formation" sect.formation

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
observeRatios rootId ids cb = do
  rootEl <- findElementById rootId
  els <- Array.catMaybes <$> traverse findElementById ids
  obs <- IO.newIntersectionObserver
    ( \entries _ -> for_ entries \e -> do
        id <- Element.id e.target
        cb (un ElementId id) e.intersectionRatio
    )
    ( IO.thresholds := [ 0.0, 0.25, 0.5, 0.75, 1.0 ]
        <> maybe mempty (\r -> IO.root := r) rootEl
    )
  for_ els (IO.observe obs)
  pure $ for_ els (IO.unobserve obs)

-- Push a worker message through the Ref the offscreen component fills once its
-- worker is live; a no-op until then (the next section change retries naturally).
postWorkerMessage :: forall a. Ref (Maybe DiagramShapes.WorkerPost) -> String -> a -> Effect Unit
postWorkerMessage postRef ty payload =
  readRef postRef >>= traverse_ \post -> post ty (unsafeToForeign payload)

onMagazineScroll
  :: ({ x :: Number, y :: Number, progress :: Number, scale :: Number } -> Effect Unit)
  -> Effect (Effect Unit)
onMagazineScroll cb = findElementById "magazine" >>= case _ of
  Nothing -> pure mempty
  Just el -> do
    lastXRef <- Ref.new 0.0
    win <- window
    let
      fire = do
        vh <- Int.toNumber <$> Window.innerHeight win
        vw <- Int.toNumber <$> Window.innerWidth win
        st <- Element.scrollTop el
        let p = clamp01 (st / max 1.0 vh)
        previewM <- findElementById "markgraf-preview"
        lastX <- Ref.read lastXRef
        naturalCenter <- case previewM of
          Just preview -> do
            r <- Element.getBoundingClientRect preview
            pure ((r.left - lastX) + r.width / 2.0)
          Nothing -> pure (vw / 2.0)
        let
          offsetToCenter = vw / 2.0 - naturalCenter
          x = offsetToCenter * (1.0 - p)
          y = (-0.95 + 0.95 * p) * vh
          scale = heroScale + (1.0 - heroScale) * p
          heroScale = if vw < 640.0 then heroScaleNarrow else 1.0
        Ref.write x lastXRef
        cb { x, y, progress: p, scale }
    listener <- eventListener \_ -> fire
    let
      elTarget = Element.toEventTarget el
      winTarget = Window.toEventTarget win
    addEventListenerWithOptions (EventType "scroll") listener passiveOpts elTarget
    addEventListenerWithOptions (EventType "resize") listener passiveOpts winTarget
    fire
    pure do
      removeEventListener (EventType "scroll") listener false elTarget
      removeEventListener (EventType "resize") listener false winTarget
  where
  clamp01 v = max 0.0 (min 1.0 v)

-- How far the floating player shrinks while parked over the hero on a narrow
-- (phone) viewport, easing back to full size as it scrolls into the playground.
-- Shrinking about the element's centre lifts its bottom edge and pulls its left
-- in, clearing the install CTA at the hero's bottom-left. Full size everywhere
-- on wider viewports, where there is no overlap.
heroScaleNarrow :: Number
heroScaleNarrow = 0.62
