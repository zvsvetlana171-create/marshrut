/* Страница профилактического визита: отметка «ваш филиал» и события аналитики.
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
    var data = { event: 'dp_hygiene_' + name, branch: branchName || '', campaign: campaign };
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

  track('page_view', branch);
})();
