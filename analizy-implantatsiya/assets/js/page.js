/* Рекомендации «Анализы для имплантации»: отметки сданных анализов, копирование адресов почты филиалов, «ваш филиал».
   Без JS страница читается полностью: отметки ставятся, но не запоминаются; полоса прогресса и кнопка
   «Скопировать» скрыты. Отметки хранятся на этом устройстве (localStorage), чтобы при повторном
   открытии ссылки список был таким же. ?branch=mitino|krasnogorsk — отметка «Ваш филиал» у почты и телефона. */
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
  Array.prototype.forEach.call(document.querySelectorAll('.mail__box[data-branch]'), function (box) {
    if (box.getAttribute('data-branch') === branch) box.classList.add('mail__box--mine');
  });

  /* ---------- Отметки сданных анализов ---------- */
  var KEY = 'dp-implant-tests';
  var checks = document.querySelectorAll('[data-test]');
  var progress = document.querySelector('[data-progress]');
  var fill = document.querySelector('[data-fill]');
  var count = document.querySelector('[data-count]');

  function load() {
    try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }

  function save(list) {
    try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* без памяти — отметки работают до закрытия */ }
  }

  function update() {
    var done = [];
    Array.prototype.forEach.call(checks, function (c) {
      if (c.checked) done.push(c.getAttribute('data-test'));
    });
    var total = checks.length;
    if (fill) fill.style.width = (total ? done.length / total * 100 : 0) + '%';
    if (count) count.textContent = done.length === total ? 'Отмечены все ' + total + ' анализов' : 'Отмечено ' + done.length + ' из ' + total;
    if (progress) progress.classList.toggle('is-full', done.length === total);
    return done;
  }

  var saved = load();
  Array.prototype.forEach.call(checks, function (c) {
    c.checked = saved.indexOf(c.getAttribute('data-test')) !== -1;
    c.addEventListener('change', function () { save(update()); });
  });
  update();
  if (progress) progress.hidden = false;

  /* ---------- Скопировать адрес почты филиала ---------- */
  if (!navigator.clipboard || !navigator.clipboard.writeText) return;
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (copy) {
    var label = copy.querySelector('[data-copy-label]');
    var initial = label ? label.textContent : '';
    var timer;
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(copy.getAttribute('data-copy')).then(function () {
        copy.classList.add('is-done');
        if (label) label.textContent = 'Скопировано';
        clearTimeout(timer);
        timer = setTimeout(function () {
          copy.classList.remove('is-done');
          if (label) label.textContent = initial;
        }, 2500);
      });
    });
    copy.hidden = false;
  });
})();
