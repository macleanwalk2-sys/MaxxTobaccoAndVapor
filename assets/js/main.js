/* ═══════════════════════════════════════════════════════════
   MAXX TOBACCO & VAPOR / home page demo
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
    try { window.localStorage.setItem(key, val); } catch (e) { /* private mode, skip */ }
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
      if (card.getAttribute('href') !== '#') return; // real link, let it through
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
      toast('Distance sorting is coming soon. For now, filter by city or street below.');
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
      toast('Demo only. No message was actually sent.');
    }, 700);
  });

  /* ---------- Hero vapor -------------------------------------
     A slow exhale that drifts across the hero every few seconds.
     Everything worth tweaking is in VAPOR: raise `every` for rarer
     puffs, `alpha` for a heavier cloud, `originX/Y` to move the
     source. Sits behind the headline and never intercepts clicks.

     It pauses when the hero scrolls out of view or the tab is
     hidden, and never starts at all under reduced motion.
  ----------------------------------------------------------- */
  var VAPOR = {
    every:   9,            // seconds between puffs
    count:   20,           // particles per puff, scaled up on wide heroes
    life:    [4.5, 7.5],   // seconds a particle lasts
    speed:   [35, 90],     // px/sec at birth
    originX: 0.70,         // source sits right of the copy, in open space
    originY: 0.66,         // and below it, so it never crosses the headline
    spread:  [28, 24],     // how far apart particles are born, x and y
    radius:  [18, 38],     // birth radius; wider means no hot core
    alpha:   0.20          // peak opacity per particle
  };

  (function heroVapor() {
    var canvas = $('#heroVapor');
    if (!canvas || !canvas.getContext) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, parts = [], timer = 1.4, running = false, raf = 0, last = 0;
    var visible = true;

    // One soft sprite, drawn scaled per particle. Building a gradient per
    // particle per frame is what makes naive smoke effects stutter.
    var sprite = (function () {
      var n = 128, c = document.createElement('canvas');
      c.width = c.height = n;
      var g = c.getContext('2d');
      var grd = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      grd.addColorStop(0, 'rgba(214,230,255,0.30)');
      grd.addColorStop(0.4, 'rgba(214,230,255,0.10)');
      grd.addColorStop(1, 'rgba(214,230,255,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, n, n);
      return c;
    })();

    function rnd(a, b) { return a + Math.random() * (b - a); }

    function fit() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function puff() {
      var scale = Math.max(1, W / 560);   // a wide hero needs more particles
      var n = Math.round(VAPOR.count * scale);
      for (var i = 0; i < n; i++) {
        var ang = rnd(-0.30, 0.30) - 0.10;
        var sp = rnd(VAPOR.speed[0], VAPOR.speed[1]) * Math.sqrt(scale);
        parts.push({
          x: W * VAPOR.originX + rnd(-VAPOR.spread[0], VAPOR.spread[0]),
          y: H * VAPOR.originY + rnd(-VAPOR.spread[1], VAPOR.spread[1]),
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          age: 0,
          life: rnd(VAPOR.life[0], VAPOR.life[1]),
          r: rnd(VAPOR.radius[0], VAPOR.radius[1]),
          grow: rnd(14, 26)
        });
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      timer -= dt;
      if (timer <= 0) { puff(); timer = VAPOR.every; }

      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.age += dt;
        if (p.age >= p.life) { parts.splice(i, 1); continue; }
        p.vy -= 9 * dt;                       // gentle lift
        var drag = Math.pow(0.55, dt);
        p.vx *= drag; p.vy *= drag;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.r += p.grow * dt;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var j = 0; j < parts.length; j++) {
        var q = parts[j], u = q.age / q.life;
        var a = u < 0.18 ? u / 0.18 : 1 - (u - 0.18) / 0.82;
        if (a <= 0) continue;
        ctx.globalAlpha = a * VAPOR.alpha;
        ctx.drawImage(sprite, q.x - q.r, q.y - q.r, q.r * 2, q.r * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    }

    fit();
    window.addEventListener('resize', fit, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (visible) start();
    });

    var heroEl = $('.hero');
    if ('IntersectionObserver' in window && heroEl) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start(); else stop();
      }, { rootMargin: '60px' }).observe(heroEl);
    } else {
      start();
    }
  })();

  /* ---------- Footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();
