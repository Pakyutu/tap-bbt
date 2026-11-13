// Minimal QR encoder (byte mode, ECC M, versions 1-10, auto mask). Returns boolean matrix.
var QR=(function(){
const ECW=[0,10,16,26,18,24,16,18,22,22,26],BLK=[0,1,1,1,2,2,4,4,4,5,5];// ECC M codewords per block, num blocks
const TOT=[0,26,44,70,100,134,172,196,242,292,346];
const AL=[[],[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];
function gfMul(x,y){let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z&255}
function rsDiv(deg){const r=new Array(deg).fill(0);r[deg-1]=1;let root=1;for(let i=0;i<deg;i++){for(let j=0;j<deg;j++){r[j]=gfMul(r[j],root);if(j+1<deg)r[j]^=r[j+1]}root=gfMul(root,2)}return r}
function rsRem(data,div){const r=new Array(div.length).fill(0);for(const b of data){const f=b^r.shift();r.push(0);div.forEach((c,i)=>r[i]^=gfMul(c,f))}return r}
function encode(text){const bytes=Array.from(new TextEncoder().encode(text));let ver=1;
  for(;ver<=10;ver++){const cap=(TOT[ver]-ECW[ver]*BLK[ver])*8;const need=4+(ver<10?8:16)+bytes.length*8;if(need<=cap)break}if(ver>10)throw'too long';
  const dcw=TOT[ver]-ECW[ver]*BLK[ver];let bits=[];const put=(v,n)=>{for(let i=n-1;i>=0;i--)bits.push((v>>>i)&1)};
  put(4,4);put(bytes.length,ver<10?8:16);bytes.forEach(b=>put(b,8));put(0,Math.min(4,dcw*8-bits.length));while(bits.length%8)bits.push(0);
  for(let p=0xEC;bits.length<dcw*8;p^=0xEC^0x11)put(p,8);
  const data=[];for(let i=0;i<bits.length;i+=8){let v=0;for(let j=0;j<8;j++)v=v<<1|bits[i+j];data.push(v)}
  const nb=BLK[ver],shortLen=Math.floor(TOT[ver]/nb),nShort=nb-TOT[ver]%nb,div=rsDiv(ECW[ver]);const blocks=[];
  for(let i=0,k=0;i<nb;i++){const len=shortLen-ECW[ver]+(i<nShort?0:1);const d=data.slice(k,k+len);k+=len;const e=rsRem(d,div);if(i<nShort)d.push(0);blocks.push(d.concat(e))}
  const cw=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!==shortLen-ECW[ver]||j>=nShort)cw.push(b[i])});
  const N=ver*4+17,M=[...Array(N)].map(()=>Array(N).fill(false)),F=[...Array(N)].map(()=>Array(N).fill(false));
  const set=(x,y,v)=>{M[y][x]=v;F[y][x]=true};
  for(let i=0;i<N;i++){set(6,i,i%2==0);set(i,6,i%2==0)}
  const finder=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy)),x=cx+dx,y=cy+dy;if(x>=0&&x<N&&y>=0&&y<N)set(x,y,d!=2&&d!=4)}};
  finder(3,3);finder(N-4,3);finder(3,N-4);
  const al=AL[ver];al.forEach((a,i)=>al.forEach((b,j)=>{if(!((i==0&&j==0)||(i==0&&j==al.length-1)||(i==al.length-1&&j==0)))for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(a+dx,b+dy,Math.max(Math.abs(dx),Math.abs(dy))!=1)}));
  const fmt=(mask)=>{const d=(0<<3)|mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412;const g=i=>((b>>>i)&1)!=0;
    for(let i=0;i<=5;i++)set(8,i,g(i));set(8,7,g(6));set(8,8,g(7));set(7,8,g(8));for(let i=9;i<15;i++)set(14-i,8,g(i));
    for(let i=0;i<8;i++)set(N-1-i,8,g(i));for(let i=8;i<15;i++)set(8,N-15+i,g(i));set(8,N-8,true)};
  fmt(0);
  if(ver>=7){let r=ver;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=ver<<12|r;for(let i=0;i<18;i++){const v=((b>>>i)&1)!=0,a=N-11+i%3,c=Math.floor(i/3);set(a,c,v);set(c,a,v)}}
  let i=0;const allBits=[];cw.forEach(b=>{for(let j=7;j>=0;j--)allBits.push((b>>>j)&1)});
  for(let right=N-1;right>=1;right-=2){if(right==6)right=5;for(let vert=0;vert<N;vert++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)==0,y=up?N-1-vert:vert;if(!F[y][x]&&i<allBits.length){M[y][x]=allBits[i]==1;i++}}}
  const MF=[(x,y)=>(x+y)%2==0,(x,y)=>y%2==0,(x,y)=>x%3==0,(x,y)=>(x+y)%3==0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2==0,(x,y)=>x*y%2+x*y%3==0,(x,y)=>(x*y%2+x*y%3)%2==0,(x,y)=>((x+y)%2+x*y%3)%2==0];
  const apply=m=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!F[y][x]&&MF[m](x,y))M[y][x]=!M[y][x]};
  const pen=()=>{let p=0;for(let k=0;k<2;k++)for(let a=0;a<N;a++){let run=1,prev=null;const line=[];for(let b=0;b<N;b++){const v=k?M[b][a]:M[a][b];line.push(v);if(v===prev){run++;if(run==5)p+=3;else if(run>5)p++}else{run=1;prev=v}}
      const s=line.map(v=>v?1:0).join('');let q=0;while((q=s.indexOf('1011101',q))!=-1){if(s.substr(q-4,4)=='0000'||s.substr(q+7,4)=='0000')p+=40;q++}}
    for(let y=0;y<N-1;y++)for(let x=0;x<N-1;x++){const c=M[y][x];if(c==M[y][x+1]&&c==M[y+1][x]&&c==M[y+1][x+1])p+=3}
    let dark=0;M.forEach(r=>r.forEach(v=>dark+=v));p+=Math.floor(Math.abs(dark*20-N*N*10)/(N*N))*10;return p};
  let best=0,bp=1e9;for(let m=0;m<8;m++){apply(m);fmt(m);const p=pen();if(p<bp){bp=p;best=m}apply(m)}
  apply(best);fmt(best);return M}
function svg(text,px){const M=encode(text),N=M.length,q=4;let d='';M.forEach((r,y)=>r.forEach((v,x)=>{if(v)d+='M'+(x+q)+','+(y+q)+'h1v1h-1z'}));
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(N+2*q)+' '+(N+2*q)+'" style="width:'+px+';height:auto;background:#fff;display:block" shape-rendering="crispEdges"><path d="'+d+'" fill="#000"/></svg>'}
return {encode,svg}})();
if(typeof module!=='undefined')module.exports=QR;
