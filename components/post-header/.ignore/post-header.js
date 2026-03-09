/*
 * Post Header Component — 5th Revolution
 *
 * Published date + social share links for insight article pages.
 * Reads publication date from <meta name="publication_date"> and
 * generates share URLs from the current page URL and title.
 *
 * CMS input (empty component block):
 *   <div class="component post-header"></div>
 *
 * No container/row/col wrapping — article pages already constrain
 * content width via the component's own max-width CSS.
 *
 * Prerender safety: when running server-side (file:// protocol),
 * share URLs use the canonical link or leave href empty so the
 * browser-side hydration produces correct URLs.
 */

export default async function initializePostHeader(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  buildPostHeader(component, { createElement });
  markLoaded(component, 'post-header');
}

function buildPostHeader(component, { createElement }) {
  // Read publication date from meta tag (try multiple name formats)
  const dateMeta = document.querySelector('meta[name="publication_date"]')
    || document.querySelector('meta[name="publication-date"]')
    || document.querySelector('meta[property="article:published_time"]');
  const dateStr = dateMeta ? dateMeta.content : '';

  // Format date (e.g., "March 19, 2026")
  let formattedDate = '';
  if (dateStr) {
    const mdyMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    const d = mdyMatch
      ? new Date(+mdyMatch[3], +mdyMatch[1] - 1, +mdyMatch[2])
      : new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }

  // Resolve page URL from canonical link (works in both prerender and browser)
  const canonical = document.querySelector('link[rel="canonical"]');
  const pageUrl = canonical ? canonical.getAttribute('href') : window.location.pathname;

  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(document.title);

  const linkedinUrl = pageUrl
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    : '#';
  const xUrl = pageUrl
    ? `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    : '#';
  const emailUrl = pageUrl
    ? `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
    : '#';

  // Build directly into the component element (no inner wrapper)
  const dateEl = createElement('div', ['post-header-date']);
  if (formattedDate) {
    dateEl.textContent = `Published: ${formattedDate}`;
  } else {
    dateEl.style.display = 'none';
  }

  const share = createElement('div', ['post-header-share']);
  share.innerHTML = `
    <span class="post-header-share-label">Share</span>
    <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn">
      <img src="/icons/linkedin.svg" alt="" width="18" height="18">
    </a>
    <a href="${xUrl}" target="_blank" rel="noopener noreferrer" aria-label="Share on X" title="Share on X">
      <img src="/icons/x.svg" alt="" width="18" height="18">
    </a>
    <a href="${emailUrl}" aria-label="Share via email" title="Share via email">
      <img src="/icons/email.svg" alt="" width="18" height="18">
    </a>
  `;

  while (component.firstChild) component.removeChild(component.firstChild);
  component.appendChild(dateEl);
  component.appendChild(share);
}
