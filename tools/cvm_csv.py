#!/usr/bin/env python3
"""CVM per outlet dari CSV SURYA (Detail_Outlet_CVM_YYYY-MM-DD.csv) -> CV.v[id][0..3] di digipos-cvm.js.
Tolak (exit 3) bila file lebih lama dari data dashboard atau program Nov masih 0. Pakai --dry untuk uji."""
import sys,csv,json,re,os
a=[x for x in sys.argv[1:] if not x.startswith('--')];f=a[0];dry='--dry' in sys.argv
p=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','digipos-cvm.js')
m=re.search(r'(\d{4})-(\d\d)-(\d\d)',os.path.basename(f))
if not m:print('Nama file tanpa tanggal (YYYY-MM-DD)');sys.exit(3)
d=int(m.group(3))
R=list(csv.reader(open(f,encoding='utf-8-sig')));h=R[0];M={r[0].strip():r for r in R[1:] if r}
s=open(p).read();i=s.index('const CV=')+9;CV,e=json.JSONDecoder().raw_decode(s[i:])
n=lambda v:int(float(v)) if v.strip() not in('','-') else 0
G=CV['g'][:4]
if d<CV['d']:print(f'File {d} Nov lebih lama dari data dashboard ({CV["d"]} Nov). Tidak dimasukkan.');sys.exit(3)
tot={g:sum(n(M[k][h.index(f'{g} Nov')]) for k in CV['v'] if k in M) for g in G}
z=[g for g in G if tot[g]==0]
if z:print('Program Nov masih 0: '+', '.join(z)+'. Tidak dimasukkan.');sys.exit(3)
for k,v in CV['v'].items():
    r=M.get(k)
    for gi,g in enumerate(G):
        v[gi]=[n(r[h.index(f'{g} {c}')]) for c in ('Okt','Okt-MoM','Nov')] if r else [v[gi][0],0,0]
CV['d']=d
print(f'CVM {d} Nov masuk: '+' · '.join(f'{g} {tot[g]}' for g in G))
if not dry:open(p,'w').write(s[:i]+json.dumps(CV,ensure_ascii=False,separators=(',',':'))+s[i+e:])
