module Layout.Root (default, metadata) where

import Prelude

import React.Basic (JSX)
import Unsafe.Coerce (unsafeCoerce)
import Yoga.React.DOM.HTML.Body (body)
import Yoga.React.DOM.HTML.Div (div)
import Yoga.React.DOM.HTML.HTML (html)
import Yoga.React.DOM.Internal (createBuiltinElement_, css)

default :: { children :: JSX } -> JSX
default { children } = html { lang: "en" } [ body {} [ noScriptFallback, appShell ] ]
  where
  appShell = div { id: "mg-app", style: css { display: "contents" } } [ children ]

-- The no-JS experience: markgraf's dark-grey + orange palette over a fixed perspective
-- field of low-poly boxes flying into a central vanishing point (pure CSS, real DOM
-- faces). The whole thing lives inside a single <noscript> so browsers with scripting on never parse a
-- byte of it; only when JS is disabled does the inner <style> kick in — hiding the real
-- (WebGL) app and taking over. It is prerendered into static HTML at build time
-- (dangerouslySetInnerHTML emits it verbatim), so no JavaScript runs to produce or show
-- it. Raw markup (not bindings) because <marquee>, <font>, <center>, bgcolor have no
-- typed element — and that is the point.
noScriptFallback :: JSX
noScriptFallback = createBuiltinElement_ "noscript" (unsafeCoerce { dangerouslySetInnerHTML: { __html: retro } })

retro :: String
retro =
  """
<style>
  @font-face { font-family: "Commit Mono"; src: url("/fonts/CommitMono-Regular.woff2") format("woff2"); font-display: swap; }
  #mg-app { display: none !important; }
  html, body { margin: 0; padding: 0; background: #0f0f0f; }
  body {
    color: #c8cdd9;
    font-family: "Commit Mono", ui-monospace, monospace;
    text-align: center;
    overflow-x: hidden;
  }
  ::selection { background: #ff3b1a; color: #0f0f0f; }
  ::-moz-selection { background: #ff3b1a; color: #0f0f0f; }

  /* "Our 3D shapes in space", approximated in pure CSS — a fixed perspective stage
     behind the content holding a field of low-poly boxes (real DOM faces), a nod to
     the WebGL scene the no-JS visitor is missing. */
  .nsf-space { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
    perspective: 900px; perspective-origin: 50% 50%; }

  /* CRT scanlines over everything, and the real content layer above the rain. */
  .nsf-scan { position: fixed; inset: 0; z-index: 2; pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 3px); }
  .nsf-content { position: relative; z-index: 1; padding: 8px 0 28px; }

  .nsf-amber {
    background: linear-gradient(90deg, #ff3b1a, #ff8a5c, #ffb38a, #ff8a5c, #ff3b1a);
    -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: bold;
  }
  .nsf-rule { height: 1px; border: 0; margin: 16px auto; width: 86%;
    background: linear-gradient(90deg, transparent, #ff3b1a 30%, #ff8a5c 50%, #ff3b1a 70%, transparent); }
  .nsf-card { margin: 16px auto; padding: 14px 18px; max-width: min(1240px, 94vw); }
  a { color: #ff8a5c; text-decoration: none; }
  a:hover { color: #f5f1e8; }
  a:visited { color: #ff3b1a; }
  .nsf-title { font-family: "Sinistre", "Sinistre Fallback", serif; font-size: 52px;
    font-weight: bold; letter-spacing: -1px; }

  /* Code + command blocks: no chrome, no background — straight on the page. */
  .nsf-term-body { margin: 12px auto; padding: 6px 0; max-width: 680px;
    color: #f5f1e8; font-size: 15px; white-space: pre-wrap;
    font-family: "Commit Mono", ui-monospace, monospace; }
  .nsf-inline { color: #ff8a5c; }
  .nsf-demo { max-width: min(1500px, 94vw); }
  .nsf-sbs { margin: 14px auto; border-collapse: collapse; }
  .nsf-sbs td { vertical-align: middle; padding: 0 14px; }
  .nsf-src { display: inline-block; margin: 0; padding: 20px 24px; font: 14px/1.7 "Commit Mono", ui-monospace, monospace;
    color: #c8cdd9; white-space: pre; }
  .nsf-src .k { color: #ff8a5c; }
  .nsf-src .d { color: #ff3b1a; }
  .nsf-src .a { color: #ff3b1a; }
  .nsf-src .s { color: #f5f1e8; }
  .nsf-src .l { color: #5a6478; font-style: italic; }
  .nsf-src .c { color: #4a5468; font-style: italic; }

  /* Each box starts off-screen (per-box --sx/--sy) and flies toward the centre while
     receding deep in Z — so it shrinks to nothing at a single vanishing point, fades
     out, and loops back to its edge. ~70 of them give a continuous inward stream. */
  .nsf-fly { position: absolute; top: 50%; left: 50%; width: 90px; height: 90px; margin: -45px 0 0 -45px;
    transform-style: preserve-3d; opacity: 0;
    animation-name: nsf-vanish; animation-timing-function: ease-in; animation-iteration-count: infinite; }
  @keyframes nsf-vanish {
    0%   { transform: translate3d(var(--sx), var(--sy), 240px); opacity: 0; }
    12%  { opacity: 0.7; }
    78%  { opacity: 0.5; }
    100% { transform: translate3d(0px, 0px, -1500px); opacity: 0; }
  }
  /* Low-poly shapes: extruded rectangular boxes built from real DOM faces, flat-shaded
     with translucent grey, back faces hidden so they read solid. Each flyer sets its own
     width/height/thickness (--w/--h/--d) inline, so the swarm is boxes of varied profile. */
  .nsf-shape { position: relative; width: 90px; height: 90px; transform-style: preserve-3d; }
  .nsf-shape > i { position: absolute; left: 50%; top: 50%; box-sizing: border-box;
    border: 1px solid rgba(150,160,180,0.30); background: rgba(42,49,66,0.42);
    -webkit-backface-visibility: hidden; backface-visibility: hidden; }

  /* Extruded rectangle: one parameterised box. Each flyer sets its own --w / --h / --d
     (width / height / thickness) inline, so the swarm is rects of varying thickness. */
  .s-box > i:nth-child(1) { width: var(--w); height: var(--h); transform: translate(-50%,-50%) translateZ(calc(var(--d) / 2)); }
  .s-box > i:nth-child(2) { width: var(--w); height: var(--h); transform: translate(-50%,-50%) rotateY(180deg) translateZ(calc(var(--d) / 2)); }
  .s-box > i:nth-child(3) { width: var(--d); height: var(--h); transform: translate(-50%,-50%) rotateY(90deg)  translateZ(calc(var(--w) / 2)); }
  .s-box > i:nth-child(4) { width: var(--d); height: var(--h); transform: translate(-50%,-50%) rotateY(-90deg) translateZ(calc(var(--w) / 2)); }
  .s-box > i:nth-child(5) { width: var(--w); height: var(--d); transform: translate(-50%,-50%) rotateX(90deg)  translateZ(calc(var(--h) / 2)); }
  .s-box > i:nth-child(6) { width: var(--w); height: var(--d); transform: translate(-50%,-50%) rotateX(-90deg) translateZ(calc(var(--h) / 2)); }
  .nsf-spinA { animation: nsf-tumbleA 11s linear infinite; }
  .nsf-spinB { animation: nsf-tumbleB 8s linear infinite; }
  .nsf-spinC { animation: nsf-tumbleC 15s linear infinite; }
  @keyframes nsf-tumbleA { from { transform: rotateX(-18deg) rotateY(0deg); }   to { transform: rotateX(-18deg) rotateY(360deg); } }
  @keyframes nsf-tumbleB { from { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); } to { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); } }
  @keyframes nsf-tumbleC { from { transform: rotateY(0deg) rotateZ(12deg); } to { transform: rotateY(-360deg) rotateZ(12deg); } }
</style>

<div class="nsf-space">
  <div class="nsf-fly" style="--sx:-62vw;--sy:-30vh;animation-duration:8.5s;animation-delay:0s"><div class="nsf-shape s-box nsf-spinA" style="--w:100px;--h:60px;--d:16px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:60vw;--sy:-26vh;animation-duration:9.2s;animation-delay:-0.5s"><div class="nsf-shape s-box nsf-spinB" style="--w:84px;--h:72px;--d:30px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-55vw;--sy:34vh;animation-duration:7.8s;animation-delay:-1.0s"><div class="nsf-shape s-box nsf-spinC" style="--w:114px;--h:46px;--d:10px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:58vw;--sy:40vh;animation-duration:10.0s;animation-delay:-1.4s"><div class="nsf-shape s-box nsf-spinA" style="--w:72px;--h:72px;--d:50px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:4vw;--sy:-58vh;animation-duration:8.0s;animation-delay:-1.9s"><div class="nsf-shape s-box nsf-spinB" style="--w:96px;--h:62px;--d:22px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-8vw;--sy:56vh;animation-duration:9.5s;animation-delay:-2.3s"><div class="nsf-shape s-box nsf-spinC" style="--w:120px;--h:40px;--d:14px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-70vw;--sy:6vh;animation-duration:7.6s;animation-delay:-2.8s"><div class="nsf-shape s-box nsf-spinA" style="--w:78px;--h:78px;--d:38px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:68vw;--sy:-8vh;animation-duration:8.8s;animation-delay:-3.2s"><div class="nsf-shape s-box nsf-spinB" style="--w:104px;--h:54px;--d:18px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:40vw;--sy:-46vh;animation-duration:9.0s;animation-delay:-3.7s"><div class="nsf-shape s-box nsf-spinC" style="--w:100px;--h:60px;--d:16px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-44vw;--sy:-42vh;animation-duration:7.9s;animation-delay:-4.1s"><div class="nsf-shape s-box nsf-spinA" style="--w:84px;--h:72px;--d:30px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:52vw;--sy:28vh;animation-duration:10.2s;animation-delay:-4.6s"><div class="nsf-shape s-box nsf-spinB" style="--w:114px;--h:46px;--d:10px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-50vw;--sy:18vh;animation-duration:8.3s;animation-delay:-5.0s"><div class="nsf-shape s-box nsf-spinC" style="--w:72px;--h:72px;--d:50px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:18vw;--sy:54vh;animation-duration:9.1s;animation-delay:-5.5s"><div class="nsf-shape s-box nsf-spinA" style="--w:96px;--h:62px;--d:22px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-22vw;--sy:-54vh;animation-duration:7.7s;animation-delay:-5.9s"><div class="nsf-shape s-box nsf-spinB" style="--w:120px;--h:40px;--d:14px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:64vw;--sy:14vh;animation-duration:8.6s;animation-delay:-6.4s"><div class="nsf-shape s-box nsf-spinC" style="--w:78px;--h:78px;--d:38px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-64vw;--sy:-12vh;animation-duration:9.8s;animation-delay:-6.8s"><div class="nsf-shape s-box nsf-spinA" style="--w:104px;--h:54px;--d:18px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:30vw;--sy:46vh;animation-duration:8.1s;animation-delay:-7.3s"><div class="nsf-shape s-box nsf-spinB" style="--w:100px;--h:60px;--d:16px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-34vw;--sy:48vh;animation-duration:9.3s;animation-delay:-7.7s"><div class="nsf-shape s-box nsf-spinC" style="--w:84px;--h:72px;--d:30px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:46vw;--sy:-34vh;animation-duration:7.8s;animation-delay:-8.2s"><div class="nsf-shape s-box nsf-spinA" style="--w:114px;--h:46px;--d:10px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-16vw;--sy:-60vh;animation-duration:8.9s;animation-delay:-8.6s"><div class="nsf-shape s-box nsf-spinB" style="--w:72px;--h:72px;--d:50px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:60vw;--sy:0vh;animation-duration:7.0s;animation-delay:0s"><div class="nsf-shape s-box nsf-spinA" style="--w:100px;--h:60px;--d:16px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-49vw;--sy:41vh;animation-duration:7.5s;animation-delay:-0.4s"><div class="nsf-shape s-box nsf-spinB" style="--w:84px;--h:72px;--d:30px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:6vw;--sy:-68vh;animation-duration:8.0s;animation-delay:-0.8s"><div class="nsf-shape s-box nsf-spinC" style="--w:114px;--h:46px;--d:10px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:49vw;--sy:60vh;animation-duration:8.5s;animation-delay:-1.2s"><div class="nsf-shape s-box nsf-spinA" style="--w:72px;--h:72px;--d:50px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-87vw;--sy:-9vh;animation-duration:9.0s;animation-delay:-1.6s"><div class="nsf-shape s-box nsf-spinB" style="--w:96px;--h:62px;--d:22px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:51vw;--sy:-32vh;animation-duration:9.5s;animation-delay:-2s"><div class="nsf-shape s-box nsf-spinC" style="--w:120px;--h:40px;--d:14px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-17vw;--sy:66vh;animation-duration:10.0s;animation-delay:-2.4s"><div class="nsf-shape s-box nsf-spinA" style="--w:78px;--h:78px;--d:38px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-34vw;--sy:-67vh;animation-duration:10.5s;animation-delay:-2.8s"><div class="nsf-shape s-box nsf-spinB" style="--w:104px;--h:54px;--d:18px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:76vw;--sy:18vh;animation-duration:11.0s;animation-delay:-3.2s"><div class="nsf-shape s-box nsf-spinC" style="--w:100px;--h:60px;--d:16px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-81vw;--sy:23vh;animation-duration:7.0s;animation-delay:-3.6s"><div class="nsf-shape s-box nsf-spinA" style="--w:84px;--h:72px;--d:30px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:25vw;--sy:-62vh;animation-duration:7.5s;animation-delay:-4s"><div class="nsf-shape s-box nsf-spinB" style="--w:114px;--h:46px;--d:10px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:20vw;--sy:73vh;animation-duration:8.0s;animation-delay:-4.4s"><div class="nsf-shape s-box nsf-spinC" style="--w:72px;--h:72px;--d:50px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-64vw;--sy:-26vh;animation-duration:8.5s;animation-delay:-4.8s"><div class="nsf-shape s-box nsf-spinA" style="--w:96px;--h:62px;--d:22px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:79vw;--sy:-13vh;animation-duration:9.0s;animation-delay:-5.2s"><div class="nsf-shape s-box nsf-spinB" style="--w:120px;--h:40px;--d:14px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-51vw;--sy:56vh;animation-duration:9.5s;animation-delay:-5.6s"><div class="nsf-shape s-box nsf-spinC" style="--w:78px;--h:78px;--d:38px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-8vw;--sy:-75vh;animation-duration:10.0s;animation-delay:-6s"><div class="nsf-shape s-box nsf-spinA" style="--w:104px;--h:54px;--d:18px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:51vw;--sy:34vh;animation-duration:10.5s;animation-delay:-6.4s"><div class="nsf-shape s-box nsf-spinB" style="--w:100px;--h:60px;--d:16px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-74vw;--sy:2vh;animation-duration:11.0s;animation-delay:-6.8s"><div class="nsf-shape s-box nsf-spinC" style="--w:84px;--h:72px;--d:30px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:57vw;--sy:-48vh;animation-duration:7.0s;animation-delay:-7.2s"><div class="nsf-shape s-box nsf-spinA" style="--w:114px;--h:46px;--d:10px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-4vw;--sy:76vh;animation-duration:7.5s;animation-delay:-7.6s"><div class="nsf-shape s-box nsf-spinB" style="--w:72px;--h:72px;--d:50px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-38vw;--sy:-40vh;animation-duration:8.0s;animation-delay:-8s"><div class="nsf-shape s-box nsf-spinC" style="--w:96px;--h:62px;--d:22px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:66vw;--sy:8vh;animation-duration:8.5s;animation-delay:-8.4s"><div class="nsf-shape s-box nsf-spinA" style="--w:120px;--h:40px;--d:14px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-61vw;--sy:39vh;animation-duration:9.0s;animation-delay:-8.8s"><div class="nsf-shape s-box nsf-spinB" style="--w:78px;--h:78px;--d:38px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:18vw;--sy:-74vh;animation-duration:9.5s;animation-delay:-9.2s"><div class="nsf-shape s-box nsf-spinC" style="--w:104px;--h:54px;--d:18px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:44vw;--sy:45vh;animation-duration:10.0s;animation-delay:-9.6s"><div class="nsf-shape s-box nsf-spinA" style="--w:100px;--h:60px;--d:16px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-57vw;--sy:-18vh;animation-duration:10.5s;animation-delay:-10s"><div class="nsf-shape s-box nsf-spinB" style="--w:84px;--h:72px;--d:30px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:61vw;--sy:-29vh;animation-duration:11.0s;animation-delay:-10.4s"><div class="nsf-shape s-box nsf-spinC" style="--w:114px;--h:46px;--d:10px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-29vw;--sy:70vh;animation-duration:7.0s;animation-delay:-10.8s"><div class="nsf-shape s-box nsf-spinA" style="--w:72px;--h:72px;--d:50px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-27vw;--sy:-49vh;animation-duration:7.5s;animation-delay:-0.2s"><div class="nsf-shape s-box nsf-spinB" style="--w:96px;--h:62px;--d:22px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:78vw;--sy:28vh;animation-duration:8.0s;animation-delay:-0.6s"><div class="nsf-shape s-box nsf-spinC" style="--w:120px;--h:40px;--d:14px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-58vw;--sy:17vh;animation-duration:8.5s;animation-delay:-1s"><div class="nsf-shape s-box nsf-spinA" style="--w:78px;--h:78px;--d:38px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:36vw;--sy:-64vh;animation-duration:9.0s;animation-delay:-1.4s"><div class="nsf-shape s-box nsf-spinB" style="--w:104px;--h:54px;--d:18px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:13vw;--sy:51vh;animation-duration:9.5s;animation-delay:-1.8s"><div class="nsf-shape s-box nsf-spinC" style="--w:100px;--h:60px;--d:16px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-64vw;--sy:-37vh;animation-duration:10.0s;animation-delay:-2.2s"><div class="nsf-shape s-box nsf-spinA" style="--w:84px;--h:72px;--d:30px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:88vw;--sy:-6vh;animation-duration:10.5s;animation-delay:-2.6s"><div class="nsf-shape s-box nsf-spinB" style="--w:114px;--h:46px;--d:10px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-41vw;--sy:56vh;animation-duration:11.0s;animation-delay:-3s"><div class="nsf-shape s-box nsf-spinC" style="--w:72px;--h:72px;--d:50px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:0vw;--sy:-52vh;animation-duration:7.0s;animation-delay:-3.4s"><div class="nsf-shape s-box nsf-spinA" style="--w:96px;--h:62px;--d:22px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:50vw;--sy:44vh;animation-duration:7.5s;animation-delay:-3.8s"><div class="nsf-shape s-box nsf-spinB" style="--w:120px;--h:40px;--d:14px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-81vw;--sy:-6vh;animation-duration:8.0s;animation-delay:-4.2s"><div class="nsf-shape s-box nsf-spinC" style="--w:78px;--h:78px;--d:38px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:70vw;--sy:-46vh;animation-duration:8.5s;animation-delay:-4.6s"><div class="nsf-shape s-box nsf-spinA" style="--w:104px;--h:54px;--d:18px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-11vw;--sy:51vh;animation-duration:9.0s;animation-delay:-5s"><div class="nsf-shape s-box nsf-spinB" style="--w:100px;--h:60px;--d:16px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-36vw;--sy:-51vh;animation-duration:9.5s;animation-delay:-5.4s"><div class="nsf-shape s-box nsf-spinC" style="--w:84px;--h:72px;--d:30px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:71vw;--sy:18vh;animation-duration:10.0s;animation-delay:-5.8s"><div class="nsf-shape s-box nsf-spinA" style="--w:114px;--h:46px;--d:10px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-72vw;--sy:35vh;animation-duration:10.5s;animation-delay:-6.2s"><div class="nsf-shape s-box nsf-spinB" style="--w:72px;--h:72px;--d:50px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:31vw;--sy:-49vh;animation-duration:11.0s;animation-delay:-6.6s"><div class="nsf-shape s-box nsf-spinC" style="--w:96px;--h:62px;--d:22px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:23vw;--sy:56vh;animation-duration:7.0s;animation-delay:-7s"><div class="nsf-shape s-box nsf-spinA" style="--w:120px;--h:40px;--d:14px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-61vw;--sy:-29vh;animation-duration:7.5s;animation-delay:-7.4s"><div class="nsf-shape s-box nsf-spinB" style="--w:78px;--h:78px;--d:38px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:71vw;--sy:-22vh;animation-duration:8.0s;animation-delay:-7.8s"><div class="nsf-shape s-box nsf-spinC" style="--w:104px;--h:54px;--d:18px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-41vw;--sy:45vh;animation-duration:8.5s;animation-delay:-8.2s"><div class="nsf-shape s-box nsf-spinA" style="--w:100px;--h:60px;--d:16px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-18vw;--sy:-59vh;animation-duration:9.0s;animation-delay:-8.6s"><div class="nsf-shape s-box nsf-spinB" style="--w:84px;--h:72px;--d:30px"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
</div>
<div class="nsf-scan"></div>

<div class="nsf-content">
<center>

<table border="0" cellpadding="14" cellspacing="0" align="center">
  <tr><td align="center">
    <span class="nsf-amber nsf-title">markgraf</span>
  </td></tr>
</table>

<div class="nsf-card nsf-demo">
  <font color="#ff8a5c" face="Commit Mono" size="2"><b>Demo</b> &mdash; valid Markgraf source beside a rendered animation.</font>
  <table class="nsf-sbs"><tr>
    <td>
<pre class="nsf-src"><span class="d">+</span> client <span class="s">"Client"</span>
<span class="d">+</span> api <span class="s">"API"</span>
<span class="d">+</span> db <span class="s">"Database"</span>
<span class="d">+</span> client <span class="a">-&gt;</span> api
<span class="d">+</span> api <span class="a">-&gt;</span> db

client <span class="a">~&gt;</span> api <span class="l">"GET /user/42"</span>
api <span class="a">~&gt;</span> db <span class="l">"SELECT"</span>
api <span class="a">&lt;~</span> db <span class="l">"one row"</span>
client <span class="a">&lt;~</span> api <span class="l">"200 OK"</span></pre>
    </td>
    <td>
      <video width="440" autoplay loop muted playsinline preload="auto" disablepictureinpicture disableremoteplayback
             style="display:inline-block; pointer-events:none">
        <source src="/markgraf-demo.mp4" type="video/mp4">
        <img src="/markgraf-demo.webp" alt="markgraf animated graph diagram" width="440">
      </video>
    </td>
  </tr></table>
  <font color="#8a94a8" face="Commit Mono" size="2">markgraf renders the source on the left into the animation on the right.</font>
</div>

<div class="nsf-card">
  <font color="#ff8a5c" face="Commit Mono" size="4"><b>Install</b></font>
  <pre class="nsf-term-body">brew install --cask markgrafhq/tap/markgraf</pre>
  <font color="#8a94a8" face="Commit Mono" size="2">
    &hellip; or, inside Claude Code: <span class="nsf-inline">/plugin install markgraf@i-am-the-slime</span>
  </font>
  <hr class="nsf-rule">
  <font face="Commit Mono" color="#ff8a5c" size="2">
    [ <a href="https://github.com/markgrafhq/homebrew-tap">homebrew tap</a> ]
    &nbsp;&middot;&nbsp;
    [ <a href="https://github.com/markgrafhq/homebrew-tap/tree/main/examples">examples</a> ]
    &nbsp;&middot;&nbsp;
    [ <a href="https://github.com/i-am-the-slime/claude-plugins">claude plugin</a> ]
    &nbsp;&middot;&nbsp;
    [ <a href="https://discord.gg/tKfGrPYx">discord</a> ]
  </font>
</div>

</center>
</div>
"""

metadata
  :: { title :: String
     , description :: String
     }
metadata =
  { title: "markgraf — animated graph diagrams"
  , description: "Render short animated graph diagrams from a tiny declarative source language."
  }
