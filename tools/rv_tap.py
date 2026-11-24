#!/usr/bin/env python3
"""Redeem vs ST + rasio varian untuk semua TAP dari laporan Branch "VF <tgl>" (paste tab).
Pemakaian: python3 tools/rv_tap.py <paste.txt> <hari>
BBT -> RV[hari] & RX[hari]; BAA/UJT -> RVT[tap][hari] & RXT[tap][hari] (digipos-x.js). Reguler tidak tampil di RX (lewat RV)."""
import sys,re,json,pathlib
P=pathlib.Path(__file__).resolve().parent.parent/'digipos-x.js'
f,day=sys.argv[1],sys.argv[2]
def n(x):
    x=x.strip().replace('%','')
    if x in('','-'):return 0.0
    return float(x.replace(',',''))
TAPS={'BBT':['TAP BAGAN BATU','KUBU','BANGKO PUSAKO','KUBU BABUSSALAM','BAGANSINEMBAH','SIMPANG KANAN','BALAI JAYA','BAGAN SINEMBAH RAYA'],
 'BAA':['TAP BAGAN SIAPI-API','PEKAITAN','BANGKO','BATU HAMPAR','SINABOI','PASIR LIMAU KAPAS'],
 'UJT':['TAP UJUNG TANJUNG','RANTAU KOPAR','TANJUNG MEDAN','PUJUD','TANAH PUTIH','RIMBA MELINTANG','TANAH PUTIH TANJUNG MELAWAN']}
CL='CLUSTER ROKAN HILIR'
src={};on=False
for ln in open(f,encoding='utf8',errors='ignore'):
    c=ln.rstrip('\n').split('\t');k=c[0].strip().upper().strip('"')
    if k==CL:on=True
    if on and len(c)>=28 and k not in src:src[k]=c
need=[x for v in TAPS.values() for x in v]+[CL]
miss=[x for x in need if x not in src]
if miss:sys.exit(f'baris tidak ada: {miss}')
rv=lambda k:[k]+[n(src[k][i]) for i in range(1,14)]
def rx(k):
    c=src[k];U=[n(c[28]),n(c[29]),n(c[31]),n(c[32])] if len(c)>32 else [0,0,0,0]
    return ([k,n(c[14]),n(c[15]),n(c[17]),n(c[18]),n(c[19]),n(c[21]),n(c[22])],[k,n(c[23]),n(c[24]),n(c[26]),n(c[27])],[k]+U)
def pack(names):
    B,S,U=[],[],[]
    for k in names:b,s,u=rx(k);B.append(b);S.append(s);U.append(u)
    return {'B':B,'S':S,'U':U}
s=P.read_text()
def getj(name):
    m=re.search(r'^const '+name+r'=(\{.*\});$',s,re.M);return m,(json.loads(m.group(1)) if m else None)
mV,V=getj('RV')
if mV is None:  # RV ditulis dengan spasi setelah ':' -> parse manual
    i=s.index('const RV=')+9;V,e=json.JSONDecoder().raw_decode(s[i:]);mV=re.compile(re.escape(s[i-9:i+e])+';?')
V[day]=[rv(k) for k in TAPS['BBT']]
_,X=getj('RX');X=X or {};X[day]=pack(TAPS['BBT'])
_,VT=getj('RVT');VT=VT or {};_,XT=getj('RXT');XT=XT or {}
for t in('BAA','UJT'):
    VT.setdefault(t,{})[day]=[rv(k) for k in TAPS[t]];XT.setdefault(t,{})[day]=pack(TAPS[t])
# gabungan Cluster Rohil: baris total cluster (diberi awalan TAP supaya dianggap total) + semua kecamatan
tot='TAP CLUSTER ROHIL';kec=[k for t in TAPS for k in TAPS[t][1:]]
VT.setdefault('ALL',{})[day]=[[tot]+rv(CL)[1:]]+[rv(k) for k in kec]
a=pack([CL]+kec)
for q in a:a[q][0][0]=tot
XT.setdefault('ALL',{})[day]=a
js=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'))
lines=s.split('\n');out=[];seen=set()
for ln in lines:
    if ln.startswith('const RV='):ln='const RV='+js(V)+';'
    elif ln.startswith('const RX='):ln='const RX='+js(X)+';'
    elif ln.startswith('const RVT=') or ln.startswith('const RXT='):continue
    out.append(ln)
    if ln.startswith('const RX='):out+=['const RVT='+js(VT)+';','const RXT='+js(XT)+';']
txt='\n'.join(out)
if 'const RX=' not in txt:sys.exit('RX tidak ada')
P.write_text(txt);print('OK',day,{t:len(v) for t,v in VT.items()},'RV BBT hari',sorted(V,key=int))
