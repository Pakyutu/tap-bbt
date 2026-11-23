# Update ST VF/SA per outlet dari file "Monitoring ST Product <bulan> Cluster Rohil" (sheet "ST Product VF" & "ST Product SA").
# Tambahan: ST BAA & UJT (data-tap.js) selalu ikut diisi; BBT (D.O) ikut diisi kecuali pakai --nobbt (kalau data BBT lebih baru).
# Pakai: python3 tools/st_product.py <file.xlsx>   -> kolom vr/vb/ss/sb D.O di digipos.html (SF/PJP tidak diubah)
import sys,json,re,openpyxl
BBT='--nobbt' not in sys.argv
wb=openpyxl.load_workbook([a for a in sys.argv[1:] if a[0]!='-'][0],read_only=True,data_only=True)
n=lambda x:int(x) if isinstance(x,(int,float)) else 0
def load(sh):
    M={};upd=''
    for r in wb[sh].iter_rows(min_row=3,max_col=18,values_only=True):
        if r[0] and str(r[0]).isdigit():M[str(r[0])]=(n(r[6]),n(r[7]))
        if not upd:
            for c in r[14:18]:
                if c and 'update tanggal' in str(c):upd=str(c).replace('update tanggal ','');break
    return M,upd
V,uv=load('ST Product VF');A,ua=load('ST Product SA')
f='digipos.html';s=open(f).read();a=s.find('const D=')+8;D,e=json.JSONDecoder().raw_decode(s[a:])
old=[sum(o[k] for o in D['O']) for k in (6,7,8,9)];miss=[]
for o in (D['O'] if BBT else []):
    if o[0] in V:o[7],o[6]=V[o[0]]
    else:miss.append(o[1])
    if o[0] in A:o[9],o[8]=A[o[0]]
new=[sum(o[k] for o in D['O']) for k in (6,7,8,9)]
s=s[:a]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[a+e:];open(f,'w').write(s)
print('update VF',uv,'SA',ua,'| lama [VFreg,VFbyu,SAsimp,SAbyu]',old,'baru',new,'| tidak ada',miss)

# TAP lain (data-tap.js)
tp=open('data-tap.js').read();TD=json.loads(tp[len('window.TAPD='):tp.rindex(';')])
for k,x in TD.items():
    for o in x['O']:
        if o[0] in V:o[7],o[6]=V[o[0]]
        if o[0] in A:o[9],o[8]=A[o[0]]
    print(k,'VFreg',sum(o[6] for o in x['O']),'VFbyu',sum(o[7] for o in x['O']),'SAsimp',sum(o[8] for o in x['O']),'SAbyu',sum(o[9] for o in x['O']))
open('data-tap.js','w').write('window.TAPD='+json.dumps(TD,ensure_ascii=False,separators=(',',':'))+';\n')
