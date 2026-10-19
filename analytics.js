// Google Analytics 4 统计（两个游戏共用同一个 GA 媒体资源，用 game_name 区分）
const GA_MEASUREMENT_ID = 'G-ET5WPC1TMP';
const GAME_NAME = 'error404'; // 区分两个游戏，请勿修改
window.dataLayer = window.dataLayer || [];
window.track = function (name, params) {
  try { if (GA_MEASUREMENT_ID && window.gtag) window.gtag('event', name, params || {}); } catch (e) {}
};
(function () {
  if (!GA_MEASUREMENT_ID) return;
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { game_name: GAME_NAME });
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(s);
})();
