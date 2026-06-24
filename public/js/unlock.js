/**
 * 铁馆 · 0.5元解锁全站 + 个人免签支付
 * 解锁码: tieguan666 (备用)
 * 支付: order生成 → 扫码付款 → 自动检测/人工确认
 */

(function(){
  var UNLOCK_CODE = "tieguan666";
  var LS_KEY = "fit_unlocked";
  var LS_ORDER = "fit_last_order";
  var PAYMENT_API = "";
  var POLL_INTERVAL = 3000;
  var EXPIRE_MINUTES = 5;
  var PAYMENT_ACTIVE = true;

  // Detect payment API base (async)
  (async function(){
    try {
      var r = await fetch("/api/payment/create",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
      var d = await r.json();
      if (d.success) { PAYMENT_API = "/api/payment"; PAYMENT_ACTIVE = true; }
    } catch(e) {}
    if (!PAYMENT_ACTIVE) {
      try {
        var r = await fetch("/api/payment/create.php?_t="+Date.now());
        var d = await r.json();
        if (d.success) { PAYMENT_API = "/api/payment"; PAYMENT_ACTIVE = true; }
      } catch(e) {}
    }
  })();

  function isUnlocked() {
    return localStorage.getItem(LS_KEY) === "true";
  }

  function showPaymentModal() {
    if (isUnlocked()) return;
    if (document.getElementById("unlockModal")) return;

    // Try to create order first
    if (PAYMENT_ACTIVE) {
      createOrder();
    } else {
      showUnlockOnlyModal();
    }
  }

  function createOrder() {
    var overlay = document.createElement("div");
    overlay.id = "unlockModal";
    overlay.className = "unlock-overlay";
    overlay.innerHTML =
      '<div class="unlock-modal" id="unlockModalBox">' +
        '<div class="unlock-header">' +
          '<div class="unlock-icon">🏋️</div>' +
          '<h2>铁馆 · 0.5元解锁全站</h2>' +
          '<p id="orderStatus" style="font-size:13px;color:rgba(255,255,255,0.4)">⏳ 正在生成订单...</p>' +
        '</div>' +
        '<div class="unlock-body" id="paymentBody">' +
          '<div style="text-align:center;padding:30px">' +
            '<div class="loading-spinner" style="margin:0 auto"></div>' +
          '</div>' +
        '</div>' +
        '<div class="unlock-footer"><p>💪 支持一次，永久使用</p></div>' +
      '</div>';
    document.body.appendChild(overlay);
    setTimeout(function(){ document.getElementById("unlockModalBox").classList.add("show"); }, 10);
    overlay.addEventListener("click", function(e) { if (e.target === this) closeUnlockModal(); });

    // Create order via API
    var xhr = new XMLHttpRequest();
    xhr.open("POST", PAYMENT_API + "/create", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (data.success) {
            renderPaymentModal(data);
            return;
          }
        } catch(e) {}
      }
      // Fallback if API fails
      renderPaymentModal(null);
    };
    xhr.onerror = function() { renderPaymentModal(null); };
    xhr.send();
  }

  function renderPaymentModal(orderData) {
    var box = document.getElementById("unlockModalBox");
    var body = document.getElementById("paymentBody");
    var status = document.getElementById("orderStatus");
    if (!box || !body) return;

    var orderId = orderData ? orderData.order_id : ("OFFLINE" + Date.now().toString(36).toUpperCase());
    var qrWechat = orderData ? (orderData.qrcode ? orderData.qrcode.wechat : "/img/wechat_qr.jpg") : "/img/wechat_qr.jpg";
    var qrAlipay = orderData ? (orderData.qrcode ? orderData.qrcode.alipay : "/img/alipay_qr.jpg") : "/img/alipay_qr.jpg";
    var usePayment = PAYMENT_ACTIVE && orderData && orderData.success;

    status.textContent = usePayment ? "请扫码支付 0.50 元" : "请输入解锁码";

    body.innerHTML =
      '<div class="unlock-tabs">' +
        '<button class="unlock-tab active" onclick="switchPayTab(0)" id="payTab0">💳 扫码支付</button>' +
        '<button class="unlock-tab" onclick="switchPayTab(1)" id="payTab1">🔑 解锁码</button>' +
      '</div>' +
      '<div id="payPanel0" class="unlock-panel">' +
        '<div class="order-info">' +
          '<span class="order-label">订单号</span>' +
          '<span class="order-id">' + orderId + '</span>' +
        '</div>' +
        '<div class="pay-tabs">' +
          '<button class="pay-tab active" onclick="switchPayMethod(0)" id="payMethod0">微信支付</button>' +
          '<button class="pay-tab" onclick="switchPayMethod(1)" id="payMethod1">支付宝</button>' +
        '</div>' +
        '<div class="qr-area">' +
          '<img src="' + qrWechat + '" id="qrImage" class="qr-img" alt="收款码" onerror="this.onerror=null;this.src=\'/img/wechat_qr.png\';this.alt=\'请替换为真实收款码\'">' +
          '<p class="qr-tip">请使用' + (usePayment ? '"扫一扫" 付款 0.50 元' : '微信/支付宝扫码付款') + '</p>' +
        '</div>' +
        '<div class="pay-status" id="payStatus">⏳ 等待支付...</div>' +
        '<button class="unlock-btn" onclick="checkPayment(\'' + orderId + '\')">✅ 我已付款，查询状态</button>' +
        '<p class="pay-hint">支付后点击查询，或等待自动检测</p>' +
        '<div class="pay-timer" id="payTimer">⏰ 剩余 4:59</div>' +
      '</div>' +
      '<div id="payPanel1" class="unlock-panel" style="display:none">' +
        '<div class="unlock-input-group">' +
          '<label>输入解锁码（备用方案）</label>' +
          '<input type="text" id="unlockCodeInput" class="unlock-input" placeholder="请输入解锁码" maxlength="20" autocomplete="off">' +
          '<button class="unlock-btn" id="unlockBtn">解锁全站</button>' +
          '<p class="unlock-error" id="unlockError"></p>' +
        '</div>' +
      '</div>';

    // Bind unlock code events
    setTimeout(function(){ document.getElementById("unlockModalBox").classList.add("show"); }, 10);
    overlay.addEventListener("click", function(e) { if (e.target === this) closeUnlockModal(); });
    document.getElementById("unlockBtn").addEventListener("click", attemptUnlock);
    document.getElementById("unlockCodeInput").addEventListener("keydown", function(e) {
      if (e.key === "Enter") { e.preventDefault(); attemptUnlock(); }
    });
    setTimeout(function(){ var el = document.getElementById("unlockCodeInput"); if(el) el.focus(); }, 400);

    // Start payment polling
    if (usePayment) {
      startPaymentPolling(orderId);
    }
  }

  function showUnlockOnlyModal() {
    if (document.getElementById("unlockModal")) return;
    var overlay = document.createElement("div");
    overlay.id = "unlockModal";
    overlay.className = "unlock-overlay";
    overlay.innerHTML =
      '<div class="unlock-modal" id="unlockModalBox">' +
        '<div class="unlock-header">' +
          '<div class="unlock-icon">🏋️</div>' +
          '<h2>铁馆 · 0.5元解锁全站</h2>' +
          '<p style="font-size:13px;color:rgba(255,255,255,0.4)">请输入解锁码</p>' +
        '</div>' +
        '<div class="unlock-body">' +
          '<div class="qr-area" style="margin-bottom:4px">' +
            '<img src="/img/wechat_qr.jpg" style="width:160px;height:160px;border-radius:8px;border:1px solid rgba(255,255,255,0.06)" alt="收款码">' +
            '<p style="font-size:11px;color:rgba(255,255,255,0.25);margin-top:4px">微信扫码支付 0.50 元</p>' +
          '</div>' +
          '<div class="unlock-input-group">' +
            '<label>或输入解锁码</label>' +
            '<input type="text" id="unlockCodeInput" class="unlock-input" placeholder="请输入解锁码" maxlength="20" autocomplete="off">' +
            '<button class="unlock-btn" id="unlockBtn">解锁全站</button>' +
            '<p class="unlock-error" id="unlockError"></p>' +
          '</div>' +
        '</div>' +
        '<div class="unlock-footer"><p>💪 支持一次，永久使用</p></div>' +
      '</div>';
    document.body.appendChild(overlay);
    setTimeout(function(){ document.getElementById("unlockModalBox").classList.add("show"); }, 10);
    overlay.addEventListener("click", function(e) { if (e.target === this) closeUnlockModal(); });

    setTimeout(function(){ document.getElementById("unlockModalBox").classList.add("show"); }, 10);
    overlay.addEventListener("click", function(e) { if (e.target === this) closeUnlockModal(); });
    document.getElementById("unlockBtn").addEventListener("click", attemptUnlock);
    document.getElementById("unlockCodeInput").addEventListener("keydown", function(e) {
      if (e.key === "Enter") { e.preventDefault(); attemptUnlock(); }
    });
    setTimeout(function(){ document.getElementById("unlockCodeInput").focus(); }, 400);
  }

  var pollTimer = null;
  var expireTimer = null;
  var pollStartTime = 0;

  function startPaymentPolling(orderId) {
    pollStartTime = Date.now();
    if (pollTimer) clearInterval(pollTimer);
    if (expireTimer) clearInterval(expireTimer);

    // Update timer every second
    var timerEl = document.getElementById("payTimer");
    expireTimer = setInterval(function() {
      var elapsed = Math.floor((Date.now() - pollStartTime) / 1000);
      var remaining = EXPIRE_MINUTES * 60 - elapsed;
      if (remaining <= 0) {
        clearInterval(expireTimer);
        clearInterval(pollTimer);
        var status = document.getElementById("payStatus");
        if (status) {
          status.innerHTML = "⏰ 订单已过期，请重新下单";
          status.style.color = "#ff5050";
          var btn = document.querySelector(".pay-status + .unlock-btn");
          if (btn) btn.textContent = "🔄 重新下单";
        }
        return;
      }
      var m = Math.floor(remaining / 60);
      var s = remaining % 60;
      var el = document.getElementById("payTimer");
      if (el) el.textContent = "⏰ 剩余 " + m + ":" + (s < 10 ? "0" : "") + s;
    }, 1000);

    // Poll every 3 seconds
    pollTimer = setInterval(function() {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", PAYMENT_API + "/check?order_id=" + encodeURIComponent(orderId) + "&_t=" + Date.now(), true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            if (data.success || data.status === "completed") {
              paymentSuccess(orderId);
            } else if (data.status === "expired") {
              clearInterval(pollTimer);
              clearInterval(expireTimer);
              var status = document.getElementById("payStatus");
              if (status) {
                status.innerHTML = "⏰ 订单已过期";
                status.style.color = "#ff5050";
              }
            }
          } catch(e) {}
        }
      };
      xhr.send();
    }, POLL_INTERVAL);
  }

  function checkPayment(orderId) {
    var status = document.getElementById("payStatus");
    if (status) status.innerHTML = "⏳ 查询中...";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", PAYMENT_API + "/check?order_id=" + encodeURIComponent(orderId) + "&_t=" + Date.now(), true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (data.success || data.status === "completed") {
            paymentSuccess(orderId);
          } else if (data.status === "expired") {
            if (status) {
              status.innerHTML = "⏰ 订单已过期，请重新下单";
              status.style.color = "#ff5050";
            }
          } else {
            if (status) {
              status.innerHTML = "⏳ 未检测到支付，请确认已扫码付款";
              status.style.color = "#ffaa32";
            }
          }
        } catch(e) { if(status) status.innerHTML = "❌ 查询失败"; }
      } else {
        if(status) status.innerHTML = "❌ 查询失败，请稍后再试";
      }
    };
    xhr.onerror = function() {
      if(status) status.innerHTML = "❌ 网络错误";
    };
    xhr.send();
  }

  function paymentSuccess(orderId) {
    // Stop timers
    if (pollTimer) clearInterval(pollTimer);
    if (expireTimer) clearInterval(expireTimer);

    localStorage.setItem(LS_KEY, "true");
    if (orderId) localStorage.setItem(LS_ORDER, orderId);

    var status = document.getElementById("payStatus");
    if (status) {
      status.innerHTML = "✅ 支付成功！正在解锁...";
      status.style.color = "#48c972";
    }

    setTimeout(function() {
      var overlay = document.getElementById("unlockModal");
      if (overlay) {
        var box = document.getElementById("unlockModalBox");
        if (box) { box.classList.remove("show"); }
        setTimeout(function() {
          overlay.remove();
          location.reload();
        }, 400);
      } else {
        location.reload();
      }
    }, 1000);

    updateNavBadge();
  }

  function attemptUnlock() {
    var input = document.getElementById("unlockCodeInput");
    var errorEl = document.getElementById("unlockError");
    if (!input || !errorEl) return;
    var code = input.value.trim();

    if (code === UNLOCK_CODE) {
      localStorage.setItem(LS_KEY, "true");
      errorEl.textContent = "";
      input.classList.remove("shake");

      // Success animation
      var btn = document.getElementById("unlockBtn");
      if (btn) {
        btn.textContent = "✅ 解锁成功！";
        btn.style.background = "#48c972";
      }

      setTimeout(function() {
        var overlay = document.getElementById("unlockModal");
        if (overlay) {
          var box = document.getElementById("unlockModalBox");
          if (box) box.classList.remove("show");
          setTimeout(function() { overlay.remove(); location.reload(); }, 400);
        } else {
          location.reload();
        }
      }, 800);
      updateNavBadge();
    } else {
      errorEl.textContent = "❌ 解锁码错误";
      input.classList.remove("shake");
      void input.offsetWidth;
      input.classList.add("shake");
      input.value = "";
      input.focus();
    }
  }

  function updateNavBadge() {
    if (!isUnlocked()) return;
    var navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;
    var old = document.getElementById("unlockBadge");
    if (old) old.remove();
    var badge = document.createElement("li");
    badge.id = "unlockBadge";
    badge.innerHTML = "<a href=\"#\" style=\"color:#48c972!important;font-weight:600;cursor:default;pointer-events:none;\" title=\"已永久解锁\">✅ 已解锁</a>";
    navLinks.appendChild(badge);
  }

  // 关闭弹窗
  window.closeUnlockModal = function() {
    var overlay = document.getElementById("unlockModal");
    if (overlay) {
      if (pollTimer) clearInterval(pollTimer);
      if (expireTimer) clearInterval(expireTimer);
      var box = document.getElementById("unlockModalBox");
      if (box) box.classList.remove("show");
      setTimeout(function() { overlay.remove(); }, 300);
    }
  };

  // Tab switching functions
  window.switchPayTab = function(idx) {
    document.querySelectorAll(".unlock-tab").forEach(function(t,i){
      t.classList.toggle("active", i===idx);
    });
    document.querySelectorAll(".unlock-panel").forEach(function(p,i){
      p.style.display = i===idx ? "block" : "none";
    });
  };

  window.switchPayMethod = function(idx) {
    document.querySelectorAll(".pay-tab").forEach(function(t,i){
      t.classList.toggle("active", i===idx);
    });
    var img = document.getElementById("qrImage");
    if (img) {
      img.src = idx === 0 ? "/img/wechat_qr.jpg" : "/img/alipay_qr.jpg";
    }
  };

  window.unlockAPI = {
    isUnlocked: isUnlocked,
    showModal: showPaymentModal,
    updateBadge: updateNavBadge
  };

  // Init on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      setTimeout(updateNavBadge, 500);
    });
  } else {
    setTimeout(updateNavBadge, 500);
  }
})();
