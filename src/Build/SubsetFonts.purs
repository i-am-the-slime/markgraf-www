module Build.SubsetFonts (main) where

import Prelude

import Build.FontGlyphs (charsetFromSources)
import Data.Array as Array
import Data.Foldable (for_)
import Data.String.CodePoints as CodePoints
import Data.Traversable (traverse)
import Effect (Effect)
import Effect.Aff (Aff, launchAff_)
import Effect.Class (liftEffect)
import Effect.Class.Console (log)
import Effect.Uncurried (EffectFn2, runEffectFn2)
import Node.Buffer (Buffer, size)
import Node.Encoding (Encoding(UTF8))
import Node.FS.Aff (readFile, readTextFile, writeFile)
import Node.Glob.Basic (expandGlobsCwd)
import Promise (Promise)
import Promise.Aff (toAffE)

-- | Regenerate the subset web fonts from the masters in fonts-src/. The glyph
-- | set is the literals lexed out of every component (Build.FontGlyphs); each
-- | master is subsetted to exactly that set so the served fonts stay tiny.
-- | Run after `spago build`, via `bun run fonts`.
main :: Effect Unit
main = launchAff_ do
  sources <- traverse (readTextFile UTF8) =<< Array.fromFoldable <$> expandGlobsCwd [ "src/**/*.purs" ]
  let charset = charsetFromSources sources
  log ("charset: " <> show (CodePoints.length charset) <> " glyphs")
  for_ faces (subsetFace charset)

faces :: Array { master :: String, served :: String }
faces =
  [ { master: "fonts-src/sinistre/SinistreVF.woff2", served: "public/fonts/sinistre/SinistreVF.woff2" }
  , { master: "fonts-src/Ilisarniq-Demi.otf", served: "public/fonts/Ilisarniq-Demi.woff2" }
  , { master: "fonts-src/CommitMono-Regular.woff2", served: "public/fonts/CommitMono-Regular.woff2" }
  ]

subsetFace :: String -> { master :: String, served :: String } -> Aff Unit
subsetFace charset face = do
  subset <- subsetWoff2 charset =<< readFile face.master
  writeFile face.served subset
  kb <- size subset # liftEffect
  log (show (kb / 1024) <> " KB  " <> face.served)

-- The harfbuzz-WASM subsetter is the one genuinely-external dependency, so it
-- is the only FFI left; everything else is node-fs / node-glob-basic.
subsetWoff2 :: String -> Buffer -> Aff Buffer
subsetWoff2 charset buffer = toAffE (runEffectFn2 subsetFontImpl buffer charset)

foreign import subsetFontImpl :: EffectFn2 Buffer String (Promise Buffer)
