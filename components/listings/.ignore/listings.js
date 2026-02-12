/*
 * Listings Component — 5th Revolution
 *
 * Fetches posts from a JSON source and renders article cards.
 * Heading comes from a separate CMS heading component — not generated here.
 *
 * CMS table structure:
 *   Row 1: Link to JSON source (e.g. /insights/posts-index.json)
 *   Row 2: Empty state content (shown when 0 posts — icon, heading, text)
 *
 * Schema: { data: [{ title, description, category, publish_date, tags, url, image, author }] }
 *
 * Behavior:
 *   0 posts  → Article grid not rendered, second CMS row shown as empty state
 *   1+ posts → Article cards in col-md-6 grid, empty state row removed
 *
 * Classes:
 *   .md-6, .lg-4, etc. — Column widths for cards (default: col-md-6)
 *
 * Image handling:
 *   - If post has image: responsive picture element (16:9, updatePicture)
 *   - If no image: branded SVG placeholder (slate gradient + grid + Open Star)
 */

export default async function initializeListings(component) {
  if (component.dataset.status === 'loaded') return;

  const {
    createElement,
    markLoaded,
    formatDate,
    truncateText,
    updatePicture,
    createCropConfig
  } = await import('../../../scripts/app.js');

  const source = extractSource(component);
  if (!source) {
    console.error('Listings: no JSON source found');
    markLoaded(component, 'listings');
    return;
  }

  // Capture the empty state row (row 2) before clearing
  const cmsRows = [...component.children];
  const emptyStateRow = cmsRows.length > 1 ? cmsRows[1] : null;
  const emptyStateContent = emptyStateRow ? emptyStateRow.cloneNode(true) : null;

  // Determine column classes from component classes
  const colClasses = [...component.classList]
    .filter((c) => /^(?:\d+|(?:sm|md|lg|xl|xxl)-\d+)$/.test(c))
    .map((c) => `col-${c}`);
  if (!colClasses.length) colClasses.push('col-md-6');

  // Clear CMS content
  component.innerHTML = '';

  const listings = await fetchListings(source);

  if (listings.length === 0) {
    component.appendChild(buildEmptyState(emptyStateContent, createElement));
  } else {
    component.appendChild(
      buildArticleGrid(listings, colClasses, { createElement, formatDate, truncateText, updatePicture, createCropConfig })
    );
  }

  markLoaded(component, 'listings');
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

function extractSource(component) {
  const link = component.querySelector('a[href]');
  if (!link) return null;
  const href = link.getAttribute('href');
  return href && href.split('?')[0].endsWith('.json') ? href : null;
}

async function fetchListings(source) {
  try {
    const response = await fetch(source, {
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error('Listings fetch error:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Article Grid (no heading — heading comes from CMS heading component)
// ---------------------------------------------------------------------------

function buildArticleGrid(listings, colClasses, utils) {
  const { createElement } = utils;

  const container = createElement('div', ['container']);
  const row = createElement('div', ['row', 'g-4']);

  listings.forEach((post, index) => {
    const col = createElement('div', colClasses);
    col.appendChild(buildArticleCard(post, index, utils));
    row.appendChild(col);
  });

  container.appendChild(row);
  return container;
}

function buildArticleCard(post, index, utils) {
  const { createElement, formatDate, truncateText, updatePicture, createCropConfig } = utils;

  const card = createElement('a', ['article-card'], {
    href: post.url || '#',
    title: post.title || ''
  });

  // Image
  const imageWrapper = createElement('div', ['article-card-image']);

  if (post.image) {
    const picture = createElement('picture');
    const img = createElement('img', ['article-card-img'], {
      src: post.image,
      alt: post.title || '',
      width: '600',
      height: '338',
      loading: index < 2 ? 'eager' : 'lazy'
    });
    picture.appendChild(img);

    const crop = createCropConfig(600, 338); // 16:9
    const breakpoints = [
      { width: 600, media: '(min-width: 768px)' },
      { width: 400 }
    ];
    updatePicture(picture, breakpoints, {
      context: { isCritical: index === 0 },
      crop
    });

    imageWrapper.appendChild(picture);
  } else {
    // Branded SVG placeholder
    imageWrapper.innerHTML = buildPlaceholderSVG();
  }

  card.appendChild(imageWrapper);

  // Body
  const body = createElement('div', ['article-card-body']);

  // Meta (category + date)
  const meta = createElement('div', ['article-card-meta']);
  if (post.category) {
    const cat = createElement('span', ['article-card-category']);
    cat.textContent = post.category;
    meta.appendChild(cat);
  }
  if (post.publish_date) {
    const date = createElement('span', ['article-card-date']);
    date.textContent = formatDate(post.publish_date);
    meta.appendChild(date);
  }
  body.appendChild(meta);

  // Title
  if (post.title) {
    const h3 = createElement('h3');
    h3.textContent = post.title;
    body.appendChild(h3);
  }

  // Excerpt
  if (post.description) {
    const p = createElement('p');
    p.textContent = truncateText(post.description, 200);
    body.appendChild(p);
  }

  // Read More
  const readMore = createElement('span', ['learn-more']);
  readMore.innerHTML = 'Read More <span class="arrow">&rarr;</span>';
  body.appendChild(readMore);

  card.appendChild(body);
  return card;
}

function buildPlaceholderSVG() {
  return `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(60,60)">
      <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(0)"/>
      <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(72)"/>
      <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(144)"/>
      <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(216)"/>
      <path d="M-9,-42 L0,-16 L9,-42" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" fill="none" transform="rotate(288)"/>
    </g>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Empty State (uses CMS row 2 content, or fallback)
// ---------------------------------------------------------------------------

function buildEmptyState(cmsContent, createElement) {
  const container = createElement('div', ['container']);
  const row = createElement('div', ['row', 'justify-content-center']);
  const col = createElement('div', ['col-lg-6']);
  const wrapper = createElement('div', ['coming-soon']);

  if (cmsContent) {
    // Use CMS-authored content from row 2
    const inner = cmsContent.querySelector(':scope > div') || cmsContent;
    while (inner.firstChild) wrapper.appendChild(inner.firstChild);
  } else {
    // Fallback if no CMS empty state row
    const h3 = createElement('h3');
    h3.textContent = 'More Insights on the Way';
    const p = createElement('p');
    p.textContent = "We're preparing our first insights on Adobe Experience Cloud architecture, migration strategies, and enterprise activation. Check back soon.";
    wrapper.appendChild(h3);
    wrapper.appendChild(p);
  }

  col.appendChild(wrapper);
  row.appendChild(col);
  container.appendChild(row);
  return container;
}
