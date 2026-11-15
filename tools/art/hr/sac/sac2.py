"""Sacerdote de Quetzalcóatl v2 – vuelve al diseño original (el sacerdote del sacrificio):
cuerpo pintado de negro, túnica negra, capa roja, penacho de plumas turquesa con corona de oro,
máscara de mosaico turquesa, cinturón de oro y turquesa, tobilleras de oro.
Lleva el cuchillo de pedernal (tecpatl) en la mano de atrás y el sahumador humeante en la de adelante.
Poses coherentes: guardia agachado con el cuchillo alzado, carga sobre la cabeza, tajo descendente."""
import sys,math,numpy as np,importlib.util
sys.path.insert(0,'/tmp/hr/ag');sys.path.insert(0,'/tmp/st')
from PIL import Image
from scipy import ndimage
from lowres import to_board2
import ag
from ag import AL,XX,YY,C,CAPE,TORSO,PANTS,BOOTS,SKIN,HEAD,SASH,SPEAR,BACKARM,FRONTARM,PLATE,rmap,put as aput,hx
sp=importlib.util.spec_from_file_location('h8','/tmp/hr/hero_jag68.py');H8=importlib.util.module_from_spec(sp);sp.loader.exec_module(H8)
K=.5;W,H=66,50;GROUND=47
RED=['#3a0a0c','#6e1418','#a02424','#d0403a']
ROBE=['#141018','#241c2c','#382e44','#4e425e']
PAINT=[hx('#1e1828'),hx('#3e3452'),hx('#5e5478'),hx('#7e74a0')]   # piel pintada (gris violáceo, como el original)
TQ=[hx('#0a3a38'),hx('#1a7a70'),hx('#34b8a8'),hx('#8ef0dc')]
GOLD=hx('#ecc040');GOLD2=hx('#a87818')
def torso_img():
  img=np.zeros((ag.h,ag.w,4),np.uint8);img[AL]=ag.A[AL].astype(np.uint8);img[SPEAR]=0
  rmap(img,SKIN,['#1e1828','#3e3452','#5e5478','#7e74a0'],.2,.8)
  rmap(img,CAPE,RED,.08,.5)
  rmap(img,CAPE&(XX>=41)&(YY>=27),ROBE,.08,.5)
  rmap(img,TORSO,ROBE,.1,.6)
  # cinturón de oro con turquesas
  for x in range(33,50):
    if AL[42,x]:aput(img,x,42,'#ecc040' if x%3 else '#34b8a8')
    if AL[43,x]:aput(img,x,43,'#a87818')
  img[PLATE]=hx('#34b8a8')
  img[HEAD]=0                                 # la cabeza se dibuja a mano en el tamaño final
  img[FRONTARM]=0;img[BACKARM]=0;img[45:]=0
  m=img[...,3]>0;lab,n=ndimage.label(m);sz=ndimage.sum(m,lab,range(1,n+1))
  for i in range(n):
    if sz[i]<6:img[lab==i+1]=0
  return img
T=np.asarray(to_board2(Image.fromarray(torso_img(),'RGBA'),round(ag.w*K),round(ag.h*K),'selout')).copy()
THIP=(20,22);TSH_B=(16.5,15);TSH_F=(26,15.5);TNECK=(22.5,12)
def put(c,x,y,col):
  x,y=int(round(x)),int(round(y))
  if 0<=x<W and 0<=y<H:c[y,x]=col
def line(c,p,q,col):
  n=int(max(abs(q[0]-p[0]),abs(q[1]-p[1]))*1.5)+1
  for k in range(n+1):t=k/n;put(c,p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,col)
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
  kn=ik(hip,ankle,9.6,9.4)
  P=PAINT if not far else [PAINT[0],PAINT[0],PAINT[1],PAINT[2]]
  cap(c,hip,kn,2.3,P);cap(c,kn,ankle,1.8,P)
  a=(kn[0]+(ankle[0]-kn[0])*.8,kn[1]+(ankle[1]-kn[1])*.8)
  put(c,a[0]-1,a[1],GOLD2);put(c,a[0],a[1],GOLD);put(c,a[0]+1,a[1],GOLD if not far else GOLD2)
  for k in range(4):put(c,ankle[0]+k-.5,GROUND,hx('#2a1a14') if k<3 else hx('#120a08'))
  put(c,ankle[0],GROUND-1,hx('#3e2a20'))
def loin(c,hip,sway):
  for k in range(7):
    x=hip[0]+1+sway*k/6;y=hip[1]+k
    put(c,x-1,y,hx(RED[1]));put(c,x,y,hx(RED[3]) if k<6 else hx(RED[1]));put(c,x+1,y,hx(RED[2]))
  for x in range(-1,2):put(c,hip[0]+1+sway+x,hip[1]+6,GOLD)
NOISE=np.random.default_rng(3).integers(0,11,(24,24))
MASK=[".ddddddd.",
      "dTTtTtTTd",
      "dLdddddLd",
      "dooTTTood",
      "oKKoToKKo",
      "oKKoToKKo",
      "dooTdTood",
      "dLTdTdTLd",
      "dTdddddTd",
      ".FrFrFrF.",
      "..r.F.r..",
      "....r...."]
def head(c,neck,bob=0):
  """máscara de Quetzalcóatl como la referencia: plumas largas en punta, corona de oro con pilares,
  máscara turquesa de serpiente con ojo redondo hundido y colmillos rojos, orejera de oro"""
  cx,cy=int(round(neck[0])),int(round(neck[1]-4+bob))
  # cuello pintado
  for k in range(5):put(c,cx,cy+4+k,PAINT[2]);put(c,cx+1,cy+4+k,PAINT[1]);put(c,cx-1,cy+4+k,PAINT[1])
  # plumas largas en punta (forma de hoja con nervadura), en abanico hacia atrás y arriba
  from PIL import ImageDraw
  base=(cx,cy-3)
  for k,(ang,L) in enumerate([(-196,9),(-180,11),(-163,12),(-146,12),(-129,11),(-112,10),(-95,9),(-78,8),(-62,6)]):
    a=math.radians(ang);ux,uy=math.cos(a),math.sin(a);nx,ny=-uy,ux
    b0=(base[0]+ux*1.5,base[1]+uy*1.5);tip=(base[0]+ux*L,base[1]+uy*L);mid=(base[0]+ux*L*.45,base[1]+uy*L*.45)
    poly=[(b0[0]+nx*.9,b0[1]+ny*.9),(mid[0]+nx*1.6,mid[1]+ny*1.6),tip,(mid[0]-nx*1.6,mid[1]-ny*1.6),(b0[0]-nx*.9,b0[1]-ny*.9)]
    mk=Image.new('L',(W,H),0);ImageDraw.Draw(mk).polygon([(x+.5,y+.5) for x,y in poly],fill=255);m=np.asarray(mk)>0
    e=m&~ndimage.binary_erosion(m)
    c[m]=TQ[2] if k%2 else TQ[1];c[e]=TQ[0]
    for i in range(2,L-1):
      put(c,base[0]+ux*i,base[1]+uy*i,TQ[3] if k%2 else TQ[2])
  # corona de oro: banda y cuatro pilares con glifos
  for x in range(-3,5):put(c,cx+x,cy-4,GOLD if x%2 else GOLD2);put(c,cx+x,cy-3,GOLD2)
  for x in (-3,-1,1,3):
    for y in (-7,-6,-5):put(c,cx+x,cy+y,GOLD)
    put(c,cx+x+1,cy-6,GOLD2);put(c,cx+x+1,cy-5,GOLD2);put(c,cx+x,cy-6,hx('#5a3a10'))
    put(c,cx+x,cy-8,GOLD2)
  # máscara turquesa de serpiente (perfil mirando al frente)
  P={'d':TQ[0],'T':TQ[2],'t':TQ[1],'L':TQ[3],'o':hx('#b8f8e8'),'K':hx('#06060a'),'F':hx('#f4c8b8'),'r':hx('#c84a50')}
  for j,row in enumerate(MASK):
    for i,ch in enumerate(row):
      if ch in P:put(c,cx-4+i,cy-3+j,P[ch])
  # orejera de oro con colgante
  put(c,cx-4,cy+1,GOLD);put(c,cx-5,cy+1,GOLD2);put(c,cx-4,cy+2,GOLD2);put(c,cx-5,cy+2,GOLD);put(c,cx-5,cy+3,hx('#c84a50'))
def torso(c,hip,lean):
  ox,oy=hip[0]-THIP[0],hip[1]-THIP[1]
  for y in range(T.shape[0]):
    sh=int(round(lean*(THIP[1]-y)))
    for x in range(T.shape[1]):
      if T[y,x,3]:put(c,x+ox+sh,y+oy,T[y,x])
  f=lambda p:(p[0]+ox+lean*(THIP[1]-p[1]),p[1]+oy)
  return f(TSH_B),f(TSH_F),f(TNECK)
# ---- armas como piezas fijas (0=derecha, 90=abajo, 180=izquierda, 270=arriba)
def knife_sprite():
  """tecpatl: hoja de pedernal en forma de hoja, mango de madera con incrustación turquesa"""
  a=np.zeros((5,11,4),np.uint8);cy=2
  def p(x,y,c):a[y,x]=c
  p(0,cy,hx('#2a1408'));p(1,cy,hx('#5e351e'));p(2,cy,TQ[2]);p(3,cy,hx('#5e351e'))
  FL=[hx('#5a5468'),hx('#a8a0b8'),hx('#e8e4f0'),hx('#ffffff')]
  for (x,y,c) in [(4,cy,FL[1]),(5,cy,FL[2]),(6,cy,FL[2]),(7,cy,FL[2]),(8,cy,FL[1]),(9,cy,FL[0]),
                  (5,cy-1,FL[1]),(6,cy-1,FL[3]),(7,cy-1,FL[2]),(8,cy-1,FL[0]),(5,cy+1,FL[0]),(6,cy+1,FL[1]),(7,cy+1,FL[1]),(8,cy+1,FL[0]),(10,cy,FL[0]),(4,cy-1,FL[0]),(4,cy+1,FL[0])]:
    p(x,y,c)
  return a,(1,cy)
def burner_sprite():
  """sahumador: mango largo de barro y cazoleta con brasas"""
  a=np.zeros((5,10,4),np.uint8);cy=2
  CL=[hx('#3a1e10'),hx('#7a3e1e'),hx('#b8642e'),hx('#e8944a')]
  for x in range(0,6):a[cy,x]=CL[2] if x%2 else CL[1]
  for (x,y,c) in [(6,cy-1,CL[1]),(7,cy-1,CL[2]),(8,cy-1,CL[2]),(9,cy-1,CL[1]),(6,cy,CL[1]),(7,cy,CL[3]),(8,cy,CL[3]),(9,cy,CL[1]),(7,cy+1,CL[0]),(8,cy+1,CL[0]),
                  (7,cy-2,hx('#ffb030')),(8,cy-2,hx('#ff6a20'))]:a[y,x]=c
  return a,(1,cy)
KN=knife_sprite();BU=burner_sprite()
def stamp(c,sg,hand,deg):
  a,(gx,gy)=sg;a=a.copy();h,w=a.shape[:2]
  for _ in range((deg%360)//90):a=np.rot90(a,-1);gx,gy=h-1-gy,gx;h,w=w,h
  ox,oy=int(round(hand[0]))-gx,int(round(hand[1]))-gy
  for y,x in zip(*np.nonzero(a[...,3]>0)):put(c,x+ox,y+oy,a[y,x])
def bowl_of(hand,deg):
  d={0:(1,0),90:(0,1),180:(-1,0),270:(0,-1)}[deg%360];return (hand[0]+d[0]*7+(0 if d[0] else 0),hand[1]+d[1]*7-2*(d[1]==0))
def smoke(c,p,ph):
  """humo de copal: volutas que suben y se mueven con la fase"""
  for k in range(7):
    t=k/6;x=p[0]+math.sin(ph+t*4)*1.6*t;y=p[1]-1-k*1.3
    col=hx('#f0ece0') if k<3 else hx('#c8c4bc') if k<5 else hx('#8a8a90')
    put(c,x,y,col)
    if k%2==0 and k>1:put(c,x+1,y,hx('#d8d4cc'))
def arc(c,cen,r,a0,a1,life):
  cols=[hx('#7a3aa8'),hx('#e8d4ff'),hx('#b070e0')]
  for k,(rr,col) in enumerate(((r+1,cols[0]),(r,cols[1]),(r-1,cols[2]))):
    for i in range(48):
      t=i/48
      if t<1-life:continue
      a=a0+(a1-a0)*t;put(c,cen[0]+math.cos(a)*rr,cen[1]+math.sin(a)*rr,col)
def pose(hip,lean,bf,ff,khand,kdeg,bhand,bdeg,ph=0,sway=0,fx=None,bob=0,hurt=False):
  hip=(hip[0],hip[1]+2)
  c=np.zeros((H,W,4),np.uint8)
  leg(c,(hip[0]-1.5,hip[1]),bf,True);leg(c,(hip[0]+1.5,hip[1]),ff,False)
  # capa roja detrás del cuerpo
  ox,oy=hip[0]-THIP[0],hip[1]-THIP[1];L=lambda p:(p[0]+ox+lean*(THIP[1]-p[1]),p[1]+oy)
  sb,sf=L(TSH_B),L(TSH_F)
  pts=[(sb[0]-1.5,sb[1]-1),(sb[0]+3,sb[1]-1),(hip[0]-1+sway*.5,hip[1]+7),(hip[0]-7+sway,hip[1]+8)]
  from PIL import ImageDraw
  mk=Image.new('L',(W,H),0);ImageDraw.Draw(mk).polygon(pts,fill=255);m=np.asarray(mk)>0
  edge=m&~ndimage.binary_erosion(m)
  Yg,Xg=np.mgrid[0:H,0:W]
  c[m]=hx(RED[2]);c[m&(Xg<hip[0]-2)]=hx(RED[1]);c[m&((Xg+Yg)%4==0)&(Xg<hip[0])]=hx(RED[1]);c[edge]=hx(RED[0])
  shB,shF,nk=torso(c,hip,lean)
  for k in range(6):put(c,shF[0]+1,shF[1]-1+k,hx(RED[2]));put(c,shF[0]+2,shF[1]+k,hx(RED[1]))
  loin(c,hip,sway)
  head(c,nk)
  if fx:fx(c,shB,shF)
  # brazo trasero con el cuchillo
  stamp(c,KN,khand(shB),kdeg);H8.SK=PAINT;H8.arm(c,shB,khand(shB),1 if kdeg==270 else -1)
  # brazo delantero con el sahumador y su humo
  bh=bhand(shF);stamp(c,BU,bh,bdeg);H8.arm(c,shF,bh,-1)
  smoke(c,bowl_of(bh,bdeg),ph)
  if hurt:
    al=c[...,3]>0;c[al,:3]=np.clip(c[al,:3].astype(int)*[1.25,.8,.8]+[30,0,0],0,255).astype(np.uint8)
  return Image.fromarray(c,'RGBA')
X0=24
DY=2
def idle(i):
  b=1 if i in(2,3,4) else 0;ph=i/6*6.28
  # de pie, como el original: cuchillo en alto a la espalda, sahumador adelante humeando
  return pose((X0,27+b),0,(X0-4,GROUND-1),(X0+4,GROUND-1),lambda s:(s[0]-3,s[1]+3),270,lambda s:(s[0]+5,s[1]+4),0,ph=ph)
def guard(i):
  b=1 if i in(2,3,4) else 0;ph=i/6*6.28
  # agachado, peso adelante, cuchillo alzado junto al hombro y el sahumador al frente
  return pose((X0,29+b),.15,(X0-8,GROUND-1),(X0+6,GROUND-1),lambda s:(s[0]-2,s[1]-2),270,lambda s:(s[0]+6,s[1]+5),0,ph=ph,sway=-1)
def windup():
  return pose((X0-2,29),-.06,(X0-9,GROUND-1),(X0+5,GROUND-1),lambda s:(s[0]+1,s[1]-7),270,lambda s:(s[0]+3,s[1]+6),0,ph=1,sway=1)
def strike():
  def fx(c,shB,shF):arc(c,(shB[0]+6,shB[1]+4),9,math.radians(-110),math.radians(20),1)
  return pose((X0+4,30),.3,(X0-7,GROUND-1),(X0+11,GROUND-1),lambda s:(s[0]+10,s[1]+3),0,lambda s:(s[0]+2,s[1]+7),0,ph=2,sway=-2,fx=fx)
def follow():
  def fx(c,shB,shF):arc(c,(shB[0]+6,shB[1]+4),9,math.radians(-30),math.radians(80),.45)
  return pose((X0+4,30),.28,(X0-7,GROUND-1),(X0+11,GROUND-1),lambda s:(s[0]+7,s[1]+9),90,lambda s:(s[0]+2,s[1]+7),0,ph=3,sway=-1,fx=fx)
def hurt():
  return pose((X0-3,28),-.12,(X0-9,GROUND-1),(X0+3,GROUND-1),lambda s:(s[0]-3,s[1]-2),270,lambda s:(s[0]+3,s[1]+6),0,ph=4,sway=2,hurt=True)
idleF=[idle(i) for i in range(6)];guardF=[guard(i) for i in range(6)];att=[windup(),strike(),follow(),hurt()]
if __name__=='__main__':
  bg=(70,80,60,255);S=7
  strip=Image.new('RGBA',(W*6,H),bg)
  for j,f in enumerate([idleF[0],guardF[0]]+att):strip.alpha_composite(f,(j*W,0))
  strip.resize((strip.width*S,strip.height*S),Image.NEAREST).save('/tmp/hr/sac/strip2.png')
  seq=[('i',i) for i in range(6)]*2+[('g',i) for i in range(6)]*2+[('a',0),('a',0),('a',0),('a',1),('a',2),('a',2)]+[('g',i) for i in range(6)]+[('a',3),('a',3)]+[('g',i) for i in range(6)]
  dur=[140]*24+[160,160,160,100,150,160]+[140]*6+[120,120]+[140]*6
  out=[]
  for t,i in seq:
    f=idleF[i] if t=='i' else guardF[i] if t=='g' else att[i]
    b=Image.new('RGBA',(W,H),bg);b.alpha_composite(f);out.append(b.resize((W*S,H*S),Image.NEAREST).convert('RGB'))
  out[0].save('/tmp/hr/sac/anim2.gif',save_all=True,append_images=out[1:],duration=dur,loop=0);print('ok')
