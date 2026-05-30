import { MarkgrafPlayer } from "@markgrafhq/markgraf-react";
import { motion } from "motion/react";
import { createElement as h } from "react";

export const markgrafPlayerImpl = MarkgrafPlayer;

// The install CTA, drawn as a single SVG path that morphs through a few node
// shapes — markgraf's own vocabulary applied to its call to action. Every shape
// is a rounded rect in the same 200x64 box with an identical command structure
// (only the corner radius changes), so framer-motion can tween `d` smoothly from
// one to the next: sharp box -> rounded node -> pill -> and back. The label rides
// on top; the whole pill springs on hover/tap and the arrow keeps a lazy bounce.
const shapeAt = (r) =>
  `M${4 + r},4 L${196 - r},4 C196,4 196,4 196,${4 + r} L196,${60 - r} ` +
  `C196,60 196,60 ${196 - r},60 L${4 + r},60 C4,60 4,60 4,${60 - r} ` +
  `L4,${4 + r} C4,4 4,4 ${4 + r},4 Z`;

const shapes = [shapeAt(28), shapeAt(8), shapeAt(18), shapeAt(3), shapeAt(28)];

export const installButtonImpl = ({ href, label }) =>
  h(
    motion.a,
    {
      href,
      className: "hero-pill-in",
      style: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.85rem 1.65rem",
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        lineHeight: "1",
        textTransform: "uppercase",
        letterSpacing: "0.28em",
        fontWeight: 600,
        color: "#0f0f0f",
        textDecoration: "none",
        pointerEvents: "auto",
      },
      whileHover: { scale: 1.06 },
      whileTap: { scale: 0.94 },
      transition: { type: "spring", stiffness: 400, damping: 18 },
    },
    [
      h(
        "svg",
        {
          key: "outline",
          "aria-hidden": true,
          viewBox: "0 0 200 64",
          preserveAspectRatio: "none",
          style: {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
            filter: "drop-shadow(0 0 18px rgba(255,59,26,0.5))",
          },
        },
        h(motion.path, {
          d: shapes[0],
          fill: "#ff3b1a",
          animate: { d: shapes },
          transition: { duration: 7, ease: "easeInOut", repeat: Infinity },
        })
      ),
      h("span", { key: "label", style: { position: "relative" } }, label),
      h(
        motion.span,
        {
          key: "arrow",
          style: { position: "relative" },
          animate: { y: [0, 3, 0] },
          transition: { duration: 1.2, ease: "easeInOut", repeat: Infinity },
        },
        "↓"
      ),
    ]
  );

// Browser-native smooth scroll-into-view. Not in web-dom 6.0.0, so a one-line
// shim suffices; PureScript decides which element gets it.
export const scrollIntoViewSmoothImpl = (el) => () => {
  el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// Forward a typed message to the diagramShapes worker. The offscreen setup
// installs window.__diagramShapesPost; if it hasn't yet, the call is a no-op and
// the next ratio fire will retry naturally.
export const postWorkerMessageImpl = (type) => (payload) => () => {
  if (typeof window === "undefined") return;
  const post = window.__diagramShapesPost;
  if (post) post(type, payload);
};
