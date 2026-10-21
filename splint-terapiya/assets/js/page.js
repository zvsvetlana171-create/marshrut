/* Рекомендации «Сплинт-терапия»: отметка «ваш филиал».
   ?branch=mitino|krasnogorsk — администратор может отправить ссылку сразу с отметкой своего филиала. */
(function () {
  'use strict';

  var m = /[?&]branch=([^&#]*)/.exec(window.location.search);
  var branch = m ? decodeURIComponent(m[1]).toLowerCase() : '';
  Array.prototype.forEach.call(document.querySelectorAll('.place[data-branch]'), function (place) {
    if (place.getAttribute('data-branch') === branch) place.classList.add('place--mine');
  });
})();
