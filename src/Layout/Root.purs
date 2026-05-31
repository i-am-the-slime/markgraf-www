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

-- The no-JS experience, straight outta 1996. The whole thing lives inside a single
-- <noscript> so browsers with scripting on never parse a byte of it; only when JS is
-- disabled does the inner <style> kick in — hiding the real (WebGL) app and dressing
-- the page up in marquees, blink, hazard tables and a fake hit counter.
-- The markup is prerendered into static HTML at build time (dangerouslySetInnerHTML
-- emits it verbatim), so no JavaScript ever runs to produce or show it. Raw markup
-- (not bindings) because <marquee>, <font>, <center>, bgcolor have no typed element —
-- and that is the point.
noScriptFallback :: JSX
noScriptFallback = createBuiltinElement_ "noscript" (unsafeCoerce { dangerouslySetInnerHTML: { __html: retro } })

retro :: String
retro = """
<style>
  #mg-app { display: none !important; }
  html, body { margin: 0; padding: 0; }
  body {
    background: #000080;
    background-image: repeating-linear-gradient(0deg, #000080 0 39px, #00006a 39px 40px);
    color: #00ff66;
    font-family: "Comic Sans MS", "Times New Roman", Times, serif;
    text-align: center;
  }
  .nsf-blink { animation: nsf-blink 1s steps(1, end) infinite; }
  @keyframes nsf-blink { 50% { visibility: hidden; } }
  .nsf-rainbow {
    background: linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #00ffff, #2222ff, #ff00ff, #ff0000);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    font-weight: bold;
  }
  .nsf-rule { height: 6px; border: 0; margin: 14px auto; width: 90%;
    background: linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #ff00ff, #ff0000); }
  .nsf-card { border: 4px ridge #c0c0c0; background: #000040; margin: 16px auto; padding: 10px 16px; max-width: 640px; }
  a { color: #ffff00; }
  a:visited { color: #ff66ff; }
  .nsf-counter { font-family: "Courier New", monospace; background: #000; color: #ff3300;
    border: 3px inset #808080; padding: 2px 6px; letter-spacing: 4px; font-weight: bold; }
  .nsf-new { color: #ff0000; font-weight: bold; font-family: "Courier New", monospace; }
  .nsf-title { font-size: 42px; font-weight: bold; letter-spacing: -1px; }
  /* The graph diagram, rendered the 1996 way: a table whose edge cells morph
     between a ring and a star by toggling visibility. No JavaScript, no SVG —
     just CSS keyframes flipping opacity on <td> contents. */
  .nsf-graph { border-collapse: collapse; margin: 4px auto; background: #000;
    border: 3px ridge #c0c0c0; }
  .nsf-graph td { width: 34px; height: 34px; padding: 0; text-align: center;
    vertical-align: middle; font-family: "Courier New", monospace; font-size: 22px;
    line-height: 34px; color: #00ffaa; }
  .nsf-node { display: inline-block; width: 24px; height: 24px; line-height: 21px;
    border: 2px solid #ffff00; border-radius: 50%; background: #113300; color: #ffff00;
    font-weight: bold; font-size: 14px; }
  .nsf-core { animation: nsf-core 4s ease-in-out infinite; }
  .nsf-ring-edge { animation: nsf-ring 4s ease-in-out infinite; }
  .nsf-star-edge { animation: nsf-star 4s ease-in-out infinite; color: #ff66ff; }
  @keyframes nsf-ring { 0%,42% { opacity: 1; } 50%,92% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes nsf-star { 0%,42% { opacity: 0; } 50%,92% { opacity: 1; } 100% { opacity: 0; } }
  @keyframes nsf-core { 0%,42% { box-shadow: none; border-color: #ffff00; }
    50%,92% { box-shadow: 0 0 10px #ff66ff; border-color: #ff66ff; } 100% { box-shadow: none; } }
</style>

<center>

<marquee behavior="alternate" scrollamount="14" bgcolor="#000000">
  <font size="5" color="#ffff00" face="Comic Sans MS">&#9733;&#9733;&#9733; WELCOME TO MARKGRAF.DEV &#9733;&#9733;&#9733; you are visitor number 0000042 &#9733;&#9733;&#9733; sign my guestbook!! &#9733;&#9733;&#9733;</font>
</marquee>

<table border="6" cellpadding="14" cellspacing="0" bgcolor="#000000" align="center">
  <tr><td align="center">
    <span class="nsf-rainbow nsf-title">~* M A R K G R A F *~</span>
  </td></tr>
</table>

<p>
  <img src="/markgraf-www/under-construction.gif" alt="under construction" width="72" height="72" align="middle" border="0">
  <span class="nsf-blink"><font color="#ff2200" face="Comic Sans MS" size="6">&nbsp;THIS SITE IS UNDER CONSTRUCTION&nbsp;</font></span>
  <img src="/markgraf-www/under-construction.gif" alt="under construction" width="72" height="72" align="middle" border="0">
</p>

<hr class="nsf-rule">

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
  <font color="#00ffaa" face="Courier New" size="2">fig. 1 &mdash; one (1) animated graph diagram, hand-cranked in HTML tables</font>
  <hr class="nsf-rule">
  <font color="#ffffff" face="Times New Roman" size="4">
    JavaScript is switched off, so the real diagrams &mdash; <i>short animated graphs
    from a tiny declarative source language</i>, live in WebGL &mdash; can't run.
    What you see above is the closest 1996 could get.<br><br>
    <span class="nsf-blink nsf-new">&lt;TURN JAVASCRIPT ON&gt;</span> for the real thing.
  </font>
</div>

<marquee behavior="scroll" direction="left" scrollamount="6">
  <font color="#00ffff" face="Courier New">
    &#9658; best viewed in Netscape Navigator 4.0 at 800x600 &#9658; please turn on your speakers for the MIDI &#9658; this page is Y2K compliant &#9658;
  </font>
</marquee>

<hr class="nsf-rule">

<table cellpadding="6" align="center"><tr>
  <td><font color="#c0c0c0" face="Courier New" size="2">visitors since 1996:</font></td>
  <td><span class="nsf-counter">0&nbsp;0&nbsp;0&nbsp;0&nbsp;0&nbsp;4&nbsp;2</span></td>
</tr></table>

<p>
  <font face="Courier New" color="#ffcc00" size="2">
    [ <a href="mailto:hello@markgraf.dev">&#9993; e-mail the webmaster</a> ]
    &nbsp;&middot;&nbsp;
    [ <a href="#">&#9758; sign my guestbook</a> ]
    &nbsp;&middot;&nbsp;
    [ <a href="#">join the WEBRING</a> &#9756; ]
  </font>
</p>

<hr class="nsf-rule">

<p><font face="Comic Sans MS" color="#888888" size="2">
  &copy; 1996&ndash;2026 markgraf &middot; hand-coded in Notepad
</font></p>

</center>
"""

metadata ::
  { title :: String
  , description :: String
  }
metadata =
  { title: "markgraf — animated graph diagrams"
  , description: "Render short animated graph diagrams from a tiny declarative source language."
  }
