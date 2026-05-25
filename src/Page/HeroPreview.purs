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
import React.Basic (JSX, ReactComponent, element, keyed)
import React.Basic.DOM as D
import React.Basic.DOM.SVG as S
import React.Basic.DOM.Events (targetValue)
import React.Basic.Events (handler, handler_)
import React.Basic.Hooks (Component, component, useEffect, useState')
import React.Basic.Hooks as Hooks

mkHeroPreview :: Component {}
mkHeroPreview = component "HeroPreview" \_ -> Hooks.do
  pure $
    D.main
      { id: "magazine"
      , className: "bg-[#0a0e1a] text-[#f5f1e8] h-screen overflow-y-scroll snap-y snap-mandatory"
      , children:
          [ topBar
          , pageRail
          , heroPage
          , playground {}
          , playerSection
          , renderSection
          , aiSection
          , embedSection
          , footerSection
          ]
      }

-- ---------------------------------------------------------------------------
-- Page 0 — hero spread. One screen, no scroll-driven captions; the 3D scene
-- only paints behind this page, not the ones that follow.
-- ---------------------------------------------------------------------------

heroPage :: JSX
heroPage =
  D.section
    { id: "page-hero"
    , className: "relative snap-start snap-always h-screen w-full overflow-hidden"
    , children:
        [ D.div { className: "absolute inset-0", children: [ element feltballsComponent {} ] }
        , D.div { className: "absolute inset-0", children: [ element sceneComponent {} ] }
        , heroLockup
        , spreadFolio "00" "hero"
        ]
    }

heroLockup :: JSX
heroLockup =
  D.div
    { className: "absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6"
    , children:
        [ D.div
            { className: "flex flex-col items-center gap-8 max-w-3xl text-center"
            , children:
                [ kicker
                , D.h1
                    { className: "text-[18vw] sm:text-[16vw] md:text-[13vw] leading-[0.82] tracking-[-0.045em] font-bold text-[#f5f1e8]"
                    , style: D.css
                        { fontFamily: "'Sinistre', serif"
                        , textShadow: "0 0 80px rgba(10,14,26,0.7)"
                        }
                    , children: [ D.text "markgraf" ]
                    }
                , D.p
                    { className: "max-w-xl text-lg sm:text-xl leading-snug text-[#c8cdd9]"
                    , style: D.css { fontFamily: "'Sinistre', serif", fontStyle: "italic" }
                    , children:
                        [ D.text "Animated graph diagrams from a tiny declarative source language. "
                        , D.span
                            { style: D.css { color: "#ff3b1a" }
                            , children: [ D.text "Watch your architecture move." ]
                            }
                        ]
                    }
                , installPill
                , coverLines
                ]
            }
        ]
    }

kicker :: JSX
kicker =
  D.div
    { className: "flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.4em] text-[#8a94a8]"
    , children:
        [ D.span { className: "h-px w-12 bg-[#2a3142]", children: [] }
        , D.span_ [ D.text "The Quarterly · Software · MMXXVI" ]
        , D.span { className: "h-px w-12 bg-[#2a3142]", children: [] }
        ]
    }

coverLines :: JSX
coverLines =
  D.div
    { className: "mt-4 flex flex-wrap justify-center items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#5a6478] max-w-2xl"
    , children:
        [ coverLine "A new syntax for systems"
        , bullet
        , coverLine "Live playground"
        , bullet
        , coverLine "Native macOS player"
        , bullet
        , coverLine "Claude writes it for you"
        ]
    }
  where
    bullet = D.span { style: D.css { color: "#ff3b1a" }, children: [ D.text "◆" ] }

coverLine :: String -> JSX
coverLine t = D.span_ [ D.text t ]

-- ---------------------------------------------------------------------------
-- Fixed chrome: top bar with brand + nav, side rail with page dots.
-- ---------------------------------------------------------------------------

topBar :: JSX
topBar =
  D.div
    { className: "fixed top-0 inset-x-0 z-30 pointer-events-none"
    , children:
        [ D.div
            { className: "grid grid-cols-3 items-center px-8 py-4 font-mono text-[10px] uppercase tracking-[0.32em] text-[#8a94a8]"
            , children:
                [ D.span
                    { className: "justify-self-start pointer-events-auto"
                    , children: [ D.text "Vol. I · Nº 01" ]
                    }
                , D.span
                    { style: D.css { fontFamily: "'Sinistre', serif", letterSpacing: "0.04em", fontSize: "16px" }
                    , className: "justify-self-center text-[#f5f1e8] normal-case pointer-events-auto"
                    , children: [ D.text "markgraf" ]
                    }
                , D.div
                    { className: "justify-self-end flex items-center gap-5 pointer-events-auto"
                    , children:
                        [ navLink "#playground" "playground"
                        , navLink "#player" "player"
                        , navLink "#render" "render"
                        , navLink "#ai" "ai"
                        , navLink "#embed" "embed"
                        , navLink "#install" "install"
                        ]
                    }
                ]
            }
        , D.div { className: "h-px bg-[#1a1f2e] mx-8", children: [] }
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

-- | Folio: magazine-style page label in the lower corners of each spread.
spreadFolio :: String -> String -> JSX
spreadFolio num label =
  D.div
    { className: "absolute bottom-0 inset-x-0 z-20 px-8 py-6 pointer-events-none flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.32em] text-[#5a6478]"
    , children:
        [ D.span_ [ D.text ("Page " <> num) ]
        , D.span
            { className: "flex items-center gap-3"
            , children:
                [ D.span { className: "h-px w-8 bg-[#2a3142]", children: [] }
                , D.span_ [ D.text label ]
                , D.span { className: "h-px w-8 bg-[#2a3142]", children: [] }
                ]
            }
        , D.span_ [ D.text "Markgraf · Nº I" ]
        ]
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

playground :: {} -> JSX
playground = unsafePerformEffect mkPlayground

data Pane = SourcePane | RenderPane

derive instance Eq Pane

mkPlayground :: Component {}
mkPlayground = component "Playground" \_ -> Hooks.do
  src /\ setSrc <- useState' defaultSource
  debounced /\ setDebounced <- useState' defaultSource
  size /\ setSize <- useState' { w: 0.0, h: 0.0 }
  visible /\ setVisible <- useState' false
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
  useEffect unit do
    onIntersect "playground" setVisible
  useEffect visible do
    when visible (setGen (gen + 1))
    pure (pure unit)
  useEffect debounced do
    setGen (gen + 1)
    pure (pure unit)
  pure (playgroundView { src, setSrc, rendered: debounced, size, visible, active, setActive, gen })

type PlaygroundProps =
  { src :: String
  , setSrc :: String -> Effect Unit
  , rendered :: String
  , size :: { w :: Number, h :: Number }
  , visible :: Boolean
  , active :: Pane
  , setActive :: Pane -> Effect Unit
  , gen :: Int
  }

playgroundView :: PlaygroundProps -> JSX
playgroundView p =
  D.section
    { id: "playground"
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
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

editorAndPreview :: PlaygroundProps -> JSX
editorAndPreview p =
  D.div
    { className:
        "grid grid-cols-1 sm:grid-cols-[500px_500px] gap-px bg-[#1a1f2e] border border-[#1a1f2e] rounded-xl overflow-hidden h-[60vh] sm:h-[400px] w-full sm:w-fit sm:mx-auto"
    , children:
        [ editorPane p.src p.setSrc (p.active == SourcePane)
        , previewPane p.rendered p.size p.visible p.gen (p.active == RenderPane)
        ]
    }

editorPane :: String -> (String -> Effect Unit) -> Boolean -> JSX
editorPane src setSrc activeOnMobile =
  D.div
    { className:
        (if activeOnMobile then "flex " else "hidden ")
          <> "sm:flex flex-col overflow-hidden bg-[#0a0e1a]"
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
          <> "sm:flex flex-col overflow-hidden bg-[#0a0e1a]"
    , children:
        [ paneHeader "#69dcaa" "live render"
        , D.div
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
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
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
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
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
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
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
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
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
    , className: "relative snap-start snap-always h-screen overflow-hidden flex flex-col justify-center bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-16"
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
        , D.span { className: "text-[#ff3b1a]", children: [ D.text ("Dept. " <> text) ] }
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
foreign import onElementResize :: String -> ({ w :: Number, h :: Number } -> Effect Unit) -> Effect (Effect Unit)
foreign import onIntersect :: String -> (Boolean -> Effect Unit) -> Effect (Effect Unit)
foreign import installScrollSync :: String -> String -> Effect (Effect Unit)
