module Component.HeroPreview.Dom
  ( onTargetValue
  , findElementById
  , onElementResize
  , installScrollSync
  , installVhsBurst
  , onWordmarkLit
  , passiveOpts
  , scrollSectionIntoView
  , onMagazineScroll
  , heroScaleNarrow
  ) where

import Prelude

import Data.Foldable (for_, traverse_)
import Data.Int as Int
import Data.Maybe (Maybe(..))
import Effect (Effect)
import Effect.Random (random)
import Effect.Ref as Ref
import Effect.Timer (clearTimeout, setTimeout)
import Effect.Uncurried (mkEffectFn1)
import React.Basic.Events (EventHandler)
import Unsafe.Coerce (unsafeCoerce)
import Web.DOM.ClassName (ClassName(..))
import Web.DOM.DOMTokenList as DOMTokenList
import Web.DOM.Document as Document
import Web.DOM.Element as Element
import Web.DOM.ElementId (ElementId(..))
import Web.DOM.HTMLCollection as HTMLCollection
import Web.DOM.NonElementParentNode (getElementById)
import Web.Event.Event (EventType(..))
import Web.Event.EventTarget (addEventListenerWithOptions, eventListener, removeEventListener)
import Web.HTML (window)
import Web.HTML.HTMLDocument (toNonElementParentNode)
import Web.HTML.HTMLDocument as HTMLDocument
import Web.HTML.Window (document)
import Web.HTML.Window as Window
import Web.ResizeObserver as RO

onTargetValue :: (String -> Effect Unit) -> EventHandler
onTargetValue cb = mkEffectFn1 \e -> cb (unsafeCoerce e).target.value

onElementResize
  :: String -> ({ w :: Number, h :: Number } -> Effect Unit) -> Effect (Effect Unit)
onElementResize elemId cb = findElementById elemId >>= case _ of
  Nothing -> pure mempty
  Just el -> do
    ro <- RO.resizeObserver \entries _ -> for_ entries \e ->
      cb { w: e.contentRect.width, h: e.contentRect.height }
    RO.observe el {} ro
    pure (RO.disconnect ro)

findElementById :: String -> Effect (Maybe Element.Element)
findElementById elemId = do
  doc <- window >>= document
  getElementById (ElementId elemId) (toNonElementParentNode doc)

installScrollSync :: String -> String -> Effect (Effect Unit)
installScrollSync taId preId = do
  taM <- findElementById taId
  preM <- findElementById preId
  case taM, preM of
    Just ta, Just pre -> do
      let
        sync = do
          Element.scrollTop ta >>= flip Element.setScrollTop pre
          Element.scrollLeft ta >>= flip Element.setScrollLeft pre
      listener <- eventListener \_ -> sync
      let target = Element.toEventTarget ta
      addEventListenerWithOptions (EventType "scroll") listener passiveOpts target
      sync
      pure $ removeEventListener (EventType "scroll") listener false target
    _, _ -> pure mempty

installVhsBurst :: String -> Effect (Effect Unit)
installVhsBurst className = do
  scheduleRef <- Ref.new Nothing
  burstRef <- Ref.new Nothing
  let
    targets = do
      d <- window >>= document
      hc <- Document.getElementsByClassName (ClassName className) (HTMLDocument.toDocument d)
      HTMLCollection.toArray hc
    setVhs on = do
      els <- targets
      for_ els \el -> do
        cl <- Element.classList el
        if on then DOMTokenList.add cl "vhs-on"
        else DOMTokenList.remove cl "vhs-on"
    burst = do
      setVhs true
      tid <- setTimeout 1600 do
        setVhs false
        scheduleNext
      Ref.write (Just tid) burstRef
    scheduleNext = do
      r <- random
      tid <- setTimeout (Int.round ((40.0 + r * 30.0) * 1000.0)) burst
      Ref.write (Just tid) scheduleRef
  scheduleNext
  pure do
    Ref.read burstRef >>= traverse_ clearTimeout
    Ref.read scheduleRef >>= traverse_ clearTimeout
    setVhs false

-- Fire `done` the moment the title's neon-in animation finishes — the beat the
-- wordmark holds steady, "the light is on". Listening for animationend on the
-- .hero-wordmark-in element keeps this locked to the CSS timing, and the name
-- guard accepts the reduced-motion fade variant too. Returns a teardown.
onWordmarkLit :: Effect Unit -> Effect (Effect Unit)
onWordmarkLit done = do
  els <- targets
  listener <- eventListener \ev ->
    when (lit (unsafeCoerce ev).animationName) done
  for_ els \el -> addEventListenerWithOptions animationEnd listener passiveOpts (Element.toEventTarget el)
  pure $ for_ els \el -> removeEventListener animationEnd listener false (Element.toEventTarget el)
  where
  animationEnd = EventType "animationend"
  lit name = name == "hero-wordmark-in" || name == "hero-wordmark-fade"
  targets = do
    d <- window >>= document
    hc <- Document.getElementsByClassName (ClassName "hero-wordmark-in") (HTMLDocument.toDocument d)
    HTMLCollection.toArray hc

passiveOpts :: { capture :: Boolean, once :: Boolean, passive :: Boolean }
passiveOpts = { capture: false, once: false, passive: true }

-- Scroll the section with the given id into view. The magazine is snap-
-- mandatory, so the browser handles the actual easing; we just point at the
-- target element.
scrollSectionIntoView :: String -> Effect Unit
scrollSectionIntoView id = do
  doc <- window >>= document
  getElementById (ElementId id) (toNonElementParentNode doc) >>= case _ of
    Nothing -> pure unit
    Just el -> Element.scrollIntoViewWithOptions { behavior: Element.Smooth, block: Element.Start, inline: Element.Nearest } el

onMagazineScroll
  :: ({ x :: Number, y :: Number, progress :: Number, scale :: Number } -> Effect Unit)
  -> Effect (Effect Unit)
onMagazineScroll cb = findElementById "magazine" >>= case _ of
  Nothing -> pure mempty
  Just el -> do
    lastXRef <- Ref.new 0.0
    win <- window
    let
      fire = do
        vh <- Int.toNumber <$> Window.innerHeight win
        vw <- Int.toNumber <$> Window.innerWidth win
        st <- Element.scrollTop el
        let p = clamp01 (st / max 1.0 vh)
        previewM <- findElementById "markgraf-preview"
        lastX <- Ref.read lastXRef
        naturalCenter <- case previewM of
          Just preview -> do
            r <- Element.getBoundingClientRect preview
            pure ((r.left - lastX) + r.width / 2.0)
          Nothing -> pure (vw / 2.0)
        let
          offsetToCenter = vw / 2.0 - naturalCenter
          x = offsetToCenter * (1.0 - p)
          y = (-0.95 + 0.95 * p) * vh
          scale = heroScale + (1.0 - heroScale) * p
          heroScale = if vw < 640.0 then heroScaleNarrow else 1.0
        Ref.write x lastXRef
        cb { x, y, progress: p, scale }
    listener <- eventListener \_ -> fire
    let
      elTarget = Element.toEventTarget el
      winTarget = Window.toEventTarget win
    addEventListenerWithOptions (EventType "scroll") listener passiveOpts elTarget
    addEventListenerWithOptions (EventType "resize") listener passiveOpts winTarget
    fire
    pure do
      removeEventListener (EventType "scroll") listener false elTarget
      removeEventListener (EventType "resize") listener false winTarget
  where
  clamp01 v = max 0.0 (min 1.0 v)

-- How far the floating player shrinks while parked over the hero on a narrow
-- (phone) viewport, easing back to full size as it scrolls into the playground.
-- Shrinking about the element's centre lifts its bottom edge and pulls its left
-- in, clearing the install CTA at the hero's bottom-left. Full size everywhere
-- on wider viewports, where there is no overlap.
heroScaleNarrow :: Number
heroScaleNarrow = 0.62
