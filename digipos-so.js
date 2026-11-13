// Tab "Sell Out": VF = QR cek voucher (tsel.id/cekvoucher); SA = barcode kode SA (awalan+SN+akhiran) per SN, tandai status per SN, rekap % sell out.
(function(){
  if(typeof R==='undefined')return;
  let MD='vf';try{MD=localStorage.getItem('so_md')==='sa'?'sa':'vf'}catch(e){}
  const K=()=>MD==='sa'?'so_sa1':'so_vf1',nf=v=>Math.round(v).toLocaleString('id-ID'),es=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let S;function load(){S={rows:[['','']],ot:'',m:{},f:'all',pg:0,pre:'S236x',suf:'00000823'};try{const s=JSON.parse(localStorage.getItem(K())||'null');if(s)S=Object.assign(S,s)}catch(e){}}load();
  const save=()=>{try{localStorage.setItem(K(),JSON.stringify(S))}catch(e){}};
  const cl=v=>String(v||'').replace(/\D/g,''),url=sn=>'https://tsel.id/cekvoucher?sn='+sn,code=sn=>MD==='vf'?url(sn):(S.pre||'')+sn+(S.suf||''),PN=()=>MD==='vf'?'VF':'SA';
  function sns(){const o=[],seen=new Set();for(const r of S.rows){const a=cl(r[0]),b=cl(r[1])||a;if(!a||a.length!==b.length)continue;let A=BigInt(a),B=BigInt(b);if(B<A){const t=A;A=B;B=t}if(B-A>5000n)continue;for(let c=A;c<=B;c++){const s=c.toString().padStart(a.length,'0');if(!seen.has(s)){seen.add(s);o.push(s)}}}return o}
  const ov=document.createElement('div');ov.id='soqr';ov.style.cssText='position:fixed;inset:0;z-index:9999;background:#fff;color:#000;display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center';document.body.appendChild(ov);
  let cur='';
  function showQR(s){cur=s;const L=sns(),i=L.indexOf(s),m=S.m[s];
    ov.innerHTML=`<button data-q="x" style="position:absolute;top:calc(14px + env(safe-area-inset-top,0px));left:14px;border:1px solid #bbb;background:#e8e8e8;color:#000;font-weight:700;border-radius:10px;padding:9px 16px;font-size:16px">✕ Tutup</button>
      <div style="font:600 14px system-ui;color:#555">${S.ot?es(S.ot)+' · ':''}${PN()} · SN ${i+1} dari ${L.length}</div>
      ${MD==='vf'?`<div style="width:min(80vw,380px);margin:12px auto">${QR.svg(url(s),'100%')}</div>`:`<div style="width:min(94vw,560px);margin:16px auto">${bcSvg(code(s),140)}</div>`}
      <div style="font:700 22px ui-monospace,monospace;letter-spacing:1px">${s}</div>
      <div style="font-size:12px;color:#777;margin-top:2px;word-break:break-all">${code(s)}</div>
      <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap;justify-content:center">
        <button data-q="p" style="padding:11px 16px;border-radius:10px;border:1px solid #ddd;background:#f4f4f4;color:#000;font-weight:700;font-size:18px">‹</button>
        <button data-q="y" style="padding:11px 18px;border-radius:10px;border:0;background:${m==='y'?'#0f8a52':'#e6f4ec'};color:${m==='y'?'#fff':'#0f8a52'};font-weight:700;font-size:15px">✓ Sudah</button>
        <button data-q="n" style="padding:11px 18px;border-radius:10px;border:0;background:${m==='n'?'#c8102e':'#fbe7ea'};color:${m==='n'?'#fff':'#c8102e'};font-weight:700;font-size:15px">✕ Belum</button>
        <button data-q="f" style="padding:11px 16px;border-radius:10px;border:1px solid #ddd;background:#f4f4f4;color:#000;font-weight:700;font-size:18px">›</button></div>
      <div style="font-size:12px;color:#888;margin-top:8px">Tandai lalu otomatis lanjut ke SN berikutnya</div>`;
    ov.style.display='flex';try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>ov._w=w).catch(()=>{})}catch(_){}}
  ov.addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;const q=b.dataset.q,L=sns(),i=L.indexOf(cur);
    if(q==='x'){ov.style.display='none';try{ov._w&&ov._w.release()}catch(_){}rb();return}
    if(q==='p'){if(i>0)showQR(L[i-1]);return}if(q==='f'){if(i<L.length-1)showQR(L[i+1]);return}
    S.m[cur]=q;save();if(i<L.length-1)showQR(L[i+1]);else{ov.style.display='none';rb()}});
  const tb=document.getElementById('tabs');
  if(tb&&!tb.querySelector('[data-t="so"]')){const b=document.createElement('button');b.dataset.t='so';b.textContent='🧾 Sell Out';b.onclick=()=>{st.tab='so';draw()};tb.appendChild(b)}
  const css=document.createElement('style');css.textContent='.so-r{display:grid;grid-template-columns:1fr 1fr 36px;gap:6px;margin-top:6px}.so-r input,.so-i{width:100%;padding:9px 8px;border:1px solid var(--bd);border-radius:9px;background:var(--card);color:var(--tx);font:13.5px ui-monospace,monospace}.so-x{border:1px solid var(--bd);background:transparent;color:#c8102e;border-radius:8px;cursor:pointer}.so-b{padding:7px 12px;border-radius:9px;border:1px solid var(--bd);background:var(--soft);color:var(--tx);font-size:13px;cursor:pointer;font-weight:600}.so-b.p{background:#c8102e;color:#fff;border-color:#c8102e}.so-k{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}.so-k div{background:var(--soft);border-radius:10px;padding:8px;text-align:center}.so-k small{display:block;font-size:11px;color:var(--mu)}.so-k b{font-size:17px}.so-l{margin-top:8px}.so-s{display:flex;align-items:center;gap:6px;padding:7px 0;border-top:1px solid var(--bd);font:13px ui-monospace,monospace}.so-s .n{flex:1}.so-s a{color:#1565c0;font-weight:600;text-decoration:none;font-family:system-ui}.so-t{min-width:60px;border:1px solid var(--bd);background:transparent;border-radius:999px;padding:4px 9px;font-size:12px;cursor:pointer;color:var(--mu)}.so-t.y{background:rgba(15,138,82,.14);color:#0f8a52;border-color:transparent;font-weight:700}.so-t.n{background:rgba(200,16,46,.1);color:#c8102e;border-color:transparent;font-weight:700}.so-f{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}';document.head.appendChild(css);
  function body(){const L=sns(),y=L.filter(s=>S.m[s]==='y').length,n=L.filter(s=>S.m[s]==='n').length,c=L.length-y-n;
    let F=L;if(S.f==='y')F=L.filter(s=>S.m[s]==='y');else if(S.f==='n')F=L.filter(s=>S.m[s]==='n');else if(S.f==='c')F=L.filter(s=>!S.m[s]);
    const PG=100,pgs=Math.max(1,Math.ceil(F.length/PG));if(S.pg>=pgs)S.pg=pgs-1;const V=F.slice(S.pg*PG,S.pg*PG+PG);
    const nx=L.find(s=>!S.m[s]);
    return `<div class="so-k"><div><small>Total SN</small><b>${nf(L.length)}</b></div><div><small>Sudah SO</small><b style="color:#0f8a52">${nf(y)}</b></div><div><small>Belum SO</small><b style="color:#c8102e">${nf(n)}</b></div><div><small>% SO</small><b>${L.length?Math.round(y/L.length*100):0}%</b></div></div>
    ${c?`<div class="sub">${nf(c)} SN belum dicek.${nx?` <button class="so-b p" data-qr="${nx}" style="margin-left:4px">${MD==='vf'?'QR':'Barcode'} berikutnya · ${nx.slice(-6)}</button>`:''}</div>`:''}
    <div class="so-f">${[['all','Semua'],['c','Belum dicek'],['y','Sudah SO'],['n','Belum SO']].map(([k,t])=>`<button class="so-b${S.f===k?' p':''}" data-sf="${k}">${t}</button>`).join('')}<button class="so-b" data-sc="1">Salin ringkasan</button></div>
    <div class="so-l">${V.map(s=>`<div class="so-s"><span class="n">${s}</span><button class="so-b" data-qr="${s}" style="padding:4px 10px">${MD==='vf'?'▦ QR':'▥ Barcode'}</button><button class="so-t${S.m[s]==='y'?' y':''}" data-m="y" data-s="${s}">Sudah</button><button class="so-t${S.m[s]==='n'?' n':''}" data-m="n" data-s="${s}">Belum</button></div>`).join('')||'<div class="sub">Tidak ada SN.</div>'}</div>
    ${pgs>1?`<div class="so-f"><button class="so-b" data-pg="-1">‹</button><span class="sub" style="margin:6px 4px">Hal ${S.pg+1}/${pgs}</span><button class="so-b" data-pg="1">›</button></div>`:''}`}
  function rows(){return S.rows.map((r,i)=>`<div class="so-r" data-i="${i}"><input data-k="0" inputmode="numeric" placeholder="SN awal, mis. ${MD==='vf'?'800601367498':'0150000064437527'}" value="${es(r[0])}"><input data-k="1" inputmode="numeric" placeholder="SN akhir (opsional)" value="${es(r[1])}"><button class="so-x">✕</button></div>`).join('')}
  R.so=function(){return `<div class="card"><h3>🧾 Sell Out ${PN()}</h3><div class="so-f" style="margin:0 0 8px">${['vf','sa'].map(k=>`<button class="so-b${MD===k?' p':''}" data-md="${k}">${k.toUpperCase()}</button>`).join('')}</div>
    <div class="sub">${MD==='vf'?'Masukkan SN / WL VF (awal–akhir atau satuan). Ketuk <b>▦ QR</b> untuk tampilkan QR cek voucher':'Masukkan SN SA 16 digit (awal–akhir atau satuan). Ketuk <b>▥ Barcode</b> untuk tampilkan barcode kode SA (awalan + SN + akhiran)'}, lalu tandai <b>Sudah</b> (SO) atau <b>Belum</b>. Tersimpan di HP ini.</div>
    ${MD==='sa'?`<div class="so-r" style="grid-template-columns:1fr 1fr"><input id="sopre" placeholder="Awalan kode" value="${es(S.pre)}"><input id="sosuf" placeholder="Akhiran kode" value="${es(S.suf)}"></div><div class="sub" style="font-size:11.5px;margin-top:4px">Contoh kode: <span style="font-family:monospace">${es(S.pre)}<b>0150000064437527</b>${es(S.suf)}</span></div>`:''}
    <input class="so-i" id="soot" placeholder="Nama outlet (opsional)" value="${es(S.ot)}" style="font-family:system-ui;margin-top:4px">
    <div id="sorows">${rows()}</div><div class="so-f"><button class="so-b" data-add="1">＋ Tambah rentang</button><button class="so-b" data-clr="1">Reset tanda</button></div>
    <div id="sobody">${body()}</div></div>`};
  const rb=()=>{const b=document.getElementById('sobody');if(b)b.innerHTML=body()};
  document.addEventListener('input',e=>{const t=e.target;if(t.id==='soot'){S.ot=t.value;save();return}if(t.id==='sopre'||t.id==='sosuf'){S[t.id==='sopre'?'pre':'suf']=t.value.trim();save();return}const w=t.closest&&t.closest('.so-r');if(!w)return;S.rows[+w.dataset.i][+t.dataset.k]=t.value;S.pg=0;save();rb()});
  document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#sorows,#sobody,[data-add],[data-clr],[data-md]'))return;
    if(t.dataset.md){MD=t.dataset.md;try{localStorage.setItem('so_md',MD)}catch(_){}load();draw();return}
    const x=t.closest('.so-x');if(x){S.rows.splice(+x.closest('.so-r').dataset.i,1);if(!S.rows.length)S.rows=[['','']];save();draw();return}
    if(t.dataset.add){S.rows.push(['','']);save();draw();return}
    if(t.dataset.clr){if(confirm('Hapus semua tanda Sudah/Belum?')){S.m={};save();rb()}return}
    if(t.dataset.qr){showQR(t.dataset.qr);return}
    if(t.dataset.m){const s=t.dataset.s;S.m[s]=S.m[s]===t.dataset.m?undefined:t.dataset.m;if(!S.m[s])delete S.m[s];save();rb();return}
    if(t.dataset.sf){S.f=t.dataset.sf;S.pg=0;save();rb();return}
    if(t.dataset.pg){S.pg=Math.max(0,S.pg+(+t.dataset.pg));rb();return}
    if(t.dataset.sc){const L=sns(),y=L.filter(s=>S.m[s]==='y'),n=L.filter(s=>S.m[s]==='n');const tx=`*Sell Out ${PN()}${S.ot?' – '+S.ot:''}*\nTotal SN: ${nf(L.length)}\nSudah SO: ${nf(y.length)} (${L.length?Math.round(y.length/L.length*100):0}%)\nBelum SO: ${nf(n.length)}${L.length-y.length-n.length?'\nBelum dicek: '+nf(L.length-y.length-n.length):''}${n.length?'\n\nSN belum SO:\n'+n.map((s,i)=>(i+1)+'. '+s).join('\n'):''}`;
      (navigator.clipboard?navigator.clipboard.writeText(tx):Promise.reject()).catch(()=>{const a=document.createElement('textarea');a.value=tx;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()});const o=t.textContent;t.textContent='Tersalin ✓';setTimeout(()=>t.textContent=o,1500)}
  });
  try{if(st.tab==='so')draw()}catch(e){}
})();
