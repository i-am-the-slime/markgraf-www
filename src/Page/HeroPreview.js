import { MarkgrafPlayer } from "@markgrafhq/markgraf-react";
import { feltballsOffscreen as FeltballsOffscreen } from "../../output/Feltballs.Offscreen/index.js";
import { sceneComponent as markgrafScene } from "../../output/Components.Scene/index.js";

export const sceneComponent = markgrafScene;
export const feltballsComponent = FeltballsOffscreen;
export const markgrafPlayerComponent = MarkgrafPlayer;

// Fires the callback with the element's intersection state as it crosses the
// 50% visibility threshold. Used to remount the markgraf player so the
// animation restarts each time the playground spread comes into view.
// Mirrors the textarea's scroll position onto the highlight overlay so the
// colored spans stay aligned with the actual caret/text as the user scrolls
// the editor.
export const installScrollSync = (textareaId) => (preId) => () => {
  if (typeof window === "undefined") return () => {};
  const ta = document.getElementById(textareaId);
  const pre = document.getElementById(preId);
  if (!ta || !pre) return () => {};
  const sync = () => {
    pre.scrollTop = ta.scrollTop;
    pre.scrollLeft = ta.scrollLeft;
  };
  ta.addEventListener("scroll", sync, { passive: true });
  sync();
  return () => ta.removeEventListener("scroll", sync);
};

export const onIntersect = (elemId) => (cb) => () => {
  if (typeof window === "undefined") return () => {};
  const el = document.getElementById(elemId);
  if (!el) return () => {};
  const observer = new IntersectionObserver(
    (entries) => { for (const e of entries) cb(e.isIntersecting)(); },
    { threshold: 0.5 },
  );
  observer.observe(el);
  return () => observer.disconnect();
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
