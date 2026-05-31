import * as $runtime from "../runtime.js";
import * as Data$dMaybe from "../Data.Maybe/index.js";
import * as Data$dNullable from "../Data.Nullable/index.js";
import * as React$dBasic from "../React.Basic/index.js";
import {mkAnimationMap, mkClassName, toCallback_, viewTransition_} from "./foreign.js";
const $AnimationValue = (tag, _1) => ({tag, _1});
const ClassName = value0 => $AnimationValue("ClassName", value0);
const AnimationMap = value0 => $AnimationValue("AnimationMap", value0);
const viewTransitionDefaults = {
  children: [],
  enter: Data$dMaybe.Nothing,
  exit: Data$dMaybe.Nothing,
  update: Data$dMaybe.Nothing,
  share: Data$dMaybe.Nothing,
  layout: Data$dMaybe.Nothing,
  fallback: Data$dMaybe.Nothing,
  name: Data$dMaybe.Nothing,
  onEnter: Data$dMaybe.Nothing,
  onExit: Data$dMaybe.Nothing,
  onUpdate: Data$dMaybe.Nothing,
  onShare: Data$dMaybe.Nothing
};
const toAnimationValue_ = v => {
  if (v.tag === "ClassName") { return mkClassName(v._1); }
  if (v.tag === "AnimationMap") { return mkAnimationMap(v._1); }
  $runtime.fail();
};
const viewTransition = props => React$dBasic.element(viewTransition_)({
  children: props.children,
  enter: props.enter.tag === "Just" ? Data$dNullable.notNull(toAnimationValue_(props.enter._1)) : Data$dNullable.null,
  exit: props.exit.tag === "Just" ? Data$dNullable.notNull(toAnimationValue_(props.exit._1)) : Data$dNullable.null,
  update: props.update.tag === "Just" ? Data$dNullable.notNull(toAnimationValue_(props.update._1)) : Data$dNullable.null,
  share: props.share.tag === "Just" ? Data$dNullable.notNull(toAnimationValue_(props.share._1)) : Data$dNullable.null,
  layout: props.layout.tag === "Just" ? Data$dNullable.notNull(toAnimationValue_(props.layout._1)) : Data$dNullable.null,
  default: props.fallback.tag === "Just" ? Data$dNullable.notNull(toAnimationValue_(props.fallback._1)) : Data$dNullable.null,
  name: (() => {
    if (props.name.tag === "Nothing") { return Data$dNullable.null; }
    if (props.name.tag === "Just") { return Data$dNullable.notNull(props.name._1); }
    $runtime.fail();
  })(),
  onEnter: props.onEnter.tag === "Just" ? Data$dNullable.notNull(toCallback_(props.onEnter._1)) : Data$dNullable.null,
  onExit: props.onExit.tag === "Just" ? Data$dNullable.notNull(toCallback_(props.onExit._1)) : Data$dNullable.null,
  onUpdate: props.onUpdate.tag === "Just" ? Data$dNullable.notNull(toCallback_(props.onUpdate._1)) : Data$dNullable.null,
  onShare: props.onShare.tag === "Just" ? Data$dNullable.notNull(toCallback_(props.onShare._1)) : Data$dNullable.null
});
export {$AnimationValue, AnimationMap, ClassName, toAnimationValue_, viewTransition, viewTransitionDefaults};
export * from "./foreign.js";
