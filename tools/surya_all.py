#!/usr/bin/env python3
"""Gabung hasil tarikan SURYA (JSON browser: {mom:{produk:{hari:{BBT|BAA|UJT:{t,r}}}},soh}) -> MoM Petugas semua TAP.
BBT -> penjualan.html D.P ; BAA/UJT -> data-tap-pj.js TAPJ[k].P. Pakai: python3 tools/surya_all.py <file.json>"""
import sys,json
d=json.load(open(sys.argv[1]));M=d['mom']
NM={'BBT':'BAGAN BATU','BAA':'BAGAN SIAPI-API','UJT':'UJUNG TANJUNG'}
KEY={'pv_all':'PV','sa_all':'SA','pv_reg':'PVR','pv_byu':'PVB','sa_simpati':'SAS','sa_byu':'SAB'}
R=lambda nm,a:{"nm":nm,"mtd":a[0],"m1":a[1],"full":a[2],"daily":a[3],"stok":a[4],"days":a[5]}
conv=lambda k,x:{"tap":R(NM[k],x['t']),"rows":[R(r[0],r[1:]) for r in x['r']]}
f='penjualan.html';s=open(f).read();i=s.find('const D=')+8;D,e=json.JSONDecoder().raw_decode(s[i:])
fp='data-tap-pj.js';J=json.loads(open(fp).read()[12:].rstrip().rstrip(';'))
for p,v in M.items():
    for day,x in v.items():
        for k,y in x.items():
            c=conv(k,y)
            (D['P'] if k=='BBT' else J[k]['P']).setdefault(KEY[p],{})[day]=c
s=s[:i]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[i+e:];open(f,'w').write(s)
open(fp,'w').write('window.TAPJ='+json.dumps(J,ensure_ascii=False,separators=(',',':'))+';\n')
x=open('penjualan-x.js').read();j=x.find('const X=')+8;X,e=json.JSONDecoder().raw_decode(x[j:])
mx=max(map(int,M['pv_all']));X['cut']=mx;X['TM'][10]=M['pv_all'][str(mx)]['BBT']['t'][0]
open('penjualan-x.js','w').write(x[:j]+json.dumps(X,ensure_ascii=False)+x[j+e:])
for n,P in [('BBT',D['P'])]+[(k,J[k]['P']) for k in('BAA','UJT')]:print(n,{q:len(v) for q,v in P.items()})
