// Transfer the canvas's drawing surface to a Web Worker that mounts the
// feltballs R3F scene. The `new URL(literal, import.meta.url)` form is what
// Turbopack scans to emit the worker as its own chunk — has to be in JS.
// A ref-guard prevents StrictMode's double-effect from re-transferring.
export const setupFeltballsImpl = (canvas) => () => {
  if (canvas._feltballsTransferred) return () => {}
  canvas._feltballsTransferred = true

  const worker = new Worker(
    new URL("../../app/feltballs.worker.js", import.meta.url),
    { type: "module" },
  )
  const offscreen = canvas.transferControlToOffscreen()

  const post = (type, payload) =>
    worker.postMessage({ type, payload }, type === "init" ? [offscreen] : [])

  post("init", {
    props: {},
    drawingSurface: offscreen,
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    top: canvas.offsetTop,
    left: canvas.offsetLeft,
    pixelRatio: window.devicePixelRatio,
  })

  const onResize = () =>
    post("resize", {
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      top: canvas.offsetTop,
      left: canvas.offsetLeft,
    })
  window.addEventListener("resize", onResize)

  return () => {
    window.removeEventListener("resize", onResize)
    worker.terminate()
  }
}
