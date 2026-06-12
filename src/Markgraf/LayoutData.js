// markgraf's compiled layout export, bundled self-contained into src/generated
// (built from ~/code/markgraf output; see scripts/build-markgraf-layout.mjs).
// The path is relative to this file's compiled home, output/Markgraf.LayoutData/,
// not its source location — hence the climb back out of output/.
import { layoutJson, scheduleJson } from "../../src/generated/markgraf-layout.mjs"

export const layoutJsonImpl = layoutJson
export const scheduleJsonImpl = scheduleJson
