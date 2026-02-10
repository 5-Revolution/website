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

  buildList(component, { createElement });
  markLoaded(component, 'list');
}

function buildList(component, { createElement }) {
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
    const col = component.querySelector(':scope > div > div');
    const ul = col?.querySelector('ul');
    buildStatBar(fragment, { createElement, ul });
  } else if (isCardDark && isTwoCol) {
    buildDarkBlock(component, fragment, { createElement });
  } else if (isTwoCol) {
    const isLabeled = component.classList.contains('labeled');
    buildTwoColList(component, fragment, { createElement, isLabeled });
  } else if (isNumbered) {
    const col = component.querySelector(':scope > div > div');
    const ul = col?.querySelector('ul');
    buildNumberedGrid(fragment, { createElement, ul, gridCols });
  } else if (isBullets) {
    const col = component.querySelector(':scope > div > div');
    const ul = col?.querySelector('ul');
    buildBulletedList(fragment, { createElement, ul, colClass });
  }

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(fragment);
}

// ============================================
// Variant: Bulleted List (bullets lg-8)
// ============================================
function buildBulletedList(fragment, { createElement, ul, colClass }) {
  const container = createElement('div', ['container']);
  const row = createElement('div', ['row', 'justify-content-center']);
  const col = createElement('div', [colClass || 'col-lg-8']);

  if (ul) {
    ul.classList.add('bulleted-list');
    col.appendChild(ul);
  }

  row.appendChild(col);
  container.appendChild(row);
  fragment.appendChild(container);
}

// ============================================
// Variant: Dark Block (card-dark two-col left-heading)
// Two CMS rows: Row 1 = heading content, Row 2 = list
// ============================================
function buildDarkBlock(component, fragment, { createElement }) {
  const rows = [...component.children];
  const row1Col = rows[0]?.querySelector(':scope > div');
  const row2Col = rows[1]?.querySelector(':scope > div');

  const h2 = row1Col?.querySelector('h2');
  const subtitleP = row1Col?.querySelector('p');
  const ul = row2Col?.querySelector('ul');

  const container = createElement('div', ['container']);
  const block = createElement('div', ['dark-block']);
  const row = createElement('div', ['row', 'align-items-center']);

  // Left column: heading + lead
  const leftCol = createElement('div', ['col-lg-5', 'mb-4', 'mb-lg-0']);
  if (h2) {
    leftCol.appendChild(h2);
  }
  if (subtitleP) {
    subtitleP.classList.add('lead');
    leftCol.appendChild(subtitleP);
  }

  // Right column: list
  const rightCol = createElement('div', ['col-lg-6', 'offset-lg-1']);
  if (ul) {
    ul.classList.add('dark-block-list');
    rightCol.appendChild(ul);
  }

  row.appendChild(leftCol);
  row.appendChild(rightCol);
  block.appendChild(row);
  container.appendChild(block);
  fragment.appendChild(container);
}

// ============================================
// Variant: Two-Column Layout (labeled two-col left-heading)
// Two CMS rows: Row 1 = heading content, Row 2 = categorized list
// ============================================
function buildTwoColList(component, fragment, { createElement, isLabeled }) {
  const rows = [...component.children];
  const row1Col = rows[0]?.querySelector(':scope > div');
  const row2Col = rows[1]?.querySelector(':scope > div');

  const h2 = row1Col?.querySelector('h2');
  const paragraphs = row1Col ? [...row1Col.querySelectorAll(':scope > p')] : [];
  const ul = row2Col?.querySelector('ul');

  const container = createElement('div', ['container']);
  const gridRow = createElement('div', ['row']);

  // Left column: section header
  const leftCol = createElement('div', ['col-lg-5', 'mb-4', 'mb-lg-0']);
  const header = createElement('div', ['section-header']);

  let sectionLabel = null;
  const leadParagraphs = [];

  paragraphs.forEach((p) => {
    if (isLabeled && !sectionLabel && h2 && (p.compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      sectionLabel = p.textContent.trim();
    } else if (h2 && (p.compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_PRECEDING)) {
      leadParagraphs.push(p);
    }
  });

  if (sectionLabel) {
    const label = createElement('p', ['section-label']);
    label.textContent = sectionLabel;
    header.appendChild(label);
  }

  if (h2) {
    header.appendChild(h2);
  }

  leadParagraphs.forEach((p) => {
    p.classList.add('lead');
    header.appendChild(p);
  });

  leftCol.appendChild(header);

  // Right column: product lists from nested ul structure
  const rightCol = createElement('div', ['col-lg-6', 'offset-lg-1']);

  if (ul) {
    const innerRow = createElement('div', ['row', 'g-4']);
    const items = ul.querySelectorAll(':scope > li');

    items.forEach((li) => {
      const col = createElement('div', ['col-md-6']);
      const strong = li.querySelector(':scope > strong');
      const nestedUl = li.querySelector(':scope > ul');

      if (strong) {
        const heading = createElement('h5', ['product-list-heading']);
        heading.textContent = strong.textContent;
        col.appendChild(heading);
      }

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

    rightCol.appendChild(innerRow);
  }

  gridRow.appendChild(leftCol);
  gridRow.appendChild(rightCol);
  container.appendChild(gridRow);
  fragment.appendChild(container);
}

// ============================================
// Variant: Numbered Grid (numbered grid-3)
// ============================================
function buildNumberedGrid(fragment, { createElement, ul, gridCols }) {
  const container = createElement('div', ['container']);

  if (ul) {
    const grid = createElement('div', ['numbered-grid']);
    grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    const items = ul.querySelectorAll(':scope > li');

    items.forEach((li, index) => {
      const step = createElement('div', ['numbered-step']);

      const num = createElement('div', ['step-number']);
      num.textContent = index + 1;
      step.appendChild(num);

      const strong = li.querySelector('strong');
      if (strong) {
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
function buildStatBar(fragment, { createElement, ul }) {
  const container = createElement('div', ['container']);
  const statsBar = createElement('div', ['stats-bar']);
  const row = createElement('div', ['row', 'g-4']);

  if (ul) {
    const items = ul.querySelectorAll(':scope > li');

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
