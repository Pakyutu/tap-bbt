# Program Dealing Misi Sultan Spesial SO (file "Monitoting_Program_Dealing_Misi_Sultan_Spesial_SO.xlsx", sheet Raw)
# Pakai: python3 tools/sultan_so.py <file.xlsx> "DD Nov"  -> baris const CSO=... di digipos-sso.js (hanya outlet PJP di D.O)
import sys,json,re,openpyxl
s=open('digipos.html').read();i=s.index('const D=')+8;D,_=json.JSONDecoder().raw_decode(s[i:]);ids={o[0] for o in D['O']}
wb=openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True)
n=lambda v:v if isinstance(v,(int,float)) else 0
per=next((str(c) for c in next(wb['Raw'].iter_rows(max_row=1,values_only=True)) if c and 'tgl' in str(c)),'').replace('tgl ','').strip()
o={}
for r in wb['Raw'].iter_rows(min_row=3,max_col=12,values_only=True):
    if r[0] and str(r[0]) in ids:o[str(r[0])]=[int(n(r[2])),int(n(r[6])),int(n(r[7])),round(float(n(r[10])),3)]
p='digipos-sso.js';t=open(p).read()
t=re.sub(r'const CSO=.*\n','const CSO='+json.dumps({'d':sys.argv[2],'per':per,'o':o},ensure_ascii=False,separators=(',',':'))+';\n',t,count=1)
open(p,'w').write(t)
v=list(o.values());print('periode',per,'peserta',len(v),'target',sum(x[0] for x in v),'ach',sum(x[2] for x in v),'0 trx',sum(1 for x in v if not x[2]))
