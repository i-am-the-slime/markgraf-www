import subsetFont from "subset-font"

export const subsetFontImpl = (bytes, text) => subsetFont(bytes, text, { targetFormat: "woff2" })
