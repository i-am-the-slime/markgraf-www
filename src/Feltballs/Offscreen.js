// Transfer the canvas's drawing surface to a Web Worker that mounts the
// feltballs R3F scene. The `new URL(literal, import.meta.url)` form is what
// Turbopack scans to emit the worker as its own chunk — has to be in JS.
// A ref-guard prevents StrictMode's double-effect from re-transferring.
export const setupFeltballsImpl = (pixelBudget) => (canvas) => () => {
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

  // pixelBudget passed in from PureScript; dpr is a uniform scale so the
  // canvas's aspect ratio is preserved automatically.
  const targetDpr = () => {
    const w = Math.max(1, canvas.clientWidth)
    const h = Math.max(1, canvas.clientHeight)
    return Math.min(1, Math.sqrt(pixelBudget / (w * h)))
  }

  post("init", {
    props: {
      camera: { position: [0, -3, 9], rotation: [0.28, 0, 0], fov: 85 },
      gl: { alpha: true },
      dpr: targetDpr(),
    },
    drawingSurface: offscreen,
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    top: canvas.offsetTop,
    left: canvas.offsetLeft,
    pixelRatio: targetDpr(),
  })

  const onResize = () => {
    post("props", { dpr: targetDpr() })
    post("resize", {
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      top: canvas.offsetTop,
      left: canvas.offsetLeft,
    })
  }
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

  // Explode the balls outward as the hero scrolls out of view, gather them
  // back when it returns. Trigger at 50% so there's headroom for the
  // animation before the frameloop pauses (canvas observer above kicks in at
  // threshold 0). Observed on the hero section, not the canvas, because the
  // canvas may extend slightly past the hero in flex layouts.
  const heroSection = (typeof document !== "undefined") ? document.getElementById("page-hero") : null
  let heroObserver = null
  if (heroSection) {
    let exploded = false
    heroObserver = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1]
        if (!e) return
        const shouldExplode = e.intersectionRatio < 0.92
        if (shouldExplode && !exploded) { post("explode", {}); exploded = true }
        else if (!shouldExplode && exploded) { post("gather", {}); exploded = false }
      },
      { threshold: [0, 0.5, 0.85, 0.9, 0.92, 0.95, 1] },
    )
    heroObserver.observe(heroSection)
  }

  return () => {
    stopChainTicker()
    observer.disconnect()
    if (heroObserver) heroObserver.disconnect()
    window.removeEventListener("resize", onResize)
    worker.terminate()
  }
}
