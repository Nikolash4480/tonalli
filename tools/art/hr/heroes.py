"""Los 4 héroes a partir del mismo cuerpo base (referencia del Guerrero jaguar):
se recolorean el yelmo, la capa, el escudo y el taparrabo, se agregan detalles propios
y cada uno lleva su arma como pieza fija (sólo gira en ángulos rectos)."""
import sys,math,colorsys,importlib.util,numpy as np
sys.path.insert(0,'/tmp/st')
from PIL import Image
from scipy import ndimage
from lowres import to_board2
sp=importlib.util.spec_from_file_location('h','/tmp/hr/hero_jag.py');HJ=importlib.util.module_from_spec(sp);sp.loader.exec_module(HJ)
sp=importlib.util.spec_from_file_location('h8','/tmp/hr/hero_jag68.py');H8=importlib.util.module_from_spec(sp);sp.loader.exec_module(H8)
hx=HJ.hx
SRC0=np.asarray(Image.open('/tmp/hr/jag_clean.png').convert('RGBA')).copy()
h0,w0=SRC0.shape[:2]
YY,XX=np.mgrid[0:h0,0:w0]
def hls(a):
  f=a[...,:3]/255.;out=np.zeros(a.shape[:2]+(3,))
  for y in range(a.shape[0]):
    for x in range(a.shape[1]):out[y,x]=colorsys.rgb_to_hls(*f[y,x])
  return out
HL=hls(SRC0);HUE,LUM,SAT=HL[...,0],HL[...,1],HL[...,2]
AL=SRC0[...,3]>0
YEL=AL&(HUE>.09)&(HUE<.17)&(SAT>.45)&(LUM<.72)
DARK=AL&(LUM<.2)
CREAM=AL&(LUM>=.7)&(XX>=15)&(XX<=21)&(YY>=22)&(YY<=34)
SHIELD=AL&(XX>=23)&(YY>=17)&(YY<=30)
TAIL=AL&(XX<=8)&(YY>=32)
GOLDB=AL&(YY>=37)&YEL
FACE=AL&(XX>=19)&(YY>=6)&(YY<=12)&~YEL
HELMBOX=(YY<=12)|((YY<=15)&(XX<=18))
HELM=AL&HELMBOX&(YEL|(DARK&~FACE))&~FACE
CAPE=AL&(YY>=13)&(YY<=25)&(XX<=13)&YEL
JAW=HELM&(XX>=21)&(YY<=9)          # quijada superior del yelmo (al frente)
PELT=HELM|CAPE
def ramp_map(src,mask,ramp,lift_dark=True):
  """recolorea por luminancia; las manchas oscuras dentro de la zona se suavizan"""
  out=src.copy();L=LUM.copy()
  inner=mask&ndimage.binary_erosion(mask|~AL,iterations=1)
  if lift_dark:
    L=np.where(inner&(L<.22),.38,L)
  q=np.clip(((L-.12)/.6*(len(ramp)-1)).round().astype(int),0,len(ramp)-1)
  for k,c in enumerate(ramp):out[mask&(q==k),:3]=hx(c)[:3]
  return out
def recolor_shield(src,mp):
  out=src.copy()
  for y,x in zip(*np.nonzero(SHIELD)):
    h,l,s=HUE[y,x],LUM[y,x],SAT[y,x]
    if l<.22:continue
    key='r' if (h<.06 or h>.9) else 'g' if .25<h<.55 else 'y'
    out[y,x,:3]=hx(mp[key])[:3]
  return out
def put(a,x,y,c):
  if 0<=y<a.shape[0] and 0<=x<a.shape[1]:a[y,x]=hx(c) if isinstance(c,str) else c

# ---------------- variantes ----------------
def make_aguila():
  s=ramp_map(SRC0,PELT,['#2a1a10','#5a3a22','#8a6038','#c8b090','#f2ece0'])
  # pico de águila: amarillo, ganchudo, saliendo del frente del yelmo
  s=ramp_map(s,JAW,['#2a1a10','#5a3a22','#8a6038','#c8b090','#f2ece0'])
  ys,xs=np.nonzero(JAW);tx=xs.max();ty=int(ys[xs==tx].mean())
  for (dx,dy,c) in [(0,-1,'#f0b030'),(1,-1,'#f0b030'),(2,-1,'#ffe080'),(0,0,'#c07818'),(1,0,'#f0b030'),(2,0,'#f0b030'),(3,0,'#c07818'),
                    (3,1,'#5a3008'),(4,1,'#2a1408'),(2,1,'#c07818'),(1,1,'#8a5010'),(0,1,'#5a3008')]:
    put(s,tx+dx,ty+dy,c)
  # ojo del yelmo
  put(s,19,3,'#fff6e0');put(s,20,3,'#120c08')
  s[TAIL]=0
  # plumas de la nuca hacia atrás
  for i,(x,y) in enumerate([(12,4),(11,6),(10,8)]):
    for k in range(4):put(s,x-k,y+k//2,['#f2ece0','#c8b090','#8a6038','#2a1a10'][k])
  s=recolor_shield(s,{'r':'#f2ece0','g':'#2a6ab0','y':'#e8c040'})
  return s
def make_sacerdote():
  s=ramp_map(SRC0,PELT,['#08281c','#0e5a3a','#1a8a58','#38c080','#90f0b0'])
  # cabeza de serpiente turquesa en la quijada, con colmillo
  s=ramp_map(s,JAW,['#0a3a40','#1a7a80','#30b8b0','#90f0e0'],lift_dark=False)
  ys,xs=np.nonzero(JAW)
  if len(xs):
    tx=xs.max();ty=ys[xs.argmax()];put(s,tx-1,ty+1,'#fff4dc');put(s,tx-3,ty-1,'#e02020')
  s[TAIL]=0
  s=ramp_map(s,CREAM,['#5a1010','#a02020','#e8e0d0','#fffaf0'],lift_dark=False)
  s=recolor_shield(s,{'r':'#30b8b0','g':'#1a7a80','y':'#f0c040'})
  return s
def make_cazador():
  s=ramp_map(SRC0,PELT,['#2a1408','#5a3418','#8a5a30','#b88a58','#e0c090'])
  # manchas blancas de venado en la capa
  for (x,y) in [(9,14),(11,17),(9,21),(12,12),(15,3),(18,1)]:put(s,x,y,'#f4ecd8')
  s=ramp_map(s,JAW,['#2a1408','#5a3418','#8a5a30','#b88a58'],lift_dark=False)
  # antifaz negro de Mixcóatl sobre los ojos
  for x in range(19,24):put(s,x,8,'#141018')
  put(s,21,8,'#fff6e0')
  # rayas rojas y blancas en piernas
  for y in range(38,46,2):
    for x in range(9,13):
      if AL[y,x] and LUM[y,x]>.25:put(s,x,y,'#c83028' if (y//2)%2 else '#f0e8dc')
    for x in range(21,25):
      if AL[y,x] and LUM[y,x]>.25:put(s,x,y,'#c83028' if (y//2)%2 else '#f0e8dc')
  s[TAIL]=0
  s=recolor_shield(s,{'r':'#8a5a30','g':'#e0c090','y':'#c83028'})
  return s
def make_jaguar():return SRC0.copy()

def extras_100(kind,c):
  """detalles que van sobre el cuerpo ya ubicado (coordenadas del lienzo grande)"""
  P=lambda x,y:(x+HJ.PADL,y+HJ.PADT)
  if kind=='sacerdote':
    # penacho de plumas de quetzal hacia arriba y atrás
    for i,(dx,ln) in enumerate([(0,10),(-3,9),(-6,8),(3,7)]):
      x0,y0=P(16+dx,1)
      for k in range(ln):
        col=['#90f0b0','#38c080','#1a8a58','#0e5a3a'][min(3,k*4//ln)]
        HJ.put(c,x0-k*.45,y0-k,hx(col))
        HJ.put(c,x0-k*.45+1,y0-k,hx('#08281c'))
      HJ.put(c,x0-ln*.45,y0-ln,hx('#f0c040'))
  if kind=='aguila':
    for i,(dx,ln) in enumerate([(0,5),(-2,4)]):
      x0,y0=P(15+dx,1)
      for k in range(ln):HJ.put(c,x0-k*.6,y0-k,hx('#f2ece0' if k<ln-1 else '#2a1a10'))

# ---------------- armas (sprites fijos, empuñadura en (gx,gy)) ----------------
WD=H8.WD;OB=H8.OB;GOLD=H8.GOLD;GOLD2=H8.GOLD2;RED=H8.RED
def spr(w,h):return np.zeros((h,w,4),np.uint8)
def w_macuahuitl():return H8._weapon_h(10)
def w_lanza():
  L=17;a=spr(L+4,5);cy=2
  for x in range(0,L-3):a[cy,x]=WD[2] if x%4 else WD[1]
  a[cy,1]=GOLD2;a[cy,6]=GOLD;a[cy,7]=RED
  # punta de obsidiana con dientes
  for x in range(L-3,L+2):a[cy,x]=OB[1]
  a[cy-1,L-2]=OB[0];a[cy+1,L-2]=OB[0];a[cy-1,L]=OB[3];a[cy+1,L]=OB[0];a[cy,L+2]=OB[0];a[cy,L+1]=OB[2]
  # borla de plumas
  a[cy-1,L-5]=hx('#f2ece0');a[cy+1,L-5]=hx('#2a6ab0');a[cy-2,L-6]=hx('#f2ece0')
  return a,(4,cy)
def w_baston():
  L=16;a=spr(L+5,7);cy=3
  for x in range(0,L-2):a[cy,x]=WD[2] if x%3 else WD[1]
  a[cy,3]=GOLD;a[cy,9]=GOLD
  # cabeza de serpiente emplumada
  T=hx('#30b8b0');TD=hx('#1a7a80');TL=hx('#90f0e0')
  for (x,y,c) in [(L-2,cy,TD),(L-1,cy,T),(L,cy,T),(L+1,cy,TL),(L+2,cy,T),(L-1,cy-1,T),(L,cy-1,TL),(L+1,cy-1,T),(L-1,cy+1,TD),(L,cy+1,T),(L+1,cy+1,TD),
                  (L+3,cy,TD),(L+2,cy+1,hx('#fff4dc')),(L,cy-1,hx('#120808')),
                  (L-3,cy-1,hx('#38c080')),(L-4,cy-2,hx('#38c080')),(L-5,cy-3,hx('#90f0b0')),(L-3,cy+1,hx('#38c080')),(L-4,cy+2,hx('#1a8a58'))]:
    a[y,x]=c
  return a,(5,cy)
def w_arco():
  """arco vertical (curva hacia la derecha = hacia el frente), cuerda a la izquierda"""
  Hh=17;a=spr(5,Hh);cx=1
  for y in range(Hh):
    t=(y-(Hh-1)/2)/((Hh-1)/2);x=cx+round(2.2*(1-t*t))
    a[y,x]=WD[2] if abs(t)<.85 else WD[1]
    if abs(t)<.25:a[y,x]=GOLD
  for y in range(1,Hh-1):a[y,cx]=hx('#e8e0d0') if y%2 else hx('#c8c0b0')
  a[0,cx+1]=WD[0];a[Hh-1,cx+1]=WD[0]
  return a,(3,Hh//2)
def orient(spr_g,deg):
  a,(gx,gy)=spr_g;a=a.copy();h,w=a.shape[:2];deg%=360
  for _ in range(deg//90):a=np.rot90(a,-1);gx,gy=h-1-gy,gx;h,w=w,h
  return a,(gx,gy)
def stamp(c,sg,hand,deg):
  a,(gx,gy)=orient(sg,deg);ox,oy=int(round(hand[0]))-gx,int(round(hand[1]))-gy
  for y,x in zip(*np.nonzero(a[...,3]>0)):
    X,Y=x+ox,y+oy
    if 0<=X<c.shape[1] and 0<=Y<c.shape[0]:c[Y,X]=a[y,x]

# ---------------- composición al 68% ----------------
K=H8.K;W,H=H8.W,H8.H;SH=H8.SH
def body68(base,dx=0,dy_top=0):
  b=HJ.shifted(base,dx,0) if dy_top==0 else HJ.shifted(base,dx,dy_top,top_only_y=HJ.PADT+31)
  sm=to_board2(Image.fromarray(b,'RGBA'),round(HJ.W*K),round(HJ.H*K),'selout')
  c=np.zeros((H,W,4),np.uint8);a=np.asarray(sm);c[:a.shape[0],:a.shape[1]]=a;return c
def sparkle(c,cen,cols,n=10,r=6,life=1,seed=0):
  rr=np.random.default_rng(seed)
  for i in range(n):
    a=rr.uniform(0,6.28);d=rr.uniform(1,r)*life
    H8.put(c,cen[0]+math.cos(a)*d,cen[1]+math.sin(a)*d,hx(cols[i%len(cols)]))
def arrow(c,p,L,fly=0):
  x0,y0=p
  for k in range(L):H8.put(c,x0+fly+k,y0,WD[2] if k>1 else hx('#f2ece0'))
  H8.put(c,x0+fly+L,y0,OB[1]);H8.put(c,x0+fly+L+1,y0,OB[0]);H8.put(c,x0+fly,y0-1,hx('#c83028'));H8.put(c,x0+fly,y0+1,hx('#c83028'))

HEROS={
 'jaguar':dict(make=make_jaguar,weapon=w_macuahuitl,extra=None),
 'aguila':dict(make=make_aguila,weapon=w_lanza,extra='aguila'),
 'sacerdote':dict(make=make_sacerdote,weapon=w_baston,extra='sacerdote'),
 'cazador':dict(make=make_cazador,weapon=w_arco,extra=None),
}
def build(kind):
  cfg=HEROS[kind];HJ.SRC=cfg['make']();base=HJ.base_body()
  if cfg['extra']:extras_100(cfg['extra'],base)
  base=HJ.outline(base.copy()) if False else base
  sg=cfg['weapon']()
  def fr(pose,i=0):
    if kind=='cazador':
      if pose=='idle':
        bob=1 if i in(2,3,4) else 0;c=body68(base,0,bob);hand=(SH[0]-3,SH[1]+9+bob)
        H8.arm(c,(SH[0],SH[1]+bob*.7),hand,-1);stamp(c,sg,hand,0)
      elif pose=='windup':
        c=body68(base,-1);hand=(SH[0]+9,SH[1]+2)
        H8.arm(c,(SH[0]+1,SH[1]),hand,-1);stamp(c,sg,hand,0);arrow(c,(SH[0]+2,SH[1]+2),8)
      elif pose=='strike':
        c=body68(base,1);hand=(SH[0]+10,SH[1]+2)
        H8.arm(c,(SH[0]+1,SH[1]),hand,-1);stamp(c,sg,hand,0);arrow(c,(SH[0]+8,SH[1]+2),8,fly=6)
        for k in range(5):H8.put(c,SH[0]+6+k*2,SH[1]+2,hx('#fffbe0'))
      elif pose=='follow':
        c=body68(base,1);hand=(SH[0]+9,SH[1]+3)
        H8.arm(c,(SH[0]+1,SH[1]),hand,-1);stamp(c,sg,hand,0)
      else:
        c=body68(base,-2);hand=(SH[0]-4,SH[1]+8);H8.arm(c,(SH[0]-1.4,SH[1]),hand,-1);stamp(c,sg,hand,0)
    else:
      if pose=='idle':
        bob=1 if i in(2,3,4) else 0;c=body68(base,0,bob);hand=(SH[0]-3,SH[1]+9+bob)
        H8.arm(c,(SH[0],SH[1]+bob*.7),hand,-1);stamp(c,sg,hand,270)
      elif pose=='windup':
        c=body68(base,-1);hand=(SH[0]-5,SH[1]-5)
        if kind=='sacerdote':hand=(SH[0]-1,SH[1]-8);stamp(c,sg,hand,270);H8.arm(c,(SH[0]-.7,SH[1]),hand,1)
        else:stamp(c,sg,hand,180);H8.arm(c,(SH[0]-.7,SH[1]),hand,1)
      elif pose=='strike':
        c=body68(base,3);hand=(SH[0]+12,SH[1]+2)
        if kind=='jaguar':H8.slash(c,(SH[0]+14,SH[1]+4),8,math.radians(-80),math.radians(35),1)
        stamp(c,sg,hand,0);H8.arm(c,(SH[0]+2,SH[1]),hand,-1)
        if kind=='aguila':
          for k in range(6):H8.put(c,SH[0]+4+k*2,SH[1]+1,hx('#e8f0ff'))
        if kind=='sacerdote':sparkle(c,(SH[0]+29,SH[1]+2),['#90f0e0','#30b8b0','#f0c040','#ffffff'],n=18,r=6)
      elif pose=='follow':
        c=body68(base,2);hand=(SH[0]+10,SH[1]+8)
        if kind=='jaguar':H8.slash(c,(SH[0]+14,SH[1]+4),8,math.radians(-30),math.radians(75),.45)
        if kind=='aguila':hand=(SH[0]+11,SH[1]+3);stamp(c,sg,hand,0)
        else:stamp(c,sg,hand,90)
        H8.arm(c,(SH[0]+1.4,SH[1]),hand,-1)
        if kind=='sacerdote':sparkle(c,(SH[0]+18,SH[1]+12),['#90f0e0','#30b8b0'],n=8,r=5,seed=2)
      else:
        c=body68(base,-2);hand=(SH[0]-5,SH[1]+7);stamp(c,sg,hand,180);H8.arm(c,(SH[0]-1.4,SH[1]),hand,-1)
    if pose=='hurt':
      al=c[...,3]>0;c[al,:3]=np.clip(c[al,:3].astype(int)*[1.25,.8,.8]+[30,0,0],0,255).astype(np.uint8)
    return Image.fromarray(c,'RGBA')
  idle=[fr('idle',i) for i in range(6)];att=[fr(p) for p in('windup','strike','follow','hurt')]
  return idle,att
if __name__=='__main__':
  bg=(70,80,60,255);S=6;R={}
  for k in HEROS:R[k]=build(k)
  # hoja: fila por héroe (reposo + 4 poses)
  sheet=Image.new('RGBA',(W*5,H*4),bg)
  for r,k in enumerate(HEROS):
    idle,att=R[k]
    for j,f in enumerate([idle[0]]+att):sheet.alpha_composite(f,(j*W,r*H))
  sheet.resize((sheet.width*S,sheet.height*S),Image.NEAREST).save('/tmp/hr/heroes_sheet.png')
  # gif con los 4 a la vez
  frames=[]
  seq=[('i',i) for i in range(6)]*2+[('a',0),('a',0),('a',1),('a',2),('a',2)]+[('i',i) for i in range(6)]+[('a',3),('a',3)]+[('i',i) for i in range(6)]
  dur=[140]*12+[160,200,90,120,160]+[140]*6+[120,120]+[140]*6
  for t,i in seq:
    o=Image.new('RGBA',(W*4,H),bg)
    for j,k in enumerate(HEROS):
      idle,att=R[k];o.alpha_composite(idle[i] if t=='i' else att[i],(j*W,0))
    frames.append(o.resize((o.width*S,o.height*S),Image.NEAREST).convert('RGB'))
  frames[0].save('/tmp/hr/heroes_anim.gif',save_all=True,append_images=frames[1:],duration=dur,loop=0)
  import pickle;pickle.dump({k:([np.asarray(f) for f in R[k][0]],[np.asarray(f) for f in R[k][1]]) for k in R},open('/tmp/hr/heroes.pkl','wb'))
  print('ok',W,H)
