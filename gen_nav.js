var fs = require('fs');
var script = '// Navbar - dynamically injected\n' +
'(function() {\n' +
'  function inject() {\n' +
'    if (!document.body) { setTimeout(inject, 5); return; }\n' +
'    var p = window.location.pathname.split("/").pop() || "index.html";\n' +
'    function a(page) { return p === page ? "active" : ""; }\n' +
'    var h = ' +
'"<nav class=\\"navbar\\">" + ' +
'"<div class=\\"nav-container\\">" + ' +
'"<a href=\\"index.html\\" class=\\"nav-logo\\">" + ' +
'"<svg width=\\"28\\" height=\\"28\\" viewBox=\\"0 0 28 28\\" fill=\\"none\\">" + ' +
'"<path d=\\"M14 2L14 26\\" stroke=\\"#00b478\\" stroke-width=\\"3\\" stroke-linecap=\\"round\\"/>" + ' +
'"<path d=\\"M5 8L14 14L23 8\\" stroke=\\"#00b478\\" stroke-width=\\"3\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"/>" + ' +
'"<path d=\\"M5 20L14 14L23 20\\" stroke=\\"#00b478\\" stroke-width=\\"3\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"/>" + ' +
'"</svg>" + ' +
'"<span>" + "\\u94c1\\u9986" + "</span></a>" + ' +
'"<ul class=\\"nav-links\\">" + ' +
'"<li><a href=\\"index.html\\" class=\\"" + a("index.html") + "\\">" + "\\u9996\\u9875" + "</a></li>" + ' +
'"<li><a href=\\"videos.html\\" class=\\"" + a("videos.html") + "\\">" + "\\u89c6\\u9891\\u6559\\u7a0b" + "</a></li>" + ' +
'"<li><a href=\\"plans.html\\" class=\\"" + a("plans.html") + "\\">" + "\\u8bad\\u7ec3\\u8ba1\\u5212" + "</a></li>" + ' +
'"<li><a href=\\"calculator.html\\" class=\\"" + a("calculator.html") + "\\">" + "\\u70ed\\u91cf\\u8ba1\\u7b97" + "</a></li>" + ' +
'"<li><a href=\\"knowledge.html\\" class=\\"" + a("knowledge.html") + "\\">" + "\\u77e5\\u8bc6\\u5e93" + "</a></li>" + ' +
'"<li><a href=\\"calendar.html\\" class=\\"" + a("calendar.html") + "\\">" + "\\u8fdb\\u5ea6\\u65e5\\u5386" + "</a></li>" + ' +
'"<li><a href=\\"tools.html\\" class=\\"" + a("tools.html") + "\\">" + "\\u5de5\\u5177" + "</a></li>" + ' +
'"<li><a href=\\"exercises.html\\" class=\\"" + a("exercises.html") + "\\">" + "\\u52a8\\u4f5c\\u5e93" + "</a></li>" + ' +
'"<li><a href=\\"body-stats.html\\" class=\\"" + a("body-stats.html") + "\\">" + "\\u8eab\\u4f53\\u6570\\u636e" + "</a></li>" + ' +
'"</ul>" + ' +
'"<a href=\\"profile.html\\" class=\\"nav-avatar\\" title=\\"" + "\\u4e2a\\u4eba\\u8d44\\u6599" + "\\">" + ' +
'"<svg width=\\"28\\" height=\\"28\\" viewBox=\\"0 0 28 28\\" fill=\\"none\\"><circle cx=\\"14\\" cy=\\"10\\" r=\\"5\\" stroke=\\"#aaa\\" stroke-width=\\"2\\"/><path d=\\"M4 24C4 19 8.5 16 14 16C19.5 16 24 19 24 24\\" stroke=\\"#aaa\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\"/></svg></a>" + ' +
'"<button class=\\"nav-toggle\\" id=\\"navToggle\\" aria-label=\\"" + "\\u83dc\\u5355" + "\\"><span></span><span></span><span></span></button>" + ' +
'"</div></nav>" ;\n' +
'    document.body.insertAdjacentHTML("afterbegin", h);\n' +
'    var t = document.getElementById("navToggle");\n' +
'    var l = document.querySelector(".nav-links");\n' +
'    if (t && l) {\n' +
'      t.addEventListener("click", function() { l.classList.toggle("open"); t.classList.toggle("open"); });\n' +
'      var items = l.querySelectorAll("a");\n' +
'      for (var i = 0; i < items.length; i++) (function(link) {\n' +
'        link.addEventListener("click", function() { l.classList.remove("open"); t.classList.remove("open"); });\n' +
'      })(items[i]);\n' +
'    }\n' +
'  }\n' +
'  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", inject); }\n' +
'  else { inject(); }\n' +
'})();\n';
fs.writeFileSync('D:\\健身网站\\public\\js\\nav.js', script, 'utf-8');
console.log('nav.js written, size: ' + script.length);
