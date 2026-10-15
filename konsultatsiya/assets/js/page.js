/* Анимации страницы консультации. Без JS и при «уменьшить движение» всё видно сразу. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var io = 'IntersectionObserver' in window;

  /* 1. Плавное появление карточек: соседи в ряду — по очереди */
  var rise = document.querySelectorAll('.gets__item, .seq__item, .asks__item, .place, .calm__item');
  if (!reduce && io && rise.length) {
    Array.prototype.forEach.call(rise, function (el) {
      el.setAttribute('data-rise', '');
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--rise-delay', (Math.min(i, 5) * 90) + 'ms');
    });
    root.classList.add('has-rise');
    var riseObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('is-up');
        riseObs.unobserve(el);
        setTimeout(function () {
          el.removeAttribute('data-rise');
          el.classList.remove('is-up');
          el.style.removeProperty('--rise-delay');
        }, 1300);
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(rise, function (el) { riseObs.observe(el); });
  }

  /* 2. Чек-лист: галочки по очереди, когда список попал на экран */
  var list = document.querySelector('.check');
  if (list) {
    var items = list.querySelectorAll('.check__item');
    var tick = function () {
      Array.prototype.forEach.call(items, function (it, i) {
        if (reduce) it.classList.add('is-checked');
        else setTimeout(function () { it.classList.add('is-checked'); }, 300 + i * 320);
      });
    };
    if (!io || reduce) tick();
    else {
      var checkObs = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { tick(); checkObs.disconnect(); }
      }, { threshold: 0.35 });
      checkObs.observe(list);
    }
  }

  /* 3. Вопросы врачу: нажатие отмечает вопрос; отметки сохраняются в этом браузере */
  var asks = document.querySelectorAll('.asks__item');
  var count = document.getElementById('asks-count');
  var KEY = 'dp-consult-asks';
  var saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { saved = []; }
  function plural(n) { var m = n % 10, h = n % 100; return (m === 1 && h !== 11) ? 'вопрос' : (m >= 2 && m <= 4 && (h < 12 || h > 14)) ? 'вопроса' : 'вопросов'; }
  function update() {
    var picked = [];
    Array.prototype.forEach.call(asks, function (a, i) { if (a.classList.contains('is-picked')) picked.push(i); });
    if (count) count.textContent = picked.length ? 'Вы отметили ' + picked.length + ' ' + plural(picked.length) + ' — покажите их врачу на приёме.' : '';
    try { localStorage.setItem(KEY, JSON.stringify(picked)); } catch (e) { /* хранилище недоступно */ }
  }
  Array.prototype.forEach.call(asks, function (a, i) {
    if (saved.indexOf(i) !== -1) { a.classList.add('is-picked'); a.setAttribute('aria-pressed', 'true'); }
    function toggle() {
      var on = a.classList.toggle('is-picked');
      a.setAttribute('aria-pressed', on ? 'true' : 'false');
      update();
    }
    a.addEventListener('click', toggle);
    a.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
  update();
})();
