// Penyusun WL: scan kamera (QR/barcode) untuk input stok SN + menu Status ST (sudah/belum ST, kumpulkan SN belum ST).
(function(){
  const parseSN=t=>{t=String(t||'').trim();let m=t.match(/[?&]sn=(\d+)/i);if(m)return m[1];m=t.match(/^[A-Za-z]\w{4}(\d{16})\d*$/);if(m)return m[1];const d=t.replace(/\D/g,'');return d.length>=8?d:''};
  window.parseSN=parseSN;
  // ---------- scanner ----------
  const ov=document.createElement('div');ov.id='scov';ov.style.cssText='position:fixed;inset:0;z-index:9999;background:#000;display:none;flex-direction:column;color:#fff';
  ov.innerHTML='<div style="padding:calc(12px + env(safe-area-inset-top,0px)) 14px 10px;display:flex;justify-content:space-between;align-items:center;gap:8px"><b id="sct" style="font-size:16px"></b><button id="scx" style="border:0;background:#fff;color:#000;font-weight:700;border-radius:10px;padding:9px 16px;font-size:15px">✕ Tutup</button></div><div style="flex:1;position:relative;overflow:hidden"><video id="scv" playsinline muted style="width:100%;height:100%;object-fit:cover"></video><div style="position:absolute;left:8%;right:8%;top:30%;height:34%;border:3px solid rgba(255,255,255,.85);border-radius:16px;box-shadow:0 0 0 2000px rgba(0,0,0,.35)"></div></div><div style="padding:12px 14px calc(14px + env(safe-area-inset-bottom,0px));text-align:center"><div id="scm" style="min-height:22px;font-weight:600;font-size:15px"></div><div id="scb" style="margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap"></div></div>';
  document.body.appendChild(ov);
  const $s=i=>document.getElementById(i);let run=null;
  function stop(){if(!run)return;run.on=false;try{run.reader&&run.reader.reset()}catch(e){}try{run.stream&&run.stream.getTracks().forEach(t=>t.stop())}catch(e){}run=null;ov.style.display='none'}
  $s('scx').onclick=stop;
  function msg(t,c){$s('scm').innerHTML=t;$s('scm').style.color=c||'#fff'}
  // o: {title, onCode(raw)->{close?,msg?,col?,title?,btns?}, btns:[[label,fn]]}
  async function scan(o){stop();const R={on:true,last:'',lt:0};run=R;$s('sct').textContent=o.title;msg('Arahkan kamera ke QR / barcode','#ddd');setBtns(o.btns||[]);ov.style.display='flex';
    const hit=raw=>{if(!R.on)return;const now=Date.now();if(raw===R.last&&now-R.lt<2500)return;R.last=raw;R.lt=now;try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}
      const r=o.onCode(raw)||{};if(r.msg!==undefined)msg(r.msg,r.col);if(r.title)$s('sct').textContent=r.title;if(r.btns)setBtns(r.btns);if(r.close)setTimeout(stop,r.delay||0)};
    R.hit=hit;
    if(window.__scanQ){(function q(){if(!R.on)return;const v=window.__scanQ.shift();if(v!==undefined)hit(v);if(window.__scanQ.length)setTimeout(q,50)})();return}
    const v=$s('scv');
    try{
      if('BarcodeDetector' in window){const f=await BarcodeDetector.getSupportedFormats();const det=new BarcodeDetector({formats:f.filter(x=>['qr_code','code_128','code_39','ean_13','ean_8','itf','data_matrix','codabar','upc_a'].includes(x))});
        R.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}}});if(!R.on){R.stream.getTracks().forEach(t=>t.stop());return}
        v.srcObject=R.stream;await v.play();
        (async function loop(){if(!R.on)return;try{const c=await det.detect(v);if(c.length)hit(c[0].rawValue)}catch(e){}setTimeout(loop,180)})();
      }else{
        msg('Menyiapkan pemindai…','#ddd');
        if(!window.ZXing)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});
        const rd=new ZXing.BrowserMultiFormatReader();R.reader=rd;msg('Arahkan kamera ke QR / barcode','#ddd');
        rd.decodeFromConstraints({video:{facingMode:'environment'}},v,(res)=>{if(res)hit(res.getText())});
      }
    }catch(e){msg('Kamera tidak bisa dibuka. Izinkan akses kamera untuk aplikasi ini.','#ff8a8a')}}
  function setBtns(b){$s('scb').innerHTML='';b.forEach(([t,f])=>{const x=document.createElement('button');x.textContent=t;x.style.cssText='border:0;background:#fff;color:#000;font-weight:700;border-radius:10px;padding:10px 16px;font-size:15px';x.onclick=f;$s('scb').appendChild(x)})}
  window.wlScan=scan;

  // ---------- scan rentang stok ----------
  const addBtn=document.getElementById('addr');
  if(addBtn){const b=document.createElement('button');b.className='btn s';b.id='scr';b.textContent='📷 Scan rentang';addBtn.after(b);
    b.addEventListener('click',()=>{let a='';
      const put=(x,y)=>{let i=RW.findIndex(r=>!String(r[0]).trim());if(i<0){RW.push(['','']);i=RW.length-1}RW[i]=[x,y||''];drawRows();syncSt();render()};
      scan({title:'Scan SN AWAL',onCode:raw=>{const sn=parseSN(raw);if(!sn)return{msg:'Kode tidak dikenali: '+raw.slice(0,40),col:'#ff8a8a'};
        if(!a){a=sn;return{title:'Scan SN AKHIR',msg:'Awal: '+sn,col:'#7dffb0',btns:[['Cuma 1 SN',()=>{put(a,'');stop()}]]}}
        if(sn.length!==a.length)return{msg:'Panjang SN beda dengan awal ('+sn+')',col:'#ff8a8a'};
        put(a,sn);const n=BigInt(sn)-BigInt(a);return{msg:'✓ '+a+' – '+sn+' ('+((n<0n?-n:n)+1n).toString()+' SN)',col:'#7dffb0',close:true,delay:700}}})})}

  // ---------- Status ST ----------
  const st=document.createElement('div');st.id='stc';const hist=document.getElementById('hist');hist.parentNode.insertBefore(st,hist);
  const css=document.createElement('style');css.textContent='.ch{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.ch button{border:1px solid var(--bd);background:var(--soft);color:var(--tx);border-radius:8px;padding:5px 7px;font:12px ui-monospace,Menlo,monospace;cursor:pointer}.ch button.y{background:rgba(15,138,82,.16);color:var(--ok);border-color:transparent;font-weight:700}.pb{height:6px;border-radius:3px;background:var(--soft);overflow:hidden;margin-top:6px}.pb i{display:block;height:100%;background:var(--ok)}';document.head.appendChild(css);
  const X=()=>S.stx||(S.stx={});
  const comp=a=>{const o=[];for(const s of a){const l=o[o.length-1];if(l&&BigInt(s)===BigInt(l[1])+1n&&s.length===l[1].length)l[1]=s;else o.push([s,s])}return o.map(([a,b])=>a===b?a:a+' – '+b).join(', ')};
  function data(){return alloc().map((x,i)=>{const L=list(x);return{i,x,L,y:L.filter(s=>X()[s]),b:L.filter(s=>!X()[s])}})}
  function draw(){const D=data();if(!D.length){st.innerHTML='';return}
    const T=D.reduce((s,d)=>s+d.L.length,0),Y=D.reduce((s,d)=>s+d.y.length,0);
    st.innerHTML=`<div class="card"><h2>4. Status ST</h2><div class="sub" style="margin-bottom:6px">Tandai SN yang sudah di-ST outlet (ketuk SN atau scan). Yang belum ST bisa disalin untuk dikumpulkan lagi.</div>
      <div class="stk"><div><small>Total SN</small><b>${nf(T)}</b></div><div><small>Sudah ST</small><b style="color:var(--ok)">${nf(Y)}</b></div><div><small>Belum ST</small><b style="color:var(--ac)">${nf(T-Y)}</b></div><div><small>% ST</small><b>${T?Math.round(Y/T*100):0}%</b></div></div>
      <div class="row"><button class="btn" id="sts">📷 Scan SN sudah ST</button><button class="btn s" id="stb">Salin SN belum ST</button><button class="btn d" id="str">Reset tanda</button></div>
      ${D.map(d=>`<div class="al"><div class="h"><b>${d.i+1}. ${esc(d.x.n||'(tanpa nama)')}</b><span class="m"><b style="color:var(--ok)">${d.y.length}</b>/${d.L.length} ST</span></div><div class="pb"><i style="width:${d.L.length?d.y.length/d.L.length*100:0}%"></i></div>
        ${d.b.length?`<div class="m" style="margin-top:4px">Belum ST: <span class="mono">${comp(d.b)}</span></div>`:'<div class="m" style="margin-top:4px;color:var(--ok)">Semua sudah ST ✓</div>'}
        <div class="row" style="margin-top:6px"><button class="btn s" data-stb="${d.i}">Salin belum ST</button><button class="btn s" data-sta="${d.i}">${d.b.length?'Tandai semua ST':'Batalkan semua'}</button></div>
        <details${d.L.length<=40?' open':''}><summary>SN (${d.L.length}) · ketuk untuk tandai</summary><div class="ch">${d.L.map(s=>`<button class="${X()[s]?'y':''}" data-sn="${s}">${s}</button>`).join('')}</div></details></div>`).join('')}</div>`}
  const txt=D=>{const r=D.filter(d=>d.b.length);return `*SN belum ST${S.p?' – '+S.p:''}*\n`+(r.length?r.map(d=>`\n${d.i+1}. ${d.x.n||'-'} (${d.b.length} pcs): ${comp(d.b)}\n`+d.b.map((s,j)=>`   ${j+1}. ${s}`).join('\n')).join('\n'):'\nSemua sudah ST ✓')+`\n\nTotal belum ST: ${r.reduce((s,d)=>s+d.b.length,0)} pcs`};
  const oR=render;render=function(){oR.apply(this,arguments);draw()};
  st.addEventListener('click',e=>{const t=e.target,d=t.dataset;
    if(d.sn){if(X()[d.sn])delete X()[d.sn];else X()[d.sn]=1;save();draw();return}
    if(d.sta!==undefined){const D=data()[+d.sta];const on=D.b.length>0;D.L.forEach(s=>{if(on)X()[s]=1;else delete X()[s]});save();draw();return}
    if(d.stb!==undefined){copy(txt([data()[+d.stb]]),t);return}
    if(t.id==='stb'){copy(txt(data()),t);return}
    if(t.id==='str'){if(confirm('Hapus semua tanda ST?')){S.stx={};save();draw()}return}
    if(t.id==='sts'){const D=data(),idx={};D.forEach(d=>d.L.forEach(s=>idx[s]=d));
      scan({title:'Scan SN sudah ST',btns:[['Selesai',()=>{stop();draw()}]],onCode:raw=>{const sn=parseSN(raw);if(!sn)return{msg:'Kode tidak dikenali',col:'#ff8a8a'};const d=idx[sn];
        if(!d)return{msg:'✕ '+sn+' tidak ada di WL ini',col:'#ff8a8a'};if(X()[sn])return{msg:'Sudah ditandai: '+(d.x.n||'-')+' · …'+sn.slice(-6),col:'#ffd27d'};
        X()[sn]=1;save();const y=d.L.filter(s=>X()[s]).length;return{msg:'✓ '+(d.x.n||'-')+' · …'+sn.slice(-6)+' ('+y+'/'+d.L.length+')',col:'#7dffb0'}}})}});
  draw();
})();
