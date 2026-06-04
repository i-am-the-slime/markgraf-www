// Regenerate the subset web fonts in public/fonts from the full masters in
// fonts-src/. Masters keep every glyph; the served fonts carry only the glyphs
// the site can render, so the eager font payload stays small. Runs on every
// build (and via `bun run fonts`) so the subsets always match the source.
//
// The glyph set is computed in PureScript (Build.FontGlyphs) by lexing every
// component with natefaubion's CST lexer and collecting the literals — assumes a
// prior `spago build`. This driver just reads the sources, asks for the charset,
// and subsets each master with subset-font (harfbuzz compiled to WASM).
//
// The mono backs the editable playground textarea, so pasted text outside the
// charset falls back to a system mono; widen the ASCII floor if that matters.
import subsetFont from "subset-font"
import { readFile, writeFile } from "node:fs/promises"
import { charsetFromSources } from "../output/Build.FontGlyphs/index.js"

const sources = []
for await (const file of new Bun.Glob("src/**/*.purs").scan(".")) sources.push(await readFile(file, "utf8"))
const text = charsetFromSources(sources)
console.log(`charset: ${[...text].length} glyphs`)

const sub = async (input, output) => {
  const subset = await subsetFont(await readFile(input), text, { targetFormat: "woff2" })
  await writeFile(output, subset)
  console.log(`${(subset.length / 1024).toFixed(1).padStart(6)} KB  ${output}`)
}

await sub("fonts-src/sinistre/SinistreVF.woff2", "public/fonts/sinistre/SinistreVF.woff2")
await sub("fonts-src/Ilisarniq-Demi.otf", "public/fonts/Ilisarniq-Demi.woff2")
await sub("fonts-src/CommitMono-Regular.woff2", "public/fonts/CommitMono-Regular.woff2")
