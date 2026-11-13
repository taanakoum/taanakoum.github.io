// Portfolio interactions. Plain JavaScript, no dependencies.
(function () {
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------- toast ---------- */
  var toastEl = d.querySelector('.toast'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 1800);
  }
  function copy(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(done); }, function () { toast('Copy failed: select the text instead'); });
    } else {
      var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      d.body.appendChild(ta); ta.select();
      try { d.execCommand('copy'); toast(done); } catch (e) { toast('Copy failed: select the text instead'); }
      d.body.removeChild(ta);
    }
  }

  /* ---------- theme ---------- */
  var tbtn = d.getElementById('theme'), meta = d.querySelector('meta[name="theme-color"]');
  function theme() {
    var a = root.getAttribute('data-theme');
    if (a) return a;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncTheme() {
    var t = theme();
    if (tbtn) tbtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0D151B' : '#F6F8F7');
  }
  if (tbtn) tbtn.addEventListener('click', function () {
    var n = theme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', n); store('theme', n); syncTheme();
  });
  syncTheme();

  /* ---------- mobile menu ---------- */
  var menu = d.getElementById('menu'), mbtn = d.getElementById('menu-btn');
  function closeMenu() { if (!menu) return; menu.classList.remove('open'); mbtn.setAttribute('aria-expanded', 'false'); mbtn.setAttribute('aria-label', 'Open menu'); }
  if (mbtn && menu) {
    mbtn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      mbtn.setAttribute('aria-expanded', open); mbtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- scroll: progress bar, nav shadow, back to top ---------- */
  var nav = d.querySelector('.nav'), bar = d.querySelector('.progress span'), top = d.querySelector('.to-top'), ticking = false;
  function onScroll() {
    var y = window.scrollY || root.scrollTop, h = root.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h) : 0);
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (top) top.classList.toggle('show', y > 900);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- active section in the nav ---------- */
  if (hasIO && menu) {
    var links = {};
    Array.prototype.forEach.call(menu.querySelectorAll('a[href^="#"]'), function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (k) { var s = d.getElementById(k); if (s) secIO.observe(s); });
  }

  /* ---------- count-up numbers ---------- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
    var pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '';
    var t0 = null, dur = 1300;
    function fmt(v) { return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + fmt(end * e) + suf;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- reveal on scroll ---------- */
  if (hasIO && !reduce) {
    var groups = '.spec, .cap-grid, .soft, .stages, .three, .timeline, .skills';
    var targets = [];
    Array.prototype.forEach.call(d.querySelectorAll('.sec .wrap > *, .sheet .wrap > *, .contact-in > *'), function (el) {
      if (el.matches(groups)) {
        Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--d', (i * 0.07).toFixed(2) + 's'); targets.push(c); });
      } else targets.push(el);
    });
    // Only content below the first screen animates in; everything visible on load stays put.
    function below(el) { return el.getBoundingClientRect().top > innerHeight; }
    targets = targets.filter(below);
    targets.forEach(function (el) { el.classList.add('rv'); });
    var rvIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); rvIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { rvIO.observe(el); });

    Array.prototype.forEach.call(d.querySelectorAll('.lat, .bars'), function (b) {
      Array.prototype.forEach.call(b.querySelectorAll('.trk i'), function (i, k) { i.style.setProperty('--d', (k * 0.08).toFixed(2) + 's'); });
    });
    var viewIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); viewIO.unobserve(e.target);
        if (e.target.hasAttribute('data-count')) countUp(e.target);
      });
    }, { threshold: 0.3 });
    Array.prototype.forEach.call(d.querySelectorAll('.diagram, .chart, .audit, .lat, .bars, [data-count]'), function (el) {
      if (!below(el)) { el.classList.add('in'); return; }
      if (el.hasAttribute('data-count')) el.textContent = (el.getAttribute('data-pre') || '') + (0).toFixed(+(el.getAttribute('data-dec') || 0)) + (el.getAttribute('data-suf') || '');
      viewIO.observe(el);
    });
  }

  /* ---------- hero showcase ---------- */
  var fig = d.querySelector('[data-showcase]');
  if (fig) {
    var panels = fig.querySelectorAll('.hp'), tabs = fig.querySelectorAll('.sc-t'), words = d.querySelectorAll('.rot-w');
    var cap = fig.querySelector('.sc-cap'), pause = fig.querySelector('.sc-pause'), cur = 0, capT;
    function go(n) {
      n = (n + panels.length) % panels.length;
      if (n === cur) return;
      var prev = cur; cur = n;
      Array.prototype.forEach.call(panels, function (p, i) { p.classList.toggle('is-active', i === cur); });
      Array.prototype.forEach.call(tabs, function (t, i) { t.classList.toggle('is-on', i === cur); t.setAttribute('aria-pressed', i === cur); });
      Array.prototype.forEach.call(words, function (w, i) {
        w.classList.remove('is-out');
        if (i === prev) w.classList.add('is-out');
        w.classList.toggle('is-on', i === cur);
      });
      if (cap) {
        cap.classList.add('swap'); clearTimeout(capT);
        capT = setTimeout(function () { cap.textContent = panels[cur].getAttribute('data-cap'); cap.classList.remove('swap'); }, 200);
      }
    }
    Array.prototype.forEach.call(tabs, function (t, i) {
      t.addEventListener('click', function () { go(i); });
      var line = t.querySelector('i');
      if (line) line.addEventListener('animationend', function (e) { if (e.animationName === 'fill' && i === cur) go(cur + 1); });
    });
    if (pause) pause.addEventListener('click', function () {
      var p = fig.classList.toggle('paused');
      pause.setAttribute('aria-pressed', p);
      pause.setAttribute('aria-label', p ? 'Play the showcase' : 'Pause the showcase');
    });
    if (reduce && pause) pause.hidden = true;
  }

  /* ---------- code tabs ---------- */
  Array.prototype.forEach.call(d.querySelectorAll('[data-tabs]'), function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        d.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
        if (j === null) return;
        var n = tabs[(j + tabs.length) % tabs.length]; select(n); n.focus(); e.preventDefault();
      });
    });
    var cbtn = box.querySelector('.copy-code');
    if (cbtn) cbtn.addEventListener('click', function () {
      var p = box.querySelector('.tab-panel:not([hidden]) code');
      if (p) copy(p.textContent, 'Code copied');
    });
  });

  /* ---------- copy email ---------- */
  Array.prototype.forEach.call(d.querySelectorAll('[data-copy]'), function (b) {
    b.addEventListener('click', function () { copy(b.getAttribute('data-copy'), 'Email copied'); });
  });

  /* ---------- card spotlight ---------- */
  Array.prototype.forEach.call(d.querySelectorAll('.cap'), function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  var yr = d.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
