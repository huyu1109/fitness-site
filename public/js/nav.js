// 铁馆导航栏模块
(function() {
  'use strict';

  var nav = document.querySelector('.nav');

  // 高亮当前页面
  var page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  // 滚动感知
  if (nav) {
    var onScroll = function() {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

})();
