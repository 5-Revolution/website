/* global bootstrap */
// Utilities imported inside functions to avoid race conditions

/**
 * Modal system for loading and displaying dynamic content
 * Handles modal:trigger events dispatched from app.js
 */
class ModalSystem {
  constructor(utils) {
    this.activeModal = null;
    this.modalContainer = null;
    this.loadingStates = new Map();

    // Store utilities for use in methods
    this.createElement = utils.createElement;
    this.processNestedComponents = utils.processNestedComponents;
    this.getResourceTracker = utils.getResourceTracker;

    // Track what's already loaded on the page (like snippets)
    this.loadedResources = {
      css: new Set(),
      js: new Set()
    };

    this.init();
  }

  init() {
    // Initialize what's already loaded on the page
    this.initializeLoadedResources();

    this.setupEventListeners();
  }

  initializeLoadedResources() {
    // Use core resource tracker instead of duplicating logic
    const resourceTracker = this.getResourceTracker();
    this.loadedResources.css = new Set(resourceTracker.loadedResources.css);
    this.loadedResources.js = new Set(resourceTracker.loadedResources.js);
  }

  setupEventListeners() {
    // Listen for modal trigger events from app.js
    document.addEventListener('modal:trigger', this.handleModalTrigger.bind(this));

    // Listen for escape key to close modals
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.activeModal) {
        this.closeModal();
      }
    });
  }

  async handleModalTrigger(event) {
    const { url, button } = event.detail;

    try {
      // Prevent multiple simultaneous loads of the same modal
      if (this.loadingStates.get(url)) {
        return;
      }

      this.loadingStates.set(url, true);

      // Load modal content
      const content = await this.loadModalContent(url);

      // Create and show modal
      await this.showModal(content, url, button);

    } catch (error) {
      console.error(`Failed to load modal from ${url}:`, error);
      this.showErrorModal(error.message);
    } finally {
      // Clean up loading state
      this.loadingStates.delete(url);
    }
  }

  async loadModalContent(url) {
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  }

  async showModal(content, url, triggerButton) {
    // Close any existing modal first
    if (this.activeModal) {
      this.closeModal();
    }

    // Check if a modal with this URL already exists in the DOM
    let modal = document.querySelector(`.modal[data-url="${url}"]`);

    if (modal) {
      // Reuse existing modal
      this.activeModal = modal;
    } else {
      // Create new modal structure
      modal = this.createModalStructure(content, url);

      // Add to DOM
      document.body.appendChild(modal);

      // Store reference
      this.activeModal = modal;

      // Process any components within the modal content using core infrastructure
      await this.processNestedComponents(modal, ['modals']);
    }

    // Initialize Bootstrap modal (always create new instance)
    const bsModal = new bootstrap.Modal(modal, {
      backdrop: true,
      keyboard: true,
      focus: false
    });

    // Setup modal event listeners
    this.setupModalEventListeners(modal, bsModal, triggerButton);

    // Show modal
    bsModal.show();
  }

  createModalStructure(content, url) {
    // Generate unique modal ID based on URL
    const modalId = `modal-${Date.now()}`;

    // Create main modal element with Bootstrap 5.3 structure
    const modal = this.createElement('div', ['modal', 'modal-lg', 'fade'], {
      'id': modalId,
      'data-url': url
    });

    // Create modal dialog with Bootstrap 5.3 classes
    const dialogClasses = ['modal-dialog'];

    // Add optional classes based on content
    if (content.includes('modal-dialog-centered')) {
      dialogClasses.push('modal-dialog-centered');
    }

    if (content.includes('modal-dialog-scrollable')) {
      dialogClasses.push('modal-dialog-scrollable');
    }

    // Add size classes if specified in content
    if (content.includes('modal-xl')) {
      dialogClasses.push('modal-xl');
    } else if (content.includes('modal-lg')) {
      dialogClasses.push('modal-lg');
    } else if (content.includes('modal-sm')) {
      dialogClasses.push('modal-sm');
    }

    const dialog = this.createElement('div', dialogClasses);
    const modalContent = this.createElement('div', ['modal-content']);

    // Create only the modal body with the content from data-url
    const bodyElement = this.createElement('div', ['modal-body']);
    bodyElement.innerHTML = content;
    modalContent.appendChild(bodyElement);

    // Assemble the complete Bootstrap 5.3 modal structure
    dialog.appendChild(modalContent);
    modal.appendChild(dialog);

    return modal;
  }

  setupModalEventListeners(modal, bsModal, triggerButton) {
    // Handle modal shown event
    modal.addEventListener('shown.bs.modal', () => {
      // Wait a frame to ensure Bootstrap has finished its setup
      requestAnimationFrame(() => {
        // Focus first focusable element
        const firstFocusable = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
          firstFocusable.focus();
        }
      });

      // Dispatch custom event
      modal.dispatchEvent(new CustomEvent('modal:shown', {
        detail: { modal, triggerButton },
        bubbles: true
      }));
    });

    // Handle modal hidden event
    modal.addEventListener('hidden.bs.modal', () => {
      // Return focus to trigger button
      if (triggerButton && document.contains(triggerButton)) {
        triggerButton.focus();
      }

      // Clean up modal
      this.cleanupModal(modal);

      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('modal:closed', {
        detail: { modal, triggerButton },
        bubbles: true
      }));
    });

    // Handle backdrop clicks
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        bsModal.hide();
      }
    });
  }

  showErrorModal(message) {
    const errorContent = `
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error Loading Modal</h4>
        <p>${message}</p>
        <hr>
        <p class="mb-0">Please try again later or contact support if the problem persists.</p>
      </div>
    `;

    this.showModal(errorContent, 'error', null);
  }

  closeModal() {
    if (this.activeModal) {
      const bsModal = bootstrap.Modal.getInstance(this.activeModal);
      if (bsModal) {
        bsModal.hide();
      }
    }
  }

  cleanupModal(modal) {
    // Don't remove modal from DOM - just dispose Bootstrap instance and clear reference
    // This allows components to maintain their initialized state between modal opens
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.dispose();
      }
    }

    // Clear reference if this was the active modal
    if (this.activeModal === modal) {
      this.activeModal = null;
    }
  }

  // Public method to programmatically show a modal
  async showModalFromUrl(url, options = {}) {
    try {
      const content = await this.loadModalContent(url);
      await this.showModal(content, url, options.triggerButton || null);
    } catch (error) {
      console.error(`Failed to show modal from ${url}:`, error);
      this.showErrorModal(error.message);
    }
  }

  // Public method to check if a modal is currently active
  isModalActive() {
    return this.activeModal !== null;
  }
}

// Initialize modals (special case - needs to be always available)
async function initializeModals() {
  // Import utilities from app.js inside function to avoid race conditions
  const { createElement, processNestedComponents, getResourceTracker } = await import('../../../scripts/app.js');

  new ModalSystem({ createElement, processNestedComponents, getResourceTracker });
}

// Export for potential external use and app.js orchestration
export default initializeModals;
export { ModalSystem };
