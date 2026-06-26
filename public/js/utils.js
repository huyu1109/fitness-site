// 铁馆工具函数库 (Utilities)
(function() {
  'use strict';

  // DOM 快捷选择
  window.$ = function(sel, ctx) { return (ctx || document).querySelector(sel); };
  window.$$ = function(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); };

  // 防抖
  window.debounce = function(fn, delay) {
    var timer = null;
    return function() {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  };

  // 节流
  window.throttle = function(fn, limit) {
    var inThrottle = false;
    return function() {
      if (!inThrottle) {
        fn.apply(this, arguments);
        inThrottle = true;
        setTimeout(function() { inThrottle = false; }, limit);
      }
    };
  };

  // 日期格式化
  window.formatDate = function(date) {
    var d = new Date(date);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  };

  // 今日日期
  window.today = function() { return formatDate(new Date()); };

  // localStorage 封装
  window.storage = {
    get: function(key) { try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return null; } },
    set: function(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch(e) { return false; } },
    remove: function(key) { localStorage.removeItem(key); }
  };

  // URL 参数
  window.getParam = function(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  };

  // 数字格式化
  window.formatNum = function(n) { return Number(n).toLocaleString('zh-CN'); };

  // 随机 ID
  window.genId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  };

  // 阻止事件冒泡 (用于内联 onclick)
  window.stopProp = function(e) { if (e) e.stopPropagation(); };

})();
