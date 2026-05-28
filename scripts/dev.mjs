import { context } from "esbuild"
import { watch } from "node:fs"
import { spawn } from "node:child_process"

const workerCtx = await context({
  entryPoints: ["app/feltballs.worker.js"],
  outfile: "public/feltballs-worker.js",
  bundle: true,
  format: "esm",
  target: "esnext",
  platform: "browser",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
})
await workerCtx.rebuild()
await workerCtx.watch()
console.log("[worker] esbuild watching app/feltballs.worker.js -> public/feltballs-worker.js")

let building = false
let queued = false

const runSpago = () => {
  if (building) { queued = true; return }
  building = true
  console.log("[purs] spago build")
  const p = spawn("bunx", ["spago", "build"], { stdio: "inherit" })
  p.on("exit", (code) => {
    building = false
    if (code !== 0) console.log(`[purs] spago build exited ${code}`)
    if (queued) { queued = false; runSpago() }
  })
}

watch("src", { recursive: true }, (_event, filename) => {
  if (filename && (filename.endsWith(".purs") || filename.endsWith(".js"))) {
    console.log(`[purs] change: ${filename}`)
    runSpago()
  }
})
console.log("[purs] watching src/**/*.{purs,js}")

const next = spawn("bunx", ["next", "dev"], { stdio: "inherit" })

let shuttingDown = false
const shutdown = (code = 0) => {
  if (shuttingDown) return
  shuttingDown = true
  try { next.kill("SIGTERM") } catch {}
  workerCtx.dispose().finally(() => process.exit(code))
}
process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))
next.on("exit", (code) => shutdown(code ?? 0))
