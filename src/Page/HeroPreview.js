import Scene from "../../src/components/Scene.jsx";

export const sceneComponent = Scene;

// Updates a CSS custom property (--scene-progress) on <html> based on how
// far the named element has scrolled through its sticky window.
export const onScrollProgress = (elemId) => (cb) => () => {
  if (typeof window === "undefined") return () => {};
  let raf = 0;
  const tick = () => {
    raf = 0;
    const el = document.getElementById(elemId);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const total = el.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, Math.min(total, -rect.top));
    const progress = total > 0 ? scrolled / total : 0;
    document.documentElement.style.setProperty("--scene-progress", String(progress));
    cb(progress)();
  };
  const handler = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(tick);
  };
  handler();
  window.addEventListener("scroll", handler, { passive: true });
  window.addEventListener("resize", handler, { passive: true });
  return () => {
    window.removeEventListener("scroll", handler);
    window.removeEventListener("resize", handler);
    if (raf) window.cancelAnimationFrame(raf);
  };
};

export const writeClipboard = (text) => () => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
};
