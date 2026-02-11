/*
 * Form Component — 5th Revolution
 *
 * Dynamically generates Bootstrap 5.3 forms from JSON configuration.
 * Fetches field definitions from a JSON URL provided by the CMS.
 *
 * CMS input:
 *   Single row: <p> with <a href="/path.json"> link
 *   With heading variant: Row 1 = heading content, Row 2 = JSON URL
 *
 * Classes:
 *   .lg-7, .lg-8     — Column width (col-lg-7, col-lg-8)
 *   .heading          — Two CMS rows: heading + URL
 *
 * Supports: text, email, tel, text-area, select, checkbox, radio, submit
 * Features: Bootstrap validation, reCAPTCHA v3, Google Apps Script submission
 */

const RECAPTCHA_SITE_KEY = '6LcZlGcsAAAAADIVM3BRh3uOTaLDip6H4RNL-GM8';

export default async function initializeForm(component) {
  if (component.dataset.status === 'loaded') return;

  const { createElement, markLoaded } = await import('../../../scripts/app.js');

  const jsonUrl = extractJsonUrl(component);
  if (!jsonUrl) {
    console.warn('Form component missing JSON URL');
    return;
  }

  const headingContent = extractHeadingContent(component);
  const colClass = parseColumnClass(component);

  showLoadingState(component);

  try {
    const response = await fetch(jsonUrl, {
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const formData = await response.json();
    renderForm(component, formData, { createElement, colClass, headingContent });
    markLoaded(component, 'form');
  } catch (error) {
    console.error(`Failed to load form from ${jsonUrl}:`, error);
    showErrorState(component, error.message);
  }
}

// ============================================
// Content Extraction
// ============================================

function extractJsonUrl(component) {
  const hasHeading = component.classList.contains('heading');

  if (hasHeading) {
    const topLevelDivs = [...component.children];
    if (topLevelDivs.length < 2) return null;
    const urlDiv = topLevelDivs[1].querySelector('div');
    const link = urlDiv?.querySelector('a[href]');
    return link ? link.getAttribute('href') : urlDiv?.querySelector('p')?.textContent?.trim();
  }

  const urlDiv = component.querySelector('div div');
  if (!urlDiv) return null;
  const link = urlDiv.querySelector('a[href]');
  return link ? link.getAttribute('href') : urlDiv.querySelector('p')?.textContent?.trim();
}

function extractHeadingContent(component) {
  if (!component.classList.contains('heading')) return '';
  const topLevelDivs = [...component.children];
  if (topLevelDivs.length < 2) return '';
  const headingDiv = topLevelDivs[0].querySelector('div');
  return headingDiv ? headingDiv.innerHTML : '';
}

function parseColumnClass(component) {
  const match = [...component.classList].find((c) => /^lg-\d+$/.test(c));
  return match ? `col-${match}` : null;
}

// ============================================
// Loading / Error States
// ============================================

function showLoadingState(component) {
  component.innerHTML = '<div class="d-flex justify-content-center align-items-center py-5">'
    + '<div class="spinner-border text-primary" role="status">'
    + '<span class="visually-hidden">Loading form...</span></div>'
    + '<span class="ms-2">Loading form...</span></div>';
}

function showErrorState(component, message) {
  component.innerHTML = '<div class="alert alert-danger" role="alert">'
    + '<h4 class="alert-heading">Error Loading Form</h4>'
    + `<p>${message}</p><hr>`
    + '<p class="mb-0">Please try again later or contact us directly.</p></div>';
}

// ============================================
// Form Rendering
// ============================================

function renderForm(component, formData, { createElement, colClass, headingContent }) {
  if (!formData || !formData.fields) {
    showErrorState(component, 'Invalid form configuration');
    return;
  }

  component.innerHTML = '';

  const container = createElement('div', ['container']);
  const row = createElement('div', ['row', 'g-4']);
  const col = createElement('div', [colClass || 'col-lg-7']);

  // Heading content (heading variant)
  if (headingContent) {
    const headingDiv = createElement('div', ['mb-4']);
    headingDiv.innerHTML = headingContent;
    col.appendChild(headingDiv);
  }

  // Form wrapper (white card)
  const wrapper = createElement('div', ['form-wrapper']);

  // Build the <form> element
  const formAttrs = { id: formData.formId || 'dynamic-form', novalidate: true };
  if (formData.recaptcha === true || formData.recaptcha === 'true') {
    formAttrs['data-recaptcha'] = 'true';
  }
  const form = createElement('form', ['needs-validation'], formAttrs);

  // Field grid for half-width support
  const fieldGrid = createElement('div', ['row', 'g-3']);

  formData.fields.forEach((field) => {
    if (field.type === 'submit') {
      addSubmitButton(field, fieldGrid, form, { createElement });
    } else {
      addFormField(field, fieldGrid, { createElement });
    }
  });

  form.appendChild(fieldGrid);
  setupFormValidation(form, formData);

  wrapper.appendChild(form);
  col.appendChild(wrapper);
  row.appendChild(col);
  container.appendChild(row);
  component.appendChild(container);
}

// ============================================
// Field Builders
// ============================================

function addFormField(field, fieldGrid, { createElement }) {
  const colClasses = field.style ? field.style.split(' ').filter(Boolean) : ['col-12'];
  const fieldCol = createElement('div', colClasses);
  const fieldGroup = createElement('div', ['mb-0']);

  // Label (skip for checkbox/radio)
  if (field.type !== 'checkbox' && field.type !== 'radio' && field.label) {
    fieldGroup.appendChild(createLabel(field, { createElement }));
  }

  // Input element
  let inputEl;
  switch (field.type) {
  case 'text':
  case 'email':
  case 'tel':
  case 'url':
  case 'number':
  case 'password':
    inputEl = createTextInput(field, { createElement });
    break;
  case 'text-area':
    inputEl = createTextArea(field, { createElement });
    break;
  case 'select':
    inputEl = createSelect(field, { createElement });
    break;
  case 'checkbox':
    addCheckbox(field, fieldGroup, { createElement });
    fieldCol.appendChild(fieldGroup);
    fieldGrid.appendChild(fieldCol);
    return;
  case 'radio':
    addRadioGroup(field, fieldGroup, { createElement });
    fieldCol.appendChild(fieldGroup);
    fieldGrid.appendChild(fieldCol);
    return;
  default:
    inputEl = createTextInput(field, { createElement });
  }

  fieldGroup.appendChild(inputEl);

  // Validation feedback
  if (field.mandatory) {
    const feedback = createElement('div', ['invalid-feedback']);
    feedback.textContent = field.validationMessage
      || `Please provide a valid ${field.label?.toLowerCase() || field.name}.`;
    fieldGroup.appendChild(feedback);
  }

  // Help text
  if (field.helpText) {
    const help = createElement('div', ['form-text']);
    help.textContent = field.helpText;
    fieldGroup.appendChild(help);
  }

  fieldCol.appendChild(fieldGroup);
  fieldGrid.appendChild(fieldCol);
}

function createLabel(field, { createElement }) {
  const label = createElement('label', ['form-label'], { for: field.name });

  if (field.mandatory) {
    label.innerHTML = `${field.label} <span class="required-mark">*</span>`;
  } else {
    label.innerHTML = `${field.label} <span class="text-muted" style="font-weight: 400; font-size: 0.875rem;">(optional)</span>`;
  }

  return label;
}

function createTextInput(field, { createElement }) {
  const classes = ['form-control'];
  if (field.size) classes.push(`form-control-${field.size}`);

  const attrs = {
    type: field.type,
    id: field.name,
    name: field.name,
  };
  if (field.placeholder) attrs.placeholder = field.placeholder;
  if (field.mandatory) attrs.required = true;

  const input = createElement('input', classes, attrs);
  if (field.value) input.value = field.value;
  if (field.maxLength) input.maxLength = field.maxLength;
  if (field.minLength) input.minLength = field.minLength;
  if (field.pattern) input.pattern = field.pattern;

  return input;
}

function createTextArea(field, { createElement }) {
  const classes = ['form-control'];
  if (field.size) classes.push(`form-control-${field.size}`);

  const attrs = {
    id: field.name,
    name: field.name,
    rows: field.rows || 3,
  };
  if (field.placeholder) attrs.placeholder = field.placeholder;
  if (field.mandatory) attrs.required = true;

  const textarea = createElement('textarea', classes, attrs);
  if (field.value) textarea.value = field.value;
  if (field.maxLength) textarea.maxLength = field.maxLength;

  return textarea;
}

function createSelect(field, { createElement }) {
  const classes = ['form-select'];
  if (field.size) classes.push(`form-select-${field.size}`);

  const attrs = { id: field.name, name: field.name };
  if (field.mandatory) attrs.required = true;

  const select = createElement('select', classes, attrs);

  if (field.placeholder) {
    const defaultOpt = createElement('option', [], { value: '' });
    defaultOpt.textContent = field.placeholder;
    select.appendChild(defaultOpt);
  }

  if (field.options) {
    field.options.forEach((opt) => {
      const option = createElement('option', [], { value: opt.value || opt.label });
      option.textContent = opt.label;
      if (opt.selected) option.selected = true;
      select.appendChild(option);
    });
  }

  return select;
}

function addCheckbox(field, fieldGroup, { createElement }) {
  const checkDiv = createElement('div', ['form-check']);
  const attrs = {
    type: 'checkbox',
    id: field.name,
    name: field.name,
    value: field.value || '1',
  };
  if (field.mandatory) attrs.required = true;

  const input = createElement('input', ['form-check-input'], attrs);
  checkDiv.appendChild(input);

  if (field.label) {
    const label = createElement('label', ['form-check-label'], { for: field.name });
    label.innerHTML = field.label;
    if (field.mandatory) {
      const req = createElement('span', ['required-mark']);
      req.textContent = ' *';
      label.appendChild(req);
    }
    checkDiv.appendChild(label);
  }

  fieldGroup.appendChild(checkDiv);
}

function addRadioGroup(field, fieldGroup, { createElement }) {
  if (!field.options) return;

  const fieldset = createElement('fieldset');
  if (field.label) {
    const legend = createElement('legend', ['form-label']);
    legend.innerHTML = field.label;
    if (field.mandatory) {
      const req = createElement('span', ['required-mark']);
      req.textContent = ' *';
      legend.appendChild(req);
    }
    fieldset.appendChild(legend);
  }

  field.options.forEach((opt) => {
    const radioDiv = createElement('div', ['form-check']);
    const input = createElement('input', ['form-check-input'], {
      type: 'radio',
      id: `${field.name}_${opt.value}`,
      name: field.name,
      value: opt.value || opt.label,
    });
    if (field.mandatory) input.setAttribute('required', true);

    const label = createElement('label', ['form-check-label'], {
      for: `${field.name}_${opt.value}`,
    });
    label.textContent = opt.label;

    radioDiv.appendChild(input);
    radioDiv.appendChild(label);
    fieldset.appendChild(radioDiv);
  });

  fieldGroup.appendChild(fieldset);
}

function addSubmitButton(field, fieldGrid, form, { createElement }) {
  const colDiv = createElement('div', ['col-12', 'mt-2']);
  const buttonContainer = createElement('div', ['d-grid']);

  const buttonClasses = ['btn'];
  const styleStr = field.style || 'primary';
  styleStr.split(' ').filter(Boolean).forEach((cls, i) => {
    if (cls.startsWith('btn-')) {
      buttonClasses.push(cls);
    } else if (i === 0) {
      buttonClasses.push(`btn-${cls}`);
    } else {
      buttonClasses.push(`btn-${cls}`);
    }
  });

  const button = createElement('button', buttonClasses, { type: 'submit', id: field.name });
  button.textContent = field.label || field.placeholder || 'Submit';

  if (field.action) {
    form.setAttribute('data-action', field.action);
  }

  buttonContainer.appendChild(button);
  colDiv.appendChild(buttonContainer);
  fieldGrid.appendChild(colDiv);
}

// ============================================
// Validation + Submission
// ============================================

function setupFormValidation(form, formData) {
  // Blur validation on individual fields
  form.addEventListener('focusout', (e) => {
    const input = e.target;
    if (!input.matches('input, select, textarea')) return;
    if (input.checkValidity()) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    } else if (input.value.trim() || input.hasAttribute('required')) {
      input.classList.remove('is-valid');
      input.classList.add('is-invalid');
    }
  });

  // Form submission
  form.addEventListener('submit', (e) => handleFormSubmit(e, formData));
}

async function handleFormSubmit(event, formData) {
  event.preventDefault();
  event.stopPropagation();

  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  const needsRecaptcha = form.getAttribute('data-recaptcha') === 'true';

  // Remove existing alerts
  form.querySelectorAll('.alert').forEach((a) => a.remove());

  // Validate
  const errors = validateForm(form);
  if (errors.length > 0) {
    showValidationErrors(form, errors);
    return;
  }

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const action = form.getAttribute('data-action');
  if (!action) {
    console.warn('No form action URL specified');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Sending...';

    let recaptchaToken = null;

    if (needsRecaptcha) {
      try {
        if (!window.grecaptcha) {
          await loadRecaptchaScript();
        }
        recaptchaToken = await executeRecaptcha('submit_form');
        if (!recaptchaToken) {
          throw new Error('Security verification failed.');
        }
      } catch (_err) {
        throw new Error('Security verification failed. Please refresh the page and try again.');
      }
    }

    const payload = new FormData(form);
    payload.append('formId', formData.formId || 'unknown');
    payload.append('timestamp', new Date().toJSON());
    if (recaptchaToken) payload.append('recaptchaToken', recaptchaToken);

    await fetch(action, { method: 'POST', mode: 'no-cors', body: payload });

    showSuccessMessage(form);
    form.reset();
    form.classList.remove('was-validated');

    // Clear validation classes
    form.querySelectorAll('.is-valid, .is-invalid').forEach((el) => {
      el.classList.remove('is-valid', 'is-invalid');
    });

  } catch (error) {
    console.error('Form submission failed:', error);
    showSubmissionError(form, error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function validateForm(form) {
  const errors = [];
  form.querySelectorAll('[required]').forEach((field) => {
    const value = field.value.trim();
    if (!value) {
      errors.push(`Please enter your ${field.name || 'required field'}.`);
      return;
    }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push('Please enter a valid email address.');
    }
  });
  return errors;
}

// ============================================
// Alert Messages
// ============================================

function showValidationErrors(form, errors) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger mt-3 d-flex align-items-start';
  alert.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" '
    + 'class="flex-shrink-0 me-2 mt-1" viewBox="0 0 16 16">'
    + '<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 '
    + '1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 '
    + '5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>'
    + `<div><strong>Please fix the following:</strong><br>${errors.map((e) => `&bull; ${e}`).join('<br>')}</div>`;
  form.appendChild(alert);
}

function showSuccessMessage(form) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-success mt-3 d-flex align-items-start';
  alert.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" '
    + 'class="flex-shrink-0 me-2 mt-1" viewBox="0 0 16 16">'
    + '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 '
    + '5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>'
    + '<div><strong>Thank you!</strong> Your message has been submitted successfully. '
    + 'We will respond within one business day.</div>';
  form.appendChild(alert);
}

function showSubmissionError(form, message) {
  const alert = document.createElement('div');
  alert.className = 'alert alert-danger mt-3 d-flex align-items-start';
  alert.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" '
    + 'class="flex-shrink-0 me-2 mt-1" viewBox="0 0 16 16">'
    + '<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 '
    + '1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 '
    + '5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>'
    + `<div><strong>Error:</strong> ${message || 'There was an error submitting the form. Please try again.'}</div>`;
  form.appendChild(alert);
}

// ============================================
// reCAPTCHA v3
// ============================================

function loadRecaptchaScript() {
  return new Promise((resolve) => {
    if (window.grecaptcha && window.grecaptcha.ready) {
      window.grecaptcha.ready(() => resolve());
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha.ready(() => resolve());
    };
    document.head.appendChild(script);
  });
}

async function executeRecaptcha(action) {
  try {
    return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
  } catch (error) {
    console.error('reCAPTCHA execution error:', error);
    return null;
  }
}
