module Component.HeroPreview.SectionLabel
  ( sectionLabel
  , spreadFolio
  ) where

import Prelude

import Component.HeroPreview.DOM (findElementById)
import Data.Array as Array
import Data.Foldable (for_)
import Data.Int as Int
import Data.Maybe (Maybe(..), fromMaybe, maybe)
import Data.Monoid as Monoid
import Data.Nullable (Nullable, null)
import Data.Options ((:=))
import Data.String.CodeUnits as CU
import Data.String.Common (joinWith, toUpper)
import Data.Traversable (traverse)
import Data.Tuple.Nested ((/\))
import Effect (Effect)
import Effect.Aff (Aff, Milliseconds(..), delay, launchAff_)
import Effect.Class (liftEffect)
import Effect.Random (random)
import Effect.Ref as Ref
import Effect.Unsafe (unsafePerformEffect)
import Motion.Element as Motion
import React.Basic (JSX, ReactComponent, element)
import React.Basic.Hooks (reactComponent, readRefMaybe, useEffect, useRef, useState')
import React.Basic.Hooks as Hooks
import Web.DOM.Element as Element
import Web.Intersection.Observer as IO
import Web.Intersection.Observer.Options as IO
import Yoga.React.DOM.Attributes (reactRef)
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.HTML.Span (span)

sectionLabel :: String -> JSX
sectionLabel label = element sectionLabelComponent { label }

-- | Editorial eyebrow: a short red rule that draws in left-to-right, then mono
-- | text that scrambles through random characters before settling on the real
-- | label. Re-fires every time the element scrolls into view (snap-mandatory
-- | pages retrigger on re-entry).
sectionLabelComponent :: ReactComponent { label :: String }
sectionLabelComponent = unsafePerformEffect $ reactComponent "SectionLabel" \{ label } -> Hooks.do
  let upper = toUpper label
  -- The line draws as the scramble is settling and lands on the very same beat
  -- as the last character: start it one full draw-duration before the scramble's
  -- stop, so `start + ruleDrawDuration` coincides with the text settling.
  let lastEnd = (CU.length upper - 1) * scrambleStagger + scrambleDuration
  let lineDelay = max 0.0 ((scrambleStartDelay + Int.toNumber lastEnd) / 1000.0 - ruleDrawDuration)
  nodeRef <- useRef (null :: Nullable Element.Element)
  inView /\ setInView <- useState' false
  shown /\ setShown <- useState' upper

  useEffect label $ observeInView nodeRef setInView

  useEffect (inView /\ upper) $ runScrambleWhileInView inView upper setShown

  pure $ div { className: eyebrowClass, ref: reactRef nodeRef }
    [ redRule inView lineDelay
    , span { className: "text-brand" } shown
    ]
  where
  -- min-h reserves the row's full line height so the scramble's blank phase
  -- (label briefly set to collapsing whitespace) can't shrink the eyebrow to
  -- the 1px red rule and shunt the headline below it up and back down.
  eyebrowClass = "flex items-center gap-4 mb-8 min-h-[1.5em] font-mono text-[10px] uppercase tracking-[0.35em]"

-- The red rule draws right-to-left (origin-right) once the typing has settled,
-- then retracts immediately when out of view.
redRule :: Boolean -> Number -> JSX
redRule inView drawDelay =
  Motion.createMotionElement "span"
    { className: "h-px w-10 bg-brand block origin-right"
    , initial: { scaleX: 0.0 }
    , animate: { scaleX: if inView then 1.0 else 0.0 }
    , transition: { duration: ruleDrawDuration, delay: if inView then drawDelay else 0.0, ease: [ 0.65, 0.0, 0.35, 1.0 ] }
    }
    ([] :: Array JSX)

-- Observes the label's own node against the magazine scroller, toggling inView
-- as it crosses the halfway threshold. Returns a cleanup that unobserves.
observeInView :: Hooks.Ref (Nullable Element.Element) -> (Boolean -> Effect Unit) -> Effect (Effect Unit)
observeInView nodeRef setInView = readRefMaybe nodeRef >>= case _ of
  Nothing -> pure (pure unit)
  Just el -> do
    rootEl <- findElementById "magazine"
    let opts = IO.threshold := 0.5 <> maybe mempty (\r -> IO.root := r) rootEl
    obs <- IO.newIntersectionObserver onCross opts
    IO.observe obs el
    pure (IO.unobserve obs el)
  where
  onCross entries _ = for_ entries \e -> setInView e.isIntersecting

-- On entry, blank the text then kick off the scramble; on exit, cancel it. The
-- cancel ref lets the in-flight Aff loop bail the next time it ticks.
runScrambleWhileInView :: Boolean -> String -> (String -> Effect Unit) -> Effect (Effect Unit)
runScrambleWhileInView inView upper setShown =
  if not inView then pure (pure unit)
  else do
    cancelled <- Ref.new false
    setShown (Monoid.power " " (CU.length upper))
    launchAff_ do
      delay (Milliseconds scrambleStartDelay)
      scramble upper setShown cancelled
    pure (Ref.write true cancelled)

-- Walks the clock in fixed ticks, repainting the whole label each frame until
-- every character has settled. Bails early once the cancel ref is set.
scramble :: String -> (String -> Effect Unit) -> Ref.Ref Boolean -> Aff Unit
scramble target setShown cancelled = loop 0
  where
  lastEnd = (CU.length target - 1) * scrambleStagger + scrambleDuration

  loop elapsed = do
    stop <- Ref.read cancelled # liftEffect
    if stop then pure unit
    else tick elapsed

  tick elapsed = do
    frame <- renderFrame target elapsed' # liftEffect
    setShown frame # liftEffect
    if elapsed' >= lastEnd then setShown target # liftEffect
    else do
      delay (Milliseconds (Int.toNumber scrambleTickMs))
      loop elapsed'
    where
    elapsed' = elapsed + scrambleTickMs

-- One frame of the scramble: literals pass through, not-yet-started characters
-- read as blanks, settled characters are final, the rest flicker at random.
renderFrame :: String -> Int -> Effect String
renderFrame target elapsed = map (joinWith "") (traverse charFor (Array.range 0 (CU.length target - 1)))
  where
  charFor i = decide i (fromMaybe ' ' (CU.charAt i target))

  decide :: Int -> Char -> Effect String
  decide i ch
    | isScrambleLiteral ch = pure (CU.singleton ch)
    | elapsed < i * scrambleStagger = pure " "
    | elapsed >= i * scrambleStagger + scrambleDuration = pure (CU.singleton ch)
    | otherwise = randomScrambleChar

randomScrambleChar :: Effect String
randomScrambleChar = do
  r <- random
  let idx = Int.floor (r * Int.toNumber (CU.length scrambleChars))
  pure (fromMaybe "" (CU.singleton <$> CU.charAt idx scrambleChars))

scrambleChars :: String
scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

isScrambleLiteral :: Char -> Boolean
isScrambleLiteral c = c == ' ' || c == '/' || c == '-'

scrambleTickMs :: Int
scrambleTickMs = 40

scrambleStagger :: Int
scrambleStagger = 90

scrambleDuration :: Int
scrambleDuration = 550

scrambleStartDelay :: Number
scrambleStartDelay = 770.0

-- Seconds the rule takes to draw. Doubles as the lead time: starting the draw
-- this far ahead of the scramble's stop makes the line and text land together.
ruleDrawDuration :: Number
ruleDrawDuration = 0.4

spreadFolio :: String -> String -> JSX
spreadFolio num label =
  div { className: "absolute bottom-0 left-0 z-20 px-8 py-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a6478] pointer-events-none" }
    (num <> " / " <> label)
