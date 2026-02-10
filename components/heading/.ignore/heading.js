/*
 * Heading Component — 5th Revolution
 *
 * Standalone section header. Headings are separate from content components,
 * making both independently reusable across pages.
 *
 * CMS input (single column):
 *   Optional: <p> section label (first p before h2, when .labeled)
 *   <h2> heading
 *   Optional: <p> subtitle (p after h2)
 *
 * Classes:
 *   .labeled        — First <p> before h2 becomes a section label
 *   .aligned-center — Center-aligned text
 *   .aligned-left   — Left-aligned text (default)
 */

export default async function initializeHeading(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildHeading(component, { createElement });
  markLoaded(component, 'heading');
}

function buildHeading(component, { createElement }) {
  const isLabeled = component.classList.contains('labeled');
  const isCenter = component.classList.contains('aligned-center');

  const col = component.querySelector(':scope > div > div');
  if (!col) return;

  const h2 = col.querySelector('h2');
  const paragraphs = col.querySelectorAll(':scope > p');

  let sectionLabel = null;
  let subtitle = null;

  paragraphs.forEach((p) => {
    if (isLabeled && !sectionLabel && h2 && p.compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_FOLLOWING) {
      sectionLabel = p.textContent.trim();
    } else if (h2 && p.compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_PRECEDING) {
      subtitle = p.innerHTML;
    }
  });

  const container = createElement('div', ['container']);
  const header = createElement('div', ['section-header', isCenter ? 'text-center' : ''].filter(Boolean));

  if (sectionLabel) {
    const label = createElement('p', ['section-label']);
    label.textContent = sectionLabel;
    header.appendChild(label);
  }
  if (h2) {
    header.appendChild(h2);
  }
  if (subtitle) {
    const sub = createElement('p', ['subheadline']);
    sub.innerHTML = subtitle;
    header.appendChild(sub);
  }

  container.appendChild(header);

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}
