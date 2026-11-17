import sys,openpyxl,json
p='digipos-site.js';s=open(p).read();i=s.index('const SITE=')+11
SITE,end=json.JSONDecoder().raw_decode(s[i:]);ids=set(SITE['S'])
wb=openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True)
f=lambda v:v if isinstance(v,(int,float)) else 0
N={}
for r in wb['SITE LEVEL'].iter_rows(min_row=9,values_only=True):
  if r[6] in ids: N[r[6]]=[round(f(r[16])),round(f(r[17])),r[19] or '',r[14] if isinstance(r[14],str) and r[14]!='#N/A' else '',int(f(r[58])),int(f(r[59]))]
SITE['N']={'d':sys.argv[2],'s':N}
s=s[:i]+json.dumps(SITE,ensure_ascii=False,separators=(',',':'))+s[i+end:]
if 'N.s[site]' not in s:
 rep=[
("// S[site] =","// N.s[site] = [revAllMtd, revAllMtd-1, category, network condition, payingUser mtd, mtd-1] (Monitoring Performance Region)\n// S[site] ="),
("const srt={ol:","const nv=x=>((SITE.N||{}).s||{})[x.s]||[0,0];const srt={tg:(a,b)=>(nv(a)[0]-nv(a)[1])-(nv(b)[0]-nv(b)[1]),ol:"),
("const S=SITE.S[x.s]||[],dom=","const T=nv(x),tg=T[0]-T[1],S=SITE.S[x.s]||[],dom="),
("""</span></div></div>
      <details>""","""</span></div>${T[0]||T[1]?`<div style="grid-column:1/-1">Revenue Telkomsel site MTD ${es(SITE.N.d)}<b>${rpj(T[0])} <span style="font-size:12px;color:${tg>=0?'#0f8a52':'#c8102e'}">${tg>=0?'▲':'▼'} ${T[1]?Math.abs(Math.round(tg/T[1]*100)):0}% (MTD-1 ${rpj(T[1])})</span></b>Paying user ${nf(T[4])} (MTD-1 ${nf(T[5])})${T[3]&&T[3]!=='Safe'?` · <b style="display:inline;font-size:12px;color:#c8102e">⚠ ${es(T[3])}</b>`:''}</div>`:''}</div>
      <details>"""),
("['gap','Rev turun terbesar']","['gap','Rev VF turun terbesar'],['tg','Rev TSEL turun terbesar']"),
("""      <input class="st-q\"""","""      ${(()=>{const V=Object.values((SITE.N||{}).s||{});if(!V.length)return'';const a=V.reduce((s,v)=>s+v[0],0),b=V.reduce((s,v)=>s+v[1],0),dc=V.filter(v=>v[0]<v[1]).length,ni=V.filter(v=>v[3]&&v[3]!=='Safe').length;return `<div class="st-g" style="margin-bottom:8px"><div>Revenue TSEL ${V.length} site (MTD ${es(SITE.N.d)})<b>${rpj(a)}</b><span style="color:${a>=b?'#0f8a52':'#c8102e'}">${a>=b?'▲':'▼'} ${Math.abs(Math.round((a-b)/b*100))}% vs MTD-1 ${rpj(b)}</span></div><div>Site turun / naik<b>${dc} / ${V.length-dc}</b><span style="color:#c8102e">${ni} site Network Intervention</span></div></div>`})()}
      <input class="st-q\""""),
 ]
 for a,b in rep:
  assert s.count(a)==1,a; s=s.replace(a,b)
open(p,'w').write(s)
V=list(N.values());print(len(V),sum(v[0] for v in V)/1e6,sum(v[1] for v in V)/1e6,sum(v[0]<v[1] for v in V),sum(v[3]!='Safe' for v in V))
for k,v in sorted(N.items(),key=lambda kv:kv[1][0]-kv[1][1])[:4]:print(k,SITE['S'][k][0],SITE['S'][k][2],v)
