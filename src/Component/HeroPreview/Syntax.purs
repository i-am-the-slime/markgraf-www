module Component.HeroPreview.Syntax (highlight) where

import Prelude

import Data.Array as Array
import Data.Maybe (Maybe(..), fromMaybe)
import Data.String.CodeUnits as CU
import React.Basic (JSX)
import Yoga.React.DOM.HTML.Span (span)
import Yoga.React.DOM.Internal (css)

-- | Colored <span> children for the markgraf-source overlay.
highlight :: String -> Array JSX
highlight source = renderTok <$> tokenize source

renderTok :: { kind :: TokKind, text :: String } -> JSX
renderTok tok =
  span { style: css { color: tokColor tok.kind } } tok.text

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
tokColor = case _ of
  TKeyword -> "#ff3b1a"
  TOperator -> "#ff8a5c"
  TString -> "#5b8fd6"
  TNumber -> "#d9c97a"
  TComment -> "#5a6478"
  TBrace -> "#8a94a8"
  TIdent -> "#c8cdd9"
  TPlain -> "#c8cdd9"

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
