// Navigasi bawah Cluster Rohil: Beranda · DIGIPOS · Penjualan · Alat (Penyusun WL, Kalkulator, Cek WL, Backup)
(function(){
  var here = location.pathname.split("/").pop() || "index.html";
  var ic = {
    home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    dg:'<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10 7h4M9.5 11h5M9.5 15h3"/>',
    pj:'<path d="M3 20h18"/><path d="M6 16v-5M11 16V6M16 16v-3M20 16V8"/>',
    tools:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    wl:'<path d="M4 6h16M4 12h16M4 18h10"/>',
    kalk:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M8 15h2M12 15h2M16 11v4"/>',
    cst:'<path d="M4 12l5 5L20 6"/><path d="M4 6h7M4 18h4"/>',
    bk:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/>'
  };
  var svg=function(k){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+ic[k]+'</svg>'};
  var tools=[["wl.html","Penyusun WL","Bagi SN ke outlet, barcode, salin WA","wl"],["kalkulator.html","Kalkulator Jualan","Nota, total, struk","kalk"],["cekst.html","Cek WL vs ST","WL dropingan vs ST Digipos","cst"],["backup.html","Backup Data","Simpan & pulihkan di HP baru","bk"]];
  var isTool=tools.some(function(t){return t[0]===here});
  var main=[["index.html","Beranda","home"],["digipos.html","DIGIPOS","dg"],["penjualan.html","Penjualan","pj"]];
  var css=''
   +'#bbtnav{position:fixed;left:0;right:0;bottom:0;z-index:40;font-family:var(--font,system-ui,sans-serif);background:var(--card,#fff);border-top:1px solid var(--bd,#dce3ed);padding:6px 8px calc(6px + env(safe-area-inset-bottom,0px))}'
   +'#bbtnav .bn{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;max-width:560px;margin:0 auto}'
   +'#bbtnav .it{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-height:52px;border-radius:14px;text-decoration:none;color:var(--mu,#526078);font-size:11.5px;font-weight:600;background:none;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .15s,color .15s}'
   +'#bbtnav .it svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}'
   +'#bbtnav .it.cur{color:var(--ac,#c8102e);background:color-mix(in srgb,var(--ac,#c8102e) 11%,transparent)}'
   +'#bbtnav .it:active{transform:scale(.96)}'
   +'#bbtsh{position:fixed;inset:0;z-index:45;display:none}#bbtsh.open{display:block}'
   +'#bbtsh .ov{position:absolute;inset:0;background:rgb(7 14 27 / .5);animation:bbtf .2s ease}'
   +'#bbtsh .pn{position:absolute;left:0;right:0;bottom:0;background:var(--card,#fff);color:var(--tx,#152137);border-radius:22px 22px 0 0;padding:10px 16px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -12px 40px rgb(4 10 20 / .25);animation:bbtu .25s cubic-bezier(.2,.7,.2,1);max-width:560px;margin:0 auto}'
   +'#bbtsh .gr{width:40px;height:4px;border-radius:4px;background:var(--bd,#dce3ed);margin:0 auto 12px}'
   +'#bbtsh h2{font-size:13px;letter-spacing:.09em;text-transform:uppercase;color:var(--mu,#526078);margin:0 4px 8px;font-weight:700}'
   +'#bbtsh a{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;text-decoration:none;color:inherit;min-height:56px}'
   +'#bbtsh a:active,#bbtsh a.cur{background:var(--soft,#eaf0f6)}'
   +'#bbtsh a i{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--ac,#c8102e) 12%,transparent);color:var(--ac,#c8102e)}'
   +'#bbtsh a i svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}'
   +'#bbtsh a b{display:block;font-size:15px}#bbtsh a small{display:block;color:var(--mu,#526078);font-size:12.5px;margin-top:1px}'
   +'@keyframes bbtu{from{transform:translateY(100%)}}@keyframes bbtf{from{opacity:0}}'
   +'#bbtoff{position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:35;background:#fff3d6;color:#5c3a00;font:600 12px var(--font,system-ui),sans-serif;padding:6px 12px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.15);display:none}'
   +'@media (prefers-reduced-motion:reduce){#bbtsh .ov,#bbtsh .pn{animation:none}}'
   +'@media print{#bbtnav,#bbtsh,#bbtoff{display:none}}';
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  var w=document.createElement("nav");w.id="bbtnav";w.setAttribute("aria-label","Navigasi utama");w.setAttribute("data-html2canvas-ignore","true");
  w.innerHTML='<div class="bn">'+main.map(function(m){return '<a class="it'+(m[0]===here?' cur':'')+'" href="'+m[0]+'"'+(m[0]===here?' aria-current="page"':'')+'>'+svg(m[2])+'<span>'+m[1]+'</span></a>'}).join('')
    +'<button class="it'+(isTool?' cur':'')+'" type="button" id="bbttl" aria-haspopup="dialog">'+svg("tools")+'<span>Alat</span></button></div>';
  document.body.appendChild(w);
  var sh=document.createElement("div");sh.id="bbtsh";sh.setAttribute("data-html2canvas-ignore","true");sh.setAttribute("role","dialog");sh.setAttribute("aria-label","Alat");
  sh.innerHTML='<div class="ov"></div><div class="pn"><div class="gr"></div><h2>Alat kerja</h2>'+tools.map(function(t){return '<a href="'+t[0]+'"'+(t[0]===here?' class="cur"':'')+'><i>'+svg(t[3])+'</i><span><b>'+t[1]+'</b><small>'+t[2]+'</small></span></a>'}).join('')+'</div>';
  document.body.appendChild(sh);
  var tb=document.createElement("button");tb.type="button";tb.style.cssText="display:flex;align-items:center;gap:12px;width:100%;padding:12px;margin-top:6px;border:0;border-top:1px solid var(--bd);background:transparent;color:inherit;font:600 15px var(--font,system-ui);min-height:52px;cursor:pointer;text-align:left";
  var tl=function(){var d=document.documentElement.dataset.theme!=="light";tb.textContent=d?"☀️  Ganti ke tema terang":"🌙  Ganti ke tema gelap"};tl();
  tb.addEventListener("click",function(){var n=document.documentElement.dataset.theme==="light"?"dark":"light";document.documentElement.dataset.theme=n;try{localStorage.setItem("theme",n)}catch(_){}tl()});
  sh.querySelector(".pn").appendChild(tb);
  document.getElementById("bbttl").addEventListener("click",function(){try{navigator.vibrate&&navigator.vibrate(10)}catch(_){}sh.classList.add("open")});
  sh.querySelector(".ov").addEventListener("click",function(){sh.classList.remove("open")});
  addEventListener("keydown",function(e){if(e.key==="Escape")sh.classList.remove("open")});
  var off=document.createElement("div");off.id="bbtoff";off.setAttribute("data-html2canvas-ignore","true");off.textContent="Mode offline · data tersimpan";document.body.appendChild(off);
  function net(){off.style.display=navigator.onLine?"none":"block"}
  addEventListener("online",net);addEventListener("offline",net);net();
})();
// Versi baru aplikasi: muat ulang sekali otomatis supaya tampilan terbaru langsung terlihat
(function(){try{if(!navigator.serviceWorker)return;var had=!!navigator.serviceWorker.controller,done=false;
navigator.serviceWorker.addEventListener("controllerchange",function(){if(!had||done)return;done=true;location.reload()})}catch(_){}})();
