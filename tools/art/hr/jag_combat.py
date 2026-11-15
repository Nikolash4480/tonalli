"""Guerrero jaguar – poses de combate coherentes (misma lógica que el águila):
guardia de costado y agachado, escudo adelante cubriendo el pecho, macuahuitl alzado atrás.
Golpe: paso adelante, aparta el escudo y descarga el macuahuitl de arriba hacia abajo con todo el cuerpo.
Torso y escudo de la referencia; piernas, cola, taparrabo, brazo y arma dibujados a la resolución final."""
import sys,math,numpy as np,importlib.util
sys.path.insert(0,'/tmp/st')
from PIL import Image
from lowres import to_board2
def load(n,p):
  sp=importlib.util.spec_from_file_location(n,p);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m
HJ=load('hj','/tmp/hr/hero_jag.py');H8=load('h8','/tmp/hr/hero_jag68.py')
K=.68;W,H=62,42;GROUND=38
hx=HJ.hx
WAIST=33
f=lambda x,y:((x+HJ.PADL)*K,(y+HJ.PADT)*K)
yy,xx=np.mgrid[0:HJ.H,0:HJ.W];sx,sy=xx-HJ.PADL,yy-HJ.PADT
base=HJ.BASE.copy()
legs=(sy>=WAIST);base[legs]=0
shm=(sx>=23)&(sy>=17)&(sy<=30)&(base[...,3]>0)
S100=np.zeros_like(base);S100[shm]=base[shm];base[shm]=0
def small(img):return np.asarray(to_board2(Image.fromarray(img,'RGBA'),round(HJ.W*K),round(HJ.H*K),'selout')).copy()
T=small(base);S=small(S100)
THIP=f(17,WAIST);TSH_B=f(12,17);TSH_F=f(24,18);SHC=f(28,23)   # cadera, hombros y centro del escudo
SK=HJ.SK;GOLD=hx('#e8c040')
SAND=[hx('#1a0e08'),hx('#3e2414'),hx('#5e3a20'),hx('#7e5230')]
CREAM=[hx('#5a4430'),hx('#a8916a'),hx('#e0c898'),hx('#f4e6c4')]
FUR=[hx('#3a2408'),hx('#a8701c'),hx('#e0a830'),hx('#f4cc60')]
def put(c,x,y,col):
  x,y=int(round(x)),int(round(y))
  if 0<=x<W and 0<=y<H:c[y,x]=col
def cap(c,p,q,r,cols):
  Y,X=np.mgrid[0:H,0:W];px,py=X+.5-p[0],Y+.5-p[1];dx,dy=q[0]-p[0],q[1]-p[1]
  L2=dx*dx+dy*dy or 1;t=np.clip((px*dx+py*dy)/L2,0,1);d=np.hypot(px-t*dx,py-t*dy);m=d<=r
  nx,ny=-dy,dx;L=math.hypot(nx,ny) or 1;side=((px-t*dx)*nx+(py-t*dy)*ny)/L
  lv=np.where(d>r-.75,0,np.where(side<-.4,3,np.where(side>.5,1,2)))
  for k,col in enumerate(cols):c[m&(lv==k)]=col
def ik(a,b,l1,l2):
  dx,dy=b[0]-a[0],b[1]-a[1];d=min(math.hypot(dx,dy),l1+l2-.01);ang=math.atan2(dy,dx)
  A=math.acos(max(-1,min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));t=ang-A
  return (a[0]+math.cos(t)*l1,a[1]+math.sin(t)*l1)
def leg(c,hip,ankle,far):
  kn=ik(hip,ankle,5.6,5.4)
  P=SK[:4] if not far else [SK[0],SK[0],SK[1],SK[2]]
  cap(c,hip,kn,2.1,P);cap(c,kn,ankle,1.7,P)
  # tobillera de oro (como la referencia) y sandalia
  b=(kn[0]+(ankle[0]-kn[0])*.45,kn[1]+(ankle[1]-kn[1])*.45)
  put(c,b[0],b[1],GOLD);put(c,b[0]+1,b[1],GOLD if not far else hx('#a8841c'));put(c,b[0]-1,b[1],hx('#a8841c'))
  Sd=SAND if not far else [SAND[0],SAND[0],SAND[1],SAND[2]]
  for k in range(4):put(c,ankle[0]+k-1,GROUND,Sd[1] if k<3 else Sd[0])
  put(c,ankle[0],GROUND-1,Sd[2]);put(c,ankle[0]+1,GROUND-1,P[2])
def tail(c,hip,sway):
  pts=[(hip[0]-3,hip[1]-1)]
  for k in range(1,9):
    t=k/8;pts.append((hip[0]-3-k*.9-sway*t,hip[1]+2*math.sin(t*2.2)-k*.55))
  for i in range(8):
    p,q=pts[i],pts[i+1];col=FUR[2] if i%3 else FUR[0]
    put(c,p[0],p[1],col);put(c,(p[0]+q[0])/2,(p[1]+q[1])/2,FUR[3] if i%3 else FUR[0])
  put(c,pts[-1][0]-1,pts[-1][1],FUR[0])
def paste(c,src,ox,oy,lean,pivot_y):
  for y in range(src.shape[0]):
    sh=int(round(lean*(pivot_y-y)))
    for x in range(src.shape[1]):
      if src[y,x,3]:
        X,Y=x+ox+sh,y+oy
        if 0<=X<W and 0<=Y<H:c[Y,X]=src[y,x]
def loin(c,hip,sway):
  for k in range(6):
    x=hip[0]+2+sway*k/5;y=hip[1]+k-1
    put(c,x-1,y,CREAM[1]);put(c,x,y,CREAM[3] if k<5 else CREAM[1]);put(c,x+1,y,CREAM[2] if k<5 else CREAM[0])
WP,WG=H8._weapon_h(10)
def orient(deg):
  a=WP.copy();gx,gy=WG;h,w=a.shape[:2]
  for _ in range((deg%360)//90):a=np.rot90(a,-1);gx,gy=h-1-gy,gx;h,w=w,h
  return a,(gx,gy)
def weapon(c,hand,deg):
  a,(gx,gy)=orient(deg);ox,oy=int(round(hand[0]))-gx,int(round(hand[1]))-gy
  for y,x in zip(*np.nonzero(a[...,3]>0)):
    X,Y=x+ox,y+oy
    if 0<=X<W and 0<=Y<H:c[Y,X]=a[y,x]
def pose(hip,lean,back_foot,front_foot,hand,deg,shield_off=(0,0),sway=0,arc=None,hurt=False,weapon_behind=False):
  c=np.zeros((H,W,4),np.uint8)
  ox,oy=hip[0]-THIP[0],hip[1]-THIP[1]
  L=lambda p:(p[0]+ox+lean*(THIP[1]-p[1]),p[1]+oy)
  shB=L(TSH_B);shF=L(TSH_F);sc=L(SHC)
  tail(c,hip,sway)
  if weapon_behind:weapon(c,hand,deg)
  leg(c,(hip[0]-1.2,hip[1]),back_foot,True)
  leg(c,(hip[0]+1.2,hip[1]),front_foot,False)
  paste(c,T,int(round(ox)),int(round(oy)),lean,THIP[1])
  loin(c,hip,sway)
  if arc:H8.slash(c,*arc)
  if not weapon_behind:weapon(c,hand,deg)
  H8.arm(c,shB,hand,1 if deg in(180,270) else -1)
  # brazo del escudo: del hombro al centro del escudo; el escudo tapa el antebrazo
  so=(sc[0]+shield_off[0],sc[1]+shield_off[1])
  H8.arm(c,shF,so,-1)
  paste(c,S,int(round(ox+shield_off[0]+lean*(THIP[1]-SHC[1]))),int(round(oy+shield_off[1])),0,0)
  if hurt:
    al=c[...,3]>0;c[al,:3]=np.clip(c[al,:3].astype(int)*[1.25,.8,.8]+[30,0,0],0,255).astype(np.uint8)
  return Image.fromarray(c,'RGBA')
X0=20
def guard(i):
  b=1 if i in(2,3,4) else 0;hip=(X0,30+b)
  L=lambda p:(p[0]+hip[0]-THIP[0]+.2*(THIP[1]-p[1]),p[1]+hip[1]-THIP[1])
  shB=L(TSH_B)
  # escudo adelante y algo levantado; macuahuitl alzado junto al hombro, listo
  return pose(hip,.2,(X0-8,GROUND-1),(X0+5,GROUND-1),(shB[0]-1,shB[1]-2),270,(2,-1),sway=-1)
def windup():
  hip=(X0-2,30);lean=-.06
  shB=(TSH_B[0]+hip[0]-THIP[0]+lean*(THIP[1]-TSH_B[1]),TSH_B[1]+hip[1]-THIP[1])
  # carga: peso atrás, macuahuitl llevado por detrás de la cabeza
  return pose(hip,lean,(X0-9,GROUND-1),(X0+5,GROUND-1),(shB[0]+1,shB[1]-6),180,(1,-2),sway=1,weapon_behind=True)
def strike():
  hip=(X0+4,31);lean=.22
  shB=(TSH_B[0]+hip[0]-THIP[0]+lean*(THIP[1]-TSH_B[1]),TSH_B[1]+hip[1]-THIP[1])
  cen=(shB[0]+8,shB[1]+4)
  # paso adelante, escudo apartado hacia abajo, descarga de arriba hacia adelante
  return pose(hip,lean,(X0-7,GROUND-1),(X0+11,GROUND-1),(shB[0]+10,shB[1]+4),0,(-3,5),sway=-2,
              arc=(cen,9,math.radians(-75),math.radians(20),1))
def follow():
  hip=(X0+4,31);lean=.2
  shB=(TSH_B[0]+hip[0]-THIP[0]+lean*(THIP[1]-TSH_B[1]),TSH_B[1]+hip[1]-THIP[1])
  cen=(shB[0]+8,shB[1]+4)
  return pose(hip,lean,(X0-7,GROUND-1),(X0+11,GROUND-1),(shB[0]+8,shB[1]+7),90,(-3,5),sway=-1,
              arc=(cen,9,math.radians(-20),math.radians(80),.45))
def hurt():
  hip=(X0-3,30);lean=-.12
  shB=(TSH_B[0]+hip[0]-THIP[0]+lean*(THIP[1]-TSH_B[1]),TSH_B[1]+hip[1]-THIP[1])
  return pose(hip,lean,(X0-9,GROUND-1),(X0+3,GROUND-1),(shB[0]-3,shB[1]+3),180,(1,-3),sway=2,hurt=True)
guardF=[guard(i) for i in range(6)];att=[windup(),strike(),follow(),hurt()]
if __name__=='__main__':
  bg=(70,80,60,255);Sc=7;idle=H8.idle
  strip=Image.new('RGBA',(W*6,H),bg)
  i0=Image.new('RGBA',(W,H));i0.alpha_composite(idle[0],(0,0))
  for j,fr in enumerate([i0,guardF[0]]+att):strip.alpha_composite(fr,(j*W,0))
  strip.resize((strip.width*Sc,strip.height*Sc),Image.NEAREST).save('/tmp/hr/jag_combat_strip.png')
  seq=[('i',i) for i in range(6)]*2+[('g',i) for i in range(6)]*2+[('a',0),('a',0),('a',0),('a',1),('a',2),('a',2)]+[('g',i) for i in range(6)]+[('a',3),('a',3)]+[('g',i) for i in range(6)]
  dur=[140]*24+[150,150,150,100,140,160]+[140]*6+[120,120]+[140]*6
  out=[]
  for t,i in seq:
    fr=idle[i] if t=='i' else guardF[i] if t=='g' else att[i]
    b=Image.new('RGBA',(W,H),bg);b.alpha_composite(fr,(0,0));out.append(b.resize((W*Sc,H*Sc),Image.NEAREST).convert('RGB'))
  out[0].save('/tmp/hr/jag_combat.gif',save_all=True,append_images=out[1:],duration=dur,loop=0);print('ok')
