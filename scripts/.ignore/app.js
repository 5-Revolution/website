/*
 * App.js — 5th Revolution Site Configuration and Initialization
 *
 * Gateway pattern: re-exports core.js so components import from app.js.
 * Adds site-specific scroll animations, navbar brand animation, and orchestration.
 */

// 1. Gateway — re-export all core utilities for components
import * as core from './core.js';
export * from './core.js';

// 2. Site Configuration
const SITE_CONFIG = {
  criticalComponents: ['nav'],
  navigation: {
    autoCloseOffcanvas: true,
    smoothScrolling: true,
  },
  analytics: {
    // gtmId: 'GTM-XXXXXXX'  // Uncomment when ready
  },
};

// ============================================
// 3. Site-Specific Scroll Animations
// GSAP ScrollTrigger + Lenis Smooth Scroll
// ============================================
class SiteScrollAnimations {
  constructor() {
    this.lenis = null;
    this.initialized = false;
    this.prefersReducedMotion = false;
    this.config = {
      duration: { fast: 0.3, normal: 0.5, slow: 0.6 },
      ease: 'power2.out',
      stagger: { cards: 0.12, list: 0.08, grid: 0.1 },
      triggerStart: 'top 85%',
      triggerStartEarly: 'top 90%',
      mobileBreakpoint: 768,
      smoothScrollMobile: false,
    };
  }

  init() {
    if (document.body.classList.contains('optimize')) return;
    if (this.initialized) return;
    this.initialized = true;

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (this.prefersReducedMotion && this.lenis) {
        this.lenis.destroy();
        this.lenis = null;
      }
    });

    this.initLenis();
    // Initial states are handled by CSS (main.scss) — no gsap.set() needed.
    // This prevents the flash where content appears then hides when GSAP loads.
    this.animateAll();
    this.setupResize();

    // Re-run animations when deferred components load (they create new elements).
    // Only animateAll() — CSS already hides new elements. newElements() prevents duplicates.
    document.addEventListener('component:loaded', () => {
      this.animateAll();
    });
  }

  isMobile() {
    return window.innerWidth < this.config.mobileBreakpoint;
  }

  initLenis() {
    if (this.isMobile() && !this.config.smoothScrollMobile) return;
    if (this.prefersReducedMotion) return;
    if (typeof Lenis === 'undefined') return;

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // Helper: filter elements that haven't been animated yet, mark them
  newElements(selector) {
    return gsap.utils.toArray(selector).filter((el) => {
      if (el.dataset.gsapAnimated) return false;
      el.dataset.gsapAnimated = '1';
      return true;
    });
  }

  animateAll() {
    if (this.prefersReducedMotion) return;
    if (typeof gsap === 'undefined') return;

    this.animateSectionHeaders();
    this.animateCardItems();
    this.animateStats();
    this.animateBulletedLists();
    this.animateDarkBlocks();
    this.animateNumberedGrids();
    this.animatePhaseCards();
    this.animateFeatureBlocks();
    this.animateCapabilityLists();
    this.animateBlockquotes();
    this.animateCTABlocks();
    this.animateProductLists();
    this.animateCredibilityText();
    this.animateContactPage();
    this.animateLeadText();
  }

  animateSectionHeaders() {
    this.newElements('.section-header').forEach((header) => {
      const h2 = header.querySelector('h2');
      const sub = header.querySelector('.subheadline');
      const label = header.querySelector('.section-label');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: this.config.triggerStart,
          toggleActions: 'play none none none',
        },
      });

      if (label) {
        tl.to(label, { opacity: 1, y: 0, duration: this.config.duration.fast, ease: this.config.ease }, 0);
      }
      if (h2) {
        tl.to(h2, {
          opacity: 1, y: 0, duration: this.config.duration.normal, ease: this.config.ease,
          onStart: () => header.classList.add('in-view'),
        }, label ? 0.1 : 0);
      }
      if (sub) {
        tl.to(sub, { opacity: 1, y: 0, duration: this.config.duration.normal, ease: this.config.ease }, label ? 0.2 : 0.1);
      }
    });
  }

  animateCardItems() {
    const cards = this.newElements('.card-item');
    if (!cards.length) return;

    const rows = new Map();
    cards.forEach((card) => {
      const row = card.closest('.row');
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row).push(card);
    });

    rows.forEach((rowCards, row) => {
      gsap.to(rowCards, {
        opacity: 1, y: 0, duration: this.config.duration.normal,
        stagger: this.config.stagger.cards, ease: this.config.ease,
        scrollTrigger: { trigger: row, start: this.config.triggerStart, toggleActions: 'play none none none' },
      });
    });
  }

  animateStats() {
    const statsBar = document.querySelector('.stats-bar');
    if (!statsBar || statsBar.dataset.gsapAnimated) return;
    statsBar.dataset.gsapAnimated = '1';

    gsap.to(statsBar, {
      opacity: 1, scale: 1, duration: this.config.duration.fast, ease: this.config.ease,
      scrollTrigger: { trigger: statsBar, start: this.config.triggerStart, toggleActions: 'play none none none' },
    });

    const statItems = statsBar.querySelectorAll('.stat-item');
    gsap.to(statItems, {
      opacity: 1, y: 0, duration: this.config.duration.slow,
      stagger: this.config.stagger.list, ease: this.config.ease,
      scrollTrigger: { trigger: statsBar, start: this.config.triggerStart, toggleActions: 'play none none none' },
    });

    statItems.forEach((item) => {
      const valueEl = item.querySelector('.stat-value');
      if (!valueEl) return;
      const text = valueEl.textContent.trim();
      const match = text.match(/^(\d+)(\+?)$/);
      if (match) {
        const targetNum = parseInt(match[1], 10);
        const suffix = match[2] || '';
        const counter = { value: 0 };
        gsap.to(counter, {
          value: targetNum, duration: 1.5, ease: 'power1.out',
          scrollTrigger: { trigger: item, start: this.config.triggerStart, toggleActions: 'play none none none' },
          onUpdate() { valueEl.textContent = Math.round(counter.value) + suffix; },
        });
      }
    });
  }

  animateBulletedLists() {
    this.newElements('.bulleted-list').forEach((list) => {
      const items = list.querySelectorAll('li');
      gsap.to(items, {
        opacity: 1, y: 0, duration: this.config.duration.fast,
        stagger: this.config.stagger.list, ease: this.config.ease,
        scrollTrigger: { trigger: list, start: this.config.triggerStart, toggleActions: 'play none none none' },
      });
    });
  }

  animateDarkBlocks() {
    this.newElements('.dark-block').forEach((block) => {
      const h2 = block.querySelector('h2');
      const lead = block.querySelector('.lead');
      const label = block.querySelector('.section-label');
      const listItems = block.querySelectorAll('.dark-block-list li');

      const tl = gsap.timeline({
        scrollTrigger: { trigger: block, start: this.config.triggerStart, toggleActions: 'play none none none' },
      });

      if (label) tl.to(label, { opacity: 1, y: 0, duration: this.config.duration.fast, ease: this.config.ease }, 0);
      if (h2) tl.to(h2, { opacity: 1, y: 0, duration: this.config.duration.normal, ease: this.config.ease }, 0.1);
      if (lead) tl.to(lead, { opacity: 1, y: 0, duration: this.config.duration.normal, ease: this.config.ease }, 0.2);
      if (listItems.length) {
        tl.to(listItems, {
          opacity: 1, y: 0, duration: this.config.duration.fast,
          stagger: this.config.stagger.list, ease: this.config.ease,
        }, 0.3);
      }
    });
  }

  animateNumberedGrids() {
    const steps = this.newElements('.numbered-step');
    if (!steps.length) return;
    const container = steps[0].closest('.numbered-grid');
    if (!container) return;

    gsap.to(steps, {
      opacity: 1, y: 0, duration: this.config.duration.normal,
      stagger: 0.2, ease: this.config.ease,
      scrollTrigger: { trigger: container, start: this.config.triggerStart, toggleActions: 'play none none none' },
    });
  }

  animatePhaseCards() {
    const cards = this.newElements('.phase-card');
    if (!cards.length) return;
    const container = cards[0].closest('.row');
    if (!container) return;

    gsap.to(cards, {
      opacity: 1, y: 0, duration: this.config.duration.normal,
      stagger: this.config.stagger.cards, ease: this.config.ease,
      scrollTrigger: { trigger: container, start: this.config.triggerStart, toggleActions: 'play none none none' },
    });
  }

  animateFeatureBlocks() {
    const blocks = this.newElements('.feature-block');
    if (!blocks.length) return;
    const rows = new Map();
    blocks.forEach((block) => {
      const row = block.closest('.row');
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row).push(block);
    });

    rows.forEach((rowBlocks, row) => {
      gsap.to(rowBlocks, {
        opacity: 1, y: 0, duration: this.config.duration.fast,
        stagger: this.config.stagger.grid, ease: this.config.ease,
        scrollTrigger: { trigger: row, start: this.config.triggerStart, toggleActions: 'play none none none' },
      });
    });
  }

  animateCapabilityLists() {
    this.newElements('.capability-list').forEach((list) => {
      const items = list.querySelectorAll('li');
      gsap.to(items, {
        opacity: 1, y: 0, duration: this.config.duration.fast,
        stagger: 0.05, ease: this.config.ease,
        scrollTrigger: { trigger: list, start: this.config.triggerStart, toggleActions: 'play none none none' },
      });
    });
  }

  animateBlockquotes() {
    this.newElements('.blockquote-feature').forEach((quote) => {
      gsap.to(quote, {
        opacity: 1, y: 0, duration: this.config.duration.slow, ease: this.config.ease,
        scrollTrigger: { trigger: quote, start: this.config.triggerStart, toggleActions: 'play none none none' },
      });
    });
  }

  animateCTABlocks() {
    this.newElements('.cta-block').forEach((block) => {
      const h2 = block.querySelector('h2');
      const p = block.querySelector('p');
      const btn = block.querySelector('.btn');

      const tl = gsap.timeline({
        scrollTrigger: { trigger: block, start: this.config.triggerStart, toggleActions: 'play none none none' },
      });

      if (h2) tl.to(h2, { opacity: 1, y: 0, duration: this.config.duration.normal, ease: this.config.ease }, 0);
      if (p) tl.to(p, { opacity: 1, y: 0, duration: this.config.duration.normal, ease: this.config.ease }, 0.1);
      if (btn) tl.to(btn, { opacity: 1, y: 0, duration: this.config.duration.normal, ease: this.config.ease }, 0.2);
    });
  }

  animateProductLists() {
    this.newElements('.product-list').forEach((list) => {
      const items = list.querySelectorAll('li');
      gsap.to(items, {
        opacity: 1, y: 0, duration: this.config.duration.fast,
        stagger: 0.05, ease: this.config.ease,
        scrollTrigger: { trigger: list, start: this.config.triggerStart, toggleActions: 'play none none none' },
      });
    });
  }

  animateCredibilityText() {
    this.newElements('.credibility-text').forEach((text) => {
      gsap.to(text, {
        opacity: 1, y: 0, duration: this.config.duration.normal, ease: this.config.ease,
        scrollTrigger: { trigger: text, start: this.config.triggerStart, toggleActions: 'play none none none' },
      });
    });
  }

  animateContactPage() {
    const formWrapper = document.querySelector('.contact-form-wrapper');
    if (formWrapper) {
      gsap.to(formWrapper, {
        opacity: 1, y: 0, duration: this.config.duration.normal, ease: this.config.ease,
        scrollTrigger: { trigger: formWrapper, start: this.config.triggerStartEarly, toggleActions: 'play none none none' },
      });
    }

    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo) {
      gsap.to(contactInfo, {
        opacity: 1, y: 0, duration: this.config.duration.normal, delay: 0.1, ease: this.config.ease,
        scrollTrigger: { trigger: contactInfo, start: this.config.triggerStartEarly, toggleActions: 'play none none none' },
      });
      const expectItems = contactInfo.querySelectorAll('.expect-item');
      if (expectItems.length) {
        gsap.to(expectItems, {
          opacity: 1, y: 0, duration: this.config.duration.fast,
          stagger: this.config.stagger.list, delay: 0.2, ease: this.config.ease,
          scrollTrigger: { trigger: contactInfo, start: this.config.triggerStartEarly, toggleActions: 'play none none none' },
        });
      }
    }
  }

  animateLeadText() {
    this.newElements('.lead:not(.hero-content .subheadline)').forEach((lead) => {
      if (lead.closest('.dark-block')) return;
      gsap.to(lead, {
        opacity: 1, y: 0, duration: this.config.duration.normal, ease: this.config.ease,
        scrollTrigger: { trigger: lead, start: this.config.triggerStart, toggleActions: 'play none none none' },
      });
    });
  }

  setupResize() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        if (!this.config.smoothScrollMobile) {
          if (this.isMobile() && this.lenis) {
            this.lenis.destroy();
            this.lenis = null;
          } else if (!this.isMobile() && !this.lenis && !this.prefersReducedMotion) {
            this.initLenis();
          }
        }
      }, 250);
    });
  }
}

// ============================================
// 4. Navbar Scroll Behavior
// ============================================
function setupNavbarScroll() {
  const navbar = document.getElementById('mainNav');
  if (!navbar) return;

  function updateNavbar() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
}

// ============================================
// 5. Navbar Brand Animation (GSAP)
// Triggered by header's component:loaded event
// ============================================
const NAVBAR_ANIM_SESSION_KEY = 'navbar_animated';

const navbarAnimConfig = {
  angularVelocity: 150,
  staggerDelay: 0.2,
  maxRadius: 29,
};

const finalAngles = [0, 72, 144, 216, 288];
const spiralConfig = { duration: 1, rotation: 90 };
const circleTravel = [270, 342, 54, 126, 198];
const animationOrder = [1, 0, 4, 3, 2];

function setNavbarFinalState() {
  const navbarBrand = document.getElementById('navbarBrand');
  const logo = document.getElementById('navbarLogo');
  const groups = document.querySelectorAll('.navbar-v-group');
  const wheel = document.querySelector('.navbar-wheel-group');
  const brandText = document.getElementById('navbarBrandText');

  if (!groups.length || !wheel || !logo || !navbarBrand) return;

  groups.forEach((group, index) => {
    group.setAttribute('transform', `rotate(${finalAngles[index]})`);
  });
  wheel.setAttribute('transform', 'translate(60,60) rotate(216)');

  navbarBrand.style.transform = 'scale(1)';
  navbarBrand.classList.add('visible');
  logo.classList.add('visible');
  if (brandText) {
    brandText.classList.add('visible', 'revealed-instant');
  }
}

function playNavbarAnimation() {
  if (document.body.classList.contains('optimize')) return;

  // If GSAP hasn't loaded yet, defer — orchestrator will call after vendor load
  if (typeof gsap === 'undefined') return;

  const navbarBrand = document.getElementById('navbarBrand');
  const logo = document.getElementById('navbarLogo');
  const groups = document.querySelectorAll('.navbar-v-group');
  const wheel = document.querySelector('.navbar-wheel-group');
  const brandText = document.getElementById('navbarBrandText');

  if (!groups.length || !wheel || !logo || !navbarBrand) return;

  // Return visit — show final state immediately
  if (sessionStorage.getItem(NAVBAR_ANIM_SESSION_KEY)) {
    setNavbarFinalState();
    return;
  }

  // First visit — animate
  navbarBrand.style.transform = 'scale(2)';
  navbarBrand.style.transformOrigin = 'left center';
  navbarBrand.classList.add('visible');
  logo.classList.add('visible');

  groups.forEach((group) => {
    group.setAttribute('transform', `rotate(0) translate(0, ${navbarAnimConfig.maxRadius})`);
  });

  if (brandText) {
    brandText.classList.remove('revealed', 'revealed-instant');
    brandText.classList.add('visible');
  }

  const tl = gsap.timeline({
    onComplete: () => {
      sessionStorage.setItem(NAVBAR_ANIM_SESSION_KEY, 'true');
    },
  });

  // Animate each V through spiral + circle phases
  groups.forEach((group, index) => {
    const orderPosition = animationOrder.indexOf(index);
    const startTime = orderPosition * navbarAnimConfig.staggerDelay;
    const circleDistance = circleTravel[index];
    const circleDuration = circleDistance / navbarAnimConfig.angularVelocity;
    const finalAngle = finalAngles[index];

    // Spiral phase
    const spiralObj = { t: 0 };
    tl.to(spiralObj, {
      t: 1,
      duration: spiralConfig.duration,
      ease: 'power1.in',
      onUpdate() {
        const t = spiralObj.t;
        const rotation = t * spiralConfig.rotation;
        const radius = t * navbarAnimConfig.maxRadius;
        const translateY = navbarAnimConfig.maxRadius - radius;
        group.setAttribute('transform', `rotate(${rotation}) translate(0, ${translateY.toFixed(2)})`);
      },
    }, startTime);

    // Circle phase
    const circleStartTime = startTime + spiralConfig.duration;
    const spiralEndAngle = spiralConfig.rotation;
    const circleObj = { angle: spiralEndAngle };
    const targetAngle = spiralEndAngle + circleDistance;

    tl.to(circleObj, {
      angle: targetAngle,
      duration: circleDuration,
      ease: 'power1.out',
      onUpdate() {
        group.setAttribute('transform', `rotate(${circleObj.angle})`);
      },
      onComplete() {
        group.setAttribute('transform', `rotate(${finalAngle})`);
      },
    }, circleStartTime);
  });

  // Calculate when all Vs finish
  const allDoneTime = Math.max(...animationOrder.map((idx, orderPos) => {
    const circleTime = circleTravel[idx] / navbarAnimConfig.angularVelocity;
    return orderPos * navbarAnimConfig.staggerDelay + spiralConfig.duration + circleTime;
  }));

  // Wheel rotation
  const wheelRotation = { angle: 0 };
  tl.to(wheelRotation, {
    angle: 216,
    duration: 3,
    ease: 'power2.out',
    onUpdate() {
      wheel.setAttribute('transform', `translate(60,60) rotate(${wheelRotation.angle})`);
    },
  }, allDoneTime - 0.5);

  // Text reveal
  tl.add(() => {
    if (brandText) brandText.classList.add('revealed');
  }, allDoneTime + 2);

  // Shrink brand back to 1x
  tl.to(navbarBrand, {
    scale: 1,
    duration: 0.8,
    ease: 'power2.out',
  }, allDoneTime + 2.8);

  tl.play();
}

// ============================================
// 6. Site Progressive Enhancement
// ============================================
class SiteProgressiveEnhancement extends core.ProgressiveEnhancement {
  static setupSiteNavigation() {
    super.setupNavigationBehaviors();
  }

  /**
   * Load a script by appending a <script> tag (for IIFE/UMD vendor libraries)
   */
  static loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Load GSAP, ScrollTrigger, and Lenis (lazy/deferred)
   * Loaded via <script> tags (not import()) because these are IIFE/UMD globals
   */
  static async loadVendorLibraries() {
    if (typeof gsap !== 'undefined') return;

    try {
      await SiteProgressiveEnhancement.loadScript('/scripts/gsap.js');
      await SiteProgressiveEnhancement.loadScript('/scripts/ScrollTrigger.js');
      gsap.registerPlugin(ScrollTrigger);
    } catch (error) {
      console.warn('Failed to load GSAP/ScrollTrigger:', error);
    }

    try {
      await SiteProgressiveEnhancement.loadScript('/scripts/lenis.js');
    } catch (error) {
      console.warn('Failed to load Lenis:', error);
    }
  }
}

// ============================================
// 7. Site Orchestrator
// ============================================
class SiteOrchestrator extends core.ExecutionOrchestrator {
  constructor() {
    super(SITE_CONFIG);
    this.scrollAnimations = new SiteScrollAnimations();
  }

  async init() {
    // Phase 1: Critical components (nav)
    this.criticalExecutor.executeImmediate();

    // Phase 2: Non-critical CSS (non-blocking)
    this.preloadNonCriticalCSS();

    // Phase 3: Deferred components (intersection observer)
    this.deferredLoader.observeNonCriticalComponents();

    // Phase 4: Navigation behaviors
    SiteProgressiveEnhancement.setupSiteNavigation();

    // Phase 4b: Nav component listener — scroll behavior + brand animation
    // Nav is async (critical but uses await import), so #mainNav won't exist yet.
    // Set up scroll + animation once the nav component finishes building.
    document.addEventListener('component:loaded', (event) => {
      if (event.detail?.componentName === 'nav') {
        setupNavbarScroll();
        playNavbarAnimation();
      }
    });

    // Phase 5: Load vendor libraries (GSAP, ScrollTrigger, Lenis)
    await SiteProgressiveEnhancement.loadVendorLibraries();

    // Phase 5b: Navbar brand animation (requires GSAP, now loaded)
    // If nav already loaded before GSAP, this catches it.
    playNavbarAnimation();

    // Phase 6: Scroll animations (requires GSAP + ScrollTrigger + Lenis, now loaded)
    this.scrollAnimations.init();

    // Phase 7: Heavy dependencies (Bootstrap, lazy CSS, modals)
    await core.ProgressiveEnhancement.loadHeavyDependencies();
    core.ProgressiveEnhancement.setupModalHandlers();

    // Phase 8: Analytics (skip localhost/nimbusedge)
    const isLocal = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';
    const isNimbusEdge = window.location.hostname.endsWith('.nimbusedge.app');
    if (this.config.analytics?.gtmId && !isLocal && !isNimbusEdge) {
      core.ProgressiveEnhancement.loadGoogleTagManager(this.config.analytics.gtmId);
    }

    return this;
  }
}

// ============================================
// 8. Initialize
// ============================================
core.ready(() => {
  const orchestrator = new SiteOrchestrator();
  orchestrator.init();
  window.executionOrchestrator = orchestrator;
});
