// Tampilan lebih simpel: header ringkas, ⓘ untuk keterangan, per-SF satu kartu + chip, sebaran dilipat, chip status di Outlet.
(function(){
  if(typeof R==='undefined')return;
  const css=document.createElement('style');css.textContent=`
  html body{font-size:15px;line-height:1.5}
  html body .top h1{font-size:clamp(18px,4.6vw,24px)!important;line-height:1.2!important}
  html body .top h1::before{display:none!important}
  html body .card h3,html body details.card>summary{font-size:15.5px!important;font-weight:650;margin:0 0 10px;letter-spacing:-.01em}
  html body .k .t{font-size:11px!important;letter-spacing:.06em}html body .k .v{font-size:28px!important;font-weight:700;line-height:1.15}html body .k .s{font-size:12.5px!important;line-height:1.4}
  html body table{font-size:13.5px} html body table th{font-size:11.5px;letter-spacing:.03em}
  html body .sub,html body .mu{font-size:12.5px}
  .infb{border:1px solid var(--bd);background:var(--soft);color:var(--mu);border-radius:50%;width:26px;height:26px;font-size:13px;line-height:1;cursor:pointer;padding:0;margin-left:8px;vertical-align:middle}
  #sub.hid{display:none}
  details.card{padding:14px 16px}details.card>summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;margin:0}
  details.card>summary::-webkit-details-marker{display:none}details.card>summary::after{content:"▾";color:var(--mu);transition:transform .2s}details.card[open]>summary::after{transform:rotate(180deg)}
  details.card[open]>summary{margin-bottom:10px}
  .sfc{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 12px}.sfc::-webkit-scrollbar{display:none}
  .sfc button,.chp button{flex:none;border:1px solid var(--bd);background:var(--card);color:var(--tx);font:inherit;font-size:13px;padding:7px 13px;border-radius:999px;cursor:pointer;white-space:nowrap}
  .sfc button.on,.chp button.on{background:var(--ac);color:#fff;border-color:var(--ac);font-weight:600}
  .chp{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 12px}.chp::-webkit-scrollbar{display:none}
  html body .row #q{flex:1 1 100%!important;min-width:0!important}
  .more{display:block;width:100%;margin-top:10px;border:1px dashed var(--bd);background:none;color:var(--mu);border-radius:12px;padding:9px;font:inherit;font-size:13px;cursor:pointer}
  `;document.head.appendChild(css);
  // ⓘ untuk keterangan header
  const sub=document.getElementById('sub'),h1=document.querySelector('.top h1');
  if(sub&&h1){sub.classList.add('hid');const b=document.createElement('button');b.type='button';b.className='infb';b.textContent='ⓘ';b.setAttribute('aria-label','Keterangan data');b.onclick=e=>{e.stopPropagation();sub.classList.toggle('hid')};h1.appendChild(b)}
  let sfp='',sfall=false;
  document.addEventListener('click',e=>{
    const c=e.target.closest('[data-sfc]');if(c){sfp=c.dataset.sfc;draw();return}
    const m=e.target.closest('[data-sfall]');if(m){sfall=!sfall;draw();return}
    const p=e.target.closest('[data-pm]');if(p){window.__pm=p.dataset.pm;draw();return}
    const o=e.target.closest('[data-ost]');if(o){st.ost=o.dataset.ost;st.pg=0;draw();return}
  });
  const oR=R.ring;
  R.ring=function(){
    let h=oR.apply(this,arguments);
    const a=sel(),fs=fullScope(),pm=window.__pm==='b'?'b':'r';
    let rows=SF.filter(s=>!st.sf||s===st.sf).map(s=>{const x=agg(a.filter(o=>o.sf===s));return{nm:s,r:x.reg,b:x.byu,tr:fs?TT[s][0]:null,tb:fs?TT[s][1]:null}});
    const key=pm==='b'?'b':'r',tk=pm==='b'?'tb':'tr';
    rows.sort((p,q)=>q[key]-p[key]);
    if(sfp&&!rows.some(r=>r.nm===sfp))sfp='';
    let view=sfp?rows.filter(r=>r.nm===sfp):(sfall?rows:rows.slice(0,5));
    const mx=Math.max(1,...rows.map(r=>Math.max(r[key],r[tk]||0)));
    const lab=pm==='b'?L.b:L.a,thr=pm==='b'?L.tb:L.ta,un=pm==='b'?L.ub:L.ua;
    const chips=`<div class="sfc"><button data-sfc="" class="${sfp?'':'on'}">Semua SF</button>${rows.map(r=>`<button data-sfc="${esc(r.nm)}" class="${sfp===r.nm?'on':''}">${esc(r.nm.split(' ')[0])}</button>`).join('')}</div>`;
    const card=`<div class="card"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h3 style="margin:0">OA per SF</h3><span class="seg"><button data-pm="r" class="${pm==='r'?'on':''}">${esc(L.sa)}</button><button data-pm="b" class="${pm==='b'?'on':''}">${esc(L.sb)}</button></span></div>${chips}${hbars(view.map(r=>({nm:r.nm,v:r[key],t:r[tk]})),mx)}<div class="lg"><span><i style="background:var(--bar)"></i>Ach (outlet ≥${thr} ${un})</span>${fs?`<span><i style="background:var(--ac)"></i>Target OA</span>`:''}</div>${!sfp&&rows.length>5?`<button class="more" data-sfall="1">${sfall?'Tampilkan 5 teratas':'Lihat semua '+rows.length+' SF'}</button>`:''}</div>`;
    h=h.replace(/<div class="grid2">[\s\S]*?(?=<div class="card"><h3>Sebaran)/,card);
    h=h.replace(/<div class="card"><h3>(Sebaran[^<]*)<\/h3>([\s\S]*?<div class="sub">[\s\S]*?<\/div>)<\/div>/,'<details class="card"><summary>$1</summary>$2</details>');
    return h};
  const oO=R.out;
  if(oO)R.out=function(){
    let h=oO.apply(this,arguments);
    const C=[['all','Semua'],['noreg','Belum OA '+L.a],['reg','Sudah OA '+L.a],['nobyu','Belum OA '+L.b],['byu','Sudah OA '+L.b],['nol','Belum ada ST']];
    const chips=`<div class="chp">${C.map(([v,l])=>`<button data-ost="${v}" class="${st.ost===v?'on':''}">${esc(l)}</button>`).join('')}</div>`;
    h=h.replace('<select id="ost"','<select id="ost" hidden');
    h=h.replace(/(<div class="row"><input type="search")/,chips+'$1');
    return h};
  try{draw()}catch(e){}
})();
