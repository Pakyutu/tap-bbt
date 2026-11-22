#!/usr/bin/env python3
"""Rasio ST to Redeem varian (By.U, Simpati 357, Unlimited) dari laporan Branch "VF <tgl>".
Pemakaian: python3 tools/rv_varian.py <paste.txt|xlsx-tsv> <hari>   -> RX[<hari>] di digipos-x.js
Kolom (tab): nama, ..., Redeem Reguler(5-8), ST Reguler(9-12, rasio 13), Redeem BYU(14-17), ST BYU(18-21, rasio 22),
Simpati(23-26, rasio 27), Unlimited(28-31, rasio 32). Rasio Simpati/Unlimited = ST ÷ Redeem Reguler."""
import sys,re,json,pathlib
P=pathlib.Path(__file__).resolve().parent.parent/'digipos-x.js'
f,day=sys.argv[1],sys.argv[2]
def n(x):
    x=x.strip().replace('%','')
    if x in('','-'):return 0.0
    if re.search(r',\d{1,2}$',x) and '.' not in x.split(',')[-1] and re.fullmatch(r'-?[\d.]*,\d{1,2}',x):x=x.replace('.','').replace(',','.')
    else:x=x.replace(',','')
    return float(x)
NM=['TAP BAGAN BATU','KUBU','BANGKO PUSAKO','KUBU BABUSSALAM','BAGANSINEMBAH','SIMPANG KANAN','BALAI JAYA','BAGAN SINEMBAH RAYA']
src={}
for ln in open(f,encoding='utf8',errors='ignore'):
    c=ln.rstrip('\n').split('\t')
    if len(c)>=28 and c[0].strip().upper() in NM and c[0].strip().upper() not in src:src[c[0].strip().upper()]=c
if len(src)<8:sys.exit(f'baris tidak lengkap: {sorted(set(NM)-set(src))}')
B,S,U=[],[],[]
for k in NM:
    c=src[k]
    B.append([k,n(c[14]),n(c[15]),n(c[17]),n(c[18]),n(c[19]),n(c[21]),n(c[22])])   # redeem,mom,gap, st,mom,gap, rasio
    S.append([k,n(c[23]),n(c[24]),n(c[26]),n(c[27])])                               # st,mom,gap,rasio(thd redeem reguler)
    U.append([k,n(c[28]),n(c[29]),n(c[31]),n(c[32])] if len(c)>32 else [k,0,0,0,0])
s=P.read_text();new=f'"{day}":'+json.dumps({'B':B,'S':S,'U':U},ensure_ascii=False,separators=(',',':'))
m=re.search(r'^const RX=(\{.*\});$',s,re.M)
if m:
    d=json.loads(m.group(1));d[day]=json.loads(new[new.index(':')+1:]);s=s.replace(m.group(0),'const RX='+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';')
else:
    i=s.index('\n',s.index('const RV='))+1;s=s[:i]+'const RX={'+new+'};\n'+s[i:]
P.write_text(s);print('RX',day,'OK',len(B),'baris')
