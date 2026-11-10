// Tambahan dashboard Penjualan: tren bulanan per petugas (tab Petugas) + inject per validity (tab Stok)
// Data: SURYA "Penjualan Bulanan per Petugas", "Inject Bulanan", "MoM per Validity". Ganti objek X untuk update.
const X={"cut": 9, "mon": ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov"], "TM": [212811, 211814, 218704, 193844, 202838, 213662, 220070, 216644, 228830, 273039, 55383], "TI": [291328, 324822, 169558, 251850, 210150, 250050, 265585, 276559, 255150, 215415, 80102], "PM": {"AFIF ALWAN SYAHRIDHO": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1875], "AHMAD SYARIF RAMBE": [21501, 17763, 17146, 15921, 14401, 13960, 14658, 11630, 12421, 11870, 3874], "ASMAN BAGAN BATU": [10361, 5702, 2358, 6869, 17849, 12752, 7548, 83671, 101377, 129913, 16630], "BO BAGAN BATU": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "CS BAGAN BATU": [10001, 8255, 10633, 7850, 7470, 9115, 8140, 8724, 6914, 10112, 2073], "DS - AFIF ALWAN SYAHRIDO": [0, 0, 0, 0, 0, 0, 0, 276, 0, 0, 0], "DS - AGUS DWI SETIAWAN": [0, 0, 0, 0, 0, 0, 0, 0, 223, 85, 24], "DS - ASTRID MAWARDAH": [0, 0, 0, 0, 0, 0, 0, 0, 254, 293, 106], "DS - QUR'ANI SIFA WULANDARI": [0, 0, 0, 0, 0, 0, 0, 500, 547, 373, 15], "DS - RASYA SALSABILLA": [0, 0, 0, 0, 0, 0, 0, 347, 556, 619, 181], "DS - SEFTIA ALYA LESTARI": [0, 0, 0, 0, 0, 0, 0, 200, 210, 440, 92], "DS BAGAN BATU": [270, 432, 409, 477, 1037, 1110, 1330, 96, 0, 0, 0], "GUSTI EDWIN": [22304, 23180, 19919, 22042, 20012, 23779, 22713, 18310, 16520, 18851, 4129], "HELPER - AFIF ALWAN SYAHRIDHO": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "HELPER - TENGKU MHD. SOBBRY AMRI": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "HERMAN SYAHPUTRA HARAHAP": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 770], "KHOIRUL IHSAN HARAHAP": [21528, 21568, 23242, 21826, 19824, 20089, 21297, 20691, 17832, 19259, 6442], "MULKAN AZHAR": [33471, 34707, 27494, 30739, 32522, 37338, 33705, 20401, 23529, 21982, 7095], "RINALDI AL ISLAMI": [29887, 27852, 34627, 21405, 26925, 27912, 29920, 23962, 23612, 21010, 1087], "RIO PRANATA DANI": [18667, 28434, 32756, 25722, 17024, 18220, 30411, 19988, 13387, 16429, 4848], "TEGUH ARIWIBOWO": [44821, 43921, 50120, 40993, 45774, 49387, 50348, 7848, 11448, 21803, 4546], "TENGKU MUHAMMAD SOBRY AMRI": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1596]}, "INJ": {"UNLIMITED 24 JAM": [0, 0, 0, 0, 0, 0, 0, 0, 0, 105, 0], "UNLIMITED 48 JAM": [0, 0, 0, 0, 0, 0, 0, 0, 0, 105, 0], "1 HARI": [600, 2100, 600, 2400, 3750, 6000, 4965, 4144, 3150, 9000, 5400], "2 HARI": [49800, 76842, 59400, 96000, 60000, 73800, 73490, 64293, 39000, 49200, 6000], "3 HARI": [131795, 91431, 96050, 98400, 96600, 125400, 91800, 125276, 145974, 88744, 27601], "5 HARI": [103209, 150025, 12308, 51000, 46800, 41100, 89700, 79084, 62826, 67961, 39301], "7 HARI": [5774, 3500, 1200, 3600, 2700, 3600, 5360, 3612, 4200, 300, 1800], "14 HARI": [0, 0, 0, 0, 0, 0, 0, 150, 0, 0, 0], "28 HARI": [0, 0, 0, 450, 300, 150, 270, 0, 0, 0, 0], "30 HARI": [150, 924, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "SV": {"m1": {"1D": 1002, "2D": 13971, "3D": 26436, "5D": 21976, "7D": 615, "28D": 28, "U24": 0, "U48": 0}, "mtd": {"1D": 2501, "2D": 8087, "3D": 24121, "5D": 19891, "7D": 772, "28D": 7, "U24": 2, "U48": 2}, "d": 9}};
(function(){
  const nf=v=>Math.round(v).toLocaleString('id-ID');
  const kf=v=>Math.abs(v)>=1000?(v/1000).toLocaleString('id-ID',{maximumFractionDigits:v>=10000?0:1})+' rb':nf(v);
  const es=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const tc=s=>s.toLowerCase().replace(/(^|[\s(-])(\w)/g,(m,p,c)=>p+c.toUpperCase()).replace(/^Ds - /,'DS ').replace(/^Ds /,'DS ').replace(/^Cs /,'CS ').replace(/^Asman /,'Asman ');
  const PAL=['#c8102e','#2f6fdb','#1d9a6c','#e08a00','#7b4fd6','#0f9bb5','#d4508a','#8a8780'];
  const M=X.mon, NI=M.length-1, OK=NI-1; // index Okt
  const st=document.createElement('style');
  st.textContent=`
.xk-card{position:relative;overflow:hidden}
.xk-hd{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:10px}
.xk-hd h3{margin:0}.xk-tag{font-size:11px;padding:3px 8px;border-radius:999px;background:var(--soft);color:var(--mu);white-space:nowrap}
.xk-hm{border-collapse:separate;border-spacing:2px;width:100%;font-size:11.5px}
.xk-hm th{font-weight:500;color:var(--mu);padding:4px 3px;text-align:center;position:static;background:none}
.xk-hm th:first-child,.xk-hm td:first-child{text-align:left;white-space:nowrap;padding-right:8px;font-size:12.5px}
.xk-hm td.c{text-align:center;padding:6px 2px;border-radius:5px;font-variant-numeric:tabular-nums;min-width:38px;border:0}
.xk-hm td.nov{outline:1.5px dashed var(--mu);outline-offset:-2px}
.xk-hm tr:hover td.c{filter:brightness(.93)}
.xk-hm td.sp{padding:0 4px;border:0}
.xk-ins{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin:12px 0 4px}
.xk-in{border:1px solid var(--bd);border-radius:12px;padding:10px 12px;background:var(--soft)}
.xk-in b{display:block;font-size:13px;margin-bottom:2px}.xk-in span{font-size:12px;color:var(--mu);line-height:1.4}
.xk-in i{font-style:normal;font-weight:600}
.xk-lg{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:11.5px;color:var(--mu);margin-top:8px}
.xk-lg span{display:inline-flex;align-items:center;gap:5px}.xk-lg i{width:10px;height:10px;border-radius:3px;display:inline-block}
.xk-bar{height:8px;border-radius:4px;background:var(--soft);overflow:hidden;display:flex}
.xk-bar>i{display:block;height:100%}
.xk-vt td,.xk-vt th{font-size:12.5px}
@keyframes xkup{from{transform:scaleY(0)}to{transform:scaleY(1)}}
.xk-anim rect.b{transform-box:fill-box;transform-origin:bottom;animation:xkup .6s cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion:reduce){.xk-anim rect.b{animation:none}}
`;
  document.head.appendChild(st);

  // warna heatmap: intensitas relatif terhadap maksimum baris
  const heat=(v,mx)=>{if(!v)return 'background:var(--soft);color:var(--mu)';const t=Math.min(1,v/mx);const a=(.10+t*.80).toFixed(2);return `background:rgba(200,16,46,${a});color:${t>.55?'#fff':'var(--tx)'}`};
  const spark=(a,w=86,h=24)=>{const mx=Math.max(...a,1);const pts=a.map((v,i)=>[(i/(a.length-1))*(w-4)+2,h-2-(v/mx)*(h-6)]);
    const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');const l=pts[pts.length-1];
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="var(--ac)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="${l[0]}" cy="${l[1]}" r="2.4" fill="var(--ac)"/></svg>`};

  function petTrend(){
    const all=Object.entries(X.PM).filter(([n,a])=>a.some(v=>v)&&!/^(BO |HELPER)/.test(n));const big=a=>Math.max(...a.slice(0,NI),a[NI]/X.cut*31)>=1000;const rows=all.filter(([n,a])=>big(a)),hid=all.filter(([n,a])=>!big(a));
    const full=rows.map(([n,a])=>({n,a,m:a.slice(0,OK+1)})).sort((p,q)=>q.a[OK]-p.a[OK]);
    // sorotan
    const base=r=>{const s=r.a.slice(0,7).filter(v=>v);return s.length?s.reduce((x,y)=>x+y,0)/s.length:0};
    const ch=full.filter(r=>base(r)>3000).map(r=>({r,b:base(r),d:r.a[OK]-base(r),p:r.a[OK]/base(r)-1}));
    const dn=[...ch].sort((p,q)=>p.p-q.p)[0],up=[...ch].sort((p,q)=>q.p-p.p)[0];
    const top=full[0],shr=top.a[OK]/X.TM[OK];
    const nov=X.PM, nRun=r=>r.a[NI]/X.cut*31;
    const sv=full.filter(r=>r.a[OK]>3000).map(r=>({r,p:nRun(r)/r.a[OK]-1})).sort((p,q)=>p.p-q.p);
    const ins=`<div class="xk-ins">
      <div class="xk-in"><b>📉 Turun paling dalam</b><span><i>${es(tc(dn.r.n))}</i>: rata-rata Jan–Jul ${kf(dn.b)}/bln, Okt tinggal ${kf(dn.r.a[OK])} (${Math.round(dn.p*100)}%).</span></div>
      <div class="xk-in"><b>📈 Naik paling tinggi</b><span><i>${es(tc(up.r.n))}</i>: dari rata-rata ${kf(up.b)}/bln ke ${kf(up.r.a[OK])} di Okt (+${Math.round(up.p*100)}%).</span></div>
      <div class="xk-in"><b>🎯 Ketergantungan</b><span><i>${es(tc(top.n))}</i> menyumbang ${Math.round(shr*100)}% penjualan TAP bulan Okt.</span></div>
      <div class="xk-in"><b>⏱️ Laju Nov (proyeksi 31 hari)</b><span>Paling tertinggal dari Okt: <i>${es(tc(sv[0].r.n))}</i> (${kf(nRun(sv[0].r))} vs ${kf(sv[0].r.a[OK])}, ${Math.round(sv[0].p*100)}%).</span></div>
    </div>`;
    const th='<tr><th>Petugas</th>'+M.map((m,i)=>`<th>${m}${i===NI?'*':''}</th>`).join('')+'<th>Tren</th></tr>';
    const body=full.map(r=>{const mx=Math.max(...r.m,1);
      return `<tr><td>${es(tc(r.n))}</td>${r.a.map((v,i)=>`<td class="c${i===NI?' nov':''}" style="${heat(i===NI?v/X.cut*31:v,mx)}" title="${M[i]}: ${nf(v)}${i===NI?' (1–'+X.cut+' Nov)':''}">${v?kf(v):'–'}</td>`).join('')}<td class="sp">${spark(r.m)}</td></tr>`}).join('');
    // porsi per bulan (stacked 100%)
    const topN=full.slice(0,7).map(r=>r.n);
    const seg=i=>{const tot=X.TM[i]||1;let o=topN.map((n,k)=>`<i style="width:${(X.PM[n][i]/tot*100).toFixed(2)}%;background:${PAL[k]}" title="${es(tc(n))} ${M[i]}: ${Math.round(X.PM[n][i]/tot*100)}%"></i>`).join('');
      const rest=tot-topN.reduce((s,n)=>s+X.PM[n][i],0);return o+`<i style="width:${(rest/tot*100).toFixed(2)}%;background:${PAL[7]}" title="Lainnya ${Math.round(rest/tot*100)}%"></i>`};
    const stack=`<table class="xk-vt" style="width:100%;table-layout:fixed"><tr><th style="text-align:left;width:44px;padding-left:0">Bulan</th><th style="text-align:left">Porsi per petugas</th><th style="width:58px;padding-right:0">Total</th></tr>${M.map((m,i)=>`<tr><td style="text-align:left">${m}${i===NI?'*':''}</td><td><div class="xk-bar">${seg(i)}</div></td><td>${kf(X.TM[i])}</td></tr>`).join('')}</table>
      <div class="xk-lg">${topN.map((n,k)=>`<span><i style="background:${PAL[k]}"></i>${es(tc(n))}</span>`).join('')}<span><i style="background:${PAL[7]}"></i>Lainnya</span></div>`;
    return `<div class="card xk-card" style="margin-top:14px"><div class="xk-hd"><h3>Tren bulanan per petugas · PV 2026</h3><span class="xk-tag">SURYA · cutoff ${X.cut} Nov</span></div>
      <div class="sub">Warna makin merah = makin mendekati bulan terbaik petugas itu. *Nov = 1–${X.cut} Nov; warnanya memakai laju proyeksi 31 hari.</div>${ins}
      <div class="tw" style="margin-top:6px"><table class="xk-hm">${th}${body}</table></div>${hid.length?`<div class="sub">Tidak ditampilkan (penjualan kecil, maks. di bawah 1 rb/bulan): ${hid.map(([n])=>es(tc(n))).join(', ')}.</div>`:''}</div>
      <div class="card" style="margin-top:12px"><h3>Siapa yang menggerakkan TAP tiap bulan</h3>${stack}</div>`;
  }

  function combo(){ // bar inject + garis penjualan
    const W=640,H=200,pl=8,pr=8,pt=14,pb=26,n=M.length,mx=Math.max(...X.TI,...X.TM)*1.08,bw=(W-pl-pr)/n;
    const y=v=>pt+(H-pt-pb)*(1-v/mx);
    let s=`<svg class="xk-anim" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Inject vs penjualan bulanan">`;
    [0.25,.5,.75,1].forEach(t=>{const yy=y(mx/1.08*t);s+=`<line x1="${pl}" x2="${W-pr}" y1="${yy}" y2="${yy}" stroke="var(--bd)"/>`});
    X.TI.forEach((v,i)=>{const x=pl+i*bw+bw*.18,w=bw*.64;s+=`<rect class="b" style="animation-delay:${i*35}ms" x="${x}" y="${y(v)}" width="${w}" height="${Math.max(0,H-pb-y(v))}" rx="3" fill="${i===NI?'var(--mu)':'var(--bar)'}" opacity="${i===NI?.55:.85}"><title>Inject ${M[i]}: ${nf(v)}</title></rect>`;
      s+=`<text x="${pl+i*bw+bw/2}" y="${H-8}" text-anchor="middle" font-size="11" fill="var(--mu)">${M[i]}${i===NI?'*':''}</text>`});
    const pts=X.TM.map((v,i)=>[pl+i*bw+bw/2,y(v)]);
    s+=`<path d="${pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ')}" fill="none" stroke="var(--ac)" stroke-width="2.4" stroke-linejoin="round"/>`;
    pts.forEach((p,i)=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="3.6" fill="var(--card)" stroke="var(--ac)" stroke-width="2"><title>Penjualan ${M[i]}: ${nf(X.TM[i])}</title></circle>`);
    return s+'</svg>';
  }

  function injCard(){
    const ok=OK,ri=X.TI[ok]/X.TM[ok],rn=X.TI[NI]/X.TM[NI];
    const cum=a=>a.slice(0,OK+1).reduce((x,y)=>x+y,0),gap=cum(X.TI)-cum(X.TM);
    const V=Object.entries(X.INJ).filter(([n,a])=>a.some(v=>v));
    const vt=V.map(([n,a])=>{const mx=Math.max(...a,1);return `<tr><td>${es(n.replace(' HARI',' hari').replace('UNLIMITED','Unl.'))}</td>${a.map((v,i)=>`<td class="c${i===NI?' nov':''}" style="${heat(v,mx)}" title="${M[i]}: ${nf(v)}">${v?kf(v):'–'}</td>`).join('')}</tr>`}).join('');
    // inject vs jual per validity bulan berjalan
    const map={'1D':'1 HARI','2D':'2 HARI','3D':'3 HARI','5D':'5 HARI','7D':'7 HARI','28D':'28 HARI','U24':'UNLIMITED 24 JAM','U48':'UNLIMITED 48 JAM'};
    const rv=Object.keys(map).map(k=>({k,j:X.SV.mtd[k]||0,m1:X.SV.m1[k]||0,i:(X.INJ[map[k]]||[])[NI]||0})).filter(r=>r.j||r.i||r.m1);
    const mxv=Math.max(...rv.map(r=>Math.max(r.j,r.i)),1);
    const vrow=rv.map(r=>{const net=r.i-r.j;const g=r.m1?Math.round((r.j/r.m1-1)*100):null;
      return `<tr><td style="text-align:left">${r.k.replace('U24','Unl. 24 jam').replace('U48','Unl. 48 jam')}</td><td>${nf(r.j)}</td><td class="${g==null?'mu':g<0?'dn':'up'}">${g==null?'–':(g>0?'+':'')+g+'%'}</td><td>${nf(r.i)}</td><td class="${net<0?'dn':'up'}">${net>0?'+':net<0?'−':''}${nf(Math.abs(net))}</td>
      <td style="width:30%"><div style="display:grid;gap:3px"><div class="xk-bar"><i style="width:${r.j/mxv*100}%;background:var(--ac)"></i></div><div class="xk-bar"><i style="width:${r.i/mxv*100}%;background:var(--bar)"></i></div></div></td></tr>`}).join('');
    const drain=rv.filter(r=>r.j>500&&r.i<r.j*.2).map(r=>r.k);
    return `<div class="card xk-card" style="margin-top:14px"><div class="xk-hd"><h3>Inject vs penjualan PV · 2026</h3><span class="xk-tag">SURYA · cutoff ${X.cut} Nov</span></div>
      <div class="kpi"><div class="k"><div class="t">Inject 1–${X.cut} Nov</div><div class="v">${nf(X.TI[NI])}</div><div class="s">${rn.toFixed(2).replace('.',',')}× penjualan (${nf(X.TM[NI])})</div></div>
      <div class="k"><div class="t">Inject Okt</div><div class="v">${nf(X.TI[ok])}</div><div class="s">${ri.toFixed(2).replace('.',',')}× penjualan Okt (${nf(X.TM[ok])})</div></div>
      <div class="k"><div class="t">Selisih kumulatif Jan–Okt</div><div class="v ${gap>0?'':'dn'}">${gap>0?'+':'−'}${nf(Math.abs(gap))}</div><div class="s">inject − penjualan</div></div></div>
      ${combo()}<div class="xk-lg"><span><i style="background:var(--bar)"></i>Inject</span><span><i style="background:var(--ac);border-radius:50%"></i>Penjualan</span><span>*Nov = 1–${X.cut} Nov</span></div>
      <div class="sub" style="margin-top:6px">${(()=>{const o=M.slice(0,NI).filter((m,i)=>X.TM[i]>X.TI[i]);return o.length?`Bulan penjualan melebihi inject (stok terkuras): <b>${o.join(', ')}</b>. `:'Inject selalu di atas penjualan sepanjang tahun. '})()}${X.TM[ok]>X.TI[ok]?`Okt: jual ${kf(X.TM[ok])} vs inject ${kf(X.TI[ok])}. `:''}Nov 1–${X.cut}: inject ${rn.toFixed(1).replace('.',',')}× penjualan.</div></div>
      <div class="card tw" style="margin-top:12px"><h3>Inject vs jual per validity · 1–${X.cut} Nov</h3>
      <table class="xk-vt"><tr><th style="text-align:left">Validity</th><th>Jual</th><th>vs 1–${X.cut} Okt</th><th>Inject</th><th>Net stok</th><th></th></tr>${vrow}</table>
      <div class="xk-lg"><span><i style="background:var(--ac)"></i>Jual</span><span><i style="background:var(--bar)"></i>Inject</span></div>
      ${drain.length?`<div class="note" style="margin-top:10px">⚠️ <b>${drain.join(', ')}</b> laku tapi hampir tidak di-inject bulan ini, jadi stoknya terus terkuras. Cek ketersediaan sebelum outlet kehabisan.</div>`:''}</div>
      <div class="card tw" style="margin-top:12px"><h3>Inject bulanan per validity</h3><table class="xk-hm"><tr><th>Validity</th>${M.map((m,i)=>`<th>${m}${i===NI?'*':''}</th>`).join('')}</tr>${vt}</table>
      <div class="sub">Warna relatif terhadap bulan tertinggi tiap validity.</div></div>`;
  }

  const oPet=window.rPet,oStok=window.rStok;
  if(typeof oPet==='function')window.rPet=function(){oPet.apply(this,arguments);try{if(S.prod==='PV')document.getElementById('p-pet').insertAdjacentHTML('beforeend',petTrend())}catch(e){console.error(e)}};
  if(typeof oStok==='function')window.rStok=function(){oStok.apply(this,arguments);try{document.getElementById('p-stok').insertAdjacentHTML('beforeend',injCard())}catch(e){console.error(e)}};
  try{rPet()}catch(e){}
  try{const ps=document.getElementById('p-stok');if(ps&&ps.innerHTML&&!ps.querySelector('.xk-card'))ps.insertAdjacentHTML('beforeend',injCard())}catch(e){console.error(e)}
})();
