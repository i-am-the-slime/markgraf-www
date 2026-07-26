module Component.HeroPreview (mkHeroPreview) where

import Prelude

import Component.HeroPreview.DOM (installVhsBurst, scrollSectionIntoView)
import Component.HeroPreview.Playground (playground)
import Component.HeroPreview.Scene (diagramShapesBackground, dispatchActive, mostVisible, observeRatios, sectionStates)
import Component.HeroPreview.SectionLabel (sectionLabel, spreadFolio)
import Component.HeroPreview.Sections (aiSection, embedSection, footerSection, integrationsSection, playSection, renderSection)
import Component.InstallButtonLazy (installButtonLazy)
import Component.LabSectionsLazy (labSectionsLazy)
import Data.Array as Array
import Data.Maybe (Maybe(..))
import Data.Tuple.Nested (type (/\), (/\))
import DiagramShapes.Offscreen as DiagramShapes
import Motion.Lazy (domAnimation, lazyMotion)
import Page.Active (onActiveChange)
import React.Basic (JSX)
import React.Basic.Events (handler_)
import React.Basic.Hooks (Component, component, readRef, useEffectOnce, useRef, useState', writeRef)
import React.Basic.Hooks as Hooks
import Yoga.React.DOM.HTML.A (a)
import Yoga.React.DOM.HTML.Button (button)
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.HTML.H (h1)
import Yoga.React.DOM.HTML.Main (main)
import Yoga.React.DOM.HTML.Nav (nav)
import Yoga.React.DOM.HTML.P (p)
import Yoga.React.DOM.HTML.Section (section) as H
import Yoga.React.DOM.HTML.Span (span)
import Yoga.React.DOM.Internal (css, noJSX)

mkHeroPreview :: Component {}
mkHeroPreview = component "HeroPreview" \_ -> Hooks.do
  ratiosRef <- useRef ([] :: _ { id :: String, ratio :: Number })
  activeRef <- useRef ""
  postRef <- useRef (Nothing :: Maybe DiagramShapes.WorkerPost)
  activeSection /\ setActiveSection <- useState' "page-hero"
  let sceneLit = true
  pageActive /\ setPageActive <- useState' true
  useEffectOnce $ installVhsBurst "vhs-text-wrap"
  useEffectOnce $ onActiveChange setPageActive
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
        , pauseOverlay (not pageActive)
        , crtOverlay
        ]
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
    $ div { className: "flex flex-col items-center gap-[clamp(1.5rem,4vw,4rem)] max-w-[min(64rem,92vw)] text-center" }
        [ h1
            { className: "display-glow hero-wordmark-in vhs-text-wrap text-[clamp(2.1875rem,10vw,8.75rem)] leading-[0.82] tracking-[-0.045em] font-bold"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            $ span
                { className: "vhs-text"
                , style: css { "--vhs-text": show "markgraf" }
                }
                "markgraf"

        , heroTagline
        ]

-- The hero's call to action is the raymarched SDF button: a grey glassy shape
-- morphing through markgraf's node silhouettes with the INSTALL text baked in,
-- gas-filling on hover. The shape is the button; clicking it rides the scroll-
-- snap magazine down to the install spread, same as the side nav.
heroInstallCta :: JSX
heroInstallCta = installButtonLazy

-- Product promise is present on first paint; animation never gates core copy.
heroTagline :: JSX
heroTagline =
  p
    { className: "max-w-[34ch] text-[clamp(1.125rem,2.2vw,2rem)] leading-snug text-[#f5f1e8]"
    , style: css
        { fontFamily: "'Ilisarniq', 'Ilisarniq Fallback', ui-sans-serif, system-ui, sans-serif"
        , textShadow: "0 1px 2px rgba(10,14,26,0.95), 0 0 18px rgba(10,14,26,0.92), 0 0 44px rgba(10,14,26,0.75)"
        }
    }
    "A few words are worth a thousand pictures."

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
    , "integrations" /\ "language"
    , "render" /\ "renderers"
    , "ai" /\ "hierarchy"
    , "embed" /\ "integrations"
    , "play" /\ "authoring"
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
    label

-- CRT scanlines, lifted out of the offscreen canvas's grain shader into a
-- top-level DOM layer so they ride above everything — the floating player and
-- the side nav included, which a section-scoped layer never could. The lines
-- loop slowly top-to-bottom (see .crt-overlay in globals.css).
crtOverlay :: JSX
crtOverlay =
  div { className: "fixed inset-0 z-[60] pointer-events-none crt-overlay" } noJSX

-- Shown when the page stops being watched — another tab or another program in
-- the foreground — at which point every animation loop idles (see Page.Active).
-- A dark veil with the wordmark's neon "paused" so the still frame reads as
-- deliberate, not stalled. Stays pointer-events-none and under the CRT layer:
-- the scanlines keep riding over it, and a click lands on the page beneath,
-- refocusing the window and lifting the veil.
pauseOverlay :: Boolean -> JSX
pauseOverlay paused =
  div
    { className:
        "fixed inset-0 z-[55] flex items-center justify-center pointer-events-none \
        \bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out "
          <> (if paused then "opacity-100" else "opacity-0")
    }
    $ span
        { className: "display-glow uppercase text-[clamp(1.5rem,6vw,4.5rem)] leading-none text-[#f5f1e8]"
        -- Press Start 2P is a bitmap face, so the letters are literal pixels
        -- — an old game's PAUSE screen. The wide track spaces them out
        -- "P A U S E"-style; the matching left pad cancels the trailing
        -- letter-spacing so the word stays centred rather than drifting left.
        , style: css
            { fontFamily: "'Press Start 2P', ui-monospace, monospace"
            , letterSpacing: "0.35em"
            , paddingLeft: "0.35em"
            }
        }
        "pause"

scrim :: Boolean -> JSX
scrim isActive =
  div
    { className:
        "fixed inset-0 z-[1] bg-black/30 backdrop-blur-sm transition-opacity duration-700 pointer-events-none "
          <> (if isActive then "opacity-100" else "opacity-0")
    }
    noJSX

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
      label
