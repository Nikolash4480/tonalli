import sys,numpy as np
sys.path.insert(0,'/tmp/st')
from PIL import Image
from scipy import ndimage
from lowres import to_board2
FR=np.load('/tmp/hr/cz/frames.npy')
MAP={'#043247':None,
 '#7bd5f3':'#f0e8dc','#6c88ff':'#c83028','#6440d8':'#8a1e1a','#1f2e8e':'#4a0e0e',
 '#fce945':'#e8b830','#fff3a4':'#ffe07a',
 '#d19c60':'#8a5a30','#e8c583':'#b8824a','#b09066':'#6a4424','#fcfcfc':'#e8d0a0',
 '#966264':'#a2583a','#b15c51':'#c06e46','#793d4e':'#7e3f35',
 '#45064b':'#5a3620','#5d3555':'#7a4e2e','#472a38':'#4a2e1c','#2e212d':'#3a2216','#0a0b0f':'#0a0b0f'}
def hx(c):return np.array([int(c[i:i+2],16) for i in (1,3,5)],np.uint8)
def recolor(i,clean_below=None):
  a=FR[i].astype(int);o=np.zeros(a.shape[:2]+(4,),np.uint8)
  for k,v in MAP.items():
    m=(np.abs(a-hx(k).astype(int)).sum(-1)<6)
    if v:o[m,:3]=hx(v);o[m,3]=255
  if clean_below is not None:o[clean_below:]=0
  m=o[...,3]>0;lab,n=ndimage.label(m);sz=ndimage.sum(m,lab,range(1,n+1))
  big=1+int(np.argmax(sz))
  for j in range(n):
    if j+1!=big and sz[j]<12:o[lab==j+1]=0
  return o
if __name__=='__main__':
  sel=[0,26,38,40,42,46]
  imgs=[recolor(i) for i in sel]
  W=70;H=88;S=5
  sh=Image.new('RGBA',(W*len(sel),H),(70,80,60,255))
  for k,o in enumerate(imgs):sh.alpha_composite(Image.fromarray(o[22:110,40:110]),(k*W,0))
  sh.resize((sh.width*S,sh.height*S),Image.NEAREST).save('/tmp/hr/cz/recol.png')

TAN=[hx(c) for c in ('#8a5a30','#b8824a','#6a4424','#e8d0a0')]
YEL=[hx(c) for c in ('#e8b830','#ffe07a')]
def isin(o,cols):
  m=np.zeros(o.shape[:2],bool)
  for c in cols:m|=(o[...,3]>0)&(np.abs(o[...,:3].astype(int)-c.astype(int)).sum(-1)<4)
  return m
def strip_bow(o,feet_y=None):
  o=o.copy()
  if feet_y is not None:
    # salpicadura bajo los pies: sólo se conservan las columnas donde llegan las piernas
    cols=np.nonzero(o[feet_y-2,:,3]>0)[0]
    keepc=np.zeros(o.shape[1],bool)
    for x in cols:keepc[max(0,x-1):x+2]=True
    below=np.zeros(o.shape[:2],bool);below[feet_y:]=True
    o[below&~keepc[None,:]]=0
    splash=isin(o,[hx('#f0e8dc'),hx('#c83028'),hx('#8a1e1a'),hx('#4a0e0e'),hx('#e8d0a0')])
    o[below&splash]=0
    o[feet_y+3:]=0
  o[isin(o,TAN)]=0
  body=(o[...,3]>0)&~isin(o,YEL)
  near=ndimage.binary_dilation(body,iterations=2)
  o[isin(o,YEL)&~near]=0
  m=o[...,3]>0;lab,n=ndimage.label(m);sz=ndimage.sum(m,lab,range(1,n+1))
  for j in range(n):
    if sz[j]<10:o[lab==j+1]=0
  return o
