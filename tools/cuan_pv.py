# Program Cuan PV Redeem: python3 tools/cuan_pv.py <Monitoring_Klik_Misi_dan_FR.xlsx | CUAN_PV_Redeem_YYYYMMDD.xlsx> "DD Nov"
# Ambil sheet "Reedem PV" -> baris const CU=... di digipos-cuan.js (outlet PJP semua TAP Rohil: BBT+BAA+UJT).
import sys,json,re,openpyxl
s=open('digipos.html').read();i=s.index('const D=')+8
D,_=json.JSONDecoder().raw_decode(s[i:]);from tapids import ALL as ids
wb=openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True)
n=lambda v:v if isinstance(v,(int,float)) else 0
o={}
# format lama: sheet "Reedem PV" (file Monitoring Klik Misi & FR); format baru: file CUAN_PV_Redeem_YYYYMMDD sheet "Summary"
SH='Reedem PV' if 'Reedem PV' in wb.sheetnames else 'Summary'
H=next(r for r in wb[SH].iter_rows(max_row=3,values_only=True) if r and 'OA' in r)
ix=[H.index(k) for k in ('OA','trx','bintang','Revenue','Stock')]
for r in wb[SH].iter_rows(min_row=2,max_col=17,values_only=True):
  if r[0] is None: continue
  id=str(r[0])
  if id in ids: o[id]=[int(n(r[j])) for j in ix]
p='digipos-cuan.js';t=open(p).read()
t=re.sub(r'const CU=.*\n','const CU='+json.dumps({'d':sys.argv[2],'o':o},separators=(',',':'))+';\n',t,count=1)
open(p,'w').write(t)
v=list(o.values());print('outlet',len(o),'OA',sum(x[0]>0 for x in v),'trx',sum(x[1] for x in v),'rev',sum(x[3] for x in v),'stok',sum(x[4] for x in v))
