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
import React.Basic (JSX, ReactComponent, element)
import React.Basic.DOM as D
import React.Basic.DOM.Events (targetValue)
import React.Basic.Events (handler)
import React.Basic.Hooks (Component, component, useEffect, useState')
import React.Basic.Hooks as Hooks

mkHeroPreview :: Component {}
mkHeroPreview = component "HeroPreview" \_ -> Hooks.do
  progress /\ setProgress <- useState' 0.0
  useEffect unit do
    onScrollProgress "scroll-stage" setProgress
  pure $
    D.main
      { className: "bg-[#0a0e1a] text-[#f5f1e8] relative"
      , children:
          [ scrollStage progress
          , playground {}
          , languageSection
          , renderSection
          , footerSection
          ]
      }

-- ---------------------------------------------------------------------------
-- Live playground: textarea + syntax-highlight overlay + markgraf preview.
-- ---------------------------------------------------------------------------

defaultSource :: String
defaultSource =
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

playground :: {} -> JSX
playground = unsafePerformEffect mkPlayground

mkPlayground :: Component {}
mkPlayground = component "Playground" \_ -> Hooks.do
  src /\ setSrc <- useState' defaultSource
  debounced /\ setDebounced <- useState' defaultSource
  size /\ setSize <- useState' { w: 0.0, h: 0.0 }
  useEffect src do
    launchAff_ do
      delay (Milliseconds 250.0)
      liftEffect (setDebounced src)
    pure (pure unit)
  useEffect unit do
    onElementResize "markgraf-preview" setSize
  pure (playgroundView src setSrc debounced size)

playgroundView :: String -> (String -> Effect Unit) -> String -> { w :: Number, h :: Number } -> JSX
playgroundView src setSrc rendered size =
  D.section
    { id: "playground"
    , className: "relative z-10 bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-12"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto"
            , children:
                [ D.div
                    { className: "flex items-baseline justify-between mb-6 gap-6 flex-wrap"
                    , children:
                        [ D.div_
                            [ sectionLabel "01 / playground"
                            , D.h2
                                { className: "text-3xl sm:text-4xl font-bold tracking-tight leading-none"
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
                , editorAndPreview src setSrc rendered size
                ]
            }
        ]
    }

editorAndPreview :: String -> (String -> Effect Unit) -> String -> { w :: Number, h :: Number } -> JSX
editorAndPreview src setSrc rendered size =
  D.div
    { style: D.css
        { display: "grid"
        , gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)"
        , gap: "1px"
        , backgroundColor: "#1a1f2e"
        , border: "1px solid #1a1f2e"
        , borderRadius: "12px"
        , overflow: "hidden"
        , minHeight: "360px"
        , maxHeight: "440px"
        }
    , children:
        [ editorPane src setSrc
        , previewPane rendered size
        ]
    }

editorPane :: String -> (String -> Effect Unit) -> JSX
editorPane src setSrc =
  D.div
    { className: "flex flex-col overflow-hidden bg-[#0a0e1a]"
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
                    { style: D.css
                        { position: "absolute"
                        , inset: "0"
                        , margin: "0"
                        , padding: "14px 18px"
                        , whiteSpace: "pre-wrap"
                        , wordBreak: "break-word"
                        , overflow: "auto"
                        , pointerEvents: "none"
                        , color: "#c8cdd9"
                        , fontFamily: "inherit"
                        , fontSize: "inherit"
                        , lineHeight: "inherit"
                        }
                    , children: highlight src <> [ D.text "\n" ]
                    }
                , D.textarea
                    { value: src
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
                        , fontFamily: "inherit"
                        , fontSize: "inherit"
                        , lineHeight: "inherit"
                        }
                    }
                ]
            }
        ]
    }

previewPane :: String -> { w :: Number, h :: Number } -> JSX
previewPane src size =
  D.div
    { className: "flex flex-col overflow-hidden bg-[#0a0e1a]"
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
                if size.w <= 0.0 || size.h <= 0.0
                  then []
                  else
                    [ element markgrafPlayerComponent
                        { src
                        , renderer: "svg"
                        , theme: "dark"
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

-- | A 4× viewport scroll container holding the sticky 3D stage. The longer
-- | run gives the camera real distance to travel through three acts.
scrollStage :: Number -> JSX
scrollStage progress =
  D.div
    { id: "scroll-stage"
    , className: "relative"
    , style: D.css { height: "220vh" }
    , children:
        [ D.div
            { className: "sticky top-0 h-screen w-full overflow-hidden"
            , children:
                [ D.div
                    { className: "absolute inset-0"
                    , children: [ element feltballsComponent {} ]
                    }
                , D.div
                    { className: "absolute inset-0"
                    , children: [ element sceneComponent {} ]
                    }
                , topBar
                , heroLockup progress
                , captionLayer progress
                , bottomMeta progress
                ]
            }
        ]
    }

topBar :: JSX
topBar =
  D.div
    { className: "absolute top-0 inset-x-0 z-20 flex items-center justify-between px-8 py-5 font-mono text-[11px] uppercase tracking-[0.28em] text-[#8a94a8]"
    , children:
        [ D.span
            { style: D.css { fontFamily: "'Sinistre', serif", letterSpacing: "0.05em", fontSize: "15px" }
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

-- | Act 0 lockup: huge Sinistre wordmark + tagline + install pill.
-- | Visible 0..0.18, fades out by 0.28.
heroLockup :: Number -> JSX
heroLockup progress =
  D.div
    { className: "absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-6"
    , style: D.css
        { opacity: show (1.0 - smooth01 progress 0.16 0.30)
        , transform: "translateY(" <> show (progress * -100.0) <> "px)"
        }
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

-- | Cross-fading captions for Acts 1, 2, 3.
captionLayer :: Number -> JSX
captionLayer progress =
  D.div
    { className: "absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
    , children:
        [ caption progress 0.32 0.58 "Every Frame Is a State of Your System"
        , caption progress 0.58 0.82 "Tokens Carry Data Between Nodes"
        , caption progress 0.82 1.10 "Now Imagine Yours."
        ]
    }

caption :: Number -> Number -> Number -> String -> JSX
caption progress start endP text =
  D.p
    { className: "absolute max-w-3xl text-center text-3xl sm:text-5xl md:text-6xl leading-[0.95] font-bold text-[#f5f1e8] tracking-tight"
    , style: D.css
        { fontFamily: "'Sinistre', serif"
        , opacity: show (triangleFade progress start endP)
        , transform: "translateY(" <> show (captionYOffset progress start endP) <> "px)"
        , textShadow: "0 0 90px rgba(10,14,26,0.75)"
        }
    , children: [ D.text text ]
    }

-- Triangle fade: 0 at start, 1 at midpoint, 0 at end.
triangleFade :: Number -> Number -> Number -> Number
triangleFade p s e
  | p <= s    = 0.0
  | p >= e    = 0.0
  | otherwise =
      let
        mid = (s + e) / 2.0
        d   = abs (p - mid) / ((e - s) / 2.0)
      in max 0.0 (1.0 - d)

captionYOffset :: Number -> Number -> Number -> Number
captionYOffset p s e =
  let mid = (s + e) / 2.0
  in (p - mid) * -80.0

-- Smoothstep 0→1 in [s,e]
smooth01 :: Number -> Number -> Number -> Number
smooth01 p s e
  | p <= s    = 0.0
  | p >= e    = 1.0
  | otherwise =
      let t = (p - s) / (e - s)
      in t * t * (3.0 - 2.0 * t)

abs :: Number -> Number
abs n = if n < 0.0 then -n else n

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

bottomMeta :: Number -> JSX
bottomMeta progress =
  D.div
    { className: "absolute bottom-0 inset-x-0 z-20 flex items-end justify-between px-8 py-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6478] pointer-events-none"
    , children:
        [ D.span_ [ D.text ("act " <> actLabel progress) ]
        , D.div
            { className: "flex items-center gap-3 opacity-70"
            , style: D.css { opacity: show (max 0.0 (1.0 - progress * 2.0)) }
            , children:
                [ D.text "scroll"
                , D.span_ [ D.text "↓" ]
                ]
            }
        ]
    }

actLabel :: Number -> String
actLabel p
  | p < 0.30  = "00 / hero"
  | p < 0.65  = "01 / build"
  | p < 0.85  = "02 / orbit"
  | otherwise = "03 / mesh"

-- ---------------------------------------------------------------------------
-- Content sections after the sticky hero
-- ---------------------------------------------------------------------------

languageSection :: JSX
languageSection =
  D.section
    { id: "language"
    , className: "relative z-10 bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-32"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto"
            , children:
                [ sectionLabel "02 / language"
                , D.h2
                    { className: "text-5xl sm:text-7xl font-bold tracking-tight leading-[0.95] mb-8 max-w-3xl"
                    , style: D.css { fontFamily: "'Sinistre', serif" }
                    , children: [ D.text "A Frame Is One Beat. A Token Is One Hop." ]
                    }
                , D.p
                    { className: "text-lg text-[#8a94a8] max-w-2xl leading-relaxed mb-16"
                    , children: [ D.text "Eight keywords. Everything else is naming things." ]
                    }
                , D.div
                    { className: "grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16"
                    , children:
                        [ codeExample "+node / +edge" "structure the graph"
                            "frame setup {\n  +node client \"Client\"\n  +node api    \"API\"\n  +edge client api\n}"
                        , codeExample "tokens" "data flow between nodes"
                            "frame \"request\" {\n  client -> api \"GET /user\"\n  client <- api \"200 OK\"\n}"
                        , codeExample "par" "things that happen at once"
                            "frame \"fanout\" {\n  par {\n    api -> cache \"WARM\"\n    api -> logger \"trace\"\n  }\n}"
                        , codeExample "chains" "one continuous motion through a stack"
                            "client -> api  \"GET\"\napi    -> db   \"SELECT\"\napi    <- db   \"row\"\nclient <- api  \"200\""
                        ]
                    }
                ]
            }
        ]
    }

codeExample :: String -> String -> String -> JSX
codeExample name what source =
  D.div
    { className: "flex flex-col gap-3"
    , children:
        [ D.div
            { className: "flex items-baseline gap-3"
            , children:
                [ D.span
                    { className: "font-mono text-sm text-[#ff3b1a]"
                    , children: [ D.text name ]
                    }
                , D.span
                    { className: "text-sm text-[#8a94a8]"
                    , children: [ D.text what ]
                    }
                ]
            }
        , D.pre
            { className: "bg-[#11162280] backdrop-blur-sm border border-[#2a3142] rounded-lg px-5 py-4 text-sm overflow-x-auto leading-relaxed text-[#c8cdd9] font-mono"
            , children: [ D.code_ [ D.text source ] ]
            }
        ]
    }

renderSection :: JSX
renderSection =
  D.section
    { id: "render"
    , className: "relative z-10 bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-32"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto"
            , children:
                [ sectionLabel "03 / render"
                , D.h2
                    { className: "text-5xl sm:text-7xl font-bold tracking-tight leading-[0.95] mb-8 max-w-3xl"
                    , style: D.css { fontFamily: "'Sinistre', serif" }
                    , children: [ D.text "Pipe In. Ship Anywhere." ]
                    }
                , D.p
                    { className: "text-lg text-[#8a94a8] max-w-2xl leading-relaxed mb-16"
                    , children: [ D.text "Native player on macOS, mp4 with ffmpeg embedded, animated SVG, gif, or a static sequence diagram." ]
                    }
                , D.div
                    { className: "grid grid-cols-2 md:grid-cols-3 gap-4"
                    , children:
                        [ renderCard "--play"     "native player"
                        , renderCard "-o out.mp4" "encode mp4"
                        , renderCard "--svg"      "vector"
                        , renderCard "--gif"      "keyframe gif"
                        , renderCard "--sequence" "sequence diagram"
                        , renderCard "--check"    "typecheck only"
                        ]
                    }
                ]
            }
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

footerSection :: JSX
footerSection =
  D.section
    { className: "relative z-10 bg-[#0a0e1a] border-t border-[#1a1f2e] px-6 sm:px-12 py-24"
    , children:
        [ D.div
            { className: "max-w-5xl mx-auto flex flex-col gap-12"
            , children:
                [ D.div
                    { className: "flex flex-col gap-6"
                    , children:
                        [ D.h2
                            { className: "text-4xl sm:text-6xl font-bold tracking-tight leading-[0.95]"
                            , style: D.css { fontFamily: "'Sinistre', serif" }
                            , children: [ D.text "Now Imagine Yours." ]
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
    { className: "font-mono text-[11px] uppercase tracking-[0.3em] text-[#ff3b1a] mb-8"
    , children: [ D.text text ]
    }

foreign import sceneComponent :: ReactComponent {}
foreign import feltballsComponent :: ReactComponent {}
foreign import markgrafPlayerComponent
  :: ReactComponent
       { src :: String
       , renderer :: String
       , width :: Number
       , height :: Number
       }
foreign import onScrollProgress :: String -> (Number -> Effect Unit) -> Effect (Effect Unit)
foreign import onElementResize :: String -> ({ w :: Number, h :: Number } -> Effect Unit) -> Effect (Effect Unit)
