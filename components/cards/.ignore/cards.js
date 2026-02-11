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
  const isListed = component.classList.contains('listed');
  const hasCtaArrow = component.classList.contains('cta-arrow');

  // Determine column classes from component classes (supports multiple: 6 md-6 lg-3)
  const colClasses = [...component.classList]
    .filter((c) => /^(?:\d+|(?:sm|md|lg|xl|xxl)-\d+)$/.test(c))
    .map((c) => `col-${c}`);
  if (!colClasses.length) colClasses.push('col-md-6');

  const rows = [...component.children];
  const fragment = document.createDocumentFragment();
  const container = createElement('div', ['container']);
  const gridRow = createElement('div', ['row', 'g-4']);

  rows.forEach((rowDiv, index) => {
    const col = rowDiv.querySelector(':scope > div');
    if (!col) return;

    const h3 = col.querySelector('h3');
    const paragraphs = col.querySelectorAll(':scope > p');

    const gridCol = createElement('div', colClasses);
    const cardClass = isPhased ? 'phase-card' : 'card-item';
    const card = createElement('div', [cardClass]);

    // Phase attribute for ::before label
    if (isPhased) {
      card.dataset.phase = `Phase ${index + 1}`;
    }

    // Auto-number badge
    if (isNumbered) {
      const num = createElement('div', ['card-number']);
      num.textContent = String(index + 1).padStart(2, '0');
      card.appendChild(num);
    }

    // Title
    if (h3) {
      const titleTag = isPhased ? 'h4' : 'h3';
      const title = createElement(titleTag, ['card-title']);
      title.innerHTML = h3.innerHTML;
      card.appendChild(title);
    }

    // Description and CTA link
    let description = null;
    let ctaLink = null;

    paragraphs.forEach((p) => {
      const link = p.querySelector('a');
      if (link) {
        ctaLink = link;
      } else if (p.textContent.trim()) {
        description = p.innerHTML;
      }
    });

    if (description) {
      const text = createElement('p', ['card-text']);
      text.innerHTML = description;
      card.appendChild(text);
    }

    // Bulleted list (listed variant)
    if (isListed) {
      const ul = col.querySelector('ul');
      if (ul) {
        ul.classList.add('card-list');
        card.appendChild(ul);
      }
    }

    if (ctaLink) {
      if (hasCtaArrow) {
        ctaLink.innerHTML = ctaLink.textContent.trim() + ' <span class="arrow">&rarr;</span>';
      }
      ctaLink.classList.add('card-link');
      card.appendChild(ctaLink);
    }

    gridCol.appendChild(card);
    gridRow.appendChild(gridCol);
  });

  container.appendChild(gridRow);
  fragment.appendChild(container);

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(fragment);
}
