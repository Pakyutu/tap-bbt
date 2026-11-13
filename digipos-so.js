// Tab "Sell Out": cek SN VF via tsel.id/cekvoucher, tandai status per SN, rekap % sell out.
(function(){
  if(typeof R==='undefined')return;
  const K='so_vf1',nf=v=>Math.round(v).toLocaleString('id-ID'),es=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let S={rows:[['','']],ot:'',m:{},f:'all',pg:0};try{const s=JSON.parse(localStorage.getItem(K)||'null');if(s)S=Object.assign(S,s)}catch(e){}
  const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
  const cl=v=>String(v||'').replace(/\D/g,''),url=sn=>'https://tsel.id/cekvoucher?sn='+sn;
  function sns(){const o=[],seen=new Set();for(const r of S.rows){const a=cl(r[0]),b=cl(r[1])||a;if(!a||a.length!==b.length)continue;let A=BigInt(a),B=BigInt(b);if(B<A){const t=A;A=B;B=t}if(B-A>5000n)continue;for(let c=A;c<=B;c++){const s=c.toString().padStart(a.length,'0');if(!seen.has(s)){seen.add(s);o.push(s)}}}return o}
  const tb=document.getElementById('tabs');
  if(tb&&!tb.querySelector('[data-t="so"]')){const b=document.createElement('button');b.dataset.t='so';b.textContent='🧾 Sell Out';b.onclick=()=>{st.tab='so';draw()};tb.appendChild(b)}
  const css=document.createElement('style');css.textContent='.so-r{display:grid;grid-template-columns:1fr 1fr 36px;gap:6px;margin-top:6px}.so-r input,.so-i{width:100%;padding:9px 8px;border:1px solid var(--bd);border-radius:9px;background:var(--card);color:var(--tx);font:13.5px ui-monospace,monospace}.so-x{border:1px solid var(--bd);background:transparent;color:#c8102e;border-radius:8px;cursor:pointer}.so-b{padding:7px 12px;border-radius:9px;border:1px solid var(--bd);background:var(--soft);color:var(--tx);font-size:13px;cursor:pointer;font-weight:600}.so-b.p{background:#c8102e;color:#fff;border-color:#c8102e}.so-k{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}.so-k div{background:var(--soft);border-radius:10px;padding:8px;text-align:center}.so-k small{display:block;font-size:11px;color:var(--mu)}.so-k b{font-size:17px}.so-l{margin-top:8px}.so-s{display:flex;align-items:center;gap:6px;padding:7px 0;border-top:1px solid var(--bd);font:13px ui-monospace,monospace}.so-s .n{flex:1}.so-s a{color:#1565c0;font-weight:600;text-decoration:none;font-family:system-ui}.so-t{min-width:60px;border:1px solid var(--bd);background:transparent;border-radius:999px;padding:4px 9px;font-size:12px;cursor:pointer;color:var(--mu)}.so-t.y{background:rgba(15,138,82,.14);color:#0f8a52;border-color:transparent;font-weight:700}.so-t.n{background:rgba(200,16,46,.1);color:#c8102e;border-color:transparent;font-weight:700}.so-f{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}';document.head.appendChild(css);
  function body(){const L=sns(),y=L.filter(s=>S.m[s]==='y').length,n=L.filter(s=>S.m[s]==='n').length,c=L.length-y-n;
    let F=L;if(S.f==='y')F=L.filter(s=>S.m[s]==='y');else if(S.f==='n')F=L.filter(s=>S.m[s]==='n');else if(S.f==='c')F=L.filter(s=>!S.m[s]);
    const PG=100,pgs=Math.max(1,Math.ceil(F.length/PG));if(S.pg>=pgs)S.pg=pgs-1;const V=F.slice(S.pg*PG,S.pg*PG+PG);
    const nx=L.find(s=>!S.m[s]);
    return `<div class="so-k"><div><small>Total SN</small><b>${nf(L.length)}</b></div><div><small>Sudah SO</small><b style="color:#0f8a52">${nf(y)}</b></div><div><small>Belum SO</small><b style="color:#c8102e">${nf(n)}</b></div><div><small>% SO</small><b>${L.length?Math.round(y/L.length*100):0}%</b></div></div>
    ${c?`<div class="sub">${nf(c)} SN belum dicek.${nx?` <a href="${url(nx)}" target="_blank" rel="noopener" class="so-b p" data-nx="${nx}" style="text-decoration:none;display:inline-block;margin-left:4px">Cek berikutnya ↗ ${nx.slice(-6)}</a>`:''}</div>`:''}
    <div class="so-f">${[['all','Semua'],['c','Belum dicek'],['y','Sudah SO'],['n','Belum SO']].map(([k,t])=>`<button class="so-b${S.f===k?' p':''}" data-sf="${k}">${t}</button>`).join('')}<button class="so-b" data-sc="1">Salin ringkasan</button></div>
    <div class="so-l">${V.map(s=>`<div class="so-s"><span class="n">${s}</span><a href="${url(s)}" target="_blank" rel="noopener" data-op="${s}">Cek ↗</a><button class="so-t${S.m[s]==='y'?' y':''}" data-m="y" data-s="${s}">Sudah</button><button class="so-t${S.m[s]==='n'?' n':''}" data-m="n" data-s="${s}">Belum</button></div>`).join('')||'<div class="sub">Tidak ada SN.</div>'}</div>
    ${pgs>1?`<div class="so-f"><button class="so-b" data-pg="-1">‹</button><span class="sub" style="margin:6px 4px">Hal ${S.pg+1}/${pgs}</span><button class="so-b" data-pg="1">›</button></div>`:''}`}
  function rows(){return S.rows.map((r,i)=>`<div class="so-r" data-i="${i}"><input data-k="0" inputmode="numeric" placeholder="SN awal, mis. 800601367498" value="${es(r[0])}"><input data-k="1" inputmode="numeric" placeholder="SN akhir (opsional)" value="${es(r[1])}"><button class="so-x">✕</button></div>`).join('')}
  R.so=function(){return `<div class="card"><h3>🧾 Sell Out VF</h3><div class="sub">Masukkan SN / WL VF (awal–akhir atau satuan). Ketuk <b>Cek ↗</b> untuk buka tsel.id/cekvoucher, lalu tandai <b>Sudah</b> (sudah dipakai / SO) atau <b>Belum</b>. Tersimpan di HP ini.</div>
    <input class="so-i" id="soot" placeholder="Nama outlet (opsional)" value="${es(S.ot)}" style="font-family:system-ui;margin-top:4px">
    <div id="sorows">${rows()}</div><div class="so-f"><button class="so-b" data-add="1">＋ Tambah rentang</button><button class="so-b" data-clr="1">Reset tanda</button></div>
    <div id="sobody">${body()}</div></div>`};
  const rb=()=>{const b=document.getElementById('sobody');if(b)b.innerHTML=body()};
  document.addEventListener('input',e=>{const t=e.target;if(t.id==='soot'){S.ot=t.value;save();return}const w=t.closest&&t.closest('.so-r');if(!w)return;S.rows[+w.dataset.i][+t.dataset.k]=t.value;S.pg=0;save();rb()});
  document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#sorows,#sobody,[data-add],[data-clr]'))return;
    const x=t.closest('.so-x');if(x){S.rows.splice(+x.closest('.so-r').dataset.i,1);if(!S.rows.length)S.rows=[['','']];save();draw();return}
    if(t.dataset.add){S.rows.push(['','']);save();draw();return}
    if(t.dataset.clr){if(confirm('Hapus semua tanda Sudah/Belum?')){S.m={};save();rb()}return}
    if(t.dataset.m){const s=t.dataset.s;S.m[s]=S.m[s]===t.dataset.m?undefined:t.dataset.m;if(!S.m[s])delete S.m[s];save();rb();return}
    if(t.dataset.sf){S.f=t.dataset.sf;S.pg=0;save();rb();return}
    if(t.dataset.pg){S.pg=Math.max(0,S.pg+(+t.dataset.pg));rb();return}
    if(t.dataset.sc){const L=sns(),y=L.filter(s=>S.m[s]==='y'),n=L.filter(s=>S.m[s]==='n');const tx=`*Sell Out VF${S.ot?' – '+S.ot:''}*\nTotal SN: ${nf(L.length)}\nSudah SO: ${nf(y.length)} (${L.length?Math.round(y.length/L.length*100):0}%)\nBelum SO: ${nf(n.length)}${L.length-y.length-n.length?'\nBelum dicek: '+nf(L.length-y.length-n.length):''}${n.length?'\n\nSN belum SO:\n'+n.map((s,i)=>(i+1)+'. '+s).join('\n'):''}`;
      (navigator.clipboard?navigator.clipboard.writeText(tx):Promise.reject()).catch(()=>{const a=document.createElement('textarea');a.value=tx;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()});const o=t.textContent;t.textContent='Tersalin ✓';setTimeout(()=>t.textContent=o,1500)}
  });
  try{if(st.tab==='so')draw()}catch(e){}
})();
