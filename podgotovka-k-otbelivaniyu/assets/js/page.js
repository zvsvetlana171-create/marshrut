/* Рекомендации «Подготовка к отбеливанию»: выбор геля, таймер 3 минуты, «засечь время» до еды, «ваш филиал».
   Без JS страница читается полностью: обе инструкции идут подряд, кнопки таймера и «засечь время» скрыты.
   Выбранный гель и время, до которого нельзя есть, хранятся на этом устройстве (localStorage).
   ?gel=rocs|gc — администратор может отправить ссылку сразу на нужный гель.
   ?branch=mitino|krasnogorsk — отметка «Ваш филиал». */
(function () {
  'use strict';

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  function load(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function save(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* без памяти — всё работает до закрытия страницы */ }
  }

  function each(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  /* ---------- Ваш филиал ---------- */
  var branch = param('branch').toLowerCase();
  each('.place[data-branch]', function (place) {
    if (place.getAttribute('data-branch') === branch) place.classList.add('place--mine');
  });

  /* ---------- Выбор геля ---------- */
  var GELS = ['rocs', 'gc'];
  var GEL_KEY = 'dp-whitening-gel';
  var tabs = document.querySelector('[data-tabs]');

  function show(name) {
    each('[data-tab]', function (tab) {
      var on = tab.getAttribute('data-tab') === name;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });
    each('[data-panel]', function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== name;
    });
  }

  if (tabs) {
    var gel = param('gel').toLowerCase();
    if (GELS.indexOf(gel) !== -1) save(GEL_KEY, gel);
    else gel = load(GEL_KEY);
    if (GELS.indexOf(gel) === -1) gel = GELS[0];

    each('[data-tab]', function (tab) {
      tab.addEventListener('click', function () {
        var name = tab.getAttribute('data-tab');
        save(GEL_KEY, name);
        show(name);
      });
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        var next = GELS[(GELS.indexOf(tab.getAttribute('data-tab')) + 1) % GELS.length];
        var target = document.querySelector('[data-tab="' + next + '"]');
        if (target) { target.click(); target.focus(); }
      });
    });
    show(gel);
    tabs.hidden = false;
  }

  /* ---------- Таймер 3 минуты: нажатие запускает, повторное — сбрасывает ---------- */
  each('[data-timer]', function (btn) {
    var label = btn.querySelector('[data-timer-label]');
    var initial = label ? label.innerHTML : '';
    var total = +btn.getAttribute('data-timer');
    var end = 0;
    var tick;

    function reset() {
      clearInterval(tick);
      end = 0;
      btn.classList.remove('is-running', 'is-done');
      if (label) label.innerHTML = initial;
    }

    function render() {
      var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      if (left === 0) {
        clearInterval(tick);
        end = 0;
        btn.classList.remove('is-running');
        btn.classList.add('is-done');
        if (label) label.textContent = 'Готово: 3 минуты прошли';
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        return;
      }
      var s = left % 60;
      if (label) label.textContent = Math.floor(left / 60) + ':' + (s < 10 ? '0' : '') + s + ' — нажмите, чтобы сбросить';
    }

    btn.addEventListener('click', function () {
      if (end || btn.classList.contains('is-done')) { reset(); return; }
      end = Date.now() + total * 1000;
      btn.classList.add('is-running');
      render();
      tick = setInterval(render, 250);
    });
    btn.hidden = false;
  });

  /* ---------- Засечь время: до скольких не есть и не пить ---------- */
  function hhmm(t) {
    var d = new Date(t);
    var m = d.getMinutes();
    return d.getHours() + ':' + (m < 10 ? '0' : '') + m;
  }

  each('[data-wait]', function (btn) {
    var id = btn.getAttribute('data-wait');
    var key = 'dp-gel-wait-' + id;
    var minutes = +btn.getAttribute('data-minutes');
    var out = document.querySelector('[data-wait-out="' + id + '"]');

    function render() {
      var end = +load(key) || 0;
      if (!out) return;
      if (!end || Date.now() - end > 3600000) { out.hidden = true; return; }
      out.hidden = false;
      out.innerHTML = Date.now() < end
        ? 'Можно есть и&nbsp;пить после <b>' + hhmm(end) + '</b>'
        : 'Время прошло&nbsp;— можно есть и&nbsp;пить';
    }

    btn.addEventListener('click', function () {
      save(key, String(Date.now() + minutes * 60000));
      render();
    });
    render();
    setInterval(render, 20000);
    btn.hidden = false;
  });
})();
