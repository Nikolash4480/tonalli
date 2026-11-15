"""Guerrero jaguar al 68%: el cuerpo se achica desde la referencia y el brazo + macuahuitl
se dibujan directo a la resolución final, píxel a píxel, para que el arma no se borronee."""
import sys,math,importlib.util,numpy as np
sys.path.insert(0,'/tmp/st')
from PIL import Image
from lowres import to_board2
sp=importlib.util.spec_from_file_location('h','/tmp/hr/hero_jag.py');H0=importlib.util.module_from_spec(sp);sp.loader.exec_module(H0)
K=.68
W,H=round(H0.W*K)+4,round(H0.H*K)+2
hx=H0.hx
SK=H0.SK;GOLD=hx('#f0cc60');GOLD2=hx('#a8741c')
WD=[hx('#24120a'),hx('#4e2c16'),hx('#7a4824'),hx('#a86a34')]
OB=[hx('#0e0c14'),hx('#2e2c40'),hx('#5a5a78'),hx('#e6ecff')]
RED=hx('#b8302a')

def body(dx=0,dy_top=0,hurt=False):
  b=H0.shifted(H0.BASE,dx,0) if dy_top==0 else H0.shifted(H0.BASE,dx,dy_top,top_only_y=H0.PADT+31)
  im=Image.fromarray(b,'RGBA')
  sm=to_board2(im,round(H0.W*K),round(H0.H*K),'selout')
  c=np.zeros((H,W,4),np.uint8);a=np.asarray(sm);c[:a.shape[0],:a.shape[1]]=a
  return c
def put(c,x,y,col):
  x,y=int(round(x)),int(round(y))
  if 0<=x<W and 0<=y<H:c[y,x]=col
def line(c,p,q,col,w=1):
  n=int(max(abs(q[0]-p[0]),abs(q[1]-p[1]))*2)+1
  for i in range(n+1):
    t=i/n;x=p[0]+(q[0]-p[0])*t;y=p[1]+(q[1]-p[1])*t
    put(c,x,y,col)
    if w>1:put(c,x+.5,y+.5,col)
def arm(c,sh,hand,bias=1):
  mx,my=(sh[0]+hand[0])/2,(sh[1]+hand[1])/2;dx,dy=hand[0]-sh[0],hand[1]-sh[1];L=math.hypot(dx,dy) or 1
  el=(mx-dy/L*1.5*bias,my+dx/L*1.5*bias)
  for p,q in((sh,el),(el,hand)):
    nx,ny=-(q[1]-p[1]),(q[0]-p[0]);l=math.hypot(nx,ny) or 1;nx/=l;ny/=l
    line(c,(p[0]+nx*1.2,p[1]+ny*1.2),(q[0]+nx*1.2,q[1]+ny*1.2),SK[0])
    line(c,(p[0]-nx*1.2,p[1]-ny*1.2),(q[0]-nx*1.2,q[1]-ny*1.2),SK[0])
    line(c,(p[0]+nx*.4,p[1]+ny*.4),(q[0]+nx*.4,q[1]+ny*.4),SK[2])
    line(c,(p[0]-nx*.4,p[1]-ny*.4),(q[0]-nx*.4,q[1]-ny*.4),SK[3])
  # brazalete de oro
  put(c,el[0]+(hand[0]-el[0])*.5,el[1]+(hand[1]-el[1])*.5,GOLD)
  put(c,hand[0],hand[1],SK[3]);put(c,hand[0]+.6,hand[1]+.6,SK[1])
# ---- macuahuitl como sprite fijo: se dibuja una sola vez y sólo se gira en múltiplos de 45°
def _weapon_h(L=12):
  """horizontal, apuntando a la derecha. Devuelve (rgba, (gx,gy)=píxel de la empuñadura)"""
  Wd=L+5;a=np.zeros((7,Wd,4),np.uint8);cy=3;g=2
  def p(x,y,c):
    if 0<=x<Wd and 0<=y<7:a[y,x]=c
  p(0,cy,WD[0]);p(1,cy,GOLD2);p(2,cy,WD[1]);p(3,cy,WD[1]);p(4,cy,GOLD);p(5,cy,RED)
  for x in range(6,L+3):
    p(x,cy-1,WD[1]);p(x,cy,WD[3] if x%3 else WD[2]);p(x,cy+1,WD[1])
  k=0
  for x in range(7,L+2,2):
    p(x,cy-2,OB[3] if k%2==0 else OB[1]);p(x,cy+2,OB[2] if k%2==1 else OB[1])
    p(x,cy-3,OB[0]);p(x,cy+3,OB[0]);k+=1
  p(L+3,cy,WD[2]);p(L+4,cy,WD[0]);p(L+3,cy-1,OB[0]);p(L+3,cy+1,OB[0])
  return a,(g,cy)
def _shear(a,grip):
  """versión a 45°: cada columna baja un píxel (cizalla), así la diagonal queda continua"""
  h,w=a.shape[:2];o=np.zeros((h+w,w,4),np.uint8)
  for x in range(w):o[x:x+h,x]=a[:,x]
  return o,(grip[0],grip[1]+grip[0])
WH=_weapon_h(10);WD45=_shear(*WH)
def _orient(deg):
  """devuelve (sprite, grip) para 0,45,...,315 grados (0=derecha, 90=abajo)"""
  deg%=360
  base,(gx,gy)=(WH if deg%90==0 else WD45)
  a=base.copy();h,w=a.shape[:2]
  q=deg if deg%90==0 else deg-45
  for _ in range(q//90):           # rotar 90° en sentido horario
    a=np.rot90(a,-1);gx,gy=h-1-gy,gx;h,w=w,h
  return a,(gx,gy)
def macuahuitl(c,hand,deg):
  a,(gx,gy)=_orient(deg);h,w=a.shape[:2]
  ox,oy=int(round(hand[0]))-gx,int(round(hand[1]))-gy
  m=a[...,3]>0
  for y,x in zip(*np.nonzero(m)):
    X,Y=x+ox,y+oy
    if 0<=X<W and 0<=Y<H:c[Y,X]=a[y,x]
def slash(c,cen,r,a0,a1,life):
  cols=[hx('#ffb850'),hx('#fffbe0'),hx('#ff9a40')]
  for k,(rr,col) in enumerate(((r+1,cols[0]),(r,cols[1]),(r-1,cols[2]))):
    for i in range(48):
      t=i/48
      if t<1-life:continue
      a=a0+(a1-a0)*t;put(c,cen[0]+math.cos(a)*rr,cen[1]+math.sin(a)*rr,col)
SH=(H0.SH[0]*K,H0.SH[1]*K)
def compose(kind,i=0):
  if kind=='idle':
    bob=1 if i in(2,3,4) else 0
    c=body(0,bob);hand=(SH[0]-3,SH[1]+9+bob)
    arm(c,(SH[0],SH[1]+bob*.7),hand,-1);macuahuitl(c,hand,270)
  elif kind=='windup':
    c=body(-1);hand=(SH[0]-5,SH[1]-5)
    macuahuitl(c,hand,180);arm(c,(SH[0]-.7,SH[1]),hand,1)
  elif kind=='strike':
    c=body(3);hand=(SH[0]+12,SH[1]+2)
    slash(c,(SH[0]+14,SH[1]+4),8,math.radians(-80),math.radians(35),1)
    macuahuitl(c,hand,0);arm(c,(SH[0]+2,SH[1]),hand,-1)
  elif kind=='follow':
    c=body(2);hand=(SH[0]+10,SH[1]+8)
    slash(c,(SH[0]+14,SH[1]+4),8,math.radians(-30),math.radians(75),.45)
    macuahuitl(c,hand,90);arm(c,(SH[0]+1.4,SH[1]),hand,-1)
  elif kind=='hurt':
    c=body(-2);hand=(SH[0]-5,SH[1]+7)
    macuahuitl(c,hand,180);arm(c,(SH[0]-1.4,SH[1]),hand,-1)
    al=c[...,3]>0;c[al,:3]=np.clip(c[al,:3].astype(int)*[1.25,.8,.8]+[30,0,0],0,255).astype(np.uint8)
  return Image.fromarray(c,'RGBA')
idle=[compose('idle',i) for i in range(6)]
att=[compose(k) for k in('windup','strike','follow','hurt')]
if __name__=='__main__':
  S=8;bg=(70,80,60,255)
  seq=idle+idle+[att[0],att[0],att[1],att[2],att[2]]+idle+[att[3],att[3]]+idle
  dur=[140]*12+[160,200,90,120,160]+[140]*6+[120,120]+[140]*6
  fr=[]
  for f in seq:
    b=Image.new('RGBA',f.size,bg);b.alpha_composite(f);fr.append(b.resize((W*S,H*S),Image.NEAREST).convert('RGB'))
  fr[0].save('/tmp/hr/jag68_anim.gif',save_all=True,append_images=fr[1:],duration=dur,loop=0)
  strip=Image.new('RGBA',(W*5,H),bg)
  for k,f in enumerate([idle[0]]+att):strip.alpha_composite(f,(k*W,0))
  strip.resize((strip.width*7,strip.height*7),Image.NEAREST).save('/tmp/hr/jag68_strip.png');print('ok',W,H)
