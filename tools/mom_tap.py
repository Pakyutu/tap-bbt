#!/usr/bin/env python3
"""MoM Sales Tap BAA & UJT -> TAPJ[k].P di data-tap-pj.js. Sumber: dashboard SURYA (halaman MoM Sales Tap, filter Produk & Tanggal MoM),
dibaca dari file JSON hasil ekstraksi: {N: nama petugas [nama,full], P: {pv_all|sa_all: {hari:{BAA|UJT:{t:[mtd,m1,full,stok],r:[[idx,mtd,m1,stok]...]}}}, pv_reg|pv_byu|sa_simpati|sa_byu: {BAA..}}}
Pakai: python3 tools/mom_tap.py <dir berisi N.json pv_all.json sa_all.json var21.json> <hari_variant>"""
import sys,json,os
d=sys.argv[1];DV=sys.argv[2] if len(sys.argv)>2 else '21'
L=lambda f:json.load(open(os.path.join(d,f)))
N=L('N.json');V=L('var21.json')
fp=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','data-tap-pj.js');J=json.loads(open(fp).read()[12:].rstrip().rstrip(';'))
TAPN={'BAA':'BAGAN SIAPI-API','UJT':'UJUNG TANJUNG'}
def conv(k,x,day):
    day=int(day);dl=lambda m:round(m/day) if m else 0
    def row(nm,mtd,m1,full,stok):
        dy=dl(mtd);return {"nm":nm,"mtd":mtd,"m1":m1,"full":full,"daily":dy,"stok":stok,"days":(round(stok/(mtd/day)) if mtd>0 else None)}
    t=x['t'];tap=row(TAPN[k],t[0],t[1],t[2],t[3])
    rows=[row(N[k][r[0]][0],r[1],r[2],N[k][r[0]][1],r[3]) for r in x['r']]
    return {"tap":tap,"rows":rows}
for k in ('BAA','UJT'):J[k]['P']={}
for key,f in (('PV','pv_all.json'),('SA','sa_all.json')):
    A=L(f)
    for day,v in A.items():
        for k in ('BAA','UJT'):J[k]['P'].setdefault(key,{})[day]=conv(k,v[k],day)
for key,pk in (('PVR','pv_reg'),('PVB','pv_byu'),('SAS','sa_simpati'),('SAB','sa_byu')):
    for k in ('BAA','UJT'):J[k]['P'].setdefault(key,{})[DV]=conv(k,V[pk][k],DV)
open(fp,'w').write('window.TAPJ='+json.dumps(J,ensure_ascii=False,separators=(',',':'))+';\n')
for k in ('BAA','UJT'):print(k,{p:len(v) for p,v in J[k]['P'].items()},J[k]['P']['PV'][DV]['tap'])
