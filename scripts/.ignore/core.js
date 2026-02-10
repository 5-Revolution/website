/*
 * Core utility functions shared across all components
 * This file contains the fundamental building blocks for component-based architecture
 */

/**
 * Creates a DOM element with classes and attributes
 * @param {string} tag - The HTML tag name
 * @param {Array} classes - Array of CSS classes to add
 * @param {Object} attributes - Object of attributes to set
 * @returns {Element} The created DOM element
 */
export function createElement(tag, classes = [], attributes = {}) {
  const element = document.createElement(tag);
  if (classes.length) element.classList.add(...classes);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

/**
 * DOM ready utility that works with both loading and interactive states
 * @param {Function} callback - Function to execute when DOM is ready
 */
export function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Marks a component as loaded and sets its data attributes
 * @param {Element} component - The component element
 * @param {string} componentName - The name of the component
 */
export function markLoaded(component, componentName) {
  if (component) {
    component.dataset.status = 'loaded';
    component.dataset.component = componentName;

    // Dispatch event for site-specific enhancements (e.g., scroll animations)
    document.dispatchEvent(new CustomEvent('component:loaded', {
      detail: { component, componentName }
    }));
  }
}

/**
 * Simple jQuery-like selector for single elements
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (defaults to document)
 * @returns {Element|null} The first matching element
 */
export function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Simple jQuery-like selector for multiple elements
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (defaults to document)
 * @returns {NodeList} All matching elements
 */
export function $$(selector, context = document) {
  return context.querySelectorAll(selector);
}

/**
 * URL-friendly slug generator
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Creates a wrapper element and transfers wrap-* classes
 * @param {Element} component - The component element
 * @param {string} componentName - The name of the component
 */
export function createWrapper(component, componentName) {
  
  const wrapper = createElement('div', ['container-fluid', `${componentName}-wrapper`]);

  // Find classes that start with 'wrap-'
  const wrapClasses = Array.from(component.classList).filter(cls => cls.startsWith('wrap-'));
  
  if (wrapClasses.length > 0) {
    // Transform wrap-* classes by removing the 'wrap-' prefix
    const transformedClasses = wrapClasses.map(cls => cls.replace(/^wrap-/, ''));
    
    wrapper.classList.add(transformedClasses);
    
    // Insert wrapper before component
    component.parentNode.insertBefore(wrapper, component);
    
    // Move component inside wrapper
    wrapper.appendChild(component);
    
    // Remove wrap-* classes from component
    wrapClasses.forEach(cls => component.classList.remove(cls));
  }
}

/**
 * Updates image parameters in a URL string
 * @param {string} url - The original URL
 * @param {string} param - Parameter name to update
 * @param {string|number} value - New parameter value
 * @returns {string} Updated URL string
 */
export function updateImageParam(url, param, value) {
  try {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set(param, value);
    return urlObj.toString();
  } catch (error) {
    console.warn('Error updating image param:', error);
    return url;
  }
}

/**
 * Creates crop configuration object for updatePicture function
 * @param {number} width - Crop width in pixels
 * @param {number} height - Crop height in pixels
 * @param {string} x - Horizontal position (default: 'center')
 * @param {string} y - Vertical position (default: 'center')
 * @param {string} resize_mode - Resize mode (default: 'cover')
 * @returns {Object} Crop configuration object
 */
export function createCropConfig(width, height, x = 'center', y = 'center', resize_mode = 'cover') {
  return {
    width: width,
    height: height,
    x: x,
    y: y,
    resize_mode: resize_mode
  };
}

/**
 * Helper function to determine original image format from URL or file extension
 * @param {string} url - Image URL
 * @returns {string} Original format (jpeg, png, webp, etc.)
 */
function getOriginalImageFormat(url) {
  // First check if format is already specified in URL parameters
  try {
    const urlObj = new URL(url, window.location.origin);
    const formatParam = urlObj.searchParams.get('format');
    if (formatParam) {
      return formatParam === 'jpg' ? 'jpeg' : formatParam;
    }
  } catch (error) {
    // Continue to file extension check
  }
  
  // Extract format from file extension
  const pathName = url.split('?')[0]; // Remove query parameters
  const extension = pathName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
  case 'jpg':
  case 'jpeg':
    return 'jpeg';
  case 'png':
    return 'png';
  case 'webp':
    return 'webp';
  case 'gif':
    return 'gif';
  case 'svg':
    return 'svg';
  default:
    return 'jpeg'; // Default fallback
  }
}

/**
 * Helper function to extract original dimensions from image URL parameters
 * @param {string} url - Image URL
 * @returns {Object|null} Original width/height or null if not found
 */
function getOriginalImageDimensions(url) {
  try {
    const urlObj = new URL(url, window.location.origin);
    const width = urlObj.searchParams.get('width');
    const height = urlObj.searchParams.get('height');
    
    if (width && height) {
      return {
        width: parseInt(width, 10),
        height: parseInt(height, 10)
      };
    }
  } catch (error) {
    // Continue to other methods
  }
  
  return null;
}

/**
 * Helper function to get container width for responsive sizing
 * @param {Element} picture - The picture element
 * @returns {number} Container width in pixels
 */
function getContainerWidth(picture) {
  // Find the containing element (usually the component)
  let container = picture.parentElement;
  
  // Walk up the DOM to find a meaningful container
  while (container && container !== document.body) {
    const computedStyle = window.getComputedStyle(container);
    const width = container.clientWidth;
    
    // Use the first container with meaningful width
    if (width > 0 && computedStyle.display !== 'contents') {
      return width;
    }
    
    container = container.parentElement;
  }
  
  // Fallback to viewport width if no container found
  return window.innerWidth;
}

/**
 * Enhanced picture element optimizer with WebP support and mobile optimization
 * Preserves original image aspect ratio and uses container-based sizing
 * Supports cropping parameters for square/custom aspect ratios
 * @param {Element} picture - The picture element to optimize
 * @param {Array} breakpoints - Custom breakpoints for responsive images
 * @param {Object} options - Configuration options
 */
export function updatePicture(picture, breakpoints = [], options = {}) {
  const { context = {}, crop = null } = options;
  const { isCritical = false, useLogicalSizing = false, columnCount = 1, containerMaxWidth = 1140 } = context;
  
  const img = picture.querySelector('img');
  if (!img || !img.src) return;

  const baseUrl = img.src;
  
  // Determine original file format for fallbacks
  const originalFormat = getOriginalImageFormat(baseUrl);
  
  // Extract original image dimensions to preserve aspect ratio
  let originalDimensions = getOriginalImageDimensions(baseUrl);
  
  // If no dimensions in URL, try to get from img attributes or natural dimensions
  if (!originalDimensions) {
    const imgWidth = img.getAttribute('width') || img.naturalWidth || 0;
    const imgHeight = img.getAttribute('height') || img.naturalHeight || 0;
    
    if (imgWidth && imgHeight) {
      originalDimensions = {
        width: parseInt(imgWidth, 10),
        height: parseInt(imgHeight, 10)
      };
    }
  }
  
  // Calculate aspect ratio from original dimensions or crop settings
  let aspectRatio;
  if (crop && crop.width && crop.height) {
    // Use crop aspect ratio if specified
    aspectRatio = crop.height / crop.width;
  } else if (originalDimensions) {
    aspectRatio = originalDimensions.height / originalDimensions.width;
  } else {
    aspectRatio = 0.75; // Default 4:3 ratio fallback
  }
  
  // Clear existing sources except img
  const existingSources = picture.querySelectorAll('source');
  existingSources.forEach(source => source.remove());
  
  // Calculate responsive widths based on container
  let desktopWidth, mobileWidth;
  
  if (useLogicalSizing) {
    // Calculate based on container and columns
    const baseWidth = containerMaxWidth / columnCount;
    desktopWidth = Math.ceil(baseWidth * 1.67); // Retina multiplier
    mobileWidth = Math.ceil(Math.min(375, 768) * 1.5); // Mobile with retina
  } else if (breakpoints.length > 0) {
    // Use provided breakpoints
    desktopWidth = breakpoints[0]?.width || 800;
    mobileWidth = breakpoints[1]?.width || 375;
  } else {
    // Measure actual container width
    const containerWidth = getContainerWidth(picture);
    const devicePixelRatio = window.devicePixelRatio || 1;
    const retina = devicePixelRatio > 1 ? 1.5 : 1;
    
    desktopWidth = Math.ceil(containerWidth * retina);
    mobileWidth = Math.ceil(Math.min(containerWidth, 375) * retina);
  }
  
  // Use custom breakpoints or create default ones
  const responsiveBreakpoints = breakpoints.length > 0 ? breakpoints : [
    { width: desktopWidth, media: '(min-width: 768px)' },
    { width: mobileWidth }
  ];
  
  // Create WebP sources for each breakpoint
  responsiveBreakpoints.forEach((bp) => {
    const source = createElement('source');
    picture.insertBefore(source, img);
    
    if (bp.media) source.setAttribute('media', bp.media);
    source.setAttribute('type', 'image/webp');
    
    let srcset = updateImageParam(baseUrl, 'width', bp.width);
    srcset = updateImageParam(srcset, 'format', 'webp');

    // Apply cropping parameters if specified
    if (crop) {
      if (crop.width && crop.height) {
        srcset = updateImageParam(srcset, 'crop', 'true');
        srcset = updateImageParam(srcset, 'crop_width', crop.width);
        srcset = updateImageParam(srcset, 'crop_height', crop.height);
        srcset = updateImageParam(srcset, 'crop_x', crop.x || 'center');
        srcset = updateImageParam(srcset, 'crop_y', crop.y || 'center');
        srcset = updateImageParam(srcset, 'resize_mode', crop.resize_mode || 'cover');
      }
    }

    // Apply optimization based on breakpoint
    if (bp.media) {
      // Desktop - medium quality
      srcset = updateImageParam(srcset, 'optimize', 'medium');
    } else {
      // Mobile - high compression
      srcset = updateImageParam(srcset, 'optimize', 'high');
    }
    
    source.setAttribute('srcset', srcset);
  });
  
  // Create fallback sources for non-WebP browsers using original format
  responsiveBreakpoints.forEach((bp, index) => {
    if (index < responsiveBreakpoints.length - 1) {
      const source = createElement('source');
      picture.insertBefore(source, img);
      
      if (bp.media) source.setAttribute('media', bp.media);
      
      let srcset = updateImageParam(baseUrl, 'width', bp.width);
      srcset = updateImageParam(srcset, 'format', originalFormat);

      // Apply cropping parameters if specified
      if (crop) {
        if (crop.width && crop.height) {
          srcset = updateImageParam(srcset, 'crop', 'true');
          srcset = updateImageParam(srcset, 'crop_width', crop.width);
          srcset = updateImageParam(srcset, 'crop_height', crop.height);
          srcset = updateImageParam(srcset, 'crop_x', crop.x || 'center');
          srcset = updateImageParam(srcset, 'crop_y', crop.y || 'center');
          srcset = updateImageParam(srcset, 'resize_mode', crop.resize_mode || 'cover');
        }
      }

      srcset = updateImageParam(srcset, 'optimize', bp.media ? 'medium' : 'high');
      
      source.setAttribute('srcset', srcset);
    }
  });
  
  // Update main img element with container-based sizing
  const finalBreakpoint = responsiveBreakpoints[responsiveBreakpoints.length - 1];
  const finalWidth = finalBreakpoint.width;
  const finalHeight = Math.round(finalWidth * aspectRatio);
  
  let imgSrc = updateImageParam(baseUrl, 'width', finalWidth);
  imgSrc = updateImageParam(imgSrc, 'format', originalFormat);

  // Apply cropping parameters to main img element if specified
  if (crop) {
    if (crop.width && crop.height) {
      imgSrc = updateImageParam(imgSrc, 'crop', 'true');
      imgSrc = updateImageParam(imgSrc, 'crop_width', crop.width);
      imgSrc = updateImageParam(imgSrc, 'crop_height', crop.height);
      imgSrc = updateImageParam(imgSrc, 'crop_x', crop.x || 'center');
      imgSrc = updateImageParam(imgSrc, 'crop_y', crop.y || 'center');
      imgSrc = updateImageParam(imgSrc, 'resize_mode', crop.resize_mode || 'cover');
    }
  }

  imgSrc = updateImageParam(imgSrc, 'optimize', 'high');
  
  img.setAttribute('src', imgSrc);
  
  // Set width and height attributes for layout stability
  img.setAttribute('width', finalWidth);
  img.setAttribute('height', finalHeight);
  
  // Set loading attributes based on critical status
  if (isCritical) {
    img.setAttribute('loading', 'eager');
    img.setAttribute('fetchpriority', 'high');
    img.setAttribute('decoding', 'sync');
  } else {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  }
}

/**
 * Processes heading content for components with "heading" class
 * @param {Element} component - The component element
 * @param {string} componentName - The name of the component
 * @returns {Object} Information about processed heading
 */
export function processHeading(component, componentName) {
  if (!component.classList.contains('heading')) {
    return { hasHeading: false, startRowIndex: 0 };
  }
  
  const rows = Array.from(component.children);
  if (rows.length === 0) return { hasHeading: false, startRowIndex: 0 };
  
  const firstRow = rows[0];
  const headingElements = firstRow.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
  
  if (headingElements.length === 0) {
    return { hasHeading: false, startRowIndex: 0 };
  }
  
  // Transform the existing first row into the heading structure
  firstRow.className = ''; // Clear existing classes
  firstRow.classList.add(`${componentName}-heading`, 'component-heading');
  
  // Add special classes for columns component
  if (componentName === 'columns') {
    firstRow.classList.add('pt-3');
  }
  
  // Extract heading content directly from nested structure
  const headingContent = [];
  headingElements.forEach(heading => {
    headingContent.push(heading.cloneNode(true));
  });
  
  // Clear the row and add heading content directly
  firstRow.innerHTML = '';
  headingContent.forEach(heading => {
    firstRow.appendChild(heading);
  });
  
  return {
    hasHeading: true,
    startRowIndex: 1
  };
}

/**
 * Processes footing content for components with "footing" class
 * @param {Element} component - The component element
 * @param {string} componentName - The name of the component
 * @returns {Object} Information about processed footing
 */
export function processFooting(component, componentName) {
  if (!component.classList.contains('footing')) {
    return { hasFooting: false, endRowIndex: -1 };
  }

  const rows = Array.from(component.children);
  if (rows.length === 0) return { hasFooting: false, endRowIndex: -1 };

  const lastRow = rows[rows.length - 1];
  const footingElements = lastRow.querySelectorAll('h1, h2, h3, h4, h5, h6, p');

  if (footingElements.length === 0) {
    return { hasFooting: false, endRowIndex: -1 };
  }

  // Transform the existing last row into the footing structure
  lastRow.className = ''; // Clear existing classes
  lastRow.classList.add(`${componentName}-footing`, 'component-footing');

  // Add special classes for columns component
  if (componentName === 'columns') {
    lastRow.classList.add('pb-3');
  }

  // Check for footing text alignment classes on component
  const footingTextAlign = Array.from(component.classList).find(cls =>
    cls.match(/^footing-text-(start|center|end)$/)
  );
  if (footingTextAlign) {
    const alignment = footingTextAlign.replace('footing-text-', 'text-');
    lastRow.classList.add(alignment);
  } else {
    // Default to text-center for footings
    lastRow.classList.add('text-center');
  }

  // Extract footing content directly from nested structure
  const footingContent = [];
  footingElements.forEach(footing => {
    footingContent.push(footing.cloneNode(true));
  });

  // Clear the row and add footing content directly
  lastRow.innerHTML = '';
  footingContent.forEach(footing => {
    lastRow.appendChild(footing);
  });

  return {
    hasFooting: true,
    endRowIndex: rows.length - 2
  };
}

/**
 * Component loading priorities and phases
 */
export const LOADING_PHASES = {
  EAGER: 'eager',     // Critical components that block LCP
  DEFERRED: 'deferred'  // All other components loaded on intersection/delay
};

/**
 * Configuration for component loading behavior
 */
export const COMPONENT_CONFIG = {
  // Viewport multiplier for determining "above fold"
  VIEWPORT_THRESHOLD: 1.2,

  // Intersection observer margin for deferred loading
  INTERSECTION_MARGIN: '200px 0px'
};

/**
 * Checks if a component is marked as critical via data-priority attribute
 * @param {Element} component - The component element
 * @returns {boolean} Whether the component is critical
 */
export function isCriticalComponent(component) {
  return component.dataset.priority === 'critical';
}

/**
 * Checks if a component is in the above-fold area
 * @param {Element} component - The component element
 * @returns {boolean} Whether the component is above fold
 */
export function isAboveFold(component) {
  const rect = component.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewportHeight * COMPONENT_CONFIG.VIEWPORT_THRESHOLD;
}

/**
 * Determines component loading priority based on type and position
 * @param {Element} component - The component element
 * @returns {string} Loading phase (eager, deferred)
 */
export function getComponentPriority(component) {
  // Check if critical (eager loading)
  if (isCriticalComponent(component)) {
    return LOADING_PHASES.EAGER;
  }
  
  // Everything else is deferred (viewport-based or delayed loading)
  return LOADING_PHASES.DEFERRED;
}

/**
 * Gets all components of a specific priority level
 * @param {string} priority - The loading phase to filter by
 * @returns {Array} Array of component elements
 */
export function getComponentsByPriority(priority) {
  const components = Array.from($$('.component')).filter(component => {
    return component.dataset.status !== 'loaded' && getComponentPriority(component) === priority;
  });

  return components;
}

/**
 * Loads a component's CSS file
 * @param {string} componentName - Name of the component
 * @returns {Promise} Promise that resolves when CSS is loaded
 */
export async function loadComponentCSS(componentName) {
  return new Promise((resolve, reject) => {
    const href = `/components/${componentName}/${componentName}.css`;
    
    // Check if already loaded
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    
    const link = createElement('link', [], {
      rel: 'stylesheet',
      href: href
    });
    
    link.onload = resolve;
    link.onerror = reject;
    
    document.head.appendChild(link);
  });
}

/**
 * Loads and initializes a component
 * @param {Element} component - The component element
 * @returns {Promise} Promise that resolves when component is loaded
 */
export async function loadComponent(component) {
  let componentName = component.classList[1]; // classList[0] is 'component'

  if (!componentName || component.dataset.status === 'loaded') return;

  component.dataset.status = 'loading';

  try {
    // Load CSS and JS in parallel
    const [, module] = await Promise.all([
      loadComponentCSS(componentName),
      import(`/components/${componentName}/${componentName}.js`)
    ]);

    // Initialize component if it has a default export function
    if (typeof module.default === 'function') {
      module.default(component);
    } else if (typeof module[`initialize${componentName.charAt(0).toUpperCase() + componentName.slice(1)}`] === 'function') {
      module[`initialize${componentName.charAt(0).toUpperCase() + componentName.slice(1)}`](component);
    }

  } catch (error) {
    console.warn(`Failed to load component ${componentName}:`, error);
    // In optimize mode, don't mark components as error - leave them statusless for retry
    if (!document.body.classList.contains('optimize')) {
      component.dataset.status = 'error';
    }
  }
}

/**
 * Component Resource Tracker
 * Shared singleton for tracking loaded CSS and JS resources across all components
 */
class ComponentResourceTracker {
  constructor() {
    this.loadedResources = {
      css: new Set(),
      js: new Set()
    };
    this.initializeLoadedResources();
  }

  initializeLoadedResources() {
    // Check for existing CSS links
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href?.includes('/components/')) {
        // Extract component name from path like "/components/hero/hero.css"
        const match = href.match(/\/components\/([^/]+)\/\1\.css$/);
        if (match) {
          this.loadedResources.css.add(match[1]);
        }
      }
    });

    // Check for existing script modules
    document.querySelectorAll('script[type="module"]').forEach(script => {
      const src = script.getAttribute('src');
      if (src?.includes('/components/')) {
        // Extract component name from path like "/components/hero/hero.js"
        const match = src.match(/\/components\/([^/]+)\/\1\.js$/);
        if (match) {
          this.loadedResources.js.add(match[1]);
        }
      }
    });
  }

  isLoaded(componentName, type) {
    return this.loadedResources[type].has(componentName);
  }

  markLoaded(componentName, type) {
    this.loadedResources[type].add(componentName);
  }
}

// Global shared resource tracker
const resourceTracker = new ComponentResourceTracker();

/**
 * Enhanced Component CSS Loading with Multiple Strategies
 * @param {Array} componentNames - Array of component names to load CSS for
 * @param {string} strategy - Loading strategy: 'preload', 'non-blocking', 'blocking'
 * @param {string} priority - Priority level for logging
 * @returns {Promise} Promise that resolves when CSS is loaded
 */
export async function loadComponentsCSS(componentNames, strategy = 'non-blocking', _priority = 'normal') {
  if (componentNames.length === 0) return;

  const cssPromises = componentNames.map(async (componentName) => {
    // Skip if already loaded
    if (resourceTracker.isLoaded(componentName, 'css')) return;

    return new Promise((resolve) => {
      const link = createElement('link', [], {
        rel: 'stylesheet',
        href: `/components/${componentName}/${componentName}.css`
      });

      // Apply loading strategy
      if (strategy === 'preload') {
        link.rel = 'preload';
        link.as = 'style';
        link.onload = () => {
          // Convert to actual stylesheet when preload completes
          const styleLink = createElement('link', [], {
            rel: 'stylesheet',
            href: link.href
          });
          styleLink.onload = () => {
            resourceTracker.markLoaded(componentName, 'css');
            resolve();
          };
          document.head.appendChild(styleLink);
        };
      } else if (strategy === 'non-blocking') {
        // Non-blocking CSS loading technique
        link.media = 'print';
        link.onload = () => {
          // Switch to active media when loaded
          setTimeout(() => {
            link.media = 'all';
          }, 0);
          resourceTracker.markLoaded(componentName, 'css');
          resolve();
        };
      } else {
        // Blocking strategy
        link.onload = () => {
          resourceTracker.markLoaded(componentName, 'css');
          resolve();
        };
      }

      link.onerror = () => {
        console.warn(`Failed to load CSS for component: ${componentName}`);
        resolve(); // Don't fail the whole batch
      };

      document.head.appendChild(link);
    });
  });

  // Don't wait for CSS in non-blocking mode - let it load in parallel
  if (strategy === 'non-blocking') {
    Promise.allSettled(cssPromises);
  } else {
    await Promise.allSettled(cssPromises);
  }
}

/**
 * Enhanced Component JS Loading and Initialization
 * @param {Array} componentNames - Array of component names to load JS for
 * @param {Element} context - Context element to search for components (optional)
 * @returns {Promise} Promise that resolves when all JS is loaded and initialized
 */
export async function loadAndInitializeComponentsJS(componentNames, context = document) {
  if (componentNames.length === 0) return;

  const jsPromises = componentNames.map(async (componentName) => {
    // Skip if already loaded
    if (resourceTracker.isLoaded(componentName, 'js')) return;

    try {
      const jsUrl = `/components/${componentName}/${componentName}.js`;
      const module = await import(jsUrl);

      // Execute component if it has default initialization function
      const components = context.querySelectorAll(`.component.${componentName}`);
      if (typeof module.default === 'function') {
        components.forEach(component => {
          if (component.dataset.status !== 'loaded') {
            module.default(component);
          }
        });
      }

      resourceTracker.markLoaded(componentName, 'js');
    } catch (error) {
      console.warn(`Failed to load JS for component: ${componentName}`, error);
    }
  });

  await Promise.all(jsPromises);
}

/**
 * Process Components in Dynamic Content
 * Discovers and loads components within a container element
 * @param {Element} container - Container element to search for components
 * @param {Array} excludeComponents - Component names to exclude from processing
 * @returns {Promise} Promise that resolves when all components are processed
 */
export async function processNestedComponents(container, excludeComponents = []) {
  // Find all components within the container
  const components = container.querySelectorAll('.component');

  if (components.length === 0) return;

  // Get unique component names using the established pattern
  const componentNames = new Set();
  components.forEach(component => {
    const classList = Array.from(component.classList);
    // Component name is always classList[1] (classList[0] is 'component')
    if (classList.length >= 2 && classList[0] === 'component') {
      const componentName = classList[1];
      // Skip excluded components (e.g., to avoid recursion)
      if (!excludeComponents.includes(componentName)) {
        componentNames.add(componentName);
      }
    }
  });

  if (componentNames.size === 0) return;

  const componentNamesArray = Array.from(componentNames);

  // Load CSS first (non-blocking), then JS
  loadComponentsCSS(componentNamesArray, 'non-blocking', 'nested');
  await loadAndInitializeComponentsJS(componentNamesArray, container);
}

/**
 * Get Resource Tracker for Advanced Use Cases
 * @returns {ComponentResourceTracker} The global resource tracker instance
 */
export function getResourceTracker() {
  return resourceTracker;
}

/**
 * Bootstrap Component Factory Functions
 * Reusable factories for creating Bootstrap 5.3 component structures
 */

/**
 * Creates a Bootstrap modal structure
 * @param {string} id - Modal ID
 * @param {string} title - Modal title
 * @param {string} content - Modal body content
 * @param {Object} options - Configuration options
 * @returns {Element} Complete modal element
 */
export function createBootstrapModal(id, title, content, options = {}) {
  const {
    size = '',
    backdrop = true,
    keyboard = true,
    fade = true,
    centered = false,
    scrollable = false
  } = options;

  const modalClasses = ['modal'];
  if (fade) modalClasses.push('fade');

  const modal = createElement('div', modalClasses, {
    id: id,
    tabindex: '-1',
    'aria-labelledby': `${id}Label`,
    'aria-hidden': 'true',
    'data-bs-backdrop': backdrop.toString(),
    'data-bs-keyboard': keyboard.toString()
  });

  const dialogClasses = ['modal-dialog'];
  if (size) dialogClasses.push(`modal-${size}`);
  if (centered) dialogClasses.push('modal-dialog-centered');
  if (scrollable) dialogClasses.push('modal-dialog-scrollable');

  const dialog = createElement('div', dialogClasses);
  const modalContent = createElement('div', ['modal-content']);

  // Header
  const header = createElement('div', ['modal-header']);
  const titleElement = createElement('h1', ['modal-title', 'fs-5'], { id: `${id}Label` });
  titleElement.textContent = title;
  const closeButton = createElement('button', ['btn-close'], {
    type: 'button',
    'data-bs-dismiss': 'modal',
    'aria-label': 'Close'
  });

  header.appendChild(titleElement);
  header.appendChild(closeButton);

  // Body
  const body = createElement('div', ['modal-body']);
  body.innerHTML = content;

  modalContent.appendChild(header);
  modalContent.appendChild(body);
  dialog.appendChild(modalContent);
  modal.appendChild(dialog);

  return modal;
}

/**
 * Creates a Bootstrap accordion structure
 * @param {string} id - Accordion ID
 * @param {Array} items - Array of {header, content} objects
 * @param {Object} options - Configuration options
 * @returns {Element} Complete accordion element
 */
export function createBootstrapAccordion(id, items, options = {}) {
  const { flush = false, alwaysOpen = false } = options;

  const accordionClasses = ['accordion'];
  if (flush) accordionClasses.push('accordion-flush');

  const accordion = createElement('div', accordionClasses, { id: id });

  items.forEach((item, index) => {
    const headingId = `${id}-heading-${index}`;
    const collapseId = `${id}-collapse-${index}`;

    const accordionItem = createElement('div', ['accordion-item']);

    // Header
    const header = createElement('h2', ['accordion-header'], { id: headingId });
    const button = createElement('button', ['accordion-button'], {
      type: 'button',
      'data-bs-toggle': 'collapse',
      'data-bs-target': `#${collapseId}`,
      'aria-expanded': index === 0 ? 'true' : 'false',
      'aria-controls': collapseId
    });

    if (index !== 0) button.classList.add('collapsed');
    button.innerHTML = item.header;
    header.appendChild(button);

    // Content
    const collapseClasses = ['accordion-collapse', 'collapse'];
    if (index === 0) collapseClasses.push('show');

    const collapse = createElement('div', collapseClasses, {
      id: collapseId,
      'aria-labelledby': headingId
    });

    if (!alwaysOpen) {
      collapse.setAttribute('data-bs-parent', `#${id}`);
    }

    const body = createElement('div', ['accordion-body']);
    body.innerHTML = item.content;

    collapse.appendChild(body);
    accordionItem.appendChild(header);
    accordionItem.appendChild(collapse);
    accordion.appendChild(accordionItem);
  });

  return accordion;
}

/**
 * Creates a Bootstrap carousel structure
 * @param {string} id - Carousel ID
 * @param {Array} slides - Array of slide objects
 * @param {Object} options - Configuration options
 * @returns {Element} Complete carousel element
 */
export function createBootstrapCarousel(id, slides, options = {}) {
  const {
    controls = true,
    indicators = true,
    fade = false,
    interval = 5000,
    keyboard = true,
    pause = 'hover',
    ride = false,
    wrap = true
  } = options;

  const carouselClasses = ['carousel', 'slide'];
  if (fade) carouselClasses.push('carousel-fade');

  const carousel = createElement('div', carouselClasses, {
    id: id,
    'data-bs-ride': ride ? 'carousel' : 'false',
    'data-bs-interval': interval.toString(),
    'data-bs-keyboard': keyboard.toString(),
    'data-bs-pause': pause,
    'data-bs-wrap': wrap.toString()
  });

  // Indicators
  if (indicators && slides.length > 1) {
    const indicatorsContainer = createElement('div', ['carousel-indicators']);
    slides.forEach((_, index) => {
      const indicator = createElement('button', [], {
        type: 'button',
        'data-bs-target': `#${id}`,
        'data-bs-slide-to': index.toString(),
        'aria-label': `Slide ${index + 1}`
      });

      if (index === 0) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'true');
      }

      indicatorsContainer.appendChild(indicator);
    });
    carousel.appendChild(indicatorsContainer);
  }

  // Slides
  const inner = createElement('div', ['carousel-inner']);
  slides.forEach((slide, index) => {
    const slideClasses = ['carousel-item'];
    if (index === 0) slideClasses.push('active');

    const slideElement = createElement('div', slideClasses);
    slideElement.innerHTML = slide.content;

    if (slide.caption) {
      const caption = createElement('div', ['carousel-caption', 'd-none', 'd-md-block']);
      caption.innerHTML = slide.caption;
      slideElement.appendChild(caption);
    }

    inner.appendChild(slideElement);
  });
  carousel.appendChild(inner);

  // Controls
  if (controls && slides.length > 1) {
    const prevButton = createElement('button', ['carousel-control-prev'], {
      type: 'button',
      'data-bs-target': `#${id}`,
      'data-bs-slide': 'prev'
    });
    prevButton.innerHTML = `
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    `;

    const nextButton = createElement('button', ['carousel-control-next'], {
      type: 'button',
      'data-bs-target': `#${id}`,
      'data-bs-slide': 'next'
    });
    nextButton.innerHTML = `
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    `;

    carousel.appendChild(prevButton);
    carousel.appendChild(nextButton);
  }

  return carousel;
}

/**
 * Creates a Bootstrap card structure
 * @param {Object} cardData - Card content data
 * @param {Object} options - Configuration options
 * @returns {Element} Complete card element
 */
export function createBootstrapCard(cardData, options = {}) {
  const {
    headerTag = 'h5',
    textMuted = false,
    border = '',
    textAlign = '',
    bg = '',
    text = ''
  } = options;

  const cardClasses = ['card'];
  if (border) cardClasses.push(`border-${border}`);
  if (bg) cardClasses.push(`bg-${bg}`);
  if (text) cardClasses.push(`text-${text}`);

  const card = createElement('div', cardClasses);

  // Header (optional)
  if (cardData.header) {
    const header = createElement('div', ['card-header']);
    header.innerHTML = cardData.header;
    card.appendChild(header);
  }

  // Image (optional)
  if (cardData.image) {
    const img = createElement('img', ['card-img-top'], {
      src: cardData.image.src,
      alt: cardData.image.alt || ''
    });
    card.appendChild(img);
  }

  // Body
  if (cardData.title || cardData.text || cardData.content) {
    const bodyClasses = ['card-body'];
    if (textAlign) bodyClasses.push(`text-${textAlign}`);

    const body = createElement('div', bodyClasses);

    if (cardData.title) {
      const titleClasses = ['card-title'];
      if (textMuted) titleClasses.push('text-muted');

      const title = createElement(headerTag, titleClasses);
      title.innerHTML = cardData.title;
      body.appendChild(title);
    }

    if (cardData.text) {
      const text = createElement('p', ['card-text']);
      text.innerHTML = cardData.text;
      body.appendChild(text);
    }

    if (cardData.content) {
      const content = createElement('div');
      content.innerHTML = cardData.content;
      body.appendChild(content);
    }

    card.appendChild(body);
  }

  // Footer (optional)
  if (cardData.footer) {
    const footer = createElement('div', ['card-footer']);
    footer.innerHTML = cardData.footer;
    card.appendChild(footer);
  }

  return card;
}

/**
 * Common Utility Functions
 * Frequently used utilities extracted from components for reusability
 */

/**
 * Formats a date string using locale-specific formatting
 * @param {string} dateString - Date string to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Truncates text to a specified length with word boundary preservation
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string} Truncated text with ellipsis
 */
export function truncateText(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace === -1 ? truncated + '...' : truncated.substring(0, lastSpace) + '...';
}

/**
 * Creates a Bootstrap badge element with configurable styling
 * @param {string} text - Badge text content
 * @param {Object} options - Badge styling options
 * @returns {Element} Bootstrap badge element
 */
export function createBadge(text, options = {}) {
  const {
    variant = 'secondary',
    outline = false,
    size = 'small',
    spacing = 'me-2 mb-1'
  } = options;

  const classes = ['badge', size];

  // Split spacing string into individual classes
  if (spacing) {
    classes.push(...spacing.split(' ').filter(cls => cls.trim()));
  }

  if (outline) {
    classes.push(`bg-${variant}`, 'bg-opacity-10', `text-${variant}`);
  } else {
    classes.push(`bg-${variant}`, variant === 'secondary' ? 'text-white' : '');
  }

  const badge = createElement('span', classes.filter(Boolean));
  badge.textContent = text;
  return badge;
}

/**
 * Extracts JSON-LD structured data from the document
 * @param {string} type - Type of data to extract (e.g., 'BlogPosting', 'Person')
 * @param {string} property - Specific property to extract
 * @returns {*} Extracted data or null if not found
 */
export function extractJsonLd(type = null, property = null) {
  try {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');

    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          // If type is specified, filter by @type
          if (type && item['@type'] !== type) continue;

          // If property is specified, return that specific property
          if (property) {
            return item[property] || null;
          }

          // Return the entire item if no specific property requested
          return item;
        }
      } catch (parseError) {
        console.warn('Error parsing JSON-LD script:', parseError);
      }
    }
  } catch (error) {
    console.warn('Error extracting JSON-LD data:', error);
  }

  return null;
}

/**
 * Extracts author information from JSON-LD BlogPosting data
 * @returns {Object|null} Author information object or null
 */
export function extractAuthorFromJsonLd() {
  try {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');

    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          if (item.author && item.author.name) {
            return {
              name: item.author.name,
              image: item.author.image?.url || null,
              title: item.author.description || item.author.jobTitle || 'Business and Technology Leader focused on Transformation, Growth, and Strategy'
            };
          }
        }
      } catch (parseError) {
        console.warn('Error parsing JSON-LD for author data:', parseError);
      }
    }
  } catch (error) {
    console.warn('Error extracting author from JSON-LD:', error);
  }

  return null;
}

/**
 * Extracts publication date from JSON-LD data
 * @returns {string|null} Formatted publication date or null
 */
export function extractPublishDateFromJsonLd() {
  try {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');

    for (const script of jsonLdScripts) {
      try {
        const data = JSON.parse(script.textContent);
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          if (item.datePublished) {
            return formatDate(item.datePublished);
          }
        }
      } catch (parseError) {
        console.warn('Error parsing JSON-LD for publish date:', parseError);
      }
    }
  } catch (error) {
    console.warn('Error extracting publish date from JSON-LD:', error);
  }

  return null;
}

/**
 * Creates loading state placeholder element
 * @param {string} text - Loading text (default: 'Loading...')
 * @returns {Element} Loading state element
 */
export function createLoadingState(text = 'Loading...') {
  const loading = createElement('div', ['text-center', 'p-4']);
  const spinner = createElement('div', ['spinner-border', 'spinner-border-sm', 'me-2'], {
    role: 'status'
  });
  const screenReader = createElement('span', ['visually-hidden']);
  screenReader.textContent = text;
  spinner.appendChild(screenReader);

  const loadingText = createElement('span');
  loadingText.textContent = text;

  loading.appendChild(spinner);
  loading.appendChild(loadingText);
  return loading;
}

/**
 * Creates error state placeholder element
 * @param {string} message - Error message
 * @returns {Element} Error state element
 */
export function createErrorState(message = 'Failed to load content. Please try again later.') {
  const error = createElement('div', ['alert', 'alert-warning', 'text-center', 'mx-3']);
  error.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i>${message}`;
  return error;
}

/**
 * Creates empty state placeholder element
 * @param {string} message - Empty state message
 * @returns {Element} Empty state element
 */
export function createEmptyState(message = 'No content available.') {
  const empty = createElement('div', ['text-center', 'text-muted', 'p-4']);
  empty.innerHTML = `<i class="bi bi-inbox me-2"></i>${message}`;
  return empty;
}

/**
 * Global JSON Fetch Utility with Optional Chunking
 * @param {string} url - The URL to fetch
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Response object with success, data, status, url
 */
export async function jsonFetch(url, options = {}) {
  const {
    chunk = false,
    chunkSize = 50,
    cache = 'default',
    method = 'GET',
    headers = {},
    ...fetchOptions
  } = options;

  try {
    // Non-chunked request (current behavior)
    if (!chunk) {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...headers
        },
        cache,
        ...fetchOptions
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        status: response.status,
        url: response.url
      };
    }

    // Chunked request for large datasets
    const results = [];
    let offset = 0;
    let total = Infinity;
    let finalStatus = 200;
    let finalUrl = url;

    while (offset < total) {
      const params = new URLSearchParams({ offset, limit: chunkSize });
      const chunkUrl = `${url}${url.includes('?') ? '&' : '?'}${params}`;
      
      const response = await fetch(chunkUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...headers
        },
        cache,
        ...fetchOptions
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const chunk = await response.json();
      
      // Extract total from various possible fields
      total = chunk.total || chunk.totalItems || chunk.data?.length || total;
      
      // Extract items from various possible structures
      const items = chunk.data || chunk.results || chunk.items || [];
      if (Array.isArray(items)) {
        results.push(...items);
      } else if (Array.isArray(chunk)) {
        results.push(...chunk);
      }
      
      finalStatus = response.status;
      finalUrl = response.url;
      offset += chunkSize;
      
      // Safety break if no items returned
      if (items.length === 0) break;
    }

    return {
      success: true,
      data: {
        data: results,
        totalItems: total,
        chunked: true
      },
      status: finalStatus,
      url: finalUrl
    };

  } catch (error) {
    console.error('JSON fetch error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Critical Component Executor
 * Handles immediate execution of preloaded critical components
 */
export class CriticalExecutor {
  constructor() {
    this.executedComponents = new Set();
  }

  /**
   * Execute all critical components immediately
   * Called when app.js loads (critical components should be preloaded)
   */
  executeImmediate() {
    // Skip if critical execution already completed (prerendered)
    if (document.body.classList.contains('critical-executed')) {
      return 0;
    }

    const criticalComponents = this.discoverCriticalComponents();

    // Execute all critical components synchronously for immediate effect
    criticalComponents.forEach(component => {
      this.executeSingleComponent(component);
    });

    // Signal critical execution complete
    if (criticalComponents.length > 0) {
      document.body.classList.add('critical-executed');
      document.dispatchEvent(new CustomEvent('critical:executed', {
        detail: { components: criticalComponents }
      }));
    }

    return criticalComponents.length;
  }

  /**
   * Discover all critical components that need immediate execution
   */
  discoverCriticalComponents() {
    const criticalComponents = Array.from($$('.component')).filter(component => {
      return isCriticalComponent(component) && !this.executedComponents.has(component) && component.dataset.status !== 'loaded';
    });

    return criticalComponents;
  }

  /**
   * Execute a single critical component
   * Loads CSS and JS in parallel, then initializes
   */
  executeSingleComponent(component) {
    if (this.executedComponents.has(component)) return;

    const componentName = component.classList[1];
    if (!componentName) return;

    this.executedComponents.add(component);
    component.dataset.status = 'executing';

    try {
      // Load CSS and JS in parallel
      loadComponentCSS(componentName);
      import(`/components/${componentName}/${componentName}.js`)
        .then(module => {
          // Execute component initialization
          if (typeof module.default === 'function') {
            module.default(component);
          } else if (typeof module[`initialize${componentName.charAt(0).toUpperCase() + componentName.slice(1)}`] === 'function') {
            module[`initialize${componentName.charAt(0).toUpperCase() + componentName.slice(1)}`](component);
          }

        })
        .catch(_error => {
          // In optimize mode, don't mark components as error - leave them statusless for retry
          if (!document.body.classList.contains('optimize')) {
            component.dataset.status = 'error';
          }
        });

    } catch (error) {
      // In optimize mode, don't mark components as error - leave them statusless for retry
      if (!document.body.classList.contains('optimize')) {
        component.dataset.status = 'error';
      }
    }
  }
}

/**
 * Deferred Component Loader
 * Handles on-demand loading and execution of non-critical components
 */
export class DeferredLoader {
  constructor() {
    this.observer = null;
    this.loadedComponents = new Set();
    this.observedComponents = new Set();
    this.setupIntersectionObserver();
  }

  /**
   * Setup intersection observer for deferred component loading
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      this.fallbackLoading();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadAndExecuteComponent(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '250px 0px', // Load components before they come into view
        threshold: 0
      }
    );

    // Don't call observeNonCriticalComponents here - let orchestrator control timing
    
  }

  /**
   * Observe all non-critical components for intersection-based loading
   * If page has 'optimize' class, load all components immediately
   */
  observeNonCriticalComponents() {
    const deferredComponents = Array.from($$('.component')).filter(component => {
      return !isCriticalComponent(component) &&
             component.dataset.status !== 'loaded' &&
             !this.loadedComponents.has(component);
    });

    // CRITICAL FIX: Discover nested components with data-status="loading" inside loaded parents
    // This handles cases where prerendering marked parents as "loaded" but children are still "loading"
    // Only search inside containers that are already loaded (like footer)
    const loadedContainers = Array.from($$('[data-status="loaded"]'));
    const nestedLoadingComponents = [];

    loadedContainers.forEach(container => {
      const nested = Array.from(container.querySelectorAll('.component[data-status="loading"]'));
      nestedLoadingComponents.push(...nested);
    });

    // Add nested components that aren't already in deferredComponents
    nestedLoadingComponents.forEach(component => {
      if (!this.loadedComponents.has(component) && !deferredComponents.includes(component)) {
        deferredComponents.push(component);
      }
    });

    // If page is optimize, load all components immediately without intersection observer
    if (document.body.classList.contains('optimize')) {
      deferredComponents.forEach(component => {
        this.loadAndExecuteComponent(component);
      });
      return deferredComponents.length;
    }

    // CRITICAL FIX: Components nested inside loaded containers need to load immediately
    // These are components blocked during prerendering that need to complete initialization
    // Regular deferred components use intersection observer
    const immediateComponents = deferredComponents.filter(c => nestedLoadingComponents.includes(c));
    const observableComponents = deferredComponents.filter(c => !nestedLoadingComponents.includes(c));

    // Load nested components immediately (they're inside already-visible containers)
    immediateComponents.forEach(component => {
      this.loadAndExecuteComponent(component);
    });

    // Normal intersection observer behavior for regular deferred components
    observableComponents.forEach(component => {
      if (!this.observedComponents.has(component)) {
        this.observedComponents.add(component);
        this.observer.observe(component);
      }
    });

    return deferredComponents.length;
  }

  /**
   * Load and execute a deferred component on-demand
   */
  async loadAndExecuteComponent(component) {
    if (this.loadedComponents.has(component)) {
      return;
    }

    this.loadedComponents.add(component);

    try {
      // Use core loading mechanism (loads CSS + JS, then executes)
      await loadComponent(component);
    } catch (error) {
      this.loadedComponents.delete(component); // Allow retry
    }
  }

  /**
   * Fallback loading for browsers without IntersectionObserver
   */
  fallbackLoading() {
    setTimeout(() => {
      const deferredComponents = Array.from($$('.component')).filter(component => {
        return !isCriticalComponent(component) &&
               component.dataset.status !== 'loaded' &&
               !this.loadedComponents.has(component);
      });

      const promises = deferredComponents.map(component =>
        this.loadAndExecuteComponent(component).catch(_error => {
          // Silently catch errors - component loading failures are handled internally
        })
      );

      Promise.allSettled(promises);
    }, 1000);
  }
}

/**
 * Progressive Enhancement Utilities
 * Handles enhanced behaviors and heavy dependencies
 */
export class ProgressiveEnhancement {
  /**
   * Load Google Tag Manager
   * Skips loading if body has 'optimize' class
   * @param {string} gtmId - Google Tag Manager ID (e.g., 'GTM-XXXXXXX')
   */
  static loadGoogleTagManager(gtmId) {
    // Skip GTM in optimize mode
    if (document.body.classList.contains('optimize')) {
      return;
    }

    // Skip if no GTM ID provided
    if (!gtmId) {
      return;
    }

    // Skip if GTM already loaded
    if (window.google_tag_manager) {
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // Load GTM script
    const script = createElement('script', [], { async: true });
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  /**
   * Setup navigation behaviors (Progressive Enhancement)
   */
  static setupNavigationBehaviors() {
    ProgressiveEnhancement.setupSmoothScrolling();
  }

  /**
   * Setup smooth scrolling for anchor links
   */
  static setupSmoothScrolling() {
    const anchorLinks = $$('a[href^="#"]');
    
    anchorLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        
        if (href === '#' || href.length <= 1) return;
        if (link.closest('.navbar, .nav') || link.hasAttribute('data-bs-toggle') || link.hasAttribute('data-url')) {
          return;
        }
        
        const target = $(href);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Setup modal handlers for dynamic content
   */
  static setupModalHandlers() {
    document.addEventListener('click', async (event) => {
      const button = event.target.closest('button[data-url]');
      if (!button) return;

      const dataUrl = button.getAttribute('data-url');
      if (!dataUrl || !dataUrl.startsWith('/modals/')) return;

      event.preventDefault();

      try {
        button.dispatchEvent(new CustomEvent('modal:trigger', {
          detail: { url: dataUrl, button: button },
          bubbles: true
        }));
      } catch (error) {
        console.error('Failed to trigger modal:', error);
        alert('Sorry, there was an error loading the modal. Please try again.');
      }
    });
  }

  /**
   * Load heavy dependencies (Bootstrap, lazy CSS, modals)
   */
  static async loadHeavyDependencies() {
    
    try {
      await Promise.allSettled([
        ProgressiveEnhancement.loadBootstrap(),
        ProgressiveEnhancement.loadLazyCSS(),
        ProgressiveEnhancement.loadModalSystem()
      ]);
      
    } catch (error) {
      console.warn('Some heavy dependencies failed to load:', error);
    }
  }

  /**
   * Load Bootstrap JavaScript
   */
  static async loadBootstrap() {
    if (typeof window.bootstrap !== 'undefined') return;
    
    try {
      await import('/scripts/bootstrap.js');
    } catch (error) {
      console.warn('Failed to load Bootstrap:', error);
    }
  }

  /**
   * Load lazy CSS
   */
  static async loadLazyCSS() {
    return new Promise((resolve, reject) => {
      const href = '/styles/lazy.css';
      
      if ($(`link[href="${href}"]`)) {
        resolve();
        return;
      }
      
      const link = createElement('link', [], {
        rel: 'stylesheet',
        href: href
      });
      
      link.onload = () => {
        resolve();
      };
      link.onerror = reject;
      
      document.head.appendChild(link);
    });
  }

  /**
   * Load modal system
   */
  static async loadModalSystem() {
    try {
      const modalModule = await import('/components/modals/modals.js');
      modalModule.default(); // Call the initialization function
    } catch (error) {
      console.warn('Failed to load modal system:', error);
    }
  }
}

/**
 * Execution Orchestrator
 * Controls the sequential loading of components based on priority
 */
export class ExecutionOrchestrator {
  constructor(config = {}) {
    this.criticalExecutor = new CriticalExecutor();
    this.deferredLoader = new DeferredLoader();
    this.config = config; // Site-specific configuration (optional)
  }

  /**
   * Initialize the execution orchestrator
   * Uses async sequential loading based on priority, not timing
   */
  async init() {
    // Phase 0: Ensure CSS is loaded for all components (handles prerendered pages)
    this.ensureAllComponentCSS();

    // Phase 1: Execute critical components immediately
    this.criticalExecutor.executeImmediate();

    // Phase 2: Preload non-critical CSS (non-blocking, runs in parallel)
    this.preloadNonCriticalCSS();

    // Phase 3: Setup deferred component loading
    this.deferredLoader.observeNonCriticalComponents();

    // Phase 4: Setup navigation behaviors
    ProgressiveEnhancement.setupNavigationBehaviors();

    // Phase 5: Site-specific scroll animations (handled in app.js SiteOrchestrator)

    // Phase 6: Load heavy dependencies (await completion before analytics)
    await ProgressiveEnhancement.loadHeavyDependencies();
    ProgressiveEnhancement.setupModalHandlers();

    // Phase 7: Load analytics if configured
    if (this.config.analytics?.gtmId) {
      ProgressiveEnhancement.loadGoogleTagManager(this.config.analytics.gtmId);
    }

    return this;
  }

  /**
   * Ensure CSS is loaded for all components on the page
   * Handles prerendered pages where components are already loaded but CSS link tags
   * may not be present (prerender only captures body HTML, not dynamic head links)
   */
  ensureAllComponentCSS() {
    const components = Array.from($$('.component'));
    components.forEach(component => {
      const name = component.classList[1];
      if (name) loadComponentCSS(name);
    });
  }

  /**
   * Preload CSS for all non-critical components and lazy styles
   * Discovers all non-critical components on the page and loads their CSS
   * Uses non-blocking strategy to avoid interfering with critical path
   * Excludes components that were already loaded as critical
   * Skips CSS loading entirely if body has 'optimize' class (for pre-rendering)
   */
  preloadNonCriticalCSS() {
    // Skip CSS loading in optimize mode (CSS should be inlined or preloaded by CMS)
    if (document.body.classList.contains('optimize')) {
      return;
    }

    // Get all non-critical components (excludes critical components and already-loaded ones)
    const allComponents = Array.from($$('.component'));
    const nonCriticalComponents = allComponents.filter(component => {
      return !isCriticalComponent(component) && component.dataset.status !== 'loaded';
    });

    // Extract unique component names
    const componentNames = new Set();
    nonCriticalComponents.forEach(component => {
      const componentName = component.classList[1]; // classList[0] is 'component'
      if (componentName) {
        componentNames.add(componentName);
      }
    });

    // Load CSS for all non-critical components using non-blocking strategy
    // The loadComponentsCSS function already checks the resource tracker to avoid duplicate loading
    if (componentNames.size > 0) {
      loadComponentsCSS(Array.from(componentNames), 'non-blocking', 'deferred');
    }

    // Also load lazy.css using non-blocking strategy
    this.loadLazyCSS();
  }

  /**
   * Load lazy CSS using non-blocking strategy
   * Can be overridden by site-specific implementations to customize the path
   * Skips loading if body has 'optimize' class (for pre-rendering)
   */
  loadLazyCSS() {
    // Skip CSS loading in optimize mode
    if (document.body.classList.contains('optimize')) {
      return;
    }

    const href = '/styles/lazy.css';

    // Check if already loaded
    if ($(`link[href="${href}"]`)) {
      return;
    }

    const link = createElement('link', [], {
      rel: 'stylesheet',
      href: href,
      media: 'print'
    });

    link.onload = () => {
      // Switch to active media when loaded (non-blocking technique)
      setTimeout(() => {
        link.media = 'all';
      }, 0);
    };

    document.head.appendChild(link);
  }

  /**
   * Manual execution for specific components (if needed)
   */
  executeComponent(component) {
    if (isCriticalComponent(component)) {
      this.criticalExecutor.executeSingleComponent(component);
    } else {
      this.deferredLoader.loadAndExecuteComponent(component);
    }
  }
}