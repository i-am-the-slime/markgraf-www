module Component.HeroPreview.Playground (playground) where

import Prelude

import Component.HeroPreview.DOM (installScrollSync, onElementResize, onMagazineScroll, onTargetValue)
import Component.HeroPreview.SectionLabel (sectionLabel, spreadFolio)
import Component.HeroPreview.Syntax (highlight)
import Component.PlayerLazy (markgrafPlayerLazy)
import Data.Array as Array
import Data.Maybe (Maybe(..))
import Data.Monoid as Monoid
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import Effect.Aff (Milliseconds(..), delay, launchAff_)
import Effect.Class (liftEffect)
import Effect.Unsafe (unsafePerformEffect)
import Motion.Element as Motion
import Motion.Types as Motion
import Motion.Value (MotionValue)
import Motion.Value as MV
import Page.Active (onActiveChange)
import React.Basic (JSX, keyed)
import React.Basic.Events (handler_)
import React.Basic.Hooks (Component, component, useEffect, useEffectOnce, useState')
import React.Basic.Hooks as Hooks
import Untagged.Castable (cast)
import Yoga.React.DOM.Attributes.AutoCapitalize (autoCapitalizeOff)
import Yoga.React.DOM.HTML.Button (button)
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.HTML.H (h2)
import Yoga.React.DOM.HTML.Pre (pre)
import Yoga.React.DOM.HTML.Section (section) as H
import Yoga.React.DOM.HTML.Textarea (textarea)
import Yoga.React.DOM.Internal (css, text)
import Yoga.React.DOM.SVG.Path (path)
import Yoga.React.DOM.SVG.Svg (svg)

-- ---------------------------------------------------------------------------
-- Live playground: textarea + syntax-highlight overlay + markgraf preview.
-- ---------------------------------------------------------------------------

type Example = { name :: String, source :: String }

examples :: Array Example
examples =
  [ { name: "dive"
    , source:
        """seed 7

+ customer "Customer"
+ shop "Shop"
+ payments "Payments"
+ customer -> shop
+ shop -> payments

customer ~> shop "places order"
shop ~> payments "takes payment"

into shop
out

inside shop {
  + web "Web app"
  + api "API"
  + db "Postgres"
  + web -> api
  + api -> db

  web ~> api "POST /orders"
  api ~> db "INSERT"

  into api
  out

  inside api {
    + controller "Controller"
    + service "Order service"
    + repository "Repository"
    + controller -> service
    + service -> repository

    controller ~> service "handle"
    service ~> repository "save"
  }
}
"""
    }
  , { name: "cache"
    , source:
        """+ customer "Customer"
+ api "API"
+ cache "Redis"
+ db "Postgres"
+ customer -> api
+ api -> cache
+ api -> db

customer ~> api "mark shipped"
api ~> db "UPDATE status"

customer ~> api "get status"
api ~> cache "HIT: pending"
customer <~ api "still pending?"

customer ~> api "mark shipped"
par {
  api ~> db "UPDATE status"
  api ~> cache "DEL user:42"
}

customer ~> api "get status"
api ~> cache "miss"
api ~> db "SELECT status"
customer <~ api "shipped"
"""
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
  pageActive /\ setPageActive <- useState' true
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
      delay (250.0 # Milliseconds)
      setDebounced src # liftEffect
    mempty
  useEffectOnce do
    onElementResize "markgraf-preview" setSize
  useEffectOnce $ onActiveChange setPageActive
  useEffectOnce do
    installScrollSync "mg-textarea" "mg-pre"
  useEffectOnce do
    onMagazineScroll \p -> do
      MV.set p.x xMv
      MV.set p.y yMv
      MV.set p.scale scaleMv
  useEffect debounced do
    setGen (gen + 1)
    mempty
  pure (playgroundView { src, setSrc, rendered: debounced, size, visible: true, active, setActive, gen, section, xMv, yMv, scaleMv, paused: not pageActive })

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
  , paused :: Boolean
  }

playgroundView :: PlaygroundProps -> JSX
playgroundView pp =
  H.section
    { id: "playground"
    , className: "relative snap-start snap-always h-screen flex flex-col justify-center z-10 px-6 sm:px-12 py-16"
    }
    [ div { className: "max-w-[min(92rem,94vw)] mx-auto w-full" }
        [ div { className: "flex items-baseline justify-between mb-8 gap-6 flex-wrap" }
            $ div {}
                [ sectionLabel "01 / playground"
                , h2
                    { className: "display-glow text-[clamp(2.25rem,5.5vw,6rem)] font-bold tracking-tight leading-[0.95] max-w-[20ch]"
                    , style: css { fontFamily: "'Sinistre', 'Sinistre Fallback', serif" }
                    }
                    "Try markgraf"
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
          (padIndex (i + 1))
      , div
          { className:
              "font-mono text-sm sm:text-base leading-none tracking-[0.12em] uppercase transition-colors "
                <> if current == ex.source then "text-[#f5f1e8]" else "text-[#5a6478] group-hover:text-[#c8cdd9]"
          }
          ex.name
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
    $ path
        { strokeLinecap: "round"
        , strokeLinejoin: "round"
        , d: "M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
        }
        []

paneTabs :: Pane -> (Pane -> Effect Unit) -> JSX
paneTabs active setActive =
  div { className: "sm:hidden flex justify-end mb-3" }
    $ codeIcon # button
        { type: "button"
        , onClick: handler_ (setActive (if active == SourcePane then RenderPane else SourcePane))
        , className:
            "w-10 h-10 rounded-md border flex items-center justify-center transition-colors cursor-pointer "
              <>
                if active == SourcePane then "bg-[#ff3b1a] border-[#ff3b1a] text-[#0f0f0f]"
                else "bg-transparent border-[#2a3142] text-[#8a94a8] hover:border-[#ff3b1a] hover:text-[#f5f1e8]"
        }

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
        $ previewPane pp.rendered pp.size pp.visible pp.gen (pp.active == RenderPane) pp.paused
    ]

editorPane :: String -> (String -> Effect Unit) -> Boolean -> JSX
editorPane src setSrc activeOnMobile =
  div
    { className:
        (if activeOnMobile then "flex " else "hidden ")
          <> "sm:flex flex-col overflow-hidden"
    }
    $ div
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

previewPane :: String -> { w :: Number, h :: Number } -> Boolean -> Int -> Boolean -> Boolean -> JSX
previewPane src size visible gen activeOnMobile paused =
  div
    { className: (if activeOnMobile then "flex " else "hidden ")
        <> "sm:flex flex-col overflow-hidden h-full"
    }
    $ div
        { id: "markgraf-preview"
        , style: css
            { flex: "1"
            , minHeight: "320px"
            , position: "relative"
            , overflow: "hidden"
            }
        }
        [ div
            { className: "absolute top-4 left-5 z-20 font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff3b1a] pointer-events-none"
            }
            "live markgraf"
        , playerReveal
        ]
  where
  playerWidth = if size.w > zero then size.w else 640.0
  playerHeight = if size.h > zero then size.h else 520.0
  player =
    markgrafPlayerLazy
      { src
      , renderer: "svg"
      , theme: "dark"
      , transparent: true
      , paused
      , width: playerWidth
      , height: playerHeight
      }
      # Monoid.guard visible
  playerReveal = div
    { className: "player-reveal pointer-events-none"
    , style: css { position: "absolute", inset: "0" }
    , key: show gen
    }
    player
