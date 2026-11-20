# Terapkan tools/cekst_terpakai.txt ke cekst-data.js yang sudah ada (tanpa build ulang):
# SN terpakai dibuang dari rentang belum ST & dikurangi dari jumlah drop (d) per produk/SF; G[k].tp = jumlah SN terpakai.
import json,sys
TP=set()
for ln in open('tools/cekst_terpakai.txt'):
    ln=ln.split('#')[0].strip()
    if not ln:continue
    x,_,y=ln.partition('-');y=y or x
    for v in range(int(x),int(y)+1):TP.add(v)
p='cekst-data.js';t=open(p).read();i=t.index('const CK=')+9;CK,e=json.JSONDecoder().raw_decode(t[i:])
rep=[]
for g,G in CK['G'].items():
    hit=0
    for sf in G['sf']:
        for pr in sf['p']:
            nb=[]
            for r in pr['b']:
                a_,_,b_=r.partition('-');b_=b_ or a_;A,B=int(a_),int(b_);L=len(a_)
                cut=sorted(v for v in TP if A<=v<=B)
                if not cut:nb.append(r);continue
                cur=A
                for c in cut:
                    if c>cur:nb.append(str(cur).zfill(L) if c-1==cur else f'{str(cur).zfill(L)}-{str(c-1).zfill(L)}')
                    cur=c+1;hit+=1;pr['d']-=1;sf['d']-=1;rep.append((g,sf['n'],pr['p'],str(c).zfill(L)))
                if cur<=B:nb.append(str(cur).zfill(L) if cur==B else f'{str(cur).zfill(L)}-{str(B).zfill(L)}')
            pr['b']=nb
    if hit:G['tp']=G.get('tp',0)+hit
t=t[:i]+json.dumps(CK,ensure_ascii=False,separators=(',',':'))+t[i+e:];open(p,'w').write(t)
for r in rep:print(*r)
print('dikeluarkan',len(rep))
