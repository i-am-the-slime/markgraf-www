import { MarkgrafPlayer } from "@markgrafhq/markgraf-react";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

export const markgrafPlayerImpl = MarkgrafPlayer;

// Editorial eyebrow: a short red rule that draws in left-to-right, then mono
// text that scrambles through random characters before settling on the real
// label. Fires every time the element scrolls into view (snap-mandatory pages
// retrigger on re-entry).
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const literal = (ch) => ch === " " || ch === "/" || ch === "-";

export const sectionLabelComponent = ({ label }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const upper = label.toUpperCase();
  const [text, setText] = useState(upper);

  useEffect(() => {
    if (!ref.current) return;
    const root = document.getElementById("magazine");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { root, threshold: 0.5 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [label]);

  useEffect(() => {
    if (!inView) return;
    let id = null;
    setText(" ".repeat(upper.length));
    const tick = 40;
    const startStagger = 90;
    const scrambleDuration = 550;
    const lastEnd = (upper.length - 1) * startStagger + scrambleDuration;
    const start = setTimeout(() => {
      let elapsed = 0;
      id = setInterval(() => {
        elapsed += tick;
        let out = "";
        for (let i = 0; i < upper.length; i += 1) {
          const ch = upper[i];
          if (literal(ch)) {
            out += ch;
          } else if (elapsed < i * startStagger) {
            out += " ";
          } else if (elapsed >= i * startStagger + scrambleDuration) {
            out += ch;
          } else {
            out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }
        setText(out);
        if (elapsed >= lastEnd) {
          setText(upper);
          clearInterval(id);
        }
      }, tick);
    }, 770);
    return () => {
      clearTimeout(start);
      if (id) clearInterval(id);
    };
  }, [inView, upper]);

  return React.createElement(
    "div",
    {
      ref,
      className:
        "flex items-center gap-4 mb-8 font-mono text-[10px] uppercase tracking-[0.35em]",
    },
    React.createElement(motion.span, {
      className: "h-px w-10 bg-brand block origin-left",
      initial: { scaleX: 0 },
      animate: { scaleX: inView ? 1 : 0 },
      transition: { duration: 0.4, delay: 0.35, ease: [0.65, 0, 0.35, 1] },
    }),
    React.createElement(
      "span",
      { className: "text-brand" },
      text,
    ),
  );
};

// Browser-native smooth scroll-into-view. Not in web-dom 6.0.0, so a one-line
// shim suffices; PureScript decides which element gets it.
export const scrollIntoViewSmoothImpl = (el) => () => {
  el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// Forward a typed message to the feltballs worker. The offscreen setup
// installs window.__feltballsPost; if it hasn't yet, the call is a no-op and
// the next ratio fire will retry naturally.
export const postWorkerMessageImpl = (type) => (payload) => () => {
  if (typeof window === "undefined") return;
  const post = window.__feltballsPost;
  if (post) post(type, payload);
};
