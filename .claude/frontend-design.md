---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

---

## 5th Revolution - Brand & Site Context

### About the Business
**5th Revolution** is an elite enterprise architecture consulting agency founded by Chris Carter. The agency fills the implementation gap for Adobe Experience Cloud - enterprises invest millions but struggle to activate it and deliver real value. Chris bridges strategy and execution with Fortune 100-proven expertise.

**Domain:** https://5threvolution.com | Email: chris.carter@5threvolution.com
**Redirects:** 5revolution.ai → 5threvolution.com
**Infrastructure:** 5revolution.io — dedicated tech/hardware domain hosting all built applications including email

**Important framing:** 5th Revolution is an agency led by Chris's expertise, not a one-man-band. The site should convey "agency led by a proven leader" -- credibility comes from Chris's background, but the brand is the agency, not a personal portfolio.

### Brand Positioning
- **Elite, not commodity.** This is not a freelancer portfolio. This is a premium consulting agency led by someone who led Adobe's customer-facing enterprise architecture team — guiding their Fortune 100 clients from conception through delivery.
- **Fortune 100 credibility.** T-Mobile, Verizon, Bank of America, Truist, Disney, Starbucks, American Airlines.
- **Technical depth with business acumen.** Strategy AND execution. Not one or the other.
- **No agency overhead.** Fortune 100 expertise without paying for layers of account managers and junior consultants.

### Target Audience
- VP/C-level decision-makers at mid-market to enterprise companies ($500M+ revenue)
- Adobe Account Directors looking for trusted implementation partners
- Technical leaders evaluating Adobe Experience Cloud activation
- Industries: Telecom, Financial Services, Travel & Hospitality, Media, Retail, Healthcare

### Brand Tone & Voice
- **Confident, not arrogant.** Expertise speaks for itself.
- **Direct, not salesy.** Clear value proposition without hype.
- **Sophisticated, not corporate.** Premium feel without being stuffy.
- **Authoritative.** This person led teams at Adobe for Fortune 100 brands. That's the credibility.

### Design Direction

**IMPORTANT:** See `/brand/brand-assets/brand-guidelines.md` for complete, finalized brand specifications.

#### Logo: Open Star (The Wheel)
- 5 V shapes, each rotated 72° forming a radial wheel pattern
- V = Roman numeral for 5; rotation = revolution
- AI-aesthetic: geometric, simple (inspired by Claude, Perplexity logos)
- Logo files in `/brand/brand-assets/`
- Animated logo: `/brand/brand-assets/logo-animation.html` (GSAP)
- Logo lockup reference: `/brand/brand-assets/logo-lockup.html`

#### Colors (Finalized)
- **Slate:** `#0f172a` — Primary (logo, text, dark backgrounds)
- **Amber:** `#f59e0b` — Accent (CTAs, highlights — use sparingly)
- **Off-White:** `#fafafa` — Page backgrounds
- **Text:** `#1e293b` — Body text
- **Light Gray:** `#e2e8f0` — Borders, dividers
- **Muted:** `#64748b` — Secondary text, taglines (Bootstrap `$secondary`)

#### Typography (Finalized)
- **Font:** Satoshi (from Fontshare, free commercial use)
- **Import:** `@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,900&display=swap');`
- Headlines: 700/900 weight
- Body: 400 weight
- Buttons: 600 weight

#### Aesthetic
- **Target:** Stripe-like precision, AI-world geometric simplicity
- **NOT:** Generic SaaS, purple gradients, stock photos, template agency
- **Imagery:** Minimal or none; if used, geometric/architectural
- **Motion:** Deliberate, refined. Smooth easing. Nothing bouncy.

#### Logo Animation (GSAP)
The animated logo features 5 Vs spiraling out from center to form the wheel, then rotating:
- **Spiral phase:** 0.7s duration, 90° rotation, `power1.in` easing
- **Circle phase:** 150°/s velocity, `power1.out` easing
- **Stagger delay:** 0.25s between each V
- **Wheel rotation:** 216° (3x72°) over 1.8s, `power2.out` easing — starts 0.5s before Vs finish (`allDoneTime - 0.5`)
- **Text reveal:** 0.6s after Vs finish (`allDoneTime + 0.6`)
- **Brand shrink:** 0.6s duration, starts 0.3s after text reveal (`allDoneTime + 0.6 + 0.3`)
- **Mobile toggler fade-in:** 0.4s fade, `power2.out`, starts after brand shrink completes (`allDoneTime + 0.6 + 0.3 + 0.5`)
- **Total duration:** ~4s
- See `/brand/brand-assets/logo-animation.html` for implementation

#### Navbar Brand Animation (Required on All Pages)
All website pages must include the session-based navbar brand animation. This plays once per browser session on the user's first page visit.

**Behavior:**
- **First visit:** Brand scales to 2x, logo spiral animates, text reveals left-to-right, then scales back to 1x
- **Return visits (same session):** Final state appears immediately (no animation)
- Uses `sessionStorage` key `navbar_animated` to track state

**CMS Integration:**
In the CMS architecture, the navbar brand animation lives in `app.js` (not in the nav component JS), because:
- GSAP is a site-level dependency loaded after Bootstrap JS
- `sessionStorage` management is site-level behavior
- The animation runs after the nav component calls `markLoaded()`

The nav component (in `components/nav/.ignore/nav.js`) is responsible for:
1. Transforming the CMS HTML into the Bootstrap navbar structure
2. Including the SVG logo with the required class names and data attributes
3. Calling `markLoaded()` — which triggers the animation in app.js

The animation script in `app.js` should:
1. For prerendered pages: call `playNavbarAnimation()` immediately (return visits show brand instantly, no GSAP needed)
2. For dynamic pages: wait for the nav's `component:loaded` event, then call `playNavbarAnimation()`
3. Fallback: call again after vendor libraries load (catches first visits where GSAP wasn't ready)
4. Skip animation during prerendering (`document.body.classList.contains('optimize')`)

**Required HTML structure** (produced by nav component JS):
```html
<a class="navbar-brand" href="index.html" id="navbarBrand">
  <svg class="logo-mark" id="navbarLogo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g class="navbar-wheel-group" transform="translate(60,60)">
      <g class="navbar-v-group" data-index="0">
        <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
      </g>
      <g class="navbar-v-group" data-index="1">
        <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
      </g>
      <g class="navbar-v-group" data-index="2">
        <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
      </g>
      <g class="navbar-v-group" data-index="3">
        <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
      </g>
      <g class="navbar-v-group" data-index="4">
        <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
      </g>
    </g>
  </svg>
  <span class="navbar-brand-text" id="navbarBrandText">5th Revolution</span>
</a>
```

**Reference:** The production animation implementation is in `/website/main/scripts/.ignore/app.js` (the `playNavbarAnimation()` function — GSAP timeline with spiral, circle, wheel rotation, and text reveal phases). Static mockups in `/website/mockups/` (9 files: index, about, contact, services, insights/index, plus 4 service sub-pages: enterprise-architecture, aep-activation, migration, adobe-advisory) contain an older copy of the animation for reference.

**CSS classes used by the animation** (define in nav component SCSS or `main.scss`):
- `.visible` — Shows the brand (opacity: 1)
- `.revealed` — Triggers clip-path text reveal animation (0.8s ease-out)
- `.revealed-instant` — Shows text immediately with `clip-path: inset(0)` (no animation, return visits)

#### Brand File Structure
```
/brand/
├── brand-assets/           (finalized assets)
│   ├── brand-guidelines.md
│   ├── logo-animation.html
│   ├── logo-animation-plan.md
│   ├── logo-lockup.html
│   └── *.svg (logo files)
└── brand-exploration/      (working files)
```

### Core Messaging

**Tagline (Finalized):**
"The Adobe Vision, Delivered"

**Elevator Pitch:**
"Organizations invest millions in Adobe Experience Cloud but struggle to activate it. We bridge that gap - as both practitioners who build solutions AND leaders who shape strategy. Over two decades solving this for Fortune 100 brands."

**Value Propositions:**
1. Led Adobe's customer-facing enterprise architecture team — guiding clients from conception through delivery (not worked for agencies - at the vendor)
2. Fortune 100 client portfolio (T-Mobile, BofA, Disney, Starbucks, AA)
3. AEP adoption specialist (cutting-edge, high-demand, limited supply)
4. Full-stack Experience Cloud (10+ products, most consultants know one)
5. No agency overhead (Fortune 100 expertise, direct access to the architect)
6. No handoff (the architect who designs your solution builds it)

**Technical Depth (NOT just high-level platform talk):**
Chris has hands-on, deep expertise across BOTH traditional Adobe applications AND next-generation platform services:

*Traditional / Legacy Applications:*
- Adobe Analytics (AA) - business and technical implementation
- Adobe Target (AT) - business and technical
- Adobe Launch / Data Collection - extensive data layer and tagging expertise
- Adobe Campaign (ACC v7 & v8)
- Adobe Experience Manager (AEM)

*Next-Generation Platform Services (AEP):*
- Adobe Experience Platform (AEP) - the foundation
- Real-Time Customer Data Platform (RTCDP) - unified customer profiles
- Adobe Journey Optimizer (AJO) - orchestrated journeys
- Customer Journey Analytics (CJA) - cross-channel analytics

*AI Agents on AEP (key messaging angle — AEP as AI readiness):*
Adobe is building purpose-built AI Agents on the platform, orchestrated through Agent Orchestrator. These require AEP as the foundation — most enterprises on legacy apps can't access them. This is a compelling urgency driver for AEP adoption.
- Agent Orchestrator — agentic reasoning layer coordinating all agents via natural language in AI Assistant
- Audience Agent — explore, create, manage audience segments conversationally (RTCDP, AJO)
- Data Insights Agent — natural language data questions with auto-generated visualizations in CJA Analysis Workspace
- Experimentation Agent — summarize experiment results, analyze winning content, recommend next experiments (AJO, Adobe Target)
- Journey Agent — create, analyze, optimize journeys in AJO via natural language (including fallout analysis, conflict detection, journey creation)
- Product Support Agent — self-serve debugging/troubleshooting across AEP, RTCDP, AJO, CJA, AEM
- Chris has hands-on experience with these agents and can guide enterprises through AI readiness on AEP

*Additional AI-Driven Adobe Products:*
- AEM Sites Optimizer — cloud-based service that analyzes and optimizes AEM Sites performance (page loading, component usage, content delivery) with prescriptive recommendations
- Adobe LLM Optimizer — Generative Engine Optimization (GEO) product that helps brands monitor and improve their visibility and accuracy in AI-driven search (ChatGPT, Perplexity, etc.). Net-new product category with almost zero existing agency expertise. Prescriptive content recommendations, automated edge optimization, brand share-of-voice tracking in AI search results.

*The Migration Bridge (key differentiator):*
Chris doesn't just know the products individually -- he has direct experience integrating and migrating enterprises from legacy to next-gen (e.g., Adobe Analytics to CJA, Campaign v7 to v8, traditional legacy collection code data collection to AEP Web SDK). Most consultants blanket everything under "AEP" or "Experience Cloud" at a high level. Chris actually understands the technical details of each product, how they connect, and how to move enterprises from old to new.

**Site Framing Note:** Present Chris's experience as the agency's founding expertise and leadership credential, NOT as a solo practitioner resume. The site should read as "an agency built on this depth of expertise" rather than "hire this individual." Use language like "our team," "we bring," "led by" rather than "I do."

### Site Architecture

**Pages & Navigation:**

1. **Home** - Hero with tagline, problem statement, credibility proof (Fortune 100 text references from Chris's background — no client logos), high-level services, CTA
2. **Services** - Adobe Experience Cloud expertise breakdown:
   - Enterprise Architecture & Strategy
   - AEP Platform Services (RTCDP, AJO, CJA) - Implementation & Migration
   - Legacy-to-Next-Gen Migration (Analytics→CJA, Campaign v7→v8, legacy collection code→AEP Web SDK)
   - Adobe Experience Manager (AEM)
   - Data Collection & Integration (Launch, Web SDK, data layer architecture)
   - Full Experience Cloud Integration (10+ products working together)
   - Commercial Advisory (right products, right terms, maximum value)
   - Digital Transformation
3. **About** - Chris Carter's background, the "why" behind 5th Revolution, credentials, Adobe experience
4. **Case Studies** (future) - Template pages for documenting client wins
5. **Insights/Blog** (future) - Thought leadership content
6. **Contact** - Clean contact form, professional inquiry

**Navigation:** Clean, minimal. Logo left, nav right. Consider a subtle sticky header.

### Technical Requirements
- Self-hosted (Chris manages his own infrastructure at $20/month)
- Static HTML/CSS/JS preferred (fast, simple to host, no dependencies)
- Responsive (mobile-first)
- Fast load times (enterprise audience expects performance)
- SEO-optimized
- Accessible (WCAG 2.1 AA)
- No heavy frameworks unless justified

### Adobe Products Referenced
When mentioning Adobe capabilities, use these product names accurately:
- Adobe Experience Platform (AEP)
- Real-Time Customer Data Platform (RTCDP)
- Adobe Journey Optimizer (AJO)
- Customer Journey Analytics (CJA)
- Adobe Experience Manager (AEM)
- Adobe Target (AT)
- Adobe Analytics (AA)
- Adobe Campaign (ACC v7 & v8)
- Adobe Workfront
- Adobe Launch/Data Collection

### Competitor Research Notes (January 2026)

Full detailed reports in `/competitor-research/` directory (bounteous-full-review.md, tapcxm-full-review.md, adswerve-full-review.md). Key design-relevant findings below.

**Key Insight:** No competitor focuses exclusively on Adobe. They all spread across Google, Salesforce, AWS, Acquia, etc. 5th Revolution's Adobe-only focus is a genuine differentiator. Can reference complementary tools (Snowflake, Kafka, data warehouses, data pipelines, CICD) but never competing products.

**Critical Finding:** Even the 2025 Adobe Solution Partner of the Year (Adswerve) specializes in CJA/Adobe Analytics -- NOT AEP/RTCDP/AJO enterprise architecture. The platform layer that Chris owns is genuinely unoccupied territory.

#### Bounteous (bounteous.com) - Large Agency (5,000 employees)
- **Positioning:** "Innovation. Intelligence. Impact." / "Co-Innovation" branded methodology
- **Visual:** Dark purple/magenta gradient hero with particle/light effects. White text. Animated video headers. Logo carousel of enterprise clients (Chase, Coca-Cola, CVS, PetSmart). Heavy use of animation.
- **Navigation:** What We Do (8 services), Industries We Serve (10 industries), Our Work, Thought Leadership, Who We Are + Contact Us CTA
- **Messaging:** Generic "digital transformation" language. AI-heavy. "Co-Innovation" is their core differentiator but it's about partnership process, not technical execution.
- **Adobe Relationship:** Gold Partner, 145+ certifications, 8 specializations. "Activate" offering packages AEP/AEM/Commerce/Campaign. Co-authored Adobe cert exams for RTCDP, AJO, AEM.
- **Partners:** 40+ technology partners (Adobe, AWS, Microsoft, Google, Salesforce, Acquia, Snowflake, Anthropic, and dozens more)
- **Services:** 8 broad categories (AI, Experience Design, Platform Engineering, Digital Transformation, Data & Analytics, Cloud, Marketing Activation, Commerce)
- **Content Architecture:** Service pages use consistent template (hero > stats banner > offerings accordion > partner logos > industry tabs > case study cards > thought leadership > CTA). Case studies page filterable by industry and platform. Insights page with articles/whitepapers/webinars.
- **What works:** Enterprise client logos build credibility. Industry-specific content. Consistent page templates. Active thought leadership (3-5 pieces/month). Gartner recognition.
- **What doesn't:** Generic agency site. Purple gradient is cliche. "Co-Innovation" feels like buzzword. 40+ partners means no depth. No named Adobe architects or practitioners -- the site is corporate and anonymous.
- **Opportunity for 5th Revolution:** Breadth is their weakness. No named experts. Their "Activate" packaging is still generic. 5th Revolution can own "Adobe-only, architect-led, Fortune 100-proven."

#### Tap CXM (tapcxm.com) - Boutique CXM Consultancy (UK-based)
- **Positioning:** "Enabling Valuable, Connected Customer Experiences" / "Transformative CXM Consulting"
- **Visual:** Light mint/teal/purple gradient watercolor blobs. Clean white sections. Card-based layouts. Professional photography.
- **Navigation:** What we do (5 service pillars), Why Tap CXM?, Insights, Success Stories + Get in touch CTA
- **Messaging:** "We embed strategic and technical expertise into your marketing team" - embedded/augmentation model. "Tech-agnostic expertise -- we're not here to sell software licenses."
- **Services:** 5 clear pillars: Understand, Deliver, Connect, Measure, Manage. Each has dedicated page with consistent template.
- **Technology Partners:** 10 platforms (Adobe, Salesforce, Braze, Bloomreach, Apteco, Eloqua, HubSpot, Imagino, Iterable, Zeta) -- Adobe is 1 of 10
- **Clients:** McDonald's, TUI, The Guardian, Virgin Australia, Specsavers, Pandora, Cancer Research UK, Allianz, Energia, giffgaff -- mostly UK/European
- **Engagement Models:** "Do it yourself" / "Do it together" / "Do it for you"
- **Content Architecture:** Service pages follow strict template (hero > success story callout > main content > benefits x3 > testimonial > tech partner logos > related stories x3 > sibling service links > articles x2 > footer). Homepage has rotating service slider + success story carousel. Contact form embedded on homepage.
- **What works:** Clear 5-pillar taxonomy with cross-linking. Named client testimonials with real titles on every page. Flexible engagement models. Statistics-backed claims. B Corp certified. Podcast ("The CX Equation").
- **What doesn't:** Pastel gradients feel trendy/generic. UK-centric (weak US presence, only 1 anonymized US case study). 10 platforms = shallow depth on each. "Why Tap CXM?" nav link returns 404.
- **Opportunity for 5th Revolution:** Platform-agnostic positioning is the opposite of 5th Revolution's Adobe-only depth. UK-centric = weak in US enterprise market. No disclosed internal Adobe experience.

#### Adswerve (adswerve.com) - Data/Media/Tech Consultancy (250+ people, Denver)
- **Positioning:** "We make your data do more" / "Move fearlessly forward"
- **Visual:** Bold hot magenta/pink as primary accent on white. Black text. Geometric line art circles/arcs. Clean, high-contrast. Most distinctive visual identity of the three.
- **Navigation:** Data, Media & AI (4 service pages); Who We Serve (Brands, Agencies, Case Studies); Tech Partners (Google, Adobe, All); Insights; About Us + Client portal + Get In Touch CTA
- **Messaging:** Confident, direct. "Digital marketing changes by the second. We help you unlock opportunity at every moment." Data-centric language throughout.
- **Adobe Relationship:** 2024 & 2025 Adobe Solution Partner of the Year. 65 Adobe certifications. **But their Adobe specialization is explicitly in Customer Journey Analytics and Adobe Analytics** -- the analytics layer, NOT AEP/RTCDP/AJO. Adobe case studies are mid-market analytics implementations (Cedars-Sinai, unnamed tile retailer, unnamed tech provider). None are Fortune 100.
- **Google Relationship:** #1 Google Marketing Partner in US, 170+ GMP certifications. Google is clearly primary.
- **Services:** 4 categories: Consulting & Licensing, Measurement & Insights, Media Strategy & Activation, AI Solutions. Branded AI products: CreateAi, TrendsAi, AlignAi. Proprietary platform: Adswerve Connect (used by 80K advertisers).
- **Stats:** 800+ brands/agencies, 45+ Fortune 500, 87% renewal rate, 250+ experts, 15K advertisers trained, $1B ad spend managed
- **Clients:** Alaska Airlines, World Surf League, Six Flags, Cedars-Sinai, Redfin, GoFundMe, Condé Nast, Stitch Fix, AutoNation, Chili's, TOMS
- **Content Architecture:** Homepage flows: hero > "How we work" 4 service cards > Google/Adobe partnership section with stats > tech solution logos > impact stats > case study with metrics > client logo ticker > results callout > testimonial > team section > Adswerve Connect > blog cards > CTA. Service pages use tab navigation across all 4 services.
- **What works:** Boldest visual design. Stats/proof points everywhere. Case studies with real metrics (+30% ROAS, +108% conversions for Alaska Airlines). CEO testimonial. Employee video content. "Client portal" signals maturity. Branded AI products show innovation. Tab-based service navigation is clean.
- **What doesn't:** Google-first, Adobe-second identity despite winning Adobe Partner of the Year. Hot pink is distinctive but aggressive. Media/advertising focus dilutes enterprise architecture positioning. 65 Adobe certs across 250 people is modest. "Enterprise architecture" never appears on their site.
- **Opportunity for 5th Revolution:** Adswerve's Adobe expertise is analytics-layer, not platform-layer. They don't claim AEP/RTCDP/AJO specialization. Their clients are mid-market, not Fortune 100. They never use "enterprise architecture." This is 5th Revolution's unique space.

#### Design Implications for 5th Revolution

**Colors to Avoid (Competitor-Owned):**
- Purple/magenta gradients (Bounteous)
- Mint/teal/purple pastels (Tap CXM)
- Hot magenta/pink (Adswerve)

**Do Instead:**
- Sophisticated palette that reads as premium consulting, not agency/tech
- Consider: deep navy + warm accent, charcoal + gold, dark slate + copper, or an unexpected refined combination
- Dark, confident base with a sharp accent color

**Content Architecture Lessons:**
1. Competitors use 4-8 service categories. 5th Revolution should use 5-6 focused services (Enterprise Architecture, AEP/RTCDP, AEM, Full Experience Cloud, Commercial Advisory, Digital Transformation)
2. Competitors put client logos on the homepage hero area -- 5th Revolution should NOT use client logos (those are Adobe's clients, not the agency's). Instead, reference companies by name in text as part of Chris's professional background, and reference Fortune 100 industries and scale.
3. Testimonials with named contacts and real titles appear on every competitor service page -- plan for this (from future 5th Revolution clients, not Adobe-era clients)
4. Stats/proof points (years experience, clients served, implementations delivered) should be prominent
5. Case studies with real metrics drive credibility (Adswerve's "+30% ROAS" format works)
6. Thought leadership/insights section signals authority -- plan for blog/insights even if launching later

**Messaging Differentiation:**
- Lead with vendor-side credibility ("Led Adobe's customer-facing enterprise architecture team") -- no competitor can claim this
- Use "enterprise architecture" language -- literally nobody else does
- Be specific: "AEP, RTCDP, AJO, CJA" not just "Adobe Experience Cloud"
- Direct, confident tone: "Turn your Adobe investment into real results" not "Co-Innovation" or "Move fearlessly forward"
- Name the Fortune 100 clients (industries at minimum) -- competitors anonymize theirs

**Layout & Typography:**
- All three competitors use conventional scrolling pages with similar templates
- 5th Revolution should feel more editorial/magazine-like with confident use of space and asymmetry
- Distinctive display font for headlines (competitors all use clean sans-serifs)
- Less is more: fewer sections executed with precision beats competitor template bloat

**Navigation Lessons:**
- Keep nav to 4-5 items max (competitors with 5+ nav items feel cluttered)
- Suggested: Services, About, Insights (future), Contact -- simple and premium
- "Get in touch" / "Start a conversation" as persistent CTA

---

## NimbusEdge CMS Development

The 5th Revolution website is built on **NimbusEdge CMS**. This section covers everything needed to develop components, configure the site theme, and manage the build pipeline. For the complete reference, see `website/docs/NIMBUSEDGE-CMS-GUIDE.md`.

### Architecture: Three Layers

```
┌─────────────────────────────────────────────────┐
│  app.js  (site-specific)                        │
│  Config, navigation, analytics, event handlers  │
├─────────────────────────────────────────────────┤
│  core.js  (CMS — never modify)                  │
│  Orchestration, utilities, image optimization    │
├─────────────────────────────────────────────────┤
│  Component JS  (decorations)                    │
│  Enhance CMS HTML with Bootstrap 5.3 structure  │
└─────────────────────────────────────────────────┘
```

- **core.js**: CMS infrastructure — discovers components, loads CSS/JS, calls default exports. Never modify.
- **app.js**: Site gateway — re-exports core.js (`export * from './core.js'`), adds site config, navigation, analytics. Components always import from app.js, never core.js.
- **Component JS**: "Decorations" — each receives a single DOM element, enhances it with Bootstrap 5.3 structure (wrappers, classes, CSS), and calls `markLoaded()`. See "Enhance, Don't Rebuild" below.

**Single entry point**: Only `<script type="module" src="/scripts/app.js"></script>` in HTML. No individual component scripts.

### Project Structure

```
website/main/
├── scripts/.ignore/       ← app.js, core.js (source)
├── styles/.ignore/        ← _variables.scss, main.scss, lazy.scss (source)
├── components/{name}/.ignore/  ← Component JS + SCSS (source)
├── fonts/                 ← WOFF2 web fonts (Satoshi)
├── icons/                 ← SVG icons
└── gulpfile.js            ← Build config
```

**The `.ignore/` pattern**: Source files live in `.ignore/` subdirectories. `gulp` compiles them to parent directories. Never edit compiled files.

### Build Commands

| Command | Purpose |
|---------|---------|
| `gulp` | Production build (no sourcemaps) |
| `gulp dev` | Development build (with sourcemaps) |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run verify` | Lint + build combined |
| `nimbusedge-local start` | Dev server at localhost:3000 |

### 5th Revolution Theme Configuration

Map the brand to Bootstrap SCSS variables in `styles/.ignore/_variables.scss`. **Use Bootstrap SCSS variables exclusively** — no separate `:root` CSS custom properties. Bootstrap's utility API and `map-merge` generate all needed CSS vars automatically.

```scss
// Brand → Bootstrap
$primary:       #0f172a;  // Slate
$secondary:     #64748b;  // Muted
$accent-warm:   #f59e0b;  // Amber (CTAs, sparingly)
$darkBlue:      #0f172a;  // Dark backgrounds
$subtleWhite:   #fafafa;  // Off-White backgrounds
$subtleGray:    #e2e8f0;  // Borders, dividers

// Typography — Satoshi for everything
$font-family-base: "Satoshi", -apple-system, BlinkMacSystemFont, sans-serif;
$headings-font-family: "Satoshi", -apple-system, BlinkMacSystemFont, sans-serif;
$headings-font-weight: 700;
$font-size-base: 1.125rem;

// Custom colors added to Bootstrap's theme map
$custom-colors: (
  "offwhite": $subtleWhite,
  "offgray": $subtleGray,
  "darkblue": $darkBlue,
  "amber": $accent-warm
);
$theme-colors: map-merge($theme-colors, $custom-colors);
```

**Important**: The mockup CSS uses `:root` custom properties (e.g., `--color-slate`). In the CMS build, these are replaced by Bootstrap's auto-generated CSS vars (e.g., `--bs-primary`) and SCSS vars (e.g., `$primary`). Component SCSS should use `$primary`, `$accent-warm`, etc. directly.

### CSS Architecture

- **main.scss** (critical): Bootstrap root/reboot/grid/buttons, Satoshi font-face declarations, component visibility, scroll animations, **section-level styles** (`.section-dark`, `.section-alt`, `.hero`, `.hero-page`, `.cta-block`), **above-fold button styles** (`.btn`, `.btn-primary`, `.btn-lg`, `.btn-link`). Loads in `<head>`.
- **lazy.scss** (deferred): Bootstrap forms, cards, modals, transitions, utilities API, remaining button variants (`.btn-outline-dark`, `.btn-outline-light`). Loads non-blocking after critical components.
- **Component SCSS**: Per-component styles in `components/{name}/.ignore/{name}.scss`. Import `_variables` to access theme tokens. Components may import Bootstrap modules directly when needed to prevent FOUC (e.g., nav.scss imports Bootstrap nav/navbar).

**FOUC prevention strategy:** Any Bootstrap module or custom style needed above the fold should be in main.scss or the relevant component SCSS — not in lazy.scss. Currently:
- Bootstrap **nav + navbar** → nav component SCSS (with `.fixed-top`, `.collapse:not(.show)`, nav utility classes)
- Bootstrap **buttons** + primary/lg/link overrides → main.scss
- Bootstrap **root/reboot/grid/containers** → main.scss
- Everything else → lazy.scss

**Section styles in main.scss** are critical because they control background colors and text colors for above-the-fold content. Without them, sections flash unstyled before lazy.css loads. Include these section classes in `main.scss`:

```scss
// Section backgrounds (must be in critical CSS)
.section-dark {
  background-color: $primary;
  color: $white;
  h1, h2, h3, h4 { color: $white; }
}
.section-alt {
  background-color: $white;
  border-top: 1px solid rgba($subtleGray, 0.6);
  border-bottom: 1px solid rgba($subtleGray, 0.6);
}
.hero { height: 100vh; min-height: 100vh; display: flex; align-items: center; }
.hero-page { padding-top: 8rem; padding-bottom: 5rem; }
.cta-block { background: $primary; color: $white; padding: 5rem 0; }
```

### Enhance, Don't Rebuild (Critical Principle)

Component JS must **preserve the original CMS HTML** and enhance it in place — wrapping elements with Bootstrap containers/rows/cols, adding classes, and letting CSS handle the visual design. **Never destroy the original DOM and reconstruct it from extracted pieces.**

**Why this matters:** When a component extracts specific elements (h2, paragraphs, pictures, links) and rebuilds the DOM from scratch, any content the author adds that the JS didn't anticipate gets silently dropped. A new paragraph, image, or link added in Google Docs simply won't appear because the component never picked it up. The CMS content should be the source of truth — components are decoration, not reconstruction.

**Do this:**
```javascript
// Wrap existing elements with Bootstrap grid structure
const container = createElement('div', ['container']);
const row = createElement('div', ['row']);
const col = createElement('div', ['col-lg-8']);

// Move the original content INTO wrappers (preserving order and all children)
while (component.firstChild) col.appendChild(component.firstChild);
row.appendChild(col);
container.appendChild(row);
component.appendChild(container);

// Add classes to existing elements
const h2 = component.querySelector('h2');
if (h2) h2.classList.add('display-5');

const subtitle = h2?.nextElementSibling;
if (subtitle?.tagName === 'P') subtitle.classList.add('text-muted');
```

**Don't do this:**
```javascript
// DON'T extract specific elements and rebuild
const h2 = row1Col?.querySelector('h2');
const paragraphs = [...row1Col.querySelectorAll(':scope > p')];
const picture = row1Col?.querySelector('picture');

// DON'T clear original content
while (component.firstChild) component.removeChild(component.firstChild);

// DON'T selectively re-add only recognized elements
const header = createElement('div', ['section-header']);
if (sectionLabel) { /* recreate label */ }
if (h2) header.appendChild(h2);
paragraphs.forEach(p => { /* classify and move */ });
// ← Any element the author added that isn't h2, p, or picture is now GONE
```

**Practical approach:**
1. **Wrap, don't extract** — Add container/row/col wrappers around existing content blocks
2. **Add classes to existing elements** — Use `classList.add()` on elements already in the DOM
3. **Use CSS for layout** — Let CSS selectors and combinators handle visual arrangement (`:first-child`, `:nth-child`, adjacent sibling `+`, etc.)
4. **Use `insertBefore`/`prepend`** — When you need to inject new elements (SVG icons, decorative markup), insert them alongside existing content rather than rebuilding from scratch
5. **Content-agnostic wrappers** — When splitting CMS rows into columns, move the entire row content as a block, don't cherry-pick individual elements

### Component Development Rules

**Every component is a single async default function:**

```javascript
export default async function initializeComponentName(component) {
  // Guard: skip if already loaded
  if (component.dataset.status === 'loaded') return;

  // Import utilities INSIDE the function (not module-level)
  const { createElement, markLoaded, createWrapper, processHeading }
    = await import('../../../scripts/app.js');

  // Transform HTML...
  createWrapper(component, 'componentname');
  const headingInfo = processHeading(component, 'componentname');
  // ... build Bootstrap 5.3 markup ...

  markLoaded(component, 'componentname');
}
```

**Critical rules:**
1. Only check `data-status === 'loaded'` — never check `'loading'` (causes race condition)
2. `await import()` must be inside the function, not at module level
3. Helper functions receive utilities as parameters (not via closure)
4. Components don't attach event handlers — app.js handles event delegation
5. Components don't discover themselves — core.js handles that

### Key Utilities (from core.js via app.js)

| Utility | Purpose |
|---------|---------|
| `createElement(tag, classes?, attrs?)` | Create DOM elements |
| `markLoaded(component, name)` | Set loaded status |
| `createWrapper(component, name)` | Wrapper div with `wrap-*` class transfer |
| `processHeading(component, name)` | Transform first row into heading |
| `processFooting(component, name)` | Transform last row into footing |
| `updatePicture(picture, breakpoints?, options?)` | Responsive image optimization |
| `$` / `$$` | querySelector / querySelectorAll shorthands |
| `jsonFetch(url)` | JSON data fetching |

### Two-Phase Loading

| Phase | What Loads | Strategy |
|-------|-----------|----------|
| Eager | Nav, `data-priority="critical"` | Sequential, immediate |
| Deferred | Everything else | Intersection observer (250px margin) |

After deferred: vendor libraries (GSAP, ScrollTrigger, Lenis), then Bootstrap JS, lazy.css, modal system load last. Brand animation runs at first opportunity (immediately for return visits, after GSAP for first visits).

**Return visit GSAP bypass:** The `playNavbarAnimation()` function checks `sessionStorage` BEFORE checking whether GSAP is loaded. On return visits (same session), the final state is applied immediately via `setNavbarFinalState()` and the function returns — GSAP is never loaded or invoked for brand animation on return visits.

### CMS Content Pipeline

Authors write in Google Docs → NimbusEdge converter → HTML with `<section>` elements and nested divs → Component JS enhances with Bootstrap 5.3 structure (wrappers + classes).

**Page content structure** (sections split by horizontal rules):
```html
<section class="hero section-dark">
  <div class="default-wrapper">
    <h1 id="heading-slug">Heading</h1>
    <p>Paragraph content</p>
  </div>
</section>
<section class="features">
  <div class="default-wrapper">
    <h2 id="subheading">Subheading</h2>
    <p>More content</p>
  </div>
</section>
```

**Body classes** are auto-generated from the URL path:
- `/index.html` → `<body class="index">`
- `/services/enterprise-architecture.html` → `<body class="services services__enterprise-architecture">`
- `/about.html` → `<body class="about">`

This enables page-specific or directory-specific CSS (e.g., `body.services { }` or `body.index { }`).

**Key rules**:
- `{.className}` patterns in Google Docs target the `<section>` element (e.g., `{.hero .section-dark}` → `<section class="hero section-dark">`)
- Consecutive paragraphs/headings/lists between section breaks are grouped in a single `<div class="default-wrapper">`
- Component tables produce `<div class="component {name}">` with double-nested content divs

**CSS must target the CMS structure**: Section-level styles go on `<section>`, content styles must account for the `.default-wrapper` wrapper div.

### Mockup-to-CMS Component Mapping

The static mockups in `website/mockups/` define the design. Each section maps to either a **CMS section** (styled via `{.className}`) or a **CMS component** (table in Google Docs).

#### Section-Based Elements (Styled via `{.className}`)

These use regular paragraphs/headings in Google Docs with section classes:

| Mockup Section | Section Classes | Content Approach |
|---------------|----------------|-----------------|
| Homepage hero | `{.hero .section-dark}` | H1 + paragraph + bold link (→ primary button) |
| Interior page hero | `{.hero-page .section-dark}` | Section label paragraph + H1 + paragraph |
| Problem/challenge text | (no class or `{.section}`) | H2 + unordered list |
| CTA block | `{.cta-block}` | H2 + paragraph + bold link |
| Alternating sections | `{.section-alt}` | White background with subtle borders |
| Credibility text | `{.section-alt}` | Paragraph text (styled via CSS) |

#### Component-Based Elements (Table in Google Docs)

These are authored as tables with `Component` header and transformed by JS:

| Mockup Section | Component Name | Table Structure |
|---------------|---------------|-----------------|
| Navbar | `nav` (critical) | Row 1: brand link, Row 2: nav links `<ul>` |
| Service cards grid | `cards` (+ `numbered md-6 cta-arrow`) | H3 \| Description \| Link per row |
| Stats/metrics bar | `list` (+ `card-transparent four-col`) | `<ul>` with `<strong>Value</strong>` + nested `<ul><li>Label</li></ul>` |
| Process steps (1-2-3) | `list` (+ `numbered grid-3`) | `<ul>` with `<strong>Title</strong>` + nested `<ul><li>Description</li></ul>` |
| Section headers | `heading` (+ `labeled aligned-center`) | Optional label `<p>` + `<h2>` + optional subtitle `<p>` |
| Bulleted list | `list` (+ `bullets lg-8`) | `<ul>` with `<li>` items |
| Dark block (2-col) | `list` (+ `card-dark two-col`) | Row 1: H2 + subtitle, Row 2: `<ul>` |
| Two-column layout | `columns` (+ sizing class) | Left content \| Right content |
| Footer brand | `footer-brand` (+ `lg-4`) | Brand link + description paragraph |
| Footer columns | `columns` (+ `append 6-lg-2`) | Column divs with heading + link lists |
| Footer copyright | `columns` (+ `copyright`) | Copyright paragraph |
| Full-height hero | `hero` (+ `hero-logo labeled lg-8`) | Optional label `<p>` + `<h1>` + optional description `<p>` + optional CTA `<a>`. `.hero-logo` adds rotating background SVG + grid pattern + hero-inner/hero-content wrappers. `.labeled` makes first `<p>` before h1 a section label. Column width via `.lg-8`, `.lg-10`, etc. (default: `col-lg-10`) |
| Contact / dynamic form | `form` (+ `heading lg-7`) | Row 1 (with `.heading`): heading content; Row 2: `<a>` link to JSON config URL. Fetches field definitions from JSON, renders Bootstrap 5.3 form with validation. Supports: text, email, tel, url, number, password, text-area, select, checkbox, radio, submit. Features: Bootstrap validation, reCAPTCHA v3, Google Apps Script submission |
| Dynamic modal | `modals` | Not authored as a CMS table — initialized globally by app.js. Listens for `modal:trigger` events, fetches HTML from a URL, renders in Bootstrap 5.3 modal with backdrop/keyboard/focus management. Processes nested components inside modal content. Caches modals in DOM for reuse between opens |
| Article listings | `listings` (+ `md-6 lg-4`) | Row 1: `<a>` link to JSON source (e.g. `/insights/posts-index.json`); Row 2: empty state content (icon, heading, text — shown when 0 posts). Fetches posts, renders article cards with image (or branded SVG placeholder), meta, title, excerpt, "Read More" link. Column widths via `.md-6`, `.lg-4`, etc. |
| Callout box | `callout` (+ `aligned-center lg-8`) | Single column: `<h3>` title + `<p>` body text. Renders amber gradient box with left border accent. `.aligned-center` for centered text. Column width via `.lg-6`, `.lg-8`, `.lg-10` (default: `col-lg-8`). Currently not used in any live pages but exists on disk |
| Accordion FAQ | `accordions` | Header \| Body per row (not yet built) |
| Testimonials | `quotes` | Quote text \| Attribution per row (not yet built) |

#### Section Class Vocabulary

| Class | Effect |
|-------|--------|
| `.section-dark` | Dark slate background, white text |
| `.section-alt` | White background with subtle borders |
| `.hero` | Full-height hero with flex centering |
| `.hero-page` | Padded interior page hero with grid pattern |
| `.cta-block` | Dark CTA with centered text |

See `website/docs/NIMBUSEDGE-CMS-GUIDE.md` Section 3 for complete section class reference and component table structures.

**Key design elements to preserve in CMS transition:**
- Satoshi typography with tight letter-spacing on headlines
- Slate/Amber color scheme (dark hero sections, amber CTAs)
- Generous section spacing (6-8rem vertical padding)
- The Open Star logo SVG and GSAP navbar animation
- Clean grid layouts with asymmetric hero compositions
- Subtle scroll-triggered reveal animations

### Scroll Animations

GSAP-powered reveal animations in `SiteScrollAnimations` class (app.js). Elements start hidden via CSS (`opacity: 0; transform: translateY(20px)`) and animate in when scrolled into view.

**Dual trigger system (touch vs desktop):**
- **Desktop:** ScrollTrigger (synced with Lenis smooth scroll via `lenis.on('scroll', ScrollTrigger.update)`)
- **Touch devices:** IntersectionObserver (zero scroll overhead — ScrollTrigger's non-passive touch listeners cause iOS Safari to stall on first swipe)
- Detection: `html.touch-device` class set via `navigator.maxTouchPoints > 0`

**Config values** (from `SiteScrollAnimations` in app.js):
- **Duration:** `fast: 0.3`, `normal: 0.5`, `slow: 0.6`
- **Stagger:** `cards: 0.12`, `list: 0.08`, `grid: 0.1`
- **Ease:** `power2.out`
- **Trigger start:** `top 85%` (default), `top 90%` (early)

**Helper methods** (use these, never raw `scrollTrigger` config):
- `animateOnScroll(elements, props, trigger, start)` — wraps `gsap.to()` with correct trigger
- `timelineOnScroll(trigger, start)` — wraps `gsap.timeline()` with correct trigger

**Touch CSS** in main.scss:
- `html.touch-device { scroll-behavior: auto !important; touch-action: pan-y; }` — overrides Bootstrap's `:root { scroll-behavior: smooth }` and prevents gesture detection delay

Respects `prefers-reduced-motion`. Lenis is disabled on all touch devices (native momentum scrolling).

### Pre-rendering Compatibility

Components detect optimize mode: `document.body.classList.contains('optimize')`.
During pre-rendering: skip animations, load all components immediately, skip analytics.

### Documentation Reference

Full technical details in `website/docs/NIMBUSEDGE-CMS-GUIDE.md`:
- Complete app.js template (copy-pasteable)
- Full utility API reference (30+ functions)
- Before/after HTML transformation examples
- SCSS architecture details
- Quality checklist and common issues

---

## General Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
