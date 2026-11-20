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
def proses(msg):
    doc=msg.get('document')
    if not doc:
        say('Kirim sebagai FILE (xlsx), bukan paste. Paste SURYA / ST Digipos masih lewat sesi Claude.');return False
    nm=doc['file_name'];low=nm.lower()
    cs=next((x for x in CSV if x[0] in low),None) if low.endswith('.csv') else None
    rt=cs or next((x for x in RT if x[0] in low),None)
    if not rt:say(f'File "{nm}" belum dikenali bot (butuh sesi Claude).');return False
    if doc.get('file_size',0)>19*1024*1024:say('File >20MB, batas Telegram. Kirim lewat sesi Claude.');return False
    PG[0]=ACK;pg(f'⏳ 10% · {nm} diterima, mulai diproses')
    fp=call('getFile',file_id=doc['file_id'])['result']['file_path']
    dst=pathlib.Path('/tmp')/('in_'+re.sub(r'[^\w.\-]','_',nm))
    dst.write_bytes(urllib.request.urlopen(f'https://api.telegram.org/file/bot{T}/{fp}',timeout=120).read())
    pg(f'⏳ 40% · {nm} terunduh');d,mo,iso=tgl(msg.get('caption'));lab=f'{d} {BLN[mo-1]}'
    fd=re.search(r'(\d{4})-(\d\d)-(\d\d)',nm)
    if cs and fd and not msg.get('caption'):iso=fd.group(0);d=int(fd.group(3));lab=f'{d} {BLN[int(fd.group(2))-1]}'
    cmd=([sys.executable,'tools/cvm_csv.py',str(dst)] if cs[1]=='CVM' else [sys.executable,'tools/surya_outlet.py',cs[1],str(dst)]) if cs else [sys.executable,'tools/'+rt[1],str(dst),lab]
    pg('⏳ 60% · menghitung data');rc,out=run(cmd)
    if rc:pg(f'❌ {nm}\n{out[-600:]}');return False
    if not cs and rt[1]=='sultan_so.py':
        h=(R/'digipos-sso.js').read_text()
        if '"per":""' in h:
            run(['git','checkout','digipos-sso.js']);pg(f'❌ Sultan SO: kolom periode kosong, butuh dicek Claude. Tidak diubah.');return False
    pg('⏳ 85% · menyimpan & deploy');stat(rt[2],iso)
    ok,_=run(['git','diff','--quiet']);
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
