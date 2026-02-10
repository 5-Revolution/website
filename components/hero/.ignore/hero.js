/*
 * Hero Component — 5th Revolution
 * Critical component inside <section class="section-dark">.
 * Transforms CMS two-column row into full-height hero with rotating background logo.
 *
 * CMS input:
 *   Row 1, Col 1: H1 + description paragraph + CTA link
 *   Row 1, Col 2: Link to background SVG asset (e.g. /assets/logo.svg)
 *
 * Classes:
 *   .hero-logo — Adds continuously rotating background logo + grid pattern
 *
 * Output:
 *   - Rotating SVG background logo (from .hero-logo class)
 *   - Grid pattern overlay
 *   - Hero content: display-headline h1, subheadline p, btn-lg CTA
 */

export default async function initializeHero(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildHero(component, { createElement });
  markLoaded(component, 'hero');
}

function buildHero(component, { createElement }) {
  const hasHeroLogo = component.classList.contains('hero-logo');

  // Extract content from CMS row
  const row = component.children[0];
  if (!row) return;

  const columns = [...row.children];
  const contentCol = columns[0];

  // Extract heading
  const h1 = contentCol?.querySelector('h1');

  // Extract paragraphs (description + CTA)
  const paragraphs = contentCol?.querySelectorAll('p') || [];
  let descriptionText = '';
  let ctaLink = null;

  paragraphs.forEach((p) => {
    const btn = p.querySelector('a.btn-primary');
    if (btn) {
      ctaLink = btn;
    } else if (p.textContent.trim()) {
      descriptionText = p.innerHTML;
    }
  });

  // Build hero structure
  const fragment = document.createDocumentFragment();

  // Background rotating logo (if hero-logo class)
  if (hasHeroLogo) {
    const bgLogo = createElement('div', ['hero-bg-logo']);
    bgLogo.innerHTML = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(60,60)">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(0)"/>
          <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(72)"/>
          <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(144)"/>
          <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(216)"/>
          <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(288)"/>
        </g>
      </svg>`;
    fragment.appendChild(bgLogo);

    // Grid pattern
    const gridPattern = createElement('div', ['hero-grid-pattern']);
    fragment.appendChild(gridPattern);
  }

  // Content container
  const container = createElement('div', ['container']);
  const heroInner = createElement('div', ['hero-inner']);
  const bsRow = createElement('div', ['row']);
  const col = createElement('div', ['col-lg-10']);
  const heroContent = createElement('div', ['hero-content']);

  // Heading
  if (h1) {
    h1.classList.add('display-headline');
    heroContent.appendChild(h1);
  }

  // Description
  if (descriptionText) {
    const desc = createElement('p', ['subheadline']);
    desc.innerHTML = descriptionText;
    heroContent.appendChild(desc);
  }

  // CTA button
  if (ctaLink) {
    ctaLink.classList.add('btn-lg');
    heroContent.appendChild(ctaLink);
  }

  col.appendChild(heroContent);
  bsRow.appendChild(col);
  heroInner.appendChild(bsRow);
  container.appendChild(heroInner);
  fragment.appendChild(container);

  // Replace component content
  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(fragment);
}
