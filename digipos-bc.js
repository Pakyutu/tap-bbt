// Tab "Barcode": barcode checkout Dgp-<ID outlet> (Code 128) per outlet, cari nama/ID/username, layar penuh untuk scan.
(function(){
  if(typeof R==='undefined')return;
  const PAT='212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112'.split(' ');
  const es=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const tc=s=>String(s).toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
  const code=id=>'Dgp-'+id;
  function svg(txt,h){const v=[104];for(const ch of txt){const c=ch.charCodeAt(0)-32;if(c<0||c>94)continue;v.push(c)}
    let sum=104;for(let i=1;i<v.length;i++)sum+=i*v[i];v.push(sum%103,106);
    let x=10,r='';for(const k of v){const p=PAT[k];for(let i=0;i<p.length;i++){const w=+p[i];if(i%2===0)r+='<rect x="'+x+'" y="0" width="'+w+'" height="'+h+'"/>';x+=w}}
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(x+10)+' '+h+'" preserveAspectRatio="none" style="width:100%;height:'+h+'px;background:#fff;display:block" shape-rendering="crispEdges"><g fill="#000">'+r+'</g></svg>'}
  window.bcSvg=svg;
  let q='';
  const tb=document.getElementById('tabs');
  if(tb&&!tb.querySelector('[data-t="bc"]')){const b=document.createElement('button');b.dataset.t='bc';b.textContent='🏷️ Barcode';b.onclick=()=>{st.tab='bc';draw()};tb.appendChild(b)}
  const css=document.createElement('style');css.textContent='.bc-q{width:100%;padding:11px 12px;border:1px solid var(--bd);border-radius:10px;font-size:15px;background:var(--card);color:var(--tx)}.bc-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;margin-top:10px}.bc-c{border:1px solid var(--bd);border-radius:12px;padding:10px;cursor:pointer;background:var(--card)}.bc-c b{font-size:14px}.bc-c .m{font-size:11.5px;color:var(--mu);margin-bottom:6px}.bc-w{background:#fff;padding:8px 6px 4px;border-radius:8px}.bc-t{font:600 14px ui-monospace,monospace;color:#000;text-align:center;letter-spacing:1px;margin-top:3px}#bcfs{position:fixed;inset:0;z-index:9999;background:#fff;display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px;color:#000}#bcfs .n{font:700 20px system-ui;margin-bottom:4px;text-align:center}#bcfs .s{font-size:13px;color:#555;margin-bottom:18px}#bcfs .x{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));left:14px;border:0;background:#eee;border-radius:10px;padding:8px 14px;font-size:15px}';document.head.appendChild(css);
  const fs=document.createElement('div');fs.id='bcfs';document.body.appendChild(fs);
  function list(){const k=q.trim().toLowerCase(),U=D.U||{};let a=sel();
    if(k)a=a.filter(o=>o.nm.toLowerCase().includes(k)||o.id.includes(k)||String(U[o.id]||'').toLowerCase().includes(k));
    a=a.slice().sort((x,y)=>x.nm.localeCompare(y.nm));const n=a.length;a=a.slice(0,40);
    return '<div class="sub" style="margin-top:8px">'+n+' outlet'+(n>40?' · tampil 40 pertama, ketik nama/ID untuk persempit':'')+' · ketuk barcode untuk layar penuh</div><div class="bc-g">'+a.map(o=>'<div class="bc-c" data-bc="'+o.id+'"><b>'+es(o.nm)+'</b><div class="m">'+o.id+(U[o.id]?' · '+es(U[o.id]):'')+' · '+es(tc(o.sf).split(' ')[0])+' · '+es(o.kec)+'</div><div class="bc-w">'+svg(code(o.id),56)+'<div class="bc-t">'+code(o.id)+'</div></div></div>').join('')+'</div>'}
  R.bc=function(){return '<div class="card"><h3>🏷️ Barcode Checkout Digipos</h3><div class="sub">Kode <b>Dgp-ID outlet</b> (Code 128). Ikut filter SF / Kecamatan / PJP di atas.</div><input class="bc-q" id="bcq" placeholder="Cari nama outlet, ID, atau username…" value="'+es(q)+'" autocomplete="off"><div id="bcl">'+list()+'</div></div>'};
  document.addEventListener('input',e=>{if(e.target.id==='bcq'){q=e.target.value;const l=document.getElementById('bcl');if(l)l.innerHTML=list()}});
  document.addEventListener('click',e=>{const c=e.target.closest('[data-bc]');if(c){const o=O.find(x=>x.id===c.dataset.bc);if(!o)return;
      fs.innerHTML='<button class="x">✕ Tutup</button><div class="n">'+es(o.nm)+'</div><div class="s">'+o.id+' · '+es(tc(o.sf))+'</div><div style="width:min(94vw,560px)">'+svg(code(o.id),150)+'<div class="bc-t" style="font-size:20px;margin-top:8px">'+code(o.id)+'</div></div>';
      fs.style.display='flex';try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>fs._w=w).catch(()=>{})}catch(_){}}
    else if(e.target.closest('#bcfs')){fs.style.display='none';try{fs._w&&fs._w.release()}catch(_){}}});
  try{if(st.tab==='bc')draw()}catch(e){}
})();
