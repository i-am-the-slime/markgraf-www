#!/usr/bin/env bash
# Regenerate the subset web fonts in public/fonts from the full masters in
# fonts-src/. Masters keep every glyph; the served fonts carry only the ranges
# the site renders, so the eager font payload stays small.
#
# Requires fonttools + Brotli:  pip install fonttools Brotli
#
# Ranges. Display faces (Sinistre, Ilisarniq) render English headlines/body:
# Basic Latin + Latin-1 (covers ×) + the dashes/curly-quotes/bullet/ellipsis we
# typeset. The mono (Commit Mono) backs a user-editable textarea AND the nav
# arrows, so it adds U+2190–2193; keep it at least Latin-1 so pasted European
# text doesn't tofu. Widen a range here rather than hand-editing call sites.
set -euo pipefail
cd "$(dirname "$0")/.."

DISPLAY="U+0020-007E,U+00A0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026"
MONO="$DISPLAY,U+2190-2193"
FEATURES='*' # keep kerning/ligatures

sub() { # in out unicodes
  pyftsubset "$1" --output-file="$2" --flavor=woff2 --layout-features="$FEATURES" --unicodes="$3"
  printf "%6.1f KB  %s\n" "$(( $(stat -f%z "$2") ))e-3" "$2"
}

sub fonts-src/sinistre/SinistreVF.woff2 public/fonts/sinistre/SinistreVF.woff2 "$DISPLAY"
sub fonts-src/Ilisarniq-Demi.otf        public/fonts/Ilisarniq-Demi.woff2       "$DISPLAY"
sub fonts-src/CommitMono-Regular.woff2  public/fonts/CommitMono-Regular.woff2   "$MONO"
