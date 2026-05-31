// Irreducible browser bits only — no logic, no design choices. The label text,
// font, metrics, the per-frame maths and the load/redraw sequencing all live in
// the PureScript; this file just talks to the 2D canvas + Font Loading API.
//
// No `three` import either: r3f builds the CanvasTexture from this canvas with its
// own THREE instance (a texture minted from a second THREE copy never uploads).

// Paint a label config { text, font, letterSpacing, offsetX } onto a 2D canvas.
const draw = (canvas, cfg) => {
  const x = canvas.getContext("2d")
  x.clearRect(0, 0, canvas.width, canvas.height)
  x.fillStyle = "#fff"
  x.font = cfg.font
  x.textAlign = "center"
  x.textBaseline = "middle"
  x.fontKerning = "normal"
  x.letterSpacing = cfg.letterSpacing
  x.fillText(cfg.text, canvas.width / 2 + cfg.offsetX, canvas.height / 2)
}

// EffectFn1 impl: uncurried, returns the canvas directly (runEffectFn1 wraps the effect).
export const makeLabelCanvasImpl = (cfg) => {
  const c = document.createElement("canvas")
  c.width = 1024
  c.height = 256
  draw(c, cfg)
  return c
}

export const redrawLabelImpl = (canvas) => (cfg) => () => draw(canvas, cfg)

// The brand font's load as an Effect (Promise Unit); PureScript sequences the
// redraw + texture re-upload off it. Resolves immediately if the API is absent.
export const awaitFontImpl = (font) => () =>
  typeof document !== "undefined" && document.fonts
    ? document.fonts.load(font).then(() => {})
    : Promise.resolve()

export const markTextureDirtyImpl = (texture) => () => {
  texture.needsUpdate = true
}
