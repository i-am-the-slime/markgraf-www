// A capability probe, not logic: WebKit only shipped requestIdleCallback in
// Safari 17.4, and calling an absent one throws. PureScript reads this to pick
// the idle path or a setTimeout fallback.
export const hasRequestIdleCallback = (win) => () => typeof win.requestIdleCallback === "function"
