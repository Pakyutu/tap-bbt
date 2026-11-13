// Tab "Hari Ini": daftar kunjungan per SF sesuai hari PJP + tugas tiap outlet; kartu FR Biometric (Top 20).
(function(){
  if(typeof R==='undefined')return;
  const HR=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const nf=v=>Math.round(v).toLocaleString('id-ID'),es=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const tc=s=>String(s).toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
  let hari=HR[new Date().getDay()];if(hari==='Minggu')hari='Senin';let ksf='';
  const FR={};((D.FR||{}).rows||[]).forEach(r=>FR[r[0]]=r);
  const tb=document.getElementById('tabs');
  if(tb&&!tb.querySelector('[data-t="hari1"]')){const b=document.createElement('button');b.dataset.t='hari1';b.textContent='📍 Hari Ini';b.onclick=()=>{st.tab='hari1';draw()};tb.insertBefore(b,tb.firstChild.nextSibling)}
  const css=document.createElement('style');css.textContent='.kj-top{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}.kj-top select{min-width:130px}.kj-sf{margin-top:12px}.kj-sf h3{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.kj-btn{padding:6px 12px;border-radius:8px;border:0;background:#25D366;color:#fff;font-weight:600;cursor:pointer;font-size:13px}.kj-btn.cp{background:var(--soft);color:var(--tx);border:1px solid var(--bd)}.kj-o{padding:9px 0;border-top:1px solid var(--bd)}.kj-o:first-of-type{border-top:0}.kj-o b{font-size:14px}.kj-o .m{font-size:11.5px;color:var(--mu)}.kj-t{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}.kj-t span{font-size:11.5px;padding:2px 8px;border-radius:999px;background:rgba(200,16,46,.1);color:#c8102e;font-weight:600}.kj-t span.y{background:rgba(224,138,0,.14);color:#b86a00}.kj-t span.g{background:rgba(15,138,82,.12);color:#0f8a52}.kj-ok{color:#0f8a52;font-size:12px}.kj-sum{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}.kj-sum span{font-size:12px;padding:3px 9px;border-radius:999px;background:var(--soft)}';document.head.appendChild(css);
  function tugas(o){const t=[],K=(D.K||{})[o.id]||{},cv=(typeof CV!=='undefined'&&CV.v[o.id])?CV.v[o.id][0]:null;
    if(o.vr<20)t.push(['VF Reg '+o.vr+'/20','']);
    if(o.vb<10)t.push(['VF By.U '+o.vb+'/10','']);
    if(o.ss<5)t.push(['SA Simpati '+o.ss+'/5','']);
    if(o.sb<5)t.push(['SA By.U '+o.sb+'/5','']);
    if(K.r&&!(K.r[2]>0))t.push(['Klik Misi Reg','y']);
    if(K.b&&!(K.b[2]>0))t.push(['Klik Misi By.U','y']);
    if(cv&&cv[1]>0&&cv[2]===0)t.push(['CVM Nov 0 (Okt '+cv[1]+')','y']);
    else if(cv&&cv[2]<cv[1])t.push(['CVM turun '+cv[2]+'/'+cv[1],'y']);
    if(FR[o.id]&&!FR[o.id][5])t.push(['FR Biometric belum aktif','']);
    return t}
  function data(){const os=O.filter(o=>o.pjp===hari&&(!st.kec||o.kec===st.kec)&&(!ksf||o.sf===ksf)&&(!st.sf||o.sf===st.sf));const by={};os.forEach(o=>{(by[o.sf]=by[o.sf]||[]).push({o,t:tugas(o)})});
    Object.values(by).forEach(a=>a.sort((x,y)=>y.t.length-x.t.length||x.o.nm.localeCompare(y.o.nm)));return by}
  function waText(sf,a){const dt=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
    const L=a.filter(r=>r.t.length).map((r,i)=>`${i+1}. ${r.o.nm} (${r.o.id})${(D.U||{})[r.o.id]?' · '+D.U[r.o.id]:''}\n   ${r.t.map(x=>x[0]).join(', ')}`);
    return `*Kunjungan ${hari}, ${dt}*\nSF: ${tc(sf)}\nOutlet PJP hari ini: ${a.length} · perlu dikejar: ${L.length}\n\n${L.join('\n')}${L.length?'':'Semua outlet sudah aman 👍'}\n\nSemangat! 💪`}
  R.hari1=function(){const by=data(),sfs=Object.keys(by).sort(),all=Object.values(by).flat(),need=all.filter(r=>r.t.length);
    const cnt=k=>all.filter(r=>r.t.some(x=>x[0].startsWith(k))).length;
    const allSF=[...new Set(O.map(o=>o.sf))].sort();
    let h=`<div class="kj-top"><select id="kjh">${HR.slice(1).map(d=>`<option${d===hari?' selected':''}>${d}</option>`).join('')}</select><select id="kjs"><option value="">Semua SF</option>${allSF.map(s=>`<option value="${es(s)}"${s===ksf?' selected':''}>${es(s)}</option>`).join('')}</select></div>
      <div class="note">Rute PJP hari <b>${hari}</b>: ${all.length} outlet, <b>${need.length}</b> perlu dikejar. Data: ST ${L.sub&&/update (\d+ Nov)/.exec(L.sub)?/update (\d+ Nov)/.exec(L.sub)[1]:''}, Klik Misi, CVM 1–${typeof CV!=='undefined'?CV.d:'?'} Nov, FR Top 20.</div>
      <div class="kj-sum"><span>VF Reg belum OA: <b>${cnt('VF Reg')}</b></span><span>VF By.U belum OA: <b>${cnt('VF By.U')}</b></span><span>SA Simpati belum OA: <b>${cnt('SA Simpati')}</b></span><span>SA By.U belum OA: <b>${cnt('SA By.U')}</b></span><span>Belum Klik Misi Reg: <b>${cnt('Klik Misi Reg')}</b></span><span>Belum Klik Misi By.U: <b>${cnt('Klik Misi By.U')}</b></span><span>CVM Nov 0: <b>${cnt('CVM Nov 0')}</b></span></div>`;
    if(!sfs.length)h+='<div class="card" style="margin-top:12px">Tidak ada outlet PJP di hari ini untuk filter yang dipilih.</div>';
    sfs.forEach((sf,ix)=>{const a=by[sf],n=a.filter(r=>r.t.length).length;
      h+=`<div class="card kj-sf"><h3><span>${es(tc(sf))} <span class="mu" style="font-weight:400;font-size:13px">· ${a.length} outlet · ${n} dikejar</span></span><span><button class="kj-btn cp" data-kc="${ix}">Salin</button> <button class="kj-btn" data-kw="${ix}">Kirim WA</button></span></h3>
      ${a.map(r=>`<div class="kj-o"><b>${es(r.o.nm)}</b> <span class="m">${r.o.id} · ${es(r.o.kec)}${(D.U||{})[r.o.id]?' · 👤 '+es(D.U[r.o.id]):''}</span>${r.t.length?`<div class="kj-t">${r.t.map(x=>`<span class="${x[1]}">${es(x[0])}</span>`).join('')}</div>`:'<div class="kj-ok">✓ aman semua</div>'}</div>`).join('')}</div>`});
    R.hari1._sfs=sfs;R.hari1._by=by;return h};
  document.addEventListener('change',e=>{if(e.target.id==='kjh'){hari=e.target.value;draw()}if(e.target.id==='kjs'){ksf=e.target.value;draw()}});
  document.addEventListener('click',async e=>{const w=e.target.closest('[data-kw]'),c=e.target.closest('[data-kc]');if(!w&&!c)return;const i=+(w||c).dataset[w?'kw':'kc'],sf=R.hari1._sfs[i],txt=waText(sf,R.hari1._by[sf]);
    if(w){window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');return}
    try{await navigator.clipboard.writeText(txt);c.textContent='Tersalin ✓';setTimeout(()=>c.textContent='Salin',1500)}catch(_){const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();c.textContent='Tersalin ✓'}});
  // Kartu FR Biometric di Ringkasan (mode VF)
  if(R.ring&&D.FR){const oR=R.ring;R.ring=function(){const h=oR.apply(this,arguments);if(st.prod!=='VF')return h;
    const rs=D.FR.rows.map(r=>{const o=O.find(x=>x.id===r[0]);return{id:r[0],nm:o?o.nm:r[1],sf:o?o.sf:tc(r[2]),fr:r[4],a:r[5]}}).filter(r=>(!st.sf||r.sf===st.sf));
    const ak=rs.filter(r=>r.a).length,tot=rs.reduce((t,r)=>t+r.fr,0),no=rs.filter(r=>!r.a);
    return h+`<div class="card tw" style="margin-top:14px"><h3>FR Biometric · outlet Top 20 Nota</h3><div class="sub">Data ${D.FR.d} Nov. Outlet aktif FR <b>${ak} dari ${rs.length}</b> (${rs.length?Math.round(ak/rs.length*100):0}%), total FR <b>${nf(tot)}</b>.${no.length?` Belum aktif: <b>${no.map(r=>es(r.nm)+' ('+es(tc(r.sf).split(' ')[0])+')').join(', ')}</b>.`:''}</div>
      <table><tr><th style="text-align:left">Outlet</th><th style="text-align:left">SF</th><th>FR</th><th>Status</th></tr>${rs.sort((a,b)=>a.fr-b.fr).map(r=>`<tr><td style="text-align:left">${es(r.nm)}</td><td style="text-align:left">${es(tc(r.sf))}</td><td>${nf(r.fr)}</td><td>${r.a?'<span style="color:#0f8a52;font-weight:600">Aktif</span>':'<span style="color:#c8102e;font-weight:600">Belum</span>'}</td></tr>`).join('')}</table></div>`}}
  try{if(st.tab==='hari1'||st.tab==='ring')draw()}catch(e){}
})();
