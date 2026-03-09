/*
 * Accordions Component — 5th Revolution
 *
 * Transforms CMS two-column rows into expandable accordion items.
 * Each CMS row: col1 = question (strong-wrapped), col2 = answer content.
 *
 * Classes:
 *   .open-first  — First item starts expanded
 *   .open-all    — All items start expanded; multiple can remain open
 *   .bordered    — Visible border separators
 *   .lg-6, .lg-10 — Column width (default: col-lg-8)
 */

export default async function initializeAccordions(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildAccordions(component, { createElement });
  markLoaded(component, 'accordions');
}

function buildAccordions(component, { createElement }) {
  const openFirst = component.classList.contains('open-first');
  const openAll = component.classList.contains('open-all');

  // Determine column width from component classes
  const colClass = [...component.classList]
    .filter((c) => /^(?:lg|md|xl)-\d+$/.test(c))
    .map((c) => `col-${c}`);
  if (!colClass.length) colClass.push('col-lg-12');

  // CMS may add 'container' class — remove it so we control the container
  component.classList.remove('container');

  const cmsRows = [...component.children];
  const container = createElement('div', ['container']);
  const row = createElement('div', ['row', 'justify-content-center']);
  const col = createElement('div', colClass);
  const group = createElement('div', ['accordion-group']);

  // Generate unique ID prefix
  const idPrefix = `acc-${Math.random().toString(36).substring(2, 8)}`;

  cmsRows.forEach((rowDiv, index) => {
    const cols = rowDiv.children;
    if (cols.length < 2) return;

    const questionCol = cols[0];
    const answerCol = cols[1];

    // Extract question text (strip <strong> wrapper)
    const strong = questionCol.querySelector('strong');
    const questionText = strong ? strong.textContent.trim() : questionCol.textContent.trim();

    const isOpen = openAll || (openFirst && index === 0);
    const panelId = `${idPrefix}-${index}`;

    // Build accordion item
    const item = createElement('div', ['accordion-item']);

    // Trigger button
    const trigger = createElement('button', ['accordion-trigger'], {
      'aria-expanded': String(isOpen),
      'aria-controls': panelId,
      type: 'button',
    });

    const questionSpan = createElement('span', ['accordion-question']);
    questionSpan.textContent = questionText;

    const iconSpan = createElement('span', ['accordion-icon']);
    iconSpan.setAttribute('aria-hidden', 'true');

    trigger.appendChild(questionSpan);
    trigger.appendChild(iconSpan);

    // Panel
    const panel = createElement('div', ['accordion-panel'], {
      id: panelId,
      role: 'region',
      'aria-hidden': String(!isOpen),
    });

    const body = createElement('div', ['accordion-body']);

    // Move ALL children from answer col into body (preserves all content)
    while (answerCol.firstChild) body.appendChild(answerCol.firstChild);

    panel.appendChild(body);

    // Set initial expanded state
    if (isOpen) {
      panel.style.height = 'auto';
    }

    item.appendChild(trigger);
    item.appendChild(panel);
    group.appendChild(item);

    // Attach click handler
    trigger.addEventListener('click', () => {
      toggleAccordion(trigger, panel, group, openAll);
    });
  });

  col.appendChild(group);
  row.appendChild(col);
  container.appendChild(row);

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(container);
}

function toggleAccordion(trigger, panel, group, allowMultiple) {
  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

  if (isExpanded) {
    collapsePanel(trigger, panel);
  } else {
    // Close others first (unless allowMultiple)
    if (!allowMultiple) {
      const openTriggers = group.querySelectorAll('.accordion-trigger[aria-expanded="true"]');
      openTriggers.forEach((t) => {
        const p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) collapsePanel(t, p);
      });
    }
    expandPanel(trigger, panel);
  }
}

function expandPanel(trigger, panel) {
  trigger.setAttribute('aria-expanded', 'true');
  panel.setAttribute('aria-hidden', 'false');

  // Animate height from 0 to scrollHeight
  panel.style.height = '0px';
  panel.style.overflow = 'hidden';

  // Force reflow
  // eslint-disable-next-line no-unused-expressions
  panel.offsetHeight;

  panel.style.height = `${panel.scrollHeight}px`;

  const onEnd = () => {
    panel.removeEventListener('transitionend', onEnd);
    panel.style.height = 'auto';
    panel.style.overflow = '';
  };
  panel.addEventListener('transitionend', onEnd, { once: true });
}

function collapsePanel(trigger, panel) {
  trigger.setAttribute('aria-expanded', 'false');
  panel.setAttribute('aria-hidden', 'true');

  // Lock current height, then animate to 0
  // Use rAF to ensure the browser has painted the explicit height
  // before transitioning to 0 (fixes missing close easing)
  panel.style.height = `${panel.scrollHeight}px`;
  panel.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      panel.style.height = '0px';
    });
  });

  const onEnd = () => {
    panel.removeEventListener('transitionend', onEnd);
    panel.style.overflow = '';
  };
  panel.addEventListener('transitionend', onEnd, { once: true });
}

// ---------------------------------------------------------------------------
// Hydration — attach event listeners to pre-rendered accordion HTML
// ---------------------------------------------------------------------------
export function hydrateAccordions(component) {
  const group = component.querySelector('.accordion-group');
  if (!group) return;

  const allowMultiple = component.classList.contains('open-all');

  group.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    if (trigger.dataset.hydrated) return;
    trigger.dataset.hydrated = '1';

    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;

    trigger.addEventListener('click', () => {
      toggleAccordion(trigger, panel, group, allowMultiple);
    });
  });
}
