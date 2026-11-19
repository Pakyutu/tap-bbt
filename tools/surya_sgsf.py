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
rows=[]
for r in R[1:]:
    if len(r)<4 or not r[2].strip():continue
    v=[n(r[j]) for j,c in C]
    rows.append([html.unescape(r[2].strip()),v])
x=open('penjualan-x.js').read();j=x.find('const X=')+8;X,e=json.JSONDecoder().raw_decode(x[j:])
X['SGF']={'d':int(sys.argv[2]),'c':[c for j,c in C],'rows':rows}
x=x[:j]+json.dumps(X,ensure_ascii=False)+x[j+e:];open('penjualan-x.js','w').write(x)
print('kolom',len(C),'baris',len(rows),'total',sum(sum(r[1]) for r in rows))
