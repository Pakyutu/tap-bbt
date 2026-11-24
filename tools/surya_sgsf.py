# Stock Gudang per SF (export SURYA "Stock_Gudang_SF_YYYY-MM-DD.csv") -> penjualan-x.js X.SGF
# Pakai: python3 tools/surya_sgsf.py <Stock_Gudang_SF.csv> <tanggal>
import sys,csv,json,html
R=list(csv.reader(open(sys.argv[1],encoding='utf-8-sig')));h=R[0]
cols=[(j,c) for j,c in enumerate(h) if j>2 and not c.startswith('TOTAL') and c!='GRAND TOTAL']
seen=set();C=[]
for j,c in cols:
    if c in seen:continue
    seen.add(c);C.append((j,c))
n=lambda v:int(float(v)) if v.strip() else 0
rows={'BAGAN BATU':[],'BAGAN SIAPI-API':[],'UJUNG TANJUNG':[]}
for r in R[1:]:
    if len(r)<4 or not r[2].strip() or r[1].strip() not in rows:continue
    rows[r[1].strip()].append([html.unescape(r[2].strip()),[n(r[j]) for j,c in C]])
x=open('penjualan-x.js').read();j=x.find('const X=')+8;X,e=json.JSONDecoder().raw_decode(x[j:])
cn=[c for j,c in C];D=int(sys.argv[2]);X['SGF']={'d':D,'c':cn,'rows':rows['BAGAN BATU']}
x=x[:j]+json.dumps(X,ensure_ascii=False)+x[j+e:];open('penjualan-x.js','w').write(x)
print('BBT baris',len(rows['BAGAN BATU']),'total',sum(sum(r[1]) for r in rows['BAGAN BATU']))
# BAA & UJT -> data-tap-pj.js TAPJ[k].SGF (semua TAP ada di satu file export)
t=open('data-tap-pj.js').read();k=t.find('=')+1;T,e2=json.JSONDecoder().raw_decode(t[k:])
for kk,nm in (('BAA','BAGAN SIAPI-API'),('UJT','UJUNG TANJUNG')):
    if rows[nm]:T[kk]['SGF']={'d':D,'c':cn,'rows':rows[nm]};print(kk,len(rows[nm]))
open('data-tap-pj.js','w').write(t[:k]+json.dumps(T,ensure_ascii=False,separators=(',',':'))+t[k+e2:])
