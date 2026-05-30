import { MarkgrafPlayer } from "@markgrafhq/markgraf-react";
import { motion } from "motion/react";
import { createElement as h } from "react";

export const markgrafPlayerImpl = MarkgrafPlayer;

// The install CTA, drawn as a single SVG path that morphs through markgraf's own
// node shapes — the same trick as the 3D ball scene (box -> stadium -> database
// cylinder -> parallelogram -> cloud). The key is that EVERY shape is the same
// closed path: a move + ten cubic segments (three across the top so it can grow
// cloud lumps, one per side, one across the bottom, four corners) + close. Only
// the numbers change, so framer-motion tweens `d` smoothly between very
// different silhouettes.
//   r       – corner radius
//   skew    – parallelogram lean (top shifts right, bottom left), as markgraf's
//             parallelogramSkew does
//   topBow  – single smooth arc across the top (database lid front)
//   botBow  – single smooth arc below the bottom (database base front)
//   bumps   – three lumps on the top edge instead, sitting flat at the sides
//             (markgraf's cloud is a row of bumps on a baseline; this is its 2D
//             single-path cousin)
const BOX = { L: 18, R: 182, T: 14, B: 52 };

const nodeShape = ({ r, skew = 0, topBow = 0, botBow = 0, bumps = 0 }) => {
  const { L, R, T, B } = BOX;
  const lerp = (a, b, t) => a + (b - a) * t;
  // How far the top edge lifts above T at position t in [0,1]: three lumps for a
  // cloud, otherwise one smooth arc (or flat when topBow is 0).
  const lift = (t) =>
    bumps > 0
      ? bumps * Math.sin(Math.PI * ((t * 3) % 1))
      : topBow * Math.sin(Math.PI * t);
  const ax = L + r + skew;
  const bx = R - r + skew;
  const tx = (t) => lerp(ax, bx, t);
  const tp = (t) => `${tx(t)},${T - lift(t)}`;
  // one cubic bump segment of the top edge, from t0 to t1
  const top = (t0, t1) =>
    `C${tp(lerp(t0, t1, 1 / 3))} ${tp(lerp(t0, t1, 2 / 3))} ${tp(t1)} `;
  const cTR = R + skew;
  const cBR = R - skew;
  const cBL = L - skew;
  const cTL = L + skew;
  const eR = R - r - skew; // bottom-right edge start x
  const eL = L + r - skew; // bottom-left edge end x
  return (
    `M${tp(0)} ` +
    top(0, 1 / 3) + top(1 / 3, 2 / 3) + top(2 / 3, 1) +
    `C${cTR},${T} ${cTR},${T} ${cTR},${T + r} ` + // top-right corner
    // right edge (straight, leans with skew)
    `C${lerp(cTR, cBR, 1 / 3)},${lerp(T + r, B - r, 1 / 3)} ${lerp(cTR, cBR, 2 / 3)},${lerp(T + r, B - r, 2 / 3)} ${cBR},${B - r} ` +
    `C${cBR},${B} ${cBR},${B} ${eR},${B} ` + // bottom-right corner
    // bottom edge (bows down by botBow)
    `C${lerp(eR, eL, 1 / 3)},${B + botBow} ${lerp(eR, eL, 2 / 3)},${B + botBow} ${eL},${B} ` +
    `C${cBL},${B} ${cBL},${B} ${cBL},${B - r} ` + // bottom-left corner
    // left edge (straight, leans with skew)
    `C${lerp(cBL, cTL, 1 / 3)},${lerp(B - r, T + r, 1 / 3)} ${lerp(cBL, cTL, 2 / 3)},${lerp(B - r, T + r, 2 / 3)} ${cTL},${T + r} ` +
    `C${cTL},${T} ${cTL},${T} ${tp(0)} Z` // top-left corner back to start
  );
};

const SHAPES = [
  nodeShape({ r: 8 }), // rounded node box
  nodeShape({ r: 19 }), // stadium / pill
  nodeShape({ r: 4, skew: 16 }), // parallelogram
  nodeShape({ r: 5, topBow: 10, botBow: 10 }), // database cylinder
  nodeShape({ r: 7, bumps: 12 }), // cloud
  nodeShape({ r: 8 }), // back to box
];

const MORPH_SECONDS = 2.8;

// Lid arc for the database beat: a full ellipse hugging the top of the cylinder.
// Its stroke draws the front rim of the lid; opacity is keyframed to peak only
// on the database frame (index 3 of the six in SHAPES), so the rest of the time
// the shape reads flat and only "pops" 3D as the database.
const lidEllipse = () =>
  h(motion.ellipse, {
    key: "lid",
    cx: 100,
    cy: BOX.T,
    rx: 78,
    ry: 9,
    fill: "none",
    stroke: "rgba(10,12,20,0.55)",
    strokeWidth: 2,
    vectorEffect: "non-scaling-stroke",
    initial: { opacity: 0 },
    animate: { opacity: [0, 0, 0, 1, 0, 0] },
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
        padding: "1.85rem 1.7rem",
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
