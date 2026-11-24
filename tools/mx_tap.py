#!/usr/bin/env python3
"""Tren bulanan & inject per validity per TAP (SURYA dashboard, tabel Penjualan Bulanan / Inject Bulanan / MoM per Validity, produk ALL PV)
-> data-tap-mx.js (window.TAPMX). Input: JSON hasil ekstraksi browser {0:tabel TM,1/3/5:petugas BBT/BAA/UJT,2/4/6:validity jual,8:tabel TI,9/10/11:inject validity,13:MoM validity}.
Pakai: python3 tools/mx_tap.py <ekstrak.json> <cutoff_hari>"""
import sys,json
d=json.load(open(sys.argv[1]));cut=int(sys.argv[2])
num=lambda v:0 if v in('-','',None) else int(v.replace(',',''))
TAP=['BBT','BAA','UJT']
def monthly(tb,r):  # baris TAP: Jan..Okt di kolom 1,3,..,19 ; Nov di kolom 21
    row=tb[1+2*r];return [num(row[i]) for i in range(1,20,2)]+[num(row[21])]
def petugas(tb):
    return {r[0]:[num(x) for x in r[1:11]]+[num(r[12])] for r in tb[1:] if r[0] and r[0].upper()!='TOTAL'}
def validity(tb):
    return {r[0]:[num(x) for x in r[1:12]] for r in tb[1:] if r[0] not in('TOTAL','VOICE') and any(num(x) for x in r[1:12])}
K=["1D","2D","3D","5D","7D","28D","U24","U48"];IX=[0,1,2,3,4,6,7,8]  # kolom validity tabel 13: 1D,2D,3D,5D,7D,14D,28D,U24,U48
out={'cut':cut}
for i,t in enumerate(TAP):
    v=[r for r in d['13'] if r[0]==['BAGAN BATU','BAGAN SIAPI-API','UJUNG TANJUNG'][i]][0]
    out[t]={'TM':monthly(d['0'],i),'TI':monthly(d['8'],i),'PM':petugas(d[str([1,3,5][i])]),'SVM':validity(d[str([2,4,6][i])]),'INJ':validity(d[str([9,10,11][i])]),
      'SV':{'m1':{k:num(v[1+j]) for k,j in zip(K,IX)},'mtd':{k:num(v[11+j]) for k,j in zip(K,IX)},'d':cut}}
    print(t,'TM nov',out[t]['TM'][-1],'TI nov',out[t]['TI'][-1],'petugas',len(out[t]['PM']),'validity',len(out[t]['SVM']),len(out[t]['INJ']),'SV mtd sum',sum(out[t]['SV']['mtd'].values()))
open('data-tap-mx.js','w').write('// Tren bulanan & inject per TAP (tools/mx_tap.py)\nwindow.TAPMX='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
