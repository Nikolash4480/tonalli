"""Guerrero águila – poses de combate con lógica de lanza:
guardia de lado, pie delantero adelante y trasero atrás, rodillas flexionadas, torso hacia el frente,
mano trasera en la cadera y delantera adelante, lanza apuntando al pecho del rival (alcance).
Estocada: el pie trasero empuja, el delantero avanza, los brazos se extienden y la lanza sale recta.
Torso de la referencia; piernas, brazos, faja y lanza dibujados a la resolución final."""
import sys,math,numpy as np,importlib.util
sys.path.insert(0,'/tmp/hr/ag');sys.path.insert(0,'/tmp/st')
from PIL import Image
from lowres import to_board2
import ag,comp
sp=importlib.util.spec_from_file_location('h8','/tmp/hr/hero_jag68.py');H8=importlib.util.module_from_spec(sp);sp.loader.exec_module(H8)
K=.5;W,H=66,46;GROUND=43
hx=ag.hx
# ---- torso (sin brazos ni piernas) a resolución final
tb=ag.body(False,front=False).copy();tb[45:]=0
T=np.asarray(to_board2(Image.fromarray(tb,'RGBA'),round(ag.w*K),round(ag.h*K),'selout')).copy()
# pico y cresta nativos (mismas coords que comp.small, sin PL/PT)
for (x,y,col) in [(26,7,'#8a5010'),(27,7,'#f0b030'),(28,7,'#f0b030'),(29,7,'#c07818'),(27,8,'#f0b030'),(28,8,'#ffe080'),(29,8,'#f0b030'),(30,8,'#c07818'),
                  (29,9,'#8a5010'),(30,9,'#2a1408'),(24,7,'#fff6e0'),(25,7,'#120a06'),(26,13,'#f0b030'),(27,13,'#f0b030'),(28,13,'#c07818'),
                  (20,7,'#f6f2e8'),(19,6,'#f6f2e8'),(18,6,'#e0d4bc'),(20,9,'#f6f2e8'),(19,9,'#e0d4bc')]:
  T[y,x-2]=hx(col)
THIP=(20,22)                    # cadera dentro de T
TSH_B=(16.5,15);TSH_F=(26,15.5) # hombros dentro de T
PANT=[hx('#2a1408'),hx('#5a3418'),hx('#8a5a30'),hx('#b88a50')]
BOOT=[hx('#120a06'),hx('#3e2414'),hx('#5e3a20'),hx('#7e5230')]
GOLD=hx('#e8c040');RED=[hx('#3a0a0c'),hx('#7e161a'),hx('#c4302a')]

def put(c,x,y,col):
  x,y=int(round(x)),int(round(y))
  if 0<=x<W and 0<=y<H:c[y,x]=col
def cap(c,p,q,r,cols):
  yy,xx=np.mgrid[0:H,0:W];px,py=xx+.5-p[0],yy+.5-p[1];dx,dy=q[0]-p[0],q[1]-p[1]
  L2=dx*dx+dy*dy or 1;t=np.clip((px*dx+py*dy)/L2,0,1);d=np.hypot(px-t*dx,py-t*dy);m=d<=r
  nx,ny=-dy,dx;L=math.hypot(nx,ny) or 1;side=((px-t*dx)*nx+(py-t*dy)*ny)/L
  lv=np.where(d>r-.75,0,np.where(side<-.4,3,np.where(side>.5,1,2)))
  for k,col in enumerate(cols):c[m&(lv==k)]=col
def ik(a,b,l1,l2,bend):
  dx,dy=b[0]-a[0],b[1]-a[1];d=min(math.hypot(dx,dy),l1+l2-.01);ang=math.atan2(dy,dx)
  cosA=(l1*l1+d*d-l2*l2)/(2*l1*d);A=math.acos(max(-1,min(1,cosA)))
  t=ang-bend*A;return (a[0]+math.cos(t)*l1,a[1]+math.sin(t)*l1)
def leg(c,hip,ankle,far):
  """rodilla siempre hacia adelante (derecha). far = pierna del lado lejano (más oscura)"""
  kn=ik(hip,ankle,9.6,9.4,1)
  P=PANT if not far else [PANT[0],PANT[0],PANT[1],PANT[2]]
  Bt=BOOT if not far else [BOOT[0],BOOT[0],BOOT[1],BOOT[2]]
  cap(c,hip,kn,2.4,P)
  mid=(kn[0]+(ankle[0]-kn[0])*.35,kn[1]+(ankle[1]-kn[1])*.35)
  cap(c,kn,mid,2.0,P);cap(c,mid,ankle,1.9,Bt)
  put(c,mid[0],mid[1],GOLD);put(c,mid[0]+1,mid[1],GOLD)
  # pie hacia adelante, apoyado
  for k in range(4):put(c,ankle[0]+k-.5,GROUND,Bt[1] if k<3 else Bt[0]);put(c,ankle[0]+k-1,GROUND-1,Bt[2] if k in(1,2) else Bt[0])
  put(c,ankle[0]-1,GROUND,Bt[0])
def torso(c,hip,lean):
  """pega el torso con la cadera en hip y lo inclina: cada fila se corre lean*altura"""
  ox,oy=hip[0]-THIP[0],hip[1]-THIP[1]
  for y in range(T.shape[0]):
    sh=int(round(lean*(THIP[1]-y)))
    for x in range(T.shape[1]):
      if T[y,x,3]:
        X,Y=x+ox+sh,y+oy
        if 0<=X<W and 0<=Y<H:c[Y,X]=T[y,x]
  f=lambda p:(p[0]+ox+lean*(THIP[1]-p[1]),p[1]+oy)
  return f(TSH_B),f(TSH_F)
def sash(c,hip,sway):
  for k in range(10):
    x=hip[0]+1+sway*k/9;y=hip[1]+k
    put(c,x-1,y,RED[1]);put(c,x,y,RED[2]);put(c,x+1,y,RED[1] if k<9 else RED[0])
  put(c,hip[0]-2,hip[1]-1,GOLD);put(c,hip[0]+3,hip[1]-1,GOLD)
# ---- lanza: sprite horizontal fijo y versión inclinada fija (sube 1 px cada 4)
SPR,GRIP=ag.spear_sprite()
def incline(a,step=4):
  h,w=a.shape[:2];up=(w-1)//step;o=np.zeros((h+up,w,4),np.uint8)
  for x in range(w):o[up-x//step:up-x//step+h,x]=a[:,x]
  return o,up
SPRI,UPI=incline(SPR)
def spear(c,grip_at,inclined):
  if inclined:
    a=SPRI;gx,gy=GRIP[0],GRIP[1]+UPI-GRIP[0]//4
  else:a=SPR;gx,gy=GRIP
  ox,oy=int(round(grip_at[0]))-gx,int(round(grip_at[1]))-gy
  for y,x in zip(*np.nonzero(a[...,3]>0)):
    X,Y=x+ox,y+oy
    if 0<=X<W and 0<=Y<H:c[Y,X]=a[y,x]
def on_spear(grip_at,inclined,d):
  """punto del astil a d píxeles de la empuñadura hacia la punta"""
  return (grip_at[0]+d,grip_at[1]-(d/4 if inclined else 0))

def pose(hip,lean,back_foot,front_foot,rear_hand,front_d,inclined,sway=0,lines=False,hurt=False):
  c=np.zeros((H,W,4),np.uint8)
  leg(c,(hip[0]-1.5,hip[1]),back_foot,True)
  leg(c,(hip[0]+1.5,hip[1]),front_foot,False)
  shB,shF=torso(c,hip,lean)
  sash(c,hip,sway)
  fh=on_spear(rear_hand,inclined,front_d)
  if lines:
    for (dy,dx,L) in [(-8,-6,4),(-3,-8,5),(3,-7,4),(9,-5,3)]:
      for k in range(L):put(c,hip[0]+dx-k,hip[1]+dy,hx('#d8e4f0') if k<L-1 else hx('#9aa8b8'))
    for k in range(8):put(c,fh[0]+2+k*2,fh[1]-1,hx('#e8f0ff'))
  spear(c,rear_hand,inclined)
  H8.arm(c,shB,rear_hand,1)
  H8.arm(c,shF,fh,-1)
  if hurt:
    al=c[...,3]>0;c[al,:3]=np.clip(c[al,:3].astype(int)*[1.25,.8,.8]+[30,0,0],0,255).astype(np.uint8)
  return Image.fromarray(c,'RGBA')

X0=22   # posición base de la cadera
def guard(i):
  b=1 if i in(2,3,4) else 0
  hip=(X0,27+b)
  # de lado: pie trasero atrás, delantero adelante; mano trasera en la cadera, lanza apuntando al pecho
  return pose(hip,.22,(X0-10,GROUND-1),(X0+7,GROUND-1),(X0-3,hip[1]-3),10,True,sway=-1)
def windup():
  hip=(X0-2,27)
  return pose(hip,.06,(X0-9,GROUND-1),(X0+8,GROUND-1),(X0-9,hip[1]-3),10,True,sway=1)
def strike():
  hip=(X0+5,28)
  # estocada: pie delantero avanza, pierna trasera estirada, brazos extendidos, lanza recta
  return pose(hip,.42,(X0-8,GROUND-1),(X0+16,GROUND-1),(X0+10,hip[1]-7),7,False,sway=-3,lines=True)
def follow():
  hip=(X0+4,28)
  return pose(hip,.36,(X0-8,GROUND-1),(X0+14,GROUND-1),(X0+7,hip[1]-6),8,False,sway=-2)
def hurt():
  hip=(X0-3,27)
  return pose(hip,-.12,(X0-10,GROUND-1),(X0+5,GROUND-1),(X0-6,hip[1]-2),9,True,sway=2,hurt=True)
guardF=[guard(i) for i in range(6)];att=[windup(),strike(),follow(),hurt()]
if __name__=='__main__':
  bg=(70,80,60,255);S=7
  idle=comp.idle
  strip=Image.new('RGBA',(W*6,H),bg)
  i0=Image.new('RGBA',(W,H));i0.alpha_composite(idle[0],(0,0))
  for j,f in enumerate([i0,guardF[0]]+att):strip.alpha_composite(f,(j*W,0))
  strip.resize((strip.width*S,strip.height*S),Image.NEAREST).save('/tmp/hr/ag/strip2.png')
  seq=[('i',i) for i in range(6)]*2+[('g',i) for i in range(6)]*2+[('a',0),('a',0),('a',0),('a',1),('a',2),('a',2)]+[('g',i) for i in range(6)]+[('a',3),('a',3)]+[('g',i) for i in range(6)]
  dur=[140]*24+[150,150,150,110,140,160]+[140]*6+[120,120]+[140]*6
  fr=[]
  for t,i in seq:
    f=idle[i] if t=='i' else guardF[i] if t=='g' else att[i]
    b=Image.new('RGBA',(W,H),bg);b.alpha_composite(f,(0,0));fr.append(b.resize((W*S,H*S),Image.NEAREST).convert('RGB'))
  fr[0].save('/tmp/hr/ag/anim2.gif',save_all=True,append_images=fr[1:],duration=dur,loop=0);print('ok')
