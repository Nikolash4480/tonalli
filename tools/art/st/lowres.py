import numpy as np
from PIL import Image,ImageFilter
from scipy import ndimage
def to_board(f,tw,oh,outline=(16,10,24),contrast=1.25,sharpen=True):
  """achica al tamaño del tablero sin perder lectura: BOX + realce de contraste local + contorno de 1 px"""
  s=f.resize((tw,oh),Image.BOX)
  a=np.asarray(s).astype(float);al=a[...,3]>110
  rgb=a[...,:3]
  if sharpen:
    bl=np.asarray(s.convert('RGB').filter(ImageFilter.GaussianBlur(1.2))).astype(float)
    rgb=np.clip(rgb+(rgb-bl)*.9,0,255)
  m=rgb[al].mean(0);rgb=np.clip(m+(rgb-m)*contrast,0,255)
  out=np.zeros((oh,tw,4),np.uint8);out[...,:3]=rgb;out[...,3]=np.where(al,255,0)
  ring=ndimage.binary_dilation(al)&~al
  # el contorno solo donde no achica la silueta: lo ponemos por fuera
  big=np.zeros((oh+2,tw+2,4),np.uint8);big[1:-1,1:-1]=out
  al2=big[...,3]>0;ring=ndimage.binary_dilation(al2)&~al2
  big[ring,:3]=outline;big[ring,3]=255
  im=Image.fromarray(big,'RGBA')
  q=im.convert('RGB').quantize(32,method=Image.Quantize.MEDIANCUT).convert('RGBA');q.putalpha(im.getchannel('A'))
  return q

def to_board2(f,tw,oh,mode='selout',contrast=1.05):
  """mode: 'none' sin contorno · 'selout' contorno de color (versión oscura del borde, sin negro) · 'black' el anterior"""
  if mode=='black':return to_board(f,tw,oh,contrast=contrast,sharpen=False)
  s=f.resize((tw,oh),Image.BOX)
  a=np.asarray(s).astype(float);al=a[...,3]>110;rgb=a[...,:3]
  m=rgb[al].mean(0);rgb=np.clip(m+(rgb-m)*contrast,0,255)
  out=np.zeros((oh+2,tw+2,4),np.uint8);out[1:-1,1:-1,:3]=rgb;out[1:-1,1:-1,3]=np.where(al,255,0)
  A=out[...,3]>0
  if mode=='selout':
    # borde interno: el píxel del contorno toma su propio color oscurecido y llevado al tono más frío (sin negro puro)
    edge=A&~ndimage.binary_erosion(A)
    c=out[edge,:3].astype(float);c=c*.55+np.array([10,6,18])*.45*0;c=c*np.array([.95,.9,1.05])
    out[edge,:3]=np.clip(c,0,255).astype(np.uint8)
  im=Image.fromarray(out,'RGBA')
  q=im.convert('RGB').quantize(40,method=Image.Quantize.MEDIANCUT).convert('RGBA');q.putalpha(im.getchannel('A'))
  return q
