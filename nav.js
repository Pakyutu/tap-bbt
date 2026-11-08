// Tombol pindah dashboard (dipakai di digipos.html & penjualan.html)
(function(){
  var here = location.pathname.split("/").pop() || "index.html";
  var items = [
    ["index.html","Menu utama"],
    ["digipos.html","Dashboard DIGIPOS"],
    ["penjualan.html","Dashboard Penjualan"]
  ];
  var css = ''
   +'#bbtnav{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:30;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}'
   +'#bbtnav button.fab{width:48px;height:48px;border-radius:50%;border:0;background:#0b3a6e;color:#fff;font-size:22px;line-height:1;box-shadow:0 3px 10px rgba(0,0,0,.25);cursor:pointer}'
   +'#bbtnav .pop{position:absolute;right:0;bottom:58px;min-width:210px;background:#fff;color:#14213d;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.22);padding:6px;display:none}'
   +'#bbtnav.open .pop{display:block}'
   +'#bbtnav .pop a{display:block;padding:11px 12px;border-radius:8px;text-decoration:none;color:inherit;font-size:14px}'
   +'#bbtnav .pop a:active,#bbtnav .pop a:hover{background:#eef2f8}'
   +'#bbtnav .pop a.cur{font-weight:600;color:#0b3a6e;background:#e6eef9}'
   +'@media (prefers-color-scheme:dark){#bbtnav .pop{background:#18212f;color:#e8edf6}#bbtnav .pop a:hover{background:#243044}#bbtnav .pop a.cur{background:#22344f;color:#9cc3ff}}'
   +'#bbtoff{position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:35;background:#ffb020;color:#1a1200;font:600 12px system-ui,sans-serif;padding:6px 12px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.2);display:none}'
   +'@media print{#bbtnav,#bbtoff{display:none}}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var w = document.createElement("div"); w.id = "bbtnav";
  w.setAttribute("data-html2canvas-ignore","true");
  var html = '<div class="pop" role="menu">';
  items.forEach(function(it){
    html += '<a role="menuitem" href="'+it[0]+'"'+(it[0]===here?' class="cur"':'')+'>'+it[1]+'</a>';
  });
  html += '</div><button class="fab" type="button" aria-label="Pindah dashboard">&#9776;</button>';
  w.innerHTML = html;
  document.body.appendChild(w);
  var fab = w.querySelector(".fab");
  fab.addEventListener("click", function(e){ e.stopPropagation(); try{navigator.vibrate&&navigator.vibrate(10)}catch(_){} w.classList.toggle("open"); });
  document.addEventListener("click", function(e){ if(!w.contains(e.target)) w.classList.remove("open"); });
  var off=document.createElement("div");off.id="bbtoff";off.setAttribute("data-html2canvas-ignore","true");off.textContent="Mode offline · data tersimpan";document.body.appendChild(off);
  function net(){off.style.display=navigator.onLine?"none":"block"}
  addEventListener("online",net);addEventListener("offline",net);net();
})();
