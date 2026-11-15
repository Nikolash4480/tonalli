import sys,math,numpy as np,importlib.util
sys.path.insert(0,'/tmp/hr/ag');sys.path.insert(0,'/tmp/st')
from PIL import Image
from lowres import to_board2
import ag
sp=importlib.util.spec_from_file_location('h8','/tmp/hr/hero_jag68.py');H8=importlib.util.module_from_spec(sp);sp.loader.exec_module(H8)
K=.5;PL=2;PT=3
BW,BH=round(ag.w*K),round(ag.h*K)
W,H=BW+PL+28,BH+3+PT
def small(img,dy_top=0,ox=0,oy=0):
  if dy_top:
    img=img.copy();top=img[:44].copy();img[:44]=0;r=np.roll(top,dy_top,0);r[:dy_top]=0;m=r[...,3]>0;img[:44][m]=r[m]
  s=np.asarray(to_board2(Image.fromarray(img,'RGBA'),BW,BH,'selout'))
  c=np.zeros((H,W,4),np.uint8);c[PT:PT+s.shape[0],PL:PL+s.shape[1]]=s
  d=dy_top+PT+int(round(oy))
  for (x,y,col) in [(26,7,'#8a5010'),(27,7,'#f0b030'),(28,7,'#f0b030'),(29,7,'#c07818'),
                    (27,8,'#f0b030'),(28,8,'#ffe080'),(29,8,'#f0b030'),(30,8,'#c07818'),(29,9,'#8a5010'),(30,9,'#2a1408'),
                    (24,7,'#fff6e0'),(25,7,'#120a06'),(26,13,'#f0b030'),(27,13,'#f0b030'),(28,13,'#c07818'),
                    (20,7,'#f6f2e8'),(19,6,'#f6f2e8'),(18,6,'#e0d4bc'),(20,9,'#f6f2e8'),(19,9,'#e0d4bc')]:
    c[y+d,x+int(round(ox))]=ag.hx(col)
  return c
B_ARM=ag.body(True);B_NO=ag.body(False)
SD=ag.spear_diag(38);SH_=ag.spear_sprite()
def stamp(c,a,ox,oy,under=None):
  for y,x in zip(*np.nonzero(a[...,3]>0)):
    X,Y=x+ox,y+oy
    if 0<=X<W and 0<=Y<H:
      if under is not None and under[Y,X]:continue
      c[Y,X]=a[y,x]
def orient(sg,deg):
  a,(gx,gy)=sg;a=a.copy();h,w=a.shape[:2]
  for _ in range((deg%360)//90):a=np.rot90(a,-1);gx,gy=h-1-gy,gx;h,w=w,h
  return a,(gx,gy)
def stamp_g(c,sg,hand,deg):
  a,(gx,gy)=orient(sg,deg);stamp(c,a,int(round(hand[0]))-gx,int(round(hand[1]))-gy)
SH=(PL+33*K,30*K+PT)   # hombro trasero
FS=(PL+52*K,31*K+PT)   # hombro delantero
B_NO2=ag.body(False,front=False)
def shift(c,dx):return np.roll(c,dx,1)
def frame(pose,i=0):
  if pose=='idle':
    bob=1 if i in(2,3,4) else 0
    c=small(B_ARM,bob)
    y0=12+bob+PT;hand=np.zeros(c.shape[:2],bool);hand[y0:y0+7,PL+7:PL+12]=c[y0:y0+7,PL+7:PL+12,3]>0
    stamp(c,SD,PL+5,bob,under=hand)
  else:
    WAIST,FOOT,CX=44,80,38
    def warp(img,shear,drop,spread):
      """agacha y encorva: el torso baja `drop` y se inclina (shear>0 = hacia adelante),
      las piernas se acortan y se abren `spread` píxeles en los pies"""
      h_,w_=img.shape[:2];out=np.zeros_like(img)
      for y in range(h_):
        for x in range(w_):
          if y<WAIST+drop:
            sy=y-drop;sx=x-shear*(WAIST-sy)
          else:
            sy=WAIST+(y-WAIST-drop)*(FOOT-WAIST)/(FOOT-WAIST-drop)
            t=(sy-WAIST)/(FOOT-WAIST);sx=x-spread*t*(1 if x>=CX else -1)
          sx,sy=int(round(sx)),int(round(sy))
          if 0<=sx<w_ and 0<=sy<h_:out[y,x]=img[sy,sx]
      return out
    def posed(shear,drop,spread,dx):
      wimg=warp(B_NO2,shear,drop,spread)
      hx_,hy_=shear*(WAIST-15)*K,drop*K
      c=shift(small(wimg,0,hx_,hy_),dx)
      so=(shear*(WAIST-30)*K+dx,drop*K)
      return c,so
    def two(c,so,bh,ext):
      fh=(bh[0]+ext,bh[1])
      stamp_g(c,SH_,bh,0)
      H8.arm(c,(SH[0]+so[0],SH[1]+so[1]),bh,1)
      H8.arm(c,(FS[0]+so[0],FS[1]+so[1]),fh,-1)
    if pose=='guard':
      b=1 if i in(2,3,4) else 0
      c,so=posed(.16,7+b,3,0);two(c,so,(SH[0]+so[0]-1,SH[1]+so[1]+6),9)
    elif pose=='windup':
      c,so=posed(-.1,10,4,-2);two(c,so,(SH[0]+so[0]-7,SH[1]+so[1]+4),9)
    elif pose=='strike':
      c,so=posed(.36,9,6,4)
      for k in range(8):H8.put(c,SH[0]+so[0]+k*2,SH[1]+so[1]+5,ag.hx('#e8f0ff'))
      for (yy,x0,L) in [(-2,-3,4),(3,-4,5),(9,-3,4),(14,-2,3)]:
        for k in range(L):H8.put(c,SH[0]+so[0]+x0-k,SH[1]+so[1]+yy,ag.hx('#d8e4f0') if k<L-1 else ag.hx('#9aa8b8'))
      two(c,so,(SH[0]+so[0]+8,SH[1]+so[1]+5),9)
    elif pose=='follow':
      c,so=posed(.28,8,5,3);two(c,so,(SH[0]+so[0]+5,SH[1]+so[1]+6),9)
    else:
      c,so=posed(-.14,5,3,-2);two(c,so,(SH[0]+so[0]-4,SH[1]+so[1]+7),8)
      al=c[...,3]>0;c[al,:3]=np.clip(c[al,:3].astype(int)*[1.25,.8,.8]+[30,0,0],0,255).astype(np.uint8)
  return Image.fromarray(c,'RGBA')
idle=[frame('idle',i) for i in range(6)];guard=[frame('guard',i) for i in range(6)];att=[frame(p) for p in('windup','strike','follow','hurt')]
if __name__=='__main__':
  bg=(70,80,60,255);S=7
  big=ag.body(True);bb=Image.fromarray(big,'RGBA');o=Image.new('RGBA',bb.size,bg);o.alpha_composite(bb);o.resize((bb.width*6,bb.height*6),Image.NEAREST).save('/tmp/hr/ag/ref_edit.png')
  strip=Image.new('RGBA',(W*6,H),bg)
  for j,f in enumerate([idle[0],guard[0]]+att):strip.alpha_composite(f,(j*W,0))
  strip.resize((strip.width*S,strip.height*S),Image.NEAREST).save('/tmp/hr/ag/strip.png')
  seq=[('i',i) for i in range(6)]*2+[('g',i) for i in range(6)]*2+[('a',0),('a',0),('a',1),('a',2),('a',2)]+[('g',i) for i in range(6)]+[('a',3),('a',3)]+[('g',i) for i in range(6)]
  dur=[140]*24+[160,200,90,120,160]+[140]*6+[120,120]+[140]*6
  fr=[]
  for t,i in seq:
    f=idle[i] if t=='i' else guard[i] if t=='g' else att[i];b=Image.new('RGBA',f.size,bg);b.alpha_composite(f);fr.append(b.resize((W*S,H*S),Image.NEAREST).convert('RGB'))
  fr[0].save('/tmp/hr/ag/anim.gif',save_all=True,append_images=fr[1:],duration=dur,loop=0);print('ok',W,H)
