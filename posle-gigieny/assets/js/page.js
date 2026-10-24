/* Рекомендации «После профессиональной гигиены»: «засечь 30 минут» и отметка «ваш филиал».
   Без JS страница читается полностью: срок «30 минут» написан в тексте, кнопка «засечь время» скрыта.
   Время, до которого лучше не есть и не пить, хранится на этом устройстве (localStorage) один час.
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
    try { window.localStorage.setItem(key, value); } catch (e) { /* без памяти — подсказка работает до закрытия страницы */ }
  }

  /* ---------- Ваш филиал ---------- */
  var branch = param('branch').toLowerCase();
  Array.prototype.forEach.call(document.querySelectorAll('.place[data-branch]'), function (place) {
    if (place.getAttribute('data-branch') === branch) place.classList.add('place--mine');
  });

  /* ---------- Засечь время: до скольких не есть, не пить и не полоскать ---------- */
  function hhmm(t) {
    var d = new Date(t);
    var m = d.getMinutes();
    return d.getHours() + ':' + (m < 10 ? '0' : '') + m;
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-wait]'), function (btn) {
    var id = btn.getAttribute('data-wait');
    var key = 'dp-hyg-wait-' + id;
    var minutes = +btn.getAttribute('data-minutes');
    var out = document.querySelector('[data-wait-out="' + id + '"]');

    function render() {
      var end = +load(key) || 0;
      if (!out) return;
      if (!end || Date.now() - end > 3600000) { out.hidden = true; return; }
      out.hidden = false;
      out.innerHTML = Date.now() < end
        ? 'Можно есть, пить и&nbsp;полоскать рот после <b>' + hhmm(end) + '</b>'
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
