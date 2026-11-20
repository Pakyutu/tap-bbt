// Tab "Sultan SO": Program Dealing Misi Sultan Spesial SO (target sell out perdana per outlet). Update: tools/sultan_so.py
// CSO.o[id] = [target qty, target revenue, capai qty, runrate]
const CSO={"d":"19 Nov","per":"16-19 Nov 2026","o":{"1200014507":[100,3000000,25,1.25],"1200014478":[100,3000000,1,0.05],"1200015214":[100,3000000,4,0.2],"1201111604":[50,1500000,0,0.0],"1200015518":[50,1500000,0,0.0],"1201019059":[50,1500000,0,0.0],"1201034972":[50,1500000,0,0.0],"1201075432":[50,1500000,0,0.0],"1200014398":[50,1500000,0,0.0],"1200014861":[50,1500000,6,0.6],"1200015379":[50,1500000,0,0.0],"1201034933":[50,1500000,0,0.0],"1201119781":[50,1500000,3,0.3],"1201033862":[50,1500000,2,0.2],"1200014489":[50,1500000,0,0.0],"1200014521":[50,1500000,0,0.0],"1200014194":[50,1500000,3,0.3],"1200015646":[50,1500000,0,0.0],"1201123269":[50,1500000,3,0.3],"1200015735":[50,1500000,2,0.2],"1200018431":[50,1500000,0,0.0],"1200015715":[50,1500000,0,0.0],"1200014230":[50,1500000,0,0.0]}};
(function(){
  if(typeof R==='undefined')return;
  const es=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),nf=v=>Math.round(v).toLocaleString('id-ID'),tc=s=>String(s).toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
  const pc=(a,b)=>b?Math.round(a/b*100):0,col=p=>p>=100?'var(--ok)':p>=50?'var(--wr)':'var(--dn)';
  let mode='nol';document.addEventListener('dgp-reset',()=>{mode='nol'});
  const tb=document.getElementById('tabs');
  if(tb&&!tb.querySelector('[data-t="sso"]')){const b=document.createElement('button');b.dataset.t='sso';b.textContent='👑 Sultan SO';b.onclick=()=>{st.tab='sso';draw()};const k=tb.querySelector('[data-t="cuan"]');k?tb.insertBefore(b,k):tb.appendChild(b)}
  if(typeof TABN!=='undefined')TABN.sso='Sultan Spesial SO';
  const css=document.createElement('style');css.textContent='.so-t{width:100%;border-collapse:collapse;font-size:12.5px}.so-t th{font-size:11px;color:var(--mu);font-weight:600;text-align:right;padding:5px 6px;border-bottom:1px solid var(--bd)}.so-t td{padding:6px;border-bottom:1px solid var(--bd);text-align:right;vertical-align:top}.so-t .l{text-align:left}.so-t tr.t td{font-weight:700;border-top:2px solid var(--bd)}.so-t .mu{color:var(--mu)}.so-ch{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.so-ch button{border:1px solid var(--bd);background:transparent;color:inherit;border-radius:999px;padding:5px 11px;font-size:12.5px;cursor:pointer}.so-ch button.on{background:var(--ac);color:#fff;border-color:var(--ac)}.so-bar{display:block;height:4px;border-radius:2px;background:var(--soft);margin-top:4px;overflow:hidden}.so-bar i{display:block;height:100%}';document.head.appendChild(css);
  const v=id=>CSO.o&&CSO.o[id];
  const list=()=>sel().filter(o=>v(o.id));
  function sum(L){const s={n:0,tg:0,ac:0,nol:0};L.forEach(o=>{const x=v(o.id);s.n++;s.tg+=x[0];s.ac+=x[2];if(!x[2])s.nol++});return s}
  function txt(L){const by={};L.filter(o=>!v(o.id)[2]).forEach(o=>(by[o.sf]=by[o.sf]||[]).push(o));
    return `*Sultan Spesial SO — outlet belum ada SO (${CSO.per||CSO.d})*\n`+Object.entries(by).map(([sf,a])=>`\n*${tc(sf)}* (${a.length})\n`+a.map((o,i)=>`${i+1}. ${o.nm} (${o.id}) · target ${v(o.id)[0]} pcs`).join('\n')).join('\n')}
  R.sso=function(){
    const L=list(),T=sum(L),by={};L.forEach(o=>(by[o.sf]=by[o.sf]||[]).push(o));
    const rows=Object.entries(by).map(([sf,a])=>({sf,...sum(a)})).sort((a,b)=>pc(b.ac,b.tg)-pc(a.ac,a.tg));
    const tr=rows.map(r=>{const p=pc(r.ac,r.tg);return `<tr><td class="l"><b>${es(tc(r.sf))}</b><i class="so-bar"><i style="width:${Math.min(p,100)}%;background:${col(p)}"></i></i></td><td>${r.n}</td><td>${nf(r.tg)}</td><td><b>${nf(r.ac)}</b></td><td style="color:${col(p)};font-weight:600">${p}%</td><td class="${r.nol?'dn':''}">${r.nol}</td></tr>`}).join('');
    const LL=(mode==='nol'?L.filter(o=>!v(o.id)[2]):L.filter(o=>v(o.id)[2])).sort((a,b)=>v(b.id)[2]/v(b.id)[0]-v(a.id)[2]/v(a.id)[0]||a.sf.localeCompare(b.sf));
    const ol=LL.map((o,i)=>{const x=v(o.id),p=pc(x[2],x[0]),rr=Math.round(x[3]*100);return `<tr><td class="mu">${i+1}</td><td class="l"><b>${es(o.nm)}</b><br><span class="mu" style="font-size:11px">${o.id} · ${es(tc(o.sf).split(' ')[0])} · ${es(o.pjp||'')}</span></td><td>${x[0]}</td><td><b>${x[2]}</b><br><span style="font-size:11px;color:${col(p)}">${p}%</span></td><td style="color:${col(rr)}">${rr}%</td></tr>`}).join('');
    return `<div class="card"><h3>👑 Dealing Misi Sultan Spesial SO</h3><div class="sub">Target sell out perdana per outlet. Periode data ${es(CSO.per||'')} (update ${es(CSO.d)}). Runrate = proyeksi capaian di akhir periode. Ikut filter SF/Kecamatan/PJP di atas.</div>
      <div class="kpi" style="margin-top:10px"><div class="k"><div class="t">Outlet peserta</div><div class="v">${T.n}</div><div class="s">${T.n-T.nol} sudah ada SO</div></div>
      <div class="k"><div class="t">Capaian SO</div><div class="v">${nf(T.ac)} <span style="font-size:14px;color:var(--mu)">/ ${nf(T.tg)}</span></div><div class="s" style="color:${col(pc(T.ac,T.tg))}">${pc(T.ac,T.tg)}% dari target</div></div>
      <div class="k"><div class="t">Belum ada SO</div><div class="v dn">${T.nol}</div><div class="s">outlet perlu didorong</div></div>
      <div class="k"><div class="t">Kurang</div><div class="v">${nf(Math.max(0,T.tg-T.ac))}</div><div class="s">pcs ke target</div></div></div></div>
      <div class="card tw" style="margin-top:12px"><h3>Per SF</h3><table class="so-t"><tr><th class="l">SF</th><th>Outlet</th><th>Target</th><th>Capai</th><th>%</th><th>0 SO</th></tr>${tr}
      <tr class="t"><td class="l">Total</td><td>${T.n}</td><td>${nf(T.tg)}</td><td>${nf(T.ac)}</td><td>${pc(T.ac,T.tg)}%</td><td>${T.nol}</td></tr></table></div>
      <div class="card tw" style="margin-top:12px"><h3>Daftar outlet</h3>
      <div class="so-ch"><button data-som="nol" class="${mode==='nol'?'on':''}">Belum ada SO (${T.nol})</button><button data-som="ada" class="${mode==='ada'?'on':''}">Sudah ada SO (${T.n-T.nol})</button><button data-soc="1" style="margin-left:auto">📋 Salin belum SO</button></div>
      <table class="so-t"><tr><th>#</th><th class="l">Outlet</th><th>Target</th><th>Capai</th><th>Runrate</th></tr>${ol||'<tr><td colspan="5" class="mu l">Tidak ada.</td></tr>'}</table></div>`};
  if(R.tem){const oT=R.tem;R.tem=function(){const h=oT.apply(this,arguments);try{const L=list();if(!L.length)return h;const T=sum(L);
    return h+`<div class="card" style="margin-top:12px"><h3>Temuan Sultan Spesial SO · ${es(CSO.d)}</h3><ul class="f"><li>Capaian SO <b>${nf(T.ac)} dari ${nf(T.tg)} pcs</b> (${pc(T.ac,T.tg)}%). <b class="dn">${T.nol}</b> dari ${T.n} outlet peserta belum ada SO sama sekali — daftar di tab 👑 Sultan SO.</li></ul></div>`}catch(e){return h}}}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-som]');if(b){mode=b.dataset.som;draw();return}
    const c=e.target.closest('[data-soc]');if(c){const t=txt(list());(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{c.textContent='✓ Tersalin';setTimeout(()=>c.textContent='📋 Salin belum SO',1500)}).catch(()=>{prompt('Salin teks:',t)})}});
  try{if(st.tab==='sso')draw()}catch(e){}
})();
