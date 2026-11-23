// Tab "Target SF": target bulanan VF per SF = jumlah target semua validity (SURYA, data Stock on Hand per validity X.SOHV).
// Target/hari normal = target ÷ total HK bulan; Kejar/hari = sisa target ÷ sisa HK (angka SURYA); Rata jual/hari = MTD ÷ HK lewat.
(function(){if(window.TAPSEL&&TAPSEL!=="BBT")return;
  if(typeof X==='undefined'||!X.SOHV)return;
  const V=X.SOHV,VL=[1,2,3,5,7,28],nf=v=>Math.round(v).toLocaleString('id-ID'),es=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const hkN=(d)=>{let n=0;for(let i=1;i<=d;i++){if(new Date(2026,10,i).getDay()!==0)n++}return n};
  const HKT=hkN(30),HKL=hkN(V.ad),HKS=V.sisa;
  const tc=s=>s.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()),sn=s=>tc(s).split(' ').slice(0,2).join(' ');
  const by={};V.rows.forEach(([sf,v,tg,td,act])=>{(by[sf]=by[sf]||{sf,c:{},tg:0,td:0,act:0});by[sf].c[v]={tg,td,act};by[sf].tg+=tg;by[sf].td+=td;by[sf].act+=act});
  const SF=Object.values(by).sort((a,b)=>b.tg-a.tg);
  const T={tg:0,td:0,act:0,c:{}};SF.forEach(r=>{T.tg+=r.tg;T.td+=r.td;T.act+=r.act;VL.forEach(v=>{const c=r.c[v];if(!c)return;const t=T.c[v]=T.c[v]||{tg:0,td:0,act:0};t.tg+=c.tg;t.td+=c.td;t.act+=c.act})});
  const pc=(a,b)=>b?Math.round(a/b*100):0,exp=pc(HKL,HKT);
  const col=p=>p>=exp?'#0f8a52':p>=exp*0.8?'#b7791f':'#c8102e';
  let mode='sf';
  const css=document.createElement('style');css.textContent='.tg-t{width:100%;border-collapse:collapse;font-size:13px}.tg-t th,.tg-t td{padding:7px 8px;border-bottom:1px solid var(--bd,#e3e8f0);text-align:right;white-space:nowrap}.tg-t th{font-size:11.5px;color:var(--mu,#5b6b85);font-weight:600}.tg-t td:first-child,.tg-t th:first-child{text-align:left;position:sticky;left:0;background:var(--card,#fff)}.tg-t tr.tt td{font-weight:700;border-top:2px solid var(--bd,#e3e8f0)}.tg-w{overflow-x:auto;margin-top:8px}.tg-p{font-weight:700}.tg-s{display:block;font-size:11px;color:var(--mu,#5b6b85);font-weight:400}.tg-b{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.tg-b button{border:1px solid var(--bd,#e3e8f0);background:transparent;color:inherit;border-radius:999px;padding:6px 13px;font-size:13px;cursor:pointer}.tg-b button.on{background:#c8102e;color:#fff;border-color:#c8102e;font-weight:600}';document.head.appendChild(css);
  const tabs=document.getElementById('tabs'),wrap=document.getElementById('p-tem');
  if(tabs&&!tabs.querySelector('[data-t="tgt"]')){const b=document.createElement('button');b.dataset.t='tgt';b.textContent='🎯 Target SF';tabs.insertBefore(b,tabs.querySelector('[data-t="tem"]'))}
  if(wrap&&!document.getElementById('p-tgt')){const p=document.createElement('section');p.className='panel';p.id='p-tgt';wrap.parentNode.insertBefore(p,wrap)}
  const pcell=(a,t)=>{const p=pc(a,t);return `<span class="tg-p" style="color:${col(p)}">${p}%</span>`};
  function sfTable(){return `<div class="tg-w"><table class="tg-t"><tr><th>SF</th><th>Target bulan</th><th>Jual MTD</th><th>Ach</th><th>Sisa</th><th>Target/hari</th><th>Kejar/hari</th><th>Rata jual/hari</th></tr>
    ${SF.map(r=>`<tr><td>${es(sn(r.sf))}</td><td>${nf(r.tg)}</td><td>${nf(r.act)}</td><td>${pcell(r.act,r.tg)}</td><td>${nf(Math.max(0,r.tg-r.act))}</td><td>${nf(r.tg/HKT)}</td><td><b>${nf(r.td)}</b></td><td>${nf(r.act/HKL)}</td></tr>`).join('')}
    <tr class="tt"><td>TAP BBT</td><td>${nf(T.tg)}</td><td>${nf(T.act)}</td><td>${pcell(T.act,T.tg)}</td><td>${nf(Math.max(0,T.tg-T.act))}</td><td>${nf(T.tg/HKT)}</td><td>${nf(T.td)}</td><td>${nf(T.act/HKL)}</td></tr></table></div>`}
  function valTable(){const cell=c=>c&&c.tg?`${nf(c.act)}/${nf(c.tg)} ${pcell(c.act,c.tg)}<span class="tg-s">target/hari ${nf(c.tg/HKT)} · kejar ${nf(c.td)}</span>`:c&&c.act?`${nf(c.act)} <span class="tg-s">tanpa target</span>`:'–';
    return `<div class="tg-w"><table class="tg-t"><tr><th>SF</th>${VL.map(v=>`<th>${v} hari</th>`).join('')}</tr>
    ${SF.map(r=>`<tr><td>${es(sn(r.sf))}</td>${VL.map(v=>`<td>${cell(r.c[v])}</td>`).join('')}</tr>`).join('')}
    <tr class="tt"><td>TAP BBT</td>${VL.map(v=>`<td>${cell(T.c[v])}</td>`).join('')}</tr></table></div>`}
  function waTxt(){return `*Target VF per SF – TAP BBT*\nData SURYA s/d ${V.ad} Nov · HK ${HKL}/${HKT} (ideal ${exp}%)\n\n`+SF.map((r,i)=>`${i+1}. ${tc(r.sf)}\nTarget ${nf(r.tg)} · MTD ${nf(r.act)} (${pc(r.act,r.tg)}%)\nTarget/hari ${nf(r.tg/HKT)} · kejar/hari ${nf(r.td)}\n`+VL.filter(v=>r.c[v]&&r.c[v].tg).map(v=>{const c=r.c[v];return `  ${v}H: ${nf(c.act)}/${nf(c.tg)} (${pc(c.act,c.tg)}%) · kejar ${nf(c.td)}/hari`}).join('\n')).join('\n\n')+`\n\nTotal: ${nf(T.act)}/${nf(T.tg)} (${pc(T.act,T.tg)}%) · kejar ${nf(T.td)}/hari`}
  function draw(){const p=document.getElementById('p-tgt');if(!p)return;
    p.innerHTML=`<div class="card"><h3 style="margin:0 0 4px">🎯 Target VF per SF · November</h3><div class="sub">Target bulanan = jumlah target semua validity dari SURYA. Data jual s/d <b>${V.ad} Nov</b> · HK lewat ${HKL} dari ${HKT} (ideal ach <b>${exp}%</b>).</div>
      <div class="tg-b">${[['sf','Per SF'],['val','Per validity']].map(([k,t])=>`<button data-tgm="${k}" class="${mode===k?'on':''}">${t}</button>`).join('')}<button data-tgw="1">Teks WA</button></div>
      ${mode==='sf'?sfTable():valTable()}
      <div class="sub" style="margin-top:8px"><b>Target/hari</b> = target bulan ÷ ${HKT} HK. <b>Kejar/hari</b> = sisa target ÷ ${HKS} HK tersisa (angka SURYA). Warna Ach: hijau ≥ ideal, kuning ≥80% ideal, merah di bawahnya.</div></div>`}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-tgm],[data-tgw]');if(!b)return;if(b.dataset.tgm){mode=b.dataset.tgm;draw()}else if(typeof showText==='function')showText(waTxt(),'Target VF per SF')});
  const oR=window.render;if(typeof oR==='function'){window.render=function(){const r=oR.apply(this,arguments);draw();return r}}
  draw();try{if(typeof S!=='undefined'&&S.tab==='tgt')render()}catch(e){}
})();
