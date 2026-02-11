/*
 * Cards Component — 5th Revolution
 *
 * Transforms CMS rows into a responsive card grid.
 * Each CMS row = one card with h3 + description + optional CTA link.
 *
 * Classes (visual patterns, reusable across pages):
 *   .numbered      — Auto-increment number badge (01, 02, 03...)
 *   .phased        — Phase label (Phase 1, Phase 2...) with phase-card styling
 *   .6, .md-6, .lg-3 — Column widths (col-6, col-md-6, col-lg-3). Multiple supported.
 *   .aligned-left  — Left-aligned text (default)
 *   .aligned-center — Center-aligned text
 *   .listed        — Cards include a bulleted list (gold dots) below description
 *   .cta           — Cards with links are fully clickable (stretched link)
 *   .cta-arrow     — Same as .cta + arrow decoration on links
 */

export default async function initializeCards(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildCards(component, { createElement });
  markLoaded(component, 'cards');
}

function buildCards(component, { createElement }) {
  const isNumbered = component.classList.contains('numbered');
  const isPhased = component.classList.contains('phased');
  const hasCtaArrow = component.classList.contains('cta-arrow');

  // Determine column classes from component classes (supports multiple: 6 md-6 lg-3)
  const colClasses = [...component.classList]
    .filter((c) => /^(?:\d+|(?:sm|md|lg|xl|xxl)-\d+)$/.test(c))
    .map((c) => `col-${c}`);
  if (!colClasses.length) colClasses.push('col-md-6');

  const cmsRows = [...component.children];
  const container = createElement('div', ['container']);
  const gridRow = createElement('div', ['row', 'g-4']);

  cmsRows.forEach((rowDiv, index) => {
    const cmsCol = rowDiv.querySelector(':scope > div');
    if (!cmsCol) return;

    const gridCol = createElement('div', colClasses);
    const cardClass = isPhased ? 'phase-card' : 'card-item';
    const card = createElement('div', [cardClass]);

    // Phase attribute for ::before label
    if (isPhased) {
      card.dataset.phase = `Phase ${index + 1}`;
    }

    // Auto-number badge (prepended before content)
    if (isNumbered) {
      const num = createElement('div', ['card-number']);
      num.textContent = String(index + 1).padStart(2, '0');
      card.appendChild(num);
    }

    // Move ALL children from CMS col into card (preserves order + unknown elements)
    while (cmsCol.firstChild) card.appendChild(cmsCol.firstChild);

    // Add classes to known elements (now inside the card)
    const h3 = card.querySelector('h3');
    if (h3) {
      h3.classList.add('card-title');
      // Phased variant uses h4 styling via card-title class; keep the h3 element
    }

    // Paragraphs without links get card-text; skip p wrapping a link
    for (const p of card.querySelectorAll(':scope > p')) {
      if (!p.querySelector('a')) {
        p.classList.add('card-text');
      }
    }

    // List (listed variant)
    const ul = card.querySelector(':scope > ul');
    if (ul) ul.classList.add('card-list');

    // CTA link
    const ctaLink = card.querySelector(':scope > p > a, :scope > a');
    if (ctaLink) {
      if (hasCtaArrow) {
        ctaLink.innerHTML = ctaLink.textContent.trim() + ' <span class="arrow">&rarr;</span>';
      }
      ctaLink.classList.add('card-link');
      // Extract link from wrapper <p> if needed
      const parentP = ctaLink.parentElement;
      if (parentP && parentP.tagName === 'P') {
        parentP.replaceWith(ctaLink);
      }
    }

    gridCol.appendChild(card);
    gridRow.appendChild(gridCol);
  });

  container.appendChild(gridRow);

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}
