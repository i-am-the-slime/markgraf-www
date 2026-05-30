import { CanvasTexture, LinearMipmapLinearFilter } from "three"

// Per-frame reads off the r3f root state, mirroring Scene.js's accessors.
export const readClockElapsedImpl = (state) => state.clock.getElapsedTime()
export const readPointerXImpl = (state) => state.pointer.x
export const readPointerYImpl = (state) => state.pointer.y
export const readAspectImpl = (state) => state.size.width / state.size.height
// The shader projects from gl_FragCoord against uRes, so it needs the
// drawing-buffer size (CSS size x device-pixel-ratio), not the CSS size.
export const readBufferWidthImpl = (state) => state.size.width * state.viewport.dpr
export const readBufferHeightImpl = (state) => state.size.height * state.viewport.dpr

// Draws "INSTALL" to an offscreen 2D canvas in the brand font and hands back a
// THREE.CanvasTexture. The shader stamps this as a black stencil on the morphing
// shape. Pure drawing, so it stays in JS; all animation logic lives in PureScript.
const drawTextTexture = (str) => {
  const c = document.createElement("canvas")
  c.width = 1024
  c.height = 256
  const x = c.getContext("2d")
  x.clearRect(0, 0, 1024, 256)
  x.fillStyle = "#fff"
  x.font = '700 140px "Space Grotesk", ui-sans-serif, sans-serif'
  x.textAlign = "center"
  x.textBaseline = "middle"
  x.letterSpacing = "30px"
  x.fillText(str, 512 + 13, 138)
  const t = new CanvasTexture(c)
  t.minFilter = LinearMipmapLinearFilter
  t.anisotropy = 4
  return t
}

export const makeTextTextureImpl = (str) => () => drawTextTexture(str)

// Re-draw the label once the web font has actually loaded, so the brand face is
// never missed on first paint. Calls back with the fresh texture.
export const refreshTextOnFontLoadImpl = (str) => (handler) => () => {
  if (!document.fonts) return
  document.fonts.load('700 140px "Space Grotesk"').then(() => {
    handler(drawTextTexture(str))()
  })
}
