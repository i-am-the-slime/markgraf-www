// Dynamic import of the compiled InstallButtonSDF module. The literal path lets
// the bundler split it (with three/r3f) into a separate async chunk; resolving to
// the module's installButtonSDF JSX value. Effect (Promise JSX) => () => Promise.
export const importInstallButtonImpl = () =>
  import("../Component.InstallButtonSDF/index.js").then((m) => m.installButtonSDF)
