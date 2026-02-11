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

  const cmsCol = component.querySelector(':scope > div > div');
  if (!cmsCol) return;

  // Create wrapper structure
  const container = createElement('div', ['container']);
  const header = createElement('div', ['section-header', isCenter ? 'text-center' : ''].filter(Boolean));

  // Move ALL children from CMS col into section-header (preserves order + unknown elements)
  while (cmsCol.firstChild) header.appendChild(cmsCol.firstChild);

  // Add classes to known elements (now inside the header)
  const h2 = header.querySelector('h2');

  if (isLabeled && h2) {
    // First p before h2 becomes section label
    const firstP = findParagraphBefore(header, h2);
    if (firstP) firstP.classList.add('section-label');
  }

  if (h2) {
    // First p after h2 becomes subheadline
    const nextP = findParagraphAfter(header, h2);
    if (nextP) nextP.classList.add('subheadline');
  }

  container.appendChild(header);

  // Replace CMS wrappers with new structure
  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}

/** Find the first direct-child <p> that appears before the reference element */
function findParagraphBefore(parent, ref) {
  for (const child of parent.children) {
    if (child === ref) return null;
    if (child.tagName === 'P') return child;
  }
  return null;
}

/** Find the first direct-child <p> that appears after the reference element */
function findParagraphAfter(parent, ref) {
  let passed = false;
  for (const child of parent.children) {
    if (child === ref) { passed = true; continue; }
    if (passed && child.tagName === 'P') return child;
  }
  return null;
}
