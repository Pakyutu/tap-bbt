# Masukkan paste "Stock on Hand" SURYA ke penjualan-x.js (X.SOHV untuk PV, X.SOHS untuk SA).
# Pakai (dari folder repo): python3 tools/surya_soh.py <paste.txt> PV|SA <hari_MTD> [hari_paste]
import sys,json,re
txt=open(sys.argv[1],encoding='utf-8').read();PR=sys.argv[2].upper();AD=int(sys.argv[3]);D=int(sys.argv[4]) if len(sys.argv)>4 else AD+1
m=re.search(r'sisa hari kerja \((\d+) hari\)',txt);sisa=int(m.group(1)) if m else None
N=lambda v:int(v.replace(',','').strip() or 0)
rows={}
for l in txt.split('\n'):
    c=[x.strip() for x in l.split('\t')]
    if len(c)>=10 and c[1]=='BAGAN BATU' and c[9].startswith('STOCK'):
        v=c[3];v=int(v.split()[0]) if PR=='PV' else v
        rows[(c[0],v)]=[c[0],v,N(c[4]),N(c[5]),N(c[6]),N(c[7]),N(c[8]),c[9].replace('STOCK ','')]
R=list(rows.values())
x=open('penjualan-x.js').read();j=x.find('const X=')+8;X,e=json.JSONDecoder().raw_decode(x[j:])
K='SOHV' if PR=='PV' else 'SOHS';old=X.get(K,{})
X[K]={**{k:v for k,v in old.items() if k!='rows'},'d':D,'ad':AD,'sisa':sisa or old.get('sisa'),'rows':R}
x=x[:j]+json.dumps(X,ensure_ascii=False)+x[j+e:];open('penjualan-x.js','w').write(x)
print(K,'baris',len(R),'sisa HK',sisa,'target',sum(r[2] for r in R),'jual',sum(r[4] for r in R),'stok',sum(r[5] for r in R),'kurang',sum(r[6] for r in R))
