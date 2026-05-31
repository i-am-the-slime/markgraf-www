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
retro = """
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

  .nsf-blink { animation: nsf-blink 1.1s steps(1, end) infinite; }
  @keyframes nsf-blink { 50% { visibility: hidden; } }
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
  .nsf-counter { font-family: "Commit Mono", ui-monospace, monospace; background: #000; color: #ff7a1a;
    border: 1px solid #2a3142; padding: 3px 8px; letter-spacing: 5px; font-weight: bold; }
  .nsf-new { color: #ff3b1a; font-weight: bold; }
  .nsf-title { font-family: "Sinistre", "Sinistre Fallback", serif; font-size: 52px;
    font-weight: bold; letter-spacing: -1px; }

  /* The graph diagram, rendered the 1996 way: a table whose edge cells morph between a
     ring and a star by toggling opacity. No JavaScript, no SVG — just CSS keyframes. */
  .nsf-graph { border-collapse: collapse; margin: 4px auto; background: #0a0a0a; border: 1px solid #2a3142; }
  .nsf-graph td { width: 34px; height: 34px; padding: 0; text-align: center; vertical-align: middle;
    font-family: "Commit Mono", ui-monospace, monospace; font-size: 22px; line-height: 34px; color: #ff8a5c; }
  .nsf-node { display: inline-block; width: 24px; height: 24px; line-height: 21px;
    border: 2px solid #ff3b1a; border-radius: 50%; background: #1a1f2e; color: #ff8a5c;
    font-weight: bold; font-size: 14px; }
  .nsf-core { animation: nsf-core 4s ease-in-out infinite; }
  .nsf-ring-edge { animation: nsf-ring 4s ease-in-out infinite; color: #ff8a5c; }
  .nsf-star-edge { animation: nsf-star 4s ease-in-out infinite; color: #ff3b1a; }
  @keyframes nsf-ring { 0%,42% { opacity: 1; } 50%,92% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes nsf-star { 0%,42% { opacity: 0; } 50%,92% { opacity: 1; } 100% { opacity: 0; } }
  @keyframes nsf-core { 0%,42% { box-shadow: none; } 50%,92% { box-shadow: 0 0 12px #ff3b1a; } 100% { box-shadow: none; } }

  /* Fake terminal that holds the real install command. */
  .nsf-term { text-align: left; background: #0a0a0a; border: 1px solid #2a3142; border-radius: 7px;
    max-width: 520px; margin: 12px auto; overflow: hidden; }
  .nsf-term-bar { background: #1a1f2e; color: #8a94a8; font-size: 11px; padding: 6px 11px; letter-spacing: 1px; }
  .nsf-term-body { margin: 0; padding: 13px 15px; color: #f5f1e8; font-size: 14px; white-space: pre-wrap;
    font-family: "Commit Mono", ui-monospace, monospace; }
  .nsf-prompt { color: #ff3b1a; font-weight: bold; }
  .nsf-inline { background: #0a0a0a; border: 1px solid #2a3142; color: #ff8a5c; padding: 2px 7px; }

  /* The .markgraf source shown beside the demo, framed like a little editor window. */
  .nsf-demo { max-width: 900px; }
  .nsf-sbs { margin: 14px auto; border-collapse: collapse; }
  .nsf-sbs td { vertical-align: middle; padding: 0 9px; }
  .nsf-editor { background: #0c0c0c; border: 1px solid #2a3142; border-radius: 8px; overflow: hidden;
    text-align: left; box-shadow: 0 0 22px rgba(0,0,0,0.5); }
  .nsf-editor-bar { display: flex; align-items: center; gap: 7px; background: #161b27; padding: 8px 12px;
    border-bottom: 1px solid #2a3142; }
  .nsf-dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
  .nsf-editor-name { margin-left: 6px; color: #8a94a8; font: 11px "Commit Mono", ui-monospace, monospace; letter-spacing: 0.5px; }
  .nsf-src { margin: 0; padding: 14px 16px; font: 13px/1.6 "Commit Mono", ui-monospace, monospace;
    color: #c8cdd9; white-space: pre; }
  .nsf-src .k { color: #ff8a5c; }
  .nsf-src .d { color: #ff3b1a; }
  .nsf-src .a { color: #ff3b1a; }
  .nsf-src .s { color: #f5f1e8; }
  .nsf-src .l { color: #5a6478; font-style: italic; }
  .nsf-src .c { color: #4a5468; font-style: italic; }

  .nsf-obj { position: absolute; top: 50%; left: 50%; width: 90px; height: 90px; margin: -45px 0 0 -45px;
    transform-style: preserve-3d; }
  /* Fly-in: each shape streaks from a screen edge to its resting spot (once, on load),
     then the cube inside keeps tumbling forever. */
  .nsf-fly { transform-style: preserve-3d; opacity: 0;
    animation-duration: 1.9s; animation-timing-function: cubic-bezier(0.16,0.82,0.28,1); animation-fill-mode: forwards; }
  .nsf-fly1 { animation-name: nsf-fly1; animation-delay: 0.05s; }
  .nsf-fly2 { animation-name: nsf-fly2; animation-delay: 0.20s; }
  .nsf-fly3 { animation-name: nsf-fly3; animation-delay: 0.35s; }
  .nsf-fly4 { animation-name: nsf-fly4; animation-delay: 0.50s; }
  .nsf-fly5 { animation-name: nsf-fly5; animation-delay: 0.65s; }
  @keyframes nsf-fly1 { 0% { transform: translate3d(-85vw,-55vh,-700px) scale(0.3); opacity: 0; } 55% { opacity: 1; } 100% { transform: translate3d(0,0,0) scale(1); opacity: 1; } }
  @keyframes nsf-fly2 { 0% { transform: translate3d(85vw,-50vh,-900px) scale(0.3); opacity: 0; } 55% { opacity: 1; } 100% { transform: translate3d(0,0,0) scale(1); opacity: 1; } }
  @keyframes nsf-fly3 { 0% { transform: translate3d(-75vw,55vh,-600px) scale(0.3); opacity: 0; } 55% { opacity: 1; } 100% { transform: translate3d(0,0,0) scale(1); opacity: 1; } }
  @keyframes nsf-fly4 { 0% { transform: translate3d(80vw,52vh,-1000px) scale(0.3); opacity: 0; } 55% { opacity: 1; } 100% { transform: translate3d(0,0,0) scale(1); opacity: 1; } }
  @keyframes nsf-fly5 { 0% { transform: translate3d(0,-72vh,-1100px) scale(0.3); opacity: 0; } 55% { opacity: 1; } 100% { transform: translate3d(0,0,0) scale(1); opacity: 1; } }
  .nsf-cube { position: relative; width: 90px; height: 90px; transform-style: preserve-3d; }
  .nsf-cube > i { position: absolute; left: 0; top: 0; width: 90px; height: 90px; box-sizing: border-box;
    border: 1px solid rgba(255,138,92,0.5); background: rgba(255,59,26,0.035);
    box-shadow: inset 0 0 16px rgba(255,59,26,0.1); }
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
  <div class="nsf-obj" style="transform: translate3d(-150px,-30px,-120px) scale(0.72)">
    <div class="nsf-fly nsf-fly1"><div class="nsf-cube nsf-spinA"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  </div>
  <div class="nsf-obj" style="transform: translate3d(160px,-46px,-40px) scale(0.92)">
    <div class="nsf-fly nsf-fly2"><div class="nsf-cube nsf-spinB"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  </div>
  <div class="nsf-obj" style="transform: translate3d(-120px,70px,30px) scale(1.1)">
    <div class="nsf-fly nsf-fly3"><div class="nsf-cube nsf-spinC"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  </div>
  <div class="nsf-obj" style="transform: translate3d(130px,86px,-80px) scale(0.8)">
    <div class="nsf-fly nsf-fly4"><div class="nsf-cube nsf-spinB"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  </div>
  <div class="nsf-obj" style="transform: translate3d(10px,-96px,60px) scale(1.25)">
    <div class="nsf-fly nsf-fly5"><div class="nsf-cube nsf-spinA"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
  </div>
</div>
<div class="nsf-scan"></div>

<div class="nsf-content">
<center>

<marquee behavior="alternate" scrollamount="14" bgcolor="#151515">
  <font size="5" color="#ff8a5c" face="Commit Mono">&#9733;&#9733;&#9733; WELCOME TO MARKGRAF.DEV &#9733;&#9733;&#9733; you are visitor number 0000042 &#9733;&#9733;&#9733;</font>
</marquee>

<table border="0" cellpadding="14" cellspacing="0" bgcolor="#0a0a0a" align="center" style="border:1px solid #2a3142">
  <tr><td align="center">
    <span class="nsf-amber nsf-title">~* M A R K G R A F *~</span>
  </td></tr>
</table>

<p>
  <img src="/markgraf-www/under-construction.gif" alt="under construction" width="72" height="72" align="middle" border="0">
  <span class="nsf-blink"><font color="#ff3b1a" face="Commit Mono" size="6">&nbsp;UNDER CONSTRUCTION&nbsp;</font></span>
  <img src="/markgraf-www/under-construction.gif" alt="under construction" width="72" height="72" align="middle" border="0">
</p>

<hr class="nsf-rule">

<div class="nsf-card nsf-demo">
  <font color="#ff8a5c" face="Commit Mono" size="2"><b>&#9658; LIVE DEMO</b> &mdash; this source compiles to this animation</font>
  <table class="nsf-sbs"><tr>
    <td>
      <div class="nsf-editor">
        <div class="nsf-editor-bar">
          <span class="nsf-dot" style="background:#ff3b1a"></span>
          <span class="nsf-dot" style="background:#ff8a5c"></span>
          <span class="nsf-dot" style="background:#2a3142"></span>
          <span class="nsf-editor-name">example.markgraf</span>
        </div>
<pre class="nsf-src"><span class="k">frame</span> <span class="s">"a simple read"</span> {
  <span class="d">+node</span> client <span class="s">"Client"</span>
  <span class="d">+node</span> api    <span class="s">"API"</span>
  <span class="d">+edge</span> client api

  client <span class="a">-&gt;</span> api <span class="l">|GET /user/42
                 asks the API
                 for one user record|</span>
}</pre>
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
  <table class="nsf-graph">
    <tr>
      <td><span class="nsf-node">A</span></td>
      <td><span class="nsf-ring-edge">&#9472;</span></td>
      <td><span class="nsf-ring-edge">&#9472;</span></td>
      <td><span class="nsf-ring-edge">&#9472;</span></td>
      <td><span class="nsf-node">B</span></td>
    </tr>
    <tr>
      <td><span class="nsf-ring-edge">&#9474;</span></td>
      <td><span class="nsf-star-edge">&#9586;</span></td>
      <td></td>
      <td><span class="nsf-star-edge">&#9585;</span></td>
      <td><span class="nsf-ring-edge">&#9474;</span></td>
    </tr>
    <tr>
      <td><span class="nsf-ring-edge">&#9474;</span></td>
      <td></td>
      <td><span class="nsf-node nsf-core">E</span></td>
      <td></td>
      <td><span class="nsf-ring-edge">&#9474;</span></td>
    </tr>
    <tr>
      <td><span class="nsf-ring-edge">&#9474;</span></td>
      <td><span class="nsf-star-edge">&#9585;</span></td>
      <td></td>
      <td><span class="nsf-star-edge">&#9586;</span></td>
      <td><span class="nsf-ring-edge">&#9474;</span></td>
    </tr>
    <tr>
      <td><span class="nsf-node">C</span></td>
      <td><span class="nsf-ring-edge">&#9472;</span></td>
      <td><span class="nsf-ring-edge">&#9472;</span></td>
      <td><span class="nsf-ring-edge">&#9472;</span></td>
      <td><span class="nsf-node">D</span></td>
    </tr>
  </table>
  <font color="#8a94a8" face="Commit Mono" size="2">fig. 1 &mdash; one (1) animated graph diagram, hand-cranked in HTML tables</font>
  <hr class="nsf-rule">
  <font color="#c8cdd9" face="Commit Mono" size="4">
    The clip up top is a real markgraf render. This grid is the same graph &mdash; morphing
    between a ring and a star &mdash; the closest 1996 could get to our live WebGL, in pure CSS.
  </font>
</div>

<hr class="nsf-rule">

<div class="nsf-card">
  <font color="#ff8a5c" face="Commit Mono" size="4"><b>&#9658; INSTALL IT</b></font>
  <div class="nsf-term">
    <div class="nsf-term-bar">&#9679; &#9679; &#9679;&nbsp;&nbsp;bash</div>
    <pre class="nsf-term-body"><span class="nsf-prompt">$</span> brew install markgrafhq/tap/markgraf</pre>
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

<marquee behavior="scroll" direction="left" scrollamount="6">
  <font color="#ff8a5c" face="Commit Mono">
    &#9658; please turn on your speakers for the MIDI &#9658; this page is Y2K compliant &#9658; best experienced with the lights off &#9658; the compiler does the work &#9658;
  </font>
</marquee>

<hr class="nsf-rule">

<table cellpadding="6" align="center"><tr>
  <td><font color="#8a94a8" face="Commit Mono" size="2">visitors since 1996:</font></td>
  <td><span class="nsf-counter">0&nbsp;0&nbsp;0&nbsp;0&nbsp;0&nbsp;4&nbsp;2</span></td>
</tr></table>

<p>
  <font face="Commit Mono" color="#5a6478" size="2">
    [ <a href="#">&#9758; sign my guestbook</a> ]
    &nbsp;&middot;&nbsp;
    [ <a href="#">join the WEBRING</a> &#9756; ]
  </font>
</p>

<hr class="nsf-rule">

<p><font face="Commit Mono" color="#5a6478" size="2">
  &copy; 1996&ndash;2026 markgraf &middot; hand-coded in Notepad
</font></p>

</center>
</div>
"""

metadata ::
  { title :: String
  , description :: String
  }
metadata =
  { title: "markgraf — animated graph diagrams"
  , description: "Render short animated graph diagrams from a tiny declarative source language."
  }
