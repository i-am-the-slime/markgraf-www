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
import Control.Alternative (guard)
import Data.Number (abs, cos, floor, pow, sin, sqrt)
import Effect.Uncurried (EffectFn5, runEffectFn5)
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

-- One arrowhead per edge: (tipX, tipY, dirX, dirY).
-- The tip is pulled back from the node centre to the node surface so the
-- arrowhead lands flush rather than embedding itself inside the block.
arrowFlat :: Array Number
arrowFlat = concatMap arrow worldEdges
  where
  arrow pts = fromMaybe [] do
    prev /\ tip <- withTail pts (/\)
    let l = len prev tip
    guard (l > 0.0001)
    let dirX = (tip.x - prev.x) / l
        dirY = (tip.y - prev.y) / l
    tgt <- minimumBy (comparing (distSq tip)) worldNodes
    let sd = min (tgt.hw / (abs dirX + 0.0001)) (tgt.hh / (abs dirY + 0.0001))
    pure [ tip.x - dirX * sd, tip.y - dirY * sd, dirX, dirY ]
  distSq p n = (p.x - n.x) * (p.x - n.x) + (p.y - n.y) * (p.y - n.y)

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
  hh = fontPx * 0.62 + padY
  centerX = dot.x + dot.r + gap + labelW / 2.0
  centerY = dot.y + dot.r + gap - hh
  textLeft = centerX - labelW / 2.0
  chip = { cx: centerX, cy: centerY, hw: labelW / 2.0 + padX, hh, dotX: dot.x, dotY: dot.y }
  gh = fontPx * (glyphCellH / glyphBakeFont)
  gw = gh * (glyphCellW / glyphCellH)
  glyphs = snd (foldl place (textLeft /\ []) (mapWithIndex (/\) chars))
  place (cursor /\ acc) (i /\ ch) = (cursor + adv) /\ (if eased > 0.0 then snoc acc inst else acc)
    where
    adv = advPx ch
    eased = glyphEase active.phase count i
    -- letters fall down into place: start a little above the baseline, ease to it
    inst = { cx: cursor + adv / 2.0, cy: centerY + (1.0 - eased) * fontPx * 0.85, hw: gw / 2.0, hh: gh / 2.0, cell: glyphCell ch, alpha: eased }
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
nodeScreenRect :: Camera -> Number -> Number -> WorldNode -> ChipObstacle
nodeScreenRect cam resW resH n = { cx: sx, cy: sy, hw: shw, hh: shh }
  where
  denom = cam.camZ + n.y * sin cam.tilt + n.x * sin cam.rotY * cos cam.tilt
  sx = (n.x * cos cam.rotY - cam.panX) / denom * resH + 0.5 * resW
  sy = (n.y * cos cam.tilt - n.x * sin cam.rotY * sin cam.tilt - cam.panY) / denom * resH + 0.5 * resH
  shw = n.hw / denom * resH
  shh = n.hh * cos cam.tilt / denom * resH

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
  pad = 80.0
  overlaps o =
    chip.cx - chip.hw < o.cx + o.hw + pad
      && chip.cx + chip.hw > o.cx - o.hw - pad
      && chip.cy - chip.hh < o.cy + o.hh + pad
      && chip.cy + chip.hh > o.cy - o.hh - pad
  sRight o = ((o.cx + o.hw + pad) - (chip.cx - chip.hw)) / invSqrt2
  sUp o = ((o.cy + o.hh + pad) - (chip.cy - chip.hh)) / invSqrt2

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

type Camera = { tilt :: Number, rotY :: Number, camZ :: Number, panX :: Number, panY :: Number }

-- Project a world point to dpr-scaled screen px (y up, matching gl_FragCoord).
-- Applies Y rotation (xz plane) then X tilt (yz plane) to match the shader.
project :: Camera -> Number -> Number -> Point -> { x :: Number, y :: Number, r :: Number }
project cam resW resH g =
  { x: (g.x * cos cam.rotY - cam.panX) / denom * resH + 0.5 * resW
  , y: (g.y * cos cam.tilt - g.x * sin cam.rotY * sin cam.tilt - cam.panY) / denom * resH + 0.5 * resH
  , r: ballRadius / denom * resH
  }
  where
  denom = cam.camZ + g.y * sin cam.tilt + g.x * sin cam.rotY * cos cam.tilt

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
  camZRef <- useRef 12.0
  panXRef <- useRef 0.0
  panYRef <- useRef 0.0
  rotYRef <- useRef 0.0
  tiltOffRef <- useRef 0.0
  dragRef <- useRef (Nothing :: Maybe { x :: Number, y :: Number })
  sizeRef <- useRef { resW: 0.0, resH: 0.0 }

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
        uCamZ <- GL.uniformLocation gl program "uCamZ"
        uCamPanX <- GL.uniformLocation gl program "uCamPanX"
        uCamPanY <- GL.uniformLocation gl program "uCamPanY"
        uRotY <- GL.uniformLocation gl program "uRotY"
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
            camZ <- readRef camZRef
            panX <- readRef panXRef
            panY <- readRef panYRef
            rotY <- readRef rotYRef
            tiltOff <- readRef tiltOffRef
            when (size.width > 0.0) do
              let
                resW = size.width * dpr
                resH = size.height * dpr
                tilt = idleTilt + sin (now' * 0.4) * 0.13 + tiltOff
                cam = { tilt, rotY, camZ, panX, panY }
                samples = sampleFlows (loopTime now')
                fontPx = clamp 14.0 40.0 (resH * 0.02)
                proj s = project cam resW resH { x: s.x, y: s.y }
                rawLayouts = (\s -> layoutChip advances fontPx (proj s) s.motionT s.labels) <$> samples
                resolvedLayouts = resolveCollisions (nodeScreenRect cam resW resH <$> worldNodes) rawLayouts
                sprung = mapWithIndex (applyChipSpring acc springs samples) (zipWith (/\) rawLayouts resolvedLayouts)
                chips = (\(l /\ _) -> l) <$> sprung
                newSprings = (\(_ /\ sp) -> sp) <$> sprung
                glyphs = take maxGlyphs (concatMap _.glyphs chips)
              writeRef sizeRef { resW, resH }
              writeRef springRef newSprings
              GL.resize gl canvasEl (round resW) (round resH)
              GL.clear gl
              GL.uniform2f gl uRes resW resH
              GL.uniform1f gl uTime now'
              GL.uniform1f gl uTilt tilt
              GL.uniform1f gl uCamZ camZ
              GL.uniform1f gl uCamPanX panX
              GL.uniform1f gl uCamPanY panY
              GL.uniform1f gl uRotY rotY
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
        cleanupListeners <- setupCameraListeners canvasEl
          (\deltaY -> do
            camZ <- readRef camZRef
            writeRef camZRef (clamp 2.0 20.0 (camZ * pow 1.001 deltaY)))
          (\x y -> writeRef dragRef (Just { x, y }))
          (\x y _buttons shift -> do
            readRef dragRef >>= case _ of
              Nothing -> pure unit
              Just prev -> do
                let dx = x - prev.x
                    dy = y - prev.y
                writeRef dragRef (Just { x, y })
                camZ <- readRef camZRef
                { resW, resH } <- readRef sizeRef
                if shift > 0.5
                  then do
                    tiltOff <- readRef tiltOffRef
                    writeRef tiltOffRef (clamp (-0.8) 0.8 (tiltOff + dy * 0.005))
                  else if _buttons >= 1.5
                  then do
                    rotY <- readRef rotYRef
                    writeRef rotYRef (rotY + dx * 0.005)
                  else do
                    panX <- readRef panXRef
                    panY <- readRef panYRef
                    writeRef panXRef (panX - dx * camZ / resH)
                    writeRef panYRef (panY + dy * camZ / resH))
          (\_ _ -> writeRef dragRef Nothing)
        pure (stop *> stopActive *> cleanupListeners)

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

foreign import vert :: String
foreign import frag :: String

setupCameraListeners
  :: CanvasElement
  -> (Number -> Effect Unit)
  -> (Number -> Number -> Effect Unit)
  -> (Number -> Number -> Number -> Number -> Effect Unit)
  -> (Number -> Number -> Effect Unit)
  -> Effect (Effect Unit)
setupCameraListeners = runEffectFn5 setupCameraListenersImpl

foreign import setupCameraListenersImpl
  :: EffectFn5
       CanvasElement
       (Number -> Effect Unit)
       (Number -> Number -> Effect Unit)
       (Number -> Number -> Number -> Number -> Effect Unit)
       (Number -> Number -> Effect Unit)
       (Effect Unit)

