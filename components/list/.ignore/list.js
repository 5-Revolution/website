/*
 * List Component — 5th Revolution
 *
 * Transforms CMS list content into styled variants based on author-applied classes.
 * Classes describe visual patterns, not content — making variants reusable across pages.
 * Headings are handled by the separate heading component.
 *
 * Variants (via classes on the component element):
 *   .bullets .lg-8                         — Bulleted list in constrained column
 *   .card-dark .two-col .left-heading      — Dark block: two CMS rows (heading | list)
 *   .card-transparent .four-col            — Stat bar: value/label pairs in 4-col grid
 *   .numbered .grid-3                      — Numbered grid: numbered steps in N-col grid
 *
 * Layout classes:
 *   .lg-8, .lg-6, .lg-10                  — Bootstrap column width
 *   .grid-3, .grid-4                      — CSS grid column count
 *   .aligned-center                       — Center alignment
 *
 * CMS input (single column):
 *   <ul> with <li> items
 *     - For .numbered / .card-transparent: <li> has <strong>Value</strong> + nested <ul><li>label</li></ul>
 *   For .card-dark .two-col: TWO CMS rows — Row 1: h2 + subtitle, Row 2: <ul>
 */

export default async function initializeList(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  await buildList(component, { createElement });
  markLoaded(component, 'list');
}

async function buildList(component, { createElement }) {
  const isBullets = component.classList.contains('bullets');
  const isCardDark = component.classList.contains('card-dark');
  const isTwoCol = component.classList.contains('two-col');
  const isCardTransparent = component.classList.contains('card-transparent');
  const isNumbered = component.classList.contains('numbered');

  // Detect column width (lg-8, lg-6, etc.)
  const colMatch = [...component.classList].find((c) => /^lg-\d+$/.test(c));
  const colClass = colMatch ? `col-${colMatch}` : null;

  // Detect grid columns (grid-3, grid-4, etc.)
  const gridMatch = [...component.classList].find((c) => /^grid-\d+$/.test(c));
  const gridCols = gridMatch ? parseInt(gridMatch.split('-')[1], 10) : 3;

  const fragment = document.createDocumentFragment();

  if (isCardTransparent) {
    buildStatBar(component, fragment, { createElement });
  } else if (isCardDark && isTwoCol) {
    const isLabeled = component.classList.contains('labeled');
    buildDarkBlock(component, fragment, { createElement, isLabeled });
  } else if (isCardDark) {
    const isChecked = component.classList.contains('checked');
    await buildDarkCard(component, fragment, { createElement, isChecked });
  } else if (isTwoCol) {
    const isLabeled = component.classList.contains('labeled');
    const isChecked = component.classList.contains('checked');
    const isOneList = component.classList.contains('one-list');
    buildTwoColList(component, fragment, { createElement, isLabeled, isChecked, isOneList });
  } else if (isNumbered) {
    buildNumberedGrid(component, fragment, { createElement, gridCols });
  } else if (isBullets) {
    buildBulletedList(component, fragment, { createElement, colClass });
  }

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(fragment);
}

// ============================================
// Variant: Bulleted List (bullets lg-8)
// ============================================
function buildBulletedList(component, fragment, { createElement, colClass }) {
  const cmsCol = component.querySelector(':scope > div > div');
  if (!cmsCol) return;

  const container = createElement('div', ['container']);
  const row = createElement('div', ['row', 'justify-content-center']);
  const col = createElement('div', [colClass || 'col-lg-8']);

  // Move ALL children from CMS col (preserves ul + any other content)
  while (cmsCol.firstChild) col.appendChild(cmsCol.firstChild);

  // Add class to the ul
  const ul = col.querySelector('ul');
  if (ul) ul.classList.add('bulleted-list');

  row.appendChild(col);
  container.appendChild(row);
  fragment.appendChild(container);
}

// ============================================
// Variant: Dark Block (card-dark two-col left-heading)
// Two CMS rows: Row 1 = heading content, Row 2 = list
// ============================================
function buildDarkBlock(component, fragment, { createElement, isLabeled }) {
  const cmsRows = [...component.children];
  const row1Col = cmsRows[0]?.querySelector(':scope > div');
  const row2Col = cmsRows[1]?.querySelector(':scope > div');

  const container = createElement('div', ['container']);
  const block = createElement('div', ['dark-block']);
  const row = createElement('div', ['row', 'align-items-center']);

  // Left column: move ALL Row 1 content
  const leftCol = createElement('div', ['col-lg-5', 'mb-4', 'mb-lg-0']);
  if (row1Col) {
    while (row1Col.firstChild) leftCol.appendChild(row1Col.firstChild);
  }

  // Add classes to known elements in left column
  const h2 = leftCol.querySelector('h2');

  if (isLabeled && h2) {
    const labelP = findParagraphBefore(leftCol, h2);
    if (labelP) labelP.classList.add('section-label');
  }

  if (h2) {
    // Paragraphs after h2 get lead class
    let passed = false;
    for (const child of [...leftCol.children]) {
      if (child === h2) { passed = true; continue; }
      if (passed && child.tagName === 'P') child.classList.add('lead');
    }
  }

  // Right column: move ALL Row 2 content
  const rightCol = createElement('div', ['col-lg-6', 'offset-lg-1']);
  if (row2Col) {
    while (row2Col.firstChild) rightCol.appendChild(row2Col.firstChild);
  }

  // Add class to the ul
  const ul = rightCol.querySelector('ul');
  if (ul) ul.classList.add('dark-block-list');

  row.appendChild(leftCol);
  row.appendChild(rightCol);
  block.appendChild(row);
  container.appendChild(block);
  fragment.appendChild(container);
}

// ============================================
// Variant: Dark Card (card-dark, single column)
// Single CMS row: heading + description + checked list + contact details
// ============================================
async function buildDarkCard(component, fragment, { createElement, isChecked }) {
  const cmsCol = component.querySelector(':scope > div > div');
  if (!cmsCol) return;

  const shouldAppend = component.classList.contains('append');
  const block = createElement('div', ['dark-block']);

  // Move ALL children from CMS col into the dark block
  while (cmsCol.firstChild) block.appendChild(cmsCol.firstChild);

  // Add classes to known elements
  const heading = block.querySelector('h3') || block.querySelector('h2');
  if (heading) heading.classList.add('dark-block-heading');

  // Description paragraphs (between heading and ul) get lead class
  if (heading) {
    let sibling = heading.nextElementSibling;
    while (sibling && sibling.tagName !== 'UL') {
      if (sibling.tagName === 'P' && !sibling.querySelector('.icon')) {
        sibling.classList.add('lead');
      }
      sibling = sibling.nextElementSibling;
    }
  }

  // Transform the checked list
  const ul = block.querySelector('ul');
  if (ul && isChecked) {
    ul.classList.add('capability-list');
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'check-icon');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';

      const span = createElement('span');
      span.innerHTML = li.innerHTML;
      li.innerHTML = '';
      li.appendChild(svg);
      li.appendChild(span);
    });
  } else if (ul) {
    ul.classList.add('dark-block-list');
  }

  // Transform icon paragraphs (after ul) into contact-detail rows
  // CMS pattern: <p><span class="icon icon-*"><img/></span> <strong>Label</strong> <a>value</a></p>
  const iconParagraphs = block.querySelectorAll('p:has(.icon)');
  if (iconParagraphs.length) {
    const hr = createElement('hr', ['dark-block-divider']);
    // Insert hr before the first icon paragraph
    iconParagraphs[0].before(hr);

    iconParagraphs.forEach((p) => {
      p.classList.add('contact-detail');

      // Wrap strong + link in a content div (icon left, text stacked right)
      const iconSpan = p.querySelector('.icon');
      const strong = p.querySelector('strong');
      const link = p.querySelector('a');

      if (link) {
        link.classList.remove('btn', 'btn-link', 'btn-primary');
        if (!link.classList.length) link.removeAttribute('class');
      }

      const content = createElement('div', ['contact-detail-content']);
      if (strong) content.appendChild(strong);
      if (link) content.appendChild(link);

      // Clear paragraph, re-add icon + content wrapper
      p.textContent = '';
      if (iconSpan) p.appendChild(iconSpan);
      p.appendChild(content);
    });
  }

  if (shouldAppend) {
    const targetRow = await waitForAppendTarget(component);
    if (targetRow) {
      const col = createElement('div', ['col-lg-5']);
      col.appendChild(block);
      targetRow.appendChild(col);
      component.remove();
      return;
    }
  }

  // Fallback: self-contained
  const container = createElement('div', ['container']);
  container.appendChild(block);
  fragment.appendChild(container);
}

/** Walk backward to find the nearest component, wait for it to load, return its .row */
function waitForAppendTarget(component) {
  let sibling = component.previousElementSibling;
  while (sibling) {
    if (sibling.classList.contains('component')) {
      // If already loaded, return row immediately
      if (sibling.dataset.status === 'loaded') {
        return sibling.querySelector('.row');
      }
      // Wait for sibling to finish loading
      return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
          if (sibling.dataset.status === 'loaded') {
            observer.disconnect();
            resolve(sibling.querySelector('.row'));
          }
        });
        observer.observe(sibling, { attributes: true, attributeFilter: ['data-status'] });
      });
    }
    sibling = sibling.previousElementSibling;
  }
  return Promise.resolve(null);
}

// ============================================
// Variant: Two-Column Layout (labeled two-col left-heading)
// Two CMS rows: Row 1 = heading content, Row 2 = categorized list
// ============================================
function buildTwoColList(component, fragment, { createElement, isLabeled, isChecked, isOneList }) {
  const isImaged = component.classList.contains('imaged');
  const isListLead = component.classList.contains('list-lead');

  const cmsRows = [...component.children];
  const row1Col = cmsRows[0]?.querySelector(':scope > div');
  const row2Col = cmsRows[1]?.querySelector(':scope > div');

  const container = createElement('div', ['container']);
  const gridRow = createElement('div', ['row']);

  // Left column: move ALL Row 1 content into section-header
  const leftCol = createElement('div', [isImaged ? 'col-lg-4' : 'col-lg-5', 'mb-4', 'mb-lg-0']);
  const header = createElement('div', ['section-header']);

  if (row1Col) {
    while (row1Col.firstChild) header.appendChild(row1Col.firstChild);
  }

  // Add classes to known elements in header
  const h2 = header.querySelector('h2');

  if (isLabeled && h2) {
    const labelP = findParagraphBefore(header, h2);
    if (labelP) labelP.classList.add('section-label');
  }

  if (h2) {
    let passed = false;
    for (const child of [...header.children]) {
      if (child === h2) { passed = true; continue; }
      if (!passed || child.tagName !== 'P') continue;

      // Skip social link paragraphs (imaged variant)
      if (isImaged && (child.querySelector('a.btn-link') || child.querySelector('.icon'))) continue;

      if (isImaged) {
        const picture = header.querySelector('picture');
        if (picture && (child.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_FOLLOWING)) {
          child.classList.add('text-muted');
          continue;
        }
      }
      child.classList.add('lead');
    }
  }

  leftCol.appendChild(header);

  // For imaged variant: move picture and social links out of header into leftCol
  if (isImaged) {
    const picture = header.querySelector('picture');
    if (picture) {
      const photoDiv = createElement('div', ['photo']);
      photoDiv.appendChild(picture);
      leftCol.appendChild(photoDiv);
    }

    // Social link paragraphs
    for (const p of [...header.querySelectorAll(':scope > p')]) {
      if (p.querySelector('a.btn-link') || p.querySelector('.icon')) {
        leftCol.appendChild(p);
      }
    }
  }

  // Right column: move ALL Row 2 content
  const rightCol = createElement('div', [isImaged ? 'col-lg-7' : 'col-lg-6', 'offset-lg-1']);
  if (row2Col) {
    while (row2Col.firstChild) rightCol.appendChild(row2Col.firstChild);
  }

  // Lead paragraphs (list-lead variant) — add classes to existing p elements before ul
  if (isListLead) {
    for (const child of [...rightCol.children]) {
      if (child.tagName === 'UL') break;
      if (child.tagName === 'P') child.classList.add('lead', 'mb-4');
    }
  }

  // Transform the list based on variant
  const ul = rightCol.querySelector(':scope > ul');

  if (ul && isChecked) {
    // Checked variant: flat list with check SVG icons
    ul.classList.add('capability-list');
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'check-icon');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';

      const span = createElement('span');
      span.innerHTML = li.innerHTML;
      li.innerHTML = '';
      li.appendChild(svg);
      li.appendChild(span);
    });
  } else if (ul && isOneList) {
    // Single-column product list (flat items with bullet spans)
    ul.classList.add('product-list');
    ul.querySelectorAll(':scope > li').forEach((item) => {
      const bullet = createElement('span', ['product-bullet']);
      item.insertBefore(bullet, item.firstChild);
    });
  } else if (ul) {
    // Product lists from nested ul structure (two-column categorized grid)
    const innerRow = createElement('div', ['row', 'g-4']);
    const items = [...ul.querySelectorAll(':scope > li')];

    items.forEach((li) => {
      const col = createElement('div', ['col-md-6']);

      const strong = li.querySelector(':scope > strong');
      if (strong) {
        const heading = createElement('h5', ['product-list-heading']);
        heading.textContent = strong.textContent;
        col.appendChild(heading);
      }

      const nestedUl = li.querySelector(':scope > ul');
      if (nestedUl) {
        nestedUl.classList.add('product-list');
        nestedUl.querySelectorAll(':scope > li').forEach((item) => {
          const bullet = createElement('span', ['product-bullet']);
          item.insertBefore(bullet, item.firstChild);
        });
        col.appendChild(nestedUl);
      }

      innerRow.appendChild(col);
    });

    // Replace ul with the grid layout
    ul.replaceWith(innerRow);
  }

  gridRow.appendChild(leftCol);
  gridRow.appendChild(rightCol);
  container.appendChild(gridRow);
  fragment.appendChild(container);
}

// ============================================
// Variant: Numbered Grid (numbered grid-3)
// ============================================
function buildNumberedGrid(component, fragment, { createElement, gridCols }) {
  const cmsCol = component.querySelector(':scope > div > div');
  if (!cmsCol) return;

  const container = createElement('div', ['container']);
  const ul = cmsCol.querySelector('ul');

  if (ul) {
    const grid = createElement('div', ['numbered-grid']);
    grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    const items = [...ul.querySelectorAll(':scope > li')];

    items.forEach((li, index) => {
      const step = createElement('div', ['numbered-step']);

      const num = createElement('div', ['step-number']);
      num.textContent = index + 1;
      step.appendChild(num);

      const strong = li.querySelector('strong');
      if (strong) {
        strong.classList.add('step-title');
        // Convert strong to h4 with step-title class
        const title = createElement('h4', ['step-title']);
        title.textContent = strong.textContent;
        step.appendChild(title);
      }

      const nestedLi = li.querySelector('ul > li');
      if (nestedLi) {
        const text = createElement('p', ['step-text']);
        text.innerHTML = nestedLi.innerHTML;
        step.appendChild(text);
      }

      grid.appendChild(step);
    });

    container.appendChild(grid);
  }

  fragment.appendChild(container);
}

// ============================================
// Variant: Stat Bar (card-transparent four-col)
// ============================================
function buildStatBar(component, fragment, { createElement }) {
  const cmsCol = component.querySelector(':scope > div > div');
  if (!cmsCol) return;

  const container = createElement('div', ['container']);
  const statsBar = createElement('div', ['stats-bar']);
  const row = createElement('div', ['row', 'g-4']);
  const ul = cmsCol.querySelector('ul');

  if (ul) {
    const items = [...ul.querySelectorAll(':scope > li')];

    items.forEach((li) => {
      const col = createElement('div', ['col-6', 'col-lg-3']);
      const statItem = createElement('div', ['stat-item']);

      const strong = li.querySelector('strong');
      if (strong) {
        const statValue = createElement('div', ['stat-value']);
        statValue.textContent = strong.textContent;
        statItem.appendChild(statValue);
      }

      const nestedLi = li.querySelector('ul > li');
      if (nestedLi) {
        const statLabel = createElement('div', ['stat-label']);
        statLabel.textContent = nestedLi.textContent;
        statItem.appendChild(statLabel);
      }

      col.appendChild(statItem);
      row.appendChild(col);
    });
  }

  statsBar.appendChild(row);
  container.appendChild(statsBar);
  fragment.appendChild(container);
}

/** Find the first direct-child <p> that appears before the reference element */
function findParagraphBefore(parent, ref) {
  for (const child of parent.children) {
    if (child === ref) return null;
    if (child.tagName === 'P') return child;
  }
  return null;
}
