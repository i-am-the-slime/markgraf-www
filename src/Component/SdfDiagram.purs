module Component.SdfDiagram (sdfDiagram) where

import Prelude

import Data.Array (catMaybes, concat, concatMap, drop, filter, find, foldl, last, length, range, snoc, take, uncons, unsnoc, zipWith, (!!))
import Data.Array (null) as Array
import Data.Char (fromCharCode, toCharCode)
import Data.Array (cons) as Array
import Data.Foldable (minimumBy, sum, traverse_)
import Data.Ord (comparing)
import Data.FoldableWithIndex (forWithIndex_)
import Data.FunctorWithIndex (mapWithIndex)
import Data.Int (round, toNumber)
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Nullable (Nullable, null, toMaybe)
import Data.Number (cos, floor, sin, sqrt)
import Data.String.CodeUnits as SCU
import Data.Traversable (for)
import Data.Tuple.Nested (type (/\), (/\))
import Effect (Effect)
import Effect.Aff (launchAff_)
import Effect.Class (liftEffect)
import Effect.Unsafe (unsafePerformEffect)
import Graphics.Canvas (CanvasElement, TextAlign(..), TextBaseline(..), clearRect, fillText, getContext2D, measureText, setCanvasHeight, setCanvasWidth, setFillStyle, setFont, setTextAlign, setTextBaseline)
import Graphics.Canvas.Extra (LetterSpacing(..), createCanvasElement, kerningNormal, setFontKerning, setLetterSpacing)
import Graphics.WebGL as GL
import Markgraf.LayoutData (NodeJson, ScheduleJson, scheduleJson)
import Page.Active (onActiveChange)
import React.Basic (JSX, ReactComponent, element)
import React.Basic.Hooks (Ref, reactComponent, readRef, readRefMaybe, useRef, writeRef)
import React.Basic.Hooks as Hooks
import Web.Font.Loading (FontShorthand(..), loadFont)
import Web.HTML (window)
import Web.HTML.Window (RequestAnimationFrameId, cancelAnimationFrame, requestAnimationFrame)
import Yoga.React.DOM.Attributes (reactRef)
import Yoga.React.DOM.HTML.Canvas (canvas)
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.Internal (css, noJSX)

-- A markgraf diagram drawn as one fullscreen-quad SDF raymarcher: every node is
-- an extruded SDF solid in its own markgraf shape, every edge an SDF capsule
-- capped with an SDF arrowhead, every data-flow token a ball that genie-merges
-- into the blocks it travels through. The whole scene is one fragment shader,
-- tilted a little so the slabs read as 3D — the same machinery as the install
-- button, generalised from one morphing shape to a laid-out, animated graph.
--
-- Token labels ride along as markgraf's own renderers draw them: a floating chip
-- beside the travelling dot whose letters type in one at a time. Crucially the
-- chip and its glyphs are drawn IN the raymarch shader too (a screen-space pill
-- SDF + glyph-atlas samples), not in a second raster pass — so the whole renderer
-- stays one shader and could move wholesale into an OffscreenCanvas worker.
sdfDiagram :: JSX
sdfDiagram = element diagramComponent {}

-- ---------------------------------------------------------------------------
-- The diagram source, and the real layout markgraf computes from it. Node
-- centres and edge polylines come back in layout space (y grows downward); the
-- edges are already orthogonally routed and trimmed onto the node silhouettes.
-- ---------------------------------------------------------------------------

sampleSource :: String
sampleSource =
  """
  keyframe setup {
    +node client "Client"
    +node api "API"
    +node db "DB"
    +node cache "Cache"
    +edge client api
    +edge api db
    +edge api cache
  }
  keyframe request {
    client -> api "GET"
    api -> db "query"
  }
  keyframe fan {
    par {
      api -> db "read"
      api -> cache "read"
    }
  }
  """

scene :: ScheduleJson
scene = scheduleJson sampleSource

nodeList :: Array NodeJson
nodeList = scene.nodes

type Point = { x :: Number, y :: Number }

clamp01 :: Number -> Number
clamp01 x = max 0.0 (min 1.0 x)

-- A node's half-height in world units, the characteristic scale the shader sizes
-- depth, edges and arrowheads from, so proportions hold at any layout scale.
unitHalfH :: Number
unitHalfH = case length worldNodes of
  0 -> 0.1
  n -> foldl (\acc w -> acc + w.hh) 0.0 worldNodes / toNumber n

arrowLen :: Number
arrowLen = unitHalfH * 0.55

-- ---------------------------------------------------------------------------
-- Layout space -> world space. Centre the bounding box on the origin, flip y so
-- it points up, and scale the larger dimension to fill `worldSpan`.
-- ---------------------------------------------------------------------------

type WorldNode = { x :: Number, y :: Number, hw :: Number, hh :: Number, shape :: Number }

worldSpan :: Number
worldSpan = 6.6

bounds :: { minX :: Number, maxX :: Number, minY :: Number, maxY :: Number }
bounds = foldl step { minX: inf, maxX: -inf, minY: inf, maxY: -inf } nodeList
  where
  inf = 1.0e9
  step acc n =
    { minX: min acc.minX (n.x - n.w / 2.0)
    , maxX: max acc.maxX (n.x + n.w / 2.0)
    , minY: min acc.minY (n.y - n.h / 2.0)
    , maxY: max acc.maxY (n.y + n.h / 2.0)
    }

scaleFactor :: Number
scaleFactor = worldSpan / max (bounds.maxX - bounds.minX) (bounds.maxY - bounds.minY)

midX :: Number
midX = (bounds.minX + bounds.maxX) / 2.0

midY :: Number
midY = (bounds.minY + bounds.maxY) / 2.0

toWorldPt :: Point -> Point
toWorldPt p = { x: (p.x - midX) * scaleFactor, y: negate (p.y - midY) * scaleFactor }

worldNodes :: Array WorldNode
worldNodes = toWorld <$> nodeList
  where
  toWorld n =
    { x: (n.x - midX) * scaleFactor
    , y: negate (n.y - midY) * scaleFactor
    , hw: n.w / 2.0 * scaleFactor
    , hh: n.h / 2.0 * scaleFactor
    , shape: toNumber n.shape
    }

nodeRectFlat :: Array Number
nodeRectFlat = concatMap (\n -> [ n.x, n.y, n.hw * 2.0, n.hh * 2.0 ]) worldNodes

nodeShapeFlat :: Array Number
nodeShapeFlat = _.shape <$> worldNodes

-- Extend an edge polyline to the centres of its nearest source and target nodes,
-- so balls and capsules travel into/out of the node bodies rather than stopping
-- at their surfaces.
extendToCenters :: Array Point -> Array Point
extendToCenters pts = fromMaybe pts do
  { head: first } <- uncons pts
  { last } <- unsnoc pts
  src <- minimumBy (comparing (distSq first)) worldNodes
  tgt <- minimumBy (comparing (distSq last)) worldNodes
  pure $ Array.cons { x: src.x, y: src.y } (snoc pts { x: tgt.x, y: tgt.y })
  where
  distSq p n = (p.x - n.x) * (p.x - n.x) + (p.y - n.y) * (p.y - n.y)

-- markgraf's own routed, silhouette-trimmed edge polylines, mapped to world.
worldEdges :: Array (Array Point)
worldEdges = (extendToCenters <<< map toWorldPt <<< _.points) <$> scene.edges

-- Each polyline's capsule segments, with the final point pulled back by arrowLen
-- so the line stops where the arrowhead begins.
edgeSegFlat :: Array Number
edgeSegFlat = concatMap (segments <<< shortenLast) worldEdges
  where
  segments pts = concat (zipWith (\p q -> [ p.x, p.y, q.x, q.y ]) pts (drop 1 pts))

-- One arrowhead per edge: (tipX, tipY, dirX, dirY), the tip at the polyline's
-- true end and the direction taken from its final segment.
arrowFlat :: Array Number
arrowFlat = concatMap arrow worldEdges
  where
  arrow pts = fromMaybe [] (withTail pts \prev tip -> [ tip.x, tip.y, (tip.x - prev.x) / len prev tip, (tip.y - prev.y) / len prev tip ])

shortenLast :: Array Point -> Array Point
shortenLast pts = fromMaybe pts (withTail pts \prev tip -> snoc (fromMaybe [] (_.init <$> unsnoc pts)) (pullBack prev tip))
  where
  pullBack prev tip =
    { x: prev.x + (tip.x - prev.x) * k prev tip
    , y: prev.y + (tip.y - prev.y) * k prev tip
    }
  k prev tip = max 0.0 (len prev tip - arrowLen) / len prev tip

len :: Point -> Point -> Number
len p q = sqrt ((q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y))

-- Apply f to the second-to-last and last points of a polyline.
withTail :: forall a. Array Point -> (Point -> Point -> a) -> Maybe a
withTail pts f = do
  { init, last } <- unsnoc pts
  { last: prev } <- unsnoc init
  pure (f prev last)

-- ---------------------------------------------------------------------------
-- The data-flow tokens, straight off markgraf's schedule. Each is an edge
-- polyline (oriented in travel order) with absolute start/end times, the
-- source/target dwell fractions, and the labels the chip cycles through.
-- ---------------------------------------------------------------------------

type Flow =
  { path :: Array Point
  , labels :: Array String
  , startT :: Number
  , endT :: Number
  , holdPre :: Number
  , holdPost :: Number
  }

duration :: Number
duration = scene.duration

tokenFlows :: Array Flow
tokenFlows = toFlow <$> scene.tokens
  where
  toFlow tk =
    { path: extendToCenters (toWorldPt <$> tk.points)
    , labels: tk.labels
    , startT: tk.startT
    , endT: tk.endT
    , holdPre: tk.holdPre
    , holdPost: tk.holdPost
    }

-- How many concurrent balls the shader's uniform arrays hold.
maxTokens :: Int
maxTokens = 8

ballRadius :: Number
ballRadius = unitHalfH * 0.46

-- A token's 0..1 travel progress within its window, honouring the dwell at the
-- source (holdPre) and the target (holdPost). Doubles as the carousel's
-- motion-time, exactly as markgraf's tokenProgress drives both dot and label.
flowProgress :: Flow -> Number -> Number
flowProgress f u = if span <= 0.0 then (if u < 0.5 then 0.0 else 1.0) else clamp01 ((u - f.holdPre) / span)
  where
  span = 1.0 - f.holdPre - f.holdPost

-- The active flows at loop time t, each sampled to a world position, the overlap
-- glow of the block it's inside, that block's centre (so the shader lights only
-- that one block), and the carousel inputs the chip needs. Capped to the shader's
-- array size.
type Sample =
  { x :: Number, y :: Number, glow :: Number, nx :: Number, ny :: Number, labels :: Array String, motionT :: Number, startT :: Number }

sampleFlows :: Number -> Array Sample
sampleFlows t = sampleOne <$> take maxTokens (filter active tokenFlows)
  where
  active f = t >= f.startT && t < f.endT
  sampleOne f = { x: p.x, y: p.y, glow: nn.glow, nx: nn.x, ny: nn.y, labels: f.labels, motionT, startT: f.startT }
    where
    motionT = flowProgress f ((t - f.startT) / (f.endT - f.startT))
    p = pointAtPath f.path motionT
    nn = nearestNodeGlow p

-- The block a ball is most inside, with its overlap (1 at the centre, 0 a reach
-- away) and centre — drives the node glow and the ball's swell.
nearestNodeGlow :: Point -> { glow :: Number, x :: Number, y :: Number }
nearestNodeGlow p = foldl pick { glow: 0.0, x: 0.0, y: 0.0 } worldNodes
  where
  pick best r = if over r > best.glow then { glow: over r, x: r.x, y: r.y } else best
  over r = max 0.0 (1.0 - len p { x: r.x, y: r.y } / (max r.hw r.hh + ballRadius))

-- The point a fraction t (0..1) along a polyline by arc length.
pointAtPath :: Array Point -> Number -> Point
pointAtPath path t = walk (clamp01 t * total) segs
  where
  segs = zipWith (/\) path (drop 1 path)
  total = foldl (\acc (a /\ b) -> acc + len a b) 0.0 segs
  walk d arr = case uncons arr of
    Nothing -> fromMaybe { x: 0.0, y: 0.0 } (last path)
    Just { head: a /\ b, tail } ->
      if Array.null tail || d <= len a b then lerpP a b (frac d (len a b))
      else walk (d - len a b) tail
  frac d l = if l <= 0.0 then 0.0 else d / l
  lerpP a b u = { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }

-- Loop time within the schedule's total duration.
loopTime :: Number -> Number
loopTime now = if duration > 0.0 then now - duration * floor (now / duration) else 0.0

-- ---------------------------------------------------------------------------
-- The node-label atlas: every node's label baked into one offscreen canvas, one
-- per row, sampled per node onto its front face. No DOM text, so this works just
-- as well inside a worker.
-- ---------------------------------------------------------------------------

atlasW :: Number
atlasW = 512.0

atlasRow :: Number
atlasRow = 160.0

atlasH :: Number
atlasH = toNumber (length nodeList) * atlasRow

labelFont :: String
labelFont = "600 80px \"Ilisarniq\", \"Ilisarniq Fallback\", ui-sans-serif, system-ui, sans-serif"

makeAtlas :: Effect CanvasElement
makeAtlas = do
  el <- createCanvasElement
  setCanvasWidth el atlasW
  setCanvasHeight el atlasH
  drawAtlas el
  pure el

drawAtlas :: CanvasElement -> Effect Unit
drawAtlas el = do
  ctx <- getContext2D el
  clearRect ctx { x: 0.0, y: 0.0, width: atlasW, height: atlasH }
  setFillStyle ctx "#fff"
  setFont ctx labelFont
  setTextAlign ctx AlignCenter
  setTextBaseline ctx BaselineMiddle
  setFontKerning ctx kerningNormal
  setLetterSpacing ctx (LetterSpacing "1px")
  forWithIndex_ nodeList \i n ->
    fillText ctx n.label (atlasW / 2.0) (toNumber i * atlasRow + atlasRow / 2.0)

-- Bake the node atlas with whatever face is ready now, then re-bake and
-- re-upload once the brand font has loaded so the first paint's fallback is
-- replaced. Bound to texture unit 0 (uLabel).
ensureAtlas :: GL.GL -> GL.Texture -> Effect Unit
ensureAtlas gl texture = do
  atlas <- makeAtlas
  GL.uploadCanvasUnit gl texture atlas 0
  launchAff_ do
    loadFont (FontShorthand labelFont)
    liftEffect do
      drawAtlas atlas
      GL.uploadCanvasUnit gl texture atlas 0

-- ---------------------------------------------------------------------------
-- The glyph atlas: every printable ASCII glyph baked into its own cell of a
-- grid (one per character, centred), plus the advance width of each so chip text
-- can be laid out glyph-by-glyph for the typewriter. Bound to texture unit 1.
-- ---------------------------------------------------------------------------

glyphCols :: Int
glyphCols = 16

glyphLo :: Int
glyphLo = 32

glyphHi :: Int
glyphHi = 126

glyphChars :: Array Char
glyphChars = catMaybes (fromCharCode <$> range glyphLo glyphHi)

glyphRows :: Int
glyphRows = (length glyphChars + glyphCols - 1) / glyphCols

glyphBakeFont :: Number
glyphBakeFont = 64.0

glyphCellW :: Number
glyphCellW = 76.0

glyphCellH :: Number
glyphCellH = 100.0

glyphAtlasW :: Number
glyphAtlasW = toNumber glyphCols * glyphCellW

glyphAtlasH :: Number
glyphAtlasH = toNumber glyphRows * glyphCellH

glyphFont :: String
glyphFont = "600 64px \"Ilisarniq\", \"Ilisarniq Fallback\", ui-sans-serif, system-ui, sans-serif"

-- Draw every glyph into its cell and measure its advance (normalised to ems, so
-- the layout is independent of the bake size). Returns the canvas to upload and
-- the advances, indexed by character code minus glyphLo.
makeGlyphAtlas :: Effect { canvas :: CanvasElement, advances :: Array Number }
makeGlyphAtlas = do
  el <- createCanvasElement
  setCanvasWidth el glyphAtlasW
  setCanvasHeight el glyphAtlasH
  ctx <- getContext2D el
  clearRect ctx { x: 0.0, y: 0.0, width: glyphAtlasW, height: glyphAtlasH }
  setFillStyle ctx "#fff"
  setFont ctx glyphFont
  setTextAlign ctx AlignCenter
  setTextBaseline ctx BaselineMiddle
  setFontKerning ctx kerningNormal
  advances <- for (mapWithIndex (/\) glyphChars) \(i /\ ch) -> do
    let
      s = SCU.singleton ch
      col = toNumber (i `mod` glyphCols)
      row = toNumber (i / glyphCols)
    fillText ctx s (col * glyphCellW + glyphCellW / 2.0) (row * glyphCellH + glyphCellH / 2.0)
    m <- measureText ctx s
    pure (m.width / glyphBakeFont)
  pure { canvas: el, advances }

ensureGlyphAtlas :: GL.GL -> GL.Texture -> Ref (Array Number) -> Effect Unit
ensureGlyphAtlas gl texture advRef = do
  g <- makeGlyphAtlas
  GL.uploadCanvasUnit gl texture g.canvas 1
  writeRef advRef g.advances
  launchAff_ do
    loadFont (FontShorthand glyphFont)
    liftEffect do
      g' <- makeGlyphAtlas
      GL.uploadCanvasUnit gl texture g'.canvas 1
      writeRef advRef g'.advances

-- The advance of a glyph in ems, falling back to a half-em for anything outside
-- the baked range; and its cell index in the atlas.
advanceEm :: Array Number -> Char -> Number
advanceEm advances ch = fromMaybe 0.5 (advances !! (toCharCode ch - glyphLo))

glyphCell :: Char -> Number
glyphCell ch = toNumber (clamp 0 (length glyphChars - 1) (toCharCode ch - glyphLo))

-- ---------------------------------------------------------------------------
-- The travelling chip, ported from markgraf's drawTokenLabel/drawTypewriter:
-- a floating pill beside the dot whose label types in one glyph at a time, and
-- a carousel that gives each of a token's labels a slice of motion-time
-- proportional to its length. All laid out in screen pixels here; the shader
-- only composites the pill SDF and samples the glyph atlas per instance.
-- ---------------------------------------------------------------------------

-- One laid-out glyph: its centre and half-extents in screen px, the atlas cell
-- to sample, and its current reveal alpha.
type GlyphInst = { cx :: Number, cy :: Number, hw :: Number, hh :: Number, cell :: Number, alpha :: Number }

-- One chip: the pill rect (centre + half-extents) and the dot it points at, all
-- in screen px.
type Chip = { cx :: Number, cy :: Number, hw :: Number, hh :: Number, dotX :: Number, dotY :: Number }

-- The active label and its in-slice phase (0..1), motion-time sliced by
-- character count so longer words stay on screen longer (markgraf pickActiveLabel).
pickActiveLabel :: Number -> Array String -> { line :: String, phase :: Number }
pickActiveLabel motionT labels = { line, phase }
  where
  ls = if Array.null labels then [ "" ] else labels
  weights = (\s -> toNumber (max 1 (SCU.length s))) <$> ls
  total = max 1.0 (sum weights)
  target = motionT * total
  walk i acc ws = case uncons ws of
    Nothing -> length ls - 1
    Just { head: w, tail } -> if acc + w >= target then i else walk (i + 1) (acc + w) tail
  idx = walk 0 0.0 weights
  line = fromMaybe "" (ls !! idx)
  startWeight = sum (take idx weights)
  weight = fromMaybe 1.0 (weights !! idx)
  sliceStart = startWeight / total
  sliceEnd = (startWeight + weight) / total
  phase = if sliceEnd <= sliceStart then 1.0 else clamp01 ((motionT - sliceStart) / (sliceEnd - sliceStart))

-- The smoothstep-eased reveal of glyph i at typewriter phase, staggered so each
-- character eases in just after the one before (markgraf drawTypewriter).
glyphEase :: Number -> Int -> Int -> Number
glyphEase phase count i = charT * charT * (3.0 - 2.0 * charT)
  where
  charT = clamp01 ((phase * toNumber (count + 1) - toNumber i) / charOverlap)
  charOverlap = 1.5

-- Lay a token's chip out beside its projected dot: pick the active label, place
-- the pill, and type the glyphs in. `fontPx` is the chip text height in px,
-- `dotR` the dot's screen radius.
layoutChip
  :: Array Number
  -> Number
  -> { x :: Number, y :: Number, r :: Number }
  -> Number
  -> Array String
  -> { chip :: Chip, glyphs :: Array GlyphInst }
layoutChip advances fontPx dot motionT labels = { chip, glyphs }
  where
  active = pickActiveLabel motionT labels
  chars = SCU.toCharArray active.line
  count = length chars
  advPx ch = fontPx * advanceEm advances ch
  labelW = sum (advPx <$> chars)
  padX = fontPx * 1.25
  padY = fontPx * 0.62
  gap = fontPx * 0.5
  centerX = dot.x + dot.r + gap + labelW / 2.0
  textLeft = centerX - labelW / 2.0
  chip = { cx: centerX, cy: dot.y, hw: labelW / 2.0 + padX, hh: fontPx * 0.62 + padY, dotX: dot.x, dotY: dot.y }
  gh = fontPx * (glyphCellH / glyphBakeFont)
  gw = gh * (glyphCellW / glyphCellH)
  glyphs = snd (foldl place (textLeft /\ []) (mapWithIndex (/\) chars))
  place (cursor /\ acc) (i /\ ch) = (cursor + adv) /\ (if eased > 0.0 then snoc acc inst else acc)
    where
    adv = advPx ch
    eased = glyphEase active.phase count i
    -- letters fall down into place: start a little above the baseline, ease to it
    inst = { cx: cursor + adv / 2.0, cy: dot.y + (1.0 - eased) * fontPx * 0.85, hw: gw / 2.0, hh: gh / 2.0, cell: glyphCell ch, alpha: eased }
  snd (_ /\ b) = b

-- How many glyph instances the shader's uniform arrays hold across all chips.
maxGlyphs :: Int
maxGlyphs = 40

-- ---------------------------------------------------------------------------
-- Chip collision resolution (markgraf resolveChain/slideRect):
-- each chip slides diagonally up-right (in gl_FragCoord y-up space) to clear
-- accumulated obstacles — nodes projected to screen, then previously-resolved
-- chips added one by one so siblings don't all land on the same slide.
-- ---------------------------------------------------------------------------

type ChipObstacle = { cx :: Number, cy :: Number, hw :: Number, hh :: Number }

invSqrt2 :: Number
invSqrt2 = 0.7071067811865476

-- Project a world-space node to an approximate screen-space obstacle rect.
nodeScreenRect :: Number -> Number -> Number -> WorldNode -> ChipObstacle
nodeScreenRect tilt resW resH n = { cx: sx, cy: sy, hw: shw, hh: shh }
  where
  denom = n.y * sin tilt + 12.0
  sx = n.x / denom * resH + 0.5 * resW
  sy = n.y * cos tilt / denom * resH + 0.5 * resH
  shw = n.hw / denom * resH
  shh = n.hh * cos tilt / denom * resH

resolveCollisions
  :: Array ChipObstacle
  -> Array { chip :: Chip, glyphs :: Array GlyphInst }
  -> Array { chip :: Chip, glyphs :: Array GlyphInst }
resolveCollisions nodeObs layouts =
  (foldl step { resolved: [], obstacles: nodeObs } layouts).resolved
  where
  step st item = result
    where
    chip' = slideChip item.chip st.obstacles
    dx = chip'.cx - item.chip.cx
    dy = chip'.cy - item.chip.cy
    glyphs' = (\g -> g { cx = g.cx + dx, cy = g.cy + dy }) <$> item.glyphs
    obs = { cx: chip'.cx, cy: chip'.cy, hw: chip'.hw, hh: chip'.hh }
    result = { resolved: snoc st.resolved { chip: chip', glyphs: glyphs' }, obstacles: snoc st.obstacles obs }

slideChip :: Chip -> Array ChipObstacle -> Chip
slideChip chip obstacles = chip { cx = chip.cx + s * invSqrt2, cy = chip.cy + s * invSqrt2 }
  where
  s = foldl max 0.0 (slideOne <$> obstacles)
  slideOne o = if overlaps o then min (sRight o) (sUp o) else 0.0
  pad = 12.0
  margin = 10.0
  overlaps o =
    chip.cx - chip.hw - margin < o.cx + o.hw + pad
      && chip.cx + chip.hw + margin > o.cx - o.hw - pad
      && chip.cy - chip.hh - margin < o.cy + o.hh + pad
      && chip.cy + chip.hh + margin > o.cy - o.hh - pad
  sRight o = ((o.cx + o.hw + pad) - (chip.cx - chip.hw - margin)) / invSqrt2
  sUp o = ((o.cy + o.hh + pad) - (chip.cy - chip.hh - margin)) / invSqrt2

-- Shift a chip and all its glyphs by (dx, dy), used to apply a spring-smoothed
-- collision offset so the chip follows its dot naturally and the slide eases in.
shiftLayout :: Number -> Number -> { chip :: Chip, glyphs :: Array GlyphInst } -> { chip :: Chip, glyphs :: Array GlyphInst }
shiftLayout dx dy { chip, glyphs } =
  { chip: chip { cx = chip.cx + dx, cy = chip.cy + dy }
  , glyphs: (\g -> g { cx = g.cx + dx, cy = g.cy + dy }) <$> glyphs
  }

-- Per-chip spring state keyed by the token's startT (stable across loop cycles).
type ChipSpring = { id :: Number, ox :: Number, oy :: Number, vx :: Number, vy :: Number }

-- Semi-implicit Euler spring step (stiffness/damping matched to markgraf LabelSpring).
springStep :: Number -> Number -> Number -> ChipSpring -> ChipSpring
springStep dt tx ty s = s { ox = ox', oy = oy', vx = vx', vy = vy' }
  where
  stiffness = 180.0
  damping = 22.0
  ax = stiffness * (tx - s.ox) - damping * s.vx
  ay = stiffness * (ty - s.oy) - damping * s.vy
  vx' = s.vx + ax * dt
  vy' = s.vy + ay * dt
  ox' = s.ox + vx' * dt
  oy' = s.oy + vy' * dt

-- Integrate the spring for one chip slot: look up prior state by token id,
-- advance it toward the collision-resolved target offset, return the smoothed
-- layout and the new spring state for next frame.
applyChipSpring
  :: Number
  -> Array ChipSpring
  -> Array Sample
  -> Int
  -> { chip :: Chip, glyphs :: Array GlyphInst } /\ { chip :: Chip, glyphs :: Array GlyphInst }
  -> { chip :: Chip, glyphs :: Array GlyphInst } /\ ChipSpring
applyChipSpring dt prevSprings samples i (raw /\ resolved) = shiftLayout spr.ox spr.oy raw /\ spr
  where
  id = fromMaybe 0.0 (_.startT <$> (samples !! i))
  tx = resolved.chip.cx - raw.chip.cx
  ty = resolved.chip.cy - raw.chip.cy
  prev = fromMaybe { id, ox: tx, oy: ty, vx: 0.0, vy: 0.0 } (find (\sp -> sp.id == id) prevSprings)
  spr = springStep dt tx ty prev

-- Project a world point to dpr-scaled screen px (y up, matching gl_FragCoord) by
-- inverting the raymarch camera: tilt the point by -uTilt about x, then the
-- pinhole at z = 12 looking down -z. `r` is the dot's apparent screen radius.
project :: Number -> Number -> Number -> Point -> { x :: Number, y :: Number, r :: Number }
project tilt resW resH g =
  { x: g.x / denom * resH + 0.5 * resW
  , y: g.y * cos tilt / denom * resH + 0.5 * resH
  , r: ballRadius / denom * resH
  }
  where
  denom = g.y * sin tilt + 12.0

-- ---------------------------------------------------------------------------
-- The component: bind a GL context to the canvas, push the static scene as
-- uniforms once, then drive uTime/uTilt and the per-frame token + chip uniforms
-- on a paused-aware rAF loop.
-- ---------------------------------------------------------------------------

diagramComponent :: ReactComponent {}
diagramComponent = unsafePerformEffect $ reactComponent "SdfDiagram" \_ -> Hooks.do
  canvasRef <- useRef (null :: Nullable CanvasElement)
  timeRef <- useRef 0.0
  lastWallRef <- useRef 0.0
  rafRef <- useRef (Nothing :: Maybe RequestAnimationFrameId)
  advRef <- useRef ([] :: Array Number)
  springRef <- useRef ([] :: Array ChipSpring)

  Hooks.useEffectOnce $ readRefMaybe canvasRef >>= case _ of
    Nothing -> pure (pure unit)
    Just canvasEl -> GL.getContext canvasEl >>= toMaybe >>> case _ of
      Nothing -> pure (pure unit)
      Just gl -> do
        GL.getExtension gl "OES_standard_derivatives"
        program <- GL.buildProgram gl { vertex: vert, fragment: frag }
        GL.setupQuad gl program
        uRes <- GL.uniformLocation gl program "uRes"
        uTime <- GL.uniformLocation gl program "uTime"
        uTilt <- GL.uniformLocation gl program "uTilt"
        uNodeCount <- GL.uniformLocation gl program "uNodeCount"
        uEdgeCount <- GL.uniformLocation gl program "uEdgeCount"
        uNodeRect <- GL.uniformLocation gl program "uNodeRect"
        uNodeShape <- GL.uniformLocation gl program "uNodeShape"
        uEdge <- GL.uniformLocation gl program "uEdge"
        uArrow <- GL.uniformLocation gl program "uArrow"
        uArrowCount <- GL.uniformLocation gl program "uArrowCount"
        uLabel <- GL.uniformLocation gl program "uLabel"
        uLabelAspect <- GL.uniformLocation gl program "uLabelAspect"
        uUnit <- GL.uniformLocation gl program "uUnit"
        uTokCount <- GL.uniformLocation gl program "uTokCount"
        uTokPos <- GL.uniformLocation gl program "uTokPos"
        uTokGlow <- GL.uniformLocation gl program "uTokGlow"
        uTokNode <- GL.uniformLocation gl program "uTokNode"
        uGlyphAtlas <- GL.uniformLocation gl program "uGlyphAtlas"
        uChipCount <- GL.uniformLocation gl program "uChipCount"
        uChipRect <- GL.uniformLocation gl program "uChipRect"
        uChipDot <- GL.uniformLocation gl program "uChipDot"
        uGlyphCount <- GL.uniformLocation gl program "uGlyphCount"
        uGlyphRect <- GL.uniformLocation gl program "uGlyphRect"
        uGlyphCell <- GL.uniformLocation gl program "uGlyphCell"
        uGlyphAlpha <- GL.uniformLocation gl program "uGlyphAlpha"
        GL.uniform1i gl uLabel 0
        GL.uniform1i gl uGlyphAtlas 1
        GL.uniform1f gl uLabelAspect (atlasW / atlasRow)
        GL.uniform1f gl uUnit unitHalfH
        labelTexture <- GL.createTexture gl
        glyphTexture <- GL.createTexture gl
        ensureAtlas gl labelTexture
        ensureGlyphAtlas gl glyphTexture advRef

        GL.uniform1i gl uNodeCount (length nodeList)
        GL.uniform1i gl uEdgeCount (length edgeSegFlat / 4)
        GL.uniform1i gl uArrowCount (length arrowFlat / 4)
        GL.uniform4fv gl uNodeRect nodeRectFlat
        GL.uniform1fv gl uNodeShape nodeShapeFlat
        GL.uniform4fv gl uEdge edgeSegFlat
        GL.uniform4fv gl uArrow arrowFlat

        win <- window
        let
          renderFrame = do
            wall <- GL.now
            prev <- readRef lastWallRef
            writeRef lastWallRef wall
            let dt = min 0.05 ((wall - prev) / 1000.0)
            drawScene dt
            id <- requestAnimationFrame renderFrame win
            writeRef rafRef (Just id)

          drawScene acc = do
            now <- readRef timeRef
            let now' = now + acc
            writeRef timeRef now'
            size <- GL.clientSize canvasEl
            dpr <- clampDpr <$> GL.devicePixelRatio
            advances <- readRef advRef
            springs <- readRef springRef
            when (size.width > 0.0) do
              let
                resW = size.width * dpr
                resH = size.height * dpr
                tilt = idleTilt + sin (now' * 0.4) * 0.13
                samples = sampleFlows (loopTime now')
                fontPx = clamp 14.0 40.0 (resH * 0.02)
                rawLayouts = (\s -> layoutChip advances fontPx (project tilt resW resH { x: s.x, y: s.y }) s.motionT s.labels) <$> samples
                resolvedLayouts = resolveCollisions (nodeScreenRect tilt resW resH <$> worldNodes) rawLayouts
                sprung = mapWithIndex (applyChipSpring acc springs samples) (zipWith (/\) rawLayouts resolvedLayouts)
                chips = (\(l /\ _) -> l) <$> sprung
                newSprings = (\(_ /\ sp) -> sp) <$> sprung
                glyphs = take maxGlyphs (concatMap _.glyphs chips)
              writeRef springRef newSprings
              GL.resize gl canvasEl (round resW) (round resH)
              GL.clear gl
              GL.uniform2f gl uRes resW resH
              GL.uniform1f gl uTime now'
              GL.uniform1f gl uTilt tilt
              GL.uniform1i gl uTokCount (length samples)
              GL.uniform2fv gl uTokPos (concatMap (\s -> [ s.x, s.y ]) samples)
              GL.uniform1fv gl uTokGlow (_.glow <$> samples)
              GL.uniform2fv gl uTokNode (concatMap (\s -> [ s.nx, s.ny ]) samples)
              GL.uniform1i gl uChipCount (length chips)
              GL.uniform4fv gl uChipRect (concatMap (\c -> [ c.chip.cx, c.chip.cy, c.chip.hw, c.chip.hh ]) chips)
              GL.uniform2fv gl uChipDot (concatMap (\c -> [ c.chip.dotX, c.chip.dotY ]) chips)
              GL.uniform1i gl uGlyphCount (length glyphs)
              GL.uniform4fv gl uGlyphRect (concatMap (\g -> [ g.cx, g.cy, g.hw, g.hh ]) glyphs)
              GL.uniform1fv gl uGlyphCell (_.cell <$> glyphs)
              GL.uniform1fv gl uGlyphAlpha (_.alpha <$> glyphs)
              GL.drawQuad gl

          start = do
            writeRef lastWallRef =<< GL.now
            id <- requestAnimationFrame renderFrame win
            writeRef rafRef (Just id)

          stop = readRef rafRef >>= traverse_ \id -> do
            cancelAnimationFrame id win
            writeRef rafRef Nothing

        start
        stopActive <- onActiveChange \active -> readRef rafRef >>= \r -> case active, r of
          true, Nothing -> start
          false, Just _ -> stop
          _, _ -> pure unit
        pure (stop *> stopActive)

  pure $
    div
      { style: css { position: "absolute", inset: "0" } }
      [ canvas
          { ref: reactRef canvasRef
          , style: css { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block" }
          }
          noJSX
      ]

clampDpr :: Number -> Number
clampDpr d = max 1.0 (min 2.0 d)

-- Cap the raymarcher at ~30fps. The idle sway and token drift are slow enough
-- that the display's native 60/120Hz is invisible next to it, while halving or
-- quartering the GPU's fragment-shader work — the dominant battery cost here.

idleTilt :: Number
idleTilt = 0.34

-- ---------------------------------------------------------------------------
-- Shaders. The vertex stage is the bare quad; the fragment stage raymarches the
-- whole graph, then composites the screen-space chip overlay on top. All scene
-- data arrives as uniform arrays, indexed only inside bounded loops (WebGL1
-- forbids dynamic uniform-array indexing elsewhere — the nearest node's shape is
-- carried out of the loop, not looked up; chip glyphs are absolute-positioned so
-- the loop counter is the only index).
-- ---------------------------------------------------------------------------

vert :: String
vert = "attribute vec2 position; void main(){ gl_Position = vec4(position, 0.0, 1.0); }"

frag :: String
frag =
  """
  #extension GL_OES_standard_derivatives : enable
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uTilt;
  uniform int uNodeCount;
  uniform int uEdgeCount;
  uniform int uArrowCount;
  uniform vec4 uNodeRect[24];   // (cx, cy, w, h) in world space
  uniform float uNodeShape[24]; // markgraf Shape id
  uniform vec4 uEdge[48];       // (x1, y1, x2, y2) orthogonal route segments
  uniform vec4 uArrow[32];      // (tipX, tipY, dirX, dirY) one per edge
  uniform sampler2D uLabel;     // baked node-label atlas, one node-label per row
  uniform float uLabelAspect;   // atlas cell width/height, to keep glyphs square
  uniform float uUnit;          // a node's half-height in world units — the
                                // characteristic scale everything else is sized by
  uniform int uTokCount;        // active data-flow balls this frame
  uniform vec2 uTokPos[8];      // their centres, in world space
  uniform float uTokGlow[8];    // each ball's 0..1 overlap with the block it's in
  uniform vec2 uTokNode[8];     // the centre of that block, to light only it

  uniform sampler2D uGlyphAtlas; // per-glyph atlas (one ASCII char per cell)
  uniform int uChipCount;        // floating label chips this frame
  uniform vec4 uChipRect[8];     // (cx, cy, hw, hh) in screen px
  uniform vec2 uChipDot[8];      // the dot each chip points at, screen px
  uniform int uGlyphCount;       // laid-out chip glyphs across all chips
  uniform vec4 uGlyphRect[40];   // (cx, cy, hw, hh) in screen px
  uniform float uGlyphCell[40];  // atlas cell index of each glyph
  uniform float uGlyphAlpha[40]; // typewriter reveal alpha of each glyph

  const int MAXN = 24;
  const int MAXE = 48;
  const int MAXA = 32;
  const int MAXTOK = 8;
  const int MAXG = 40;
  const float GCOLS = 16.0;
  const float GROWS = 6.0;
  // Sized from uUnit in main() so proportions hold for any diagram, whatever
  // scale the layout came back at.
  float DEPTH, EDGE_R, EDGE_HZ, ARROW_LEN, ARROW_HW;

  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
  // The texture v that samples atlas `row` (0-based, top to bottom) at within-cell
  // height `ty` (0 bottom .. 1 top), over `rows` rows. FLIP_Y on upload means
  // canvas-top maps to v=1, hence the 1.0 - ... form.
  float rowV(float row, float ty, float rows){ return 1.0 - (row + 1.0 - ty)/rows; }

  float sdSphere(vec3 p,float r){ return length(p)-r; }
  float sdRoundBox(vec3 p, vec3 b, float r){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r; }
  float sdBox2(vec2 p, vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
  float sdRoundRect2(vec2 p, vec2 b, float r){ vec2 q=abs(p)-b+r; return min(max(q.x,q.y),0.)+length(max(q,0.))-r; }
  float sdEll2(vec2 p, vec2 r){ float k1=length(p/r); float k2=length(p/(r*r)); return k1*(k1-1.0)/k2; }
  float ndot(vec2 a, vec2 b){ return a.x*b.x - a.y*b.y; }
  float sdRhombus2(vec2 p, vec2 b){
    p = abs(p);
    float h = clamp(ndot(b - 2.0*p, b) / dot(b,b), -1.0, 1.0);
    float d = length(p - 0.5*b*vec2(1.0-h, 1.0+h));
    return d * sign(p.x*b.y + p.y*b.x - b.x*b.y);
  }
  // extrude a 2D distance d2 into a z-slab of half-thickness hz
  float extr(float d2, float pz, float hz){ vec2 w=vec2(d2, abs(pz)-hz); return min(max(w.x,w.y),0.)+length(max(w,0.)); }
  float smin(float a,float b,float k){ float h=clamp(0.5+0.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }

  // A node's silhouette, by markgraf Shape id, centred at the origin with half
  // extents he. Anything unrecognised falls back to a rounded rectangle.
  float nodeShapeDist(int sh, vec3 q, vec2 he){
    if(sh==1){ // Cylinder: straight body with elliptical caps (a side-view can)
      float bodyH = he.y*0.74, capH = he.y*0.26;
      float body = sdBox2(q.xy, vec2(he.x, bodyH));
      float top  = sdEll2(q.xy - vec2(0.0,  bodyH), vec2(he.x, capH));
      float bot  = sdEll2(q.xy - vec2(0.0, -bodyH), vec2(he.x, capH));
      return extr(min(min(body, top), bot), q.z, DEPTH);
    }
    if(sh==3) return extr(sdRhombus2(q.xy, he), q.z, DEPTH);       // Diamond
    if(sh==4) return extr(sdEll2(q.xy, he), q.z, DEPTH);            // Ellipse
    if(sh==6){ // Cloud: a smooth union of lobes over a flat base
      float r = he.y;
      float d = sdSphere(q - vec3(-he.x*0.55, 0.0, 0.0), r*0.78);
      d = smin(d, sdSphere(q - vec3(-he.x*0.12,  he.y*0.30, 0.0), r*0.95), r*0.5);
      d = smin(d, sdSphere(q - vec3( he.x*0.35,  he.y*0.10, 0.0), r*0.85), r*0.5);
      d = smin(d, sdSphere(q - vec3( he.x*0.62, -he.y*0.05, 0.0), r*0.62), r*0.5);
      d = smin(d, sdRoundBox(q - vec3(0.0, -he.y*0.5, 0.0), vec3(he.x*0.9, he.y*0.22, DEPTH), r*0.2), r*0.5);
      return d;
    }
    return sdRoundBox(q, vec3(he.x, he.y, DEPTH), min(he.x,he.y)*0.18); // Rectangle
  }

  // Nearest node. The winner's shape, row index and rect are carried out of the
  // loop (WebGL1 forbids indexing uNode* with a non-loop index, so they can't be
  // looked up again afterwards).
  float mapNodeFull(vec3 p, out float nshape, out float nidx, out vec4 nrect){
    float d = 1e9; nshape = -1.0; nidx = -1.0; nrect = vec4(0.0);
    for(int i=0;i<MAXN;i++){
      if(i>=uNodeCount) break;
      vec4 r = uNodeRect[i];
      float sh = uNodeShape[i];
      float nd = nodeShapeDist(int(sh+0.5), p - vec3(r.x, r.y, 0.0), r.zw*0.5);
      if(nd < d){ d = nd; nshape = sh; nidx = float(i); nrect = r; }
    }
    return d;
  }
  float mapNode(vec3 p){ float a, b; vec4 c; return mapNodeFull(p, a, b, c); }

  float sdSeg2(vec2 p, vec2 a, vec2 b, float r){
    vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
    return length(pa-ba*h)-r;
  }
  // Extruded triangular arrowhead, tip at `tip`, pointing along unit `dir`.
  // Rounded and given real z-depth so it reads as a little volume that the ball
  // smooth-unions with cleanly, rather than a thin flat sliver.
  float arrowHead(vec3 p, vec2 tip, vec2 dir){
    vec2 n = vec2(-dir.y, dir.x);
    vec2 q = p.xy - tip;
    float along = dot(q, dir);           // <=0 behind the tip
    float side  = abs(dot(q, n));
    float tFrac = clamp(-along/ARROW_LEN, 0.0, 1.0);
    float d2 = max(max(side - ARROW_HW*tFrac, along), -along - ARROW_LEN) - uUnit*0.05;
    return extr(d2, p.z, uUnit*0.28);
  }
  float mapEdge(vec3 p){
    float d = 1e9;
    for(int i=0;i<MAXE;i++){
      if(i>=uEdgeCount) break;
      vec4 e = uEdge[i];
      d = min(d, extr(sdSeg2(p.xy, e.xy, e.zw, EDGE_R), p.z, EDGE_HZ));
    }
    for(int i=0;i<MAXA;i++){
      if(i>=uArrowCount) break;
      vec4 ar = uArrow[i];
      d = min(d, arrowHead(p, ar.xy, ar.zw));
    }
    return d;
  }

  // A travelling ball centred at q's origin, swollen a little by its overlap. The
  // uniform-array indexing must happen at the call site (a loop symbol), never via
  // a passed-in index — WebGL1 forbids the latter.
  float tokenBall(vec3 q, float glow){
    return sdSphere(q, uUnit*0.46 * (1.0 + glow*0.6));
  }
  // The whole scene, after tilting the world about x so the slabs show depth.
  // Each ball genie-merges with the nearest block (a generous blend that stretches
  // into a thinning, pinching neck) and fuses with the edge it rides.
  float map(vec3 p){
    p.yz = rot(uTilt) * p.yz;
    float nodes = mapNode(p);
    float edges = mapEdge(p);
    float d = min(nodes, edges);
    for(int i=0;i<MAXTOK;i++){
      if(i>=uTokCount) break;
      float tok = tokenBall(p - vec3(uTokPos[i], 0.0), uTokGlow[i]);
      d = min(d, smin(nodes, tok, uUnit*1.4));
      d = min(d, smin(edges, tok, uUnit*0.7));
    }
    return d;
  }
  vec3 calcNormal(vec3 p){ vec2 e=vec2(0.0015,0.); return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx))); }
  float calcAO(vec3 p, vec3 n){ float occ=0., sca=1.; for(int i=0;i<5;i++){ float h=0.01+0.12*float(i)/4.; occ+=(h-map(p+n*h))*sca; sca*=0.9; } return clamp(1.-2.2*occ,0.,1.); }

  // Neutral grey blocks (the orange belongs to the travelling ball); a faint
  // variation by shape keeps them from looking flat.
  vec3 nodeTint(int sh){
    if(sh==1) return vec3(0.50,0.51,0.55);  // cylinder
    if(sh==6) return vec3(0.62,0.63,0.66);  // cloud
    if(sh==3) return vec3(0.55,0.54,0.53);  // diamond
    if(sh==4) return vec3(0.52,0.56,0.55);  // ellipse
    return vec3(0.56,0.56,0.59);            // rectangle
  }

  void main(){
    DEPTH = uUnit*0.42; EDGE_R = uUnit*0.16; EDGE_HZ = uUnit*0.12;
    ARROW_LEN = uUnit*0.55; ARROW_HW = uUnit*0.34;

    vec2 uv = (gl_FragCoord.xy - 0.5*uRes)/uRes.y;
    vec3 ro = vec3(0.0, 0.0, 12.0);
    vec3 rd = normalize(vec3(uv*1.5, -1.5));

    float t = 0.0; bool hit = false; vec3 p;
    for(int i=0;i<96;i++){
      p = ro + rd*t;
      float d = map(p);
      if(d < 0.001){ hit = true; break; }
      t += d*0.85;
      if(t > 30.0) break;
    }

    // background: a soft dark vertical wash with a faint vignette
    vec3 bg = mix(vec3(0.05,0.05,0.06), vec3(0.10,0.10,0.12), uv.y*0.5+0.5);
    bg *= 1.0 - 0.25*dot(uv,uv);
    vec3 col = bg;

    if(hit){
      vec3 n = calcNormal(p);
      // classify the hit (node vs edge) and recover the winning node
      vec3 pw = p; pw.yz = rot(uTilt) * pw.yz;
      float nshape, nidx; vec4 nrect;
      float dn = mapNodeFull(pw, nshape, nidx, nrect); float de = mapEdge(pw);
      bool isNode = dn <= de;

      // The install button's glassy material, tinted: diffuse + glossy spec, a
      // subtle rim, a fresnel mix toward a cool glass reflection, and a sharp
      // clearcoat highlight on top.
      vec3 v = -rd;
      vec3 key  = normalize(vec3(0.55, 0.8, 0.7));
      vec3 fill = normalize(vec3(-0.6, 0.25, 0.5));
      float ao = calcAO(p, n);
      float difKey  = clamp(dot(n,key), 0.0, 1.0);
      float difFill = clamp(dot(n,fill), 0.0, 1.0);
      float fres = pow(1.0 - clamp(dot(n,v),0.,1.), 3.0);
      vec3 hlf = normalize(key + v);
      float spec = pow(clamp(dot(n,hlf),0.,1.), 60.0);
      vec3 refl = reflect(rd, n);

      vec3 base = isNode ? nodeTint(int(nshape+0.5)) : vec3(0.40,0.42,0.47); // edges/arrows grey
      col = base*(0.5 + 0.5*difKey + 0.18*difFill) * (0.72 + 0.28*ao);
      col += vec3(1.0)*spec*0.4;                  // glossy highlight
      col += base*fres*0.3;                       // subtle rim
      vec3 glass = mix(vec3(0.10,0.11,0.16), vec3(0.74,0.76,0.85), clamp(refl.y*0.5+0.5,0.,1.));
      col = mix(col, glass, fres*0.45);
      float cc = pow(clamp(dot(n,hlf),0.,1.), 230.0); col += cc*0.9;

      // the block a ball is inside lights up warm and whole (gated by matching the
      // ball's block centre, so only that block lights); the edge a ball rides
      // lights along the stretch near it.
      if(isNode){
        float glow = 0.0;
        for(int i=0;i<MAXTOK;i++){
          if(i>=uTokCount) break;
          if(distance(uTokNode[i], nrect.xy) < uUnit*0.6) glow = max(glow, uTokGlow[i]);
        }
        col += vec3(1.0,0.6,0.26) * glow * (0.9 + 0.5*difKey);
      } else {
        float glow = 0.0;
        for(int i=0;i<MAXTOK;i++){
          if(i>=uTokCount) break;
          glow = max(glow, 1.0 - smoothstep(0.0, uUnit*1.8, distance(pw, vec3(uTokPos[i], 0.0))));
        }
        col += vec3(1.0,0.55,0.22) * glow * 0.7;
      }

      // label: stamp the node's atlas row onto its front face. The band is sized
      // in world units (a fixed height, width = height*cellAspect) and centred on
      // the node, so a texel stays square whatever the node's own aspect is.
      if(isNode){
        vec3 q = pw - vec3(nrect.x, nrect.y, 0.0);
        float bandH = uUnit*1.5;
        float bandW = bandH * uLabelAspect;
        vec2 tc = vec2(q.x/bandW + 0.5, q.y/bandH + 0.5);
        float inCell = step(0.0,tc.x)*step(tc.x,1.0)*step(0.0,tc.y)*step(tc.y,1.0);
        float front = smoothstep(-DEPTH*0.2, DEPTH*0.35, q.z);  // front / top-front faces
        float a = texture2D(uLabel, vec2(tc.x, rowV(nidx, tc.y, float(uNodeCount)))).a * inCell * front;
        col = mix(col, vec3(0.03,0.03,0.05), a);
      }

      // tokens: tint everything within a ball (and its bulge) warm orange, with
      // an emissive lift — so the balls read on top of the blocks.
      float ti = 0.0;
      for(int i=0;i<MAXTOK;i++){
        if(i>=uTokCount) break;
        ti = max(ti, 1.0 - smoothstep(-uUnit*0.2, uUnit*0.85, tokenBall(pw - vec3(uTokPos[i], 0.0), uTokGlow[i])));
      }
      vec3 tokCol = vec3(1.0, 0.55, 0.18);
      col = mix(col, tokCol, ti);
      col += tokCol * ti * 0.45;
    }

    // ---- screen-space chip overlay (pill + tail + typewriter glyphs) ----------
    // Drawn after the 3D scene, in raw pixels, so the labels float on top of the
    // diagram exactly like markgraf's drawTokenLabel. Glyphs carry absolute screen
    // rects, so the loop counter is the only uniform-array index.
    vec2 fc = gl_FragCoord.xy;
    for(int i=0;i<MAXTOK;i++){
      if(i>=uChipCount) break;
      vec4 cr = uChipRect[i];
      vec2 dotP = uChipDot[i];
      float dPill = sdRoundRect2(fc - cr.xy, cr.zw, min(cr.z, cr.w)*0.54);
      vec2 anchor = vec2(cr.x - cr.z, cr.y);                 // near (dot-side) edge
      float dTail = sdSeg2(fc, anchor, dotP, max(2.5, cr.w*0.22));
      float d = min(dPill, dTail);
      // soft drop-shadow gives the chip depth/lift
      float shadow = (1.0 - smoothstep(0.0, 18.0, dPill + 8.0)) * 0.28;
      col = mix(col, vec3(0.0), shadow);
      // subtle outer glow — makes the pill read as a raised object
      float halo = (1.0 - smoothstep(0.0, max(cr.z, cr.w)*0.45, max(dPill, 0.0))) * 0.07;
      col = mix(col, vec3(1.0), halo);
      float fw = fwidth(d);
      float fill = 1.0 - smoothstep(-fw, fw, d);
      col = mix(col, vec3(0.99, 0.97, 0.92), fill);          // warm card
      float fwp = fwidth(dPill);
      float border = (1.0 - smoothstep(-fwp, fwp, abs(dPill) - 1.0)) * fill;
      col = mix(col, vec3(0.72, 0.69, 0.62), border*0.5);
    }
    for(int k=0;k<MAXG;k++){
      if(k>=uGlyphCount) break;
      vec4 gr = uGlyphRect[k];
      vec2 loc = (fc - gr.xy)/gr.zw;                         // [-1,1] within the cell
      if(abs(loc.x) <= 1.0 && abs(loc.y) <= 1.0){
        vec2 cell = loc*0.5 + 0.5;                           // [0,1]
        float idx = uGlyphCell[k];
        float gcol = mod(idx, GCOLS);
        float grow = floor(idx / GCOLS);
        float u = (gcol + cell.x)/GCOLS;
        float vv = rowV(grow, cell.y, GROWS);
        float a = texture2D(uGlyphAtlas, vec2(u, vv)).a * uGlyphAlpha[k];
        col = mix(col, vec3(0.10,0.08,0.06), a);             // dark ink
      }
    }

    gl_FragColor = vec4(col, 1.0);
  }
  """
