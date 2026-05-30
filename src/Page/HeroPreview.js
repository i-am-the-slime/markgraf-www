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
