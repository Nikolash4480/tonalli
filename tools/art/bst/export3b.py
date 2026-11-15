import sys,math,json,pickle;sys.path.insert(0,'/tmp/bst');sys.path.insert(0,'/tmp/st');sys.path.insert(0,'/tmp/b5')
src=open('/tmp/exp/export.py').read();head=src[:src.index('out={};previews={}')]
g={};exec(head,g)
from style3 import to_board3_multi
from PIL import ImageOps
SPEC,bbox_union,U,encode=g['SPEC'],g['bbox_union'],g['U'],g['encode']
SIZE={1:1.25,2:1.45,3:1.7,4:1.95}
cur=open('/home/claude/beastart.js').read();CUR=json.loads(cur[len('const NEW_ART='):cur.index(';\n')])
out={};previews={}
for kind,(lvl,ld,mir) in SPEC.items():
  if kind=='jaguarsol':out[kind]=CUR[kind];print(kind,'(sin tocar)');continue
  idle,att=ld();att=att or []
  if mir:idle=[ImageOps.mirror(f) for f in idle];att=[ImageOps.mirror(f) for f in att]
  idle6=idle[::2][:6]
  ib=bbox_union(idle);iw,ih=ib[2]-ib[0],ib[3]-ib[1];asp=iw/ih;oh=SIZE[lvl]/math.sqrt(asp)/U;k=oh/ih
  ub=bbox_union(idle+att);cx=(ib[0]+ib[2])/2;half=max(cx-ub[0],ub[2]-cx)
  box=(int(math.floor(cx-half)),ub[1],int(math.ceil(cx+half)),ib[3])
  tw=max(1,round((box[2]-box[0])*k));th=max(1,round((box[3]-box[1])*k))
  frames=to_board3_multi([f.crop(box) for f in idle6+att],tw,th,28,2,0,0)
  pad=max(0,round((half-(iw/2))*k))
  out[kind]={'idle':len(idle6),'atk':len(att),'pad':pad,'frames':[encode(f) for f in frames]};previews[kind]=frames
  print(kind,lvl,len(frames),frames[0].size)
tail=src[src.index("js='const NEW_ART='"):]
tail=tail.replace("open('/tmp/exp/beastart.js','w')","open('/tmp/bst/beastart_v3b.js','w')").replace("open('/tmp/exp/prev.pkl','wb')","open('/tmp/bst/prev3b.pkl','wb')")
exec(tail)
