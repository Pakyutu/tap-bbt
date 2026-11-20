# Biometrik outlet (file "Outlet_Biometrik_Sumbagteng_2026_*.xlsx", sheet trx + Sheet1):
#  1) digipos-cvm.js: CV.v[id][4] = [Okt full, Okt periode sama (1-d), Nov MTD (1-d)] = trx Biometrik SUKSES channel Outlet (tervalidasi cocok 607/608 dgn export sebelumnya)
#  2) digipos.html: D.FR = Top 20 outlet TAP BBT (Sheet1 kolom "TOP 20" = TOP 20 OUTLET TAP, tap BAGAN BATU), nama/SF/kecamatan dari PJP (D.O), jumlah = Nov MTD, flag = jumlah>0
# Pakai: python3 tools/biometrik.py <file.xlsx> "DD Nov"   (lalu update status.json: Biometrik + FR Biometric)
import sys,json,re,collections,openpyxl
f,lab=sys.argv[1],sys.argv[2];d=int(lab.split()[0])
w=openpyxl.load_workbook(f,read_only=True,data_only=True)
c=collections.defaultdict(lambda:[0,0,0])
it=w['trx'].iter_rows(values_only=True);next(it)
for r in it:
    if r[0] is None or r[6]!='SUKSES' or r[8]!='Outlet' or r[11]!='Biometrik' or not r[12]:continue
    dt=r[12];oid=str(r[9])
    if dt.year!=2026:continue
    if dt.month==10:
        c[oid][0]+=1
        if dt.day<=d:c[oid][1]+=1
    elif dt.month==11 and dt.day<=d:c[oid][2]+=1
top={}
for r in w['Sheet1'].iter_rows(min_row=5,values_only=True):
    if r[2]=='TOP 20 OUTLET TAP' and r[5]=='BAGAN BATU':top.setdefault(str(r[0]),(r[3],r[4]))
p='digipos-cvm.js';t=open(p).read();m=re.search(r'const CV=',t);CV,e=json.JSONDecoder().raw_decode(t[m.end():])
ch=0
for oid,v in CV['v'].items():
    n=c.get(oid,[0,0,0])
    if v[4]!=n:ch+=1
    v[4]=n
CV.setdefault('dd',{})['4']='export '+lab
t=t[:m.end()]+json.dumps(CV,ensure_ascii=False,separators=(',',':'))+t[m.end()+e:];open(p,'w').write(t)
print('CV.v[4] berubah',ch,'dari',len(CV['v']),'| total Nov MTD',sum(v[4][2] for v in CV['v'].values()))
p='digipos.html';s=open(p).read();i=s.index('const D=')+8;D,e=json.JSONDecoder().raw_decode(s[i:])
O={str(o[0]):o for o in D['O']}
rows=[]
for oid,(kec,sf) in top.items():
    o=O.get(oid);n=c.get(oid,[0,0,0])[2]
    rows.append([oid,o[1] if o else '?',(o[4] if o else sf),(o[5] if o else kec),n,1 if n>0 else 0])
    if not o:print('tidak di PJP:',oid,kec,sf)
rows.sort(key=lambda r:(r[2],r[3],r[0]))
old={r[0] for r in D['FR']['rows']};D['FR']={'d':d,'rows':rows}
s=s[:i]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[i+e:];open(p,'w').write(s)
print('FR Top 20:',len(rows),'ikut',sum(r[5] for r in rows),'masuk',sorted({r[0] for r in rows}-old),'keluar',sorted(old-{r[0] for r in rows}))
