(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const menuBtn = $('.menu-toggle');
  const mobileNav = $('.mobile-nav');

  function setMenu(open) {
    mobileNav.classList.toggle('open', open);
    mobileNav.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
    document.body.classList.toggle('menu-open', open);
  }

  menuBtn?.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));
  $$('.mobile-nav a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', (event) => {
    if (mobileNav?.classList.contains('open') && !mobileNav.contains(event.target) && !menuBtn.contains(event.target)) setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1050) setMenu(false);
  });

  $$('[data-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = $(button.dataset.scroll);
      target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  const serviceDetails = {
    Tattoos: {
      formValue: 'Tattoo',
      text: 'Progetti personalizzati, consulenza artistica e massima attenzione a igiene e precisione.'
    },
    Piercing: {
      formValue: 'Piercing',
      text: 'Piercing professionale su appuntamento, con materiali di qualità e indicazioni precise per la cura.'
    },
    Gems: {
      formValue: 'Gems',
      text: 'Applicazione di tooth gems e dettagli decorativi per uno stile personale, luminoso e originale.'
    },
    Abbigliamento: {
      formValue: 'Abbigliamento',
      text: 'Selezione di capi e accessori ispirati alla cultura tattoo e all’identità del Biumo Tattoo Club.'
    }
  };

  const serviceDetail = $('.service-detail');
  const serviceSelect = $('#service');

  function selectService(button) {
    const service = button.dataset.service;
    const detail = serviceDetails[service];
    if (!detail) return;

    $$('[data-service]').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    serviceDetail.innerHTML = `
      <div><strong>${service}</strong><p>${detail.text}</p></div>
      <button type="button" class="service-book" data-book-service="${detail.formValue}">
        Prenota
        <svg class="button-icon" aria-hidden="true"><use href="#i-arrow"></use></svg>
      </button>`;
  }

  $$('[data-service]').forEach((button) => button.addEventListener('click', () => selectService(button)));

  document.addEventListener('click', (event) => {
    const bookingButton = event.target.closest('[data-book-service]');
    if (!bookingButton) return;
    if (serviceSelect) serviceSelect.value = bookingButton.dataset.bookService;
    $('#prenota')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => $('#name')?.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 450);
  });

  const galleryItems = $$('.gallery-item');
  const lightbox = $('.lightbox');
  const lightboxImage = $('.lightbox img');
  const lightboxCaption = $('.lightbox figcaption');
  const lightboxCounter = $('.lightbox-counter');
  const lightboxStage = $('.lightbox-stage');
  const lightboxClose = $('.lightbox-close');
  let currentImage = 0;
  let returnFocus = null;

  function visibleGalleryItems() {
    return galleryItems.filter((item) => getComputedStyle(item).display !== 'none');
  }

  function renderLightbox(index) {
    const items = visibleGalleryItems();
    if (!items.length) return;
    currentImage = (index + items.length) % items.length;

    const item = items[currentImage];
    const image = $('img', item);
    const thumbnailSource = image.currentSrc || image.src;
    const fullSource = item.dataset.full || thumbnailSource;

    lightboxStage?.classList.add('loading');
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.alt;
    if (lightboxCounter) lightboxCounter.textContent = `${currentImage + 1} / ${items.length}`;

    lightboxImage.onload = () => lightboxStage?.classList.remove('loading');
    lightboxImage.onerror = () => {
      if (lightboxImage.src !== thumbnailSource) {
        lightboxImage.src = thumbnailSource;
      } else {
        lightboxStage?.classList.remove('loading');
      }
    };
    lightboxImage.src = fullSource;
  }

  function openLightbox(item) {
    const items = visibleGalleryItems();
    returnFocus = item;
    renderLightbox(items.indexOf(item));
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lightboxImage.removeAttribute('src');
    lightboxImage.onload = null;
    lightboxImage.onerror = null;
    lightboxStage?.classList.remove('loading');
    if (lightboxCounter) lightboxCounter.textContent = '';
    returnFocus?.focus();
  }

  galleryItems.forEach((item) => item.addEventListener('click', () => openLightbox(item)));
  lightboxClose?.addEventListener('click', closeLightbox);
  $('.lightbox-prev')?.addEventListener('click', () => renderLightbox(currentImage - 1));
  $('.lightbox-next')?.addEventListener('click', () => renderLightbox(currentImage + 1));
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  let swipeStartX = null;
  lightboxStage?.addEventListener('pointerdown', (event) => {
    swipeStartX = event.clientX;
  });
  lightboxStage?.addEventListener('pointerup', (event) => {
    if (swipeStartX === null) return;
    const distance = event.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(distance) < 45) return;
    renderLightbox(currentImage + (distance < 0 ? 1 : -1));
  });
  lightboxStage?.addEventListener('pointercancel', () => { swipeStartX = null; });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenu(false);
      closeLightbox();
    }
    if (!lightbox?.classList.contains('open')) return;
    if (event.key === 'ArrowLeft') renderLightbox(currentImage - 1);
    if (event.key === 'ArrowRight') renderLightbox(currentImage + 1);
    if (event.key === 'Tab') {
      const focusable = $$('.lightbox button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const showAll = $('#showAll');
  showAll?.addEventListener('click', () => {
    const expanded = showAll.getAttribute('aria-expanded') === 'true';
    $$('.gallery-item.extra').forEach((item) => item.classList.toggle('show', !expanded));
    showAll.setAttribute('aria-expanded', String(!expanded));
    showAll.innerHTML = expanded
      ? 'Vedi tutti <svg class="button-icon" aria-hidden="true"><use href="#i-arrow"></use></svg>'
      : 'Mostra meno <svg class="button-icon" aria-hidden="true"><use href="#i-up"></use></svg>';
  });

  const form = $('#bookingForm');
  const formStatus = form ? $('.form-status', form) : null;
  const submitButton = form ? $('button[type="submit"]', form) : null;
  const phoneInput = $('#phone');
  let submissionLocked = false;

  function setFormStatus(message, type = '') {
    if (!formStatus) return;
    formStatus.className = `form-status${type ? ` ${type}` : ''}`;
    formStatus.textContent = message;
  }

  function getLastSubmission() {
    try {
      return JSON.parse(localStorage.getItem('btcLastBooking') || 'null');
    } catch {
      return null;
    }
  }

  function saveLastSubmission(fingerprint) {
    try {
      localStorage.setItem('btcLastBooking', JSON.stringify({ fingerprint, time: Date.now() }));
    } catch {
      // Booking still works when storage is unavailable.
    }
  }

  form?.addEventListener('input', (event) => {
    if (event.target === phoneInput) phoneInput.setCustomValidity('');
    if (formStatus?.classList.contains('error')) setFormStatus('');
  });

  form?.addEventListener('change', () => {
    if (formStatus?.classList.contains('error')) setFormStatus('');
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (submissionLocked) return;

    form.classList.add('was-validated');
    setFormStatus('');

    if (!form.checkValidity()) {
      setFormStatus('Controlla i campi obbligatori evidenziati.', 'error');
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const service = String(formData.get('service') || '').trim();
    const artist = String(formData.get('artist') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const website = String(formData.get('website') || '').trim();
    const phoneDigits = phone.replace(/\D/g, '');

    if (website) {
      setFormStatus('Richiesta ricevuta.', 'success');
      return;
    }

    if (name.length < 2) {
      setFormStatus('Inserisci un nome valido.', 'error');
      $('#name')?.focus();
      return;
    }

    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      phoneInput?.setCustomValidity('Inserisci un numero di telefono valido.');
      setFormStatus('Inserisci un numero di telefono valido.', 'error');
      phoneInput?.reportValidity();
      phoneInput?.focus();
      return;
    }

    if (!service || !artist || message.length < 8) {
      setFormStatus('Completa servizio, artista e descrizione della richiesta.', 'error');
      return;
    }

    const fingerprint = [name.toLowerCase(), phoneDigits, service, artist, message.toLowerCase()].join('|');
    const lastSubmission = getLastSubmission();
    if (lastSubmission?.fingerprint === fingerprint && Date.now() - lastSubmission.time < 60000) {
      setFormStatus('Questa richiesta è già stata preparata. Attendi un minuto prima di inviarla di nuovo.', 'error');
      return;
    }

    const whatsappMessage = [
      'Ciao Biumo Tattoo Club,',
      `sono ${name}.`,
      `Servizio: ${service}`,
      `Artista preferito: ${artist}`,
      `Telefono: ${phone}`,
      `Messaggio: ${message}`
    ].join('\n');

    const url = `https://wa.me/393321760590?text=${encodeURIComponent(whatsappMessage)}`;
    submissionLocked = true;
    submitButton?.setAttribute('aria-busy', 'true');
    if (submitButton) submitButton.disabled = true;
    saveLastSubmission(fingerprint);

    const fallbackLink = document.createElement('a');
    fallbackLink.href = url;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.textContent = 'Apri WhatsApp';
    fallbackLink.className = 'form-status-link';

    formStatus?.replaceChildren(
      document.createTextNode('Richiesta pronta. WhatsApp si apre in una nuova scheda. '),
      fallbackLink
    );
    formStatus?.classList.add('success');

    const launchLink = fallbackLink.cloneNode(true);
    launchLink.style.display = 'none';
    document.body.appendChild(launchLink);
    launchLink.click();
    launchLink.remove();

    window.setTimeout(() => {
      submissionLocked = false;
      if (submitButton) submitButton.disabled = false;
      submitButton?.removeAttribute('aria-busy');
    }, 4500);
  });

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  const navLinks = $$('.desktop-nav a, .mobile-nav a');
  const navTargets = [...new Set(navLinks.map((link) => link.getAttribute('href')).filter((href) => href?.startsWith('#')))]
    .map((href) => document.getElementById(href.slice(1)))
    .filter(Boolean)
    .sort((a, b) => a.offsetTop - b.offsetTop);

  const topButton = $('.to-top');
  const header = $('.site-header');
  let scrollFrame = null;

  function updateOnScroll() {
    scrollFrame = null;
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 30);
    topButton?.classList.toggle('show', y > 650);

    const marker = y + Math.min(window.innerHeight * 0.38, 320);
    let current = navTargets[0];
    navTargets.forEach((target) => {
      if (target.offsetTop <= marker) current = target;
    });

    navLinks.forEach((link) => {
      const active = current && link.getAttribute('href') === `#${current.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateOnScroll);
  }, { passive: true });

  topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));

  $('#year').textContent = new Date().getFullYear();
  updateOnScroll();
})();
