module Component.HeroPreview.Playground (playground) where

import Prelude

import Component.HeroPreview.Dom (installScrollSync, onElementResize, onMagazineScroll, onTargetValue)
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
import Yoga.React.DOM.Internal (css, noJSX, text)
import Yoga.React.DOM.SVG.Path (path)
import Yoga.React.DOM.SVG.Svg (svg)

-- ---------------------------------------------------------------------------
-- Live playground: textarea + syntax-highlight overlay + markgraf preview.
-- ---------------------------------------------------------------------------

type Example = { name :: String, source :: String }

examples :: Array Example
examples =
  [ { name: "request"
    , source:
        """frame setup {
  +node client "Client"
  +node api    "API"
  +node db     "Database"
  +edge client api
  +edge api db
}

frame "request" {
  client -> api "GET /user/42"
  api    -> db  "SELECT *"
  api    <- db  "row"
  client <- api "200 OK"
}
"""
    }
  , { name: "cache hit"
    , source:
        """frame setup {
  +node client "Client"
  +node api    "API"
  +node cache  "Cache"
  +node logger "Logger"
  +edge client api
  +edge api cache
  +edge api logger
}

frame "hit" {
  client -> api "GET"
  par {
    api -> cache  "HIT"
    api -> logger "trace"
  }
  client <- api "200"
}
"""
    }
  , { name: "pub/sub"
    , source:
        """frame setup {
  +node pub  "Publisher"
  +node bus  "Broker"
  +node a    "Worker A"
  +node b    "Worker B"
  +node c    "Worker C"
  +edge pub bus
  +edge bus a
  +edge bus b
  +edge bus c
}

frame "fanout" {
  pub -> bus "event"
  par {
    bus -> a "event"
    bus -> b "event"
    bus -> c "event"
  }
}
"""
    }
  , { name: "auth"
    , source:
        """frame setup {
  +node user "User"
  +node app  "App"
  +node idp  "IdP"
  +edge user app
  +edge app idp
  +edge user idp
}

frame "sign in" {
  user -> app "open"
  app  -> user "redirect"
  user -> idp "login"
  user <- idp "code"
  user -> app "code"
  app  -> idp "exchange"
  app  <- idp "token"
  user <- app "signed in"
}
"""
    }
  , { name: "queue"
    , source:
        """frame setup {
  +node prod  "Producer"
  +node q     "Queue"
  +node w1    "Worker 1"
  +node w2    "Worker 2"
  +edge prod q
  +edge q w1
  +edge q w2
}

frame "enqueue" {
  prod -> q "job 1"
  prod -> q "job 2"
}

frame "drain" {
  par {
    q -> w1 "job 1"
    q -> w2 "job 2"
  }
}
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
        noJSX

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
        $ previewPane pp.rendered pp.size pp.visible pp.gen (pp.active == RenderPane)
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
      $ keyed (show gen) player
