// Tab dikelompokkan: baris grup (ikon + label, muat 5 kolom) + chip sub-tab. Tombol asli di #tabs tetap dipakai (disembunyikan).
// Pakai: window.TABG={key:'dgp',groups:[[id,'ikon Label',[tab,...]],...],names:{tab:'Nama'}} lalu muat tabgroup.js.
(function(){
  const C=window.TABG,tb=document.getElementById('tabs');if(!C||!tb)return;
  const G=C.groups.map(g=>[g[0],g[1],g[2].slice()]),N=C.names||{},KEY='tabmem_'+(C.key||location.pathname);
  const btn=t=>tb.querySelector(`[data-t="${t}"]`);
  const fix=()=>{[...tb.querySelectorAll('button[data-t]')].forEach(b=>{if(!G.some(g=>g[2].includes(b.dataset.t)))G[G.length-1][2].push(b.dataset.t)})};fix();
  let mem={};try{mem=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  const css=document.createElement('style');css.textContent=`#tabs{display:none!important}
  .tg{display:grid;grid-template-columns:repeat(${G.length},minmax(0,1fr));gap:2px;margin-top:12px}
  .tg button{border:0;background:none;color:var(--heromu,var(--band-mu,var(--mu)));font:inherit;font-size:12px;font-weight:600;padding:7px 2px 8px;border-bottom:3px solid transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1.15;transition:color .15s;min-width:0}
  .tg button i{font-style:normal;font-size:19px}.tg button span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .tg button.on{color:var(--herotx,var(--band-fg,var(--tx)));border-bottom-color:var(--ac)}
  .ts{display:flex;gap:6px;overflow-x:auto;padding:10px 0 4px;scrollbar-width:none}.ts::-webkit-scrollbar{display:none}
  .ts button{flex:none;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:var(--herotx,var(--band-fg,var(--tx)));font:inherit;font-size:12.5px;padding:6px 12px;border-radius:999px;cursor:pointer;white-space:nowrap}
  .ts button.on{background:var(--herotx,var(--band-fg,var(--tx)));color:var(--hero,var(--band,var(--bg)));border-color:transparent;font-weight:600}
  .ts:empty{display:none}`;document.head.appendChild(css);
  const w=document.createElement('div');w.innerHTML='<nav class="tg" id="tg" aria-label="Menu"></nav><div class="ts" id="ts"></div>';tb.after(...w.children);
  const cur=()=>{const b=tb.querySelector('button.on');return b?b.dataset.t:G[0][2][0]};
  const grp=t=>G.find(g=>g[2].includes(t))||G[0];
  let busy=false;
  function sync(){if(busy)return;busy=true;fix();G.forEach(g=>g[2]=g[2].filter(btn));const t=cur(),g=grp(t);mem[g[0]]=t;try{localStorage.setItem(KEY,JSON.stringify(mem))}catch(e){}
    document.getElementById('tg').innerHTML=G.filter(x=>x[2].length).map(x=>{const [ic,...lb]=x[1].split(' ');return `<button data-g="${x[0]}" class="${x===g?'on':''}"><i>${ic}</i><span>${lb.join(' ')}</span></button>`}).join('');
    document.getElementById('ts').innerHTML=g[2].length>1?g[2].map(s=>`<button data-st="${s}" class="${s===t?'on':''}">${N[s]||btn(s).textContent.trim()}</button>`).join(''):'';
    const on=document.querySelector('#ts .on');if(on){const p=on.parentElement;p.scrollLeft=Math.max(0,on.offsetLeft-p.clientWidth/2+on.clientWidth/2)}
    busy=false}
  document.addEventListener('click',e=>{const a=e.target.closest('#tg [data-g]');if(a){const g=G.find(x=>x[0]===a.dataset.g);if(!g)return;const t=g[2].includes(mem[g[0]])?mem[g[0]]:g[2][0];const b=btn(t);if(b)b.click();setTimeout(sync);return}
    const s=e.target.closest('#ts [data-st]');if(s){const b=btn(s.dataset.st);if(b)b.click();setTimeout(sync)}});
  new MutationObserver(()=>sync()).observe(tb,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  sync();
})();
