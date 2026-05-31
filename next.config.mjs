// RSC app via next-purs-rsc: the PureScript `output/**/index.js` modules are run
// through the purescript-rsc loader (which applies the "use client"/"use server"
// directives recorded in output/directives.json). Server-rendered — no static
// export (the install button + diagram worker are client components under it).
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rscLoader = path.resolve(here, "node_modules/next-purs-rsc/purescript-rsc-loader.js");

const config = {
  output: "export",
  basePath: "/markgraf-www",
  images: { unoptimized: true },
  trailingSlash: true,
  // The generated app/*.tsx import the untyped PureScript `output` (with a
  // defensive @ts-expect-error). markgraf-www's tsconfig resolves that JS as
  // `any`, so the directive reads as "unused" — skip type-checking the build.
  typescript: { ignoreBuildErrors: true },
  turbopack: {
    rules: {
      "output/**/index.js": { loaders: [rscLoader] },
    },
  },
  webpack(cfg) {
    cfg.module.rules.push({
      test: /output[/\\].*[/\\]index\.js$/,
      use: [rscLoader],
    });
    return cfg;
  },
};

export default config;
