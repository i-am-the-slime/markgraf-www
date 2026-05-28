// FFI for Page.Home: minimal browser-side helpers.

export const scheduleReset = (effect) => () => {
  if (typeof window !== "undefined") {
    window.setTimeout(() => effect(), 1200);
  }
};
