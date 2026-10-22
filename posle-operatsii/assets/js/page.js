/* Рекомендации «После операции»: даты по дню операции и отметка «ваш филиал».
   Без JS страница читается полностью: сроки даны в днях, блок с датами скрыт, обе карточки филиалов видны.
   Даты: день операции + 7 дней (щадящий режим), + 5 дней (если синус-лифтинг), + 2 месяца (если временный
   протез на имплантатах) — последний день срока («по … включительно»). Ванночки сюда не входят: их срок — по назначению хирурга.
   День операции запоминается на этом устройстве (localStorage); при первом открытии это сегодня.
   ?date=ГГГГ-ММ-ДД — администратор может отправить ссылку сразу с датой операции.
   ?branch=mitino|krasnogorsk — отметка «Ваш филиал». */
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

  /* ---------- Посчитаем ваши даты ---------- */
  var box = document.querySelector('[data-mydates]');
  if (!box) return;

  var KEY = 'dp-postop-date';
  var MAX_AGO = 90;
  var DAY = 86400000;

  var chips = box.querySelectorAll('[data-ago]');
  var input = box.querySelector('input[type="date"]');
  var rows = box.querySelectorAll('[data-days], [data-months]');
  var fmt = window.Intl && Intl.DateTimeFormat ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }) : null;

  function midnight(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function addDays(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }

  function addMonths(d, n) {
    var r = new Date(d.getFullYear(), d.getMonth() + n, 1);
    var last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(d.getDate(), last));
    return r;
  }

  function iso(d) {
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }

  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getDate() === +m[3] ? d : null;
  }

  function daysBetween(a, b) {
    return Math.round((midnight(b) - midnight(a)) / DAY);
  }

  function human(d) {
    return fmt ? fmt.format(d) : d.toLocaleDateString();
  }

  var today = midnight(new Date());

  function valid(d) {
    if (!d) return false;
    var ago = daysBetween(d, today);
    return ago >= 0 && ago <= MAX_AGO;
  }

  function load() {
    try { return parse(window.localStorage.getItem(KEY)); } catch (e) { return null; }
  }

  function save(d) {
    try { window.localStorage.setItem(KEY, iso(d)); } catch (e) { /* без памяти — даты всё равно посчитаны */ }
  }

  var proc = parse(param('date'));
  if (valid(proc)) {
    save(proc);
  } else {
    proc = load();
    if (!valid(proc)) {
      proc = today;
      save(proc);
    }
  }

  function render() {
    var ago = daysBetween(proc, today);
    var chipOn = false;
    Array.prototype.forEach.call(chips, function (chip) {
      var on = +chip.getAttribute('data-ago') === ago;
      chip.classList.toggle('is-on', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) chipOn = true;
    });
    if (input) {
      input.value = iso(proc);
      input.classList.toggle('is-on', !chipOn);
    }
    Array.prototype.forEach.call(rows, function (row) {
      var end = row.hasAttribute('data-months')
        ? addMonths(proc, +row.getAttribute('data-months'))
        : addDays(proc, +row.getAttribute('data-days'));
      var done = daysBetween(end, today) > 0;
      row.classList.toggle('is-done', done);
      var out = row.querySelector('[data-out]');
      if (out) out.textContent = done ? 'завершено ' + human(end) : 'по ' + human(end) + ' включительно';
    });
  }

  function choose(d) {
    if (!valid(d)) return;
    proc = d;
    save(proc);
    render();
  }

  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener('click', function () {
      choose(addDays(today, -(+chip.getAttribute('data-ago'))));
    });
  });

  if (input) {
    input.max = iso(today);
    input.min = iso(addDays(today, -MAX_AGO));
    input.addEventListener('change', function () {
      var d = parse(input.value);
      if (valid(d)) choose(d);
      else render();
    });
  }

  render();
  box.hidden = false;
})();
