// Code 128 (B/C otomatis) -> SVG. window.bcSvg(teks, tinggi)
(function(){
  const PAT='212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112'.split(' ');
  function vals(txt){const v=[];let set=0,i=0;const dg=c=>c>='0'&&c<='9';
    while(i<txt.length){let r=0;while(i+r<txt.length&&dg(txt[i+r]))r++;
      if(r>=4){if(set!==3)v.push(set?99:105);set=3;const k=r-(r%2);for(let j=0;j<k;j+=2)v.push(+txt.substr(i+j,2));i+=k;continue}
      if(set!==2)v.push(set?100:104);set=2;const c=txt.charCodeAt(i)-32;if(c>=0&&c<=94)v.push(c);i++}
    return v}
  function svg(txt,h){const v=vals(txt);
    let sum=v[0];for(let i=1;i<v.length;i++)sum+=i*v[i];v.push(sum%103,106);
    let x=10,r='';for(const k of v){const p=PAT[k];for(let i=0;i<p.length;i++){const w=+p[i];if(i%2===0)r+='<rect x="'+x+'" y="0" width="'+w+'" height="'+h+'"/>';x+=w}}
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(x+10)+' '+h+'" preserveAspectRatio="none" style="width:100%;height:'+h+'px;background:#fff;display:block" shape-rendering="crispEdges"><g fill="#000">'+r+'</g></svg>'}
  window.bcSvg=svg;window.bcVals=vals;
})();
