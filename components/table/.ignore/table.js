/*
 * Table Component — 5th Revolution
 *
 * Transforms CMS rows/columns into a semantic HTML table.
 * First CMS row → <thead>, remaining rows → <tbody>.
 *
 * Classes (combinable):
 *   .dark-header  — Dark background header row
 *   .striped      — Alternating row backgrounds
 *   .minimal      — Borderless wrapper, thinner dividers
 */

export default async function initializeTable(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildTable(component, { createElement });
  markLoaded(component, 'table');
}

function buildTable(component, { createElement }) {
  const cmsRows = [...component.children];
  if (!cmsRows.length) return;

  const container = createElement('div', ['container']);
  const wrapper = createElement('div', ['table-wrapper']);
  const table = document.createElement('table');
  table.className = 'data-table';

  // First row → thead
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const firstCmsRow = cmsRows[0];
  const headCols = firstCmsRow ? [...firstCmsRow.children] : [];

  headCols.forEach((col) => {
    const th = document.createElement('th');
    extractCellContent(col, th);
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  // Remaining rows → tbody
  if (cmsRows.length > 1) {
    const tbody = document.createElement('tbody');

    for (let i = 1; i < cmsRows.length; i++) {
      const tr = document.createElement('tr');
      const cols = [...cmsRows[i].children];

      cols.forEach((col) => {
        const td = document.createElement('td');
        extractCellContent(col, td);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
  }

  wrapper.appendChild(table);
  container.appendChild(wrapper);

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}

function extractCellContent(cmsCol, cell) {
  // Single <p> child — unwrap for clean markup
  const children = [...cmsCol.children];
  if (children.length === 1 && children[0].tagName === 'P') {
    cell.innerHTML = children[0].innerHTML;
  } else {
    // Multi-element — move all children intact
    while (cmsCol.firstChild) cell.appendChild(cmsCol.firstChild);
  }
}
