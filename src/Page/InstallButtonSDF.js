// No `three` import here: r3f builds the CanvasTexture from this canvas with its
// own THREE instance (see labelTexture in the .purs). Minting a texture from a
// second THREE copy here never uploads through r3f's renderer — the sampler stays
// black while numeric uniforms bind fine. So this file only does 2D drawing + reads.

// Per-frame reads off the r3f root state, mirroring Scene.js's accessors.
export const readPointerXImpl = (state) => state.pointer.x
export const readPointerYImpl = (state) => state.pointer.y
export const readAspectImpl = (state) => state.size.width / state.size.height
// The shader projects from gl_FragCoord against uRes, so it needs the
// drawing-buffer size (CSS size x device-pixel-ratio), not the CSS size.
export const readBufferWidthImpl = (state) => state.size.width * state.viewport.dpr
export const readBufferHeightImpl = (state) => state.size.height * state.viewport.dpr

// Draw "INSTALL" to an offscreen 2D canvas in the brand font. r3f wraps the
// returned canvas in a CanvasTexture and binds it to the shader's uText sampler.
const drawLabel = (canvas, str) => {
  const x = canvas.getContext("2d")
  x.clearRect(0, 0, canvas.width, canvas.height)
  x.fillStyle = "#fff"
  x.font = '800 144px "Sinistre", "Sinistre Fallback", serif'
  x.textAlign = "center"
  x.textBaseline = "middle"
  x.fontKerning = "normal"
  x.letterSpacing = "8px"
  x.fillText(str, 512 + 4, 128)
}

// EffectFn1 impl: uncurried, returns the canvas directly (runEffectFn1 wraps the effect).
export const makeLabelCanvasImpl = (str) => {
  const c = document.createElement("canvas")
  c.width = 1024
  c.height = 256
  drawLabel(c, str)
  return c
}

// Redraw the label once the brand web font has actually loaded (the first draw may
// fall back to a system face), then flag the texture so r3f re-uploads the canvas.
export const refreshLabelOnFontLoadImpl = (canvas) => (str) => (markDirty) => () => {
  if (!document.fonts) return
  document.fonts.load('800 144px "Sinistre"').then(() => {
    drawLabel(canvas, str)
    markDirty()
  })
}

// Flag a CanvasTexture so the renderer re-uploads it after the canvas is redrawn.
export const markTextureDirtyImpl = (texture) => () => {
  texture.needsUpdate = true
}
