/**
 * UI 增强 - 动画、交互、体验提升
 */
(function() {
  'use strict';

  // ======== 1. 导航栏滚动状态 ========
  function updateNavbar() {
    var nav = document.querySelector('.navbar');
    if (!nav) return;
    if (window.scrollY > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ======== 2. 页面入场动画 ========
  // 给所有 .content-enter 元素添加可见性
  function initPageEnter() {
    var els = document.querySelectorAll('.content-enter');
    if (els.length === 0) return;
    // 使用 IntersectionObserver 实现滚动入场
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.style.visibility = 'visible';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      els.forEach(function(el) {
        observer.observe(el);
      });
    }
  }

  // ======== 3. 数字计数动画 ========
  // 用法: data-count-to="1200" data-count-duration="600"
  function animateNumbers() {
    var els = document.querySelectorAll('[data-count-to]');
    if (els.length === 0) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseFloat(el.getAttribute('data-count-to')) || 0;
          var duration = parseInt(el.getAttribute('data-count-duration')) || 600;
          observer.unobserve(el);
          countUp(el, target, duration);
        }
      });
    }, { threshold: 0.5 });

    els.forEach(function(el) { observer.observe(el); });
  }

  function countUp(el, target, duration) {
    var start = 0;
    var steps = Math.round(duration / 16);
    var increment = target / steps;
    var current = 0;
    var timer = setInterval(function() {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = target % 1 === 0 ? Math.round(current) : current.toFixed(1);
    }, 16);
  }

  // ======== 4. 骨架屏控制 ========
  window.showSkeleton = function(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML =
      '<div class="skeleton skeleton-card"></div>' +
      '<div class="skeleton skeleton-text" style="width:90%"></div>' +
      '<div class="skeleton skeleton-text" style="width:70%"></div>' +
      '<div class="skeleton skeleton-text" style="width:50%"></div>';
  };

  // ======== 5. 滚动动画元素检测 ========
  function initScrollAnimate() {
    var els = document.querySelectorAll('.scroll-animate');
    if (els.length === 0 || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(function(el) { observer.observe(el); });
  }

  // ======== 6. 粒子滚动减速 ========
  // 当页面滚动时，降低粒子密度以减少性能开销
  var particleScrollTimeout = null;
  window.addEventListener('scroll', function() {
    if (particleScrollTimeout) return;
    particleScrollTimeout = setTimeout(function() {
      particleScrollTimeout = null;
    }, 300);
    // 自定义事件，particles.js 可以监听
    document.dispatchEvent(new CustomEvent('particle-density', {
      detail: { density: window.scrollY > 100 ? 0.5 : 1.0 }
    }));
  }, { passive: true });

  // ======== 启动 ========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initPageEnter();
      animateNumbers();
      initScrollAnimate();
    });
  } else {
    initPageEnter();
    animateNumbers();
    initScrollAnimate();
  }

})();
