// Bundle the feltballs worker into a self-contained ESM file in public/.
// We do this outside Turbopack because Turbopack injects React Fast Refresh
// signatures into compiled PureScript modules, which break inside a Web
// Worker context (the signed renderFn becomes undefined and the component's
// internal call to renderFn(props) throws "renderFn is not a function").

import { build } from "esbuild"

await build({
  entryPoints: ["app/feltballs.worker.js"],
  outfile: "public/feltballs-worker.js",
  bundle: true,
  format: "esm",
  target: "esnext",
  platform: "browser",
  define: { "process.env.NODE_ENV": '"production"' },
  // No source maps / minification — keep readable for debugging.
})
console.log("built public/feltballs-worker.js")
