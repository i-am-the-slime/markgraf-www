import { CopyButton } from "./copy-button";

const installCommand = "brew install --cask i-am-the-slime/tap/markgraf";

const example = `frame setup {
  +node a "A"
  +node b "B"
  +edge a b
}

frame greet {
  a -> b "hello"
}`;

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16 sm:py-24 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-12">
        <Logo />
        <h1 className="text-2xl font-medium tracking-tight">markgraf</h1>
      </header>

      <p className="text-xl leading-relaxed mb-12 text-foreground">
        Animated graph diagrams from a tiny declarative source language.
      </p>

      <section className="mb-14">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Install
        </h2>
        <div className="bg-foreground text-background rounded-md px-4 py-3 flex items-center justify-between gap-4 font-mono text-sm">
          <code className="overflow-x-auto whitespace-nowrap">{installCommand}</code>
          <CopyButton value={installCommand} />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          macOS (Apple Silicon) only for now. Linux + Intel coming.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Example
        </h2>
        <pre className="bg-muted rounded-md px-4 py-3 text-sm overflow-x-auto leading-relaxed">
          <code>{example}</code>
        </pre>
        <p className="text-sm text-muted-foreground mt-2">
          Pipe it: <code className="font-mono text-foreground">pbpaste | markgraf --play</code>
        </p>
      </section>

      <section className="mb-14">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          What it does
        </h2>
        <ul className="space-y-2 text-foreground">
          <li>• Layered orthogonal graph layout (an Eclipse ELK port).</li>
          <li>• Frames describe structural changes; tokens flow along edges between them.</li>
          <li>• Native macOS player with drag-and-drop reload, scrub bar, glass backdrop.</li>
          <li>• Encodes to mp4 via embedded ffmpeg — no external dependencies.</li>
        </ul>
      </section>

      <section className="mb-14">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          AI authoring
        </h2>
        <p className="text-foreground leading-relaxed mb-3">
          Claude Code plugin teaches Claude the syntax and authoring rules — short
          labels, <code className="font-mono">par</code> blocks for simultaneity,
          one concept per frame.
        </p>
        <pre className="bg-muted rounded-md px-4 py-3 text-sm overflow-x-auto">
          <code>{`/plugin marketplace add i-am-the-slime/claude-plugins
/plugin install markgraf@i-am-the-slime`}</code>
        </pre>
      </section>

      <footer className="pt-8 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <a className="hover:text-foreground transition-colors" href="https://github.com/i-am-the-slime/homebrew-tap">
          tap
        </a>
        <a className="hover:text-foreground transition-colors" href="https://github.com/i-am-the-slime/homebrew-tap/tree/main/examples">
          examples
        </a>
        <a className="hover:text-foreground transition-colors" href="https://github.com/i-am-the-slime/claude-plugins">
          claude plugin
        </a>
      </footer>
    </main>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 96 96" width="40" height="40" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="14" y="6" width="68" height="22" rx="7" />
        <rect x="14" y="68" width="68" height="22" rx="7" />
        <line x1="48" y1="28" x2="48" y2="60" />
      </g>
      <polygon points="48,68 41,58 55,58" fill="currentColor" />
      <circle cx="48" cy="44" r="9" fill="currentColor" />
    </svg>
  );
}
