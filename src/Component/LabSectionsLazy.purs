module Component.LabSectionsLazy (labSectionsLazy) where

import Prelude

import Component.LabSections (LabDeps)
import Component.Lazy (LazyComponent, lazyComponent, onVisiblePx, renderLazy)
import Effect (Effect)
import Promise (Promise)
import React.Basic (JSX, fragment)

-- The five lab spreads sit at the very bottom of the magazine — eight screens
-- below the fold — so their compiled JSX has no business in the first paint.
-- They are pulled through a dynamic import() behind a Suspense boundary, gated
-- on visibility: the chunk only loads once the reader scrolls within ~1500px of
-- where the spreads begin. The host page injects its eyebrow + folio as deps.
labSectionsLazy :: LabDeps -> JSX
labSectionsLazy deps = renderLazy labLazy \build -> fragment (build deps)

labLazy :: LazyComponent (LabDeps -> Array JSX)
labLazy = lazyComponent
  { name: "LabSections"
  , gate: onVisiblePx 1500.0
  , fallback: mempty
  , load: importLabSectionsImpl
  }

-- Dynamic import of the compiled LabSections module, resolving to labSpreads.
-- Not a static import, so the lab spreads only enter this async chunk.
foreign import importLabSectionsImpl :: Effect (Promise (LabDeps -> Array JSX))
