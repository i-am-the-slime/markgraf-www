// Regenerate the subset web fonts in public/fonts from the full masters in
// fonts-src/. Masters keep every glyph; the served fonts carry only the glyphs
// the site can render, so the eager font payload stays small. Run on every
// build (and via `bun run fonts`) so the subsets always match the source.
//
// Bun-native — subset-font is harfbuzz compiled to WASM.
//
// Charset = printable ASCII (so any new letter/punctuation in a headline is
// always covered) PLUS every non-ASCII character that appears anywhere under
// src/ or app/. In PureScript/JSX source, non-ASCII only lives in string
// literals or comments, so scanning raw characters captures every glyph the
// site renders (em dash, curly quotes, nav arrows, …) without the fragility of
// parsing string boundaries. Unused Latin-1 accents — absent from the source —
// are dropped. The mono backs the editable playground textarea, so pasted text
// outside this set falls back to a system mono; widen the floor if that matters.
import subsetFont from "subset-font"
import { readFile, writeFile } from "node:fs/promises"

const asciiPrintable = Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCodePoint(0x20 + i)).join("")

const renderedChars = async () => {
  const used = new Set(asciiPrintable)
  const glob = new Bun.Glob("{src,app}/**/*.{purs,tsx,jsx,js}")
  for await (const file of glob.scan("."))
    for (const ch of await readFile(file, "utf8")) if (ch.codePointAt(0) > 0x7e) used.add(ch)
  return [...used].join("")
}

const sub = async (input, output, text) => {
  const subset = await subsetFont(await readFile(input), text, { targetFormat: "woff2" })
  await writeFile(output, subset)
  console.log(`${(subset.length / 1024).toFixed(1).padStart(6)} KB  ${output}`)
}

const text = await renderedChars()
console.log(`charset: ${[...text].length} glyphs`)
await sub("fonts-src/sinistre/SinistreVF.woff2", "public/fonts/sinistre/SinistreVF.woff2", text)
await sub("fonts-src/Ilisarniq-Demi.otf", "public/fonts/Ilisarniq-Demi.woff2", text)
await sub("fonts-src/CommitMono-Regular.woff2", "public/fonts/CommitMono-Regular.woff2", text)
