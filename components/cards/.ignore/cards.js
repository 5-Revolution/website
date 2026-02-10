/*
 * Cards Component — 5th Revolution
 *
 * Transforms CMS rows into a responsive card grid.
 * Each CMS row = one card with h3 + description + optional CTA link.
 *
 * Classes (visual patterns, reusable across pages):
 *   .numbered      — Auto-increment number badge (01, 02, 03...)
 *   .md-6          — 2-column grid (col-md-6)
 *   .md-4          — 3-column grid (col-md-4)
 *   .lg-4          — 3-column grid at lg (col-lg-4)
 *   .lg-6          — 2-column grid at lg (col-lg-6)
 *   .aligned-left  — Left-aligned text (default)
 *   .aligned-center — Center-aligned text
 *   .cta-arrow     — CTA links get arrow decoration
 */

export default async function initializeCards(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildCards(component, { createElement });
  markLoaded(component, 'cards');
}

function buildCards(component, { createElement }) {
  const isNumbered = component.classList.contains('numbered');
  const hasCtaArrow = component.classList.contains('cta-arrow');

  // Determine column class from component classes
  const colPatterns = ['md-4', 'md-6', 'lg-4', 'lg-6'];
  const colMatch = colPatterns.find((p) => component.classList.contains(p));
  const colClass = colMatch ? `col-${colMatch}` : 'col-md-6';

  const rows = [...component.children];
  const fragment = document.createDocumentFragment();
  const container = createElement('div', ['container']);
  const gridRow = createElement('div', ['row', 'g-4']);

  rows.forEach((rowDiv, index) => {
    const col = rowDiv.querySelector(':scope > div');
    if (!col) return;

    const h3 = col.querySelector('h3');
    const paragraphs = col.querySelectorAll(':scope > p');

    const gridCol = createElement('div', [colClass]);
    const card = createElement('div', ['card-item']);

    // Auto-number badge
    if (isNumbered) {
      const num = createElement('div', ['card-number']);
      num.textContent = String(index + 1).padStart(2, '0');
      card.appendChild(num);
    }

    // Title
    if (h3) {
      const title = createElement('h3', ['card-title']);
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
