# Tambahkan/ganti peta tanggal drop (CK.DM) di cekst-data.js TANPA baca raw ST (cepat). Argumen sama dgn cekst_build: --wl --add --byu
# Pakai: python3 tools/cekst_dm.py --wl WL.xlsx --add WL_baru1.xlsx WL_baru2.xlsx
import sys,json,argparse,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import cekst_build as cb
ap=argparse.ArgumentParser();ap.add_argument('--wl');ap.add_argument('--byu');ap.add_argument('--add',nargs='*',default=[]);a=ap.parse_args()
L=cb.assemble(a);cb.drop_tp(L);D=cb.dm(L)
p='cekst-data.js';t=open(p).read();i=t.index('const CK=')+9;CK,e=json.JSONDecoder().raw_decode(t[i:])
CK['DM']=D;t=t[:i]+json.dumps(CK,ensure_ascii=False,separators=(',',':'))+t[i+e:];open(p,'w').write(t)
print({k:len(v) for k,v in D.items()},len(t))
