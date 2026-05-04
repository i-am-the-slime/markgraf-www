"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={onClick}
      aria-label="Copy install command"
      className="text-muted-foreground hover:text-foreground transition-colors text-xs uppercase tracking-wider"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}
