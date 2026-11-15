"""Guerrero águila redibujado desde cero (sin referencia): esqueleto propio, traje de plumas,
casco de águila, lanza de obsidiana. Mira a la derecha. Escala de trabajo 5x."""
import sys,math,numpy as np
sys.path.insert(0,'/tmp/st')
from PIL import Image,ImageDraw
from scipy import ndimage
from lowres import to_board2
S=5;K=.82;W,H=380,250;GX,GY=170,240     # lienzo de trabajo y pie (suelo)
def hx(c):return tuple(int(c[i:i+2],16) for i in (1,3,5))
PAL={
 'skin':('#c8844a','#8a5030','#e4a46a'),
 'suit':('#4e2e18','#30190c','#6e4626'),
 'chest':('#ece2c8','#b8a684','#fffaec'),
 'gold':('#e8b830','#a87818','#fff0a0'),
 'shield':('#c83a2a','#8a2018','#e86048'),
 'tip':('#d8c4a0','#a8906a','#f4e8cc'),
 'helm':('#4a2e1a','#2e1c10','#6e4a2c'),
 'beak':('#e8b030','#a87418','#ffd860'),
 'red':('#b8302a','#7a1c18','#d8564a'),
 'wrap':('#d8ccb0','#a89878','#f0e8d4'),
 'sand':('#6a4428','#46301c','#8a5a34'),
 'shaft':('#8a5a30','#5a3a1e','#aa7a48'),
 'obs':('#24202c','#100e16','#7a7a90'),
 'eye':('#1a1410','#1a1410','#1a1410'),
}
def ik(a,b,l1,l2,bend):
  """dos huesos de a hacia b; bend=+1 rodilla/codo hacia +x"""
  dx,dy=b[0]-a[0],b[1]-a[1];d=min(math.hypot(dx,dy),l1+l2-.01);d=max(d,abs(l1-l2)+.01)
  ang=math.atan2(dy,dx);c=(l1*l1+d*d-l2*l2)/(2*l1*d);c=max(-1,min(1,c))
  t=ang-bend*math.acos(c);j=(a[0]+l1*math.cos(t),a[1]+l1*math.sin(t))
  e=(a[0]+d*math.cos(ang),a[1]+d*math.sin(ang));return j,e
class Part:
  def __init__(s,key):s.key=key;s.m=Image.new('L',(W,H),0);s.d=ImageDraw.Draw(s.m)
  def cap(s,p,q,r):
    s.d.line([p,q],fill=255,width=int(r*2));[s.d.ellipse([x-r,y-r,x+r,y+r],fill=255) for x,y in (p,q)];return s
  def poly(s,pts):s.d.polygon([tuple(map(float,p)) for p in pts],fill=255);return s
  def ell(s,c,rx,ry):s.d.ellipse([c[0]-rx,c[1]-ry,c[0]+rx,c[1]+ry],fill=255);return s
def shade(canvas,part,pattern=None,band=5):
  m=np.asarray(part.m)>127
  if not m.any():return
  base,dark,lite=[np.array(hx(c)) for c in PAL[part.key]]
  # luz desde arriba-izquierda: cerca del borde arriba/izq claro, abajo/der oscuro
  sh=np.zeros(m.shape,bool);hi=np.zeros(m.shape,bool)
  for k in range(1,band+1):
    sh|=m&~np.roll(np.roll(m,-k,1),-k,0)
    hi|=m&~np.roll(np.roll(m,k,1),k,0)
  col=np.zeros(m.shape+(3,));col[:]=base;col[sh]=dark;col[hi&~sh]=lite
  if pattern is not None:
    pm=pattern(m);t0,t1,t2=[np.array(hx(c)) for c in PAL['tip']];col[pm]=t0;col[pm&sh]=t1
  a=np.asarray(canvas).copy();a[m,:3]=col[m];a[m,3]=255;canvas.paste(Image.fromarray(a))
def feathers(m):
  yy,xx=np.mgrid[0:H,0:W];row=(yy//14);off=(row%3)*9
  u=((xx+off)%26)-13;v=(yy%14)
  return m&((u*u)/40+((v-14)**2)/22<1)&(v>=8)
def frame(P):
  """P: dict de pose (coordenadas relativas al pie, y hacia arriba negativo)"""
  O=lambda p:(GX+p[0],GY+p[1])
  hip=O(P['hip']);lean=math.radians(P['lean'])
  neck=(hip[0]+math.sin(lean)*58,hip[1]-math.cos(lean)*58)
  sh=(hip[0]+math.sin(lean)*50,hip[1]-math.cos(lean)*50)
  hl=math.radians(P.get('hlean',P['lean']*.6));head=(neck[0]+math.sin(hl)*21+4,neck[1]-math.cos(hl)*21)
  fb,ff=O(P['footB']),O(P['footF'])
  kB,aB=ik(hip,(fb[0],fb[1]-8),46,46,+1);kF,aF=ik(hip,(ff[0],ff[1]-8),46,46,+1)
  hb,hf=O(P['handB']),O(P['handF'])
  ss=P.get('shs',0);shB=(sh[0]-4-ss,sh[1]+1);shF=(sh[0]+3+ss*.6,sh[1]+3)
  eB,wB=ik(shB,hb,32,30,-1);eF,wF=ik(shF,hf,32,30,-1)
  img=Image.new('RGBA',(W,H),(0,0,0,0))
  sp=P['spear'];spa=math.radians(sp[2]);sc=O(sp[:2]);L1,L2=sp[3],sp[4]
  sT=(sc[0]+math.cos(spa)*L1,sc[1]+math.sin(spa)*L1);sB=(sc[0]-math.cos(spa)*L2,sc[1]-math.sin(spa)*L2)
  def spear():
    shade(img,Part('shaft').cap(sB,sT,3.2),band=2)
    bl=34;tip=(sT[0]+math.cos(spa)*bl,sT[1]+math.sin(spa)*bl);nx,ny=-math.sin(spa),math.cos(spa)
    mid=(sT[0]+math.cos(spa)*bl*.35,sT[1]+math.sin(spa)*bl*.35)
    shade(img,Part('obs').poly([sT,(mid[0]+nx*9,mid[1]+ny*9),tip,(mid[0]-nx*9,mid[1]-ny*9)]),band=3)
    shade(img,Part('red').ell((sT[0]-math.cos(spa)*4,sT[1]-math.sin(spa)*4),6,6),band=2)
  if P.get('spearBack'):spear()
  # pierna y brazo de atrás
  shade(img,Part('suit').cap(hip,kB,13),feathers);shade(img,Part('skin').cap(kB,aB,9))
  shade(img,Part('wrap').cap((aB[0]+(kB[0]-aB[0])*.1,aB[1]+(kB[1]-aB[1])*.1),(aB[0]+(kB[0]-aB[0])*.3,aB[1]+(kB[1]-aB[1])*.3),7.5),band=3)
  shade(img,Part('sand').poly([(aB[0]-8,aB[1]),(aB[0]+18,aB[1]+2),(aB[0]+18,aB[1]+8),(aB[0]-8,aB[1]+8)]),band=2)
  def armB():
    shade(img,Part('suit').cap(shB,eB,11),feathers);shade(img,Part('skin').cap(eB,wB,8));shade(img,Part('gold').cap((eB[0]+(wB[0]-eB[0])*.7,eB[1]+(wB[1]-eB[1])*.7),(eB[0]+(wB[0]-eB[0])*.85,eB[1]+(wB[1]-eB[1])*.85),8.5),band=2);shade(img,Part('skin').ell(wB,8,8))
  def armF():
    shade(img,Part('suit').cap(shF,eF,11.5),feathers);shade(img,Part('skin').cap(eF,wF,8.5));shade(img,Part('gold').cap((eF[0]+(wF[0]-eF[0])*.7,eF[1]+(wF[1]-eF[1])*.7),(eF[0]+(wF[0]-eF[0])*.85,eF[1]+(wF[1]-eF[1])*.85),9),band=2);shade(img,Part('skin').ell(wF,8.5,8.5))
  if P.get('swap'):armF()
  else:armB()
  if not P.get('spearBack') and not P.get('spearFront'):spear()
  if not P.get('shieldHand'):
    bk=(sh[0]-math.cos(lean)*28-8,sh[1]-math.sin(lean)*28+10-P.get('shieldUp',0))
    for i in range(5):
      fa=math.radians(60+i*15);pe=(bk[0]+math.cos(fa)*24,bk[1]+math.sin(fa)*24);shade(img,Part('tip').cap(bk,pe,3.5),band=2)
    shade(img,Part('gold').ell(bk,17,17),band=3);shade(img,Part('shield').ell(bk,14,14),band=3);shade(img,Part('chest').ell(bk,6,6),band=2);shade(img,Part('gold').ell(bk,3.5,3.5),band=1)
  # torso con traje de plumas (delgado, encorvado)
  nx,ny=math.cos(lean),math.sin(lean)
  tw=P.get('tw',1);tor=[(hip[0]-18*tw*nx,hip[1]-18*tw*ny),(hip[0]+17*tw*nx,hip[1]+17*tw*ny),(sh[0]+22*tw*nx,sh[1]+22*tw*ny),(neck[0]+7,neck[1]+2),(sh[0]-21*tw*nx,sh[1]-21*tw*ny)]
  shade(img,Part('suit').poly(tor),feathers)
  c0=-10*(tw-1)*2.2;ch=[(hip[0]+(3+c0)*nx,hip[1]+(3+c0)*ny),(hip[0]+16*tw*nx,hip[1]+16*tw*ny),(sh[0]+21*tw*nx,sh[1]+21*tw*ny),(neck[0]+7,neck[1]+2),(sh[0]+(3+c0)*nx,sh[1]+(3+c0)*ny)]
  shade(img,Part('chest').poly(ch),band=3)
  # taparrabo rojo y faja
  shade(img,Part('red').poly([(hip[0]-14,hip[1]-6),(hip[0]+14,hip[1]-6),(hip[0]+13,hip[1]+3),(hip[0]-13,hip[1]+3)]),band=2)
  shade(img,Part('red').poly([(hip[0]+2,hip[1]),(hip[0]+14,hip[1]),(hip[0]+16+P.get('flap',0),hip[1]+36),(hip[0]+1+P.get('flap',0),hip[1]+36)]),band=3)
  # pierna de adelante
  shade(img,Part('suit').cap(hip,kF,13.5),feathers);shade(img,Part('skin').cap(kF,aF,9.5))
  shade(img,Part('wrap').cap((aF[0]+(kF[0]-aF[0])*.1,aF[1]+(kF[1]-aF[1])*.1),(aF[0]+(kF[0]-aF[0])*.3,aF[1]+(kF[1]-aF[1])*.3),8),band=3)
  shade(img,Part('sand').poly([(aF[0]-8,aF[1]),(aF[0]+19,aF[1]+2),(aF[0]+19,aF[1]+8),(aF[0]-8,aF[1]+8)]),band=2)
  # cabeza: casco de águila con el rostro asomando bajo el pico
  shade(img,Part('skin').ell((head[0]+5,head[1]+7),13,14))
  shade(img,Part('helm').poly([(head[0]-18,head[1]+6),(head[0]-14,head[1]-14),(head[0]+2,head[1]-21),(head[0]+16,head[1]-14),(head[0]+20,head[1]-4),(head[0]+8,head[1]-2),(head[0]-6,head[1]+2),(head[0]-10,head[1]+22),(head[0]-20,head[1]+18)]),feathers,band=4)
  shade(img,Part('beak').poly([(head[0]+4,head[1]-17),(head[0]+34,head[1]-12),(head[0]+41,head[1]+1),(head[0]+33,head[1]+9),(head[0]+29,head[1]+1),(head[0]+6,head[1]+1)]),band=2)
  shade(img,Part('eye').ell((head[0]+11,head[1]-9),2.6,2.6),band=1)
  shade(img,Part('eye').ell((head[0]+12,head[1]+6),2.8,3.2),band=1)   # ojo del guerrero
  for i,(dx,dy) in enumerate([(-16,-12),(-20,-6),(-22,2)]):  # penacho detrás
    pb=(head[0]+dx,head[1]+dy);pt=(pb[0]-18-i*2,pb[1]-10+i*6)
    shade(img,Part('tip').cap(pb,pt,3.6),band=2);shade(img,Part('helm').ell(pt,3,3),band=1)
  if P.get('spearFront'):spear()
  # brazo de adelante
  if P.get('shieldHand'):
    sc=(wF[0]+6,wF[1]+2)
    for i in range(5):
      fa=math.radians(65+i*12);pe=(sc[0]+math.cos(fa)*30,sc[1]+math.sin(fa)*30);shade(img,Part('tip').cap(sc,pe,3.8),band=2)
    shade(img,Part('gold').ell(sc,17,21),band=3);shade(img,Part('shield').ell(sc,14,18),band=3);shade(img,Part('chest').ell(sc,6,8),band=2);shade(img,Part('gold').ell(sc,3,3.5),band=1)
  if P.get('swap'):armB()
  else:armF()
  if P.get('tint'):
    a=np.asarray(img).astype(float);m=a[...,3]>0;a[m,:3]=a[m,:3]*.5+np.array([230,40,30])*.5;img=Image.fromarray(a.astype(np.uint8))
  return img
def low(img):
  r=to_board2(img,round(W/S*K),round(H/S*K),'selout');a=np.asarray(r).astype(float);m=a[...,3]>0
  e=m&~ndimage.binary_erosion(m);a[e,:3]=a[e,:3]*.45
  return Image.fromarray(a.astype(np.uint8))
# ---------------- poses ----------------
def idleP(t):
  b=math.sin(t*2*math.pi)*2
  return dict(hip=(0,-94+b),lean=6,hlean=4,tw=1.4,shs=15,footB=(-28,-5),footF=(26,1),handB=(-40,-56+b),handF=(34,-104+b*.6),
              spear=(40,-104,-90,104,104),spearFront=False,flap=2,shieldUp=14)
def spearBy(rear,front,total=148,extra=10):
  """lanza que pasa por las dos manos; el extremo queda 'extra' por detrás de la mano de atrás"""
  dx,dy=front[0]-rear[0],front[1]-rear[1];d=math.hypot(dx,dy);ang=math.degrees(math.atan2(dy,dx))
  L2=d+extra;return (front[0],front[1],ang,total-L2,L2)
def guardP(t):
  b=math.sin(t*2*math.pi)*2
  rear=(-12,-76+b);front=(60,-99+b)
  return dict(hip=(-2,-74+b),lean=8,hlean=0,tw=1.0,shs=0,footB=(-46,-5),footF=(48,1),handB=rear,handF=front,
              spear=spearBy(rear,front),spearFront=True,flap=3,swap=True)
def windP():
  rear=(-40,-80);front=(32,-99)
  return dict(hip=(-12,-77),lean=-2,hlean=-4,footB=(-46,-5),footF=(46,1),handB=rear,handF=front,spear=spearBy(rear,front),spearFront=True,flap=-3,swap=True)
def strikeP():
  rear=(58,-82);front=(110,-92)
  return dict(hip=(40,-70),lean=18,hlean=8,footB=(-30,-5),footF=(98,1),handB=rear,handF=front,spear=spearBy(rear,front),spearFront=True,flap=7,swap=True)
def followP():
  rear=(20,-80);front=(84,-95)
  return dict(hip=(18,-73),lean=12,hlean=4,footB=(-40,-5),footF=(66,1),handB=rear,handF=front,spear=spearBy(rear,front),spearFront=True,flap=5,swap=True)
def hurtP():
  rear=(-26,-88);front=(16,-104)
  return dict(hip=(-6,-86),lean=-8,hlean=-14,footB=(-34,-5),footF=(30,1),handB=rear,handF=front,spear=spearBy(rear,front),spearFront=True,tint=True,flap=-4)
def spear1(rear,ang,fwd=100,back=46):return (rear[0],rear[1],ang,fwd,back)
def guardB(t):
  b=math.sin(t*2*math.pi)*2;rear=(-6,-80+b)
  return dict(hip=(-2,-74+b),lean=8,hlean=0,footB=(-46,-5),footF=(48,1),handB=rear,handF=(30,-98+b),spear=spear1(rear,-10),spearFront=True,flap=3,swap=True,shieldHand=True)
def windB():
  rear=(-30,-84);return dict(hip=(-10,-77),lean=-2,hlean=-4,footB=(-46,-5),footF=(46,1),handB=rear,handF=(24,-100),spear=spear1(rear,-12),spearFront=True,flap=-3,swap=True,shieldHand=True)
def strikeB():
  rear=(62,-86);return dict(hip=(28,-70),lean=18,hlean=8,footB=(-34,-5),footF=(88,1),handB=rear,handF=(52,-98),spear=spear1(rear,-4),spearFront=True,flap=7,swap=True,shieldHand=True)
def followB():
  rear=(26,-82);return dict(hip=(12,-73),lean=12,hlean=4,footB=(-40,-5),footF=(66,1),handB=rear,handF=(40,-98),spear=spear1(rear,-8),spearFront=True,flap=5,swap=True,shieldHand=True)
idle=[low(frame(idleP(i/6))) for i in range(6)]
guardF=[low(frame(guardP(i/6))) for i in range(6)]
att=[low(frame(windP())),low(frame(strikeP())),low(frame(followP())),low(frame(hurtP()))]
if __name__=='__main__':
  fr=idle+guardF+att;Sc=5
  Wt=sum(f.width+4 for f in fr);h=max(f.height for f in fr)
  o=Image.new('RGBA',(Wt,h),(60,70,60,255));x=0
  for f in fr:o.alpha_composite(f,(x,h-f.height));x+=f.width+4
  o.resize((o.width*Sc,o.height*Sc),Image.NEAREST).save('/tmp/hr/ag3/strip.png')
  big=frame(guardP(0));big.save('/tmp/hr/ag3/hi_guard.png');frame(idleP(0)).save('/tmp/hr/ag3/hi_idle.png');print('ok',fr[0].size)
