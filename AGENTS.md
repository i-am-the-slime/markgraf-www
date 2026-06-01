# markgraf-www — Agent Guide

## Project Type

Next.js 16 static-site (App Router) with PureScript components compiled via `purescript-rsc` / `next-purs-rsc`. Tailwind CSS v4, Three.js / React Three Fiber, Framer Motion.

## Essential Commands

```bash
bun run dev          # Build PureScript → gen-routes → start dev server (all watchers)
bun run build        # spago build → gen-routes → worker → next build → out/
bun run start        # Start production server (next start)
bun run worker       # Bundle diagram-shapes worker (esbuild) → public/diagram-shapes-worker.js
bun run preview:noscript  # Preview the no-JS fallback page
```

**Toolchain**: Bun (lockfile: `bun.lock`). PureScript uses `spago` (lockfile: `spago.lock`).

## Directory Structure

```
app/                    # Next.js App Router (thin re-exports)
  layout.js             # Re-exports Layout.Root from PureScript output
  page.tsx              # Re-exports Page.Home from PureScript output
  globals.css           # Tailwind + custom animations (VHS, CRT, neon, etc.)
  privacy/page.tsx      # Privacy page (static TSX, no PureScript)
  diagram-shapes.worker.js  # Web Worker entry (Three.js r3f scene)

src/                    # PureScript source
  Route.purs            # @generated route enum (Home, Privacy)
  Page/                 # Page components (Home.purs, Privacy.purs)
  Component/            # Reusable components (HeroPreview, InstallButton*, PlayerLazy)
  Layout/               # Root layout (Root.purs)
  DiagramShapes/        # 3D animated background (Offscreen, Scene, Bindings)
  components/           # (empty — reserved)

public/                 # Static assets (fonts, brand, demo video)
scripts/                # Dev/build helpers (dev.mjs, build-diagram-shapes-worker.mjs)
output/                 # PureScript build artifacts (gitignored)
.spago/                 # Spago package cache (gitignored)
```

## Architecture

### PureScript ↔ Next.js Bridge

- PureScript modules in `src/` compile to `output/<Module>/index.js` via `purs-backend-es`
- `next.config.mjs` uses a custom loader (`next-purs-rsc/purescript-rsc-loader.js`) that reads `output/directives.json` to inject `"use client"` / `"use server"` directives
- `app/layout.js` and `app/page.tsx` are thin re-exports: `import Root from "../output/Layout.Root/index.js"`
- Routes are auto-generated in `src/Route.purs` by `purs-rsc-routes` (run via `gen-routes` script)

### Component Model

- PureScript components are React function components built with `react-basic-hooks`
- They use `Yoga.React.DOM.*` bindings for HTML elements and `css` for inline styles
- Most components are wrapped in `unsafePerformEffect` + `reactComponent` for performance (allocated once)
- The `@client` comment on `Page.Home.purs` marks it as a client component for purescript-rsc
- The home page is a single full-viewport scrolling magazine with `snap-y snap-mandatory`

### 3D Background (DiagramShapes)

- Runs in a Web Worker via `@react-three/offscreen` for performance isolation
- `src/DiagramShapes/Offscreen.purs` — manages worker lifecycle, canvas transfer, resize/visibility handling
- `src/DiagramShapes/Scene.purs` — the actual r3f scene (270 animated balls, formations, camera, arrows)
- `src/DiagramShapes/Entry.purs` — re-export for worker mount point
- Messages flow via a `Ref (Maybe WorkerPost)` pattern: HeroPreview posts morph/camera/formation messages, Offscreen component fills the ref when worker is ready
- Pixel budget scales with viewport size (640×480 to 1600×1200)

### Lazy Loading

- `markgraf-react` (~95KB gz) is dynamically imported via Suspense boundary (`Component/PlayerLazy.purs`)
- Cached after first load so prop changes (resize) don't re-fetch

### No-JS Fallback

- `Layout/Root.purs` renders a `<noscript>` block with pure CSS animations (floating 3D boxes, CRT scanlines, amber typography)
- Built into static HTML at build time — no JavaScript needed to render the page

## Code Patterns

### PureScript Component Pattern

```purescript
-- Most components use unsafePerformEffect + reactComponent for one-time allocation
myComponent :: ReactComponent { prop :: String }
myComponent = unsafePerformEffect $ reactComponent "MyComponent" \{ prop } -> Hooks.do
  ref <- useRef initialValue
  useEffect prop $ doSomething ref
  pure $ div {} [ text prop ]
```

### State Management

- `Effect.Ref` for mutable state that doesn't need React re-renders (performance-critical paths)
- `useState'` from `react-basic-hooks` for React-managed state
- `useEffect` / `useEffectOnce` for side effects (event listeners, observers)
- Module-level `unsafePerformEffect` for static buffers (U8Array, F32Array, ballRefs)

### CSS / Styling

- Tailwind CSS v4 with `@theme` for design tokens (brand color `#ff3b1a`, fonts)
- Inline styles via `Yoga.React.DOM.Internal.css` for dynamic values
- Custom CSS animations in `app/globals.css`: VHS effect, CRT scanlines, neon wordmark, hero tagline reveals
- Brand color uses HDR P3 color space with `display-p3` and `dynamic-range-limit` for P3 displays

### FFI Pattern

- FFI declarations in `.purs` files, implementations in `.js` files alongside
- `foreign import` / `foreign export` for browser APIs (OffscreenCanvas, typed arrays)
- JS files are bundled separately (not through Turbopack) to avoid React Fast Refresh signatures breaking in worker context

### Tokenizer (in HeroPreview.purs)

- Homegrown tokenizer for the markgraf DSL (keywords, operators, strings, numbers, comments, identifiers)
- Color mapping: keywords `#ff3b1a` (red), operators `#ff8a5c` (orange), strings `#5b8fd6` (blue), numbers `#d9c97a` (yellow), comments `#5a6478` (grey)

## Fonts

- **Sinistre** — display headings (serif, variable weight)
- **Ilisarniq** — body text (sans-serif)
- **Commit Mono** — code/monospace (aliased as "Ioskeley Mono" for markgraf-embed compatibility)
- All have metric-matched fallbacks (Times New Roman → Sinistre, Arial → Ilisarniq) using `ascent-override` / `descent-override` / `size-adjust`

## Key Files

| File | Purpose |
|------|---------|
| `next.config.mjs` | Static export, base path, custom loader for `output/**/index.js` |
| `spago.yaml` | PureScript package config (extra packages from git/local paths) |
| `scripts/dev.mjs` | Dev orchestrator: spago build watcher + worker watcher + next dev |
| `app/globals.css` | All CSS: Tailwind, font faces, animations, CRT overlay, neon glow |
| `src/Route.purs` | Generated route enum (do not edit manually) |
| `src/Page/Home.purs` | Main page — the entire scrolling magazine (1700+ lines) |
| `src/DiagramShapes/Scene.purs` | 3D scene — 270 balls, formations, camera, arrows (1500+ lines) |
| `src/Component/InstallButtonSDF.purs` | SDF raymarched button (GLSL shader embedded in PureScript string) |

## Gotchas

1. **Never edit `src/Route.purs`** — it's auto-generated by `purs-rsc-routes`. Add a new page by creating `src/Page/Name.purs` and running `gen-routes`.

2. **Worker bundling**: The diagram-shapes worker must be built with esbuild (not Turbopack). Turbopack injects React Fast Refresh signatures that break in worker context. Use `bun run worker` or `bun run build`.

3. **PureScript build first**: `dev` and `build` scripts run `spago build` before Next.js. If you change `.purs` files, the dev watcher handles it, but for a manual rebuild run `npx spago build`.

4. **`output/` is gitignored**: The PureScript compiled JS lives here. It's regenerated on every build. Don't commit changes here.

5. **`unsafeCoerce` is used extensively** — for React component casting, FFI interop, and RootState coercion. This is intentional (performance) but means type safety is delegated to runtime.

6. **Local package dependencies**: Several packages come from local paths (`yoga-r3f`, `purescript-yoga-react-dom`, `next-purs-rsc`, etc.). These must exist at the paths specified in `spago.yaml` or the build will fail.

7. **Static export**: The site uses `output: "export"` in next.config.mjs with `basePath: "/markgraf-www"`. All asset paths are prefixed with `/markgraf-www/`.

8. **No linting/typechecking**: `tsconfig.json` has `ignoreBuildErrors: true` and `strict: false`. The project relies on PureScript's type system for safety; TypeScript is only used for the thin Next.js re-export layer.

9. **Section declarations**: Each magazine section in `HeroPreview.purs` declares a `SectionState` with morph, camera arm, and formation pose. New sections need entries in `sectionStates` and corresponding section functions.

10. **Reduced motion**: All animations have `@media (prefers-reduced-motion: reduce)` variants. Respect these when adding new animations.

## CI/CD

- `.github/workflows/deploy.yml` — deploys to GitHub Pages on push to `main`
- Steps: `bun install --frozen-lockfile` → `npx spago build` → `npx next build` → upload `out/` to GitHub Pages
- Uses oven-sh/setup-bun + actions/setup-node@v4 (Node 22)
