"""Exporta los héroes nuevos (jaguar, águila, cazador) a /home/claude/heroart.js.
Orden de cuadros (compatible con el sistema viejo de héroes):
 0-1 reposo (respira), 2-7 caminar (reposo rápido), 8 preparación, 9 golpe, 10 daño, 11-16 guardia, 17 remate."""
import sys,importlib.util,base64,json,numpy as np
from PIL import Image
def load(n,p):
  sys.path.insert(0,p.rsplit('/',1)[0])
  sp=importlib.util.spec_from_file_location(n,p);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m
H8=load('h8','/tmp/hr/hero_jag68.py');JC=load('jc','/tmp/hr/jag_combat.py')
AGC=load('agc','/tmp/hr/ag/comp.py');AG2=load('ag2','/tmp/hr/ag/combat2.py');CZ=load('czh','/tmp/hr/cz/hunter.py')
SC=load('sc2','/tmp/hr/sac/sac2.py')
EG=load('eag3','/tmp/hr/ag3/eag.py')
def feet_x(im):
  a=np.asarray(im)[...,3]>0;ys,xs=np.nonzero(a);yb=ys.max();sel=ys>=yb-2;return xs[sel].mean(),yb
def sets(idle,guard,att):
  """att = [preparación, golpe, remate, daño]"""
  return idle,guard,att
HER={
 'jaguar':(H8.idle,JC.guardF,JC.att),
 'aguila':(EG.idle,EG.guardF,EG.att),
 'pochteca':(CZ.guard,CZ.guard,CZ.att),
 'sacerdotisa':(SC.idleF,SC.guardF,SC.att),
}
def place(groups):
  """cada grupo (lista de imágenes con el mismo encuadre) se ancla en los pies de su primer cuadro"""
  items=[]
  for g in groups:
    ax,_=feet_x(g[0])
    for im in g:
      a=np.asarray(im);ys,xs=np.nonzero(a[...,3]>0);items.append((im,ax,ys.max(),xs.min(),xs.max(),ys.min()))
  half=max(max(ax-x0,x1-ax) for _,ax,_,x0,x1,_ in items)+1
  top=max(yb-y0 for _,_,yb,_,_,y0 in items)+1
  W=int(np.ceil(2*half))+1;H=int(top)+1
  out=[]
  for im,ax,yb,x0,x1,y0 in items:
    c=Image.new('RGBA',(W,H),(0,0,0,0));ox=int(round(W/2-ax));oy=H-1-yb
    c.alpha_composite(im,(ox,oy)) if ox>=0 and oy>=0 else c.paste(im,(ox,oy),im)
    out.append(c)
  return out
SKIN=[(0xa2,0x58,0x3a),(0xc0,0x6e,0x46),(0x7e,0x3f,0x35),(0xc8,0x80,0x50),(0xd8,0x8a,0x5a),(0xe0,0xa0,0x70)]
LEATHER=[(0xd8,0xb0,0x7a),(0xa8,0x78,0x4a),(0x7a,0x4e,0x2c),(0x4a,0x2c,0x18),(0x5a,0x36,0x20),(0x7a,0x4e,0x2e),(0x4a,0x2e,0x1c),(0x3a,0x22,0x16),(0xb8,0x86,0x4e),(0xc8,0x30,0x28),(0x8a,0x1e,0x1a),(0xf0,0xe8,0xdc)]
def near(c,L):return min(sum((c[i]-q[i])**2 for i in range(3)) for q in L)
KILT=[(0xd8,0xb0,0x7a),(0xa8,0x78,0x4a),(0xb8,0x86,0x4e),(0xc8,0x30,0x28),(0x8a,0x1e,0x1a),(0x94,0x24,0x1d)]
ACC={'pochteca':lambda c:near(c,KILT)<500 and near(c,KILT)<near(c,SKIN)}
def encode(im,acc=None):
  a=np.asarray(im.convert('RGBA'));al=a[...,3]>0;cols={};idx=np.zeros(al.shape,np.uint8);pal=[]
  for y,x in zip(*np.where(al)):
    c=tuple(int(v) for v in a[y,x,:3])
    if c not in cols:
      if len(pal)>=255:c=min(cols,key=lambda q:sum((q[i]-c[i])**2 for i in range(3)))
      else:cols[c]=len(pal)+1;pal.append('%02x%02x%02x'%c)
    idx[y,x]=cols[c]
  r={'w':im.width,'h':im.height,'p':''.join(pal),'d':base64.b64encode(idx.tobytes()).decode()}
  if acc:r['a']=[i for i,h in enumerate(pal) if acc(tuple(int(h[j:j+2],16) for j in (0,2,4)))]
  return r
out={};prev={}
for k,(idle,guard,att) in HER.items():
  wind,strike,follow,hurt=att
  frames=place([list(idle),list(guard)+[wind,strike,follow,hurt]])
  I=frames[:len(idle)];G=frames[len(idle):len(idle)+len(guard)];A=frames[len(idle)+len(guard):]
  seq=[I[0],I[3]]+I[:6]+[A[0],A[1],A[3]]+G[:6]+[A[2]]
  out[k]={'hero':1,'idle':0,'atk':0,'pad':0,'frames':[encode(f,ACC.get(k)) for f in seq]}
  prev[k]=seq
  print(k,len(seq),seq[0].size)
js='Object.assign(NEW_ART,'+json.dumps(out,separators=(',',':'))+');\n'+r'''
/* héroes nuevos: mismo formato; guardia de combate en 11-16 y remate en 17 */
function heroArtFrames(name,hue){const A=NEW_ART[name];
 /* mismo héroe en otro jugador: la ropa (taparrabo, capa, escudo, plumas) toma el color del jugador; la piel, el pelaje, la máscara y las armas no cambian */
 const hsl=(p)=>{const r=p[0]/255,g=p[1]/255,b=p[2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,s=mx===mn?0:(mx-mn)/(1-Math.abs(2*l-1));
  let h=0;if(mx!==mn){h=mx===r?((g-b)/(mx-mn))%6:mx===g?(b-r)/(mx-mn)+2:(r-g)/(mx-mn)+4;h*=60;if(h<0)h+=360}return[h,s,l]};
 const red=(h,s,l)=>(h<20||h>330)&&s>.35&&l>.15;
 const RULE={jaguar:(h,s,l)=>((h<16||h>335)&&s>.4&&l>.2)||(h>70&&h<175&&s>.25&&l>.15),aguila:red,sacerdotisa:red,
  pochteca:(h,s,l,i,F)=>(F.a&&F.a.includes(i))||(l>.78&&s<.3)||(h>190&&h<250&&s>.25&&l>.2)};
 const TOP={pochteca:(h,s,l)=>(l>.8&&s<.5)||((h<20||h>330)&&s>.5&&l>.3)}; // plumas de la cabeza (solo la parte de arriba del sprite)
 const rgbOf=(h,s,l)=>{h/=360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))};return[f(0),f(8),f(4)]};
 let T=hue;if(T&&name!=='pochteca'&&T>300)T=285; // que no se confunda con el rojo original
 return A.frames.map(F=>{const w=F.w+2,h=F.h+2;const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const img=x.createImageData(w,h);
  const b=atob(F.d),P=[];for(let i=0;i<F.p.length;i+=6)P.push([parseInt(F.p.substr(i,2),16),parseInt(F.p.substr(i+2,2),16),parseInt(F.p.substr(i+4,2),16)]);
  let PT=null;if(T){const R=RULE[name],RT=TOP[name];if(RT)PT=P.map(c=>{const[hh,ss,ll]=hsl(c);return RT(hh,ss,ll)?rgbOf(T,ll>.8?.6:Math.max(ss,.55),ll>.8?ll*.8:ll):c});for(let i=0;i<P.length;i++){const[hh,ss,ll]=hsl(P[i]);if(R&&R(hh,ss,ll,i,F)){const wh=ss<.3&&ll>.78;P[i]=rgbOf(T,wh?.55:Math.max(ss,.5),wh?ll*.85:ll)}}}
  const topRows=Math.round(F.h*.28);
  for(let j=0;j<F.h;j++)for(let i=0;i<F.w;i++){const v=b.charCodeAt(j*F.w+i);if(!v)continue;const p=(PT&&j<topRows&&i<F.w*.68?PT:P)[v-1],o=((j+1)*w+i+1)*4;img.data[o]=p[0];img.data[o+1]=p[1];img.data[o+2]=p[2];img.data[o+3]=255}
  x.putImageData(img,0,0);c._pad=0;c._idleN=0;c._atkN=0;c._hero={g0:11,gN:6,fo:17};return c})}
'''
open('/home/claude/heroart.js','w').write(js)
import pickle;pickle.dump(prev,open('/tmp/hr/heroprev.pkl','wb'))
print('bytes',len(js))
