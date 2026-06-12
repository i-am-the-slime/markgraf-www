// Thin WebGL1 binding. Raw GL calls only — no rendering logic, which lives in
// PureScript. The drawing surface is the same CanvasElement Graphics.Canvas uses.

const CONTEXT_OPTIONS = { alpha: true, premultipliedAlpha: true, antialias: true, depth: false }

export const getContextImpl = (canvas) => canvas.getContext("webgl", CONTEXT_OPTIONS)

export const buildProgramImpl = (gl, vertexSource, fragmentSource) => {
  const compile = (type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(shader))
    return shader
  }
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(program))
  gl.useProgram(program)
  return program
}

// A fullscreen quad bound to the vec2 attribute `position`, drawn as a strip.
export const setupQuadImpl = (gl, program) => {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const location = gl.getAttribLocation(program, "position")
  gl.enableVertexAttribArray(location)
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0)
}

export const getExtensionImpl = (gl, name) => gl.getExtension(name)

export const uniformLocationImpl = (gl, program, name) => gl.getUniformLocation(program, name)
export const uniform1fImpl = (gl, location, x) => gl.uniform1f(location, x)
export const uniform2fImpl = (gl, location, x, y) => gl.uniform2f(location, x, y)
export const uniform1iImpl = (gl, location, x) => gl.uniform1i(location, x)
export const uniform4fvImpl = (gl, location, data) => gl.uniform4fv(location, new Float32Array(data))
export const uniform2fvImpl = (gl, location, data) => gl.uniform2fv(location, new Float32Array(data))
export const uniform1fvImpl = (gl, location, data) => gl.uniform1fv(location, new Float32Array(data))

export const createTextureImpl = (gl) => gl.createTexture()

// Upload a 2D canvas as the texture on unit 0, flipped to match canvas/GL axes,
// nearest-filtered with no mipmaps for crunchy unfiltered label texels.
export const uploadCanvasImpl = (gl, texture, canvas, unit) => {
  gl.activeTexture(gl.TEXTURE0 + unit)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
}

export const resizeImpl = (gl, canvas, width, height) => {
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
  gl.viewport(0, 0, width, height)
}

export const clearImpl = (gl) => {
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

export const drawQuadImpl = (gl) => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

export const clientSizeImpl = (canvas) => ({ width: canvas.clientWidth, height: canvas.clientHeight })

export const devicePixelRatioImpl = () => window.devicePixelRatio

export const nowImpl = () => performance.now()
