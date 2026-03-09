# CLAUDE.md - 5th Revolution Website

## Overview

Production website for **5th Revolution** (https://5threvolution.com), an enterprise architecture consulting agency specializing in Adobe Experience Cloud. Built on NimbusEdge CMS with Bootstrap 5.3, GSAP animations, and a Gulp build pipeline.

**Business repo:** `~/Projects/5revolution/` (business planning, brand assets, competitor research, content operations)

## Architecture

### CMS: NimbusEdge

NimbusEdge is a component-based CMS. Pages are authored as HTML fragments in Google Docs, and the CMS discovers components, loads their CSS/JS, and calls their default exports to decorate the DOM.

- **core.js**: CMS infrastructure. Discovers components, loads CSS/JS, calls default exports. Never modify.
- **app.js**: Site gateway. Re-exports core.js (`export * from './core.js'`), adds site config, navigation, analytics, brand animation. Components always import from app.js, never core.js.
- **Component JS**: "Decorations" that receive a single DOM element, enhance it with Bootstrap 5.3 structure (wrappers, classes, CSS), and call `markLoaded()`.
- **Single entry point**: Only `<script type="module" src="/scripts/app.js"></script>` in HTML. No individual component scripts.

### The `.ignore/` Pattern

Source files live in `.ignore/` subdirectories. Gulp compiles them to parent directories. **Never edit compiled files** -- only edit source in `.ignore/`.

```
├── scripts/.ignore/          <- Source JS (app.js, core.js, gsap.js, lenis.js, etc.)
├── scripts/                  <- Compiled JS (uglified)
├── styles/.ignore/           <- Source SCSS (_variables.scss, main.scss, lazy.scss)
├── styles/                   <- Compiled CSS (minified)
├── components/{name}/.ignore/ <- Component source (JS + SCSS)
├── components/{name}/        <- Compiled component output
├── fonts/                    <- WOFF2 web fonts (Satoshi)
├── icons/                    <- SVG icons
└── gulpfile.js               <- Build config
```

Both source and compiled output are tracked in git since the repo is served directly.

### Build Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Production build (no sourcemaps) |
| `npm run dev` | Development build (with sourcemaps) |
| `npm run watch` | Dev build + file watcher |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run verify` | Lint + build combined |
| `nimbusedge-local start` | Dev server at localhost:3000 |

**Always run `npm run build` after editing source files** to compile before committing.

### Dependencies

- **Bootstrap 5.3** -- Grid, components, utilities (SCSS, not CDN)
- **GSAP 3** -- ScrollTrigger, brand animation
- **Lenis** -- Smooth scroll (desktop only)
- **Sass** -- SCSS compilation
- **Gulp** -- Build orchestration

## Components

11 components in `components/`. Each has a `.ignore/` dir with source JS + SCSS.

| Component | Purpose |
|-----------|---------|
| **nav** | Bootstrap 5 navbar, dark/light variant, SVG logo (hardcoded), brand animation |
| **hero** | Full-height hero, `.hero-logo` variant adds rotating background SVG + grid |
| **heading** | Section headers: `.labeled`, `.aligned-center`, `.aligned-left` |
| **cards** | Card grid: `.numbered`, `.md-6`, `.lg-4`, `.cta-arrow` |
| **list** | Multi-variant: `.bullets`, `.card-dark .two-col`, `.card-transparent .four-col`, `.numbered .grid-3` |
| **footer-brand** | Footer brand column with SVG logo, creates shared container/row |
| **columns** | Generic multi-column, `.append` merges into previous sibling, `.copyright` variant |
| **form** | Contact/lead forms, JSON-driven fields, reCAPTCHA v3, Google Apps Script submission. Requires hydration for prerendered pages. |
| **listings** | Content listings (insights index) |
| **modals** | Modal dialogs |
| **callout** | Callout blocks |

### The `.append` Pattern

Components with class `.append` merge their content into the previous sibling's container/row, then remove themselves from the DOM. Used for multi-component sections (e.g., footer-brand + columns).

### Prerendered Component Hydration

NimbusEdge prerenders pages, so components arrive with `data-status="loaded"` already set. Core.js skips these entirely — no JS is loaded or executed for them. Components that need event listeners (e.g., form submit handlers) must be **hydrated from app.js's delayed section** (after Phase 7). Pattern:

1. Export a `hydrateXxx()` function from the component JS
2. In `SiteOrchestrator.init()`, query for pre-rendered instances and dynamically import + call the hydrate function

See `form.js` (`hydrateForm`) and app.js Phase 7b for the reference implementation.

## CSS Loading Strategy (FOUC Prevention)

Three CSS tiers prevent flash of unstyled content:

1. **main.css** (render-blocking): Bootstrap root/reboot/grid/containers/buttons, fonts, sections, scroll animations, above-fold button styles (btn, btn-primary, btn-lg, btn-link)
2. **Component CSS** (Phase 0, per-component): nav.scss imports Bootstrap nav+navbar+fixed-top+collapse; hero.scss owns vh-100 height
3. **lazy.css** (deferred, Phase 7): Remaining Bootstrap modules (forms, cards, modals, transitions, utilities/api), outline button variants

**Rule:** Anything visible above the fold must NOT depend on lazy.css. Move it to main.scss or the relevant component SCSS.

## Theme (Bootstrap SCSS Variables)

All theming uses Bootstrap SCSS variables in `styles/.ignore/_variables.scss`. No separate `:root` CSS custom properties.

```scss
$primary:       #0f172a;  // Slate
$secondary:     #64748b;  // Muted
$accent-warm:   #f59e0b;  // Amber (CTAs, sparingly)
$darkBlue:      #0f172a;  // Dark backgrounds
$subtleWhite:   #fafafa;  // Off-White backgrounds
$subtleGray:    #e2e8f0;  // Borders, dividers

$font-family-base: "Satoshi", -apple-system, BlinkMacSystemFont, sans-serif;
$headings-font-weight: 700;
$font-size-base: 1.125rem;
```

## Scroll Animation Architecture

- **Desktop:** GSAP ScrollTrigger + Lenis smooth scroll (synced via `lenis.on('scroll', ScrollTrigger.update)`)
- **Touch devices:** IntersectionObserver triggers + native scroll (no Lenis, no ScrollTrigger)
- **Detection:** `html.touch-device` class via `navigator.maxTouchPoints > 0` (set in `SiteOrchestrator.init()`)
- **Helper methods:** `animateOnScroll()`, `timelineOnScroll()` auto-branch based on touch detection
- **Why IO on touch:** ScrollTrigger adds non-passive touch listeners, causing iOS Safari to stall the first swipe per direction

## Brand Animation (Navbar)

GSAP-powered logo animation on first visit. Session-tracked so return visits skip the animation entirely (session check runs before GSAP loads).

- Production implementation: `scripts/.ignore/app.js` (`playNavbarAnimation()`)
- Dark hero pages: `data-navbar-start="dark"` + `navbar-dark` class
- Light pages: `data-navbar-start="light"` (no `navbar-dark` class)

## Git Conventions

- Do NOT include "Co-Authored-By" lines in commit messages
- Short, descriptive commit messages (see git log for style)
- Commit both source and compiled output (repo is served directly)

## Key References (in business repo)

| Document | Location |
|----------|----------|
| Brand guidelines | `~/Projects/5revolution/brand/brand-assets/brand-guidelines.md` |
| Website mockups | `~/Projects/5revolution/website/mockups/` |
| CMS guide | `~/Projects/5revolution/website/docs/NIMBUSEDGE-CMS-GUIDE.md` |
| Content architecture | `~/Projects/5revolution/website-plan/content-architecture.md` |
