// Tab "Titip Jual": posisi titip jual terkini per outlet (TJ dari digipos-tj.js, SURYA Detail Outlet). Ikut filter TAP/SF/Kecamatan/PJP/Top 20.
(function(){
  if(typeof R==='undefined'||typeof TJ==='undefined')return;
  const es=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),nf=v=>Math.round(v).toLocaleString('id-ID'),tc=s=>String(s).toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
  const tb=document.getElementById('tabs');
  if(tb&&!tb.querySelector('[data-t="tj"]')){const b=document.createElement('button');b.dataset.t='tj';b.textContent='📦 Titip Jual';b.onclick=()=>{st.tab='tj';draw()};const k=tb.querySelector('[data-t="cuan"]')||tb.querySelector('[data-t="site"]');k?tb.insertBefore(b,k):tb.appendChild(b)}
  if(typeof TABN!=='undefined')TABN.tj='Titip Jual';
  const css=document.createElement('style');css.textContent='@media(max-width:700px){.kc{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}.kc .k{padding:10px 12px!important;min-height:0!important}.kc .k .v{font-size:22px!important;line-height:1.1}.kc .k .t{font-size:10px!important}.kc .k .s{font-size:11.5px!important}.kc .k:first-child:nth-last-child(3){grid-column:1/-1}.bi-t th,.bi-t td,.tj-t th,.tj-t td{padding:6px 4px!important}.bi-t,.tj-t{font-size:12px!important}.bi-t th,.tj-t th{font-size:10px!important;letter-spacing:0!important}.bi-t td.l,.tj-t td.l,.bi-t th.l,.tj-t th.l{width:112px!important;min-width:112px!important;max-width:112px!important;white-space:normal!important;line-height:1.2}}.tj-t{width:100%;border-collapse:collapse;font-size:12.5px}.tj-t th{font-size:11px;color:var(--mu);font-weight:600;text-align:right;padding:5px 6px;border-bottom:1px solid var(--bd)}.tj-t td{padding:6px;border-bottom:1px solid var(--bd);text-align:right}.tj-t .l{text-align:left}.tj-t tr.t td{font-weight:700;border-top:2px solid var(--bd)}.tj-t .mu{color:var(--mu)}.tj-ch{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.tj-ch button{border:1px solid var(--bd);background:transparent;color:inherit;border-radius:999px;padding:5px 11px;font-size:12.5px;cursor:pointer}.tj-ch button.on{background:var(--ac);color:#fff;border-color:var(--ac)}';document.head.appendChild(css);
  let mode='pv';document.addEventListener('dgp-reset',()=>{mode='pv'});
  const v=id=>TJ.v[id]||null;
  const K=['SA Simpati','SA By.U','SA All','VF Reg','VF By.U','VF All'];
  function sum(L){const s=[0,0,0,0,0,0];let n=0;L.forEach(o=>{const x=v(o.id);if(!x)return;n++;x.forEach((q,i)=>s[i]+=q)});return{n,s}}
  R.tj=function(){
    const L=sel(),T=sum(L),A=L.filter(o=>v(o.id));
    const by={};A.forEach(o=>(by[o.sf]=by[o.sf]||[]).push(o));
    const rows=Object.entries(by).map(([sf,a])=>({sf,...sum(a)})).sort((a,b)=>(b.s[2]+b.s[5])-(a.s[2]+a.s[5]));
    const tr=rows.map(r=>`<tr><td class="l"><b>${es(tc(r.sf))}</b></td><td>${r.n}</td>${r.s.map((q,i)=>`<td${i===2||i===5?' style="font-weight:700"':''}>${q?nf(q):'<span class="mu">–</span>'}</td>`).join('')}</tr>`).join('');
    const key=st.prod==='SA'?2:st.prod==='VF'?5:-1,kv=x=>key>=0?x[key]:st.prod==='ALL'?x[2]+x[5]:x[1]+x[4];
    const LL=A.filter(o=>kv(v(o.id))>0).sort((a,b)=>st.ord==='min'?kv(v(a.id))-kv(v(b.id)):kv(v(b.id))-kv(v(a.id))).slice(0,100);
    const ol=LL.map((o,i)=>{const x=v(o.id);return `<tr><td class="mu">${i+1}</td><td class="l"><b>${es(o.nm)}</b><br><span class="mu" style="font-size:11px">${o.id} · ${es(tc(o.sf).split(' ')[0])} · ${es(o.kec||'')}</span></td>${x.map((q,j)=>`<td${j===key?' style="font-weight:700"':''}>${q?nf(q):'<span class="mu">–</span>'}</td>`).join('')}</tr>`}).join('');
    return (typeof fbar==='function'?fbar():'')+`<div class="card"><h3>📦 Titip Jual</h3><div class="sub">Posisi titip jual terkini per outlet (SURYA, data ${TJ.d} Nov). Hanya outlet yang punya titip jual. Ikut filter di atas.</div>
      <div class="kpi kc" style="margin-top:10px"><div class="k"><div class="t">Outlet titip jual</div><div class="v">${nf(T.n)}</div><div class="s">dari ${nf(L.length)} outlet terpilih</div></div>
      <div class="k"><div class="t">SA All</div><div class="v">${nf(T.s[2])}</div><div class="s">Simpati ${nf(T.s[0])} · By.U ${nf(T.s[1])}</div></div>
      <div class="k"><div class="t">VF All</div><div class="v">${nf(T.s[5])}</div><div class="s">Reg ${nf(T.s[3])} · By.U ${nf(T.s[4])}</div></div></div></div>
      <div class="card tw" style="margin-top:12px"><h3>Per SF</h3><table class="tj-t"><tr><th></th><th></th><th colspan="3" style="text-align:center">SA</th><th colspan="3" style="text-align:center">VF</th></tr><tr><th class="l">SF</th><th>Outlet</th>${['Simpati','By.U','All','Reg','By.U','All'].map(k=>`<th>${k}</th>`).join('')}</tr>${tr}
      <tr class="t"><td class="l">Total</td><td>${T.n}</td>${T.s.map(q=>`<td>${nf(q)}</td>`).join('')}</tr></table></div>
      <div class="card tw" style="margin-top:12px"><h3>Daftar outlet</h3>
      
      <div class="sub">${LL.length} outlet${LL.length>=100?' (100 teratas)':''}</div>
      <table class="tj-t"><tr><th></th><th></th><th colspan="3" style="text-align:center">SA</th><th colspan="3" style="text-align:center">VF</th></tr><tr><th>#</th><th class="l">Outlet</th>${['Simpati','By.U','All','Reg','By.U','All'].map(k=>`<th>${k}</th>`).join('')}</tr>${ol}</table></div>`};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-tjm]');if(!b)return;draw()});
  try{if(st.tab==='tj')draw()}catch(e){}
})();
