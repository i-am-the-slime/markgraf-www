// Bundle markgraf's compiled layout-export module into a single self-contained
// ESM file inside the project root, so the Next/turbopack bundler never has to
// resolve imports out of tree. Re-run after rebuilding markgraf.
import { build } from "esbuild"
import { homedir } from "node:os"
import { join } from "node:path"

const entry = join(homedir(), "code/markgraf/output/Markgraf.Animation.Layout.Export/index.js")
const outfile = join(import.meta.dirname, "../src/generated/markgraf-layout.mjs")

await build({
  entryPoints: [entry],
  bundle: true,
  format: "esm",
  outfile,
})

console.log(`[markgraf-layout] bundled ${entry} -> ${outfile}`)
