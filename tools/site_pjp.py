#!/usr/bin/env python3
"""Peta site semua TAP Rohil dari file "Update PJP dan Site Cluster Rokan Hilir" (sheet PJP, Detail Site, Kecamatan Revenue VF)
-> SITE.SI (outlet->[site,kec]) & SITE.S (site->[nama,desa,kec,class,lat,lng,redeemVF,suryaVF,soSP,suryaSP,qtyOkt,qtyNov,revOkt,revNov]) di digipos-site.js.
Pakai: python3 tools/site_pjp.py <file.xlsx>   (lalu jalankan ulang site_rev.py untuk revenue Telkomsel per site)"""
import sys,json,openpyxl
p='digipos-site.js';s=open(p).read();i=s.index('const SITE=')+11;SITE,e=json.JSONDecoder().raw_decode(s[i:])
wb=openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True)
n=lambda v:v if isinstance(v,(int,float)) else 0
rev={r[0]:r for r in wb['Kecamatan Revenue VF'].iter_rows(min_row=3,max_col=15,values_only=True) if r[0]}
S=dict(SITE['S'])
for r in wb['Detail Site'].iter_rows(min_row=3,max_col=20,values_only=True):
    if not r[0] or not isinstance(r[10],(int,float)):continue
    v=rev.get(r[0])
    S[r[0]]=[r[1],r[5],r[6],r[8],float(r[3]),float(r[2]),int(n(r[11])),int(n(r[12])),int(n(r[16])),int(n(r[17])),int(n(v[9])) if v else 0,int(n(v[10])) if v else 0,int(n(v[12])) if v else 0,int(n(v[13])) if v else 0]
SI={}
for r in wb['PJP'].iter_rows(min_row=2,max_col=8,values_only=True):
    if r[0] and r[6]:SI[str(int(r[0]))]=[r[6],str(r[7] or '').strip()]
miss=[k for k in SI.values() if k[0] not in S]
SITE['S']=S;SITE['SI']=SI
open(p,'w').write(s[:i]+json.dumps(SITE,ensure_ascii=False,separators=(',',':'))+s[i+e:])
print('site',len(S),'outlet->site',len(SI),'site tak ada di Detail',len(miss))
