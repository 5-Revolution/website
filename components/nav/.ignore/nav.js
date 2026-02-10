/*
 * Nav Component — 5th Revolution
 * Critical component inside <header> fragment.
 * Transforms CMS nested-div HTML into Bootstrap 5 fixed navbar.
 *
 * CMS input:
 *   Row 1: Brand — icon + underlined link
 *   Row 2: Nav links — <ul> with btn-link and btn-primary classes
 *
 * Output: Adds navbar classes to existing <nav>, replaces content with:
 *   - SVG logo + brand text (animated via app.js)
 *   - Mobile toggler
 *   - Collapsible nav links + CTA button
 *   - Dark/light variant from body class (most pages dark; body.contact = light)
 */

// Pages with light navbar (all others default to dark)
const LIGHT_NAV_PAGES = ['contact'];

export default async function initializeNav(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildNavbar(component, { createElement });
  markLoaded(component, 'nav');
}

function buildNavbar(component, { createElement }) {
  // Determine dark/light from body class
  const isLight = LIGHT_NAV_PAGES.some((page) => document.body.classList.contains(page));

  // Add navbar classes to the existing <nav> element
  component.classList.add('navbar', 'navbar-expand-lg', 'fixed-top');
  if (!isLight) component.classList.add('navbar-dark');
  component.id = 'mainNav';

  // Extract content from CMS rows
  const rows = [...component.children];
  const brandRow = rows[0];
  const linksRow = rows[1];

  // Build container
  const container = createElement('div', ['container']);

  // Build brand
  const brandLink = brandRow?.querySelector('a');
  const brand = createElement('a', ['navbar-brand'], {
    href: brandLink?.getAttribute('href') || '/',
    id: 'navbarBrand',
  });

  // SVG logo (hardcoded — too complex for CMS authoring)
  brand.innerHTML = `<svg class="logo-mark" id="navbarLogo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="navbar-wheel-group" transform="translate(60,60)">
        <g class="navbar-v-group" data-index="0">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
        </g>
        <g class="navbar-v-group" data-index="1">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
        </g>
        <g class="navbar-v-group" data-index="2">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
        </g>
        <g class="navbar-v-group" data-index="3">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
        </g>
        <g class="navbar-v-group" data-index="4">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
        </g>
      </g>
    </svg>`;

  const brandText = createElement('span', ['navbar-brand-text'], { id: 'navbarBrandText' });
  brandText.textContent = brandLink?.textContent.trim() || '5th Revolution';
  brand.appendChild(brandText);

  // Mobile toggler
  const toggler = createElement('button', ['navbar-toggler'], {
    type: 'button',
    'data-bs-toggle': 'collapse',
    'data-bs-target': '#navbarNav',
    'aria-controls': 'navbarNav',
    'aria-expanded': 'false',
    'aria-label': 'Toggle navigation',
  });
  toggler.innerHTML = '<span class="navbar-toggler-icon"></span>';

  // Collapse wrapper
  const collapse = createElement('div', ['collapse', 'navbar-collapse', 'justify-content-end'], { id: 'navbarNav' });
  const navList = createElement('ul', ['navbar-nav', 'align-items-lg-center']);

  // Extract nav links from CMS <ul>
  const cmsLinks = linksRow?.querySelectorAll('li') || [];
  cmsLinks.forEach((li) => {
    const link = li.querySelector('a');
    if (!link) return;

    const newLi = createElement('li', ['nav-item']);
    const href = link.getAttribute('href') || '#';
    const text = link.textContent.trim();
    const isPrimary = link.classList.contains('btn-primary');

    if (isPrimary) {
      newLi.classList.add('ms-lg-3');
      const btn = createElement('a', ['btn', 'btn-primary'], { href });
      btn.textContent = text;
      newLi.appendChild(btn);
    } else {
      const navLink = createElement('a', ['nav-link'], { href });
      navLink.textContent = text;
      newLi.appendChild(navLink);
    }

    navList.appendChild(newLi);
  });

  // Assemble
  collapse.appendChild(navList);
  container.appendChild(brand);
  container.appendChild(toggler);
  container.appendChild(collapse);

  // Replace component content with navbar structure
  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}
