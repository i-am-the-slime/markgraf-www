import { MarkgrafPlayer } from "@markgrafhq/markgraf-react";
import { motion } from "motion/react";
import { createElement as h } from "react";

export const markgrafPlayerImpl = MarkgrafPlayer;

// The install CTA, drawn as a single SVG path that morphs through markgraf's own
// node shapes — the same trick as the 3D ball scene (rounded box -> stadium ->
// database cylinder). The key is that EVERY shape is the same closed path: a
// move plus eight cubic segments (four edges, four corners), so only the numbers
// change and framer-motion can tween `d` smoothly between very different
// silhouettes. Edges that should be straight just get colinear controls; the
// cylinder bows its top and bottom edges out and sharpens its corners. A lid
// ellipse fades in only on the database beat to sell the 3D read.
const BOX = { L: 10, R: 190, T: 14, B: 50 };

const nodeShape = ({ r, topBow = 0, botBow = 0 }) => {
  const { L, R, T, B } = BOX;
  const lerp = (a, b, t) => a + (b - a) * t;
  return (
    `M${L + r},${T} ` +
    // top edge (bows up by topBow)
    `C${lerp(L + r, R - r, 0.33)},${T - topBow} ${lerp(L + r, R - r, 0.67)},${T - topBow} ${R - r},${T} ` +
    `C${R},${T} ${R},${T} ${R},${T + r} ` + // top-right corner
    // right edge (straight)
    `C${R},${lerp(T + r, B - r, 0.33)} ${R},${lerp(T + r, B - r, 0.67)} ${R},${B - r} ` +
    `C${R},${B} ${R},${B} ${R - r},${B} ` + // bottom-right corner
    // bottom edge (bows down by botBow)
    `C${lerp(R - r, L + r, 0.33)},${B + botBow} ${lerp(R - r, L + r, 0.67)},${B + botBow} ${L + r},${B} ` +
    `C${L},${B} ${L},${B} ${L},${B - r} ` + // bottom-left corner
    // left edge (straight)
    `C${L},${lerp(B - r, T + r, 0.33)} ${L},${lerp(B - r, T + r, 0.67)} ${L},${T + r} ` +
    `C${L},${T} ${L},${T} ${L + r},${T} Z` // top-left corner
  );
};

const SHAPES = [
  nodeShape({ r: 8 }), // rounded node box
  nodeShape({ r: 18 }), // stadium / pill
  nodeShape({ r: 5, topBow: 11, botBow: 11 }), // database cylinder
  nodeShape({ r: 8 }), // back to box
];

const MORPH_SECONDS = 2.6;

// Lid arc for the database beat: a full ellipse hugging the top of the cylinder.
// Its stroke draws the front rim of the lid; opacity is keyframed to peak only
// when the silhouette is the cylinder (third frame), so the rest of the time the
// shape reads as a flat node and only "pops" 3D as the database.
const lidEllipse = () =>
  h(motion.ellipse, {
    key: "lid",
    cx: 100,
    cy: BOX.T,
    rx: 84,
    ry: 9,
    fill: "none",
    stroke: "rgba(10,12,20,0.55)",
    strokeWidth: 2,
    vectorEffect: "non-scaling-stroke",
    initial: { opacity: 0 },
    animate: { opacity: [0, 0, 1, 0] },
    transition: { duration: MORPH_SECONDS, ease: "easeInOut", repeat: Infinity },
  });

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
        [
          h(motion.path, {
            key: "fill",
            d: SHAPES[0],
            fill: "#ff3b1a",
            animate: { d: SHAPES },
            transition: { duration: MORPH_SECONDS, ease: "easeInOut", repeat: Infinity },
          }),
          lidEllipse(),
        ]
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
