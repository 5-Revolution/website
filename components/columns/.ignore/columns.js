/*
 * Columns Component — 5th Revolution
 * Generic, reusable multi-column layout component.
 * Each CMS child <div> becomes a Bootstrap grid column.
 *
 * CMS input:
 *   N child divs, each containing content for one column.
 *   Content may include headings, lists, links, icons.
 *
 * Class patterns (on the component element):
 *   Column sizing:
 *     .6-lg-2    — Each column gets col-6 col-lg-2 (first gets offset-lg-2)
 *     .lg-4      — Each column gets col-lg-4
 *     .md-6      — Each column gets col-md-6
 *     (pattern: breakpoint-size or size-breakpoint-size)
 *
 *   Behavior:
 *     .append    — Appends columns into the previous sibling component's
 *                  container/row instead of creating its own. The empty
 *                  component element is removed from the DOM after appending.
 *
 *   Variants:
 *     .copyright — Renders as footer-bottom copyright bar
 *
 * Content transforms (in footer context):
 *   - <strong> in paragraphs becomes <h6 class="footer-heading">
 *   - <ul>/<ol> elements get .footer-links class
 *   - Links with .btn.btn-link have those classes stripped
 *   - .icon spans with <img> are wrapped in .footer-social
 */

export default async function initializeColumns(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  const isCopyright = component.classList.contains('copyright');

  if (isCopyright) {
    buildCopyrightBar(component, { createElement });
  } else {
    buildColumns(component, { createElement });
  }

  markLoaded(component, 'columns');
}

/**
 * Parse column sizing classes from the component element.
 * Patterns like "6-lg-2" become { base: 'col-6', responsive: 'col-lg-2' }.
 * Patterns like "lg-4" become { responsive: 'col-lg-4' }.
 */
function parseColumnClasses(component) {
  const classList = [...component.classList];
  const result = { base: null, responsive: null };

  for (const cls of classList) {
    if (['component', 'columns', 'copyright', 'append', 'heading', 'footing'].includes(cls)) continue;

    // Pattern: "6-lg-2" -> col-6 + col-lg-2
    const compoundMatch = cls.match(/^(\d+)-(sm|md|lg|xl|xxl)-(\d+)$/);
    if (compoundMatch) {
      result.base = `col-${compoundMatch[1]}`;
      result.responsive = `col-${compoundMatch[2]}-${compoundMatch[3]}`;
      continue;
    }

    // Pattern: "lg-4" -> col-lg-4
    const simpleMatch = cls.match(/^(sm|md|lg|xl|xxl)-(\d+)$/);
    if (simpleMatch) {
      result.responsive = `col-${simpleMatch[1]}-${simpleMatch[2]}`;
    }
  }

  return result;
}

/**
 * Determine if the first column needs an offset based on the grid math.
 * Looks at sibling components in the same parent to calculate used space.
 */
function calculateFirstColumnOffset(component, colConfig, columnCount) {
  if (!colConfig.responsive) return null;

  const parent = component.parentElement;
  if (!parent) return null;

  const sizeMatch = colConfig.responsive.match(/col-(\w+)-(\d+)$/);
  if (!sizeMatch) return null;

  const breakpoint = sizeMatch[1];
  const colSize = parseInt(sizeMatch[2], 10);

  // Find sibling components to calculate total grid usage
  const siblingComponents = parent.querySelectorAll(':scope > .component');
  let usedColumns = 0;

  siblingComponents.forEach((sibling) => {
    if (sibling === component) return;
    for (const cls of sibling.classList) {
      const match = cls.match(/^(?:sm|md|lg|xl|xxl)-(\d+)$/);
      if (match && cls.startsWith(breakpoint + '-')) {
        usedColumns += parseInt(match[1], 10);
      }
    }
  });

  const totalColumnsNeeded = columnCount * colSize;
  const remainingSpace = 12 - usedColumns - totalColumnsNeeded;

  if (remainingSpace > 0) {
    return `offset-${breakpoint}-${remainingSpace}`;
  }

  return null;
}

/**
 * Find the target row to append into when .append is set.
 * Walks backward through previous siblings to find the nearest loaded
 * component, then returns its .row element.
 */
function findAppendTarget(component) {
  let sibling = component.previousElementSibling;
  while (sibling) {
    if (sibling.classList.contains('component')) {
      return sibling.querySelector('.row');
    }
    sibling = sibling.previousElementSibling;
  }
  return null;
}

/**
 * Find the target container to append into when .append is set.
 * Walks backward through previous siblings to find the nearest loaded
 * component, then returns its .container element.
 */
function findAppendContainer(component) {
  let sibling = component.previousElementSibling;
  while (sibling) {
    if (sibling.classList.contains('component')) {
      return sibling.querySelector('.container');
    }
    sibling = sibling.previousElementSibling;
  }
  return null;
}

function buildColumns(component, { createElement }) {
  const shouldAppend = component.classList.contains('append');
  const inFooter = !!component.closest('footer');
  const colConfig = parseColumnClasses(component);
  const rows = [...component.children];
  const columnCount = rows.length;
  const firstColOffset = calculateFirstColumnOffset(component, colConfig, columnCount);

  if (shouldAppend) {
    const targetRow = findAppendTarget(component);
    if (targetRow) {
      rows.forEach((rowDiv, index) => {
        const content = rowDiv.querySelector(':scope > div');
        if (!content) return;

        const colClasses = [];
        if (colConfig.base) colClasses.push(colConfig.base);
        if (colConfig.responsive) colClasses.push(colConfig.responsive);
        if (!colConfig.base && !colConfig.responsive) colClasses.push('col');

        if (index === 0 && firstColOffset) {
          colClasses.push(firstColOffset);
        }

        const gridCol = createElement('div', colClasses);

        if (inFooter) {
          transformFooterContent(content, gridCol, { createElement });
        } else {
          while (content.firstChild) {
            gridCol.appendChild(content.firstChild);
          }
        }

        targetRow.appendChild(gridCol);
      });

      // Remove the now-empty component element from the DOM
      component.remove();
      return;
    }
    // Fallback: if no target found, render self-contained
  }

  // Self-contained: standard row
  const fragment = document.createDocumentFragment();
  const gridRow = createElement('div', ['row', 'g-4']);

  rows.forEach((rowDiv, index) => {
    const content = rowDiv.querySelector(':scope > div');
    if (!content) return;

    const colClasses = [];
    if (colConfig.base) colClasses.push(colConfig.base);
    if (colConfig.responsive) colClasses.push(colConfig.responsive);
    if (!colConfig.base && !colConfig.responsive) colClasses.push('col');

    if (index === 0 && firstColOffset) {
      colClasses.push(firstColOffset);
    }

    const gridCol = createElement('div', colClasses);

    if (inFooter) {
      transformFooterContent(content, gridCol, { createElement });
    } else {
      while (content.firstChild) {
        gridCol.appendChild(content.firstChild);
      }
    }

    gridRow.appendChild(gridCol);
  });

  fragment.appendChild(gridRow);

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(fragment);
}

/**
 * Transform CMS content for footer context:
 * - <strong> in paragraphs becomes <h6 class="footer-heading">
 * - <ul>/<ol> elements get .footer-links class
 * - Links with .btn.btn-link get those classes stripped
 * - Icon links get wrapped in .footer-social div
 */
function transformFooterContent(content, target, { createElement }) {
  const children = [...content.children];

  children.forEach((child) => {
    // Transform <p><strong>Text</strong></p> into <h6 class="footer-heading">
    if (child.tagName === 'P') {
      const strong = child.querySelector('strong');
      if (strong && child.children.length === 1) {
        const h6 = createElement('h6', ['footer-heading']);
        h6.textContent = strong.textContent;
        target.appendChild(h6);
        return;
      }
    }

    // Add footer-heading class to h6 elements
    if (child.tagName === 'H6') {
      child.classList.add('footer-heading');
      child.removeAttribute('id');
      target.appendChild(child);
      return;
    }

    // Transform lists
    if (child.tagName === 'UL' || child.tagName === 'OL') {
      child.classList.add('footer-links');

      child.querySelectorAll(':scope > li').forEach((li) => {
        const link = li.querySelector('a');
        if (!link) return;

        const iconSpan = link.querySelector('.icon');

        if (iconSpan) {
          // Social icon link: wrap in .footer-social, keep <img>
          const socialDiv = createElement('div', ['footer-social']);
          const socialLink = createElement('a', [], {
            href: link.getAttribute('href') || '#',
            target: '_blank',
            rel: 'noopener',
          });

          // Derive aria-label from icon class name
          const iconClass = [...iconSpan.classList].find((c) => c.startsWith('icon-'));
          if (iconClass) {
            const name = iconClass.replace('icon-', '');
            socialLink.setAttribute('aria-label', name.charAt(0).toUpperCase() + name.slice(1));
          }

          // Keep the <img> from the CMS
          const img = iconSpan.querySelector('img');
          if (img) socialLink.appendChild(img);

          socialDiv.appendChild(socialLink);

          // Replace the li content with the social div
          li.textContent = '';
          li.appendChild(socialDiv);
        } else {
          // Regular link: strip CMS utility classes
          link.classList.remove('btn', 'btn-link');
          if (!link.classList.length) link.removeAttribute('class');
        }
      });

      target.appendChild(child);
      return;
    }

    // Default: move element as-is
    target.appendChild(child);
  });
}

function buildCopyrightBar(component, { createElement }) {
  const shouldAppend = component.classList.contains('append');
  const row = component.children[0];
  const col = row?.querySelector(':scope > div');

  const bottomBar = createElement('div', ['footer-bottom']);
  const bottomRow = createElement('div', ['row', 'align-items-center']);
  const bottomCol = createElement('div', ['col-md-6']);

  // Move ALL children from CMS col
  if (col) {
    while (col.firstChild) bottomCol.appendChild(col.firstChild);
  }

  // Add classes to known elements
  const paragraph = bottomCol.querySelector('p');
  if (paragraph) {
    paragraph.classList.add('footer-copyright', 'mb-0');
  }

  bottomRow.appendChild(bottomCol);
  bottomBar.appendChild(bottomRow);

  if (shouldAppend) {
    const container = findAppendContainer(component);
    if (container) {
      container.appendChild(bottomBar);
      component.remove();
      return;
    }
  }

  // Fallback: self-contained
  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(bottomBar);
}
