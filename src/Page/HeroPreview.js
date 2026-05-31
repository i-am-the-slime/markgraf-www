// Forward a typed message to the diagramShapes worker. The offscreen setup
// installs window.__diagramShapesPost; if it hasn't yet, the call is a no-op and
// the next ratio fire will retry naturally.
export const postWorkerMessageImpl = (type) => (payload) => () => {
  if (typeof window === "undefined") return;
  const post = window.__diagramShapesPost;
  if (post) post(type, payload);
};
