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

  // Get CMS content container
  const cmsRow = component.children[0];
  const cmsCol = cmsRow?.querySelector(':scope > div');
  if (!cmsCol) return;

  // Determine column class from component CMS classes (e.g., lg-4 -> col-lg-4)
  const colClass = parseColClass(component);

  // Create shared container + row for the footer
  const container = createElement('div', ['container']);
  const gridRow = createElement('div', ['row', 'g-4', 'footer-row']);

  // Brand column
  const brandCol = createElement('div', [colClass]);

  // Move ALL children from CMS col into brand column
  while (cmsCol.firstChild) brandCol.appendChild(cmsCol.firstChild);

  // Transform existing <a> into footer-brand-link with SVG logo
  const cmsLink = brandCol.querySelector('a');
  if (cmsLink) {
    // Strip CMS utility classes before adding footer-brand-link
    cmsLink.classList.remove('btn', 'btn-link', 'btn-primary');
    cmsLink.classList.add('footer-brand-link');

    // Wrap text content in a text node after SVG
    const brandText = cmsLink.textContent.trim();
    cmsLink.innerHTML = `<svg class="logo-mark" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(60,60)">
        <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(0)"/>
        <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(72)"/>
        <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(144)"/>
        <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(216)"/>
        <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(288)"/>
      </g>
    </svg>`;
    if (brandText) {
      cmsLink.appendChild(document.createTextNode(' ' + brandText));
    }

    // Extract link from wrapper <p> if needed
    const parentP = cmsLink.parentElement;
    if (parentP && parentP.tagName === 'P') {
      parentP.replaceWith(cmsLink);
    }
  }

  // Add class to description paragraph (p without a link)
  for (const p of brandCol.querySelectorAll(':scope > p')) {
    if (!p.querySelector('a')) {
      p.classList.add('footer-description');
    }
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
