# Klik Misi (file "Monitoring_Program_Klik_Misi_<DD>_<Bln>_2026_SB_Dumai.xlsx"): sheet "misi reguler dumai" (Reguler) + "BYU Dumai" (By.U).
# Pakai: python3 tools/klik_misi.py <file.xlsx> ["DD Nov"]  -> D.K di digipos.html (hanya outlet PJP di D.O) + label "Data per ..." + status.json
# BAA & UJT selalu diisi ke data-tap.js (K); BBT (D.K) hanya dengan --bbt.
# Format D.K[id]: r=[targetFix,ach,klik,runrate,status,rataRata,sultan]  b=[targetFix,ach,klik,runrate,ketProgram]
import sys,json,re,os,openpyxl,datetime
H='digipos.html';s=open(H).read();i=s.index('const D=')+8;D,_=json.JSONDecoder().raw_decode(s[i:]);BBT='--bbt' in sys.argv;sys.argv=[a for a in sys.argv if a!='--bbt']
TD=json.loads(open('data-tap.js').read()[12:].rstrip().rstrip(';'));ids={o[0] for o in D['O']}|{o[0] for x in TD.values() for o in x['O']};IB={o[0] for o in D['O']}
fn=os.path.basename(sys.argv[1]);m=re.search(r'(\d{1,2})_([A-Za-z]{3})[a-z]*_(20\d\d)',fn)
lab=(f'{int(m.group(1))} {m.group(2).title()}' if m else (sys.argv[2] if len(sys.argv)>2 else ''))
if not lab:print('tanggal tidak terbaca dari nama file');sys.exit(3)
wb=openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True)
if 'misi reguler dumai' not in wb.sheetnames or 'BYU Dumai' not in wb.sheetnames:
    print('sheet "misi reguler dumai" / "BYU Dumai" tidak ada: bukan file Klik Misi program');sys.exit(3)
nm=lambda v:v.strip().lower() if isinstance(v,str) else ''
def numv(v):
    if isinstance(v,bool) or not isinstance(v,(int,float)):return 0
    return int(v) if float(v).is_integer() else round(float(v),4)
def baca(ws,r_):
    it=ws.iter_rows(values_only=True);hd=None;d={}
    for k,r in enumerate(it):
        if hd is None:
            if k<10 and any(nm(c) in('id outlet','outlet id','id_outlet') for c in r):hd=[nm(c) for c in r]
            continue
        c=r[0]
        if c is None:continue
        id=str(int(c)) if isinstance(c,float) else str(c).strip()
        if id not in ids:continue
        d[id]=r_(r)
    if hd is None:raise SystemExit('header tidak ditemukan')
    return hd,d
def mk(isR):
    def f(r):return None
    return f
# kolom ditentukan dari header, sama seperti parser di aplikasi
def kolom(ws,isR):
    hd=None;rows=[]
    for k,r in enumerate(ws.iter_rows(values_only=True)):
        if hd is None:
            if k<10 and any(nm(c) in('id outlet','outlet id','id_outlet') for c in r):hd=[nm(c) for c in r];break
            continue
    return hd
out={}
for key,sheet,isR in(('r','misi reguler dumai',True),('b','BYU Dumai',False)):
    ws=wb[sheet];hd=kolom(ws,isR)
    col=lambda n:hd.index(n) if n in hd else -1
    tf=col('target fix');ach=hd.index('ach',tf);kl=col('klik misi');rr=col('runrate')
    st_=col('status');ra=col('rata-rata');su=col('kandidat misi sultan');kp=col('keterengan program') if col('keterengan program')>=0 else col('keterangan program')
    g=lambda r,j:r[j] if 0<=j<len(r) else None
    def f(r):
        if isR:
            sv=g(r,su);return[numv(g(r,tf)),numv(g(r,ach)),numv(g(r,kl)),numv(g(r,rr)),str(g(r,st_) or ''),numv(g(r,ra)),str(sv) if sv and sv!='NON PROGRAM' else '']
        return[numv(g(r,tf)),numv(g(r,ach)),numv(g(r,kl)),numv(g(r,rr)),str(g(r,kp) or '')]
    _,out[key]=baca(ws,f)
K={};KT={}
for t in('r','b'):
    for id,v in out[t].items():(K if id in IB else KT).setdefault(id,{})[t]=v
if not out['r'] or not out['b']:print('data kosong (reguler %d, By.U %d): tidak dimasukkan'%(len(out['r']),len(out['b'])));sys.exit(3)
for x in TD.values():x['K']={o[0]:KT[o[0]] for o in x['O'] if o[0] in KT}
open('data-tap.js','w').write('window.TAPD='+json.dumps(TD,ensure_ascii=False,separators=(',',':'))+';\n')
print('TAP lain:',{k:len(x['K']) for k,x in TD.items()})
if BBT:
    j=s.index('"K":{',i)+4;_,e=json.JSONDecoder().raw_decode(s[j:])
    s=s[:j]+json.dumps(K,ensure_ascii=False,separators=(',',':'))+s[j+e:]
    s=re.sub(r'Data per \d{1,2} \w{3} 20\d\d\.',f'Data per {lab} 2026.',s)
    open(H,'w').write(s)
def kk(t,x):return sum(1 for v in out[t].values() if v[2]>0)
print(f'Klik Misi {lab}: Reguler {len(out["r"])} outlet (klik {kk("r",0)}, ada ach {sum(1 for v in out["r"].values() if v[1]>0)}), By.U {len(out["b"])} outlet (klik {kk("b",0)}, ada ach {sum(1 for v in out["b"].values() if v[1]>0)})')
