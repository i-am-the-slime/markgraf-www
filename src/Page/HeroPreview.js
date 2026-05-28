import { MarkgrafPlayer } from "@markgrafhq/markgraf-react";
import { feltballsOffscreen as FeltballsOffscreen } from "../../output/Feltballs.Offscreen/index.js";
import { sceneComponent as markgrafScene } from "../../output/Components.Scene/index.js";

export const sceneComponent = markgrafScene;
export const feltballsComponent = FeltballsOffscreen;
export const markgrafPlayerImpl = MarkgrafPlayer;

// FFI: lookup a DOM node by id, returns the Element or null.
export const lookupNode = (id) => () => document.getElementById(id);

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
    (entries) => {
      for (const e of entries) cb(e.isIntersecting)();
    },
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

// Thin shim: observe each section inside the scrolling root container, hand
// every intersection ratio back to PureScript. All policy (which section is
// active, when to post) lives in HeroPreview.purs.
export const observeRatiosImpl =
  (rootId) => (sectionIds) => (onRatio) => () => {
    if (typeof window === "undefined") return () => {};
    const root = document.getElementById(rootId) || null;
    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el) => el);
    if (els.length === 0) return () => {};
    const obs = new IntersectionObserver(
      (ents) => {
        for (const e of ents) onRatio(e.target.id)(e.intersectionRatio)();
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const el of els) obs.observe(el);
    return () => obs.disconnect();
  };

// Track scroll inside the magazine container and hand back a y offset (in px)
// that interpolates from -95vh at scrollTop 0 to 0 once the second page is
// fully in view. Clamped at both ends so further scrolling doesn't drift the
// diagram below its settled spot.
export const onMagazineScrollImpl = (cb) => () => {
  if (typeof window === "undefined") return () => {};
  const el = document.getElementById("magazine");
  if (!el) return () => {};
  let lastX = 0;
  const fire = () => {
    const vh = window.innerHeight || 1;
    const vw = window.innerWidth || 1;
    const p = Math.max(0, Math.min(1, el.scrollTop / vh));
    const preview = document.getElementById("markgraf-preview");
    const rect = preview ? preview.getBoundingClientRect() : null;
    // rect.left already includes the current transform (lastX), so subtract it
    // to recover the untransformed natural center of the preview cell.
    const naturalCenter = rect
      ? (rect.left - lastX) + rect.width / 2
      : vw / 2;
    const offsetToCenter = vw / 2 - naturalCenter;
    const x = offsetToCenter * (1 - p);
    const y = (-0.95 + 0.95 * p) * vh;
    lastX = x;
    cb({ x, y })();
  };
  el.addEventListener("scroll", fire, { passive: true });
  window.addEventListener("resize", fire, { passive: true });
  fire();
  return () => {
    el.removeEventListener("scroll", fire);
    window.removeEventListener("resize", fire);
  };
};

// Forward a typed message to the feltballs worker. The offscreen setup
// installs window.__feltballsPost; if it hasn't yet, the call is a no-op and
// the next ratio fire will retry naturally.
export const postWorkerMessageImpl = (type) => (payload) => () => {
  if (typeof window === "undefined") return;
  const post = window.__feltballsPost;
  if (post) post(type, payload);
};
