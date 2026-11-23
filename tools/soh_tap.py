# Stock on Hand BAA & UJT (SURYA stock-on-hand, tap=BAGAN SIAPI-API / UJUNG TANJUNG) -> data-tap-pj.js TAPJ[k].SOHV/SOHS
# Pakai: python3 tools/soh_tap.py <soh.json> <hari_paste> <hari_MTD> <sisa_HK>
# soh.json = {"BAAPV":[rows],"BAASA":[rows],"UJTPV":[...],"UJTSA":[...]} rows=[sf,validity,target,targetDaily,actual,stock,kurang,status]
import sys,json,re
S=json.load(open(sys.argv[1]));D=int(sys.argv[2]);AD=int(sys.argv[3]);SI=int(sys.argv[4])
t=open('data-tap-pj.js').read();j=t.find('=')+1;T,e=json.JSONDecoder().raw_decode(t[j:])
for k in('BAA','UJT'):
    T[k]['SOHV']={'d':D,'ad':AD,'sisa':SI,'rows':S[k+'PV']};T[k]['SOHS']={'d':D,'ad':AD,'sisa':SI,'rows':S[k+'SA']}
    print(k,'PV',len(S[k+'PV']),'SA',len(S[k+'SA']))
open('data-tap-pj.js','w').write(t[:j]+json.dumps(T,ensure_ascii=False,separators=(',',':'))+t[j+e:])
