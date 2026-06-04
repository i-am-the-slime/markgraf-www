module Build.SubsetFonts (main) where

import Prelude

import Build.FontGlyphs (charsetFromSources)
import Data.Foldable (for_)
import Data.String.CodePoints as CodePoints
import Data.Traversable (traverse)
import Effect (Effect)
import Effect.Aff (Aff, launchAff_)
import Effect.Class (liftEffect)
import Effect.Class.Console (log)
import Effect.Uncurried (EffectFn1, EffectFn2, runEffectFn1, runEffectFn2)
import Promise (Promise)
import Promise.Aff (toAffE)

-- | Regenerate the subset web fonts from the masters in fonts-src/. The glyph
-- | set is the literals lexed out of every component (Build.FontGlyphs); each
-- | master is subsetted to exactly that set so the served fonts stay tiny.
-- | Run after `spago build`, via `bun run fonts`.
main :: Effect Unit
main = do
  sources <- traverse readText =<< glob "src/**/*.purs"
  let charset = charsetFromSources sources
  log ("charset: " <> show (CodePoints.length charset) <> " glyphs")
  launchAff_ (for_ faces (subsetFace charset))

faces :: Array { master :: String, served :: String }
faces =
  [ { master: "fonts-src/sinistre/SinistreVF.woff2", served: "public/fonts/sinistre/SinistreVF.woff2" }
  , { master: "fonts-src/Ilisarniq-Demi.otf", served: "public/fonts/Ilisarniq-Demi.woff2" }
  , { master: "fonts-src/CommitMono-Regular.woff2", served: "public/fonts/CommitMono-Regular.woff2" }
  ]

subsetFace :: String -> { master :: String, served :: String } -> Aff Unit
subsetFace charset face = do
  subset <- subsetWoff2 charset =<< (readBytes face.master # liftEffect)
  writeBytes face.served subset # liftEffect
  log (show (byteLength subset / 1024) <> " KB  " <> face.served)

-- FFI edge: globbing, file I/O, and the harfbuzz-WASM subsetter are JS
-- libraries. Bytes is an opaque Node Buffer that only ever passes through.

foreign import data Bytes :: Type

glob :: String -> Effect (Array String)
glob = runEffectFn1 globImpl

foreign import globImpl :: EffectFn1 String (Array String)

readText :: String -> Effect String
readText = runEffectFn1 readTextImpl

foreign import readTextImpl :: EffectFn1 String String

readBytes :: String -> Effect Bytes
readBytes = runEffectFn1 readBytesImpl

foreign import readBytesImpl :: EffectFn1 String Bytes

writeBytes :: String -> Bytes -> Effect Unit
writeBytes = runEffectFn2 writeBytesImpl

foreign import writeBytesImpl :: EffectFn2 String Bytes Unit

subsetWoff2 :: String -> Bytes -> Aff Bytes
subsetWoff2 charset bytes = toAffE (runEffectFn2 subsetFontImpl bytes charset)

foreign import subsetFontImpl :: EffectFn2 Bytes String (Promise Bytes)

foreign import byteLength :: Bytes -> Int
