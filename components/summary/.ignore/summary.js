/*
 * Summary Component — 5th Revolution
 *
 * AI-generated summary callout for insight articles. Appears at the top of
 * article content with a sparkle icon and "AI Summary" label.
 * Decoration only: builds the summary box HTML structure.
 * Expand/collapse interactivity is handled by app.js (setupSummaryToggle).
 *
 * CMS input (single column):
 *   <div><div>
 *     <p>Summary paragraph text...</p>
 *   </div></div>
 *
 * No container/row/col wrapping — article pages already constrain
 * content width via parent section CSS.
 */

export default async function initializeSummary(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  // CMS renders this as a <summary> element — override its interactive role
  component.setAttribute('role', 'region');
  component.setAttribute('aria-label', 'AI Summary');

  buildSummary(component, { createElement });
  markLoaded(component, 'summary');
}

function buildSummary(component, { createElement }) {
  // Find the CMS content column: a bare div > div (no classes) containing the content.
  // Skip any injected elements (e.g., post-header) which have classes on them.
  const cmsRow = Array.from(component.children).find(
    (el) => el.tagName === 'DIV' && !el.className,
  );
  const cmsCol = cmsRow?.querySelector(':scope > div');
  if (!cmsCol) return;

  const box = createElement('div', ['ai-summary-box']);

  // Label with sparkle icon
  const label = createElement('div', ['ai-summary-label']);
  label.innerHTML = `
    <svg class="ai-summary-icon" viewBox="0 0 16 16" width="16" height="16"
         fill="currentColor" aria-hidden="true">
      <path d="M8 0L9.4 6.6L16 8L9.4 9.4L8 16L6.6 9.4L0 8L6.6 6.6Z"/>
    </svg>
    <span>AI Summary</span>
  `;

  // Content wrapper — starts clamped via CSS
  const content = createElement('div', ['ai-summary-content', 'ai-summary-clamped']);
  while (cmsCol.firstChild) content.appendChild(cmsCol.firstChild);

  // Show more / Show less toggle (span to avoid interactive-in-summary warning)
  const toggle = createElement('span', ['ai-summary-toggle']);
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('tabindex', '0');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Show more';

  // Disclaimer footer
  const footer = createElement('div', ['ai-summary-footer']);
  footer.textContent = 'Summary is AI generated and may contain inaccuracies.';

  box.appendChild(label);
  box.appendChild(content);
  box.appendChild(toggle);
  box.appendChild(footer);

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(box);
}
