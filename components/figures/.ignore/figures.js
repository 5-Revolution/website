/*
 * Figures Component — 5th Revolution
 *
 * Wraps CMS-authored images in a semantic <figure> with optional <figcaption>.
 * The CMS pre-renders responsive <picture> elements; this component adds
 * Bootstrap structure and styling hooks.
 *
 * CMS table structure:
 *   Row 1: Image (picture element with responsive sources)
 *   Row 2: Caption text (optional — present when .caption class is set)
 *
 * Classes:
 *   .caption   — Has a caption row (row 2)
 *   .rounded   — Rounded corners on the image
 *   .lg-8, .lg-10, etc. — Bootstrap column width (default: lg-10)
 */

export default async function initializeFigures(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildFigure(component, { createElement });
  markLoaded(component, 'figures');
}

function buildFigure(component, { createElement }) {
  const rows = [...component.children];
  if (!rows.length) return;

  const hasCaption = component.classList.contains('caption');
  const isRounded = component.classList.contains('rounded');

  // Detect column width
  const colMatch = [...component.classList].find((c) => /^lg-\d+$/.test(c));
  const colClass = colMatch ? `col-${colMatch}` : 'col-lg-10';

  // Extract image from row 1
  const picture = rows[0]?.querySelector('picture');
  if (!picture) return;

  // Extract caption from row 2
  let captionContent = null;
  if (hasCaption && rows[1]) {
    const col = rows[1].querySelector(':scope > div') || rows[1];
    captionContent = col.innerHTML.trim();
  }

  // Build: container > row > col > figure
  const container = createElement('div', ['container']);
  const row = createElement('div', ['row', 'justify-content-center']);
  const col = createElement('div', [colClass]);
  const figure = createElement('figure', ['figure-block']);

  // Image wrapper
  const imgWrapper = createElement('div', ['figure-img']);
  if (isRounded) imgWrapper.classList.add('rounded');
  imgWrapper.appendChild(picture);
  figure.appendChild(imgWrapper);

  // Caption
  if (captionContent) {
    const figcaption = createElement('figcaption', ['figure-caption']);
    figcaption.innerHTML = captionContent;
    figure.appendChild(figcaption);
  }

  col.appendChild(figure);
  row.appendChild(col);
  container.appendChild(row);

  // Replace CMS content
  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}
