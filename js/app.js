/* ============================================================
   WELLBEING HUB — UPDATED APP.JS
   Shared interactions for theme, menu, booking, services, events
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initHeaderScroll();
  initFadeUp();
  initBackToTop();
  initActiveNav();
  initServicesPage();
  initBookingWizard();
  initEventFilters();
});

/* ── Theme Toggle ─────────────────────────────────────────── */
function initTheme() {
  const themeBtn = document.getElementById('theme-btn');
  let isDark = false;

  function applyTheme(dark) {
    isDark = dark;
    document.documentElement.classList.toggle('dark', dark);

    if (themeBtn) {
      themeBtn.textContent = dark ? '☀️' : '🌙';
      themeBtn.setAttribute(
        'aria-label',
        dark ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }

    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  const savedTheme = localStorage.getItem('theme');
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    applyTheme(true);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => applyTheme(!isDark));
  }
}

/* ── Mobile Menu ─────────────────────────────────────────── */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuBtn.textContent = isOpen ? '✕' : '☰';
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuBtn.textContent = '☰';
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── Header Shadow ───────────────────────────────────────── */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader);
}

/* ── Fade-Up Animation ───────────────────────────────────── */
function initFadeUp() {
  const fadeItems = document.querySelectorAll('.fade-up');
  if (!fadeItems.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12 }
  );

  fadeItems.forEach(item => observer.observe(item));
}

/* ── SOS Button ──────────────────────────────────────────── */
function showSOS() {
  window.confirm(
    'URGENT HELP\n\nIf you or someone you know is in crisis, please contact local emergency or support services, or visit the hub during opening hours. Our staff are here to help.'
  );
}
window.showSOS = showSOS;

/* ── Back to Top ─────────────────────────────────────────── */
function initBackToTop() {
  const btt = document.getElementById('back-to-top');
  if (!btt) return;

  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const toggleVisible = () => {
    btt.classList.toggle('visible', window.scrollY > 400);
  };

  toggleVisible();
  window.addEventListener('scroll', toggleVisible);
}

/* ── Active Navigation ───────────────────────────────────── */
function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http')) return;

    if (href === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ── Services Page ───────────────────────────────────────── */
function initServicesPage() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  const searchInput = document.getElementById('service-search');
  const clearBtn = document.getElementById('search-clear');
  const emptyState = document.getElementById('search-empty');

  if (!accordionItems.length) return;

  const headers = document.querySelectorAll('.accordion-header');

  // Store original total counts so we can restore them after clearing search
  accordionItems.forEach(item => {
    const countEl = item.querySelector('.acc-count');
    if (countEl) {
      item.dataset.totalCount = item.querySelectorAll('.service-card').length;
      item.dataset.originalLabel = countEl.textContent;
    }
  });

  function openAccordion(item) {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');

    item.classList.add('open');
    if (header) header.setAttribute('aria-expanded', 'true');
    if (body) body.style.display = 'block';
  }

  function closeAccordion(item) {
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');

    item.classList.remove('open');
    if (header) header.setAttribute('aria-expanded', 'false');
    if (body) body.style.display = 'none';
  }

  function resetAccordion() {
    accordionItems.forEach((item, index) => {
      item.style.display = '';
      item.querySelectorAll('.service-card').forEach(card => {
        card.style.display = '';
      });

      // Restore original count label
      const countEl = item.querySelector('.acc-count');
      if (countEl && item.dataset.originalLabel) {
        countEl.textContent = item.dataset.originalLabel;
      }

      if (index === 0) {
        closeAccordion(item);
      } else {
        closeAccordion(item);
      }
    });

    if (emptyState) emptyState.style.display = 'none';
  }

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      accordionItems.forEach(closeAccordion);

      if (!isOpen) {
        openAccordion(item);
      }
    });
  });

  if (!searchInput) {
    resetAccordion();
    return;
  }

  function runServiceSearch() {
    const query = searchInput.value.toLowerCase().trim();
    let totalVisible = 0;

    if (clearBtn) {
      clearBtn.style.display = query ? 'block' : 'none';
    }

    if (!query) {
      resetAccordion();
      return;
    }

    accordionItems.forEach(item => {
      const cards = item.querySelectorAll('.service-card');
      let sectionVisible = 0;

      cards.forEach(card => {
        const keywords = (card.dataset.keywords || '').toLowerCase();
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const text = (card.querySelector('p')?.textContent || '').toLowerCase();

        const match =
          keywords.includes(query) ||
          title.includes(query) ||
          text.includes(query);

        card.style.display = match ? '' : 'none';
        if (match) sectionVisible += 1;
      });

      // Auto-expand sections with matches; hide empty ones entirely
      if (sectionVisible > 0) {
        item.style.display = '';
        openAccordion(item);
      } else {
        closeAccordion(item);
        item.style.display = 'none';
      }

      // Update count badge dynamically
      const countEl = item.querySelector('.acc-count');
      if (countEl) {
        if (sectionVisible > 0) {
          countEl.textContent = sectionVisible === 1
            ? '1 result'
            : `${sectionVisible} results`;
        } else {
          countEl.textContent = '0 results';
        }
      }

      totalVisible += sectionVisible;
    });

    if (emptyState) {
      emptyState.style.display = totalVisible === 0 ? 'block' : 'none';
    }
  }

  searchInput.addEventListener('input', runServiceSearch);

  document.addEventListener('keydown', event => {
    const activeTag = document.activeElement?.tagName;
    if (
      event.key === '/' &&
      activeTag !== 'INPUT' &&
      activeTag !== 'TEXTAREA'
    ) {
      event.preventDefault();
      searchInput.focus();
    }
  });

  window.clearSearch = function () {
    searchInput.value = '';
    runServiceSearch();
    searchInput.focus();
  };

  resetAccordion();
}

/* ── Booking Wizard ──────────────────────────────────────── */
function initBookingWizard() {
  const firstStep = document.getElementById('step-1');
  if (!firstStep) return;

  let currentStep = 1;

  // Auto-select service from URL
  const params = new URLSearchParams(window.location.search);
  const selectedService = params.get('service');
  if (selectedService) {
    const serviceRadio = document.querySelector(`input[name="service"][value="${selectedService}"]`);
    if (serviceRadio) {
      serviceRadio.checked = true;
      const card = serviceRadio.closest('.service-card-select');
      if (card) card.classList.add('selected');
    }
  }

  function getStepElement(step) {
    return document.getElementById(`step-${step}`);
  }

  function showStep(step) {
    document.querySelectorAll('[id^="step-"]').forEach(stepEl => {
      stepEl.style.display = 'none';
    });

    const currentEl = getStepElement(step);
    if (currentEl) currentEl.style.display = 'block';

    document.querySelectorAll('.step-item, .step-btn').forEach((btn, index) => {
      const stepNum = index + 1;
      btn.classList.remove('active', 'done');

      if (stepNum < step) {
        btn.classList.add('done');
      } else if (stepNum === step) {
        btn.classList.add('active');
      }
    });

    currentStep = step;
    updateSelectedServiceNotice();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateSelectedServiceNotice() {
    const note    = document.getElementById('selected-service-note');
    const nameEl  = document.getElementById('selected-service-name');
    const emojiEl = document.getElementById('selected-svc-emoji');
    if (!note || !nameEl) return;

    const checked  = document.querySelector('input[name="service"]:checked');
    const selected = checked?.value;
    const shouldShow = currentStep === 2 && !!selected;

    note.style.display = shouldShow ? 'flex' : 'none';
    if (selected) {
      nameEl.textContent = selected;
      if (emojiEl && checked) {
        const card  = checked.closest('.service-card-select');
        const emoji = card?.querySelector('.svc-emoji')?.textContent?.trim() || '🗓️';
        emojiEl.textContent = emoji;
      }
    }
  }

  const changeServiceLink = document.getElementById('change-service-link');
  if (changeServiceLink) {
    changeServiceLink.addEventListener('click', event => {
      event.preventDefault();
      showStep(1);
    });
  }

  document.querySelectorAll('input[name="service"]').forEach(input => {
    input.addEventListener('change', updateSelectedServiceNotice);
  });

  function clearStepErrors(stepElement) {
    stepElement.querySelectorAll('.field-error').forEach(el => el.remove());
    stepElement.querySelectorAll('.input-error').forEach(el => {
      el.classList.remove('input-error');
    });
  }

  function showFieldError(input, message) {
    if (!input) return;

    input.classList.add('input-error');

    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = message;
    error.style.color = 'var(--destructive)';
    error.style.fontSize = '.85rem';
    error.style.marginTop = '.4rem';

    input.insertAdjacentElement('afterend', error);
  }

  function validateCurrentStep() {
    const stepElement = getStepElement(currentStep);
    if (!stepElement) return true;

    clearStepErrors(stepElement);
    let valid = true;

    if (currentStep === 1) {
      const service = document.querySelector('input[name="service"]:checked');
      if (!service) {
        const serviceList = stepElement.querySelector('.service-cards-grid, .service-list');
        if (serviceList) {
          const error = document.createElement('div');
          error.className = 'field-error';
          error.textContent = 'Please choose a service before continuing.';
          error.style.color = 'var(--destructive)';
          error.style.fontSize = '.9rem';
          error.style.marginTop = '1rem';
          serviceList.insertAdjacentElement('afterend', error);
        }
        valid = false;
      }
    }

    if (currentStep === 2) {
      const dateInput = document.getElementById('date');
      const timeInput = document.getElementById('time');
      const dateErr   = document.getElementById('error-date');
      const timeErr   = document.getElementById('error-time');

      if (dateErr) dateErr.style.display = 'none';
      if (timeErr) timeErr.style.display = 'none';

      if (!dateInput?.value.trim()) {
        if (dateErr) { dateErr.textContent = 'Please select a date.'; dateErr.style.display = 'block'; }
        valid = false;
      }

      if (!timeInput?.value.trim()) {
        if (timeErr) { timeErr.textContent = 'Please choose a time slot.'; timeErr.style.display = 'block'; }
        valid = false;
      }
    }

    if (currentStep === 3) {
      const nameInput = document.querySelector('input[name="name"]');
      const emailInput = document.querySelector('input[name="email"]');
      const phoneInput = document.querySelector('input[name="phone"]');

      if (!nameInput?.value.trim()) {
        showFieldError(nameInput, 'Please enter your full name.');
        valid = false;
      }

      if (!emailInput?.value.trim()) {
        showFieldError(emailInput, 'Please enter your email address.');
        valid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        showFieldError(emailInput, 'Please enter a valid email address.');
        valid = false;
      }

      if (!phoneInput?.value.trim()) {
        showFieldError(phoneInput, 'Please enter your phone number.');
        valid = false;
      } else if (!validatePhone(phoneInput.value.trim())) {
        showFieldError(phoneInput, 'Please enter a valid phone number.');
        valid = false;
      }
    }

    return valid;
  }

  function updateReview() {
    const service  = document.querySelector('input[name="service"]:checked')?.value || '—';
    const rawDate  = document.getElementById('date')?.value || '';
    const prettyDate = rawDate ? new Date(rawDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '—';
    const time     = document.getElementById('time')?.value || '—';
    const name     = document.querySelector('input[name="name"]')?.value || '—';
    const email    = document.querySelector('input[name="email"]')?.value || '—';
    const phone    = document.querySelector('input[name="phone"]')?.value || '—';

    const fields = {
      'review-service': service,
      'review-date': date,
      'review-time': time,
      'review-name': name,
      'review-email': email,
      'review-phone': phone
    };

    Object.entries(fields).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  function nextStep() {
    if (!validateCurrentStep()) return;

    if (currentStep < 4) {
      const next = currentStep + 1;
      showStep(next);

      if (next === 4) {
        updateReview();
      }
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      showStep(currentStep - 1);
    }
  }

  function submitBooking() {
    if (!validateCurrentStep()) return;

    const booking = {
      service: document.querySelector('input[name="service"]:checked')?.value || '',
      date: document.getElementById('date')?.value || '',
      time: document.getElementById('time')?.value || '',
      name: document.querySelector('input[name="name"]')?.value || '',
      email: document.querySelector('input[name="email"]')?.value || '',
      phone: document.querySelector('input[name="phone"]')?.value || '',
      notes: document.querySelector('textarea[name="notes"]')?.value || ''
    };

    sessionStorage.setItem('booking', JSON.stringify(booking));
    window.location.href = 'thankyou.html';
  }

  window.nextStep = nextStep;
  window.prevStep = prevStep;
  window.submitBooking = submitBooking;

  const requestedStep = Number(params.get('step'));
  const initialStep = requestedStep >= 1 && requestedStep <= 4 ? requestedStep : 1;
  showStep(initialStep);
}

/* ── Event Filters ───────────────────────────────────────── */
function initEventFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (!filterButtons.length) return;

  const cards = document.querySelectorAll('.event-card, .recurring-card, .news-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      cards.forEach(card => {
        const matches =
          category === 'all' || card.dataset.category === category;

        card.style.display = matches ? 'block' : 'none';
        card.classList.toggle('visible', matches);
      });
    });
  });

  const defaultButton = document.querySelector('.filter-btn[data-category="all"]');
  if (defaultButton) defaultButton.click();
}

/* ── Validation Helpers ──────────────────────────────────── */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\d\s+()\-\u2013]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
