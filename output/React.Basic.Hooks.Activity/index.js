import * as $runtime from "../runtime.js";
import * as React$dBasic from "../React.Basic/index.js";
import {activity_} from "./foreign.js";
const $ActivityMode = tag => tag;
const Visible = /* #__PURE__ */ $ActivityMode("Visible");
const Hidden = /* #__PURE__ */ $ActivityMode("Hidden");
const activity = props => React$dBasic.element(activity_)({
  mode: (() => {
    if (props.mode === "Visible") { return "visible"; }
    if (props.mode === "Hidden") { return "hidden"; }
    $runtime.fail();
  })(),
  children: props.children
});
export {$ActivityMode, Hidden, Visible, activity};
export * from "./foreign.js";
