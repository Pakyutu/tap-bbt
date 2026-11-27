#!/usr/bin/env python3
"""Program per outlet dari SURYA Detail Outlet (semua TAP) -> CV di digipos-cvm.js:
CVM, Super Seru, Comsak, Hot Promo, Biometrik, Renewal By.U masing-masing [FM1, M1, MTD].
Pakai: python3 tools/detail_outlet.py <baris.json> <hari_cutoff> ; baris.json = hasil ekstrak tabel Detail Outlet
(tiap baris: id,nama,kec,sf,tap,pjp,kategori, lalu blok 5 kolom: ST SA, ST PV, CVM, Super Seru, Comsak, Hot Promo, Renewal BYU, Biometrik, 6 kolom Titip Jual)."""
import json,sys,datetime
R=json.load(open(sys.argv[1]));d=int(sys.argv[2])
n=lambda x:int(str(x).replace(',','')) if str(x) not in('–','') else 0
COL=[('CVM',17),('Super Seru',22),('Comsak',27),('Hot Promo',32),('Biometrik',42),('Renewal By.U',37)]
p='digipos-cvm.js';t=open(p).read();i=t.index('const CV=')+9;CV,e=json.JSONDecoder().raw_decode(t[i:])
G=[g for g,_ in COL];old=CV['g']
V={}
for r in R:V[r[0]]=[[n(r[c]),n(r[c+1]),n(r[c+2])] for _,c in COL]
for k,v in CV['v'].items():  # outlet lama yang tidak ada di SURYA: pertahankan, lengkapi kolom baru
    if k not in V:V[k]=[v[old.index(g)] if g in old and old.index(g)<len(v) else [0,0,0] for g in G]
CV['g']=G;CV['v']=V;CV['d']=d;CV['dd']={}
open(p,'w').write(t[:i]+json.dumps(CV,separators=(',',':'),ensure_ascii=False)+t[i+e:])
tot=[sum(v[k][2] for v in V.values()) for k in range(len(G))]
print(f'Detail Outlet {d} Nov: '+' · '.join(f'{g} {x}' for g,x in zip(G,tot)),f'({len(V)} outlet)')
