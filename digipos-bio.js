// Tab "Biometrik": program Biometrik per outlet (CV.v[id][4] = [Okt full, Okt periode sama, Nov MTD], dari digipos-cvm.js) + FR Biometric Top 20 (D.FR).
(function(){
  if(typeof R==='undefined'||typeof CV==='undefined')return;
  const BI=CV.g.indexOf('Biometrik');if(BI<0)return;
  const es=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),nf=v=>Math.round(v).toLocaleString('id-ID'),tc=s=>String(s).toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
  const mom=(a,b)=>b?Math.round((a/b-1)*100):null,pf=p=>p==null?'–':(p>0?'▲ ':p<0?'▼ ':'')+Math.abs(p)+'%',cl=p=>p==null?'':p<0?'dn':'up';
  const lb=()=>CV.dd&&CV.dd[BI]?CV.dd[BI]:'1–'+CV.d+' Nov';
  let mode='dn';
  const tb=document.getElementById('tabs');
  if(tb&&!tb.querySelector('[data-t="bio"]')){const b=document.createElement('button');b.dataset.t='bio';b.textContent='🧬 Biometrik';b.onclick=()=>{st.tab='bio';draw()};const k=tb.querySelector('[data-t="cuan"]')||tb.querySelector('[data-t="site"]');k?tb.insertBefore(b,k):tb.appendChild(b)}
  if(typeof TABN!=='undefined')TABN.bio='Biometrik';
  const css=document.createElement('style');css.textContent='.bi-t{width:100%;border-collapse:collapse;font-size:12.5px}.bi-t th{font-size:11px;color:var(--mu);font-weight:600;text-align:right;padding:5px 6px;border-bottom:1px solid var(--bd)}.bi-t td{padding:6px;border-bottom:1px solid var(--bd);text-align:right}.bi-t .l{text-align:left}.bi-t tr.t td{font-weight:700;border-top:2px solid var(--bd)}.bi-t .mu{color:var(--mu)}.bi-t .up{color:var(--ok)}.bi-t .dn{color:var(--dn)}.bi-ch{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.bi-ch button{border:1px solid var(--bd);background:transparent;color:inherit;border-radius:999px;padding:5px 11px;font-size:12.5px;cursor:pointer}.bi-ch button.on{background:var(--ac);color:#fff;border-color:var(--ac)}';document.head.appendChild(css);
  const v=id=>(CV.v[id]||[])[BI]||null;
  function sum(L){const s={n:0,a:0,of:0,o:0,nv:0};L.forEach(o=>{const x=v(o.id);if(!x)return;s.n++;s.of+=x[0];s.o+=x[1];s.nv+=x[2];if(x[2]>0)s.a++});return s}
  R.bio=function(){
    const L=sel().filter(o=>v(o.id)),T=sum(L),p=mom(T.nv,T.o);
    const by={};L.forEach(o=>(by[o.sf]=by[o.sf]||[]).push(o));
    const rows=Object.entries(by).map(([sf,a])=>({sf,...sum(a)})).sort((a,b)=>b.nv-a.nv);
    const tr=rows.map(r=>{const q=mom(r.nv,r.o);return `<tr><td class="l"><b>${es(tc(r.sf))}</b></td><td>${r.a}<span class="mu">/${r.n}</span></td><td>${nf(r.o)}</td><td><b>${nf(r.nv)}</b></td><td class="${r.nv-r.o<0?'dn':'up'}">${r.nv-r.o>0?'+':''}${nf(r.nv-r.o)}</td><td class="${cl(q)}">${pf(q)}</td></tr>`}).join('');
    const LL=(mode==='dn'?L.filter(o=>v(o.id)[2]<v(o.id)[1]).sort((a,b)=>(v(a.id)[2]-v(a.id)[1])-(v(b.id)[2]-v(b.id)[1])):mode==='top'?L.filter(o=>v(o.id)[2]>0).sort((a,b)=>v(b.id)[2]-v(a.id)[2]):L.filter(o=>v(o.id)[2]===0&&v(o.id)[0]>0).sort((a,b)=>v(b.id)[0]-v(a.id)[0])).slice(0,100);
    const ol=LL.map((o,i)=>{const x=v(o.id),g=x[2]-x[1];return `<tr><td class="mu">${i+1}</td><td class="l"><b>${es(o.nm)}</b><br><span class="mu" style="font-size:11px">${o.id} · ${es(tc(o.sf).split(' ')[0])} · ${es(o.kec||'')}</span></td><td>${nf(x[0])}</td><td>${nf(x[1])}</td><td><b>${nf(x[2])}</b></td><td class="${g<0?'dn':'up'}">${g>0?'+':''}${nf(g)}</td></tr>`}).join('');
    const ids=new Set(L.map(o=>o.id)),FR=((D.FR||{}).rows||[]).filter(r=>ids.has(r[0])||!L.length).sort((a,b)=>b[4]-a[4]);
    const fr=FR.map((r,i)=>`<tr><td class="mu">${i+1}</td><td class="l"><b>${es(r[1])}</b><br><span class="mu" style="font-size:11px">${r[0]} · ${es(tc(r[2]).split(' ')[0])} · ${es(tc(r[3]))}</span></td><td><b>${nf(r[4])}</b></td><td>${r[4]>0?'<span class="up">✓ Aktif</span>':'<span class="dn">Belum</span>'}</td></tr>`).join('');
    return `<div class="card"><h3>🧬 Biometrik</h3><div class="sub">Program Biometrik per outlet (data CVM, ${es(lb())}) dibanding Oktober periode yang sama. Ikut filter SF/Kecamatan/PJP di atas.</div>
      <div class="kpi" style="margin-top:10px"><div class="k"><div class="t">Trx Nov (${es(lb())})</div><div class="v">${nf(T.nv)}</div><div class="s"><span class="${cl(p)}">${pf(p)}</span> vs ${nf(T.o)} Okt</div></div>
      <div class="k"><div class="t">Outlet aktif Nov</div><div class="v">${nf(T.a)} <span style="font-size:14px;color:var(--mu)">/ ${nf(T.n)}</span></div><div class="s">punya trx biometrik</div></div>
      <div class="k"><div class="t">Gap vs Okt</div><div class="v ${T.nv-T.o<0?'dn':'up'}">${T.nv-T.o>0?'+':''}${nf(T.nv-T.o)}</div><div class="s">periode sama</div></div>
      <div class="k"><div class="t">Okt full</div><div class="v">${nf(T.of)}</div><div class="s">target pembanding bulan penuh</div></div></div></div>
      <div class="card tw" style="margin-top:12px"><h3>Per SF</h3><table class="bi-t"><tr><th class="l">SF</th><th>Aktif</th><th>Okt</th><th>Nov</th><th>Gap</th><th>MoM</th></tr>${tr}
      <tr class="t"><td class="l">Total</td><td>${T.a}<span class="mu">/${T.n}</span></td><td>${nf(T.o)}</td><td>${nf(T.nv)}</td><td class="${T.nv-T.o<0?'dn':'up'}">${T.nv-T.o>0?'+':''}${nf(T.nv-T.o)}</td><td class="${cl(p)}">${pf(p)}</td></tr></table></div>
      <div class="card tw" style="margin-top:12px"><h3>Daftar outlet</h3>
      <div class="bi-ch"><button data-bim="dn" class="${mode==='dn'?'on':''}">Turun terbesar</button><button data-bim="top" class="${mode==='top'?'on':''}">Trx Nov terbanyak</button><button data-bim="off" class="${mode==='off'?'on':''}">Okt ada, Nov 0</button></div>
      <div class="sub">${LL.length} outlet${LL.length>=100?' (100 teratas)':''}</div>
      <table class="bi-t"><tr><th>#</th><th class="l">Outlet</th><th>Okt full</th><th>Okt</th><th>Nov</th><th>Gap</th></tr>${ol}</table></div>
      ${FR.length?`<div class="card tw" style="margin-top:12px"><h3>FR Biometric · Top 20 Nota</h3><div class="sub">Data ${D.FR.d} Nov (file Monitoring Klik Misi & FR).</div><table class="bi-t"><tr><th>#</th><th class="l">Outlet</th><th>FR</th><th>Status</th></tr>${fr}</table></div>`:''}`};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-bim]');if(!b)return;mode=b.dataset.bim;draw()});
  try{if(st.tab==='bio')draw()}catch(e){}
})();
