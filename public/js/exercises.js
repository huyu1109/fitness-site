
// Exercise database


// Chinese to pinyin map (simplified initials)
var pyMap={胸:"x",背:"b",肩:"j",手:"s",腿:"t",腹:"f",腰:"y",臀:"t",哑:"y",杠:"g",绳:"s",徒:"t",弹:"d",壶:"h",药:"y",机:"j",毛:"m",肩:"j",肘:"z",膝:"x",颈:"j",头:"t",面:"m",双:"s",引:"y",窄:"z",宽:"k"};
function toPy(s){return s.split("").map(function(c){return pyMap[c]||""}).join("")}

// Render
var curMuscle="all",curEquip="all",curDiff="all",curSearch="";

function search(){
  curSearch=document.getElementById("searchInput").value.trim().toLowerCase();
  // Show skeleton on new search
  var g = document.getElementById("grid");
  if (g && curSearch.length > 0) {
    g.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px">' +
      '<div class="card" style="height:120px"><div class="skeleton" style="width:70%;height:16px;margin-bottom:12px"></div><div class="skeleton" style="width:40%;height:12px"></div></div>' +
      '<div class="card" style="height:120px"><div class="skeleton" style="width:70%;height:16px;margin-bottom:12px"></div><div class="skeleton" style="width:40%;height:12px"></div></div>' +
      '<div class="card" style="height:120px"><div class="skeleton" style="width:70%;height:16px;margin-bottom:12px"></div><div class="skeleton" style="width:40%;height:12px"></div></div>' +
      '</div>';
  }
  setTimeout(render, 200);
}


function scoreResult(ex, query) {
  if (!query) return 0;
  var q = query.toLowerCase();
  var name = ex.name.toLowerCase();
  var en = ex.en.toLowerCase();
  var muscle = ex.muscle.toLowerCase();
  var equip = ex.equip.toLowerCase();
  // Exact match = highest score
  if (name === q) return 100;
  if (en === q) return 90;
  // Name contains
  if (name.indexOf(q) >= 0) return 80;
  if (en.indexOf(q) >= 0) return 70;
  // Pinyin match
  if (toPy(ex.name).indexOf(q) >= 0) return 65;
  // Keyword match
  for (var i = 0; i < ex.keywords.length; i++) {
    if (ex.keywords[i].toLowerCase().indexOf(q) >= 0) return 60;
  }
  // Muscle/equipment match
  if (muscle.indexOf(q) >= 0) return 40;
  if (equip.indexOf(q) >= 0) return 20;
  return 0;
}

function highlightMatch(text, query) {
  if (!query || !text) return text;
  var q = query.toLowerCase();
  var t = text.toLowerCase();
  var idx = t.indexOf(q);
  if (idx < 0) return text;
  return text.slice(0, idx) + "<mark>" + text.slice(idx, idx + q.length) + "</mark>" + text.slice(idx + q.length);
}

function diffStars(diff) {
  var n = {'入门': 1, '进阶': 2, '高阶': 3}[diff] || 1;
  var s = "";
  for (var i = 0; i < 3; i++) s += i < n ? "★" : "☆";
  return s;
}
function filter(type,val){
  if(type==="m"){
    curMuscle=val;
    document.querySelectorAll("#muscleTags .tag").forEach(function(t){t.classList.toggle("active",t.dataset.muscle===val)})
  }else if(type==="e"){
    curEquip=val;
    document.querySelectorAll("#equipTags .tag").forEach(function(t){t.classList.toggle("active",t.dataset.equip===val)})
  }else if(type==="d"){
    curDiff=val;
    document.querySelectorAll("#diffTags .tag").forEach(function(t){t.classList.toggle("active",t.dataset.diff===val)})
  }
  render()
}

// Setup filter clicks
document.querySelectorAll("#muscleTags .tag").forEach(function(t){t.addEventListener("click",function(){filter("m",this.dataset.muscle)})})
document.querySelectorAll("#equipTags .tag").forEach(function(t){t.addEventListener("click",function(){filter("e",this.dataset.equip)})})
document.querySelectorAll("#diffTags .tag").forEach(function(t){t.addEventListener("click",function(){filter("d",this.dataset.diff)})})

function render(){
  var allResults=exercises.filter(function(ex){
    if(curMuscle!=="all"&&ex.muscle!==curMuscle)return false;
    if(curEquip!=="all"&&ex.equip!==curEquip)return false;
    if(curDiff!=="all"&&ex.diff!==curDiff)return false;
    if(curSearch){
      var kw=curSearch;
      var inName=ex.name.toLowerCase().indexOf(kw)>=0;
      var inEn=ex.en.toLowerCase().indexOf(kw)>=0;
      var inMuscle=ex.muscle.toLowerCase().indexOf(kw)>=0;
      var inEquip=ex.equip.toLowerCase().indexOf(kw)>=0;
      var inKw=false;
      for(var i=0;i<ex.keywords.length;i++){if(ex.keywords[i].toLowerCase().indexOf(kw)>=0){inKw=true;break}}
      var inPy=toPy(ex.name).indexOf(kw)>=0;
      if(!inName&&!inEn&&!inMuscle&&!inEquip&&!inKw&&!inPy)return false;
    }
    return true
  });
  // Sort by relevance when searching
  if(curSearch){
    allResults.sort(function(a,b){return scoreResult(b,curSearch)-scoreResult(a,curSearch)});
  }
  if(!window.unlockAPI||!unlockAPI.isUnlocked()&&allResults.length>5){allResults=allResults.slice(0,5);limited=true}
  document.getElementById("resultCount").textContent="共 "+allResults.length+" 个动作"+(limited?" · 解锁显示全部":"");
  var g=document.getElementById("grid");
  if(allResults.length===0){g.innerHTML="<div class='none'>未找到匹配的动作，试试其他关键词</div>";return}
  var h="";
  allResults.forEach(function(ex){
    var hl=ex.name;
    if(curSearch&&ex.name.toLowerCase().indexOf(curSearch)>=0){
      hl=highlightMatch(ex.name,curSearch);
    }
    var lv="lv"+{入门:"1",进阶:"2",高阶:"3"}[ex.diff];
    h+="<div class='card' onclick='if(limited&&unlockAPI&&!unlockAPI.isUnlocked()){unlockAPI.showModal();return}showDetail("+ex.id+")'>";
    h+="<div class='nm'>"+hl+'</div>';
    h+='<div style="font-size:12px;color:var(--text-tertiary);margin-bottom:4px">'+diffStars(ex.diff)+'</div>';
    h+="<div class='meta'><span>"+highlightMatch(ex.muscle,curSearch)+"</span><span>"+highlightMatch(ex.equip,curSearch)+"</span><span class='"+lv+"'>"+ex.diff+"</span></div></div>"
  });
  g.innerHTML=h
  if(limited&&unlockAPI&&!unlockAPI.isUnlocked()){
    g.innerHTML+='<div style="text-align:center;padding:24px;border-top:1px solid rgba(255,255,255,0.06);margin-top:16px"><p style="color:rgba(255,255,255,0.3);font-size:13px;margin-bottom:8px;">已显示前5个动作</p><button class="btn btn-primary" onclick="unlockAPI.showModal()">0.5元解锁全部'+exercises.length+'个动作</button></div>';
  }
}

function showDetail(id){
  var ex=exercises.find(function(e){return e.id===id});
  if(!ex)return;
  var lv={入门:"1",进阶:"2",高阶:"3"}[ex.diff];
  var stepsHtml="";
  ex.steps.forEach(function(s,i){stepsHtml+="<li>"+s+"</li>"});
  var errHtml="";
  ex.errors.forEach(function(e){errHtml+="<li class="err">"+e+"</li>"});
  var altHtml="";
  ex.alt.split("、").forEach(function(a){altHtml+="<li class="alt">"+a+"</li>"});
  document.getElementById("modalContent").innerHTML="<h2>"+ex.name+"</h2><div class='en2'>"+ex.en+'</div>'
    +"<div class='modal-tags'><span>"+ex.muscle+"</span><span>"+ex.equip+"</span><span class='lv"+lv+"' style='color:"+{1:"#48c972",2:"#ffaa32",3:"#ff5050"}[lv]+"'>"+ex.diff+"</span><span>"+ex.type+"</span></div>"
    +"<div class='modal-section'><h4>\uD83C\uDFCB 动作步骤</h4><ol>"+stepsHtml+"</ol></div>"
    +"<div class='modal-section'><h4>\uD83D\uDC2C 呼吸节奏</h4><p style='font-size:12px;color:rgba(255,255,255,0.65)'>"+ex.breath+"</p></div>"
    +"<div class='modal-section'><h4>\u26A0\uFE0F 常见错误</h4><ul>"+errHtml+"</ul></div>"
    +"<div class='modal-section'><h4>\uD83D\uDCA1 替代动作</h4><ul>"+altHtml+"</ul></div>"
    +"<div style='font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:8px'>\uD83C\uDFCB 适合人群："+ex.suit+'</div>'
    +"<button class='btn-add'>\u2795 加入我的计划</button>";
  document.getElementById("modal").classList.add("open")
}

function closeModal(){document.getElementById("modal").classList.remove("open")}

render(); setupTooltips();
var tipTimerEx=null;
function setupTooltips(){
  document.querySelectorAll(".card").forEach(function(card){
    card.addEventListener("mouseenter",function(){
      var id=parseInt(this.getAttribute("data-id"));
      if(!id)id=parseInt(this.getAttribute("onclick").match(/\d+/)[0]);
      var ex=exercises.find(function(e){return e.id===id});
      if(!ex)return;
      tipTimerEx=setTimeout(function(){showTip(ex)},150)
    });
    card.addEventListener("mousemove",function(e){moveTip(e)});
    card.addEventListener("mouseleave",function(){clearTimeout(tipTimerEx);setTimeout(function(){document.getElementById("exTip").style.display="none"},100)})
  })
}
function showTip(ex){
  var tip=document.getElementById("exTip");
  if(!tip)return;
  var lv={入门:"1",进阶:"2",高阶:"3"}[ex.diff];
  var steps="<ol class='tt-steps'>";
  ex.steps.slice(0,3).forEach(function(s){steps+="<li>"+s+"</li>"});
  steps+="</ol>";
  tip.innerHTML="<div class='tt-name'>"+ex.name+"</div><div class='tt-tags'><span class='mus'>"+ex.muscle+"</span><span>"+ex.equip+"</span><span class='lv"+lv+"'>"+ex.diff+"</span></div>"+steps;
  tip.style.display="block";
  moveTip(null)
}
function moveTip(e){
  var tip=document.getElementById("exTip");
  if(!tip||tip.style.display!=="block")return;
  var x=e?e.clientX:window.innerWidth/2;
  var y=e?e.clientY:window.innerHeight/2;
  var tw=tip.offsetWidth,th=tip.offsetHeight;
  var left=x+15,top=y-20;
  if(left+tw>window.innerWidth-10)left=x-tw-15;
  if(top+th>window.innerHeight-10)top=window.innerHeight-th-10;
  if(top<10)top=10;
  tip.style.left=left+"px";tip.style.top=top+"px"
}