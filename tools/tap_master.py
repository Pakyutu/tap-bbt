#!/usr/bin/env python3
"""Master outlet per TAP (Outletlist_*.xlsx, sheet OutletList, KET PJP=1) -> data-tap.js.
BBT tetap di digipos.html (D.O); file ini hanya BAA & UJT. Target SF = rasio BBT (perkiraan)."""
import sys,json,openpyxl,collections
f=sys.argv[1]
ws=openpyxl.load_workbook(f,read_only=True)['OutletList']
R=list(ws.iter_rows(values_only=True));ix={k:i for i,k in enumerate(R[0])}
SH={'BAGAN SIAPI-API':'BAA','UJUNG TANJUNG':'UJT'}
RT=[.959,.314,.796,.365]  # Reg, By.U (VF) ; Simpati, By.U (SA) dibanding jumlah outlet
O={};U={}
for r in R[1:]:
    t=SH.get(r[ix['TAP']])
    if not t or r[ix['KET PJP']]!=1: continue
    i=str(r[ix['Outlet ID']])
    O.setdefault(t,[]).append([i,r[ix['Nama Outlet']],str(r[ix['No Rs']] or ''),(r[ix['Hari']] or '').title(),(r[ix['Nama Sf']] or '').title(),(r[ix['Kecamatan']] or '').title(),0,0,0,0])
    if r[ix['LOGIN CODE']]: U[i]=r[ix['LOGIN CODE']]
out={}
for t,L in O.items():
    c=collections.Counter(o[4] for o in L)
    out[t]={'O':L,'T':{s:[round(n*RT[0]),round(n*RT[1])] for s,n in c.items()},'TS':{s:[round(n*RT[2]),round(n*RT[3])] for s,n in c.items()},'U':{o[0]:U[o[0]] for o in L if o[0] in U}}
import os,re
if os.path.exists('data-tap.js'):  # pertahankan ST yang sudah terisi
    old=json.loads(open('data-tap.js').read()[12:].rstrip().rstrip(';'));M={o[0]:o[6:] for x in old.values() for o in x['O']}
    for x in out.values():
        for o in x['O']:
            if o[0] in M:o[6:]=M[o[0]]
open('data-tap.js','w').write('window.TAPD='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
print({t:len(v['O']) for t,v in out.items()})
