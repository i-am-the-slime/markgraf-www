// Dynamic import of the compiled LabSections module. The literal path lets the
// bundler split the lab spreads (and their framer-motion variant usage) into a
// separate async chunk; resolving to the labSpreads function.
// Effect (Promise (LabDeps -> Array JSX)) => () => Promise.
export const importLabSectionsImpl = () =>
  import("../Component.LabSections/index.js").then((m) => m.labSpreads)
