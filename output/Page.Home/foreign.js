// FFI for Page.Home: minimal browser-side helpers.

export const writeClipboard = (text) => () => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
};

export const scheduleReset = (effect) => () => {
  if (typeof window !== "undefined") {
    window.setTimeout(() => effect(), 1200);
  }
};
