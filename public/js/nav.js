// Navbar - dynamically injected
(function() {
  function inject() {
    if (!document.body) { setTimeout(inject, 5); return; } if (document.querySelector(".nav")) return;
    var p = window.location.pathname.split("/").pop() || "index.html";
    function a(page) { return p === page ? "active" : ""; }
    var h = "<nav class=\"navbar\">" + "<div class=\"nav-container\">" + "<a href=\"index.html\" class=\"nav-logo\">" + "<svg width=\"28\" height=\"28\" viewBox=\"0 0 28 28\" fill=\"none\">" + "<path d=\"M14 2L14 26\" stroke=\"#00b478\" stroke-width=\"3\" stroke-linecap=\"round\"/>" + "<path d=\"M5 8L14 14L23 8\" stroke=\"#00b478\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>" + "<path d=\"M5 20L14 14L23 20\" stroke=\"#00b478\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>" + "</svg>" + "<span>" + "\u94c1\u9986" + "</span></a>" + "<ul class=\"nav-links\">" + "<li><a href=\"index.html\" class=\"" + a("index.html") + "\">" + "\u9996\u9875" + "</a></li>" + "+ "<li><a href=\"muscles.html\" class=\"" + a("muscles.html") + "\">\u808c\u8089\u56fe</a></li>" + "<li><a href=\"plans.html\" class=\"" + a("plans.html") + "\">" + "\u8bad\u7ec3\u8ba1\u5212" + "</a></li>" + "<li><a href=\"calculator.html\" class=\"" + a("calculator.html") + "\">" + "\u70ed\u91cf\u8ba1\u7b97" + "</a></li>" + "<li><a href=\"knowledge.html\" class=\"" + a("knowledge.html") + "\">" + "\u77e5\u8bc6\u5e93" + "</a></li>" + "<li><a href=\"calendar.html\" class=\"" + a("calendar.html") + "\">" + "\u8fdb\u5ea6\u65e5\u5386" + "</a></li>" + "<li><a href=\"tools.html\" class=\"" + a("tools.html") + "\">" + "\u5de5\u5177" + "</a></li>" + "<li><a href=\"exercises.html\" class=\"" + a("exercises.html") + "\">" + "\u52a8\u4f5c\u5e93" + "</a></li>" + "<li><a href=\"body-stats.html\" class=\"" + a("body-stats.html") + "\">" + "\u8eab\u4f53\u6570\u636e" + "</a></li>" + "</ul>" + "<a href=\"profile.html\" class=\"nav-avatar\" title=\"" + "\u4e2a\u4eba\u8d44\u6599" + "\">" + "<svg width=\"28\" height=\"28\" viewBox=\"0 0 28 28\" fill=\"none\"><circle cx=\"14\" cy=\"10\" r=\"5\" stroke=\"#aaa\" stroke-width=\"2\"/><path d=\"M4 24C4 19 8.5 16 14 16C19.5 16 24 19 24 24\" stroke=\"#aaa\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg></a>" + "<button class=\"nav-toggle\" id=\"navToggle\" aria-label=\"" + "\u83dc\u5355" + "\"><span></span><span></span><span></span></button>" + "</div></nav>" ;
document.body.insertAdjacentHTML("afterbegin", h);
    var t = document.getElementById("navToggle");
    var l = document.querySelector(".nav-links");
    if (t && l) {
      t.addEventListener("click", function() { l.classList.toggle("open"); t.classList.toggle("open"); });
      var items = l.querySelectorAll("a");
      for (var i = 0; i < items.length; i++) (function(link) {
        link.addEventListener("click", function() { l.classList.remove("open"); t.classList.remove("open"); });
      })(items[i]);
    }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", inject); }
  else { inject(); }

  // Footer (95-96)
  var ft = document.createElement("footer");
  ft.style.cssText = "text-align:center;padding:24px;font-size:12px;color:rgba(255,255,255,0.3);border-top:1px solid rgba(255,255,255,0.04);margin-top:40px";
  ft.innerHTML = '<div style="max-width:1300px;margin:0 auto"><p>&#169; 2026 铁馆健身 | <a href="#" style="color:rgba(255,255,255,0.3);text-decoration:none">关于本站</a> | <a href="#" style="color:rgba(255,255,255,0.3);text-decoration:none">数据来源</a> | <a href="#" style="color:rgba(255,255,255,0.3);text-decoration:none">反馈建议</a></p></div>';
  document.body.appendChild(ft);
  
  // Back to top (97-98)
  var bt = document.createElement("button");
  bt.id = "backToTop";
  bt.innerHTML = "\u2191";
  bt.style.cssText = "position:fixed;bottom:30px;right:30px;z-index:9999;width:44px;height:44px;border-radius:50%;border:none;background:rgba(72,201,114,0.2);color:#48c972;font-size:20px;cursor:pointer;display:none;transition:all 0.25s ease";
  bt.onclick = function() { window.scrollTo({top:0,behavior:"smooth"}); };
  document.body.appendChild(bt);
  window.addEventListener("scroll", function() {
    bt.style.display = window.scrollY > 300 ? "block" : "none"; });
  
  
  
})();
