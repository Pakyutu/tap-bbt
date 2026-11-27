// DIGIPOS: konfigurasi grup tab (dipakai tabgroup.js) + header ringkas (Filter & menu ⋯).
window.TABG={key:'dgp',
  groups:[['ring','📊 Ringkasan',['ring','hari1','tem']],['sf','👥 Wilayah',['sf','hari','kec','site']],['out','🏪 Outlet',['out','cvm','bio','tj']],['prog','🎯 Program',['km','xd','sso','cuan']],['alat','🏷️ Scan',['bc','so']]],
  names:{ring:'Ringkasan',hari1:'Hari Ini',tem:'Temuan',sf:'Per SF',hari:'SF × Hari',kec:'Kecamatan',site:'Site',out:'Outlet',km:'Klik Misi',xd:'Extra Dealing',sso:'Sultan SO',cuan:'Cuan PV',cvm:'CVM',bio:'Biometrik',tj:'Titip Jual',bc:'Barcode',so:'Sell Out'}};
(function(){
  const $=i=>document.getElementById(i),prod=$('prod'),row=prod&&prod.parentElement;if(!row)return;
  const css=document.createElement('style');css.textContent=`
  .hx{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .hx .ib{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:var(--herotx);font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}
  .hx .ib b{min-width:18px;height:18px;border-radius:9px;background:var(--ac);color:#fff;font-size:11px;display:inline-grid;place-items:center;padding:0 5px}
  .hx .ib.on{background:var(--herotx);color:var(--hero)}
  .hx .sp{flex:1}
  #fpan{display:none;gap:8px;flex-wrap:wrap;margin-top:10px}#fpan.open{display:flex}
  #fpan select{flex:1 1 140px;min-width:0}
  .amw{position:relative}#amenu{display:none;position:absolute;right:0;top:calc(100% + 6px);z-index:30;min-width:210px;background:var(--card);color:var(--tx);border:1px solid var(--bd);border-radius:14px;box-shadow:0 14px 40px rgba(4,10,20,.3);padding:6px}
  #amenu.open{display:block}#amenu .btn{display:flex!important;width:100%;justify-content:flex-start;background:none!important;color:var(--tx)!important;border:0!important;box-shadow:none!important;border-radius:10px;min-height:44px;font-weight:500}
  #amenu .btn:hover,#amenu .btn:active{background:var(--soft)!important}#amenu .btn[hidden]{display:none!important}`;document.head.appendChild(css);
  // susun ulang: baris utama = produk + Filter + ⋯ ; panel filter = kecamatan/SF/PJP/reset ; menu = aksi
  const hx=document.createElement('div');hx.className='hx';
  const fb=document.createElement('button');fb.type='button';fb.className='ib';fb.id='fbtn';fb.innerHTML='⚙️ Filter <b id="fcnt" hidden>0</b>';
  const aw=document.createElement('span');aw.className='amw';aw.innerHTML='<button type="button" class="ib" id="abtn" aria-haspopup="menu" aria-label="Menu lainnya">⋯</button><div id="amenu" role="menu"></div>';
  const sp=document.createElement('span');sp.className='sp';
  const pan=document.createElement('div');pan.id='fpan';
  row.before(hx);hx.append(prod,fb,sp,aw);
  ['fkec','fsf','fpjp','ftop','reset'].forEach(i=>{const e=$(i);if(e)pan.appendChild(e)});
  hx.after(pan);
  const M=$('amenu');[['cimg','🖼️ '],['jpg','⬇️ '],['upbtn','📤 '],['fsbtn','']].forEach(([i,ic])=>{const e=$(i);if(e){M.appendChild(e);if(!e.dataset.ic){e.dataset.ic=1;e.prepend(ic)}}});
  ['upf','cpst'].forEach(i=>{const e=$(i);if(e)hx.appendChild(e)});
  if(!row.children.length)row.remove();
  const cnt=()=>{const n=['fkec','fsf','fpjp','ftop'].filter(i=>$(i)&&$(i).value).length,c=$('fcnt');c.textContent=n;c.hidden=!n;fb.classList.toggle('on',pan.classList.contains('open'))};
  fb.onclick=()=>{pan.classList.toggle('open');cnt()};
  $('abtn').onclick=e=>{e.stopPropagation();M.classList.toggle('open')};
  document.addEventListener('click',e=>{if(!e.target.closest('.amw'))M.classList.remove('open');else if(e.target.closest('#amenu .btn'))setTimeout(()=>M.classList.remove('open'),50)});
  ['fkec','fsf','fpjp','ftop'].forEach(i=>{const e=$(i);if(e)e.addEventListener('change',()=>setTimeout(cnt))});
  addEventListener('keydown',e=>{if(e.key==='Escape')M.classList.remove('open')});
  const od=window.draw;if(typeof od==='function')window.draw=function(){const r=od.apply(this,arguments);try{cnt()}catch(e){}return r};
  cnt();
})();
