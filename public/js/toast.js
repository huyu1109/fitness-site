// 铁馆 Toast 通知系统
(function() {
  'use strict';

  window.Toast = {
    _timer: null,
    _el: null,

    show: function(msg, type, duration) {
      this.hide();
      var t = document.createElement('div');
      t.className = 'toast';
      if (type) t.classList.add('toast-' + type);
      t.textContent = msg;
      document.body.appendChild(t);
      this._el = t;
      requestAnimationFrame(function() { t.classList.add('show'); });
      this._timer = setTimeout(function() { this.hide(); }.bind(this), duration || 2500);
    },

    success: function(msg) { this.show(msg, 'success'); },
    error: function(msg) { this.show(msg, 'error'); },
    warning: function(msg) { this.show(msg, 'warning'); },

    hide: function() {
      if (this._timer) { clearTimeout(this._timer); this._timer = null; }
      if (this._el) {
        this._el.classList.remove('show');
        var el = this._el;
        setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
        this._el = null;
      }
    }
  };

  // Backward compatibility
  window.showToast = function(msg, type) { Toast.show(msg, type); };

})();
