# Update ST VF Reg/ByU & SA Simpati/ByU per outlet dari file ST_DIGIPOS.
# Outlet PJP yang belum ada di DETAIL PEROUTLET diambil VF-nya dari sheet PIVOT.
# Mendukung 2 format: (a) workbook multi-sheet dengan sheet "DETAIL PEROUTLET"; (b) 1 sheet gabungan "=== SHEET: DETAIL PEROUTLET ===".
# Pakai (dari folder repo): python3 tools/st_digipos.py <ST_DIGIPOS.xlsx>
import sys,csv,json,re,openpyxl
wb=openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True)
if 'DETAIL PEROUTLET' in wb.sheetnames:
    rows=[[('' if x is None else str(x)) for x in r] for r in list(wb['DETAIL PEROUTLET'].iter_rows(values_only=True))[2:]]
    upd=[]
    if 'Text Report' in wb.sheetnames:
        upd=sorted(set(m for r in wb['Text Report'].iter_rows(values_only=True) for x in r if x for m in re.findall(r'update [A-Za-z ]*?(\d{1,2} \w+ 20\d\d)',str(x))))
else:
    L=[str(r[0] or '') for r in wb.worksheets[0].iter_rows(values_only=True)]
    i=[k for k,x in enumerate(L) if x.startswith('=== SHEET:') and 'DETAIL PEROUTLET' in x][0]
    j=next((k for k in range(i+1,len(L)) if L[k].startswith('=== SHEET:')),len(L))
    upd=sorted(set(re.findall(r'update [A-Za-z ]*?(\d{1,2} \w+ 20\d\d)',' '.join(L))))
    rows=list(csv.reader(L[i+3:j]))
rows=[r for r in rows if len(r)>76 and r[1].strip() and r[27].strip()=='BAGAN BATU']
fix=lambda v:v[:-2] if v.endswith('.0') else v
B={fix(r[1].strip()):r for r in rows}
n=lambda v:int(float(str(v).replace(',','').strip() or 0)) if str(v).strip() not in('-','','None') else 0
f='digipos.html';s=open(f).read();a=s.find('const D=')+8;D,e=json.JSONDecoder().raw_decode(s[a:])
old=[sum(o[k] for o in D['O']) for k in (6,7,8,9)];miss=[];ch=[]
# Outlet baru yang belum ada di DETAIL PEROUTLET: ambil VF reg/byu MTD dari blok pivot MTD (Date=(All)) "Row Labels | Sum of reg | Sum of byu" di sheet PIVOT
PV={}
if 'PIVOT' in getattr(wb,'sheetnames',[]):
    PR=list(wb['PIVOT'].iter_rows(values_only=True))
    if len(PR)>3:
        for j in range(len(PR[2])-2):
            if PR[2][j]=='Row Labels' and PR[2][j+1]=='Sum of reg' and PR[2][j+2]=='Sum of byu' and j>=2 and PR[0][j-2]=='MTD' and PR[0][j+1]=='(All)':
                for r in PR[3:]:
                    if len(r)>j+2 and r[j] is not None and str(r[j]).strip()!='(blank)':PV[fix(str(r[j]).strip())]=(n(r[j+1] or 0),n(r[j+2] or 0))
                break
for o in D['O']:
    r=B.get(o[0])
    nv=[n(r[69]),n(r[76]),n(r[48]),n(r[55])] if r else [0,0,0,0]
    if not r and o[0] in PV:nv[0],nv[1]=PV[o[0]];miss.append(o[1]+' (dari PIVOT: VF reg '+str(nv[0])+')')
    elif not r:miss.append(o[1])
    if nv[0]-o[6]>3000:ch.append((o[1],o[6],nv[0]))
    o[6:10]=nv
new=[sum(o[k] for o in D['O']) for k in (6,7,8,9)]
s=s[:a]+json.dumps(D,ensure_ascii=False,separators=(',',':'))+s[a+e:];open(f,'w').write(s)
print('update',upd,'| outlet BBT di file',len(rows),'| tidak ada di file',miss);print('lama [VFreg,VFbyu,SAsimp,SAbyu]',old);print('baru',new);print('lonjakan >3000',ch)
