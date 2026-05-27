import React from "react";
import { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion } from "motion/react";
import { MarkgrafPlayer } from "@markgrafhq/markgraf-react";
import { feltballsOffscreen as FeltballsOffscreen } from "../../output/Feltballs.Offscreen/index.js";
import { sceneComponent as markgrafScene } from "../../output/Components.Scene/index.js";

export const sceneComponent = markgrafScene;
export const feltballsComponent = FeltballsOffscreen;
export const markgrafPlayerComponent = MarkgrafPlayer;

// Scroll-linked wrapper: applies a translateY interpolated between fromY and
// toY as `targetId` scrolls through `containerId`'s viewport.  Range maps
// [target top at scrollport bottom] → [target top at scrollport top] to [0,1].
export const settleCardComponent = ({ containerId, targetId, fromY, toY, className, children }) => {
  const containerRef = useRef(null);
  const targetRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    containerRef.current = document.getElementById(containerId);
    targetRef.current = document.getElementById(targetId);
    setReady(Boolean(containerRef.current && targetRef.current));
  }, [containerId, targetId]);
  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: targetRef,
    offset: ["start end", "start start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [fromY, toY]);
  return React.createElement(motion.div, { className, style: { y } }, children);
};

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

// Thin shim: observe each section inside the scrolling root container, hand
// every intersection ratio back to PureScript. All policy (which section is
// active, when to post) lives in HeroPreview.purs.
export const observeRatiosImpl = (rootId) => (sectionIds) => (onRatio) => () => {
  if (typeof window === "undefined") return () => {};
  const root = document.getElementById(rootId) || null;
  const els = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el) => el);
  if (els.length === 0) return () => {};
  const obs = new IntersectionObserver(
    (ents) => { for (const e of ents) onRatio(e.target.id)(e.intersectionRatio)(); },
    { root, threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  for (const el of els) obs.observe(el);
  return () => obs.disconnect();
};

// Forward a typed message to the feltballs worker. The offscreen setup
// installs window.__feltballsPost; if it hasn't yet, the call is a no-op and
// the next ratio fire will retry naturally.
export const postWorkerMessageImpl = (type) => (payload) => () => {
  if (typeof window === "undefined") return;
  const post = window.__feltballsPost;
  if (post) post(type, payload);
};
