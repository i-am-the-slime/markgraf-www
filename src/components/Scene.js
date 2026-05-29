export const writeCssVarImpl = (name) => (value) => () => {
  if (typeof document === "undefined") return
  document.documentElement.style.setProperty(name, value)
}
