#!/usr/bin/env python3
"""MoM Sales Tap per petugas, semua TAP (BBT -> penjualan.html D.P, BAA/UJT -> data-tap-pj.js TAPJ[k].P) dari ekstraksi halaman SURYA.
Pakai: python3 tools/mom_all.py <ekstrak.json> <hari>   ; json = {pv_all|sa_all|pv_reg|pv_byu|sa_simpati|sa_byu: {tap:[baris tabel LOKASI], b:[petugas BBT], a:[BAA], u:[UJT]}} (tiap baris = list sel teks)."""
import json,sys
E=json.load(open(sys.argv[1]));DAY=sys.argv[2]
KEY={'pv_all':'PV','sa_all':'SA','pv_reg':'PVR','pv_byu':'PVB','sa_simpati':'SAS','sa_byu':'SAB'}
N=lambda v:0 if v.strip() in('–','-','—','') else int(v.strip().replace(',','').split()[0])
def days(v):
    v=v.strip();return None if v in('–','-','') else int(v.split()[0].replace(',',''))
def row(c):return {"nm":c[0],"mtd":N(c[1]),"m1":N(c[2]),"full":N(c[3]),"daily":N(c[6]),"stok":N(c[7]),"days":days(c[8])}
TAPN={'BBT':'BAGAN BATU','BAA':'BAGAN SIAPI-API','UJT':'UJUNG TANJUNG'};SRC={'BBT':'b','BAA':'a','UJT':'u'}
def build(k,x):
    tr=[r for r in x['tap'] if r[0].replace('+','').strip()==TAPN[k]][0];tr=[tr[0].replace('+','').strip()]+tr[1:]
    rows=[row(r) for r in x[SRC[k]][1:] if any(N(v) for v in r[1:4]+r[6:8])]
    return {"tap":row(tr),"rows":rows}
s=open('penjualan.html').read();i=s.find('const D=')+8;D,e=json.JSONDecoder().raw_decode(s[i:])
fp='data-tap-pj.js';t=open(fp).read();j=t.find('=')+1;J,e2=json.JSONDecoder().raw_decode(t[j:])
for p,K in KEY.items():
    for k in('BBT','BAA','UJT'):
        v=build(k,E[p])
        (D['P'].setdefault(K,{}) if k=='BBT' else J[k].setdefault('P',{}).setdefault(K,{}))[DAY]=v
    print(K,{k:(build(k,E[p])['tap']['mtd'],len(build(k,E[p])['rows'])) for k in TAPN})
open('penjualan.html','w').write(s[:i]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[i+e:])
open(fp,'w').write(t[:j]+json.dumps(J,ensure_ascii=False,separators=(',',':'))+t[j+e2:])
