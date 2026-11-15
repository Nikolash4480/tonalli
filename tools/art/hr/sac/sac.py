"""Sacerdote de Quetzalcóatl: misma base de cuerpo que el águila (la referencia del monje con capa),
pelo negro largo, penacho alto de plumas de quetzal, capa verde de plumas, túnica blanca larga con borde turquesa,
faja roja, bastón con cabeza de serpiente emplumada. En combate invoca: carga el bastón arriba y lanza
una descarga turquesa desde la cabeza de la serpiente."""
import sys,math,numpy as np,importlib.util
sys.path.insert(0,'/tmp/hr/ag');sys.path.insert(0,'/tmp/st')
from PIL import Image
from scipy import ndimage
from lowres import to_board2
import ag
from ag import AL,XX,YY,C,LU,CAPE,TORSO,PANTS,BOOTS,SKIN,HEAD,SASH,SPEAR,BACKARM,FRONTARM,PLATE,rmap,put,hx,SKR
sp=importlib.util.spec_from_file_location('h8','/tmp/hr/hero_jag68.py');H8=importlib.util.module_from_spec(sp);sp.loader.exec_module(H8)
A=ag.A;h,w=ag.h,ag.w
QUE=['#06281c','#0e5a3a','#1a8a58','#38c080','#90f0b0']
ROBE=['#5a5a50','#a8a494','#dedad0','#f6f4ea']
TURQ=['#0a3a40','#1a7a80','#30b8b0','#90f0e0']
def body(with_arm=True,front=True):
  img=np.zeros((h,w,4),np.uint8);img[AL]=A[AL].astype(np.uint8);img[SPEAR]=0
  rmap(img,SKIN,SKR,.2,.8)
  rmap(img,CAPE,QUE,.08,.5)
  for y in range(26,41,3):
    for x in range(28,57):
      if CAPE[y,x] and (x+y//3)%3==0:put(img,x,y,QUE[1])
      if CAPE[y,x] and (x+y//3)%3==1 and y+1<h and CAPE[y+1,x]:put(img,x,y+1,QUE[3])
  rmap(img,TORSO,ROBE,.1,.6)
  # túnica larga: el pantalón pasa a túnica blanca, con borde turquesa abajo
  rmap(img,PANTS,ROBE,.05,.55)
  for x in range(28,58):
    for y in (61,62):
      if PANTS[y,x]:put(img,x,y,TURQ[2] if y==61 else TURQ[1])
  for y in range(46,60,4):
    for x in range(30,56,4):
      if PANTS[y,x]:put(img,x,y,TURQ[1])
  rmap(img,BOOTS,['#1a0e08','#3e2414','#5e3a20','#7e5230'],.05,.45)
  img[PLATE]=hx('#e8c040');put(img,37,33,'#2aa078')
  # cabeza: pelo negro largo detrás, cinta de oro con jade, cara despejada
  hair=HEAD&((YY<=16)|(XX<=42))
  img[hair]=hx('#1c1418');img[hair&(XX<=41)&(YY>=14)]=hx('#120c10')
  for (x,y) in [(40,13),(42,12),(39,16),(40,19),(41,22)]:put(img,x,y,'#3a2c34')
  face=HEAD&~hair&(YY>=16)
  rmap(img,face&C('r'),SKR,.1,.6)
  for x in range(41,51):
    if AL[16,x]:put(img,x,16,'#e8c040')
  put(img,45,16,'#2aa078');put(img,46,16,'#8af0c8')
  put(img,46,20,'#1a0c06');put(img,49,20,'#1a0c06');put(img,48,23,'#7a4426')
  # pintura facial negra del sacerdote (banda bajo los ojos)
  for x in range(44,51):
    if AL[21,x] and not hair[21,x]:put(img,x,21,'#2a1a1a')
  # orejeras de jade
  put(img,43,19,'#2aa078');put(img,43,20,'#1a7a58')
  if not front:img[FRONTARM]=0
  if not with_arm:img[BACKARM]=0
  m=img[...,3]>0;lab,n=ndimage.label(m);sz=ndimage.sum(m,lab,range(1,n+1))
  for i in range(n):
    if sz[i]<6:img[lab==i+1]=0
  return img
WOOD=['#2a1408','#5e351e','#8a5428','#a86a34']
def staff_sprite():
  """bastón horizontal (punta a la derecha) con cabeza de serpiente emplumada turquesa"""
  L=22;a=np.zeros((9,L+6,4),np.uint8);cy=4
  def p(x,y,c):a[y,x]=hx(c)
  for x in range(0,L-1):p(x,cy,WOOD[2] if x%4 else WOOD[1])
  p(0,cy,WOOD[0]);p(6,cy,'#e8c040');p(12,cy,'#e8c040')
  T=TURQ
  for (dx,dy,c) in [(-1,0,T[1]),(0,0,T[2]),(1,0,T[2]),(2,0,T[3]),(3,0,T[2]),(4,0,T[1]),(0,-1,T[2]),(1,-1,T[3]),(2,-1,T[2]),(3,-1,T[1]),
                    (0,1,T[1]),(1,1,T[2]),(2,1,T[1]),(3,1,T[0]),(5,0,T[0]),(4,1,'#fff4dc'),(2,-1,'#120808'),(5,1,'#c83028'),
                    (-2,-1,QUE[3]),(-3,-2,QUE[3]),(-4,-3,QUE[4]),(-2,1,QUE[2]),(-3,2,QUE[3]),(-4,3,QUE[1]),(-1,-2,QUE[2]),(-1,2,QUE[2])]:
    p(L-1+dx,cy+dy,c)
  return a,(6,cy)
def staff_diag(n=38):
  """versión inclinada fija para el reposo (cabeza arriba), misma pendiente que la lanza del águila"""
  hgt=n+8;a=np.zeros((hgt,16,4),np.uint8)
  def p(x,y,c):
    if 0<=y<hgt and 0<=x<16:a[y,x]=hx(c)
  for i in range(n):p(4+i//5,8+i,WOOD[2] if i%4 else WOOD[1])
  T=TURQ
  for (dx,dy,c) in [(0,0,T[1]),(0,1,T[2]),(1,1,T[3]),(0,2,T[2]),(1,2,T[2]),(2,2,T[1]),(0,3,T[1]),(1,3,T[2]),(2,3,T[1]),(1,4,T[1]),(2,4,T[0]),
                    (3,3,T[0]),(2,1,'#120808'),(3,2,'#fff4dc'),(3,4,'#c83028'),(1,5,T[1]),(2,6,T[1]),(3,7,WOOD[1]),
                    (-1,4,QUE[3]),(-2,5,QUE[4]),(-2,3,QUE[3]),(4,5,QUE[2]),(5,6,QUE[3])]:
    p(3+dx,dy,c)
  return a
