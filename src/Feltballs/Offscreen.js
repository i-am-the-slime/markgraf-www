// Transfer the canvas's drawing surface to a Web Worker that mounts the
// feltballs R3F scene. The `new URL(literal, import.meta.url)` form is what
// Turbopack scans to emit the worker as its own chunk — has to be in JS.
// A ref-guard prevents StrictMode's double-effect from re-transferring.
export const setupFeltballsImpl = (canvas) => () => {
  if (canvas._feltballsTransferred) return () => {}
  canvas._feltballsTransferred = true

  // Worker bundled out-of-band by scripts/build-feltballs-worker.mjs (esbuild),
  // not via Turbopack: dev-mode Turbopack injects React Fast Refresh signatures
  // into PS-compiled modules and they crash in a Worker context. Served from
  // /public so the Next-bundler never sees it.
  const worker = new Worker("/markgraf-www/feltballs-worker.js", { type: "module" })
  worker.addEventListener("error", (e) => console.error("[feltballs-worker] error:", e.message, "at", e.filename + ":" + e.lineno))
  worker.addEventListener("messageerror", (e) => console.error("[feltballs-worker] messageerror:", e))
  worker.addEventListener("message", (e) => {
    if (e.data?.type === "diag") console.log("[fb-worker]", e.data.msg, e.data.extra ?? "")
    else if (e.data?.type === "error") console.error("[feltballs-worker] init error:", e.data)
  })
  const offscreen = canvas.transferControlToOffscreen()

  const post = (type, payload) =>
    worker.postMessage({ type, payload }, type === "init" ? [offscreen] : [])

  post("init", {
    props: {
      camera: { position: [0, -3, 9], rotation: [0.28, 0, 0], fov: 85 },
      gl: { alpha: true },
      // Clamp dpr at 1 (no retina upscale). Scene is decorative + noise overlay
      // hides aliasing. Cuts fragment work to ~25% of native 2x DPR.
      dpr: 1,
    },
    drawingSurface: offscreen,
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    top: canvas.offsetTop,
    left: canvas.offsetLeft,
    pixelRatio: 1,
  })

  const onResize = () =>
    post("resize", {
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      top: canvas.offsetTop,
      left: canvas.offsetLeft,
    })
  window.addEventListener("resize", onResize)

  // Periodically nudge the worker to start a chain from a random ball — the
  // scene itself doesn't take user input anymore. Only fires while visible
  // (we set/clear the interval from the IntersectionObserver below).
  let chainTimer = null
  const startChainTicker = () => {
    if (chainTimer) return
    chainTimer = setInterval(() => post("startChain", {}), 4500)
  }
  const stopChainTicker = () => {
    if (chainTimer) { clearInterval(chainTimer); chainTimer = null }
  }

  // Pause R3F's frameloop when the canvas scrolls off-screen — the worker
  // already accepts a {type:"props"} message and re-`root.configure`s with it.
  // "never" stops the loop entirely; "always" resumes the rAF tick.
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((e) => e.isIntersecting)
      post("props", { frameloop: visible ? "always" : "never" })
      if (visible) startChainTicker(); else stopChainTicker()
    },
    { threshold: 0 },
  )
  observer.observe(canvas)

  return () => {
    stopChainTicker()
    observer.disconnect()
    window.removeEventListener("resize", onResize)
    worker.terminate()
  }
}
