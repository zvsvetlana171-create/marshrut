/* Страница «Пример плана лечения»: отметка «ваш филиал» и события аналитики.
   Без JS страница читается полностью, обе карточки филиалов видны.
   ?branch=mitino|krasnogorsk — администратор может отправить ссылку сразу на свой филиал.
   События (только если на сайте есть dataLayer): page_view, branch_select, contact_click —
   с полями branch и campaign. ФИО, телефон, диагноз и идентификатор пациента не передаются. */
(function () {
  'use strict';

  var BRANCHES = ['mitino', 'krasnogorsk'];

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  var branch = param('branch').toLowerCase();
  if (BRANCHES.indexOf(branch) === -1) branch = '';
  var campaign = param('utm_campaign').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);

  function track(name, branchName, extra) {
    var dl = window.dataLayer;
    if (!dl || typeof dl.push !== 'function') return;
    var data = { event: 'dp_primer_' + name, branch: branchName || '', campaign: campaign };
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) data[k] = extra[k];
    dl.push(data);
  }

  var places = document.querySelectorAll('.place[data-branch]');
  var selected = '';

  Array.prototype.forEach.call(places, function (place) {
    var name = place.getAttribute('data-branch');
    if (name === branch) place.classList.add('place--mine');

    place.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('[data-contact]') : null;
      if (selected !== name) {
        selected = name;
        track('branch_select', name);
      }
      if (!link) return;
      if (link.hasAttribute('data-missing')) {
        e.preventDefault();
        return;
      }
      track('contact_click', name, { channel: link.getAttribute('data-contact') });
    });
  });

  // ссылка на свёрнутый раздел плана (например, «Термины») раскрывает его
  function openFold(id) {
    var el = id ? document.getElementById(id) : null;
    if (el && el.tagName === 'DETAILS') el.open = true;
  }

  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#p-"]'), function (link) {
    link.addEventListener('click', function () { openFold(link.getAttribute('href').slice(1)); });
  });
  openFold(window.location.hash.slice(1));

  // страницы отчёта КТ: по нажатию открываются на весь экран; второе нажатие — исходный размер
  var zoomLinks = document.querySelectorAll('.ktrep__zoom');
  if (zoomLinks.length) {
    var zoom = document.createElement('div');
    zoom.className = 'zoom';
    zoom.hidden = true;
    zoom.setAttribute('role', 'dialog');
    zoom.setAttribute('aria-modal', 'true');
    zoom.setAttribute('aria-label', 'Страница отчёта КТ');
    zoom.innerHTML = '<button class="zoom__close" type="button" aria-label="Закрыть"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button><img class="zoom__img" alt="">';
    document.body.appendChild(zoom);
    var zoomImg = zoom.querySelector('.zoom__img');
    var zoomClose = zoom.querySelector('.zoom__close');
    var opener = null;

    var closeZoom = function () {
      zoom.hidden = true;
      zoom.classList.remove('zoom--full');
      document.documentElement.style.overflow = '';
      if (opener) opener.focus();
    };

    Array.prototype.forEach.call(zoomLinks, function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        opener = link;
        var img = link.querySelector('img');
        zoomImg.src = link.getAttribute('href');
        zoomImg.alt = img ? img.alt : '';
        zoom.hidden = false;
        zoom.scrollTop = 0;
        document.documentElement.style.overflow = 'hidden';
        zoomClose.focus();
      });
    });

    zoomImg.addEventListener('click', function (e) {
      e.stopPropagation();
      zoom.classList.toggle('zoom--full');
    });
    zoomClose.addEventListener('click', closeZoom);
    zoom.addEventListener('click', function (e) {
      if (e.target === zoom) closeZoom();
    });
    document.addEventListener('keydown', function (e) {
      if (!zoom.hidden && (e.key === 'Escape' || e.key === 'Esc')) closeZoom();
    });
  }

  track('page_view', branch);
})();
