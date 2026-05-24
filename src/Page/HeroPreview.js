import { MarkgrafPlayer } from "@markgrafhq/markgraf-react";
import { feltballsApp } from "../../output/Feltballs.Entry/index.js";
import { sceneComponent as markgrafScene } from "../../output/Components.Scene/index.js";

export const sceneComponent = markgrafScene;
export const feltballsComponent = feltballsApp;
export const markgrafPlayerComponent = MarkgrafPlayer;

// Updates --scene-progress on <html> based on how far the named element has
// scrolled through its sticky window. Throttled to rAF.
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

export const onElementResize = (elemId) => (cb) => () => {
  if (typeof window === "undefined") return () => {};
  const el = document.getElementById(elemId);
  if (!el) return () => {};
  const fire = () => {
    const r = el.getBoundingClientRect();
    cb({ w: r.width, h: r.height })();
  };
  fire();
  const ro = new ResizeObserver(fire);
  ro.observe(el);
  return () => ro.disconnect();
};

export const writeClipboard = (text) => () => {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
};
