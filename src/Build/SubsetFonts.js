import subsetFont from "subset-font"
import { readFileSync, writeFileSync } from "node:fs"

export const globImpl = (pattern) => Array.from(new Bun.Glob(pattern).scanSync("."))

export const readTextImpl = (path) => readFileSync(path, "utf8")

export const readBytesImpl = (path) => readFileSync(path)

export const writeBytesImpl = (path, bytes) => writeFileSync(path, bytes)

export const subsetFontImpl = (bytes, text) => subsetFont(bytes, text, { targetFormat: "woff2" })

export const byteLength = (bytes) => bytes.length
