#!/usr/bin/env python3
"""Data outlet Penjualan BAA & UJT -> data-tap-pj.js dari export SURYA (semua TAP dalam satu file):
python3 tools/pj_tap.py --pv Detail_Outlet_PV_*.csv --sa Detail_Outlet_SA_*.csv --ngrs NGRS_2026_TRX.csv
Layout sama dgn penjualan.html D.O: 10 bulan (Jan-Okt) + Okt periode sama (1-DD) + Nov MTD (1-DD). Hanya 1 cutoff (terbaru)."""
import sys,csv,json,re,argparse,os
ap=argparse.ArgumentParser();ap.add_argument('--pv');ap.add_argument('--sa');ap.add_argument('--ngrs');a=ap.parse_args()
R0=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
TD=json.loads(open(R0+'/data-tap.js').read()[12:].rstrip().rstrip(';'))
num=lambda v:int(float(v)) if str(v).strip() not in('','-') else 0
def load(f,idc='ID Outlet'):
    R=list(csv.reader(open(f,encoding='utf-8-sig')));h=R[0]
    mo=[h.index(f'2026-{m:02d}') for m in range(1,11)];k=[j for j,x in enumerate(h) if re.match(r'2026-10 MoM 1-\d+',x)][0]
    c=int(h[k].split('-')[-1]);nv=h.index('2026-11');ix=h.index(idc);kt=h.index('Kategori Outlet');tp=h.index('TAP')
    return c,h,{r[ix].strip():([num(r[j]) for j in mo]+[num(r[k]),num(r[nv])],r[kt],r[tp]) for r in R[1:] if len(r)>nv and r[ix].strip()}
kat=lambda s:'Top 20' if s.startswith('Top 20') else 'Reguler'
try:old=json.loads(open(R0+'/data-tap-pj.js').read()[12:].rstrip().rstrip(';'))
except Exception:old={}
out={k:old.get(k,{'O':[],'N':[],'C':0}) for k in ('BAA','UJT')}
C=0
if a.pv and a.sa:
    c1,_,P=load(a.pv);c2,_,S=load(a.sa)
    if c1!=c2:sys.exit(f'cutoff PV {c1} != SA {c2}')
    C=c1
    for k in out:
        L=[]
        for o in TD[k]['O']:
            p=P.get(o[0]);s=S.get(o[0]);z=[0]*12
            L.append({'id':o[0],'nm':o[1],'rs':o[2],'kec':o[5],'sf':o[4],'pjp':o[3],'kat':kat(p[1]) if p else 'Reguler','pv':(p[0][:10]+[p[0][10],p[0][11]]) if p else z,'sa':(s[0][:10]+[s[0][10],s[0][11]]) if s else z})
        out[k]['O']=L;out[k]['C']=C
if a.ngrs:
    c,h,M=load(a.ngrs);nm=h.index('Nama Outlet');rs=h.index('RS')
    RW={r[h.index('ID Outlet')].strip():r for r in csv.reader(open(a.ngrs,encoding='utf-8-sig')) if r and r[h.index('ID Outlet')].strip()}
    for k,t in (('BAA','BAGAN SIAPI-API'),('UJT','UJUNG TANJUNG')):
        out[k]['N']=[{'id':i,'nm':RW[i][nm],'rs':RW[i][rs],'kat':kat(x[1]),'v':x[0]} for i,x in M.items() if x[2]==t and sum(x[0][:10])>0];out[k]['NC']=c
open(R0+'/data-tap-pj.js','w').write('window.TAPJ='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
print({k:(len(v['O']),len(v['N']),v['C'],v.get('NC')) for k,v in out.items()})
