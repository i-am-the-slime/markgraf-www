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

  /* Matrix code-rain: fixed orange glyph columns falling behind the content.
     Pure CSS — each column is a tall monospace string translated down on a loop. */
  .nsf-rain { position: fixed; inset: 0; overflow: hidden; z-index: 0; pointer-events: none;
    -webkit-mask-image: linear-gradient(180deg, transparent, #000 8%, #000 86%, transparent);
            mask-image: linear-gradient(180deg, transparent, #000 8%, #000 86%, transparent); }
  .nsf-col { position: absolute; top: 0; width: 1ch; font: 700 16px/1.05 "Commit Mono", ui-monospace, monospace;
    color: #ff3b1a; opacity: 0.5; white-space: normal; word-break: break-all;
    text-shadow: 0 0 7px rgba(255,59,26,0.7);
    animation-name: nsf-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
  @keyframes nsf-fall { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }

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

  /* The .markgraf source shown beside the demo gif. */
  .nsf-demo { max-width: 880px; }
  .nsf-sbs { margin: 12px auto; border-collapse: collapse; }
  .nsf-sbs td { vertical-align: top; padding: 0 8px; }
  .nsf-src { text-align: left; background: #0a0a0a; border: 1px solid #2a3142; border-radius: 6px;
    padding: 12px 14px; margin: 0; font: 13px/1.5 "Commit Mono", ui-monospace, monospace; color: #c8cdd9; white-space: pre; }
  .nsf-src .k { color: #ff3b1a; font-weight: bold; }
  .nsf-src .d { color: #ff8a5c; }
  .nsf-src .a { color: #ff3b1a; font-weight: bold; }
  .nsf-src .s { color: #f5f1e8; }
  .nsf-src .l { color: #5a6478; }
</style>

<div class="nsf-rain">
  <span class="nsf-col" style="left:3%;animation-duration:6.0s;animation-delay:-0.3s">10110100110101101001011010</span>
  <span class="nsf-col" style="left:11%;animation-duration:8.2s;animation-delay:-2.1s">{}();=>[]&lt;&gt;|/\+*-#01101</span>
  <span class="nsf-col" style="left:19%;animation-duration:4.6s;animation-delay:-1.4s">&#955;&#8594;&#9675;&#9472;&#9474;&#9484;&#9488;&#9492;&#9496;&#9532;01101001</span>
  <span class="nsf-col" style="left:27%;animation-duration:9.1s;animation-delay:-3.7s">0F3B1AFF8A5C0011101001011010</span>
  <span class="nsf-col" style="left:35%;animation-duration:5.4s;animation-delay:-0.9s">001110100101101001110100101</span>
  <span class="nsf-col" style="left:43%;animation-duration:7.3s;animation-delay:-4.2s">&#9658;&#9608;&#9617;&#9618;&#9619;101101001011010</span>
  <span class="nsf-col" style="left:51%;animation-duration:6.7s;animation-delay:-1.8s">10010110100101101001011011010</span>
  <span class="nsf-col" style="left:59%;animation-duration:8.8s;animation-delay:-5.1s">&gt;&gt;=:&#9472;&#9474;&#9532;&#9675;&#9679;01101001011</span>
  <span class="nsf-col" style="left:67%;animation-duration:5.0s;animation-delay:-2.6s">110100101101001011010011010</span>
  <span class="nsf-col" style="left:75%;animation-duration:9.6s;animation-delay:-0.5s">&#955;&#955;&#8594;&#9675;01101001011010010110</span>
  <span class="nsf-col" style="left:83%;animation-duration:6.3s;animation-delay:-3.3s">01101001&#9608;&#9617;&#9618;101101001011</span>
  <span class="nsf-col" style="left:91%;animation-duration:7.8s;animation-delay:-1.1s">100101101001011010011010010</span>
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
<pre class="nsf-src"><span class="k">frame</span> <span class="s">"a simple read"</span> {
  <span class="d">+node</span> client <span class="s">"Client"</span>
  <span class="d">+node</span> api    <span class="s">"API"</span>
  <span class="d">+edge</span> client api

  client <span class="a">-&gt;</span> api <span class="l">|GET /user/42
                 asks the API
                 for one user record|</span>
}</pre>
    </td>
    <td>
      <img src="/markgraf-www/markgraf-demo.gif" alt="markgraf animated graph diagram" width="420"
           style="border:1px solid #2a3142; image-rendering:auto">
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
    JavaScript is switched off, so the real diagrams &mdash; <i>short animated graphs
    from a tiny declarative source language</i>, live in WebGL &mdash; can't run.
    What you see above is the closest 1996 could get.<br><br>
    <span class="nsf-blink nsf-new">&lt;TURN JAVASCRIPT ON&gt;</span> for the real thing.
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
