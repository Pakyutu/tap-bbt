#!/usr/bin/env python3
# Dropingan SN per SF untuk TAP selain BBT (sheet "SN STOCK SF NOV 2026": DROPINGAN VF / DROPINGAN SA) -> wl-tap.js
# Pakai: python3 tools/wl_tap.py <vf.txt> <sa.txt> [TAP=BAA]   baris: tgl(YYYY-DD-MM)|SF|denom|SN awal|SN akhir|qty
import sys,re,json,collections
tap=sys.argv[3] if len(sys.argv)>3 else 'BAA'
SF={'TRI KURNIA':'Tri Kurnia Intan','WAHYU':'Wahyu Mahardika','SUHENDRO':'Suhendro'}
def den(d,sa):
    s=re.sub(r'\s+',' ',d.upper().replace(',','.')).strip()
    if sa:
        if s=='PRELOAD':return 'Preload'
        s=s.replace('SA 5H','SA 5GB')
        m=re.match(r'SA (BYU )?(\d+)GB',s);return ('SA ByU ' if m and m.group(1) else 'SA ')+m.group(2)+'GB' if m else ('SA ByU' if s=='SA BYU' else 'SA Addin' if s=='SA ADDIN' else s.title())
    m=re.match(r'B\.YU ([\d.]+)GB (\d+)H',s)
    if m:return f'ByU {m.group(1)}GB {m.group(2)}H'
    m=re.match(r'(\d+)GB (\d+)H',s);return f'VF {m.group(1)}GB {m.group(2)}H' if m else s
def load(p,sa):
    R=[];warn=[]
    for l in open(p,encoding='utf-8'):
        l=l.strip()
        if not l:continue
        d,sf,dn,a,b,q=l.split('|');y,dd,mm=d.split('-');q=int(q)
        if int(b)-int(a)+1!=q:warn.append(f'qty tidak cocok {a}-{b}')
        dd0=den(dn,sa)
        if re.match(r'VF 7GB (52|57)H',dd0):warn.append(f'denom meragukan "{dn}" ({sf} {a}-{b}, {q} pcs)')
        R.append([f'{y}-{mm}-{dd}',SF.get(sf,sf),dd0,a,b,q])
    # SN ganda / tumpang tindih
    S=sorted(R,key=lambda r:(len(r[3]),r[3]));
    for x,y in zip(S,S[1:]):
        if len(x[3])==len(y[3]) and int(y[3])<=int(x[4]):warn.append(f'SN tumpang tindih {x[3]}-{x[4]} & {y[3]}-{y[4]} ({x[1]} {x[0]} / {y[1]} {y[0]})')
    return R,warn
VF,w1=load(sys.argv[1],False);SA,w2=load(sys.argv[2],True)
for w in w1+w2:print('!',w)
print('VF',len(VF),sum(r[5] for r in VF),'SA',len(SA),sum(r[5] for r in SA))
for k,R in (('VF',VF),('SA',SA)):
    c=collections.Counter()
    for r in R:c[(r[1],r[2])]+=r[5]
    print(k,dict(c))
p='wl-tap.js';
try:
    t=open(p).read();W=json.loads(t[t.index('=')+1:].rstrip().rstrip(';'))
except Exception:W={}
W[tap]={'upd':max(r[0] for r in VF+SA),'VF':VF,'SA':SA}
open(p,'w').write('// Dropingan SN per SF (TAP selain BBT), dibuat dari tools/wl_tap.py\nconst WLT='+json.dumps(W,ensure_ascii=False,separators=(',',':'))+';\n')
