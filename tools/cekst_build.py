# Bangun data dashboard "Cek WL vs ST" dari file WL Dropingan (xlsx) + raw ST Digipos (xlsx, sheet 'detail').
# Pakai: python3 tools/cekst_build.py <WL.xlsx> <raw_st_pv.xlsx> [raw_st_sa.xlsx] ; hasil -> cekst-data.js
import sys,json,re,collections,datetime,openpyxl
TAP='BAGAN BATU'
def snorm(v):
    s=str(v).strip();return s[:-2] if s.endswith('.0') else s
def sfn(n):
    u=str(n).upper()
    for k,v in [('RINALDI','Rinaldi Al Islami'),('SYARIF','Ahmad Syarif Rambe'),('SAYRIF','Ahmad Syarif Rambe'),('SYARF','Ahmad Syarif Rambe'),('AFIF','Afif Alwan Syahridho'),('AFI ALWAN','Afif Alwan Syahridho'),('ALDI','Afif Alwan Syahridho'),('RIO','Rio Pranata Dani'),('NGIO','Rio Pranata Dani'),('MULKAN','Mulkan Azhar'),('MULKAB','Mulkan Azhar'),('IHSAN','Khoirul Ihsan Harahap'),('KHOIRUL','Khoirul Ihsan Harahap'),('GUSTI','Gusti Edwin'),('TEGUH','Teguh Ariwibowo'),('HERMAN','Herman Syahputra Harahap'),('TENGKU','Tengku Muhammad Sobry Amri'),('SOBRY','Tengku Muhammad Sobry Amri')]:
        if k in u:return v
    return 'Lainnya: '+str(n).strip()
def pk(p):
    s=re.sub(r'\s+',' ',str(p).upper()).strip()
    m=re.match(r'(\d+)\s*GB\s*(\d+)\s*(H|HARI)',s)
    if m:return f'{m.group(1)}GB {m.group(2)} hari'
    if 'UNL' in s:return s.title()
    return str(p).strip()
def comp(a):
    a=sorted(set(a),key=lambda x:(len(x),x));o=[]
    for s in a:
        if o and len(s)==len(o[-1][1]) and int(s)==int(o[-1][1])+1:o[-1][1]=s
        else:o.append([s,s])
    return [x[0] if x[0]==x[1] else x[0]+'-'+x[1] for x in o]
def raw_st(path):
    wb=openpyxl.load_workbook(path,read_only=True,data_only=True);ws=wb['detail'];ST={};mx=''
    for i,r in enumerate(ws.iter_rows(values_only=True)):
        if i==0:continue
        for o in (0,31):
            if len(r)>o+25 and r[o+13] is not None and str(r[o+25]).strip()==TAP:
                d=str(r[o+5])[:10];mx=max(mx,d);ST[snorm(r[o+13])]=d
    return ST,mx
def wl(path,sheet,snc,pc,sfc):
    wb=openpyxl.load_workbook(path,read_only=True,data_only=True);out=[]
    for i,r in enumerate(wb[sheet].iter_rows(values_only=True)):
        if i<3 or r[snc] is None:continue
        out.append((str(r[1])[:10],snorm(r[snc]),pk(r[pc]),sfn(r[sfc])))
    return out
def build(rows,ST):
    by=collections.OrderedDict();dd=collections.defaultdict(lambda:[0,0])
    for d,s,p,n in rows:
        o=by.setdefault(n,{'n':n,'p':{}});x=o['p'].setdefault(p,{'d':0,'s':0,'b':[]})
        x['d']+=1;st=s in ST
        if st:x['s']+=1
        else:x['b'].append(s)
        dd[d][0]+=1;dd[d][1]+=st
    R=[]
    for o in by.values():
        P=[{'p':p,'d':x['d'],'s':x['s'],'b':comp(x['b'])} for p,x in sorted(o['p'].items(),key=lambda z:-z[1]['d'])]
        R.append({'n':o['n'],'d':sum(x['d'] for x in P),'s':sum(x['s'] for x in P),'p':P})
    R.sort(key=lambda o:(o['n'].startswith('Lainnya'),-o['d']))
    return {'sf':R,'tgl':sorted([k,v[0],v[1]] for k,v in dd.items())}
if __name__=='__main__':
    wlp,pv=sys.argv[1],sys.argv[2];sa=sys.argv[3] if len(sys.argv)>3 else None
    STv,mxv=raw_st(pv);out={'upd':datetime.date.today().isoformat(),'VF':build(wl(wlp,'VF NOV',2,3,4),STv)};out['VF']['cut']=mxv
    if sa:
        STs,mxs=raw_st(sa);out['SA']=build(wl(wlp,'SA NOV',3,4,5),STs);out['SA']['cut']=mxs
    else:out['SA']={'na':True,'drop':len(wl(wlp,'SA NOV',3,4,5))}
    open('cekst-data.js','w').write('// Hasil cek WL dropingan vs ST Digipos (dibuat dari tools/cekst_build.py)\nconst CK='+json.dumps(out,separators=(',',':'),ensure_ascii=False)+';\n')
    print('VF',sum(o['s'] for o in out['VF']['sf']),'/',sum(o['d'] for o in out['VF']['sf']),'cut',mxv)
