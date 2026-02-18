/*
 * Nav Component — 5th Revolution
 * Critical component inside <header> fragment.
 * Transforms CMS nested-div HTML into Bootstrap 5 fixed navbar.
 *
 * CMS input:
 *   Row 1: Brand — icon + underlined link
 *   Row 2: Nav links — <ul> with btn-link and btn-primary classes
 *            Nested <ul> inside an <li> becomes a dropdown submenu
 *            Sub-items: <a><u>Name</u></a> Description text (text node = description)
 *
 * Output: Adds navbar classes to existing <nav>, replaces content with:
 *   - SVG logo + brand text (animated via app.js)
 *   - Mobile toggler
 *   - Collapsible nav links + CTA button
 *   - CSS-only dropdown for nested lists (no Bootstrap dropdown.js)
 *   - Dark/light variant from body class (most pages dark; body.contact = light)
 */

// Chevron SVG for dropdown indicator (inline to avoid network request)
const CHEVRON_SVG = `<svg class="nav-dropdown-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Arrow SVG for "View All" link
const ARROW_SVG = `<svg class="nav-dropdown-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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

      const link = li.querySelector(':scope > a');
      if (!link) continue;

      const isPrimary = link.classList.contains('btn-primary');
      const subList = li.querySelector(':scope > ul');

      // Strip CMS utility classes
      link.classList.remove('btn', 'btn-link');

      if (isPrimary) {
        li.classList.add('ms-lg-3');
        link.classList.add('btn', 'btn-primary');
      } else if (subList) {
        // --- Dropdown item ---
        transformDropdown(li, link, subList, { createElement });
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

/**
 * Transform a nav item with a nested <ul> into a dropdown.
 * Keeps the parent link clickable (navigates to its href).
 * Uses a separate visually-hidden toggle for ARIA, but CSS
 * handles hover/focus-within for show/hide on desktop.
 *
 * Mobile: subnav renders inline (expanded), no hover needed.
 */
function transformDropdown(li, link, subList, { createElement }) {
  const dropdownId = `dropdown-${link.textContent.trim().toLowerCase().replace(/\s+/g, '-')}`;

  // Mark the parent <li> as a dropdown container
  li.classList.add('nav-dropdown');

  // Transform the parent link — keep it navigable, add chevron
  link.classList.add('nav-link', 'nav-dropdown-toggle');
  link.setAttribute('aria-expanded', 'false');
  link.setAttribute('aria-haspopup', 'true');
  link.setAttribute('aria-controls', dropdownId);
  link.insertAdjacentHTML('beforeend', ` ${CHEVRON_SVG}`);

  // Transform the sub-list into a dropdown menu
  subList.classList.add('nav-dropdown-menu');
  subList.id = dropdownId;
  subList.setAttribute('role', 'menu');
  subList.setAttribute('aria-label', `${link.textContent.trim()} submenu`);

  // Transform each sub-item — extract name from <a> and description from <li> text nodes
  const subItems = subList.querySelectorAll(':scope > li');
  for (const subLi of subItems) {
    subLi.classList.add('nav-dropdown-item');
    subLi.setAttribute('role', 'none');

    const subLink = subLi.querySelector('a');
    if (subLink) {
      // Extract description text from <li> text nodes (sibling text after the <a>)
      const nameText = subLink.textContent.trim();
      let desc = '';
      for (const node of subLi.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text) desc = text;
        }
      }

      // Clean the <li> — remove loose text nodes
      for (const node of [...subLi.childNodes]) {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      }

      subLink.classList.remove('btn', 'btn-link', 'btn-primary');
      subLink.classList.add('nav-dropdown-link');
      subLink.setAttribute('role', 'menuitem');

      // Restructure link: name span + optional description span
      subLink.textContent = '';
      const nameSpan = createElement('span', ['nav-dropdown-name']);
      nameSpan.textContent = nameText;
      subLink.appendChild(nameSpan);

      if (desc) {
        const descSpan = createElement('span', ['nav-dropdown-desc']);
        descSpan.textContent = desc;
        subLink.appendChild(descSpan);
      }
    }
  }

  // Add "View All Services" footer link
  const footerLi = createElement('li', ['nav-dropdown-footer'], { role: 'none' });
  const footerLink = createElement('a', ['nav-dropdown-link', 'nav-dropdown-viewall'], {
    href: link.getAttribute('href') || '/services/',
    role: 'menuitem',
  });
  footerLink.innerHTML = `<span class="nav-dropdown-name">View All Services</span> ${ARROW_SVG}`;
  footerLi.appendChild(footerLink);
  subList.appendChild(footerLi);

  // Interaction handlers (click, keyboard, focus) are in app.js
  // — they must be attached at runtime to survive prerendering.
}
