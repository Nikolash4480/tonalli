import sys,json,os
sys.path.insert(0,'/tmp/sp');os.chdir('/tmp/sp')
from pal import PAL
def crop(rows,drop_floor=True):
  rows=[''.join(r) if not isinstance(r,str) else r for r in rows]
  W=max(len(r) for r in rows);rows=[r.ljust(W,'.') for r in rows]
  if drop_floor:
    # quitar filas de sombra/aro del piso (solo S/l/L) al final
    while rows and set(rows[-1])<=set('.SlL'):rows.pop()
    rows=[r.replace('S','.') if i>len(rows)-4 and set(r)<=set('.SlL') else r for i,r in enumerate(rows)]
  ys=[y for y,r in enumerate(rows) if r.strip('.')];xs=[x for r in rows for x,ch in enumerate(r) if ch!='.']
  y0,y1=min(ys),max(ys);x0,x1=min(xs),max(xs)
  return [r[x0:x1+1] for r in rows[y0:y1+1]]
nj={};exec(open('jagupright_D.py').read(),nj)
J=crop(nj['JUP'])
# el aro del piso del jaguar: borrar píxeles 'l'/'S' aislados en las últimas filas
J=[ (''.join('.' if (ch in 'lS' and y>len(J)-6) else ch for ch in r)) for y,r in enumerate(J)]
J=crop(J,False)
sys.path.insert(0,'/tmp/b4');os.chdir('/tmp/b4')
import alacran,tzinacan,caido
A=crop(alacran.ALA);T=crop(tzinacan.TZI);GU=crop(caido.BODY)
used=set(''.join(J+A+T+GU))-{'.'}
pal={k:'#%02x%02x%02x'%PAL[k] for k in used}
out={'pal':pal,'jaguarsol':J,'alacran':A,'tzinacan':T,'guerrero':GU}
open('/tmp/bst/bossart.js','w').write('const BOSS_ART='+json.dumps(out,separators=(',',':'))+';\n')
print({k:(len(v[0]),len(v)) for k,v in out.items() if k!='pal'})
