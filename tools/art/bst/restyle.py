import numpy as np,colorsys
from PIL import Image
from sklearn.cluster import KMeans
from skimage.color import rgb2lab
from scipy import ndimage
def restyle(img,ncol=16,minis=3,protect=45,seed=0,centers=None):
  a=np.array(img.convert('RGBA')).astype(float);m=a[...,3]>0;H,W=m.shape
  rgb=a[...,:3]/255;lab=rgb2lab(rgb)
  X=lab[m]
  if centers is None:
    km=KMeans(ncol,n_init=4,random_state=seed).fit(X);C=km.cluster_centers_;lbl=km.labels_
  else:
    C=centers;lbl=((X[:,None,:]-C[None])**2).sum(-1).argmin(1)
  L=-np.ones((H,W),int);L[m]=lbl
  # color de cada cluster en RGB (promedio)
  P=np.array([rgb[m][lbl==k].mean(0) if (lbl==k).any() else [0,0,0] for k in range(len(C))])
  PL=rgb2lab(P[None])[0]
  for it in range(2):
    for k in range(len(C)):
      cc,n=ndimage.label(L==k)
      if n==0:continue
      sizes=ndimage.sum(np.ones_like(cc),cc,range(1,n+1))
      for ci,sz in enumerate(sizes,1):
        if sz>=minis:continue
        ys,xs=np.where(cc==ci);nb={}
        for y,x in zip(ys,xs):
          for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
            yy,xx=y+dy,x+dx
            if 0<=yy<H and 0<=xx<W and L[yy,xx]>=0 and L[yy,xx]!=k:nb[L[yy,xx]]=nb.get(L[yy,xx],0)+1
        if not nb:continue
        r=max(nb,key=nb.get)
        if np.abs(PL[k]-PL[r]).sum()>protect*1.6 and sz>=1 and PL[k][0]>PL[r][0]+protect*.6:continue  # rasgos claros (ojos, dientes)
        if np.abs(PL[k]-PL[r]).sum()>protect*2.2:continue
        L[ys,xs]=r
  # paleta con sombras frías y luces cálidas
  Q=[]
  for c in P:
    h,l,s=colorsys.rgb_to_hls(*c)
    if l<.32:h=h+((0.72-h+.5)%1-.5)*.18;s=min(1,s*1.05)
    elif l>.68:h=h+((0.12-h+.5)%1-.5)*.12
    Q.append(colorsys.hls_to_rgb(h%1,l,s))
  Q=np.array(Q)
  out=np.zeros((H,W,4));out[m,:3]=Q[L[m]];out[m,3]=1
  # contorno selectivo
  pad=np.pad(m,1);edge=m&~(pad[:-2,1:-1]&pad[2:,1:-1]&pad[1:-1,:-2]&pad[1:-1,2:])
  base=out[...,:3].copy();dark=np.array([.10,.06,.13])
  lum=base@np.array([.3,.59,.11])
  sel=edge&(lum>.16)
  out[sel,:3]=base[sel]*.35+dark*.65
  # luz de borde arriba-izquierda (una fila hacia adentro)
  inner=m&~edge;up=np.zeros_like(m);up[1:]=edge[:-1];lf=np.zeros_like(m);lf[:,1:]=edge[:,:-1]
  rim=inner&(up|lf)&~np.roll(np.pad(m,((0,0),(0,0))),0,0)
  top=inner&up
  out[top,:3]=np.minimum(1,out[top,:3]*1.12+.02)
  return Image.fromarray((out*255).astype(np.uint8))
