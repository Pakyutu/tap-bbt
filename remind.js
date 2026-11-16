// Pengingat harian: banner + notifikasi untuk pengingat yang sudah lewat jamnya hari ini.
(function(){try{
  if(/pengingat\.html/.test(location.pathname))return;
  var L=JSON.parse(localStorage.getItem("remind")||"null");if(!Array.isArray(L)||!L.length)return;
  var D=JSON.parse(localStorage.getItem("remind_done")||"{}"),N=JSON.parse(localStorage.getItem("remind_ntf")||"{}"),n=new Date(),td=n.getFullYear()+"-"+(n.getMonth()+1)+"-"+n.getDate(),mm=n.getHours()*60+n.getMinutes();
  var due=L.filter(function(r){var t=r.t.split(":");return r.on&&r.d.indexOf(n.getDay())>=0&&mm>=(+t[0])*60+(+t[1])&&D[r.id]!==td});
  if(!due.length)return;
  var b=document.createElement("div");b.setAttribute("data-html2canvas-ignore","true");
  b.style.cssText="position:fixed;left:12px;right:66px;top:calc(10px + env(safe-area-inset-top,0px));z-index:9998;background:#14213d;color:#fff;border-radius:14px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.25);font:13.5px system-ui,sans-serif;max-width:460px";
  b.innerHTML=due.map(function(r){return '<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;padding:3px 0"><span>⏰ <b>'+r.t+'</b> '+String(r.n).replace(/</g,"&lt;")+'</span><button data-rd="'+r.id+'" style="border:0;background:#0f8a52;color:#fff;border-radius:8px;padding:5px 9px;font-weight:700;font-size:12px;white-space:nowrap">✓ Selesai</button></div>'}).join("")+'<div style="display:flex;justify-content:space-between;margin-top:4px;font-size:12px;opacity:.8"><a href="pengingat.html" style="color:#9cc3ff">Atur pengingat</a><a href="#" data-rx style="color:#fff">Tutup</a></div>';
  document.body.appendChild(b);
  b.addEventListener("click",function(e){var t=e.target;if(t.dataset.rd){D[t.dataset.rd]=td;localStorage.setItem("remind_done",JSON.stringify(D));t.parentNode.remove();if(!b.querySelector("[data-rd]"))b.remove()}if(t.dataset.rx!==undefined){e.preventDefault();b.remove()}});
  if("Notification"in window&&Notification.permission==="granted"&&navigator.serviceWorker){var fresh=due.filter(function(r){return N[r.id]!==td});if(fresh.length){navigator.serviceWorker.ready.then(function(reg){fresh.forEach(function(r){reg.showNotification("⏰ "+r.n,{body:(r.c||"")+(r.c?" · ":"")+"jam "+r.t,icon:"icon-192.png",tag:"rm-"+r.id});N[r.id]=td});localStorage.setItem("remind_ntf",JSON.stringify(N))})}}
}catch(e){}})();
