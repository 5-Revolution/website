/*
 * Quotes Component — 5th Revolution
 *
 * Transforms CMS single-cell content into a styled pull quote.
 * Editorial callouts for key statements within articles and pages.
 *
 * CMS input (single column):
 *   <p> quote text (one or more paragraphs)
 *   Optional: <em> or <small> attribution
 *
 * Classes:
 *   .centered       — Center-aligned with top/bottom amber borders
 *   .lg-6, .lg-10   — Column width (default: col-lg-8)
 */

export default async function initializeQuotes(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildQuotes(component, { createElement });
  markLoaded(component, 'quotes');
}

function buildQuotes(component, { createElement }) {
  const isCentered = component.classList.contains('centered');

  // Determine column width from component classes
  const colClass = [...component.classList]
    .filter((c) => /^(?:lg|md|xl)-\d+$/.test(c))
    .map((c) => `col-${c}`);
  if (!colClass.length) colClass.push('col-lg-10');

  // Get CMS content (double-nested: component > div > div)
  const cmsCol = component.querySelector(':scope > div > div');
  if (!cmsCol) return;

  // Build structure: container > row > col > blockquote
  const container = createElement('div', ['container']);
  const row = createElement('div', ['row', 'justify-content-center']);
  const col = createElement('div', colClass);
  const blockquote = createElement('blockquote', [
    'blockquote-feature',
    isCentered ? 'text-center' : '',
  ].filter(Boolean));

  // Move ALL children from CMS col into blockquote (preserves all content)
  while (cmsCol.firstChild) blockquote.appendChild(cmsCol.firstChild);

  col.appendChild(blockquote);
  row.appendChild(col);
  container.appendChild(row);

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}
