// @client
import * as Component$dHeroPreview from "../Component.HeroPreview/index.js";
import * as Next from "../Next/index.js";
import * as React$dBasic from "../React.Basic/index.js";
import * as Yoga$dOm from "../Yoga.Om/index.js";
const page = /* #__PURE__ */ (() => {
  const heroComponent = Component$dHeroPreview.mkHeroPreview();
  return Next.nextPage()()()()(Next.queryPresentNil)(Next.parsePathFieldsNilRow)()({reflectSymbol: () => "Root"})({})(Yoga$dOm.applicativeOm.pure(v => {
    const $0 = React$dBasic.element(heroComponent)({});
    return () => $0;
  }));
})();
export {page};
