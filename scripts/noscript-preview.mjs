// Fast iteration loop for the no-JS fallback in src/Layout/Root.purs.
//
// The fallback normally lives inside <noscript>, so you'd have to disable JS in
// devtools and rebuild the whole Next/RSC app to see a change. This serves it as a
// plain static page instead: it extracts the `retro = """ ... """` string from
// Root.purs (the single source of truth — no copy to drift), renders it OUTSIDE
// <noscript> so it always shows, and live-reloads the browser over SSE whenever
// Root.purs is saved. The gif/fonts are served from public/, with the /markgraf-www
// basePath rewritten away.
//
//   bun run scripts/noscript-preview.mjs   ->   http://localhost:8091
//
// When you like it, nothing to port back — Root.purs already is the source.

import { createServer } from "node:http"
import { readFile, readFileSync, statSync } from "node:fs"
import { extname, join, normalize } from "node:path"

const ROOT = "src/Layout/Root.purs"
const PORT = 8091
const MIME = {
  ".gif": "image/gif", ".png": "image/png", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".woff": "font/woff", ".otf": "font/otf",
  ".css": "text/css", ".js": "text/javascript", ".html": "text/html",
}

const extractRetro = () => {
  const src = readFileSync(ROOT, "utf8")
  const open = 'retro = """'
  const start = src.indexOf(open)
  if (start < 0) return "<pre>could not find retro string in " + ROOT + "</pre>"
  const from = start + open.length
  const end = src.indexOf('"""', from)
  return src.slice(from, end).replaceAll("/markgraf-www/", "/")
}

const page = () => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>noscript preview — markgraf</title>
<style>
  @font-face { font-family: "Sinistre"; src: url("/fonts/sinistre/SinistreVF.woff2") format("woff2");
    font-weight: 100 900; font-display: swap; }
</style>
</head><body>
${extractRetro()}
<script>
  // Poll the source file's mtime; reload when it changes. Robust across every editor
  // (atomic save, in-place write) — no fs.watch flakiness.
  let last = null;
  setInterval(async () => {
    try {
      const v = await (await fetch("/mtime", { cache: "no-store" })).text();
      if (last !== null && v !== last) location.reload();
      last = v;
    } catch (e) {}
  }, 400);
</script>
</body></html>`

const mtime = () => { try { return String(statSync(ROOT).mtimeMs) } catch { return "0" } }

createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0])
  if (url === "/" || url === "/index.html") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" })
    res.end(page())
    return
  }
  if (url === "/mtime") {
    res.writeHead(200, { "content-type": "text/plain", "cache-control": "no-store" })
    res.end(mtime())
    return
  }
  const file = join("public", normalize(url).replace(/^(\.\.[/\\])+/, ""))
  readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); res.end("not found: " + url); return }
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" })
    res.end(buf)
  })
}).listen(PORT, () => console.log(`[noscript-preview] http://localhost:${PORT}  (live-reloads on ${ROOT} save)`))
