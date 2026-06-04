module Component.LabSections (LabDeps, labSpreads) where

-- Lab pages — experimental magazine typesetting. Non-destructive, appended at
-- the bottom of the magazine so existing sections are untouched. Each one tries
-- a different idea: three-column body, pull-quote spread, hanging asymmetric
-- headline. They live in their own module so the magazine can load them lazily
-- (Component.LabSectionsLazy) — below the fold, they never ride the first paint.
--
-- The eyebrow (sectionLabel) and folio are injected as `LabDeps` rather than
-- imported, because the rest of the magazine owns them: injecting keeps this a
-- leaf module with no edge back to HeroPreview.
--
-- Each lab uses framer-motion variants to fade-and-rise its top-level blocks
-- when the section enters the viewport. The page is snap-mandatory, so the
-- animation replays on every re-entry, which is the desired behaviour.

import Framer.Motion.MotionComponent as Motion
import Framer.Motion.Types (VariantLabel(..))
import Framer.Motion.Types as Motion
import React.Basic (JSX)
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.HTML.H (h2)
import Yoga.React.DOM.HTML.P (p)
import Yoga.React.DOM.HTML.Section (section) as H
import Yoga.React.DOM.Internal (css, noJSX, text)
import Yoga.React.DOM.SVG.Path (path)
import Yoga.React.DOM.SVG.Svg (svg)

-- The shared magazine chrome the lab spreads borrow from the host page.
type LabDeps =
  { sectionLabel :: String -> JSX
  , spreadFolio :: String -> String -> JSX
  }

-- Every lab spread, in scroll order, ready to drop into the magazine.
labSpreads :: LabDeps -> Array JSX
labSpreads deps =
  [ labColumnsSection deps
  , labQuoteSection deps
  , labHangSection deps
  , labIconsSection deps
  , labRightHangSection deps
  ]

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

labColumnsSection :: LabDeps -> JSX
labColumnsSection deps =
  H.section
    { id: "lab-columns"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10 px-6 sm:px-12 py-16"
    }
    [ labStage "max-w-[min(96rem,94vw)] mx-auto w-full h-full flex flex-col justify-center gap-12"
        [ labItem "" [ deps.sectionLabel "lab-a / three columns" ]
        , labItem ""
            [ h2
                { className: "text-[10vw] sm:text-[6.5vw] leading-[0.88] tracking-[-0.03em] font-bold max-w-[14ch]"
                , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
                }
                "A few words, a thousand pictures."
            ]
        , labItem "columns-1 sm:columns-2 lg:columns-3 gap-10 text-[15px] leading-[1.6] text-[#c8cdd9]"
            [ p
                { className: "mb-4"
                , style: css { fontFamily: "'Ilisarniq', 'Ilisarniq Fallback', sans-serif" }
                }
                [ text "Write the edges. The compiler does the rest. Layout, morphs, camera — all from a few lines of text." ]
            , p
                { className: "mb-4"
                , style: css { fontFamily: "'Ilisarniq', 'Ilisarniq Fallback', sans-serif" }
                }
                [ text "It reads a fenced block. It writes an SVG and a timeline. The player runs the timeline back like a short film. Pause it. Scrub it. Play it again." ]
            , p
                { className: "mb-4"
                , style: css { fontFamily: "'Ilisarniq', 'Ilisarniq Fallback', sans-serif" }
                }
                [ text "The same source runs in your README. In your docs. In your slides. No frames. No tweens. No design tools." ]
            ]
        ]
    , deps.spreadFolio "lab-a" "three-columns"
    ]

labQuoteSection :: LabDeps -> JSX
labQuoteSection deps =
  H.section
    { id: "lab-quote"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10 px-6 sm:px-12 py-16 flex items-center"
    }
    [ labStage "max-w-[min(96rem,94vw)] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-10"
        [ labItem "md:col-span-8 flex flex-col gap-10"
            [ deps.sectionLabel "lab-b / pull-quote"
            , div
                { className: "text-[9vw] sm:text-[6vw] leading-[0.95] tracking-[-0.02em] font-bold"
                , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
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
    , deps.spreadFolio "lab-b" "pull-quote"
    ]

labHangSection :: LabDeps -> JSX
labHangSection deps =
  H.section
    { id: "lab-hang"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10 px-6 sm:px-12 py-16"
    }
    [ labStage "max-w-[min(96rem,94vw)] mx-auto w-full h-full grid grid-cols-12 gap-6 items-center"
        [ labItem "col-span-12 md:col-span-7 flex flex-col gap-10"
            [ deps.sectionLabel "lab-c / hang"
            , h2
                { className: "text-[14vw] sm:text-[9vw] leading-[0.88] tracking-[-0.035em] font-bold -ml-1"
                , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
                }
                "Markgraf."
            , p
                { className: "text-[22px] sm:text-[26px] leading-[1.35] max-w-[28ch] italic text-[#e8e4d8]"
                , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif", fontWeight: "300" }
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
    , deps.spreadFolio "lab-c" "hang"
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

labIconsSection :: LabDeps -> JSX
labIconsSection deps =
  H.section
    { id: "lab-icons"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10 px-6 sm:px-12 py-16"
    }
    [ labStage "max-w-[min(96rem,94vw)] mx-auto w-full h-full flex flex-col justify-center gap-14"
        [ labItem "" [ deps.sectionLabel "lab-d / iconography" ]
        , labItem "grid grid-cols-12 gap-10 items-start"
            [ div { className: "col-span-12 md:col-span-7" }
                [ h2
                    { className: "text-[10vw] sm:text-[6vw] leading-[0.9] tracking-[-0.025em] font-bold max-w-[12ch]"
                    , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
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
    , deps.spreadFolio "lab-d" "iconography"
    ]

iconCard :: String -> String -> String -> JSX
iconCard kind heading body =
  div { className: "bg-[#0f0f0f] p-8 flex flex-col gap-6 min-h-[180px]" }
    [ div { className: "text-[#ff3b1a]" } [ glyph kind ]
    , div { className: "flex flex-col gap-2" }
        [ div
            { className: "text-2xl font-bold tracking-tight"
            , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
            }
            [ text heading ]
        , p { className: "text-[14px] leading-[1.5] text-[#8a94a8]" }
            [ text body ]
        ]
    ]

-- Mirror of lab-c: skinny editorial sidebar hard-left, headline hangs right.
labRightHangSection :: LabDeps -> JSX
labRightHangSection deps =
  H.section
    { id: "lab-right-hang"
    , className: "relative snap-start snap-always h-screen overflow-hidden z-10 px-6 sm:px-12 py-16"
    }
    [ labStage "max-w-[min(96rem,94vw)] mx-auto w-full h-full grid grid-cols-12 gap-6 items-center"
        [ labItem "col-span-12 md:col-span-3 flex flex-col gap-6 md:pr-6 md:border-r border-[#2a3142]"
            [ deps.sectionLabel "lab-f / right hang"
            , div { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-[#8a94a8] flex flex-col gap-1" }
                [ div {} [ text "Issue 01" ]
                , div {} [ text "Spring 2026" ]
                , div {} [ text "Berlin" ]
                ]
            , p
                { className: "text-[15px] leading-[1.55] text-[#c8cdd9] max-w-[24ch]"
                , style: css { fontFamily: "'Ilisarniq', 'Ilisarniq Fallback', sans-serif" }
                }
                [ text "A short note on what the compiler does. And what it refuses to do." ]
            , div { className: "h-px w-12 bg-[#ff3b1a]" } noJSX
            , div { className: "font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6478]" }
                [ text "by mark" ]
            ]
        , labItem "col-span-12 md:col-span-9 flex flex-col gap-10"
            [ h2
                { className: "text-[14vw] sm:text-[9vw] leading-[0.88] tracking-[-0.035em] font-bold"
                , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
                }
                "It draws. You write."
            , p
                { className: "text-[20px] sm:text-[24px] leading-[1.4] max-w-[32ch] italic text-[#e8e4d8]"
                , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif", fontWeight: "300" }
                }
                [ text "The compiler keeps its promises. The picture moves on its own." ]
            ]
        ]
    , deps.spreadFolio "lab-f" "right-hang"
    ]
