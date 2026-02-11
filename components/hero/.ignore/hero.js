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

  // Get CMS content container
  const cmsCol = component.querySelector(':scope > div > div');
  if (!cmsCol) return;

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

  // Build wrapper structure
  const container = createElement('div', ['container']);
  const bsRow = createElement('div', ['row']);
  const col = createElement('div', [colClass]);

  // Determine the innermost content target
  let contentTarget;
  if (hasHeroLogo) {
    const heroInner = createElement('div', ['hero-inner']);
    const heroContent = createElement('div', ['hero-content']);
    contentTarget = heroContent;
    col.appendChild(heroContent);
    bsRow.appendChild(col);
    heroInner.appendChild(bsRow);
    container.appendChild(heroInner);
  } else {
    contentTarget = col;
    bsRow.appendChild(col);
    container.appendChild(bsRow);
  }

  // Move ALL children from CMS col into content target (preserves order + unknown elements)
  while (cmsCol.firstChild) contentTarget.appendChild(cmsCol.firstChild);

  // Add classes to known elements (now inside the wrapper)
  const h1 = contentTarget.querySelector('h1');

  if (isLabeled && h1) {
    // First p before h1 becomes section label
    const labelP = findParagraphBefore(contentTarget, h1);
    if (labelP) labelP.classList.add('section-label');
  }

  if (h1) {
    h1.classList.add('display-headline');

    // First p after h1 (without a link child) becomes subheadline
    const descP = findDescriptionAfter(contentTarget, h1);
    if (descP) descP.classList.add('subheadline');
  }

  // CTA link: extract from wrapper <p>, add btn-lg
  const ctaLink = contentTarget.querySelector('a.btn-primary');
  if (ctaLink) {
    ctaLink.classList.add('btn-lg');
    // If the link is wrapped in a <p>, replace the <p> with just the link
    const parentP = ctaLink.parentElement;
    if (parentP && parentP.tagName === 'P') {
      parentP.replaceWith(ctaLink);
    }
  }

  fragment.appendChild(container);

  // Replace CMS wrappers with new structure
  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(fragment);
}

/** Find the first direct-child <p> that appears before the reference element */
function findParagraphBefore(parent, ref) {
  for (const child of parent.children) {
    if (child === ref) return null;
    if (child.tagName === 'P') return child;
  }
  return null;
}

/** Find the first direct-child <p> after ref that has no link child (description, not CTA) */
function findDescriptionAfter(parent, ref) {
  let passed = false;
  for (const child of parent.children) {
    if (child === ref) { passed = true; continue; }
    if (passed && child.tagName === 'P' && !child.querySelector('a')) return child;
  }
  return null;
}
