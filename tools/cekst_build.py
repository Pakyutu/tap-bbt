# Bangun data dashboard "Cek WL vs ST" (cekst-data.js).
# Pakai: python3 tools/cekst_build.py --wl WL_VF_SA_ST_Dropingan.xlsx [--byu WL_SA_BYU.xlsx] --pv raw_st_pv*.xlsx --sa raw_st_sp*.xlsx
# WL: sheet "VF NOV","VF OKT","SA NOV","SA OKT" (header baris 3: NO,TGL,SN,PAKET,SF / NO,TGL,MSISDN,SN,PAKET,SF).
# Raw ST: sheet berisi kolom No..SN..Date..Tap (PV: 'detail', bisa 2 blok kolom; SA: 'DETAIL NOMOR').
import sys,json,re,collections,datetime,argparse,openpyxl
def key(v):
    s=str(v).strip();s=s[:-2] if s.endswith('.0') else s
    return s.lstrip('0') or '0'
def sfn(n):
    u=str(n or '').upper()
    for k,v in [('RINALDI','Rinaldi Al Islami'),('SYARIF','Ahmad Syarif Rambe'),('SAYRIF','Ahmad Syarif Rambe'),('SYARF','Ahmad Syarif Rambe'),('AFIF','Afif Alwan Syahridho'),('AFI ALWAN','Afif Alwan Syahridho'),('ALDI','Afif Alwan Syahridho'),('RIO','Rio Pranata Dani'),('NGIO','Rio Pranata Dani'),('MULKAN','Mulkan Azhar'),('MULKAB','Mulkan Azhar'),('IHSAN','Khoirul Ihsan Harahap'),('KHOIRUL','Khoirul Ihsan Harahap'),('GUSTI','Gusti Edwin'),('TEGUH','Teguh Ariwibowo'),('HERMAN','Herman Syahputra Harahap'),('TENGKU','Tengku Muhammad Sobry Amri'),('SOBRY','Tengku Muhammad Sobry Amri')]:
        if k in u:return v
    return ('Lainnya: '+str(n).strip()) if n else '(tanpa SF)'
def pk(p,sa=False):
    s=re.sub(r'\s+',' ',str(p).upper()).strip()
    m=re.match(r'(\d+)\s*GB\s*(\d+)\s*(H|HARI)\b',s)
    if m:return f'SA {m.group(1)}GB {m.group(2)}H' if sa else f'VF {m.group(1)}GB {m.group(2)} hari'
    if 'UNL' in s:return s.title()
    if 'SA' in s:
        g=re.search(r'(\d+)\s*GB',s);d=re.search(r'(\d+)\s*H\b',s)
        return 'SA '+('BYU ' if 'BYU' in s else '')+(g.group(1)+'GB' if g else '')+(' '+d.group(1)+'H' if d else '')
    return str(p).strip()
def comp(a):
    a=sorted(set(a),key=lambda x:(len(x),x));o=[]
    for s in a:
        if o and len(s)==len(o[-1][1]) and int(s)==int(o[-1][1])+1:o[-1][1]=s
        else:o.append([s,s])
    return [x[0] if x[0]==x[1] else x[0]+'-'+x[1] for x in o]
def ftime(path):
    import zipfile
    try:
        c=zipfile.ZipFile(path).read('docProps/core.xml').decode();m=re.search(r'<dcterms:modified[^>]*>([^<]+)',c)
        t=datetime.datetime.strptime(m.group(1)[:19],'%Y-%m-%dT%H:%M:%S')+datetime.timedelta(hours=7);return t.strftime('%Y-%m-%dT%H:%M')
    except Exception:return ''
def wl_sheet(wb,sheet,snc,pc,sfc,dc=1,start=3):
    out=[]
    if sheet not in wb.sheetnames:return out
    for i,r in enumerate(wb[sheet].iter_rows(values_only=True)):
        if i<start or len(r)<=snc or r[snc] is None:continue
        sn=str(r[snc]).strip();sn=sn[:-2] if sn.endswith('.0') else sn
        if not re.fullmatch(r'\d{8,}',sn):continue
        out.append((str(r[dc])[:10] if dc is not None else '',sn,pk(r[pc],sheet.startswith('SA') or sheet.upper().find('SA')>=0 and dc is None),sfn(r[sfc]) if sfc is not None else '(tanpa SF)'))
    return out
def raw(paths,need,ST,mx):
    for path in paths:
        wb=openpyxl.load_workbook(path,read_only=True,data_only=True)
        for ws in wb.worksheets:
            it=ws.iter_rows(values_only=True);hdr=None;blocks=[]
            for r in it:
                h=[str(x or '').strip().lower() for x in r]
                if 'sn' in h and 'date' in h:hdr=h;break
                if ws.max_row and ws.max_row<5:break
            if not hdr:continue
            for b,x in enumerate(hdr):
                if x=='sn':
                    st=max([k for k in range(b+1) if hdr[k]=='no'] or [0]);seg=hdr[st:st+31]
                    g=lambda n:(st+seg.index(n)) if n in seg else None
                    blocks.append((b,g('date'),g('tap'),g('outlet name'),g('transaction status')))
            n=0
            for r in it:
                for sn,dt,tp,ol,ts in blocks:
                    if len(r)<=sn or r[sn] is None:continue
                    if ts is not None and str(r[ts]).strip().upper() not in('SUCCESS',''):continue
                    k=key(r[sn])
                    if k in need:
                        d=str(r[dt])[:10];ST[k]=[d,str(r[tp] or '').strip() if tp is not None else '',str(r[ol] or '').strip() if ol is not None else '']
                    n+=1
                    if dt is not None and r[dt] is not None:
                        d=str(r[dt])[:10]
                        if d>mx.get(path,''):mx[path]=d
            print(path.split('/')[-1],ws.title,'baris',n,file=sys.stderr)
def build(rows,ST,home='BAGAN BATU'):
    by=collections.OrderedDict();dd=collections.defaultdict(lambda:[0,0]);mon=collections.Counter();lain=collections.Counter()
    for d,s,p,n in rows:
        o=by.setdefault(n,{});x=o.setdefault(p,{'d':0,'s':0,'b':[]})
        x['d']+=1;st=ST.get(key(s))
        if st:
            x['s']+=1;mon[st[0][:7]]+=1
            if st[1] and st[1].upper()!=home:lain[st[1]]+=1
        else:x['b'].append(s)
        if d:dd[d][0]+=1;dd[d][1]+=bool(st)
    R=[]
    for n,o in by.items():
        P=[{'p':p,'d':x['d'],'s':x['s'],'b':comp(x['b'])} for p,x in sorted(o.items(),key=lambda z:-z[1]['d'])]
        R.append({'n':n,'d':sum(x['d'] for x in P),'s':sum(x['s'] for x in P),'p':P})
    R.sort(key=lambda o:(o['n'].startswith(('Lainnya','(tanpa')),-o['d']))
    return {'sf':R,'tgl':sorted([k,v[0],v[1]] for k,v in dd.items()),'mon':sorted(mon.items()),'lain':lain.most_common(10)}
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--wl');ap.add_argument('--byu');ap.add_argument('--add',nargs='*',default=[]);ap.add_argument('--pv',nargs='*',default=[]);ap.add_argument('--sa',nargs='*',default=[]);a=ap.parse_args()
    wb=openpyxl.load_workbook(a.wl,read_only=True,data_only=True)
    L={'VF NOV':wl_sheet(wb,'VF NOV',2,3,4),'VF OKT':wl_sheet(wb,'VF OKT',2,3,4),'SA NOV':wl_sheet(wb,'SA NOV',3,4,5),'SA OKT':wl_sheet(wb,'SA OKT',3,4,5)}
    # WL tambahan (format baru: sheet VF / SA / WL Return, tanggal drop di baris 1 kolom C, data mulai baris 4)
    seen=set()
    for f in sorted(a.add,key=lambda f:str(next(openpyxl.load_workbook(f,read_only=True)['VF'].iter_rows(max_row=1,values_only=True))[2])):
        w=openpyxl.load_workbook(f,read_only=True,data_only=True)
        def tg(sh):
            try:return str(next(w[sh].iter_rows(max_row=1,values_only=True))[2])[:10]
            except Exception:return ''
        def rows(sh,snc,pc,sfc):
            out=[]
            if sh not in w.sheetnames:return out
            d=tg(sh)
            for i,r in enumerate(w[sh].iter_rows(values_only=True)):
                if i<3 or len(r)<=max(snc,sfc) or r[snc] is None:continue
                sn=str(r[snc]).strip();sn=sn[:-2] if sn.endswith('.0') else sn
                if re.fullmatch(r'\d{8,}',sn):out.append((d,sn,pk(r[pc],sh=='SA'),sfn(r[sfc])))
            return out
        ret={key(x[1]) for x in rows('WL Return',1,2,3)}
        nv=rows('VF',1,2,3);ns=rows('SA',2,3,4)
        kv={key(x[1]) for x in nv};ks={key(x[1]) for x in ns}
        b0=len(L['VF NOV'])
        # file --add bersifat kumulatif (tanggal header = tanggal file): SN yang sudah ada dari file --add sebelumnya tetap pakai tanggal drop pertamanya
        od={key(x[1]):x[0] for k in ('VF NOV','SA NOV') for x in L[k] if key(x[1]) in seen}
        nv=[(od.get(key(x[1]),x[0]),)+x[1:] for x in nv];ns=[(od.get(key(x[1]),x[0]),)+x[1:] for x in ns];seen|=kv|ks
        L['VF NOV']=[x for x in L['VF NOV'] if key(x[1]) not in ret|kv]+nv
        L['SA NOV']=[x for x in L['SA NOV'] if key(x[1]) not in ks]+ns
        print(f.split('/')[-1],'VF +',len(nv),'SA +',len(ns),'return',len(ret),'VF NOV',b0,'->',len(L['VF NOV']),file=sys.stderr)
    if a.byu:
        b=openpyxl.load_workbook(a.byu,read_only=True,data_only=True)
        L['SA BYU']=wl_sheet(b,b.sheetnames[0],2,3,None,dc=None,start=4)
    STv,STs,mx={},{},{}
    raw(a.pv,{key(x[1]) for k in L if k.startswith('VF') for x in L[k]},STv,mx)
    raw(a.sa,{key(x[1]) for k in L if k.startswith('SA') for x in L[k]},STs,mx)
    out={'upd':(datetime.datetime.utcnow()+datetime.timedelta(hours=7)).strftime('%Y-%m-%dT%H:%M'),'cutVF':max([v for k,v in mx.items() if k in a.pv] or ['']),'cutSA':max([v for k,v in mx.items() if k in a.sa] or ['']),'G':{}}
    out['ft']={'wl':max([ftime(a.wl)]+[ftime(f) for f in a.add]),'pv':max([ftime(p) for p in a.pv] or ['']),'sa':max([ftime(p) for p in a.sa] or [''])}
    TP=set()
    try:
        for ln in open(__file__.rsplit('/',1)[0]+'/cekst_terpakai.txt'):
            ln=ln.split('#')[0].strip()
            if not ln:continue
            x,_,y=ln.partition('-');y=y or x
            for v in range(int(x),int(y)+1):TP.add(key(str(v)))
    except FileNotFoundError:pass
    tpn={}
    for k in L:
        b=len(L[k]);L[k]=[x for x in L[k] if key(x[1]) not in TP];tpn[k]=b-len(L[k])
    for k,rows in L.items():
        if not rows:continue
        st=STv if k.startswith('VF') else STs
        if not (a.pv if k.startswith('VF') else a.sa):continue
        out['G'][k]=build(rows,st)
        if tpn.get(k):out['G'][k]['tp']=tpn[k]
        print(k,sum(o['s'] for o in out['G'][k]['sf']),'/',len(rows),file=sys.stderr)
    open('cekst-data.js','w').write('// Hasil cek WL dropingan vs ST Digipos (dibuat dari tools/cekst_build.py)\nconst CK='+json.dumps(out,separators=(',',':'),ensure_ascii=False)+';\n')
