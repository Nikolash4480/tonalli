"""Cazador de Mixcóatl: pose y animación de la referencia (arquero), recoloreada a cazador mexica
(capucha y ropa roja y blanca, piel morena, adornos de oro) y arco de madera dibujado a la resolución final."""
import sys,math,numpy as np
sys.path.insert(0,'/tmp/hr/cz');sys.path.insert(0,'/tmp/st')
from PIL import Image
from lowres import to_board2
import cz
from scipy import ndimage
hx=lambda c:np.array([int(c[i:i+2],16) for i in (1,3,5)]+[255],np.uint8)
K=.78
X0,Y0,X1,Y1=40,56,96,104            # recorte en coordenadas de la referencia
PT=6
def ref2f(p):return ((p[0]-X0)*K,(p[1]-Y0)*K+PT)
W,H=round((X1-X0)*K)+22,round((Y1-Y0)*K)+4+PT
def aztec(o):
  """capucha -> pelo negro con cinta roja y plumas; ropa -> piel de venado; carcaj a la espalda"""
  o=o.copy();Yg,Xg=np.mgrid[0:o.shape[0],0:o.shape[1]]
  Wm=cz.isin(o,[cz.hx('#f0e8dc')]);R1=cz.isin(o,[cz.hx('#c83028')]);R2=cz.isin(o,[cz.hx('#8a1e1a')]);R3=cz.isin(o,[cz.hx('#4a0e0e')])
  head=(Xg>=61)&(Xg<=74)&(Yg>=60)&(Yg<=71)
  face=head&(Xg>=69)&(Yg>=63)&(Yg<=69)
  o[head&~face&(Wm|R1)]=hx('#2a2026');o[head&~face&(R2|R3)]=hx('#141014')
  o[face&(Wm|R1)]=hx('#c06e46');o[face&R2]=hx('#a2583a');o[face&R3]=hx('#7e3f35')
  o[65,70]=hx('#1a0c06');o[67,71]=hx('#7e3f35')
  for x in range(63,73):
    if o[64,x,3]:o[64,x]=hx('#c83028')
  o[64,64]=hx('#e8b830')
  # plumas blancas con punta roja hacia atrás y arriba
  for (x,y,c) in [(64,62,'#f0e8dc'),(63,61,'#f0e8dc'),(63,60,'#f0e8dc'),(62,59,'#f0e8dc'),(62,58,'#c83028'),
                  (66,62,'#f0e8dc'),(66,61,'#f0e8dc'),(65,60,'#f0e8dc'),(65,59,'#c83028'),(62,60,'#f0e8dc'),(64,59,'#f0e8dc'),(61,58,'#f0e8dc')]:
    o[y,x]=hx(c)
  # rellenar huecos dentro del cuerpo (los dejaba el arco/cuerda original) con el color vecino más cercano
  m=o[...,3]>0
  holes=ndimage.binary_fill_holes(ndimage.binary_closing(m,iterations=1))&~m
  idx=ndimage.distance_transform_edt(~m,return_distances=False,return_indices=True)
  o[holes]=o[idx[0][holes],idx[1][holes]]
  # oro sobre la cara -> piel
  G=cz.isin(o,[cz.hx('#e8b830'),cz.hx('#ffe07a')])&head
  o[G]=hx('#c06e46')
  body=~head
  o[body&Wm]=hx('#d8b07a');o[body&R1]=hx('#a8784a');o[body&R2]=hx('#7a4e2c');o[body&R3]=hx('#4a2c18')
  # oro -> brazal de cuero de arquero (con una línea roja)
  G1=cz.isin(o,[cz.hx('#e8b830')]);G2=cz.isin(o,[cz.hx('#ffe07a')])
  o[G1&body]=hx('#7a4e2c');o[G2&body]=hx('#b8864e')
  # carcaj de cuero detrás de la espalda con flechas asomando
  empty=o[...,3]==0
  for k in range(14):
    x=60-k*.35;y=63+k
    for d in (-1,0,1):
      X,Y=int(round(x+d)),int(round(y))
      if empty[Y,X]:o[Y,X]=hx(['#5a3418','#a8784a','#7a4e2c'][d+1])
  for (x,y,c) in [(60,62,'#c83028'),(61,61,'#f0e8dc'),(59,61,'#f0e8dc'),(60,60,'#c83028'),(62,62,'#7a4e2c'),(58,62,'#7a4e2c')]:
    if o[y,x,3]==0:o[y,x]=hx(c)
  return o
def body(i,feet=None,dx=0,bob=0):
  o=aztec(cz.strip_bow(cz.recolor(i),feet_y=feet))
  if bob:
    top=o[:84].copy();o[:84]=0;r=np.roll(top,bob,0);r[:bob]=0;m=r[...,3]>0;o[:84][m]=r[m]
  o=o[Y0:Y1,X0:X1]
  s=np.asarray(to_board2(Image.fromarray(o),round((X1-X0)*K),round((Y1-Y0)*K),'selout'))
  c=np.zeros((H,W,4),np.uint8);c[PT:PT+s.shape[0],dx:dx+s.shape[1]]=s
  for (x,y,col) in [(19,9,'#f0e8dc'),(19,8,'#f0e8dc'),(18,7,'#f0e8dc'),(18,6,'#c83028'),(21,9,'#f0e8dc'),(21,8,'#f0e8dc'),(21,7,'#c83028')]:
    c[y+bob,x+dx]=hx(col)
  return c
def put(c,x,y,col):
  x,y=int(round(x)),int(round(y))
  if 0<=x<W and 0<=y<H:c[y,x]=col
def line(c,p,q,col):
  n=int(max(abs(q[0]-p[0]),abs(q[1]-p[1]))*1.5)+1
  for k in range(n+1):t=k/n;put(c,p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,col)
WOOD=[hx('#3a2414'),hx('#6a4424'),hx('#9a6a3a'),hx('#c8945a')]
RED=hx('#c83028');STR=hx('#e8e0d0');OB=[hx('#0e0c14'),hx('#2e2c40'),hx('#e6ecff')]
def bow_pts(L=20,bend=4.5,ang=0):
  """puntos del arco (vertical, curva hacia +x = adelante) rotados ang radianes, alrededor de la empuñadura"""
  pts=[]
  for k in range(0,41):
    t=(k-20)/20;x=bend*(1-t*t)**.9-bend;y=t*L/2
    ca,sa=math.cos(ang),math.sin(ang);pts.append((x*ca-y*sa,x*sa+y*ca))
  return pts
def draw_bow(c,grip,ang,string_to=None,L=20,bend=4.5):
  """dibuja el arco como pieza fija: siempre la misma curva; sólo cambia hacia dónde se tensa la cuerda"""
  P=bow_pts(L,bend,ang);P=[(grip[0]+x,grip[1]+y) for x,y in P]
  tipA,tipB=P[0],P[-1]
  # cuerda
  if string_to is None:line(c,tipA,tipB,STR)
  else:
    # cuerda tensada: pasa por detrás del cuerpo para no tapar la pierna ni el torso
    tmp=np.zeros_like(c);line(tmp,tipA,string_to,STR);line(tmp,string_to,tipB,STR)
    m=(tmp[...,3]>0)&(c[...,3]==0);c[m]=tmp[m]
  # madera con borde oscuro y luz en la cara exterior
  for k in range(40):
    p,q=P[k],P[k+1];t=abs(k-20)/20
    col=WOOD[2] if t<.75 else WOOD[1]
    line(c,p,q,col)
    nx,ny=math.cos(ang),math.sin(ang)
    put(c,p[0]+nx,p[1]+ny,WOOD[0] if t<.85 else WOOD[0])
    if t<.6:put(c,p[0]-nx*.6,p[1]-ny*.6,WOOD[3])
  # atadura roja en la empuñadura y puntas
  g=P[20];put(c,g[0],g[1],RED);put(c,g[0]-math.sin(ang),g[1]+math.cos(ang),RED);put(c,g[0]+math.sin(ang),g[1]-math.cos(ang),RED)
  put(c,tipA[0],tipA[1],WOOD[0]);put(c,tipB[0],tipB[1],WOOD[0])
  return tipA,tipB
def arrow(c,tail,head):
  line(c,tail,head,WOOD[2])
  dx,dy=head[0]-tail[0],head[1]-tail[1];L=math.hypot(dx,dy);ux,uy=dx/L,dy/L
  put(c,head[0],head[1],OB[1]);put(c,head[0]+ux,head[1]+uy,OB[0]);put(c,head[0]-uy*.8,head[1]+ux*.8,OB[0]);put(c,head[0]+uy*.8,head[1]-ux*.8,OB[2])
  for k in (0,1):put(c,tail[0]+ux*k-uy,tail[1]+uy*k+ux,RED);put(c,tail[0]+ux*k+uy,tail[1]+uy*k-ux,hx('#f0e8dc'))
def tint(c):
  al=c[...,3]>0;c[al,:3]=np.clip(c[al,:3].astype(int)*[1.25,.8,.8]+[30,0,0],0,255).astype(np.uint8)
# manos en coordenadas de la referencia (medidas sobre los cuadros)
def frame(kind,i=0):
  fh0=ref2f((86,74));bh0=ref2f((49,66))
  if kind=='guard':
    b=1 if i in(2,3,4) else 0
    c=body(42,98,bob=b);fh=(fh0[0],fh0[1]+b)
    draw_bow(c,fh,0)                       # en guardia: arco al frente, cuerda floja
  elif kind=='draw':
    c=body(40,98);draw_bow(c,fh0,0,string_to=bh0);arrow(c,(bh0[0],bh0[1]+.5),(fh0[0]+5,fh0[1]+.5))
  elif kind=='release':
    c=body(42,98);draw_bow(c,fh0,0)
    head=(fh0[0]+16,fh0[1]);arrow(c,(head[0]-9,head[1]),head)
    for k in range(6):put(c,fh0[0]+1+k*1.2,fh0[1],hx('#fffbe0'))
  elif kind=='follow':
    c=body(42,98);draw_bow(c,fh0,0)
  else:
    c=body(42,98);c=np.roll(c,-2,1);draw_bow(c,(fh0[0]-2,fh0[1]),0);tint(c)
  return Image.fromarray(c,'RGBA')
guard=[frame('guard',i) for i in range(6)]
att=[frame(k) for k in ('draw','release','follow','hurt')]
if __name__=='__main__':
  bg=(70,80,60,255);S=7
  strip=Image.new('RGBA',(W*5,H),bg)
  for j,f in enumerate([guard[0]]+att):strip.alpha_composite(f,(j*W,0))
  strip.resize((strip.width*S,strip.height*S),Image.NEAREST).save('/tmp/hr/cz/strip.png')
  seq=[('g',i) for i in range(6)]*3+[('a',0),('a',0),('a',0),('a',1),('a',2),('a',2)]+[('g',i) for i in range(6)]+[('a',3),('a',3)]+[('g',i) for i in range(6)]
  dur=[140]*18+[160,160,200,100,150,160]+[140]*6+[120,120]+[140]*6
  out=[]
  for t,i in seq:
    f=guard[i] if t=='g' else att[i];b=Image.new('RGBA',(W,H),bg);b.alpha_composite(f);out.append(b.resize((W*S,H*S),Image.NEAREST).convert('RGB'))
  out[0].save('/tmp/hr/cz/anim.gif',save_all=True,append_images=out[1:],duration=dur,loop=0);print('ok',W,H)
