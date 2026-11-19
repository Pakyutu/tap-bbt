# Masukkan paste "Dashboard SURYA" (MoM Sales Tap per petugas) ke penjualan.html D.P + penjualan-x.js X (TM/TI/PM/INJ/SV).
# Pakai (dari folder repo): python3 tools/surya_mom.py <paste.txt> PV|SA <hari_cutoff>
import sys,json,re
L=open(sys.argv[1],encoding='utf-8').read().split('\n');PR=sys.argv[2].upper();DAY=sys.argv[3]
N=lambda v:None if v.strip() in('–','-','—','') else int(v.strip().replace(',',''))
def days(v):
    v=v.strip();return None if v in('–','-','') else int(v.split()[0].replace(',',''))
def prow(l):
    c=[x.strip() for x in l.split('\t')]
    return {"nm":c[0],"mtd":N(c[1]) or 0,"m1":N(c[2]) or 0,"full":N(c[3]) or 0,"daily":N(c[6]) or 0,"stok":N(c[7]) or 0,"days":days(c[8])}
h=[k for k,l in enumerate(L) if l.startswith('LOKASI (TAP / SF)')][0]
tap=prow(L[h+1]);rows=[prow(L[k]) for k in range(h+3,len(L)) if L[k].strip() and '\t' in L[k]]
f='penjualan.html';s=open(f).read();i=s.find('const D=')+8;D,e=json.JSONDecoder().raw_decode(s[i:])
D['P'][PR][DAY]={"tap":tap,"rows":rows}
s=s[:i]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[i+e:];open(f,'w').write(s)
print(PR,DAY,'tap',tap,'| petugas',len(rows),'sum mtd',sum(r['mtd'] for r in rows))
if PR=='PV':
    x=open('penjualan-x.js').read();j=x.find('const X=')+8;X,e=json.JSONDecoder().raw_decode(x[j:])
    X['cut']=int(DAY)
    for k,l in enumerate(L):
        c=[v.strip() for v in l.split('\t')]
        if c[0]=='BAGAN BATU' and k>0 and L[k-1].startswith('NAMA TAP') and 'Inject' not in ''.join(L[max(0,k-8):k]):X['TM'][10]=N(c[21]) or X['TM'][10]
        if c[0]=='BAGAN BATU' and k>0 and L[k-1].startswith('NAMA TAP') and 'Inject' in ''.join(L[max(0,k-8):k]):X['TI'][10]=N(c[21]) or X['TI'][10]
        if c[0] in X['PM'] and len(c)>=12 and L[k-1:k] and any(L[q].startswith('Nama Petugas\tJan') for q in range(max(0,k-25),k)):X['PM'][c[0]]=[N(v) or 0 for v in c[1:12]]
        if c[0].endswith(('HARI','JAM')) and len(c)>=12:
            # tabel Validity Group: sebelum judul "Inject Bulanan" = penjualan, sesudahnya = inject
            inj=any('Inject Bulanan' in L[q] for q in range(0,k)) and any('Inject Bulanan' in L[q] for q in range(max(0,k-25),k))
            X.setdefault('SVM',{})
            (X['INJ'] if inj else X['SVM'])[c[0]]=[N(v) or 0 for v in c[1:12]]
    vr=[l for l in L if re.match(r'^BAGAN BATU\t[\d,]+\t[\d,]+\t[\d,]+\t[\d,]+\t[\d,]+\t[\d,]+\t[\d,]+\t[\d,]+\t[\d,]+\t[\d,]+',l)]
    if vr:
        v=vr[0].split('\t');K=["1D","2D","3D","5D","7D","28D","U24","U48"]
        X['SV']={"m1":dict(zip(K,[N(a) or 0 for a in v[1:9]])),"mtd":dict(zip(K,[N(a) or 0 for a in v[10:18]])),"d":int(DAY)}
    x=x[:j]+json.dumps(X,ensure_ascii=False)+x[j+e:];open('penjualan-x.js','w').write(x)
    print('TM nov',X['TM'][10],'TI nov',X['TI'][10],'SV',X['SV'])
