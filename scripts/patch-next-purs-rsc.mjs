import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const loaderPath = join(
  import.meta.dirname,
  "../node_modules/next-purs-rsc/purescript-rsc-loader.js",
);

if (!existsSync(loaderPath)) {
  console.log("[postinstall] next-purs-rsc not found, skipping patch");
  process.exit(0);
}

let code = readFileSync(loaderPath, "utf-8");

// Fix 1: Remove CommonJS export at loader-entry top
code = code.replace(
  /module\.exports = __toCommonJS\(exports_loader_entry\);\n/,
  "",
);

// Fix 2: Replace CommonJS requires with ESM-compatible imports
// fs and path are built-in and can use native ESM imports
// unplugin is CJS, so we use createRequire
code = code.replace(
  /var import_fs = __toESM\(require\("fs"\)\);\nvar import_path = __toESM\(require\("path"\)\);\nvar import_unplugin = require\("unplugin"\);/,
  'import * as _fs from "fs";\nimport * as _path from "path";\nimport { createRequire } from "node:module";\nvar import_fs = __toESM(_fs);\nvar import_path = __toESM(_path);\nvar require$1 = createRequire(import.meta.url);\nvar import_unplugin = __toESM(require$1("unplugin"));',
);

// Fix 3: Remove .default from import_* calls
code = code.replaceAll("import_path.default.", "import_path.");
code = code.replaceAll("import_fs.default.", "import_fs.");

// Fix 4: Replace CommonJS export at end with ESM export
code = code.replace(
  /module\.exports=module\.exports\.default;/,
  "export default loader_entry_default;",
);

writeFileSync(loaderPath, code);
console.log("[postinstall] patched next-purs-rsc for ESM compatibility");
