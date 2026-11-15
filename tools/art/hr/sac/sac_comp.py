import sys,math,numpy as np,importlib.util
sys.path.insert(0,'/tmp/hr/sac');sys.path.insert(0,'/tmp/hr/ag');sys.path.insert(0,'/tmp/st')
from PIL import Image
from lowres import to_board2
import sac,ag
H8=sac.H8;hx=ag.hx
K=.5;PL=2;PT=10
BW,BH=round(ag.w*K),round(ag.h*K)
W,H=BW+PL+30,BH+3+PT
QUE=[hx(c) for c in sac.QUE];TURQ=[hx(c) for c in sac.TURQ]
def put(c,x,y,col):
  x,y=int(round(x)),int(round(y))
  if 0<=x<c.shape[1] and 0<=y<c.shape[0]:c[y,x]=col
def plumes(c,base):
  """penacho de plumas de quetzal, abanico hacia arriba y atrás"""
  for k,(ang,L) in enumerate([(-150,8),(-130,10),(-110,11),(-92,10),(-75,8)]):
    a=math.radians(ang)
    for i in range(L):
      x=base[0]+math.cos(a)*i;y=base[1]+math.sin(a)*i
      col=QUE[1] if i<2 else QUE[2] if i<L*.6 else QUE[3]
      put(c,x,y,col)
      if i>2 and i<L-1:put(c,x+.8,y,QUE[0] if k%2 else QUE[1])
    put(c,base[0]+math.cos(a)*L,base[1]+math.sin(a)*L,hx('#f0c040'))
  put(c,base[0],base[1],hx('#e8c040'));put(c,base[0]+1,base[1],hx('#2aa078'))
def small(img,dy_top=0,dx=0):
  if dy_top:
    img=img.copy();top=img[:44].copy();img[:44]=0;r=np.roll(top,dy_top,0);r[:dy_top]=0;m=r[...,3]>0;img[:44][m]=r[m]
  s=np.asarray(to_board2(Image.fromarray(img,'RGBA'),BW,BH,'selout'))
  c=np.zeros((H,W,4),np.uint8);c[PT:PT+s.shape[0],PL:PL+s.shape[1]]=s
  plumes(c,(PL+22,PT+7+dy_top))
  return c
B_ARM=sac.body(True)
SD=sac.staff_diag(38)
def stamp(c,a,ox,oy,under=None):
  for y,x in zip(*np.nonzero(a[...,3]>0)):
    X,Y=x+ox,y+oy
    if 0<=X<W and 0<=Y<H:
      if under is not None and under[Y,X]:continue
      c[Y,X]=a[y,x]
def idle_frame(i):
  bob=1 if i in(2,3,4) else 0
  c=small(B_ARM,bob)
  y0=12+bob+PT;hand=np.zeros(c.shape[:2],bool);hand[y0:y0+7,PL+7:PL+12]=c[y0:y0+7,PL+7:PL+12,3]>0
  stamp(c,SD,PL+4,PT-8+bob+3,under=hand)
  robe(c,(PL+21,PT+23),(PL+17,PT+34),(PL+26,PT+34),0)
  return Image.fromarray(c,'RGBA')

# ---------------- combate ----------------
CW,CH,GROUND=68,50,47
tb=sac.body(False,front=False).copy();tb[45:]=0
T=np.asarray(to_board2(Image.fromarray(tb,'RGBA'),BW,BH,'selout')).copy()
THIP=(20,22);TSH_B=(16.5,15);TSH_F=(26,15.5);THEAD=(21,6)
SPR,GRIP=sac.staff_sprite()
SK=H8.SK
ROBE=[hx(c) for c in sac.ROBE]
def cap(c,p,q,r,cols):
  Y,X=np.mgrid[0:CH,0:CW];px,py=X+.5-p[0],Y+.5-p[1];dx,dy=q[0]-p[0],q[1]-p[1]
  L2=dx*dx+dy*dy or 1;t=np.clip((px*dx+py*dy)/L2,0,1);d=np.hypot(px-t*dx,py-t*dy);m=d<=r
  nx,ny=-dy,dx;L=math.hypot(nx,ny) or 1;side=((px-t*dx)*nx+(py-t*dy)*ny)/L
  lv=np.where(d>r-.75,0,np.where(side<-.4,3,np.where(side>.5,1,2)))
  for k,col in enumerate(cols):c[m&(lv==k)]=col
def ik(a,b,l1,l2):
  dx,dy=b[0]-a[0],b[1]-a[1];d=min(math.hypot(dx,dy),l1+l2-.01);ang=math.atan2(dy,dx)
  A=math.acos(max(-1,min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));t=ang-A
  return (a[0]+math.cos(t)*l1,a[1]+math.sin(t)*l1)
SAND=[hx('#1a0e08'),hx('#3e2414'),hx('#5e3a20'),hx('#7e5230')]
def leg(c,hip,ankle,far):
  kn=ik(hip,ankle,9.6,9.4)
  P=SK[:4] if not far else [SK[0],SK[0],SK[1],SK[2]]
  cap(c,kn,ankle,1.8,P)
  for k in range(4):put(c,ankle[0]+k-.5,GROUND,SAND[1] if k<3 else SAND[0])
  put(c,ankle[0],GROUND-1,SAND[2])
  return kn
def robe(c,hip,kb,kf,sway):
  """túnica: trapecio de la cintura a las rodillas, con borde turquesa"""
  top=hip[1]-1;bot=max(kb[1],kf[1])+1.5
  x0t,x1t=hip[0]-4.5,hip[0]+4.5;x0b,x1b=min(kb[0],kf[0])-3+sway,max(kb[0],kf[0])+3+sway
  for y in range(int(top),int(bot)+1):
    t=(y-top)/max(1,bot-top);xa=x0t+(x0b-x0t)*t;xb=x1t+(x1b-x1t)*t
    for x in range(int(round(xa)),int(round(xb))+1):
      e=x==int(round(xa)) or x==int(round(xb))
      col=ROBE[0] if e else ROBE[3] if x<hip[0]+1-t*2 else ROBE[2]
      if not e and (x-int(round(xa)))%3==2 and y>top+1:col=ROBE[1]
      if y>=int(bot)-1 and not e:col=TURQ[2] if y==int(bot)-1 else TURQ[1]
      if y==int(bot)-3 and not e and x%2==0:col=TURQ[1]
      put(c,x,y,col)
  for k in range(7):put(c,hip[0]+1+sway*k/6,hip[1]+k,hx('#c4302a'))
def torso(c,hip,lean):
  ox,oy=hip[0]-THIP[0],hip[1]-THIP[1]
  for y in range(T.shape[0]):
    sh=int(round(lean*(THIP[1]-y)))
    for x in range(T.shape[1]):
      if T[y,x,3]:put(c,x+ox+sh,y+oy,T[y,x])
  f=lambda p:(p[0]+ox+lean*(THIP[1]-p[1]),p[1]+oy)
  return f(TSH_B),f(TSH_F),f(THEAD)
def staff(c,grip_at,deg):
  a,(gx,gy)=SPR.copy(),GRIP;hh,ww=a.shape[:2]
  for _ in range((deg%360)//90):a=np.rot90(a,-1);gx,gy=hh-1-gy,gx;hh,ww=ww,hh
  ox,oy=int(round(grip_at[0]))-gx,int(round(grip_at[1]))-gy
  for y,x in zip(*np.nonzero(a[...,3]>0)):put(c,x+ox,y+oy,a[y,x])
def tip_of(grip,deg,L=21):
  d={0:(1,0),90:(0,1),180:(-1,0),270:(0,-1)}[deg%360];return (grip[0]+d[0]*(L-6+1),grip[1]+d[1]*(L-6+1))
def magic(c,cen,r,life,seed=0,ring=True):
  rr=np.random.default_rng(seed)
  cols=[TURQ[3],TURQ[2],hx('#ffffff'),hx('#f0c040'),QUE[4]]
  for i in range(int(18*life)+4):
    a=rr.uniform(0,6.28);d=rr.uniform(.5,r)
    put(c,cen[0]+math.cos(a)*d,cen[1]+math.sin(a)*d,cols[i%len(cols)])
  if ring:
    for k in range(24):
      a=k/24*6.28;put(c,cen[0]+math.cos(a)*r*.7,cen[1]+math.sin(a)*r*.7,TURQ[2])
def pose(hip,lean,bf,ff,hand,deg,front_hand=None,fx=None,hurt=False,sway=0):
  c=np.zeros((CH,CW,4),np.uint8)
  kb=leg(c,(hip[0]-1.5,hip[1]),bf,True);kf=leg(c,(hip[0]+1.5,hip[1]),ff,False)
  shB,shF,hd=torso(c,hip,lean)
  robe(c,hip,kb,kf,sway)
  plumes(c,(hd[0],hd[1]))
  if fx:fx(c)
  staff(c,hand,deg)
  H8.arm(c,shB,hand,1 if deg==270 else -1)
  fh=front_hand(shF) if front_hand else (shF[0]+6,shF[1]+5)
  H8.arm(c,shF,fh,-1)
  if hurt:
    al=c[...,3]>0;c[al,:3]=np.clip(c[al,:3].astype(int)*[1.25,.8,.8]+[30,0,0],0,255).astype(np.uint8)
  return Image.fromarray(c,'RGBA')
X0=24;HY=29
def guard(i):
  b=1 if i in(2,3,4) else 0;hip=(X0,HY+b)
  # postura de invocador: pies separados, torso erguido, bastón vertical al costado, mano delantera abierta al frente
  return pose(hip,.08,(X0-7,GROUND-1),(X0+6,GROUND-1),(X0-5,hip[1]-8),270,lambda s:(s[0]+8,s[1]+3))
def windup():
  hip=(X0-1,HY)
  hand=(X0-3,HY-19)
  return pose(hip,-.05,(X0-8,GROUND-1),(X0+6,GROUND-1),hand,270,lambda s:(s[0]+3,s[1]+6),
              fx=lambda c:magic(c,tip_of(hand,270),5,.6,1,ring=False),sway=1)
def strike():
  hip=(X0+2,HY);hand=(X0+9,HY-9)
  return pose(hip,.18,(X0-8,GROUND-1),(X0+10,GROUND-1),hand,0,lambda s:(s[0]+9,s[1]+1),
              fx=lambda c:magic(c,tip_of(hand,0),7,1,2),sway=-2)
def follow():
  hip=(X0+2,HY);hand=(X0+8,HY-9)
  return pose(hip,.15,(X0-8,GROUND-1),(X0+10,GROUND-1),hand,0,lambda s:(s[0]+8,s[1]+2),
              fx=lambda c:magic(c,(tip_of(hand,0)[0]+5,tip_of(hand,0)[1]),5,.4,3,ring=False),sway=-1)
def hurt():
  hip=(X0-2,HY)
  return pose(hip,-.12,(X0-9,GROUND-1),(X0+4,GROUND-1),(X0-7,HY-6),270,lambda s:(s[0]+4,s[1]+7),hurt=True,sway=2)
idle=[idle_frame(i) for i in range(6)]
guardF=[guard(i) for i in range(6)];att=[windup(),strike(),follow(),hurt()]
if __name__=='__main__':
  bg=(70,80,60,255);S=7
  Wm=max(W,CW);Hm=max(H,CH)
  strip=Image.new('RGBA',(Wm*6,Hm),bg)
  for j,f in enumerate([idle[0],guardF[0]]+att):strip.alpha_composite(f,(j*Wm,Hm-f.height))
  strip.resize((strip.width*S,strip.height*S),Image.NEAREST).save('/tmp/hr/sac/strip.png')
  seq=[('i',i) for i in range(6)]*2+[('g',i) for i in range(6)]*2+[('a',0),('a',0),('a',0),('a',1),('a',2),('a',2)]+[('g',i) for i in range(6)]+[('a',3),('a',3)]+[('g',i) for i in range(6)]
  dur=[140]*24+[160,160,160,110,150,160]+[140]*6+[120,120]+[140]*6
  out=[]
  for t,i in seq:
    f=idle[i] if t=='i' else guardF[i] if t=='g' else att[i]
    b=Image.new('RGBA',(Wm,Hm),bg);b.alpha_composite(f,(0,Hm-f.height));out.append(b.resize((Wm*S,Hm*S),Image.NEAREST).convert('RGB'))
  out[0].save('/tmp/hr/sac/anim.gif',save_all=True,append_images=out[1:],duration=dur,loop=0)
  big=Image.fromarray(sac.body(True));o=Image.new('RGBA',big.size,bg);o.alpha_composite(big);o.resize((big.width*6,big.height*6),Image.NEAREST).save('/tmp/hr/sac/ref.png')
  print('ok',W,H,CW,CH)
