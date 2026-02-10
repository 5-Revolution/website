/*
 * Footer Brand Component — 5th Revolution
 * Nested inside <footer>. Transforms CMS content into the brand column
 * with hardcoded SVG logo mark (same approach as nav component).
 *
 * Also creates the shared container + row wrapper for all footer columns.
 * Sibling columns components append their columns into this shared row
 * via the .footer-row class.
 *
 * CMS input:
 *   Row 1, Col 1: Link (brand name) + description paragraph
 *
 * Classes (from CMS):
 *   .lg-4  — Maps to col-lg-4 Bootstrap column width
 *
 * Output structure:
 *   footer.footer > .container > .row.g-4.footer-row > col-lg-4 (brand content)
 *   (sibling columns components append their cols into .footer-row)
 */

export default async function initializeFooterBrand(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildFooterBrand(component, { createElement });
  markLoaded(component, 'footer-brand');
}

function buildFooterBrand(component, { createElement }) {
  const footerEl = component.closest('footer');
  if (footerEl) {
    footerEl.classList.add('footer');
  }

  // Extract content from CMS structure
  const row = component.children[0];
  const col = row?.querySelector(':scope > div');

  const cmsLink = col?.querySelector('a');
  const paragraphs = col?.querySelectorAll('p') || [];

  const brandHref = cmsLink?.getAttribute('href') || '/';
  const brandText = cmsLink?.textContent.trim() || '';

  // Description is the paragraph without a link
  let descriptionHTML = '';
  paragraphs.forEach((p) => {
    if (!p.querySelector('a') && p.textContent.trim()) {
      descriptionHTML = p.innerHTML;
    }
  });

  // Determine column class from component CMS classes (e.g., lg-4 -> col-lg-4)
  const colClass = parseColClass(component);

  // Create shared container + row for the footer
  const container = createElement('div', ['container']);
  const gridRow = createElement('div', ['row', 'g-4', 'footer-row']);

  // Brand column
  const brandCol = createElement('div', [colClass]);

  // Brand link with SVG logo (hardcoded — too complex for CMS authoring)
  const brandLink = createElement('a', ['footer-brand-link'], { href: brandHref });
  brandLink.innerHTML = `<svg class="logo-mark" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(60,60)">
        <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(0)"/>
        <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(72)"/>
        <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(144)"/>
        <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(216)"/>
        <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(288)"/>
      </g>
    </svg>`;

  if (brandText) {
    const textNode = document.createTextNode(' ' + brandText);
    brandLink.appendChild(textNode);
  }
  brandCol.appendChild(brandLink);

  if (descriptionHTML) {
    const desc = createElement('p', ['footer-description']);
    desc.innerHTML = descriptionHTML;
    brandCol.appendChild(desc);
  }

  gridRow.appendChild(brandCol);
  container.appendChild(gridRow);

  // Replace component content
  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}

/**
 * Parse column class from component CMS classes.
 * e.g., "lg-4" -> "col-lg-4"
 */
function parseColClass(component) {
  for (const cls of component.classList) {
    const match = cls.match(/^(sm|md|lg|xl|xxl)-(\d+)$/);
    if (match) return `col-${match[1]}-${match[2]}`;
  }
  return 'col-lg-4';
}
