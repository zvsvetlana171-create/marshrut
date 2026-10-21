/* Рекомендации «Перед операцией»: подсказка «когда перекусить» и отметка «ваш филиал».
   Без JS страница читается полностью: срок «за 3–4 часа» написан в тексте, подсказка скрыта.
   Время операции запоминается на этом устройстве на сутки (localStorage), чтобы при повторном
   открытии ссылки его не вводить заново. ?time=ЧЧ:ММ — администратор может отправить ссылку
   сразу со временем операции. ?branch=mitino|krasnogorsk — отметка «Ваш филиал». */
(function () {
  'use strict';

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  /* ---------- Ваш филиал ---------- */
  var branch = param('branch').toLowerCase();
  Array.prototype.forEach.call(document.querySelectorAll('.place[data-branch]'), function (place) {
    if (place.getAttribute('data-branch') === branch) place.classList.add('place--mine');
  });

  /* ---------- Когда перекусить: за 3–4 часа до операции ---------- */
  var box = document.querySelector('[data-snack]');
  if (!box) return;
  var input = box.querySelector('input[type="time"]');
  var out = box.querySelector('[data-snack-out]');
  var KEY = 'dp-op-time';
  var DAY = 86400000;
  var initial = out ? out.innerHTML : '';

  function parse(s) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(s || '');
    if (!m || +m[1] > 23 || +m[2] > 59) return null;
    return +m[1] * 60 + +m[2];
  }

  function hhmm(min) {
    min = ((min % 1440) + 1440) % 1440;
    var m = min % 60;
    return Math.floor(min / 60) + ':' + (m < 10 ? '0' : '') + m;
  }

  function render() {
    var t = parse(input.value);
    out.innerHTML = t === null
      ? initial
      : 'Лёгкий перекус&nbsp;— <b class="nowrap">в&nbsp;' + hhmm(t - 240) + '–' + hhmm(t - 180) + '</b>';
  }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify({ t: input.value, at: Date.now() })); } catch (e) { /* без памяти — подсказка работает до закрытия */ }
  }

  function load() {
    try {
      var v = JSON.parse(window.localStorage.getItem(KEY));
      return v && Date.now() - v.at < DAY ? v.t : '';
    } catch (e) { return ''; }
  }

  var fromLink = param('time');
  if (parse(fromLink) !== null) {
    input.value = fromLink.length === 4 ? '0' + fromLink : fromLink;
    save();
  } else {
    input.value = load();
  }

  input.addEventListener('input', function () { render(); save(); });
  input.addEventListener('change', function () { render(); save(); });
  render();
  box.hidden = false;
})();
