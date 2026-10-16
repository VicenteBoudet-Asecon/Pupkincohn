/* Pupkin Cohn — site behaviour. No dependencies. */
(() => {
  'use strict';

  /* ------------------------------------------------------------------
     Configuration
     ------------------------------------------------------------------ */
  // If you set an endpoint (Formspree, Getform, your own API…), the contact form
  // is POSTed there as JSON. If it is empty, the form opens the visitor's email
  // client with the message pre-filled (works on any static host).
  const FORM_ENDPOINT = '';
  const CONTACT_EMAIL = 'contacto@pupkincohn.com';
  const STORAGE_KEY = 'pkcn-lang';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const I18N = window.PKCN_I18N || { en: {}, js: { es: {}, en: {} } };

  /* ------------------------------------------------------------------
     i18n  (Spanish = original HTML, English = dictionary)
     ------------------------------------------------------------------ */
  const textNodes = $$('[data-i18n]').map((el) => ({ el, key: el.dataset.i18n, es: el.innerHTML }));
  const attrNodes = [];
  $$('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) attrNodes.push({ el, attr, key, es: el.getAttribute(attr) });
    });
  });

  let lang = window.__PKCN_LANG === 'en' ? 'en' : 'es';
  let heroState = null; // set by the hero slider; lets language changes refresh its labels
  const statusKeys = new Map(); // status element -> last message key, re-rendered when the language changes

  const t = (key) => (I18N.js[lang] && I18N.js[lang][key]) || '';

  function setStatus(box, key) {
    statusKeys.set(box, key);
    renderStatus(box);
  }
  function renderStatus(box) {
    const key = statusKeys.get(box);
    box.textContent = key ? t(key) : '';
    box.dataset.state = key === 'form.error' || key === 'form.invalid' ? 'error' : 'ok';
  }

  function applyLang(next) {
    const dict = next === 'en' ? I18N.en : null;
    textNodes.forEach(({ el, key, es }) => {
      const value = dict ? dict[key] : es;
      if (typeof value === 'string') el.innerHTML = value;
    });
    attrNodes.forEach(({ el, attr, key, es }) => {
      const value = dict ? dict[key] : es;
      if (typeof value === 'string') el.setAttribute(attr, value);
    });
    lang = next;
    root.lang = next;
    root.setAttribute('data-lang', next);
    $$('[data-set-lang]').forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.setLang === next)));
    statusKeys.forEach((_, box) => renderStatus(box));
    if (heroState) heroState.refreshLabels();
  }

  function persistLang(next) {
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* storage unavailable */ }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', next);
      history.replaceState(null, '', url);
    } catch (e) { /* e.g. file:// previews */ }
  }

  function setLang(next) {
    if (next === lang) return;
    persistLang(next);
    if (reduceMotion) { applyLang(next); return; }
    root.classList.add('is-switching');
    setTimeout(() => {
      applyLang(next);
      requestAnimationFrame(() => root.classList.remove('is-switching'));
    }, 190);
  }

  $$('main, .site-footer, .nav').forEach((el) => el.classList.add('i18n-fade'));
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-set-lang]');
    if (btn) setLang(btn.dataset.setLang);
  });

  // First paint: the <head> script already picked the language; translate now.
  if (lang === 'en') applyLang('en');
  root.classList.add('i18n-ready');

  /* ------------------------------------------------------------------
     Header: scrolled state, mobile menu, active link
     ------------------------------------------------------------------ */
  const header = $('.site-header');
  let ticking = false;

  function onScroll() {
    header.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset) > 24);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  const burger = $('.burger');
  const nav = $('#nav');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 1181px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Highlight the nav link of the section currently in view
  const navLinks = $$('.nav__list a');
  // The hero is observed too (it has no nav link), so scrolling back up clears the highlight.
  const sections = [$('#inicio'), ...navLinks.map((a) => $(a.getAttribute('href')))].filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */
  $$('[data-stagger]').forEach((group) => {
    $$(':scope > [data-reveal]', group).forEach((el, i) => el.style.setProperty('--d', (i * 0.1).toFixed(2) + 's'));
  });
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     Practice areas accordion (one open at a time)
     ------------------------------------------------------------------ */
  function setArea(item, open) {
    item.classList.toggle('is-open', open);
    $('.area__head', item).setAttribute('aria-expanded', String(open));
  }
  function openArea(item) {
    $$('.area.is-open').forEach((other) => { if (other !== item) setArea(other, false); });
    setArea(item, true);
  }
  $$('.area__head').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.area');
      if (item.classList.contains('is-open')) setArea(item, false);
      else openArea(item);
    });
  });

  // Tiles under the hero jump to their practice area and open it
  const areaItems = $$('.area');
  $$('[data-open-area]').forEach((link) => {
    link.addEventListener('click', () => {
      const item = areaItems[Number(link.dataset.openArea) - 1];
      if (item) openArea(item);
    });
  });

  /* ------------------------------------------------------------------
     Hero: rotating messages (auto-advance, pause button, dots)
     ------------------------------------------------------------------ */
  const hero = $('.hero');
  const slides = $$('.slide', hero);
  const dots = $$('.dot', hero);
  const pauseBtn = $('.hero__pause', hero);
  const SLIDE_MS = 7000;

  if (hero && slides.length > 1) {
    let index = 0;
    let timer = null;
    let userPaused = reduceMotion;   // never auto-advance for people who asked for less motion
    let hovering = false;

    const playing = () => !userPaused && !hovering && !document.hidden;

    function sync() {
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        if (i === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }
    function schedule() {
      clearTimeout(timer);
      hero.classList.toggle('is-playing', playing());
      hero.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
      $('#hero-slides').setAttribute('aria-live', playing() ? 'off' : 'polite');
      if (!playing()) return;
      // restart the dot's progress animation for the new slide
      const active = dots[index];
      active.classList.remove('is-active'); void active.offsetWidth; active.classList.add('is-active');
      timer = setTimeout(() => go(index + 1), SLIDE_MS);
    }
    function go(next) {
      index = (next + slides.length) % slides.length;
      sync();
      schedule();
    }
    function refreshLabels() {
      dots.forEach((d, i) => d.setAttribute('aria-label', t('hero.goto').replace('{n}', i + 1)));
      pauseBtn.setAttribute('aria-label', t(userPaused ? 'hero.play' : 'hero.pause'));
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
    }

    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    pauseBtn.addEventListener('click', () => { userPaused = !userPaused; refreshLabels(); schedule(); });
    hero.addEventListener('mouseenter', () => { hovering = true; schedule(); });
    hero.addEventListener('mouseleave', () => { hovering = false; schedule(); });
    hero.addEventListener('focusin', () => { hovering = true; schedule(); });
    hero.addEventListener('focusout', () => { hovering = false; schedule(); });
    document.addEventListener('visibilitychange', schedule);

    heroState = { refreshLabels };
    refreshLabels();
    sync();
    schedule();
  }

  /* ------------------------------------------------------------------
     Contact form. With FORM_ENDPOINT they POST as JSON;
     without it they open the visitor's email client, pre-filled.
     ------------------------------------------------------------------ */
  function wireForm(form, statusBox, { okKey, subjectKey, build }) {
    const submit = $('button[type="submit"]', form);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return; // honeypot

      if (!form.checkValidity()) {
        setStatus(statusBox, 'form.invalid');
        form.reportValidity();
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      delete data.website;
      delete data.consent;
      data.language = lang;
      data.form = form.id;
      if (form.elements.area) {
        const sel = form.elements.area;
        data.area = sel.value ? sel.selectedOptions[0].textContent.trim() : '';
      }

      setStatus(statusBox, 'form.sending');
      submit.disabled = true;

      try {
        if (FORM_ENDPOINT) {
          const res = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          setStatus(statusBox, okKey);
        } else {
          const body = build(data).filter((l) => l !== undefined && l !== false && l !== null).join('\n');
          window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t(subjectKey))}&body=${encodeURIComponent(body)}`;
          setStatus(statusBox, 'form.mailto');
        }
      } catch (err) {
        setStatus(statusBox, 'form.error');
      } finally {
        submit.disabled = false;
      }
    });
  }

  const contactForm = $('#contact-form');
  if (contactForm) {
    wireForm(contactForm, $('#form-status'), {
      okKey: 'form.ok',
      subjectKey: 'mail.subject',
      build: (d) => [
        `${t('mail.name')}: ${d.name}`,
        d.company && `${t('mail.company')}: ${d.company}`,
        `${t('mail.email')}: ${d.email}`,
        d.phone && `${t('mail.phone')}: ${d.phone}`,
        d.area && `${t('mail.area')}: ${d.area}`,
        '',
        d.message
      ]
    });
  }

  /* ------------------------------------------------------------------
     Misc
     ------------------------------------------------------------------ */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
