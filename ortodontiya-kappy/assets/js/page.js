/* Рекомендации «Ортодонтическое лечение и ретенционные каппы»: выбор этапа, видео по нажатию, «ваш филиал».
   Без JS страница читается полностью: оба этапа идут подряд, видео открываются ссылкой на YouTube.
   Выбранный этап хранится на этом устройстве (localStorage).
   ?stage=lechenie|kappy — администратор может отправить ссылку сразу на нужный этап.
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
    try { window.localStorage.setItem(key, value); } catch (e) { /* без памяти — выбор работает до закрытия страницы */ }
  }

  function each(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  /* ---------- Ваш филиал ---------- */
  var branch = param('branch').toLowerCase();
  each('.place[data-branch]', function (place) {
    if (place.getAttribute('data-branch') === branch) place.classList.add('place--mine');
  });

  /* ---------- Выбор этапа ---------- */
  var STAGES = ['lechenie', 'kappy'];
  var STAGE_KEY = 'dp-ortho-stage';
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

  function choose(name) {
    save(STAGE_KEY, name);
    show(name);
  }

  if (tabs) {
    var stage = param('stage').toLowerCase();
    if (STAGES.indexOf(stage) !== -1) save(STAGE_KEY, stage);
    else stage = load(STAGE_KEY);
    if (STAGES.indexOf(stage) === -1) stage = STAGES[0];

    each('[data-tab]', function (tab) {
      tab.addEventListener('click', function () { choose(tab.getAttribute('data-tab')); });
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        var next = STAGES[(STAGES.indexOf(tab.getAttribute('data-tab')) + 1) % STAGES.length];
        var target = document.querySelector('[data-tab="' + next + '"]');
        if (target) { target.click(); target.focus(); }
      });
    });

    /* ссылка в конце этапа: переключает и возвращает к началу страницы, где выбор этапа */
    each('[data-go]', function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        choose(link.getAttribute('data-go'));
        tabs.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      link.hidden = false;
    });

    show(stage);
    tabs.hidden = false;
  }

  /* ---------- Видео: плеер YouTube подгружается только по нажатию ---------- */
  each('[data-yt]', function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + link.getAttribute('data-yt') + '?autoplay=1&rel=0';
      frame.title = link.getAttribute('aria-label') || 'Видео';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      var box = document.createElement('div');
      box.className = 'video__frame';
      box.appendChild(frame);
      link.parentNode.replaceChild(box, link);
    });
  });
})();
