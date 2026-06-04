// Regenerate the subset web fonts in public/fonts from the full masters in
// fonts-src/. Masters keep every glyph; the served fonts carry only the ranges
// the site renders, so the eager font payload stays small.
//
// Bun-native — subset-font is harfbuzz compiled to WASM. Run: bun run fonts
//
// Ranges. Display faces (Sinistre, Ilisarniq) render English headlines/body:
// Basic Latin + Latin-1 (covers ×) + the dashes/curly-quotes/bullet/ellipsis we
// typeset. The mono (Commit Mono) backs a user-editable textarea AND the nav
// arrows, so it adds U+2190–2193; keep it at least Latin-1 so pasted European
// text doesn't tofu. Widen a range here rather than hand-editing call sites.
import subsetFont from "subset-font"
import { readFile, writeFile } from "node:fs/promises"

const display = [[0x20, 0x7e], [0xa0, 0xff], [0x2013, 0x2014], [0x2018, 0x2019], [0x201c, 0x201d], [0x2022, 0x2022], [0x2026, 0x2026]]
const mono = [...display, [0x2190, 0x2193]]

const textOf = (ranges) => {
  let s = ""
  for (const [a, b] of ranges) for (let c = a; c <= b; c++) s += String.fromCodePoint(c)
  return s
}

const sub = async (input, output, ranges) => {
  const subset = await subsetFont(await readFile(input), textOf(ranges), { targetFormat: "woff2" })
  await writeFile(output, subset)
  console.log(`${(subset.length / 1024).toFixed(1).padStart(6)} KB  ${output}`)
}

await sub("fonts-src/sinistre/SinistreVF.woff2", "public/fonts/sinistre/SinistreVF.woff2", display)
await sub("fonts-src/Ilisarniq-Demi.otf", "public/fonts/Ilisarniq-Demi.woff2", display)
await sub("fonts-src/CommitMono-Regular.woff2", "public/fonts/CommitMono-Regular.woff2", mono)
