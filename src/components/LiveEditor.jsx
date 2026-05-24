"use client";

import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { MarkgrafPlayer } from "@markgrafhq/markgraf-react";

const DEFAULT_SRC = `seed 1

frame setup {
  +node client "Client"
  +node api    "API"
  +node db     "Database"
  +edge client api
  +edge api db
}

frame "request" {
  client -> api "GET /user/42"
  api    -> db  "SELECT *"
  api    <- db  "row"
  client <- api "200 OK"
}
`;

const editorTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "transparent",
      fontSize: "13px",
    },
    ".cm-scroller": {
      fontFamily:
        "'Commit Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
      lineHeight: "1.7",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      borderRight: "1px solid #1a1f2e",
      color: "#3a4256",
    },
    ".cm-activeLine": { backgroundColor: "#11162260" },
    ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#ff3b1a" },
    ".cm-content": { caretColor: "#ff3b1a" },
    "&.cm-focused .cm-cursor": { borderLeftColor: "#ff3b1a" },
    "&.cm-focused": { outline: "none" },
  },
  { dark: true }
);

export default function LiveEditor() {
  const [src, setSrc] = useState(DEFAULT_SRC);
  const [debouncedSrc, setDebouncedSrc] = useState(DEFAULT_SRC);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSrc(src), 250);
    return () => clearTimeout(id);
  }, [src]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
        gap: "1px",
        backgroundColor: "#1a1f2e",
        border: "1px solid #1a1f2e",
        borderRadius: "12px",
        overflow: "hidden",
        minHeight: "520px",
      }}
    >
      <div
        style={{
          backgroundColor: "#0a0e1a",
          padding: "0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            fontFamily: "'Commit Mono', ui-monospace, monospace",
            fontSize: "11px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#5a6478",
            borderBottom: "1px solid #1a1f2e",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "999px",
              background: "#ff3b1a",
            }}
          />
          source.mg
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <CodeMirror
            value={src}
            onChange={setSrc}
            theme={oneDark}
            extensions={[editorTheme]}
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              highlightActiveLine: true,
              highlightActiveLineGutter: true,
            }}
            style={{ height: "100%" }}
          />
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#0a0e1a",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            fontFamily: "'Commit Mono', ui-monospace, monospace",
            fontSize: "11px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#5a6478",
            borderBottom: "1px solid #1a1f2e",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "999px",
              background: "#69dcaa",
            }}
          />
          live render
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <MarkgrafPlayer src={debouncedSrc} renderer="svg" />
        </div>
      </div>
    </div>
  );
}
