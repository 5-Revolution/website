/*
 * Callout Component — 5th Revolution
 *
 * Highlighted callout box with amber gradient background and left border accent.
 * Used for important messages, imperatives, or key takeaways within a section.
 *
 * Classes:
 *   .aligned-left               — Left-aligned text (default)
 *   .aligned-center             — Center-aligned text
 *   .lg-8, .lg-6, .lg-10       — Bootstrap column width (default: lg-8)
 *
 * CMS input (single column):
 *   <div><div>
 *     <h3>Callout Title</h3>
 *     <p>Callout body text...</p>
 *   </div></div>
 */

export default async function initializeCallout(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildCallout(component, { createElement });
  markLoaded(component, 'callout');
}

function buildCallout(component, { createElement }) {
  const col = component.querySelector(':scope > div > div');
  if (!col) return;

  const isCenter = component.classList.contains('aligned-center');

  // Detect column width (lg-8, lg-6, etc.)
  const colMatch = [...component.classList].find((c) => /^lg-\d+$/.test(c));
  const colClass = colMatch ? `col-${colMatch}` : 'col-lg-8';

  // Build structure: container > row > col > callout-box
  const container = createElement('div', ['container']);
  const row = createElement('div', ['row', 'justify-content-center']);
  const column = createElement('div', [colClass]);
  const box = createElement('div', ['callout-box']);

  if (isCenter) {
    box.classList.add('text-center');
  }

  // Move all children into the callout box
  while (col.firstChild) {
    box.appendChild(col.firstChild);
  }

  column.appendChild(box);
  row.appendChild(column);
  container.appendChild(row);

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}
