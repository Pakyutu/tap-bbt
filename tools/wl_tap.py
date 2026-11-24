#!/usr/bin/env python3
# Dropingan SN per SF untuk TAP selain BBT (sheet "SN STOCK SF NOV 2026": DROPINGAN VF / DROPINGAN SA) -> wl-tap.js
# Pakai: python3 tools/wl_tap.py <SN_STOCK_SF_*.xlsx>   (sheet DROPINGAN VF & DROPINGAN SA; kolom NAMA SF, TAP, DENOM PAKET, SN AWAL, SN AKHIR, QTY, TANGGAL)
#    atau: python3 tools/wl_tap.py <vf.txt> <sa.txt> [TAP=BAA]   baris: tgl(YYYY-DD-MM)|SF|denom|SN awal|SN akhir|qty
import sys,re,json,collections
XL=sys.argv[1].lower().endswith('.xlsx')
tap=(sys.argv[3] if len(sys.argv)>3 else 'BAA') if not XL else None
TP={'BAGAN SIAPI-API':'BAA','UJUNG TANJUNG':'UJT','BAGAN BATU':'BBT'}
SF={'TRI KURNIA':'Tri Kurnia Intan','WAHYU':'Wahyu Mahardika'}
sfn=lambda x:SF.get(x.strip().upper(),x.strip().title())
def den(d,sa):
    s=re.sub(r'\s+',' ',d.upper().replace(',','.')).strip()
    if sa:
        if s=='PRELOAD':return 'Preload'
        s=s.replace('SA 5H','SA 5GB')
        m=re.match(r'SA (BYU )?(\d+)GB',s);return ('SA ByU ' if m and m.group(1) else 'SA ')+m.group(2)+'GB' if m else ('SA ByU' if s=='SA BYU' else 'SA '+s[3:].title() if s in('SA ADDIN','SA ADDON') else s.title())
    m=re.match(r'B\.YU ([\d.]+)GB (\d+)H',s)
    if m:return f'ByU {m.group(1)}GB {m.group(2)}H'
    m=re.match(r'(\d+)GB (\d+)H',s);return f'VF {m.group(1)}GB {m.group(2)}H' if m else s
def rows_xlsx(p,sheet,sa):
    import openpyxl
    wb=openpyxl.load_workbook(p,read_only=True,data_only=True)
    for r in wb[sheet].iter_rows(min_row=2,values_only=True):
        if not r[1] or not r[5] or not r[6] or not hasattr(r[8],'day'):continue
        w=16 if sa else 12
        yield TP.get(str(r[2]).strip().upper(),str(r[2])),f'{r[8].year}-{r[8].day:02d}-{r[8].month:02d}|{str(r[1]).strip()}|{str(r[4]).strip()}|{str(int(r[5])).zfill(w)}|{str(int(r[6])).zfill(w)}|{int(r[7])}'
def lines(p,sa,sheet=None):
    if XL:yield from rows_xlsx(p,sheet,sa)
    else:
        for l in open(p,encoding='utf-8'):
            if l.strip():yield tap,l.strip()
def load(p,sa,only=None):
    R=[];warn=[]
    for tp_,l in lines(p,sa,'DROPINGAN SA' if sa else 'DROPINGAN VF'):
        if only and tp_!=only:continue
        d,sf,dn,a,b,q=l.split('|');y,dd,mm=d.split('-');q=int(q)
        if int(b)-int(a)+1!=q:warn.append(f'qty tidak cocok {a}-{b}')
        dd0=den(dn,sa)
        if re.match(r'VF 7GB (52|57)H',dd0):warn.append(f'denom meragukan "{dn}" ({sf} {a}-{b}, {q} pcs)')
        R.append([f'{y}-{mm}-{dd}',sfn(sf),dd0,a,b,q])
    return R,warn
taps=sorted({t for t,_ in lines(sys.argv[1],False,'DROPINGAN VF')}|{t for t,_ in lines(sys.argv[2] if not XL else sys.argv[1],True,'DROPINGAN SA')}) if XL else [tap]
taps=[t for t in taps if t!='BBT']  # BBT sudah punya Cek WL sendiri
p='wl-tap.js'
try:
    t=open(p).read();W=json.loads(t[t.index('=')+1:].rstrip().rstrip(';'))
except Exception:W={}
for tp_ in taps:
    VF,w1=load(sys.argv[1],False,tp_);SA,w2=load(sys.argv[1] if XL else sys.argv[2],True,tp_)
    def pisah(R,k):  # baris yang SN-nya tumpang tindih dengan baris lain dipisah sebagai anomali
        bad=set();L=[(i,r) for i,r in enumerate(R)]
        for x in range(len(L)):
            for y in range(x+1,len(L)):
                r1,r2=L[x][1],L[y][1]
                if len(r1[3])==len(r2[3]) and int(r1[3])<=int(r2[4]) and int(r2[3])<=int(r1[4]):bad.add(L[x][0]);bad.add(L[y][0])
        return [r for i,r in enumerate(R) if i not in bad],[[k]+r for i,r in enumerate(R) if i in bad]
    VF,x1=pisah(VF,'VF');SA,x2=pisah(SA,'SA');XX=x1+x2
    print('Anomali dipisah:',len(XX),'baris,',sum(r[6] for r in XX),'pcs')
    print('==',tp_)
    for w in w1+w2:print('!',w)
    print('VF',len(VF),sum(r[5] for r in VF),'SA',len(SA),sum(r[5] for r in SA))
    if not VF and not SA:continue
    W[tp_]={'upd':max(r[0] for r in VF+SA+[r[1:] for r in XX]),'VF':VF,'SA':SA,'X':XX}
open(p,'w').write('// Dropingan SN per SF (TAP selain BBT), dibuat dari tools/wl_tap.py\nconst WLT='+json.dumps(W,ensure_ascii=False,separators=(',',':'))+';\n')
print('Dropingan masuk:',', '.join(taps),'sampai',max(W[t]['upd'] for t in taps if t in W))
