# Semua ID outlet PJP Rohil: BBT (D.O di digipos.html) + BAA & UJT (data-tap.js). Dipakai script program Digipos.
import json,os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
_s=open(R+'/digipos.html').read();_i=_s.index('const D=')+8
D,_=json.JSONDecoder().raw_decode(_s[_i:])
TD=json.loads(open(R+'/data-tap.js').read()[12:].rstrip().rstrip(';'))
IB={o[0] for o in D['O']}
ALL=IB|{o[0] for x in TD.values() for o in x['O']}
