"use client"

import { useEffect, useRef, useState } from "react"

const EVENTS = {
  onClick: ["click", false],
  onContextMenu: ["contextmenu", false],
  onDoubleClick: ["dblclick", false],
  onWheel: ["wheel", true],
  onPointerDown: ["pointerdown", true],
  onPointerUp: ["pointerup", true],
  onPointerLeave: ["pointerleave", true],
  onPointerMove: ["pointermove", true],
  onPointerCancel: ["pointercancel", true],
  onLostPointerCapture: ["lostpointercapture", true],
}

const cameraProps = { position: [0, -3, 9], rotation: [0.28, 0, 0], fov: 85 }
const styleProps = { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden", display: "block", background: "transparent" }
const glProps = { alpha: true }

// Custom <canvas> that transfers control to a Web Worker, hand-rolled so we
// can guard against React StrictMode's double-effect: the package's own
// Canvas calls `transferControlToOffscreen()` inside `useEffect` without a
// ref guard, so the second StrictMode invocation throws and flips the
// component into its main-thread fallback. We track transfer state in a
// ref and short-circuit on re-runs.
export default function FeltballsOffscreen() {
  const [worker, setWorker] = useState(null)
  const canvasRef = useRef(null)
  const transferredRef = useRef(false)
  const props = { camera: cameraProps, gl: glProps }

  useEffect(() => {
    const w = new Worker(new URL("./feltballs.worker.js", import.meta.url), { type: "module" })
    setWorker(w)
    return () => w.terminate()
  }, [])

  useEffect(() => {
    if (!worker || !canvasRef.current || transferredRef.current) return
    const canvas = canvasRef.current
    let offscreen
    try {
      offscreen = canvas.transferControlToOffscreen()
    } catch (e) {
      console.error("[feltballs-offscreen] transferControlToOffscreen failed:", e.message)
      return
    }
    transferredRef.current = true
    worker.postMessage(
      {
        type: "init",
        payload: {
          props,
          drawingSurface: offscreen,
          width: canvas.clientWidth,
          height: canvas.clientHeight,
          top: canvas.offsetTop,
          left: canvas.offsetLeft,
          pixelRatio: window.devicePixelRatio,
        },
      },
      [offscreen],
    )

    Object.values(EVENTS).forEach(([eventName, passive]) => {
      canvas.addEventListener(
        eventName,
        (event) => {
          if (!passive) event.preventDefault()
          if (eventName === "pointerdown") event.target.setPointerCapture(event.pointerId)
          else if (eventName === "pointerup") event.target.releasePointerCapture(event.pointerId)
          worker.postMessage({
            type: "dom_events",
            payload: {
              eventName,
              deltaX: event.deltaX, deltaY: event.deltaY,
              pointerId: event.pointerId, pointerType: event.pointerType,
              button: event.button, buttons: event.buttons,
              altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey,
              movementX: event.movementX, movementY: event.movementY,
              clientX: event.clientX, clientY: event.clientY,
              offsetX: event.offsetX, offsetY: event.offsetY,
              pageX: event.pageX, pageY: event.pageY,
              x: event.x, y: event.y,
            },
          })
        },
        { passive },
      )
    })

    const handleResize = () => {
      worker.postMessage({
        type: "resize",
        payload: {
          width: canvas.clientWidth,
          height: canvas.clientHeight,
          top: canvas.offsetTop,
          left: canvas.offsetLeft,
        },
      })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [worker])

  return <canvas ref={canvasRef} style={styleProps} />
}
