/*
 * Hero Component — 5th Revolution
 * Critical component inside <section class="section-dark">.
 * Transforms CMS content into a full-height hero section.
 *
 * CMS input (single column):
 *   Optional: <p> section label (first p before h1, when .labeled)
 *   <h1> headline
 *   Optional: <p> description (p after h1, no link)
 *   Optional: <p><a class="btn-primary"> CTA link
 *
 * Classes:
 *   .hero-logo  — Adds rotating background logo + grid pattern + hero-inner/hero-content wrappers
 *   .labeled    — First <p> before h1 becomes a section label
 *   .lg-8, etc. — Bootstrap column width (default: col-lg-10)
 *
 * Output (hero-logo):
 *   container > hero-inner > row > col > hero-content > [label, h1, p, btn]
 *   + absolute-positioned background logo + grid pattern
 *
 * Output (regular):
 *   container > row > col > [label, h1, p, btn]
 */

export default async function initializeHero(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildHero(component, { createElement });
  markLoaded(component, 'hero');
}

function buildHero(component, { createElement }) {
  const hasHeroLogo = component.classList.contains('hero-logo');
  const isLabeled = component.classList.contains('labeled');

  // Parse column width from classes (lg-8, lg-10, etc.)
  const colMatch = [...component.classList].find((c) => /^(sm|md|lg|xl|xxl)-\d+$/.test(c));
  const colClass = colMatch ? `col-${colMatch}` : 'col-lg-10';

  // Extract content from CMS structure (component > div > div > content)
  const contentCol = component.querySelector(':scope > div > div');
  if (!contentCol) return;

  const h1 = contentCol.querySelector('h1');
  const paragraphs = [...contentCol.querySelectorAll(':scope > p')];

  let sectionLabel = null;
  let descriptionText = '';
  let ctaLink = null;

  paragraphs.forEach((p) => {
    const btn = p.querySelector('a.btn-primary');
    if (btn) {
      ctaLink = btn;
    } else if (isLabeled && !sectionLabel && h1 && (p.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      sectionLabel = p.textContent.trim();
    } else if (p.textContent.trim()) {
      descriptionText = p.innerHTML;
    }
  });

  const fragment = document.createDocumentFragment();

  // Background rotating logo (hero-logo only)
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

    const gridPattern = createElement('div', ['hero-grid-pattern']);
    fragment.appendChild(gridPattern);
  }

  // Build content elements
  const container = createElement('div', ['container']);
  const bsRow = createElement('div', ['row']);
  const col = createElement('div', [colClass]);

  if (hasHeroLogo) {
    // Hero-logo variant: hero-inner + hero-content wrappers for flex centering + max-width
    const heroInner = createElement('div', ['hero-inner']);
    const heroContent = createElement('div', ['hero-content']);

    appendHeroContent(heroContent, { createElement, sectionLabel, h1, descriptionText, ctaLink });

    col.appendChild(heroContent);
    bsRow.appendChild(col);
    heroInner.appendChild(bsRow);
    container.appendChild(heroInner);
  } else {
    // Regular hero: content directly in column, no extra wrappers
    appendHeroContent(col, { createElement, sectionLabel, h1, descriptionText, ctaLink });

    bsRow.appendChild(col);
    container.appendChild(bsRow);
  }

  fragment.appendChild(container);

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(fragment);
}

function appendHeroContent(target, { createElement, sectionLabel, h1, descriptionText, ctaLink }) {
  if (sectionLabel) {
    const label = createElement('p', ['section-label']);
    label.textContent = sectionLabel;
    target.appendChild(label);
  }

  if (h1) {
    h1.classList.add('display-headline');
    target.appendChild(h1);
  }

  if (descriptionText) {
    const desc = createElement('p', ['subheadline']);
    desc.innerHTML = descriptionText;
    target.appendChild(desc);
  }

  if (ctaLink) {
    ctaLink.classList.add('btn-lg');
    target.appendChild(ctaLink);
  }
}
