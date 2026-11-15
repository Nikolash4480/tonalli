import sys,math,numpy as np,cv2,colorsys
sys.path.insert(0,'/tmp/st')
from PIL import Image
from scipy import ndimage
from sklearn.cluster import KMeans
from skimage.color import rgb2lab
def simplify_src(f,sp=6,sr=30):
  a=np.asarray(f.convert('RGBA'));rgb=np.ascontiguousarray(a[...,:3]);al=a[...,3]
  # rellenar fondo con color medio para que el filtro no lo arrastre
  m=al>110;fill=rgb.copy();fill[~m]=rgb[m].mean(0)
  ms=cv2.pyrMeanShiftFiltering(fill,sp,sr)
  out=np.dstack([ms,al]);return Image.fromarray(out,'RGBA')
def to_board3(f,tw,oh,ncol=14,minis=3,sp=6,sr=30,contrast=1.08,seed=0):
  f=simplify_src(f,sp,sr) if sp>0 else f
  s=f.resize((tw,oh),Image.BOX);a=np.asarray(s).astype(float);al=a[...,3]>110;rgb=a[...,:3]/255
  mu=rgb[al].mean(0);rgb=np.clip(mu+(rgb-mu)*contrast,0,1)
  X=rgb2lab(rgb[al][None])[0];km=KMeans(ncol,n_init=4,random_state=seed).fit(X)
  L=-np.ones(al.shape,int);L[al]=km.labels_
  P=np.array([rgb[al][km.labels_==k].mean(0) for k in range(ncol)]);PL=rgb2lab(P[None])[0]
  H,W=al.shape
  for it in range(2):
    for k in range(ncol):
      cc,n=ndimage.label(L==k)
      if not n:continue
      sz=ndimage.sum(np.ones_like(cc),cc,range(1,n+1))
      for ci,z in enumerate(sz,1):
        if z>=minis:continue
        ys,xs=np.where(cc==ci);nb={}
        for y,x in zip(ys,xs):
          for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
            yy,xx=y+dy,x+dx
            if 0<=yy<H and 0<=xx<W and L[yy,xx]>=0 and L[yy,xx]!=k:nb[L[yy,xx]]=nb.get(L[yy,xx],0)+1
        if not nb:continue
        r=max(nb,key=nb.get);dl=PL[k][0]-PL[r][0]
        if dl>28:continue   # brillos/ojos/dientes se quedan
        L[ys,xs]=r
  Q=[]
  for c in P:
    h,l,s_=colorsys.rgb_to_hls(*c)
    if l<.3:h=h+((0.72-h+.5)%1-.5)*.15
    elif l>.7:h=h+((0.12-h+.5)%1-.5)*.1
    Q.append(colorsys.hls_to_rgb(h%1,l,s_))
  Q=np.array(Q)
  out=np.zeros((H+2,W+2,4));out[1:-1,1:-1][al,:3]=Q[L[al]];out[1:-1,1:-1][al,3]=1
  A=out[...,3]>0;edge=A&~ndimage.binary_erosion(A)
  c=out[edge,:3];out[edge,:3]=np.clip(c*.5*np.array([.92,.88,1.08]),0,1)
  return Image.fromarray((out*255).astype(np.uint8),'RGBA')

def to_board3_multi(fr,tw,oh,ncol=16,minis=2,sp=3,sr=16,contrast=1.08,seed=0):
  """misma paleta para todos los cuadros (sin parpadeo de colores)"""
  sm=[]
  for f in fr:
    f=simplify_src(f,sp,sr) if sp>0 else f
    s=f.resize((tw,oh),Image.BOX);a=np.asarray(s).astype(float);al=a[...,3]>110;rgb=a[...,:3]/255;sm.append((al,rgb))
  allp=np.concatenate([r[al] for al,r in sm]);mu=allp.mean(0)
  sm=[(al,np.clip(mu+(r-mu)*contrast,0,1)) for al,r in sm]
  X=rgb2lab(np.concatenate([r[al] for al,r in sm])[None])[0]
  km=KMeans(ncol,n_init=4,random_state=seed).fit(X[::max(1,len(X)//20000)])
  C=km.cluster_centers_
  allrgb=np.concatenate([r[al] for al,r in sm]);alllab=X;lbl=((alllab[:,None,:]-C[None])**2).sum(-1).argmin(1)
  P=np.array([allrgb[lbl==k].mean(0) if (lbl==k).any() else [0,0,0] for k in range(ncol)]);PL=rgb2lab(P[None])[0]
  Q=[]
  for c in P:
    h,l,s_=colorsys.rgb_to_hls(*c)
    if l<.3:h=h+((0.72-h+.5)%1-.5)*.15
    elif l>.7:h=h+((0.12-h+.5)%1-.5)*.1
    Q.append(colorsys.hls_to_rgb(h%1,l,s_))
  Q=np.array(Q);outs=[]
  for al,rgb in sm:
    H,W=al.shape;L=-np.ones(al.shape,int);lab=rgb2lab(rgb[al][None])[0];L[al]=((lab[:,None,:]-C[None])**2).sum(-1).argmin(1)
    for it in range(2):
      for k in range(ncol):
        cc,n=ndimage.label(L==k)
        if not n:continue
        sz=ndimage.sum(np.ones_like(cc),cc,range(1,n+1))
        for ci,z in enumerate(sz,1):
          if z>=minis:continue
          ys,xs=np.where(cc==ci);nb={}
          for y,x in zip(ys,xs):
            for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):
              yy,xx=y+dy,x+dx
              if 0<=yy<H and 0<=xx<W and L[yy,xx]>=0 and L[yy,xx]!=k:nb[L[yy,xx]]=nb.get(L[yy,xx],0)+1
          if not nb:continue
          r=max(nb,key=nb.get)
          if PL[k][0]-PL[r][0]>28:continue
          L[ys,xs]=r
    out=np.zeros((H+2,W+2,4));out[1:-1,1:-1][al,:3]=Q[L[al]];out[1:-1,1:-1][al,3]=1
    A=out[...,3]>0;edge=A&~ndimage.binary_erosion(A)
    out[edge,:3]=np.clip(out[edge,:3]*.5*np.array([.92,.88,1.08]),0,1)
    outs.append(Image.fromarray((out*255).astype(np.uint8),'RGBA'))
  return outs
