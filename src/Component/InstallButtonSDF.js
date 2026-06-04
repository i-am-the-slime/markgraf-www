// Reads the pointer position and the button's box off a pointermove event, so
// PureScript can turn them into normalised device coordinates. No logic here.
export const pointerMoveHandlerImpl = (callback) => (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  callback({ cx: event.clientX, cy: event.clientY, left: rect.left, top: rect.top, width: rect.width, height: rect.height })()
}
