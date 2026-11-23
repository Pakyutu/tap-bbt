# Stock Gudang TAP (export SURYA "Stock_Gudang_ALL_YYYY-MM-DD.csv") -> penjualan.html D.STK (snapshot per tanggal)
# Pakai: python3 tools/surya_sgall.py <Stock_Gudang_ALL.csv> <tanggal>
import sys,csv,json,re
R=list(csv.reader(open(sys.argv[1],encoding='utf-8-sig')));h=R[0];RW={x[1].strip():x for x in R[1:] if len(x)>2}
# BBT -> D.STK penjualan.html; BAA & UJT -> TAPJ[k].STK di data-tap-pj.js
def nm(c):
    if c=='REGULER SEGEL SEGEL':return('Reguler','Segel')
    if c=='BYU SEGEL BYU SEGEL':return('byU','Segel')
    m=re.match(r'REGULER (\d+) HARI (.+)$',c)
    if m:return('Reguler',f'{m.group(1)} hari {m.group(2)}')
    m=re.match(r'BYU (UNLIMITED \d+ JAM) ',c)
    if m:return('byU',m.group(1))
    m=re.match(r'BYU (\d+) HARI BYU (.+)$',c)
    if m:return('byU',f'{m.group(1)} hari {m.group(2)}')
    m=re.match(r'SA SEGEL PERDANA SEGEL (.+)$',c)
    if m:return('SA','Perdana segel '+m.group(1))
    m=re.match(r'SA SA (SA .+)$',c)
    if m:return('SA',m.group(1))
    return None
def items(r):
    it=[];seen=set()
    for j,c in enumerate(h):
        if j<2 or c.startswith('TOTAL') or c=='GRAND TOTAL' or c in seen:continue
        seen.add(c);k=nm(c);v=int(float(r[j])) if r[j].strip() else 0
        if k and v:it.append([k[0],k[1],v])
    return it
it=items(RW['BAGAN BATU'])
p='penjualan.html';s=open(p).read();i=s.index('const D=')+8;D,e=json.JSONDecoder().raw_decode(s[i:])
d=int(sys.argv[2]);D['STK']=[x for x in D['STK'] if x['d']!=d]+[{'d':d,'items':it}];D['STK'].sort(key=lambda x:x['d'])
s=s[:i]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[i+e:];open(p,'w').write(s)
print(len(it),'item, total',sum(x[2] for x in it),'| snapshot',[x['d'] for x in D['STK']])

import os
fp=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','data-tap-pj.js');J=json.loads(open(fp).read()[12:].rstrip().rstrip(';'))
for k,t in (('BAA','BAGAN SIAPI-API'),('UJT','UJUNG TANJUNG')):
    if t in RW:
        J[k]['STK']=[x for x in J[k].get('STK',[]) if x['d']!=d]+[{'d':d,'items':items(RW[t])}];J[k]['STK'].sort(key=lambda x:x['d']);print(k,'stok',sum(x[2] for x in J[k]['STK'][-1]['items']))
open(fp,'w').write('window.TAPJ='+json.dumps(J,ensure_ascii=False,separators=(',',':'))+';\n')
