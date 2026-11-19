// Navigasi tab DIGIPOS dikelompokkan: 5 grup utama + sub-tab. Tombol asli di #tabs tetap dipakai (disembunyikan).
(function(){
  const tb=document.getElementById('tabs');if(!tb||typeof st==='undefined')return;
  const G=[['ring','📊 Ringkasan',['ring','hari1','tem']],['sf','👥 Wilayah',['sf','hari','kec','site']],['out','🏪 Outlet',['out']],['prog','🎯 Program',['km','xd','sso','cuan','cvm','bio']],['alat','🏷️ Scan',['bc','so']]];
  const SUB={ring:'Ringkasan',hari1:'Hari Ini',tem:'Temuan',sf:'Per SF',hari:'SF × Hari',kec:'Kecamatan',site:'Site',out:'Outlet',km:'Klik Misi',xd:'Extra Dealing',sso:'Sultan SO',cuan:'Cuan PV',cvm:'CVM',bio:'Biometrik',bc:'Barcode',so:'Sell Out'};
  const btn=t=>tb.querySelector(`[data-t="${t}"]`);
  // tab yang tidak terdaftar ikut grup Program
  [...tb.querySelectorAll('button')].forEach(b=>{if(!G.some(g=>g[2].includes(b.dataset.t)))G[3][2].push(b.dataset.t)});
  G.forEach(g=>g[2]=g[2].filter(btn));
  const last={};let mem={};try{mem=JSON.parse(localStorage.getItem('dgp_tabmem')||'{}')}catch(e){}
  const css=document.createElement('style');css.textContent=`#tabs{display:none!important}
  .tg{display:flex;gap:4px;overflow-x:auto;margin-top:14px;scrollbar-width:none}.tg::-webkit-scrollbar,.ts::-webkit-scrollbar{display:none}
  .tg button{border:0;background:none;color:var(--heromu);font:inherit;font-size:13.5px;font-weight:600;padding:9px 9px;border-bottom:3px solid transparent;cursor:pointer;white-space:nowrap;transition:color .15s}
  .tg button.on{color:var(--herotx);border-bottom-color:var(--ac)}
  .ts{display:flex;gap:6px;overflow-x:auto;padding:10px 0 2px;scrollbar-width:none}
  .ts button{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:var(--herotx);font:inherit;font-size:12.5px;padding:6px 12px;border-radius:999px;cursor:pointer;white-space:nowrap}
  .ts button.on{background:var(--herotx);color:var(--hero);border-color:var(--herotx);font-weight:600}
  .ts:empty{display:none}`;document.head.appendChild(css);
  const w=document.createElement('div');w.innerHTML='<nav class="tg" id="tg" aria-label="Menu DIGIPOS"></nav><div class="ts" id="ts"></div>';tb.after(...w.children);
  const grp=t=>G.find(g=>g[2].includes(t))||G[0];
  function sync(){const g=grp(st.tab);last[g[0]]=st.tab;mem[g[0]]=st.tab;try{localStorage.setItem('dgp_tabmem',JSON.stringify(mem))}catch(e){}
    document.getElementById('tg').innerHTML=G.filter(x=>x[2].length).map(x=>`<button data-g="${x[0]}" class="${x===g?'on':''}">${x[1]}</button>`).join('');
    document.getElementById('ts').innerHTML=g[2].length>1?g[2].map(t=>`<button data-st="${t}" class="${t===st.tab?'on':''}">${SUB[t]||btn(t).textContent}</button>`).join(''):'';
    [document.querySelector('#ts .on'),document.querySelector('#tg .on')].forEach(on=>{if(on){const p=on.parentElement;p.scrollLeft=Math.max(0,on.offsetLeft-p.clientWidth/2+on.clientWidth/2)}})}
  document.addEventListener('click',e=>{const a=e.target.closest('#tg [data-g]');if(a){const g=G.find(x=>x[0]===a.dataset.g);const t=last[g[0]]||(g[2].includes(mem[g[0]])?mem[g[0]]:g[2][0]);const b=btn(t);if(b)b.click();return}
    const s=e.target.closest('#ts [data-st]');if(s){const b=btn(s.dataset.st);if(b)b.click()}});
  const od=window.draw;if(typeof od==='function')window.draw=function(){const r=od.apply(this,arguments);try{sync()}catch(e){}return r};
  sync();
})();
