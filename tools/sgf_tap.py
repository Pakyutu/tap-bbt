# Stock Gudang per SF BAA & UJT (SURYA stock-gudang, mode SF, tanggal) -> data-tap-pj.js TAPJ[k].SGF
# Pakai: python3 tools/sgf_tap.py <sgf.json> <tgl>   (json={"c":[kolom],"rows":{"BAA":[[sf,[qty..]]],"UJT":[...]}})
import sys,json
S=json.load(open(sys.argv[1]));D=int(sys.argv[2])
t=open('data-tap-pj.js').read();j=t.find('=')+1;T,e=json.JSONDecoder().raw_decode(t[j:])
for k in('BAA','UJT'):T[k]['SGF']={'d':D,'c':S['c'],'rows':S['rows'][k]};print(k,len(S['rows'][k]))
open('data-tap-pj.js','w').write(t[:j]+json.dumps(T,ensure_ascii=False,separators=(',',':'))+t[j+e:])
