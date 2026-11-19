# Extra Dealing Misi (file "Dealing_EXTRA_..._<bulan>.xlsx"): sheet Raw = outlet yang berhak, Sheet1 = outlet yang sudah ikut (klik) Extra Dealing.
# Pakai: python3 tools/extra_dealing.py <file.xlsx> "DD Nov"  -> baris const XD=... di digipos-xd.js (hanya outlet PJP di D.O)
import sys,json,re,openpyxl
s=open('digipos.html').read();i=s.index('const D=')+8;D,_=json.JSONDecoder().raw_decode(s[i:]);ids={o[0] for o in D['O']}
wb=openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True)
n=lambda v:int(v) if isinstance(v,(int,float)) else 0
J={str(r[3]):r for r in wb['Sheet1'].iter_rows(min_row=2,max_col=14,values_only=True) if r[3]}
o={}
for r in wb['Raw'].iter_rows(min_row=2,max_col=24,values_only=True):
    if not r[3] or str(r[3]) not in ids:continue
    id=str(r[3]);j=J.get(id)
    g=re.search(r'Group (\d+)',str(r[17] or ''));
    o[id]=[re.sub(r"^Dealing Misi |November'26 ?",'',str(r[1] or '')).strip(),n(r[7]),n(r[9]),str(r[11] or ''),int(g.group(1)) if g else 0,n(r[19]),n(r[20]),1 if j else 0,n(j[9]) if j else 0,str(j[11]) if j else '']
p='digipos-xd.js';t=open(p).read()
t=re.sub(r'const XD=.*\n','const XD='+json.dumps({'d':sys.argv[2],'o':o},ensure_ascii=False,separators=(',',':'))+';\n',t,count=1)
open(p,'w').write(t)
v=list(o.values());print('berhak',len(v),'ikut',sum(x[7] for x in v),'potensi insentif',sum(x[6] for x in v))
