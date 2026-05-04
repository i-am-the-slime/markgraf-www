import type { NextConfig } from "next";

// Static export — GitHub Pages serves the `out/` directory.
const config: NextConfig = {
  output: "export",
  basePath: "/markgraf-www",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default config;
