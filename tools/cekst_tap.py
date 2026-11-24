#!/usr/bin/env python3
"""Cek WL vs ST untuk TAP selain BBT (BAA, UJT): dropingan dari wl-tap.js (rentang SN per SF) dibandingkan raw ST (PV & SA, memuat semua TAP)
-> CK.TAP[tap] di cekst-data.js (bentuk sama dengan CK.G BBT). Pakai: python3 tools/cekst_tap.py --pv raw_st_pv*.xlsx --sa raw_st_sp*.xlsx"""
import sys,json,argparse,datetime,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import cekst_build as B
ap=argparse.ArgumentParser();ap.add_argument('--pv',nargs='*',default=[]);ap.add_argument('--sa',nargs='*',default=[]);a=ap.parse_args()
HOME={'BAA':'BAGAN SIAPI-API','UJT':'UJUNG TANJUNG'}
t=open('wl-tap.js').read();W=json.loads(t[t.index('{'):t.rindex('}')+1])
def expand(rs,w):
    out=[]
    for d,sf,p,a0,a1,q in rs:
        for v in range(int(a0),int(a1)+1):out.append((d,str(v).zfill(w),p,sf))
    return out
L={k:{'VF NOV':expand(W[k]['VF'],12),'SA NOV':expand(W[k]['SA'],16)} for k in W if k in HOME}
need_v={B.key(x[1]) for k in L for x in L[k]['VF NOV']};need_s={B.key(x[1]) for k in L for x in L[k]['SA NOV']}
STv,STs,mx={},{},{}
B.raw(a.pv,need_v,STv,mx);B.raw(a.sa,need_s,STs,mx)
cv=max([v for k,v in mx.items() if k in a.pv] or [''])
cs=max([v for k,v in mx.items() if k in a.sa] or [''])
T={}
for k in L:
    G={}
    for g,st in(('VF NOV',STv),('SA NOV',STs)):
        rows=L[k][g]
        if rows:G[g]=B.build(rows,st,home=HOME[k]);print(k,g,sum(o['s'] for o in G[g]['sf']),'/',len(rows),file=sys.stderr)
    T[k]={'G':G,'DM':B.dm(L[k]),'cutVF':cv,'cutSA':cs,'wl':W[k]['upd']}
t0=open('cekst-data.js').read();CK=json.JSONDecoder().raw_decode(t0[t0.index('const CK=')+9:])[0]
CK['TAP']=T;CK['ft']['pv']=max([B.ftime(p) for p in a.pv]+[CK['ft'].get('pv','')]);CK['ft']['sa']=max([B.ftime(p) for p in a.sa]+[CK['ft'].get('sa','')])
open('cekst-data.js','w').write('// Hasil cek WL dropingan vs ST Digipos (dibuat dari tools/cekst_build.py + tools/cekst_tap.py)\nconst CK='+json.dumps(CK,separators=(',',':'),ensure_ascii=False)+';\n')
