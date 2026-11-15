import sys,io,base64,json,os
sys.path.insert(0,'/tmp/sp');os.chdir('/tmp/sp')
from pal import PAL
from PIL import Image
def png(rows,sil=False,S=1):
  rows=[''.join(r) if not isinstance(r,str) else r for r in rows]
  H=len(rows);W=max(len(r) for r in rows)
  # recortar bordes vacíos
  ys=[y for y,r in enumerate(rows) if r.strip('.')];xs=[x for r in rows for x,ch in enumerate(r) if ch!='.']
  y0,y1=min(ys),max(ys);x0,x1=min(xs),max(xs)
  im=Image.new('RGBA',(x1-x0+1,y1-y0+1),(0,0,0,0))
  for y in range(y0,y1+1):
    for x,ch in enumerate(rows[y]):
      if ch!='.' and x0<=x<=x1:
        if ch=='S' and y>=y1-1:continue   # sin sombra de piso
        im.putpixel((x-x0,y-y0),((74,60,96,255) if sil else PAL[ch]+(255,)))
  b=io.BytesIO();im.save(b,'PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
ns={};src=open('roster.py').read().split("def img(rows,sc):")[0];exec(src,ns)
out={}
out['ahuizotl']=png(ns['ns3']['AH'],True);out['chaneque']=png(ns['CHA'],True)
out['xolotl']=png(ns['ns3']['XO'],True);out['nahual']=png(ns['ns3']['NA'],True)
out['tepeyollotl']=png(ns['nsb']['TP'],True);out['quinametzin']=png(ns['nsb']['QN'],True)
n4={};exec(open('lvl3d.py').read().split("F=ImageFont")[0].split("from PIL import")[0] if False else open('lvl3d.py').read().split("\nF=ImageFont")[0],n4);out['xochitonal']=png(n4['XOC'],True)
nj={};exec(open('jagupright_D.py').read(),nj);out['jaguarsol']=png(nj['JUP'])
sys.path.insert(0,'/tmp/b4');os.chdir('/tmp/b4')
import alacran,tzinacan
out['alacran']=png(alacran.ALA);out['tzinacan']=png(tzinacan.TZI)
js='const BESTIARY_IMG='+json.dumps(out)+';\n'
open('/tmp/bst/bimg.js','w').write(js);print({k:len(v) for k,v in out.items()})
