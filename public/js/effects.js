// 铁馆 UI 特效 (光晕 + 入场 + 数字动画)
(function() {
  'use strict';

  // 1. 鼠标跟随光晕
  (function() {
    var glow = document.createElement('div');
    glow.className = 'glow-follower';
    glow.style.cssText = 'position:fixed;width:300px;height:300px;border-radius:50%;pointer-events:none;z-index:0;transform:translate(-50%,-50%);opacity:0;transition:opacity 0.3s ease;background:radial-gradient(circle,rgba(72,201,114,0.06) 0%,transparent 70%)';
    document.body.appendChild(glow);
    var active = false, raf = null;
    document.addEventListener('mousemove', function(e) {
      if (!active) { active = true; glow.style.opacity = '1'; }
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function() {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      });
    });
    document.addEventListener('mouseleave', function() { active = false; glow.style.opacity = '0'; });
  })();

  // 2. 入场动画 (IntersectionObserver)
  (function() {
    var els = document.querySelectorAll('.enter-fade, .enter-scale');
    if (!els.length) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.style.animationPlayState = 'running';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function(el) {
      el.style.animationPlayState = 'paused';
      obs.observe(el);
    });
  })();

  // 3. 数字滚动动画
  (function() {
    var nums = document.querySelectorAll('.hero-stat .num');
    if (!nums.length) return;
    function animateValue(el, target, dur) {
      var start = performance.now();
      function update(now) {
        var p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }
      requestAnimationFrame(update);
    }
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          var el = e.target, t = parseInt(el.textContent) || 0;
          el.textContent = '0';
          animateValue(el, t, 1200);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(function(el) { obs.observe(el); });
  })();

  // 4. 懒加载图片
  document.querySelectorAll('img[loading]').forEach(function(img) {
    if ('loading' in HTMLImageElement.prototype) img.loading = 'lazy';
  });

})();
