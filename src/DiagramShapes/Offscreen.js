// Irreducible browser plumbing for the diagramShapes offscreen scene. Everything
// with logic lives in Offscreen.purs; these are the calls PureScript can't make
// without FFI: constructing the Worker and the StrictMode transfer guard. The
// post channel is now a Ref passed from HeroPreview (no window global).

// Worker bundled out-of-band by scripts/build-diagram-shapes-worker.mjs (esbuild),
// not via Turbopack: dev-mode Turbopack injects React Fast Refresh signatures
// into PS-compiled modules and they crash in a Worker context. Served from
// /public so the Next-bundler never sees it — hence a static string path, not
// the `new URL(..., import.meta.url)` form.
export const newDiagramShapesWorker = () =>
  new Worker("/diagram-shapes-worker.js", { type: "module" })

// transferControlToOffscreen() throws if called twice on the same canvas, and
// React StrictMode double-invokes effects in dev. The on-screen <canvas> node is
// stable across that remount, so we mark it: returns true if setup already ran.
export const transferGuard = (canvas) => () => {
  if (canvas._diagramShapesTransferred) return true
  canvas._diagramShapesTransferred = true
  return false
}
