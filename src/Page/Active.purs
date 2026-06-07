module Page.Active (onActiveChange) where

import Prelude

import Effect (Effect)
import Effect.Ref as Ref
import Web.Event.Event (EventType(..))
import Web.Event.EventTarget (addEventListener, eventListener, removeEventListener)
import Web.HTML (window)
import Web.HTML.HTMLDocument as HTMLDocument
import Web.HTML.HTMLDocument.VisibilityState (VisibilityState(..))
import Web.HTML.Window as Window

-- Fires `true` while the page is being actively watched and `false` otherwise,
-- so animation loops can idle when no one is looking. Two signals gate it: the
-- tab being foregrounded (`visibilitychange`) and the window holding focus
-- (`blur`/`focus`). Visibility alone misses switching to another program, which
-- leaves the foreground tab `visible` — so we AND both, emitting active only
-- when the tab is visible AND the window is focused. Seeded focused (the normal
-- load state); returns a teardown that removes every listener.
onActiveChange :: (Boolean -> Effect Unit) -> Effect (Effect Unit)
onActiveChange onChange = do
  doc <- window >>= Window.document
  winTarget <- map Window.toEventTarget window
  focusedRef <- Ref.new true
  let
    docTarget = HTMLDocument.toEventTarget doc

    -- Emit active only when both signals agree the page is being watched.
    emit = do
      focused <- Ref.read focusedRef
      visible <- HTMLDocument.visibilityState doc <#> (_ == Visible)
      onChange (focused && visible)

    setFocus focused = Ref.write focused focusedRef *> emit

  stopVisibility <- listen docTarget "visibilitychange" emit
  stopBlur <- listen winTarget "blur" (setFocus false)
  stopFocus <- listen winTarget "focus" (setFocus true)
  pure (stopVisibility *> stopBlur *> stopFocus)
  where
  listen target name action = do
    listener <- eventListener \_ -> action
    addEventListener (EventType name) listener false target
    pure (removeEventListener (EventType name) listener false target)
