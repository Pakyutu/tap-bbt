#!/usr/bin/env python3
"""Bot Telegram update dashboard (tanpa AI). Jalan dari GitHub Actions.
Kirim FILE ke bot (caption opsional "19 Nov"; kosong = hari ini WIB). Hanya chat TG_CHAT yang dilayani."""
import os,sys,json,re,subprocess,urllib.request,urllib.parse,datetime,pathlib
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
RT=[('biometrik','biometrik.py',['Biometrik','FR Biometric']),
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
CMD=re.compile(r'^(mom|soh)[\s_]+(pv|sa)[\s_]+(\d{1,2})(?:[\s_]+(\d{1,2}))?',re.I)
def ver_label(d,iso):
    f=R/'digipos.html';t=f.read_text()
    t=re.sub(r'update \d+ Nov 2026',f'update {d} Nov 2026',t)
    now=datetime.datetime.utcnow()+datetime.timedelta(hours=7)
    t=re.sub(r'"VER":"[^"]*"',f'"VER":"{iso}-{now:%H%M}"',t,count=1);f.write_text(t)
def proses(msg):
    doc=msg.get('document');body=None
    if doc:
        nm=doc['file_name'];spec=re.sub(r'\.txt$','',nm,flags=re.I)
    else:
        t=(msg.get('text') or '').strip();nm,_,body=t.partition('\n');spec=nm.strip()
        if not CMD.match(spec):
            say('Kirim FILE (xlsx/csv), atau paste dengan baris pertama "mom pv 20" / "soh sa 19". Selain itu lewat sesi Claude.');return False
    low=nm.lower();cap=msg.get('caption')
    d,mo,iso=tgl(cap);fd=re.search(r'(\d{4})-(\d\d)-(\d\d)',nm)
    if fd and not cap:iso=fd.group(0);d=int(fd.group(3));mo=int(fd.group(2))
    lab=f'{d} {BLN[mo-1]}';PY=sys.executable;ext=pathlib.Path(nm).suffix.lower()
    cm=CMD.match(spec) if (not doc or ext=='.txt') else None
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
    elif ext=='.xlsx' and 'st_digipos' in low:sc,st,extra,kind='tools/st_digipos.py',['ST VF & SA'],[],'st'
    elif ext=='.xlsx' and ('st_product' in low or 'monitoring_st' in low):sc,st,extra,kind='tools/st_product.py',['ST VF & SA'],[],'st'
    else:
        rt=next((x for x in RT if x[0] in low),None)
        if not rt:say(f'File "{nm}" belum dikenali bot (butuh sesi Claude).');return False
        sc,st,extra,kind='tools/'+rt[1],rt[2],[lab],'f'
    if doc and doc.get('file_size',0)>19*1024*1024:say('File >20MB, batas Telegram. Kirim lewat sesi Claude.');return False
    PG[0]=ACK;pg(f'⏳ 10% · {nm} diterima, mulai diproses')
    dst=pathlib.Path('/tmp')/('in_'+re.sub(r'[^\w.\-]','_',nm or 'paste')+('' if doc else '.txt'))
    if doc:
        fp=call('getFile',file_id=doc['file_id'])['result']['file_path']
        dst.write_bytes(urllib.request.urlopen(f'https://api.telegram.org/file/bot{T}/{fp}',timeout=120).read())
    else:dst.write_text(body,encoding='utf-8')
    pg(f'⏳ 40% · {nm} terunduh')
    if kind=='txt':cmd=[PY,sc,str(dst)]+extra
    elif kind=='o':cmd=[PY,sc,extra[0],str(dst)]
    elif kind=='d':cmd=[PY,sc,str(dst),str(d)]
    else:cmd=[PY,sc,str(dst)]+extra
    pg('⏳ 60% · menghitung data');rc,out=run(cmd)
    if rc:pg(f'❌ {nm}\n'+(out.splitlines()[-1][:300] if out else 'gagal')+'\n(paste tidak sesuai format? Kalau ragu, lewat sesi Claude)');return False
    if sc.endswith('sultan_so.py'):
        if '"per":""' in (R/'digipos-sso.js').read_text():
            run(['git','checkout','digipos-sso.js']);pg('❌ Sultan SO: kolom periode kosong, butuh dicek Claude. Tidak diubah.');return False
    if kind=='st':ver_label(d,iso)
    pg('⏳ 85% · menyimpan & deploy');stat(st,iso)
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
