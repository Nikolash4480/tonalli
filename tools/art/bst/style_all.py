import sys,math,pickle;sys.path.insert(0,'/tmp/bst');sys.path.insert(0,'/tmp/st');sys.path.insert(0,'/tmp/b5')
src=open('/tmp/exp/export.py').read();src=src[:src.index('out={};previews={}')]
g={};exec(src,g)
from style3 import to_board3
from PIL import ImageOps
SPEC,bbox_union,U=g['SPEC'],g['bbox_union'],g['U'];SIZE={1:1.25,2:1.45,3:1.7,4:1.95}
res={}
for kind,(lvl,ld,mir) in SPEC.items():
  idle,att=ld();att=att or []
  if mir:idle=[ImageOps.mirror(f) for f in idle];att=[ImageOps.mirror(f) for f in att]
  ib=bbox_union(idle);iw,ih=ib[2]-ib[0],ib[3]-ib[1];asp=iw/ih;oh=SIZE[lvl]/math.sqrt(asp)/U;k=oh/ih
  ub=bbox_union(idle+att);cx=(ib[0]+ib[2])/2;half=max(cx-ub[0],ub[2]-cx)
  box=(int(math.floor(cx-half)),ub[1],int(math.ceil(cx+half)),ib[3])
  tw=max(1,round((box[2]-box[0])*k));th=max(1,round((box[3]-box[1])*k))
  nc=18 if lvl>=3 else 16
  res[kind]=to_board3(idle[0].crop(box),tw,th,nc,2,3,16)
  res[kind].save(f'/tmp/bst/out/{kind}_new.png');print(kind,res[kind].size)
