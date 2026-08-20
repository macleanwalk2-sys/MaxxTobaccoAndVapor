/* ═══════════════════════════════════════════════════════════
   MAXX TOBACCO & VAPOR — home page demo
   No dependencies. Everything degrades gracefully without JS.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Flag that JS is live so CSS can safely hide-then-reveal content.
  document.documentElement.classList.add('js');

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function on(el, evt, fn) { if (el) el.addEventListener(evt, fn); }

  /* ---------- Toast ---------- */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('in');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('in'); }, 3800);
  }

  /* ---------- Age gate (21+) -------------------------------
     Standard for tobacco retail. Remembers the answer for the
     session so it doesn't nag on every page view.
     Storage key: maxx_age_ok
  --------------------------------------------------------- */
  var gate = $('#gate');

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) { /* private mode — skip */ }
  }

  if (gate && storageGet('maxx_age_ok') !== 'yes') {
    gate.hidden = false;
    document.body.classList.add('is-locked');
    var yesBtn = $('#gateYes');
    if (yesBtn) yesBtn.focus();

    // Keep focus inside the dialog while it's open.
    gate.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('button', gate).filter(function (b) { return b.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    on($('#gateYes'), 'click', function () {
      storageSet('maxx_age_ok', 'yes');
      gate.hidden = true;
      document.body.classList.remove('is-locked');
    });

    on($('#gateNo'), 'click', function () {
      var deny = $('#gateDeny');
      if (deny) deny.hidden = false;
      $$('.gate__actions .btn').forEach(function (b) { b.disabled = true; b.classList.add('is-busy'); });
    });
  }

  /* ---------- Sticky header shadow ---------- */
  var hdr = $('#hdr');
  function onScroll() {
    if (hdr) hdr.classList.toggle('is-stuck', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = $('#burger');
  var nav = $('#nav');

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }

  on(burger, 'click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  // Close the menu after tapping a link, and on Escape.
  $$('#nav a').forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    reveals.forEach(function (el, i) {
      // Stagger siblings slightly so grids cascade instead of popping.
      el.style.transitionDelay = (i % 6) * 55 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Product categories (placeholders) -------------
     Each tile carries data-category. Swap the href for the real
     category page and delete this handler when those pages exist.
  --------------------------------------------------------- */
  $$('.cat').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (card.getAttribute('href') !== '#') return; // real link — let it through
      e.preventDefault();
      var name = $('.cat__name', card);
      toast('“' + (name ? name.textContent : 'This category') + '” page is coming soon.');
    });
  });

  /* ---------- Store filter ---------- */
  var filterInput = $('#storeFilter');
  var storeEls = $$('#stores .store');
  var countEl = $('#storeCount');
  var emptyEl = $('#storesEmpty');

  function applyFilter(raw) {
    var q = (raw || '').trim().toLowerCase();
    var shown = 0;

    storeEls.forEach(function (el) {
      var hay = (el.dataset.search || '') + ' ' + el.textContent.toLowerCase();
      var match = !q || hay.toLowerCase().indexOf(q) !== -1;
      el.hidden = !match;
      if (match) shown++;
    });

    if (countEl) countEl.textContent = shown + (shown === 1 ? ' store' : ' stores');
    if (emptyEl) emptyEl.hidden = shown !== 0;
  }

  on(filterInput, 'input', function (e) { applyFilter(e.target.value); });
  on($('#clearFilter'), 'click', function () {
    if (filterInput) { filterInput.value = ''; filterInput.focus(); }
    applyFilter('');
  });

  /* ---------- "Find nearest location" (placeholder) ---------
     Wired up as a demo interaction only. To make it real you need
     lat/lng for each store, then:
       navigator.geolocation.getCurrentPosition(pos => {
         // sort store cards by haversine distance from pos.coords
       });
  --------------------------------------------------------- */
  var locateBtn = $('#locateBtn');
  on(locateBtn, 'click', function () {
    var label = $('.btn__label', locateBtn);
    var original = label ? label.textContent : '';

    locateBtn.classList.add('is-busy');
    if (label) label.textContent = 'Locating…';

    setTimeout(function () {
      locateBtn.classList.remove('is-busy');
      if (label) label.textContent = original;
      toast('Distance sorting is coming soon — for now, filter by city or street below.');
      if (filterInput) filterInput.focus();
    }, 900);
  });

  /* ---------- Contact form (demo) ---------------------------
     data-demo short-circuits the submit. Point the <form> at a real
     endpoint and remove that attribute to go live.
  --------------------------------------------------------- */
  var form = $('#contactForm');
  on(form, 'submit', function (e) {
    if (!form.hasAttribute('data-demo')) return;
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var btn = $('button[type="submit"]', form);
    if (btn) { btn.classList.add('is-busy'); btn.textContent = 'Sending…'; }

    setTimeout(function () {
      var ok = $('#formOk');
      if (ok) ok.hidden = false;
      if (btn) { btn.classList.remove('is-busy'); btn.textContent = 'Send Message'; }
      form.reset();
      toast('Demo only — no message was actually sent.');
    }, 700);
  });

  /* ---------- Footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
