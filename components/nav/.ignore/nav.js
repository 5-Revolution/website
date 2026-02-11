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

  // Get CMS rows
  const cmsRows = [...component.children];
  const brandRow = cmsRows[0];
  const linksRow = cmsRows[1];

  // Build container
  const container = createElement('div', ['container']);

  // Transform existing brand link
  const brandLink = brandRow?.querySelector('a');
  if (brandLink) {
    // Strip CMS utility classes before adding navbar-brand
    brandLink.classList.remove('btn', 'btn-link', 'btn-primary');
    brandLink.classList.add('navbar-brand');
    brandLink.id = 'navbarBrand';

    // Replace link content with SVG logo + text span
    const brandText = brandLink.textContent.trim();
    brandLink.innerHTML = `<svg class="logo-mark" id="navbarLogo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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

    const textSpan = createElement('span', ['navbar-brand-text'], { id: 'navbarBrandText' });
    textSpan.textContent = brandText || '5th Revolution';
    brandLink.appendChild(textSpan);

    container.appendChild(brandLink);
  }

  // Mobile toggler (must be injected — CMS doesn't provide this)
  const toggler = createElement('button', ['navbar-toggler'], {
    type: 'button',
    'data-bs-toggle': 'collapse',
    'data-bs-target': '#navbarNav',
    'aria-controls': 'navbarNav',
    'aria-expanded': 'false',
    'aria-label': 'Toggle navigation',
  });
  toggler.innerHTML = '<span class="navbar-toggler-icon"></span>';
  container.appendChild(toggler);

  // Transform existing nav list
  const navList = linksRow?.querySelector('ul');
  if (navList) {
    navList.classList.add('navbar-nav', 'align-items-lg-center');

    // Transform each existing <li> in place
    for (const li of navList.querySelectorAll(':scope > li')) {
      li.classList.add('nav-item');

      const link = li.querySelector('a');
      if (!link) continue;

      const isPrimary = link.classList.contains('btn-primary');

      // Strip CMS utility classes
      link.classList.remove('btn', 'btn-link');

      if (isPrimary) {
        li.classList.add('ms-lg-3');
        link.classList.add('btn', 'btn-primary');
      } else {
        link.classList.add('nav-link');
        if (!link.classList.length) link.removeAttribute('class');
      }
    }

    // Wrap in collapse div
    const collapse = createElement('div', ['collapse', 'navbar-collapse', 'justify-content-end'], { id: 'navbarNav' });
    collapse.appendChild(navList);
    container.appendChild(collapse);
  }

  // Replace CMS wrappers with navbar structure
  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}
