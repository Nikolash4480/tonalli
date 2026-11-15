"""Guerrero águila a partir de la referencia (pose, lanza y detalles) adaptado a la estética mexica."""
import sys,math,colorsys,numpy as np
sys.path.insert(0,'/tmp/st')
from PIL import Image
from scipy import ndimage
from lowres import to_board2
A=np.asarray(Image.open('/tmp/hr/ag/px.png').convert('RGBA')).astype(int).copy()
h,w=A.shape[:2];YY,XX=np.mgrid[0:h,0:w]
def hx(c):return np.array([int(c[i:i+2],16) for i in (1,3,5)]+[255],np.uint8)
HLS=np.zeros((h,w,3))
for y in range(h):
  for x in range(w):HLS[y,x]=colorsys.rgb_to_hls(*(A[y,x,:3]/255))
HU,LU,SA=HLS[...,0],HLS[...,1],HLS[...,2]
AL=A[...,3]>0
AL&=~(XX<4)                                    # miniatura del costado
def C(name):
  W_=LU>.8;K_=((HU<.08)|(HU>.93))&(LU>=.45)&~W_;D_=LU<.15
  R_=((HU<.03)|(HU>.93))&(SA>.6)&(LU<.45)
  O_=(HU>=.06)&(HU<.14)&~W_&~D_;P_=(HU>.75)&(HU<=.93)&~D_
  return {'W':W_,'k':K_,'#':D_,'r':R_,'o':O_,'p':P_}[name]&AL
def segd(p,q):
  px,py=XX-p[0],YY-p[1];dx,dy=q[0]-p[0],q[1]-p[1];t=np.clip((px*dx+py*dy)/(dx*dx+dy*dy),0,1)
  return np.hypot(px-t*dx,py-t*dy)
BLADE=C('W')&(XX<=19)&(YY<=20)
SHAFT=AL&(segd((17,19),(30,80))<1.6)&~C('k')&~(C('#')&(YY>=26)&(YY<=36))&~BLADE
SPEAR=BLADE|SHAFT
BACKARM=AL&(XX<=33)&(YY>=24)&(YY<=39)&~SPEAR
HEAD=AL&(XX>=38)&(XX<=51)&(YY>=12)&(YY<=25)
CAPE=C('r')&(YY>=24)&(YY<=41)&(XX>=28)
SASH=C('r')&(YY>=42)
TORSO=AL&(YY>=34)&(YY<=42)&(XX>=33)&(XX<=48)&(C('o')|(C('#')&(YY>=36)))&~CAPE
PANTS=AL&(YY>=43)&(YY<=63)&(C('o')|C('#'))&~SASH&(XX<=52)
BOOTS=AL&(YY>=63)&~SASH&~SPEAR
SKIN=C('k')&~HEAD
FRONTARM=AL&(XX>=51)&(YY>=37)&(YY<=53)
PLATE=AL&(XX>=36)&(XX<=39)&(YY>=33)&(YY<=35)

def rmap(img,mask,ramp,lo=.1,hi=.75):
  q=np.clip(((LU-lo)/(hi-lo)*(len(ramp)-1)).round().astype(int),0,len(ramp)-1)
  for k,c in enumerate(ramp):img[mask&(q==k)]=hx(c)
def put(img,x,y,c):
  if 0<=y<img.shape[0] and 0<=x<img.shape[1]:img[y,x]=hx(c) if isinstance(c,str) else c

SKR=['#3a1e10','#7a4426','#a8653a','#c88050','#e0a070']
FEA=['#2a1a10','#6a4a2a','#a88860','#e0d4bc','#f6f2e8']
LEG=['#2a1408','#5a3418','#8a5a30','#b88a50','#d8b880']
LEA=['#1a0e08','#3e2414','#5e3a20','#7e5230']
def body(with_arm=True,front=True):
  img=np.zeros((h,w,4),np.uint8);img[AL]=A[AL].astype(np.uint8)
  img[SPEAR]=0
  if not with_arm:img[BACKARM]=0
  rmap(img,SKIN&(with_arm|~BACKARM),SKR,.2,.8)
  rmap(img,CAPE,FEA,.08,.5)
  # filas de plumas en la capa: puntas marrones alternadas
  for y in range(26,41,3):
    for x in range(28,57):
      if CAPE[y,x] and (x+y//3)%3==0:put(img,x,y,'#6a4a2a')
      if CAPE[y,x] and (x+y//3)%3==1 and y+1<h and CAPE[y+1,x]:put(img,x,y+1,'#a88860')
  rmap(img,TORSO,['#4a3a2a','#9a8a6a','#d8ccae','#f0e8d4'],.1,.6)
  for y in range(37,42,2):
    for x in range(35,47,3):
      if TORSO[y,x]:put(img,x,y,'#9a8a6a')
  rmap(img,PANTS,LEG,.08,.6)
  rmap(img,BOOTS,LEA,.05,.45)
  # sandalias: banda dorada y puño de plumas arriba de la bota
  for x in range(33,42):
    if AL[64,x] and not SASH[64,x]:put(img,x,64,'#e8c040')
  for x in range(49,58):
    if AL[62,x]:put(img,x,62,'#e8c040')
    if AL[63,x]:put(img,x,63,'#f6f2e8' if x%2 else '#e0d4bc')
  img[PLATE]=hx('#2aa078');put(img,37,33,'#8af0c8')
  # restos rojos de la venda -> piel
  rest=HEAD&C('r')&(YY>=17);rmap(img,rest,SKR,.1,.6)
  # ---- yelmo de águila real: cabeza marrón grande, la cara asoma por el pico abierto
  E=lambda cx,cy,rx,ry:((XX-cx)/rx)**2+((YY-cy)/ry)**2<=1
  face=E(47.2,21.5,3.2,3.6)
  dome=E(44,15.5,7.5,6.8)&~face
  img[HEAD&~face]=0
  BR=['#1e120a','#3e2614','#6a4424','#9a6a3a','#c89a60']
  q=np.clip((((YY-9)/12)*-1+1)*2.2+((XX-38)/14)*1.2,0,4).astype(int)
  for k,c in enumerate(BR):img[dome&(q==k)]=hx(c)
  # vetas claras en la nuca
  for (x,y) in [(39,13),(40,16),(38,18),(41,11),(42,13),(40,19)]:put(img,x,y,'#c89a60')
  edge=dome&~ndimage.binary_erosion(dome);img[edge]=hx('#1e120a')
  # ojo del águila
  put(img,47,13,'#fff6e0');put(img,48,13,'#120a06');put(img,46,12,'#1e120a');put(img,47,12,'#1e120a')
  # pico superior grande y ganchudo hacia adelante
  for (x,y,c) in [(48,15,'#c07818'),(49,15,'#f0b030'),(50,15,'#f0b030'),(51,15,'#ffe080'),(52,15,'#f0b030'),
                  (48,16,'#c07818'),(49,16,'#f0b030'),(50,16,'#f0b030'),(51,16,'#f0b030'),(52,16,'#f0b030'),(53,16,'#ffe080'),(54,16,'#c07818'),
                  (49,17,'#c07818'),(50,17,'#c07818'),(51,17,'#f0b030'),(52,17,'#f0b030'),(53,17,'#f0b030'),(54,17,'#c07818'),(55,17,'#5a3008'),
                  (53,18,'#c07818'),(54,18,'#8a5010'),(55,18,'#2a1408'),(54,19,'#2a1408'),
                  (48,14,'#5a3008'),(49,14,'#5a3008'),(50,14,'#8a5010'),(51,14,'#8a5010'),(52,14,'#8a5010'),(53,15,'#8a5010'),(54,15,'#5a3008'),(55,16,'#5a3008')]:
    put(img,x,y,c)
  # pico inferior bajo el mentón
  for (x,y,c) in [(46,25,'#c07818'),(47,25,'#f0b030'),(48,25,'#f0b030'),(49,25,'#f0b030'),(50,25,'#c07818'),(47,26,'#8a5010'),(48,26,'#5a3008'),(49,26,'#5a3008'),(45,25,'#5a3008'),(51,24,'#5a3008')]:
    put(img,x,y,c)
  # cara: piel, ojos y boca
  for y in range(18,25):
    for x in range(44,51):
      if face[y,x]:img[y,x]=hx(SKR[3] if x>=47 else SKR[2])
  put(img,46,20,'#1a0c06');put(img,49,20,'#1a0c06');put(img,45,19,'#3a1e10');put(img,48,23,'#7a4426');put(img,49,23,'#7a4426')
  # cresta de plumas hacia atrás y arriba
  for (x,y,L) in [(39,10,6),(38,13,6),(38,16,5)]:
    for k in range(L):put(img,x-k,y-k//2,'#f6f2e8' if k<L-2 else ('#e0d4bc' if k<L-1 else '#1e120a'))
  # brazalete dorado
  if front:
    for (x,y) in [(54,41),(55,41),(56,41)]:put(img,x,y,'#e8c040')
  if with_arm:
    for (x,y) in [(24,33),(25,33),(26,34)]:put(img,x,y,'#e8c040')
  if not front:img[FRONTARM]=0
  if not with_arm:img[BACKARM]=0
  # limpiar píxeles sueltos
  from scipy import ndimage as nd
  m=img[...,3]>0;lab,n=nd.label(m);sz=nd.sum(m,lab,range(1,n+1))
  for i in range(n):
    if sz[i]<6:img[lab==i+1]=0
  return img
WOOD=['#2a1408','#5e351e','#8a5428','#a86a34']
OB=['#0e0c14','#2e2c40','#5a5a78','#e6ecff']
def spear_sprite():
  """lanza horizontal apuntando a la derecha, a la resolución final (empuñadura en grip)"""
  L=24;a=np.zeros((7,L+6,4),np.uint8);cy=3
  def p(x,y,c):a[y,x]=hx(c)
  for x in range(0,L-2):p(x,cy,WOOD[2] if x%4 else WOOD[1])
  p(0,cy,WOOD[0]);p(5,cy,'#e8c040');p(6,cy,'#b8302a')
  # borla de plumas blancas y azules bajo la punta
  for (x,y,c) in [(L-4,cy-1,'#f6f2e8'),(L-4,cy+1,'#2a6ab0'),(L-5,cy-2,'#f6f2e8'),(L-5,cy+2,'#e0d4bc'),(L-3,cy-1,'#e0d4bc')]:p(x,y,c)
  # punta de obsidiana en hoja, con filo brillante
  for (x,y,c) in [(L-2,cy,OB[1]),(L-1,cy,OB[1]),(L,cy,OB[2]),(L+1,cy,OB[1]),(L+2,cy,OB[1]),(L+3,cy,OB[0]),(L+4,cy,OB[0]),
                  (L-1,cy-1,OB[0]),(L,cy-1,OB[3]),(L+1,cy-1,OB[3]),(L+2,cy-1,OB[0]),
                  (L-1,cy+1,OB[0]),(L,cy+1,OB[1]),(L+1,cy+1,OB[1]),(L+2,cy+1,OB[0])]:p(x,y,c)
  return a,(5,cy)
def spear_diag(n=24):
  """versión inclinada fija para el reposo (como la referencia): punta arriba"""
  hgt=n+6;a=np.zeros((hgt,14,4),np.uint8)
  def p(x,y,c):
    if 0<=y<hgt and 0<=x<14:a[y,x]=hx(c)
  # astil con pendiente 1:5 hacia abajo a la derecha
  for i in range(n):p(2+i//5+1,6+i,WOOD[2] if i%4 else WOOD[1])
  for (dx,dy,c) in [(0,0,OB[0]),(0,1,OB[2]),(1,1,OB[1]),(0,2,OB[3]),(1,2,OB[1]),(0,3,OB[3]),(1,3,OB[1]),(2,3,OB[0]),(1,4,OB[1]),(2,4,OB[0]),(2,5,OB[1])]:p(2+dx,dy,c)
  for (x,y,c) in [(2,6,'#f6f2e8'),(4,6,'#2a6ab0'),(2,7,'#e0d4bc'),(4,7,'#f6f2e8')]:p(x,y,c)
  return a
