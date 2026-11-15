"""Guerrero jaguar (héroe) a partir de la referencia en pixel art: base sin arma ni brazo trasero,
macuahuitl redibujado y animaciones (reposo, preparación, golpe, remate, daño)."""
import math,numpy as np
from PIL import Image
from scipy import ndimage

SRC=np.asarray(Image.open('/tmp/hr/jag_clean.png').convert('RGBA')).copy()
H0,W0=SRC.shape[:2]
PADL,PADR,PADT=12,14,10          # margen para el arma y el golpe
W,H=W0+PADL+PADR,H0+PADT
def hx(c):return np.array([int(c[i:i+2],16) for i in (1,3,5)]+[255],np.uint8)
SK=[hx('#341f14'),hx('#7e3f35'),hx('#a2583a'),hx('#c06e46'),hx('#d88a5a')]
CREAM=[hx('#8e5c40'),hx('#e0c898')]
WOOD=[hx('#2a1408'),hx('#5e351e'),hx('#8a5428')]
OBS=[hx('#16141e'),hx('#3a3a52'),hx('#c8d4ff')]
GOLD=hx('#ecc86d')

def base_body():
  b=np.zeros((H,W,4),np.uint8);b[PADT:PADT+H0,PADL:PADL+W0]=SRC
  def at(x,y):return (y+PADT,x+PADL)
  # 1) borrar el arma vieja (banda diagonal sobre los muslos)
  yy,xx=np.mgrid[0:H0,0:W0]
  def segd(p,q):
    px,py=xx-p[0],yy-p[1];dx,dy=q[0]-p[0],q[1]-p[1];t=np.clip((px*dx+py*dy)/(dx*dx+dy*dy),0,1)
    return np.hypot(px-t*dx,py-t*dy)
  wm=(segd((10,30),(30,36))<2.2)&(xx>=9)&(yy>=27)&(yy<=38)
  # 2) borrar el brazo trasero
  am=(xx<=11)&(yy>=14)&(yy<=34)&~((yy>=33)&(xx<=8))
  sub=b[PADT:PADT+H0,PADL:PADL+W0]
  sub[am]=0
  # rellenar la zona del arma: muslos, taparrabo y hueco entre piernas
  for y,x in zip(*np.nonzero(wm)):
    if 10<=x<=14:  c=SK[3] if x in(11,12) else SK[2] if x==13 else SK[1]
    elif 20<=x<=24:c=SK[3] if x in(21,22) else SK[2] if x==23 else SK[1]
    elif 15<=x<=19 and y<=33:c=CREAM[1] if 16<=x<=18 else CREAM[0]
    else:c=np.zeros(4,np.uint8)
    sub[y,x]=c
  return b

def outline(c):
  al=c[...,3]>0
  edge=al&~ndimage.binary_erosion(al)
  # contorno de color: oscurecer el borde
  e=edge&(c[...,:3].astype(int).sum(-1)>150)
  c[e,:3]=(c[e,:3]*np.array([.42,.36,.42])).astype(np.uint8)
  return c

def put(c,x,y,col):
  x,y=int(round(x)),int(round(y))
  if 0<=x<W and 0<=y<H:c[y,x]=col
def capsule(c,p,q,r,cols,mask_only=False):
  """línea gruesa sombreada: cols=[borde,sombra,medio,luz]"""
  yy,xx=np.mgrid[0:H,0:W];px,py=xx+.5-p[0],yy+.5-p[1];dx,dy=q[0]-p[0],q[1]-p[1]
  L2=dx*dx+dy*dy or 1;t=np.clip((px*dx+py*dy)/L2,0,1);d=np.hypot(px-t*dx,py-t*dy)
  m=d<=r
  nx,ny=-dy,dx;L=math.hypot(nx,ny) or 1;side=((px-t*dx)*nx+(py-t*dy)*ny)/L
  lvl=np.where(d>r-.7,0,np.where(side<-.3,3,np.where(side>.4,1,2)))
  for k,col in enumerate(cols):c[m&(lvl==k)]=col
  return m

def arm(c,sh,hand,elbow_bias=1):
  mx,my=(sh[0]+hand[0])/2,(sh[1]+hand[1])/2;dx,dy=hand[0]-sh[0],hand[1]-sh[1];L=math.hypot(dx,dy) or 1
  el=(mx-dy/L*2.2*elbow_bias,my+dx/L*2.2*elbow_bias)
  capsule(c,sh,el,2.3,SK[:4]);capsule(c,el,hand,2.0,SK[:4])
  # brazalete de oro en el antebrazo
  bx,by=el[0]+(hand[0]-el[0])*.55,el[1]+(hand[1]-el[1])*.55;put(c,bx,by,GOLD);put(c,bx+.6,by+.4,GOLD)
  # mano
  capsule(c,hand,hand,1.6,[SK[0],SK[2],SK[3],SK[4]])

def macuahuitl(c,hand,ang,L=15):
  """mango corto + paleta de madera con hojas de obsidiana en los dos filos"""
  ux,uy=math.cos(ang),math.sin(ang);nx,ny=-uy,ux
  h0=(hand[0]-ux*2,hand[1]-uy*2);p0=(hand[0]+ux*2,hand[1]+uy*2);p1=(hand[0]+ux*L,hand[1]+uy*L)
  capsule(c,h0,p0,1.0,[WOOD[0],WOOD[1],WOOD[1],WOOD[2]])
  capsule(c,p0,p1,1.9,[WOOD[0],WOOD[1],WOOD[2],WOOD[2]])
  n=int(L-3)
  for i in range(1,n,2):
    t=3+i
    for s in(-1,1):
      x=hand[0]+ux*t+nx*2.6*s;y=hand[1]+uy*t+ny*2.6*s
      put(c,x,y,OBS[1]);put(c,x+nx*.9*s,y+ny*.9*s,OBS[0])
      if i%4==1:put(c,x,y,OBS[2])
  put(c,p1[0]+ux,p1[1]+uy,OBS[0])

def slash(c,center,r0,a0,a1,life):
  for k,(rr,col) in enumerate(((r0+1.2,np.array([255,190,80,255],np.uint8)),(r0,np.array([255,250,220,255],np.uint8)),(r0-1.4,np.array([255,160,60,255],np.uint8)))):
    steps=40
    for i in range(steps):
      t=i/steps;a=a0+(a1-a0)*t
      if t<1-life:continue
      put(c,center[0]+math.cos(a)*rr,center[1]+math.sin(a)*rr,col)

BASE=base_body()
SH=(PADL+12,PADT+17)       # hombro trasero
def shifted(img,dx,dy,top_only_y=None):
  out=np.zeros_like(img)
  if top_only_y is None:
    out=np.roll(np.roll(img,dy,0),dx,1);return out
  out[:]=img
  up=img[:top_only_y].copy();out[:top_only_y]=0
  r=np.roll(np.roll(up,dy,0),dx,1)
  if dy>0:r[:dy]=0
  m=r[...,3]>0;out[:top_only_y][m]=r[m]
  return out

def frame(kind,i=0):
  if kind=='idle':
    bob=1 if i in(2,3,4) else 0
    c=shifted(BASE,0,bob,top_only_y=PADT+31)
    c2=np.zeros_like(c)
    hand=(PADL+8,PADT+33+bob)
    macuahuitl(c2,hand,math.radians(118+3*math.sin(i/6*6.28)),L=14)
    arm(c2,(SH[0],SH[1]+bob),hand,elbow_bias=-1)
    m=c2[...,3]>0;c[m]=c2[m]   # brazo trasero va delante del costado (es el que sostiene el arma)
    return outline(c)
  if kind=='windup':
    c=shifted(BASE,-1,0)
    c2=np.zeros_like(c);hand=(SH[0]-6,SH[1]-9)
    macuahuitl(c2,hand,math.radians(200),L=14);arm(c2,(SH[0]-1,SH[1]),hand,elbow_bias=1)
    m=c2[...,3]>0;c[m]=c2[m];return outline(c)
  if kind=='strike':
    c=shifted(BASE,3,0)
    c2=np.zeros_like(c);hand=(SH[0]+15,SH[1]+3)
    slash(c2,(SH[0]+14,SH[1]+5),13,math.radians(-85),math.radians(35),1)
    macuahuitl(c2,hand,math.radians(8),L=14);arm(c2,(SH[0]+3,SH[1]),hand,elbow_bias=-1)
    m=c2[...,3]>0;c[m]=c2[m];return outline(c)
  if kind=='follow':
    c=shifted(BASE,2,0)
    c2=np.zeros_like(c);hand=(SH[0]+13,SH[1]+11)
    slash(c2,(SH[0]+14,SH[1]+5),13,math.radians(-40),math.radians(75),.45)
    macuahuitl(c2,hand,math.radians(70),L=14);arm(c2,(SH[0]+2,SH[1]),hand,elbow_bias=-1)
    m=c2[...,3]>0;c[m]=c2[m];return outline(c)
  if kind=='hurt':
    c=shifted(BASE,-2,0)
    c2=np.zeros_like(c);hand=(SH[0]-5,SH[1]+13)
    macuahuitl(c2,hand,math.radians(140),L=14);arm(c2,(SH[0]-2,SH[1]),hand,elbow_bias=-1)
    m=c2[...,3]>0;c[m]=c2[m];c=outline(c)
    al=c[...,3]>0;c[al,:3]=np.clip(c[al,:3].astype(int)*[1.25,.8,.8]+[30,0,0],0,255).astype(np.uint8)
    return c

idle=[Image.fromarray(frame('idle',i),'RGBA') for i in range(6)]
att=[Image.fromarray(frame(k),'RGBA') for k in ('windup','strike','follow','hurt')]
if __name__=='__main__':
  S=7;bg=(70,80,60,255)
  seq=idle+idle+[att[0],att[0],att[1],att[2],att[2]]+idle+[att[3],att[3]]+idle
  dur=[140]*12+[160,200,90,120,160]+[140]*6+[120,120]+[140]*6
  fr=[]
  for f in seq:
    b=Image.new('RGBA',f.size,bg);b.alpha_composite(f);fr.append(b.resize((W*S,H*S),Image.NEAREST).convert('RGB'))
  fr[0].save('/tmp/hr/jag_anim.gif',save_all=True,append_images=fr[1:],duration=dur,loop=0)
  strip=Image.new('RGBA',(W*(1+len(att)),H),bg)
  for k,f in enumerate([idle[0]]+att):strip.alpha_composite(f,(k*W,0))
  strip.resize((strip.width*5,strip.height*5),Image.NEAREST).save('/tmp/hr/jag_strip.png');print('ok',W,H)
