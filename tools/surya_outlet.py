# Update data outlet Penjualan (penjualan.html D.O pv/sa, D.N NGRS) dari export SURYA:
#   python3 tools/surya_outlet.py --pv Detail_Outlet_PV_*.csv --sa Detail_Outlet_SA_*.csv --ngrs NGRS_2026_TRX.csv
# Layout array: 10 bulan (Jan–Okt) + Okt periode sama per cutoff (CP / CN) + Nov MTD per cutoff.
# Cutoff dibaca dari header "2026-10 MoM 1-DD". SF/PJP/nama outlet di D.O tidak diubah (master PJP).
import sys,csv,json,re,argparse
ap=argparse.ArgumentParser();ap.add_argument('--pv');ap.add_argument('--sa');ap.add_argument('--ngrs');ap.add_argument('--dry',action='store_true');a=ap.parse_args()
p='penjualan.html';s=open(p).read();i=s.index('const D=')+8;D,e=json.JSONDecoder().raw_decode(s[i:])
num=lambda v:int(float(v)) if str(v).strip() not in ('','-') else 0
def load(f,idc):
    R=list(csv.reader(open(f,encoding='utf-8-sig')));h=R[0]
    mo=[h.index(f'2026-{m:02d}') for m in range(1,11)];k=[j for j,x in enumerate(h) if re.match(r'2026-10 MoM 1-\d+',x)][0]
    c=int(h[k].split('-')[-1]);nv=h.index('2026-11')
    return c,{r[h.index(idc)].strip():([num(r[j]) for j in mo],num(r[k]),num(r[nv]),r) for r in R[1:] if len(r)>nv},h
def put(arr,cps,c,m10,okt,nov,n):
    # arr = 10 + n okt + n nov ; sisip/ganti kolom untuk cutoff c
    ok=arr[10:10+n];nv=arr[10+n:10+2*n]
    if c in cps:j=cps.index(c);ok[j]=okt;nv[j]=nov
    else:
        j=sum(1 for x in cps if x<c);ok.insert(j,okt);nv.insert(j,nov)
    return m10+ok+nv
rep=[]
for kind,f in (('pv',a.pv),('sa',a.sa)):
    if not f:continue
    c,M,h=load(f,'ID Outlet');n=len(D['CP']);miss=[]
    for o in D['O']:
        x=M.get(o['id'])
        if x is None:miss.append(o['nm']);m10,okt,nov=o[kind][:10],0,0
        else:m10,okt,nov=x[0],x[1],x[2]
        o[kind]=put(o[kind],D['CP'],c,m10,okt,nov,n)
    rep.append((kind,c,'Nov',sum(M[o['id']][2] for o in D['O'] if o['id'] in M),'Okt 1-%d'%c,sum(M[o['id']][1] for o in D['O'] if o['id'] in M),'tidak ada',miss))
    cpv=c
if a.pv or a.sa:
    if cpv not in D['CP']:D['CP']=sorted(D['CP']+[cpv])
    D['C']=max(D['C'],cpv)
if a.ngrs:
    c,M,h=load(a.ngrs,'ID Outlet');n=len(D['CN']);miss=[]
    for r in D['N']:
        x=M.get(r['id'])
        if x is None:miss.append(r['nm']);m10,okt,nov=r['v'][:10],0,0
        else:m10,okt,nov=x[0],x[1],x[2]
        r['v']=put(r['v'],D['CN'],c,m10,okt,nov,n)
    ids={r['id'] for r in D['N']};T=h.index('TAP')
    new=[k for k,x in M.items() if x[3][T].strip()=='BAGAN BATU' and k not in ids]
    if c not in D['CN']:D['CN']=sorted(D['CN']+[c])
    rep.append(('ngrs',c,'Nov',sum(M[r['id']][2] for r in D['N'] if r['id'] in M),'Okt 1-%d'%c,sum(M[r['id']][1] for r in D['N'] if r['id'] in M),'tidak ada',len(miss),'baru di file (TAP BBT, belum di D.N)',len(new)))
for r in rep:print(*r)
print('CP',D['CP'],'CN',D['CN'],'C',D['C'])
if not a.dry:
    s=s[:i]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[i+e:];open(p,'w').write(s)
