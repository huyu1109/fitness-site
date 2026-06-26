// 铁馆导航栏 — 动态生成 + 高亮 + 滚动感知
(function() {
  "use strict";

  if (document.querySelector(".nav")) return;

  var navItems = [
    { href: "index.html",      label: "\u9996\u9875" },
    { href: "muscles.html",    label: "\u808c\u8089\u56fe" },
    { href: "exercises.html",  label: "\u52a8\u4f5c\u5e93" },
    { href: "plans.html",      label: "\u8bad\u7ec3\u8ba1\u5212" },
    { href: "calculator.html", label: "\u70ed\u91cf\u8ba1\u7b97" },
    { href: "knowledge.html",  label: "\u77e5\u8bc6\u5e93" },
    { href: "calendar.html",   label: "\u8fdb\u5ea6\u65e5\u5386" },
    { href: "tools.html",      label: "\u5de5\u5177" }
  ];

  function initNav() {
    var current = location.pathname.split("/").pop() || "index.html";
    var links = "";
    for (var i = 0; i < navItems.length; i++) {
      var item = navItems[i];
      var active = item.href === current ? " active" : "";
      links += "<li><a href=\"" + item.href + "\" class=\"" + active.trim() + "\">" + item.label + "</a></li>";
    }

    // // var unlockLink = "<li><a href=\"javascript:void(0)\" onclick=\"unlockAPI.showModal()\" style=\"color:#48c972;font-weight:600\" id=\"navUnlockBtn\">\uD83D\uDD13 \u89e3\u9501</a></li>";  [removed]

    var nav = document.createElement("nav");
    nav.className = "nav";
    nav.innerHTML = "<div class=\"nav-inner\">" +
      "<a href=\"index.html\" class=\"nav-logo\">\u94c1\u9986</a>" +
      "<ul class=\"nav-links\">" + links + "</ul></div>";

    if (document.body) {
      document.body.insertBefore(nav, document.body.firstChild);
    } else {
      document.addEventListener("DOMContentLoaded", function() {
        document.body.insertBefore(nav, document.body.firstChild);
      });
    }

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
  }

  function updateScroll() {
    var n = document.querySelector(".nav");
    if (n) n.classList.toggle("scrolled", window.scrollY > 10);
  }

  // Try immediately, fall back to DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNav);
  } else {
    initNav();
  }
})();


