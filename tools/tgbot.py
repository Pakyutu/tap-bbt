#!/usr/bin/env python3
"""Bot Telegram update dashboard (tanpa AI). Jalan dari GitHub Actions.
Kirim FILE ke bot (caption opsional "19 Nov"; kosong = hari ini WIB). Hanya chat TG_CHAT yang dilayani."""
import shutil,os,sys,json,re,subprocess,urllib.request,urllib.parse,datetime,pathlib
T=os.environ['TG_TOKEN'];CH=str(os.environ['TG_CHAT'])
API=f'https://api.telegram.org/bot{T}/';R=pathlib.Path(__file__).resolve().parent.parent
OFF=R/'tools/.tg_offset'
BLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
def call(m,**p):
    d=urllib.parse.urlencode(p).encode()
    return json.load(urllib.request.urlopen(API+m,d,timeout=60))
def say(t):return call('sendMessage',chat_id=CH,text=t[:3500])['result']['message_id']
PG=[None]
def pg(t):
    try:
        if PG[0]:call('editMessageText',chat_id=CH,message_id=PG[0],text=t[:3500])
        else:PG[0]=say(t)
    except Exception:pass
# (kata kunci nama file, skrip, nama status.json)
RT=[('monitoring_program_klik_misi','klik_misi.py',['Klik Misi']),('biometrik','biometrik.py',['Biometrik','FR Biometric']),
    ('sultan','sultan_so.py',['Sultan Spesial SO']),
    ('dealing_extra','extra_dealing.py',['Extra Dealing']),('extra','extra_dealing.py',['Extra Dealing']),
    ('cuan_pv','cuan_pv.py',['Cuan PV Redeem']),
    ('monitoring_performance','site_rev.py',['Site ID & performa site']),('site','site_rev.py',['Site ID & performa site'])]
CSV=[('detail_outlet_cvm','CVM',['CVM']),('detail_outlet_pv','--pv',['Outlet PV / SA']),('detail_outlet_sa','--sa',['Outlet PV / SA']),('ngrs','--ngrs',['NGRS'])]
def stat(names,iso):
    p=R/'status.json';j=json.loads(p.read_text())
    for i in j['items']:
        if i['n'] in names:i['d']=iso
    p.write_text(json.dumps(j,ensure_ascii=False,indent=0).replace('\n ','\n'))
def tgl(cap):
    m=re.search(r'(\d{1,2})\s*(Nov|Okt|Des)',cap or '',re.I)
    now=datetime.datetime.utcnow()+datetime.timedelta(hours=7)
    d=now.day;mo=now.month
    if m:d=int(m.group(1));mo={'okt':10,'nov':11,'des':12}[m.group(2).lower()]
    return d,mo,f'{now.year}-{mo:02d}-{d:02d}'
def run(cmd):
    r=subprocess.run(cmd,cwd=R,capture_output=True,text=True)
    return r.returncode,(r.stdout+r.stderr).strip()
LNK=re.compile(r'^/?(?:link\s+)?(https?://\S+)(?:\s+(\S+\.(?:xlsx|csv|txt)))?\s*$',re.I)
def ambil(url,out):
    if 'drive.google.com' in url or 'docs.google.com' in url:
        import gdown
        m=re.search(r'/d/([\w-]{20,})',url) or re.search(r'[?&]id=([\w-]{20,})',url)
        if not m:raise RuntimeError('ID file Drive tidak terbaca dari link')
        r=gdown.download(f'https://drive.google.com/uc?id={m.group(1)}',str(out),quiet=True)
        if not r:raise RuntimeError('Drive menolak (atur link ke "siapa saja yang memiliki link")')
    else:
        if 'dropbox.com' in url:url=re.sub(r'dl=0','dl=1',url)
        rq=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(rq,timeout=600) as r,open(out,'wb') as f:shutil.copyfileobj(r,f)
QRY=re.compile(r'^/?(status|sn|outlet)\b\s*(.*)',re.I|re.S)
def jl(f,k):
    t=(R/f).read_text();i=t.index(k)+len(k);return json.JSONDecoder().raw_decode(t[i:])[0]
def wib():return datetime.datetime.utcnow()+datetime.timedelta(hours=7)
def q_status():
    j=json.loads((R/'status.json').read_text());n=wib().date();o=[]
    for i in j['items']:
        d=datetime.date.fromisoformat(i['d']);t=(n-d).days
        o.append(f"{'⚠️' if t>1 else '✅'} {i['n']}: {d.day} {BLN[d.month-1]}"+(f' ({t} hari lalu)' if t>1 else ''))
    return 'Status data (hari ini '+f'{n.day} {BLN[n.month-1]}):\n'+'\n'.join(o)
def q_sn(txt):
    sn=list(dict.fromkeys(re.findall(r'\d{10,}',txt)))[:40]
    if not sn:return 'Kirim nomor SN, contoh: sn 0150000076531300 (boleh banyak, satu per baris).'
    t=(R/'cekst-data.js').read_text();CK=json.JSONDecoder().raw_decode(t[t.index('{'):])[0];n=wib().date();o=[]
    for x in sn:
        v=int(x);hit=None
        for gk,g in CK['G'].items():
            for sf in g['sf']:
                for pr in sf['p']:
                    for r in pr.get('b',[]):
                        a,_,b=r.partition('-')
                        if int(a)<=v<=int(b or a):hit=(gk,sf['n'],pr['p']);break
                    if hit:break
                if hit:break
            if hit:break
        if not hit:o.append(f'✅ {x}: tidak ada di daftar belum ST (sudah ST / terpakai / bukan WL)');continue
        age=''
        for a,b,dt in CK['DM'].get(hit[0],[]):
            if a<=v<=b:
                dd=datetime.date.fromisoformat(dt);age=f' · drop {dd.day} {BLN[dd.month-1]} ({(n-dd).days} hari)';break
        o.append(f'⏳ {x}: BELUM ST · {hit[1]} · {hit[2]}{age}')
    return '\n'.join(o)+f"\n\n(data sampai {CK['cutVF']}; bukan cek langsung Digipos)"
def q_outlet(txt):
    q=txt.strip().lower()
    if not q:return 'Contoh: outlet 1200016545  atau  outlet nama toko'
    D=jl('penjualan.html','const D=');n=len(D['CP']);c=D['CP'][-1]
    h=[o for o in D['O'] if q==o['id'] or q in o['nm'].lower() or q in (o.get('rs') or '')][:5]
    if not h:return f'Tidak ada outlet PJP yang cocok dengan "{txt.strip()}".'
    out=[]
    for o in h:
        pv,sa=o['pv'],o['sa']
        out.append(f"{o['nm']} ({o['id']})\n{o['kec']} · SF {o['sf']} · PJP {o['pjp']} · {o['kat']}\nPV 1-{c} Nov {pv[-1]:,} (Okt {pv[10+n-1]:,}) · SA {sa[-1]:,} (Okt {sa[10+n-1]:,})".replace(',','.'))
    return '\n\n'.join(out)
def kueri(m,k,a):
    PG[0]=ACK
    r={'status':lambda:q_status(),'sn':lambda:q_sn(a),'outlet':lambda:q_outlet(a)}[k]()
    pg(r)
CMD=re.compile(r'^(mom|soh)[\s_]+(pv|sa)[\s_]+(\d{1,2})(?:[\s_]+(\d{1,2}))?',re.I)
def ver_label(d,iso):
    f=R/'digipos.html';t=f.read_text()
    t=re.sub(r'update \d+ Nov 2026',f'update {d} Nov 2026',t)
    now=datetime.datetime.utcnow()+datetime.timedelta(hours=7)
    t=re.sub(r'"VER":"[^"]*"',f'"VER":"{iso}-{now:%H%M}"',t,count=1);f.write_text(t)
def run_p(cmd,label,a=30,b=92):
    # jalankan perintah sambil menaikkan persen 1-demi-1 di pesan Telegram supaya terlihat berjalan
    import threading,time
    st=threading.Event()
    def tick():
        p=a
        while not st.wait(2.5):
            if p<b:p+=1
            pg(f'⏳ {p}% · {label}')
    th=threading.Thread(target=tick,daemon=True);th.start()
    try:return run(cmd)
    finally:st.set();th.join(timeout=5)
def proses(msg):
    doc=msg.get('document');body=None
    if doc:
        nm=doc['file_name'];spec=re.sub(r'\.txt$','',nm,flags=re.I)
    else:
        t=(msg.get('text') or '').strip()
        # paste panjang dipecah beberapa pesan: "mulai mom pv 21" -> bagian-bagian paste -> "selesai"
        BUF=R/'.inbox'/'paste.txt';BUF.parent.mkdir(exist_ok=True)
        if re.match(r'^/?tes[\s_]*notif(?:ikasi)?$',t,re.I):  # uji notifikasi push ke semua HP yang sudah mengaktifkan lonceng
            PG[0]=ACK
            try:
                u=json.load(urllib.request.urlopen(f'https://api.telegram.org/bot{T}/getWebhookInfo',timeout=20))['result']['url'].rstrip('/')
                rq=urllib.request.Request(u+'/notify',data=b'',method='POST',headers={'x-key':T})
                r=json.load(urllib.request.urlopen(rq,timeout=30))
                pg(f"🔔 Notifikasi dikirim ke {r.get('ok',0)} perangkat" + (f" ({r['del']} langganan mati dibersihkan)" if r.get('del') else '') + '.' + (' Ditolak: '+'; '.join(r['st']) if r.get('st') else ''))
            except Exception as e:pg(f'Gagal kirim notifikasi: {e}')
            return False
        mm=re.match(r'^/?mulai\s+((?:mom|soh)[\s_]+(?:pv|sa)[\s_]+\d{1,2}(?:[\s_]+\d{1,2})?)\s*$',t,re.I)
        if mm:
            BUF.write_text(mm.group(1)+'\n');PG[0]=ACK
            pg('📋 Siap menerima paste. Kirim bagian-bagiannya satu per satu (urut), lalu kirim: selesai');return False
        if BUF.exists() and re.match(r'^/?(selesai|proses|done)$',t,re.I):
            t=BUF.read_text();BUF.unlink()
        elif BUF.exists() and not (CMD.match(t) or QRY.match(t) or LNK.match(t) or t.lower()=='batal'):
            BUF.write_text(BUF.read_text()+t+'\n');n=BUF.read_text().count('\n');PG[0]=ACK
            pg(f'📋 Bagian diterima (total {len(BUF.read_text())} karakter). Kirim bagian berikutnya, atau: selesai');return False
        elif BUF.exists() and t.lower()=='batal':
            BUF.unlink();PG[0]=ACK;pg('Paste dibatalkan.');return False
        nm,_,body=t.partition('\n');spec=nm.strip()
        lm=LNK.match(t)
        if lm:
            nm=lm.group(2);body=None
            if not nm:  # nama file tidak diberikan: ambil nama asli dari Drive
                try:
                    import gdown
                    mid=re.search(r'/d/([\w-]{20,})',lm.group(1)) or re.search(r'[?&]id=([\w-]{20,})',lm.group(1))
                    pre=pathlib.Path('/tmp/lnk');shutil.rmtree(pre,ignore_errors=True);pre.mkdir()
                    PG[0]=ACK;pg('⏳ 3% · membaca nama file dari link')
                    r=gdown.download(f'https://drive.google.com/uc?id={mid.group(1)}',str(pre)+'/',quiet=True)
                    nm=pathlib.Path(r).name
                except Exception as e:
                    PG[0]=ACK;pg('❌ link tidak terbaca: '+str(e)[:150]+' (pastikan akses "siapa saja yang memiliki link")');return False
            spec=nm;doc={'file_name':nm,'_url':lm.group(1),'_pre':(r if not lm.group(2) else None)}
        qm=QRY.match(t) if not lm else None
        if qm:kueri(msg,qm.group(1).lower(),qm.group(2));return False
        if not lm and not CMD.match(spec):
            PG[0]=ACK;pg('Kirim FILE (xlsx/csv), atau perintah: status · tes notif · sn <nomor> · outlet <id/nama> · mom pv 20 · soh sa 19 · mulai mom pv 21 (paste panjang) · tempel link Drive saja');return False
    low=re.sub(r'[\s]+','_',nm.lower());cap=msg.get('caption')
    d,mo,iso=tgl(cap);fd=re.search(r'(\d{4})-(\d\d)-(\d\d)',nm)
    if fd and not cap:iso=fd.group(0);d=int(fd.group(3));mo=int(fd.group(2))
    lab=f'{d} {BLN[mo-1]}';PY=sys.executable;ext=pathlib.Path(nm).suffix.lower()
    cm=CMD.match(spec) if (not doc or (ext=='.txt' and not doc.get('_url'))) else None
    if cm:
        k,pr,h1,h2=cm.group(1).lower(),cm.group(2).upper(),cm.group(3),cm.group(4)
        d=int(h1);iso=f'{iso[:8]}{d:02d}'
        job=('mom','Petugas (MoM)',[h1]) if k=='mom' else ('soh','Stock on Hand',[h1]+([h2] if h2 else []))
        sc='tools/surya_mom.py' if k=='mom' else 'tools/surya_soh.py';st=[job[1]];extra=[pr]+job[2];kind='txt'
    elif ext=='.csv' and 'detail_outlet_cvm' in low:sc,st,extra,kind='tools/cvm_csv.py',['CVM'],[],'f'
    elif ext=='.csv' and 'detail_outlet_pv' in low:sc,st,extra,kind='tools/surya_outlet.py',['Outlet PV / SA'],['--pv'],'o'
    elif ext=='.csv' and 'detail_outlet_sa' in low:sc,st,extra,kind='tools/surya_outlet.py',['Outlet PV / SA'],['--sa'],'o'
    elif ext=='.csv' and 'ngrs' in low:sc,st,extra,kind='tools/surya_outlet.py',['NGRS'],['--ngrs'],'o'
    elif ext=='.csv' and 'stock_gudang_sf' in low:sc,st,extra,kind='tools/surya_sgsf.py',['Stok per SF (PV/ByU/SA)'],[],'d'
    elif ext=='.csv' and 'stock_gudang_all' in low:sc,st,extra,kind='tools/surya_sgall.py',['Stock Gudang'],[],'d'
    elif ext=='.xlsx' and any(k in low for k in ('raw_st_pv','raw_st_sp','wl_sa_byu','dropingan','wl_st_vf')):
        role=next(r for k,r in (('raw_st_pv','pv'),('raw_st_sp','sa'),('wl_sa_byu','byu'),('dropingan','wlx'),('wl_st_vf','wlx')) if k in low)
        sc,st,extra,kind='tools/cekst_build.py',['WL vs ST (VF & SA)'],[role],'inbox'
    elif ext=='.xlsx' and 'st_digipos' in low:sc,st,extra,kind='tools/st_digipos.py',['ST VF & SA'],[],'st'
    elif ext=='.xlsx' and ('st_product' in low or 'monitoring_st' in low):sc,st,extra,kind='tools/st_product.py',['ST VF & SA'],[],'st'
    else:
        rt=next((x for x in RT if x[0] in low),None)
        if not rt:say(f'File "{nm}" belum dikenali bot (butuh sesi Claude).');return False
        sc,st,extra,kind='tools/'+rt[1],rt[2],[lab],'f'
    if kind=='st' and re.search(r'oct|okt|sep|agu|aug',low):
        PG[0]=ACK;pg(f'➖ {nm}: ini file bulan lalu, bukan data berjalan. Tidak dimasukkan supaya data Nov tidak tertimpa (kalau perlu, lewat sesi Claude).');return False
    if doc and not doc.get('_url') and doc.get('file_size',0)>19*1024*1024:say('File >20MB, batas Telegram. Kirim lewat sesi Claude.');return False
    PG[0]=ACK;pg(f'⏳ 5% · {nm} diterima, mulai diproses')
    dst=pathlib.Path('/tmp')/('in_'+re.sub(r'[^\w.\-]','_',nm or 'paste')+('' if doc else '.txt'))
    if doc and doc.get('_url'):
        pg(f'⏳ 10% · mengunduh dari link')
        try:
            if doc.get('_pre'):shutil.copy(doc['_pre'],dst)
            else:ambil(doc['_url'],dst)
        except Exception as e:pg(f'❌ gagal unduh: {str(e)[:200]}');return False
    elif doc:
        fp=call('getFile',file_id=doc['file_id'])['result']['file_path']
        dst.write_bytes(urllib.request.urlopen(f'https://api.telegram.org/file/bot{T}/{fp}',timeout=120).read())
    else:dst.write_text(body,encoding='utf-8')
    pg(f'⏳ 25% · {nm} terunduh')
    if kind=='inbox':
        INB=R/'.inbox';INB.mkdir(exist_ok=True)
        if extra[0]=='wlx':  # tentukan WL utama / tambahan dari isi (nama sheet), bukan nama file
            import openpyxl
            sn=openpyxl.load_workbook(dst,read_only=True).sheetnames
            extra=['wl' if 'VF NOV' in sn else 'add' if ('VF' in sn or 'WL Return' in sn) else 'wlnov' if any(re.match(r'^\d+[.,]\s?\d+',x) or 'target' in x.lower() for x in sn) else 'wl']
        shutil.move(str(dst),str(INB/f'{extra[0]}__{low}'))
        g=lambda r:sorted(str(x) for x in INB.glob(r+'__*'))
        wl,wln,adds,byu,pvs,sas=g('wl'),g('wlnov'),g('add'),g('byu'),g('pv'),g('sa')
        if not((wl or wln) and pvs and sas):
            miss=[n for n,v in (('WL dasar',wl or wln),('raw ST PV',pvs),('raw ST SA',sas)) if not v]
            pg(f'📦 {nm} tersimpan. Cek WL belum dibangun, masih kurang: '+', '.join(miss));return False
        cmd=[PY,sc]+(['--wl',wl[-1]] if wl else [])+(['--wlnov',wln[-1]] if wln else [])+(['--add']+adds if adds else [])+(['--byu',byu[-1]] if byu else [])+['--pv']+pvs+['--sa']+sas
        rc,out=run_p(cmd,'membangun Cek WL (beberapa menit)')
        if rc:pg(f'❌ {nm}\n'+(out.splitlines()[-1][:300] if out else 'gagal'));return False
        t=(R/'cekst-data.js').read_text();CK=json.JSONDecoder().raw_decode(t[t.index('const CK=')+9:])[0]
        iso=CK.get('cutVF') or iso;stat(st,iso)
        ok,_=run(['git','diff','--quiet'])
        if ok==0:pg(f'➖ {nm}: tidak ada perubahan data.');return False
        pg(f'✅ 100% · Cek WL dibangun (data sampai {iso}) — tayang ±1 mnt');return True
    if kind=='txt':cmd=[PY,sc,str(dst)]+extra
    elif kind=='o':cmd=[PY,sc,extra[0],str(dst)]
    elif kind=='d':cmd=[PY,sc,str(dst),str(d)]
    else:cmd=[PY,sc,str(dst)]+extra
    rc,out=run_p(cmd,'menghitung data')
    if rc:pg(f'❌ {nm}\n'+(out.splitlines()[-1][:300] if out else 'gagal')+'\n(paste tidak sesuai format? Kalau ragu, lewat sesi Claude)');return False
    if sc.endswith('sultan_so.py'):
        if '"per":""' in (R/'digipos-sso.js').read_text():
            run(['git','checkout','digipos-sso.js']);pg('❌ Sultan SO: kolom periode kosong, butuh dicek Claude. Tidak diubah.');return False
    if kind=='st':
        dm=[int(x) for x in re.findall(r'(\d{1,2}) Nov 2026',out)]
        if dm:d=max(dm);iso=f'2026-11-{d:02d}';lab=f'{d} Nov'
        ver_label(d,iso)
    pg('⏳ 96% · menyimpan & deploy');stat(st,iso)
    ok,_=run(['git','diff','--quiet'])
    if ok==0:pg(f'➖ {nm}: tidak ada perubahan data (file sama?).');return False
    pg(f'✅ 100% · {nm} masuk · {lab} (tayang ±1 mnt)');return True
ACK=int(os.environ.get('TG_ACK') or 0) or None
def bump():
    s=(R/'sw.js').read_text()
    s=re.sub(r'tap-bbt-v(\d+)',lambda x:f'tap-bbt-v{int(x.group(1))+1}',s,count=1)
    (R/'sw.js').write_text(s)
def main():
    if os.environ.get('TG_UPDATE'):  # mode webhook (Worker)
        m=json.loads(os.environ['TG_UPDATE']).get('message')
        if m and str(m['chat']['id'])==CH:
            try:ubah=proses(m)
            except Exception as e:say(f'Error: {e}');ubah=False
            if ubah:bump()
        return

    o=int(OFF.read_text()) if OFF.exists() else 0
    try:ups=call('getUpdates',offset=o,timeout=0).get('result',[]);ubah=False
    except Exception:return  # webhook aktif: getUpdates ditolak Telegram, tidak apa-apa
    for u in ups:
        o=u['update_id']+1;m=u.get('message')
        if not m or str(m['chat']['id'])!=CH:continue
        try:ubah|=proses(m)
        except Exception as e:say(f'Error: {e}')
    OFF.write_text(str(o))
    if ubah:bump()
main()
