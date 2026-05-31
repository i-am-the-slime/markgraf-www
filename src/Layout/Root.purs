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

-- The no-JS experience: a 1996 "under construction" page reskinned in markgraf's own
-- dark-grey + orange palette, with a CSS-only Matrix code-rain backdrop. The whole
-- thing lives inside a single <noscript> so browsers with scripting on never parse a
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
  @font-face { font-family: "Commit Mono"; src: url("/markgraf-www/fonts/CommitMono-Regular.woff2") format("woff2"); font-display: swap; }
  #mg-app { display: none !important; }
  html, body { margin: 0; padding: 0; background: #0f0f0f; }
  body {
    color: #c8cdd9;
    font-family: "Commit Mono", ui-monospace, monospace;
    text-align: center;
    overflow-x: hidden;
  }

  /* "Our 3D shapes in space", approximated in pure CSS — a fixed perspective stage
     behind the content. Wireframe cubes (real DOM face nodes) fly in from the screen
     edges and assemble into a slowly tumbling cluster in the middle, like the WebGL
     scene the no-JS visitor is missing. */
  .nsf-space { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
    perspective: 900px; perspective-origin: 50% 50%; }

  /* CRT scanlines over everything, and the real content layer above the rain. */
  .nsf-scan { position: fixed; inset: 0; z-index: 2; pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,0.20) 0 1px, transparent 1px 3px); }
  .nsf-content { position: relative; z-index: 1; padding: 8px 0 28px; }

  .nsf-amber {
    background: linear-gradient(90deg, #ff3b1a, #ff8a5c, #ffb38a, #ff8a5c, #ff3b1a);
    -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: bold;
  }
  .nsf-rule { height: 1px; border: 0; margin: 16px auto; width: 86%;
    background: linear-gradient(90deg, transparent, #ff3b1a 30%, #ff8a5c 50%, #ff3b1a 70%, transparent); }
  .nsf-card { border: 1px solid #2a3142; background: rgba(15,15,15,0.82); margin: 16px auto;
    padding: 14px 18px; max-width: 660px; box-shadow: 0 0 24px rgba(255,59,26,0.12); }
  a { color: #ff8a5c; text-decoration: none; }
  a:hover { color: #f5f1e8; }
  a:visited { color: #ff3b1a; }
  .nsf-title { font-family: "Sinistre", "Sinistre Fallback", serif; font-size: 52px;
    font-weight: bold; letter-spacing: -1px; }

  /* Windows 3.11 window chrome — raised grey bevel, navy title bar, system-menu box on
     the left, minimize/maximize triangle buttons on the right. Used for both the code
     editor and the install "MS-DOS Prompt". */
  .nsf-win { background: #c0c0c0; border: 2px outset #c0c0c0; padding: 3px; text-align: left; }
  .nsf-titlebar { display: flex; align-items: center; gap: 2px; height: 19px; padding: 1px 2px; background: #000080; }
  .nsf-sysbtn { flex: 0 0 auto; width: 17px; height: 15px; background: #c0c0c0; border: 1px outset #c0c0c0;
    display: inline-flex; align-items: center; justify-content: center; }
  .nsf-sysbar { display: block; width: 10px; height: 3px; background: #000; border-top: 1px solid #fff; }
  .nsf-titletext { flex: 1; text-align: center; color: #fff; white-space: nowrap; overflow: hidden;
    font: bold 12px "MS Sans Serif", Tahoma, Geneva, sans-serif; letter-spacing: 0.3px; }
  .nsf-winbtns { flex: 0 0 auto; display: flex; }
  .nsf-winbtn { width: 17px; height: 15px; background: #c0c0c0; border: 1px outset #c0c0c0; color: #000;
    display: inline-flex; align-items: center; justify-content: center; font: 8px sans-serif; line-height: 1; }
  .nsf-client { margin-top: 3px; background: #0a0a0a; border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; }

  /* Contents that live inside those windows. */
  .nsf-term-body { margin: 0; padding: 13px 15px; color: #f5f1e8; font-size: 14px; white-space: pre-wrap;
    font-family: "Commit Mono", ui-monospace, monospace; }
  .nsf-prompt { color: #ff3b1a; font-weight: bold; }
  .nsf-inline { background: #0a0a0a; border: 1px solid #2a3142; color: #ff8a5c; padding: 2px 7px; }
  .nsf-demo { max-width: 900px; }
  .nsf-sbs { margin: 14px auto; border-collapse: collapse; }
  .nsf-sbs td { vertical-align: middle; padding: 0 9px; }
  .nsf-src { margin: 0; padding: 14px 16px; font: 13px/1.6 "Commit Mono", ui-monospace, monospace;
    color: #c8cdd9; white-space: pre; }
  .nsf-src .k { color: #ff8a5c; }
  .nsf-src .d { color: #ff3b1a; }
  .nsf-src .a { color: #ff3b1a; }
  .nsf-src .s { color: #f5f1e8; }
  .nsf-src .l { color: #5a6478; font-style: italic; }
  .nsf-src .c { color: #4a5468; font-style: italic; }

  /* Each cube starts off-screen (per-cube --sx/--sy) and flies toward the centre while
     receding deep in Z — so it shrinks to nothing at a single vanishing point, fades
     out, and loops back to its edge. ~20 of them give a continuous inward stream. */
  .nsf-fly { position: absolute; top: 50%; left: 50%; width: 90px; height: 90px; margin: -45px 0 0 -45px;
    transform-style: preserve-3d; opacity: 0;
    animation-name: nsf-vanish; animation-timing-function: ease-in; animation-iteration-count: infinite; }
  @keyframes nsf-vanish {
    0%   { transform: translate3d(var(--sx), var(--sy), 240px); opacity: 0; }
    12%  { opacity: 0.7; }
    78%  { opacity: 0.5; }
    100% { transform: translate3d(0px, 0px, -1500px); opacity: 0; }
  }
  .nsf-cube { position: relative; width: 90px; height: 90px; transform-style: preserve-3d; }
  .nsf-cube > i { position: absolute; left: 0; top: 0; width: 90px; height: 90px; box-sizing: border-box;
    border: 1px solid rgba(150,160,180,0.32); background: rgba(42,49,66,0.30); }
  .nsf-cube > i:nth-child(1) { transform: rotateY(0deg)   translateZ(45px); }
  .nsf-cube > i:nth-child(2) { transform: rotateY(90deg)  translateZ(45px); }
  .nsf-cube > i:nth-child(3) { transform: rotateY(180deg) translateZ(45px); }
  .nsf-cube > i:nth-child(4) { transform: rotateY(270deg) translateZ(45px); }
  .nsf-cube > i:nth-child(5) { transform: rotateX(90deg)  translateZ(45px); }
  .nsf-cube > i:nth-child(6) { transform: rotateX(-90deg) translateZ(45px); }
  .nsf-spinA { animation: nsf-tumbleA 11s linear infinite; }
  .nsf-spinB { animation: nsf-tumbleB 8s linear infinite; }
  .nsf-spinC { animation: nsf-tumbleC 15s linear infinite; }
  @keyframes nsf-tumbleA { from { transform: rotateX(-18deg) rotateY(0deg); }   to { transform: rotateX(-18deg) rotateY(360deg); } }
  @keyframes nsf-tumbleB { from { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); } to { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); } }
  @keyframes nsf-tumbleC { from { transform: rotateY(0deg) rotateZ(12deg); } to { transform: rotateY(-360deg) rotateZ(12deg); } }
</style>

<div class="nsf-space">
  <div class="nsf-fly" style="--sx:-62vw;--sy:-30vh;animation-duration:8.5s;animation-delay:0s"><div class="nsf-cube nsf-spinA"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:60vw;--sy:-26vh;animation-duration:9.2s;animation-delay:-0.5s"><div class="nsf-cube nsf-spinB"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-55vw;--sy:34vh;animation-duration:7.8s;animation-delay:-1.0s"><div class="nsf-cube nsf-spinC"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:58vw;--sy:40vh;animation-duration:10.0s;animation-delay:-1.4s"><div class="nsf-cube nsf-spinA"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:4vw;--sy:-58vh;animation-duration:8.0s;animation-delay:-1.9s"><div class="nsf-cube nsf-spinB"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-8vw;--sy:56vh;animation-duration:9.5s;animation-delay:-2.3s"><div class="nsf-cube nsf-spinC"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-70vw;--sy:6vh;animation-duration:7.6s;animation-delay:-2.8s"><div class="nsf-cube nsf-spinA"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:68vw;--sy:-8vh;animation-duration:8.8s;animation-delay:-3.2s"><div class="nsf-cube nsf-spinB"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:40vw;--sy:-46vh;animation-duration:9.0s;animation-delay:-3.7s"><div class="nsf-cube nsf-spinC"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-44vw;--sy:-42vh;animation-duration:7.9s;animation-delay:-4.1s"><div class="nsf-cube nsf-spinA"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:52vw;--sy:28vh;animation-duration:10.2s;animation-delay:-4.6s"><div class="nsf-cube nsf-spinB"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-50vw;--sy:18vh;animation-duration:8.3s;animation-delay:-5.0s"><div class="nsf-cube nsf-spinC"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:18vw;--sy:54vh;animation-duration:9.1s;animation-delay:-5.5s"><div class="nsf-cube nsf-spinA"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-22vw;--sy:-54vh;animation-duration:7.7s;animation-delay:-5.9s"><div class="nsf-cube nsf-spinB"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:64vw;--sy:14vh;animation-duration:8.6s;animation-delay:-6.4s"><div class="nsf-cube nsf-spinC"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-64vw;--sy:-12vh;animation-duration:9.8s;animation-delay:-6.8s"><div class="nsf-cube nsf-spinA"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:30vw;--sy:46vh;animation-duration:8.1s;animation-delay:-7.3s"><div class="nsf-cube nsf-spinB"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-34vw;--sy:48vh;animation-duration:9.3s;animation-delay:-7.7s"><div class="nsf-cube nsf-spinC"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:46vw;--sy:-34vh;animation-duration:7.8s;animation-delay:-8.2s"><div class="nsf-cube nsf-spinA"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  <div class="nsf-fly" style="--sx:-16vw;--sy:-60vh;animation-duration:8.9s;animation-delay:-8.6s"><div class="nsf-cube nsf-spinB"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
</div>
<div class="nsf-scan"></div>

<div class="nsf-content">
<center>

<marquee behavior="alternate" scrollamount="14" bgcolor="#151515">
  <font size="5" color="#ff8a5c" face="Commit Mono">&#9733;&#9733;&#9733; WELCOME TO MARKGRAF.DEV &#9733;&#9733;&#9733; ANIMATED GRAPH DIAGRAMS FROM A TINY SOURCE LANGUAGE &#9733;&#9733;&#9733;</font>
</marquee>

<table border="0" cellpadding="14" cellspacing="0" bgcolor="#0a0a0a" align="center" style="border:1px solid #2a3142">
  <tr><td align="center">
    <span class="nsf-amber nsf-title">~* M A R K G R A F *~</span>
  </td></tr>
</table>

<div class="nsf-card nsf-demo">
  <font color="#ff8a5c" face="Commit Mono" size="2"><b>&#9658; LIVE DEMO</b> &mdash; this source compiles to this animation</font>
  <table class="nsf-sbs"><tr>
    <td>
      <div class="nsf-win">
        <div class="nsf-titlebar">
          <span class="nsf-sysbtn"><span class="nsf-sysbar"></span></span>
          <span class="nsf-titletext">EXAMPLE.MARKGRAF</span>
          <span class="nsf-winbtns"><span class="nsf-winbtn">&#9660;</span><span class="nsf-winbtn">&#9650;</span></span>
        </div>
        <div class="nsf-client">
<pre class="nsf-src"><span class="k">frame</span> <span class="s">"a simple read"</span> {
  <span class="d">+node</span> client <span class="s">"Client"</span>
  <span class="d">+node</span> api    <span class="s">"API"</span>
  <span class="d">+edge</span> client api

  client <span class="a">-&gt;</span> api <span class="l">|GET /user/42
                 asks the API
                 for one user record|</span>
}</pre>
        </div>
      </div>
    </td>
    <td>
      <video width="420" autoplay loop muted playsinline preload="auto" disablepictureinpicture disableremoteplayback
             style="border:1px solid #2a3142; display:block; pointer-events:none">
        <source src="/markgraf-www/markgraf-demo.mp4" type="video/mp4">
        <img src="/markgraf-www/markgraf-demo.webp" alt="markgraf animated graph diagram" width="420"
             style="border:1px solid #2a3142">
      </video>
    </td>
  </tr></table>
  <font color="#8a94a8" face="Commit Mono" size="2">fig. 0 &mdash; markgraf renders the source (left) into the diagram (right): client &#8594; API &#8594; DB &#8594; cache</font>
</div>

<div class="nsf-card">
  <font color="#ff8a5c" face="Commit Mono" size="4"><b>&#9658; INSTALL IT</b></font>
  <div class="nsf-win" style="max-width:520px; margin:12px auto">
    <div class="nsf-titlebar">
      <span class="nsf-sysbtn"><span class="nsf-sysbar"></span></span>
      <span class="nsf-titletext">MS-DOS PROMPT</span>
      <span class="nsf-winbtns"><span class="nsf-winbtn">&#9660;</span><span class="nsf-winbtn">&#9650;</span></span>
    </div>
    <div class="nsf-client">
      <pre class="nsf-term-body"><span class="nsf-prompt">C:\&gt;</span> brew install markgrafhq/tap/markgraf</pre>
    </div>
  </div>
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
