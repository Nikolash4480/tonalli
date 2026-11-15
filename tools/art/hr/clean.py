import numpy as np
from PIL import Image
from scipy import ndimage
a=np.asarray(Image.open('/tmp/hr/ref_jag.jpg').convert('RGB')).astype(float)
N=64;img=np.zeros((N,N,3))
for j in range(N):
  for i in range(N):
    img[j,i]=np.median(a[j*16+4:j*16+12,i*16+4:i*16+12].reshape(-1,3),0)
g=img
gray=(np.abs(g-g.mean(-1,keepdims=True)).max(-1)<14)&(g.mean(-1)>100)&(g.mean(-1)<165)
lab,n=ndimage.label(gray);sz=ndimage.sum(gray,lab,range(1,n+1))
bg=np.isin(lab,[i+1 for i in range(n) if sz[i]>8])
al=~bg
for y in range(N-1,40,-1):
  row=al[y]
  if row.sum()>20 and (g[y][row].mean(-1)<60).mean()>.8: al[y]=False
lab2,n=ndimage.label(al);s2=ndimage.sum(al,lab2,range(1,n+1));al=lab2==1+int(np.argmax(s2))
# paleta limpia por k-means simple
px=g[al];K=22
rng=np.random.default_rng(0);C=px[rng.choice(len(px),K,replace=False)]
for _ in range(30):
  d=((px[:,None]-C[None])**2).sum(-1);l=d.argmin(1)
  for k in range(K):
    if (l==k).any():C[k]=px[l==k].mean(0)
q=np.zeros_like(g);q[al]=C[l]
lum=q@[.3,.59,.11]
black=al&(lum<45)
edge=al&~ndimage.binary_erosion(al)
# contorno exterior: negro del borde -> color del vecino interior oscurecido (selout)
out=q.copy()
inner_col=np.zeros_like(q);cnt=np.zeros(q.shape[:2])
nonblack=al&~black
for dy in(-1,0,1):
  for dx in(-1,0,1):
    sh=np.roll(np.roll(q*nonblack[...,None],dy,0),dx,1);m=np.roll(np.roll(nonblack,dy,0),dx,1)
    inner_col+=sh;cnt+=m
nb=inner_col/np.maximum(cnt,1)[...,None]
e=black&edge&(cnt>0)
out[e]=nb[e]*np.array([.42,.36,.42])
e2=black&edge&(cnt==0);out[e2]=(40,26,24)
# líneas internas: negro -> marrón muy oscuro
ib=black&~edge;out[ib]=np.where(cnt[ib,None]>0,nb[ib]*.22+np.array([22,12,10]),np.array([40,24,18]))
rgba=np.dstack([np.clip(out,0,255).astype(np.uint8),(al*255).astype(np.uint8)])
ys,xs=np.nonzero(al)
im=Image.fromarray(rgba,'RGBA').crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1));im.save('/tmp/hr/jag_clean.png')
raw=np.dstack([np.clip(q,0,255).astype(np.uint8),(al*255).astype(np.uint8)])
Image.fromarray(raw,'RGBA').crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1)).save('/tmp/hr/jag_raw.png')
print(im.size)
