module Build.FontGlyphs (charsetFromSources) where

import Prelude

import Data.Array as Array
import Data.Foldable (fold, foldMap)
import Data.List (List(..))
import Data.String.CodePoints (fromCodePointArray, toCodePointArray)
import Data.String.CodeUnits as CU
import PureScript.CST.Lexer (lex)
import PureScript.CST.TokenStream (TokenStep(..), TokenStream, step)
import PureScript.CST.Types (Token(..))

-- | Every glyph the site can render, as one deduplicated string for the font
-- | subsetter. It is printable ASCII — so any new letter or punctuation typed
-- | into a headline is always covered — plus the characters of every string and
-- | char literal across the given PureScript sources.
-- |
-- | The sources are lexed with natefaubion's CST lexer rather than scanned by
-- | hand, so string gaps and escapes resolve to their real values and comments
-- | contribute nothing — only literals, which is exactly what reaches the page.
charsetFromSources :: Array String -> String
charsetFromSources sources = fromCodePointArray (Array.nub (toCodePointArray text))
  where
  text = asciiPrintable <> foldMap literalsOf sources

-- The concatenation of every string/char literal in one source file. Walks the
-- token stream tail-recursively, stopping at end-of-file or the first lex error.
literalsOf :: String -> String
literalsOf src = fold (collect (lex src) Nil)
  where
  collect ts acc = case step ts of
    TokenEOF _ _ -> acc
    TokenError _ _ _ _ -> acc
    TokenCons token _ rest _ -> collect rest (Cons (literalText token.value) acc)

-- The decoded payload of a literal token; every other token contributes nothing.
literalText :: Token -> String
literalText = case _ of
  TokString _ value -> value
  TokRawString value -> value
  TokChar _ char -> CU.singleton char
  _ -> ""

asciiPrintable :: String
asciiPrintable = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
