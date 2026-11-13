(function () {
  'use strict';

  var TARGETS = '.dpwb-gel__img';
  var STEP = 90;
  var MAX_STEPS = 3;
  var DURATION = 700;
  var GELS = ['rocs', 'gc'];
  var GEL_KEY = 'dp-whitening-gel';

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    if (!m) return '';
    try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { return ''; }
  }

  function load(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function save(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { return; }
  }

  function each(root, selector, fn) {
    Array.prototype.forEach.call(root.querySelectorAll(selector), fn);
  }

  function branches(root) {
    var branch = param('branch').toLowerCase();
    each(root, '.dpwb-place[data-branch]', function (place) {
      if (place.getAttribute('data-branch') === branch) place.classList.add('dpwb-place--mine');
    });
  }

  function tabs(root) {
    var bar = root.querySelector('[data-tabs]');
    if (!bar) return;

    var show = function (name) {
      each(root, '[data-tab]', function (tab) {
        var on = tab.getAttribute('data-tab') === name;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
      });
      each(root, '[data-panel]', function (panel) {
        panel.hidden = panel.getAttribute('data-panel') !== name;
      });
    };

    var gel = param('gel').toLowerCase();
    if (GELS.indexOf(gel) !== -1) save(GEL_KEY, gel);
    else gel = load(GEL_KEY);
    if (GELS.indexOf(gel) === -1) gel = GELS[0];

    each(root, '[data-tab]', function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.getAttribute('data-tab');
        save(GEL_KEY, name);
        show(name);
      });
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        var next = GELS[(GELS.indexOf(tab.getAttribute('data-tab')) + 1) % GELS.length];
        var target = root.querySelector('[data-tab="' + next + '"]');
        if (target) {
          target.click();
          target.focus();
        }
      });
    });
    show(gel);
    bar.hidden = false;
  }

  function timers(root) {
    each(root, '[data-timer]', function (btn) {
      var label = btn.querySelector('[data-timer-label]');
      var initial = label ? label.textContent : '';
      var total = +btn.getAttribute('data-timer');
      var key = 'dp-gel-timer-' + (btn.getAttribute('data-timer-id') || 'main');
      var end = 0;
      var tick;

      var reset = function () {
        clearInterval(tick);
        end = 0;
        save(key, '');
        btn.classList.remove('dpwb-is-running', 'dpwb-is-done');
        if (label) label.textContent = initial;
      };

      var done = function () {
        clearInterval(tick);
        end = 0;
        save(key, '');
        btn.classList.remove('dpwb-is-running');
        btn.classList.add('dpwb-is-done');
        if (label) label.textContent = '\u0413\u043e\u0442\u043e\u0432\u043e: 30 \u043c\u0438\u043d\u0443\u0442 \u043f\u0440\u043e\u0448\u043b\u0438, \u0441\u043d\u0438\u043c\u0438\u0442\u0435 \u043a\u0430\u043f\u043f\u0443';
      };

      var render = function () {
        var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        if (left === 0) {
          done();
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return;
        }
        var s = left % 60;
        if (label) label.textContent = Math.floor(left / 60) + ':' + (s < 10 ? '0' : '') + s + ' \u2014 \u043d\u0430\u0436\u043c\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0441\u0431\u0440\u043e\u0441\u0438\u0442\u044c';
      };

      var start = function () {
        btn.classList.add('dpwb-is-running');
        render();
        tick = setInterval(render, 250);
      };

      btn.addEventListener('click', function () {
        if (end || btn.classList.contains('dpwb-is-done')) {
          reset();
          return;
        }
        end = Date.now() + total * 1000;
        save(key, String(end));
        start();
      });

      var saved = +load(key) || 0;
      if (saved > Date.now()) {
        end = saved;
        start();
      } else if (saved && Date.now() - saved < 600000) {
        done();
      } else if (saved) {
        save(key, '');
      }
      btn.hidden = false;
    });
  }
  function hhmm(t) {
    var d = new Date(t);
    var m = d.getMinutes();
    return d.getHours() + ':' + (m < 10 ? '0' : '') + m;
  }

  function waits(root) {
    each(root, '[data-wait]', function (btn) {
      var id = btn.getAttribute('data-wait');
      var key = 'dp-gel-wait-' + id;
      var minutes = +btn.getAttribute('data-minutes');
      var out = root.querySelector('[data-wait-out="' + id + '"]');

      var render = function () {
        var end = +load(key) || 0;
        if (!out) return;
        if (!end || Date.now() - end > 3600000) {
          out.hidden = true;
          return;
        }
        out.hidden = false;
        while (out.firstChild) out.removeChild(out.firstChild);
        if (Date.now() < end) {
          var time = document.createElement('b');
          time.textContent = hhmm(end);
          out.appendChild(document.createTextNode('\u041c\u043e\u0436\u043d\u043e \u043f\u0438\u0442\u044c \u0438\u00a0\u043f\u043e\u043b\u043e\u0441\u043a\u0430\u0442\u044c \u0440\u043e\u0442 \u043f\u043e\u0441\u043b\u0435 '));
          out.appendChild(time);
        } else {
          out.appendChild(document.createTextNode('\u0427\u0430\u0441 \u043f\u0440\u043e\u0448\u0451\u043b\u00a0\u2014 \u043c\u043e\u0436\u043d\u043e \u043f\u0438\u0442\u044c \u0438\u00a0\u043f\u043e\u043b\u043e\u0441\u043a\u0430\u0442\u044c \u0440\u043e\u0442'));
        }
      };

      btn.addEventListener('click', function () {
        save(key, String(Date.now() + minutes * 60000));
        render();
      });
      render();
      setInterval(render, 20000);
      btn.hidden = false;
    });
  }

  function reveal(root) {
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (reduce || !('IntersectionObserver' in window)) return;

    var viewH = window.innerHeight || document.documentElement.clientHeight;
    var hidden = [];

    try {
      Array.prototype.slice.call(root.querySelectorAll(TARGETS)).forEach(function (el) {
        if (el.getClientRects().length && el.getBoundingClientRect().top < viewH) return;
        el.classList.add('dpwb-reveal');
        hidden.push(el);
      });
      if (!hidden.length) return;

      var show = function (el, delay) {
        el.style.setProperty('--dpwb-reveal-delay', delay + 'ms');
        el.classList.add('dpwb-is-in');
        window.setTimeout(function () {
          el.classList.remove('dpwb-reveal', 'dpwb-is-in');
          el.style.removeProperty('--dpwb-reveal-delay');
          if (!el.getAttribute('style')) el.removeAttribute('style');
        }, delay + DURATION + 50);
      };

      var observer = new IntersectionObserver(function (entries) {
        entries
          .filter(function (entry) { return entry.isIntersecting; })
          .map(function (entry) { return entry.target; })
          .sort(function (a, b) { return hidden.indexOf(a) - hidden.indexOf(b); })
          .forEach(function (el, index) {
            observer.unobserve(el);
            show(el, Math.min(index, MAX_STEPS) * STEP);
          });
      }, { rootMargin: '0px 0px -4% 0px', threshold: 0 });
      hidden.forEach(function (el) { observer.observe(el); });
    } catch (e) {
      hidden.forEach(function (el) {
        el.classList.remove('dpwb-reveal', 'dpwb-is-in');
      });
    }
  }

  function run(fn, root) {
    try { fn(root); } catch (e) { return; }
  }

  function init() {
    var root = document.querySelector('.dp-wb-v1');
    if (!root || root.hasAttribute('data-dpwb-init')) return;
    root.setAttribute('data-dpwb-init', '');
    run(branches, root);
    run(tabs, root);
    run(timers, root);
    run(waits, root);
    run(reveal, root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
