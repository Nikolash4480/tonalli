import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {HorizontalTiltShiftShader} from 'three/examples/jsm/shaders/HorizontalTiltShiftShader.js';
import {VerticalTiltShiftShader} from 'three/examples/jsm/shaders/VerticalTiltShiftShader.js';

function showFail(t){const l=document.getElementById('load');if(l){l.style.display='flex';l.innerHTML='<div class="win" style="max-width:420px;margin:12px;font-family:VT323,monospace;font-size:20px;line-height:1.2">'+t+'</div>'}}
window.addEventListener('error',e=>{if(String(e.message).includes('sin WebGL'))return;showFail('<b style="color:#f0c040">No se pudo iniciar el juego.</b><br>'+(e.message||'Error desconocido'))});
(()=>{const c=document.createElement('canvas');const gl=c.getContext('webgl2')||c.getContext('webgl');if(!gl){showFail('<b style="color:#f0c040">Tu navegador no tiene WebGL activo.</b><br><br>Probá esto:<br>1. En Chrome o Edge, abrí Configuración → Sistema y activá "Usar aceleración de hardware". Reiniciá el navegador.<br>2. Abrí chrome://gpu y fijate si WebGL dice "Hardware accelerated".<br>3. Actualizá los drivers de la placa de video.<br>4. Probá con otro navegador (Firefox, Edge).');throw new Error('sin WebGL')}})();


/* ---------- utilidades ---------- */
let SEED=Math.floor(Math.random()*99999);
const srand=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const R0=srand(SEED);const rnd=()=>R0();
const pick=a=>a[Math.floor(rnd()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

/* ---------- pixel art ---------- */
const PAL={k:'#120c18',y:'#f0c040',Y:'#b8862a',r:'#c8402a',R:'#8a2418',t:'#38c0b0',T:'#1f7f78',g:'#58a848',G:'#2f6b2a',h:'#8ad06a',w:'#f4ecd8',W:'#c8bca0',s:'#d8a27a',S:'#a8704a',b:'#8a5a32',B:'#5a3a1e',u:'#4a7ad0',U:'#2a4a90',n:'#6a6478',N:'#3e3a4a',l:'#b8b4c8',p:'#9a5ac8',P:'#5a3080',o:'#2a2434',x:'#ff3a2a'};
function mk(rows){const w=Math.max(...rows.map(r=>r.length)),h=rows.length;const g=rows.map(r=>[...r.padEnd(w,'.')]);const c=document.createElement('canvas');c.width=w+2;c.height=h+2;const x=c.getContext('2d');const f=(i,j)=>j>=0&&j<h&&i>=0&&i<w&&PAL[g[j][i]];x.fillStyle=PAL.k;for(let j=-1;j<=h;j++)for(let i=-1;i<=w;i++)if(!f(i,j)&&(f(i-1,j)||f(i+1,j)||f(i,j-1)||f(i,j+1)))x.fillRect(i+1,j+1,1,1);for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(PAL[g[j][i]]){x.fillStyle=PAL[g[j][i]];x.fillRect(i+1,j+1,1,1)}return c}
const SPR={
 jaguar:mk(["........................","........Yy.....yY.......",".......yyyyyyyyyyy......","......yykyyyyyykyyy.....",".....yyyyyyyykyyyyyy....",".....wyyyyyyyyyyyyyy....","....wsssSYyyyyyyyyy.....","....skssSYyykyyyyyy.....","....ssssSYyyyyyyyyy.....",".....wwwwyyyyyyyyy......","......yyyyyyyyyyyy...lw.","..TttT.yykyyyyyyyy..lw..",".TtrrtT.yyyyyykyyyylw...",".trryrt.syyyyyyyyyob....",".trryrt.SsyykyyyyBb.....",".TtrrtT..yyyyyyyyy......","..TttT...rRrRrRrRr......",".........yyyy..yyyy.....",".........ykyy..yyky.....",".........yyyY..yyyY.....","........yyyY...yyyY.....","........wwwW...wwwW....."]),
 aguila:mk(["...........wwwww........",".........wwWWWWWww......","........wWbbbbbbbWw.....",".......yywbbbkbbbbW.....","......yyYwbbbbbbbbbW....",".....yyYYsssSbbbbbbW....",".......YskssSbbbbbW.....",".......ssssSSbbbbW......","........sssSbbbbW.......",".......wbbbbbbbbbbw.....","..TttT.bwbwbbbbbbbbw....",".TtuutTbbbbbbbbbbbbbw...",".tuuyutsbbbbbbbbbWWWWw..",".tuuyutSbbbbbbbbbW.WWWw.",".TtuutT.bbbbbbbbb....Ww.","..TttT..uUuUuUuUu.......",".........bbbb..bbbb.....",".........bbbB..bbbB.....",".........bbbB..bbbB.....","........yyyy...yyyy.....","........yyyY...yyyY....."]),
 coyote:mk(["...............n...n....","..............nNn.nNn...",".............nnnnnnnnn..",".............nnnnnnnxnn.",".............nnnnnnnnnnn","............nlnnnnnnnnkn","..n.........nlllnnnwwnn.",".nNn.......nnlllnnwnwn..","..nNn....nnnnnnnnnn.....","...nNnnnnnnpnnnnnnn.....","....nnnnnnpnnnnnnnn.....","....nnNnnnnnnpnnnNnn....","....nnnNnnnnnnnnnnNn....","....nnn.NNnnnnnnn..n....","....nnn...nn....nn......","....nn....nn....nn......","....nn....nn....nn......","...NNN...NNN...NNN......"]),
 ahuizotl:mk(["...............uuuu.....","..............uuuuuu....","......U......uuuuuuwku..",".....UuU.....uuuuuuuuuu.","....U.Uu....UuuuuuwwwUu.","...ss..Uu...UuuuuuuuU...","..sSss..UuuuuuuuuuuU....","...sss...UuuuuuuuuuU....","..........UuuuuuuuuUU...","..........UulluuuuuuUU..","...........UllluuuuuuU..","...........UuuuuuuuuuU..","............Uu..Uu..Uu..","............Uu..Uu..Uu..","...........sss.sss.sss.."]),
 cipactli:mk(["......y...y...y...y.....",".....gGg.gGg.gGg.gGg....","....gggggggggggggggggg..","...ggGggggggggggggggyxg.","..gggggggggggggggggggggg",".ggGgggggggggggggwgwgwgw","gggggggggggggggggxxxxxxx",".ggghhhhhhhhhhggwgwgwgwg","..gghhhhhhhhhhhhggggggg.","...ghhhhhhhhhhhggggg....","....gGgg...gGgg...gGg...","....gGg.....gGg....gG...","...yyy.....yyy....yyy..."])
};
function enhance(src){
 const w=src.width,h=src.height,d=src.getContext('2d').getImageData(0,0,w,h).data;
 const get=(i,j)=>{if(i<0||j<0||i>=w||j>=h)return null;const o=(j*w+i)*4;return d[o+3]?[d[o],d[o+1],d[o+2]]:null};
 const eq=(a,b)=>a===b||(a&&b&&a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]);
 const W=w*2,H=h*2,g=new Array(W*H).fill(null);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const P=get(i,j),A=get(i,j-1),B=get(i+1,j),C=get(i-1,j),D=get(i,j+1);
  let p1=P,p2=P,p3=P,p4=P;if(P){if(eq(C,A)&&!eq(C,D)&&!eq(A,B)&&A)p1=A;if(eq(A,B)&&!eq(A,C)&&!eq(B,D)&&B)p2=B;if(eq(D,C)&&!eq(D,B)&&!eq(C,A)&&C)p3=C;if(eq(B,D)&&!eq(B,A)&&!eq(D,C)&&D)p4=D}
  g[2*j*W+2*i]=p1;g[2*j*W+2*i+1]=p2;g[(2*j+1)*W+2*i]=p3;g[(2*j+1)*W+2*i+1]=p4}
 const at=(i,j)=>i<0||j<0||i>=W||j>=H?null:g[j*W+i];
 const isK=c=>c&&c[0]===18&&c[1]===12&&c[2]===24;
 const solid=(i,j)=>{const c=at(i,j);return!!c&&!isK(c)};
 const mix=(a,b,t)=>a.map((v,k)=>Math.round(v+(b[k]-v)*t));
 const out=document.createElement('canvas');out.width=W;out.height=H;const x=out.getContext('2d');const img=x.createImageData(W,H);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){let c=at(i,j);if(!c)continue;
  if(isK(c)){const ext=!at(i-1,j)||!at(i+1,j)||!at(i,j-1)||!at(i,j+1);if(ext){const n=[[0,-1],[0,1],[-1,0],[1,0],[1,1],[-1,-1]].map(([a,b])=>at(i+a,j+b)).find(q=>q&&!isK(q));if(n)c=mix(n,[16,8,28],.72)}}
  else{const ul=!solid(i-1,j-1)||!solid(i,j-2)||!solid(i-2,j);const dr=!solid(i+1,j+1)||!solid(i,j+2)||!solid(i+2,j);
   const ao=1-.16*(j/H);c=c.map(v=>v*ao);
   if(dr&&!ul)c=mix(c.map(v=>v*.74),[42,24,64],.22);else if(dr&&ul&&(i+j)%2)c=mix(c.map(v=>v*.85),[42,24,64],.12);
   if(ul&&!dr)c=mix(c.map(v=>Math.min(255,v*1.18)),[255,240,208],.2);
   c=c.map(v=>clampC(v))}
  const o=(j*W+i)*4;img.data[o]=c[0];img.data[o+1]=c[1];img.data[o+2]=c[2];img.data[o+3]=255}
 x.putImageData(img,0,0);return out;
}
const clampC=v=>Math.max(0,Math.min(255,Math.round(v)));
function pixTex(draw,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;return t}
function noiseTex(cols,extra,w=32,h=32){return pixTex((x,W,H)=>{const r=srand(cols.join('').length*97+W);for(let j=0;j<H;j++)for(let i=0;i<W;i++){const n=r();x.fillStyle=cols[n<.55?0:n<.85?1:2];x.fillRect(i,j,1,1)}if(extra)extra(x,r,W,H)},w,h)}

/* ---------- mapa ---------- */
const TERR={M:{name:'Milpa',h:.55},S:{name:'Selva',h:.65},C:{name:'Cerro',h:1.05},V:{name:'Volcán',h:1.35},L:{name:'Lago',h:.22,water:true},X:{name:'Ciudad',h:.6,city:true},K:{name:'Teocalli Mayor',h:.7,city:true}};
const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const FLOWERS=[[0,0],[2,1],[-1,3],[-3,2],[-2,-1],[1,-3],[3,-2]];
const key=(q,r)=>q+','+r;
const nbrs=(m,h)=>DIRS.map(([a,b])=>m.get(key(h.q+a,h.r+b))).filter(Boolean);
function genMap(){
 for(let tries=0;tries<500;tries++){
  const hexes=new Map();
  FLOWERS.forEach(([fq,fr],fi)=>{const bag=shuffle(['M','M','S','S','C','C','V','L','M','S','L']).slice(0,7);
   [[0,0],...DIRS].forEach(([dq,dr],i)=>{let t=bag[i];if(fi===0)t=i===0?'K':(t==='L'||t==='V'?pick(['M','S']):t);hexes.set(key(fq+dq,fr+dr),{q:fq+dq,r:fr+dr,t,fi})})});
  let placed=0;for(const fi of shuffle([1,2,3,4,5,6])){if(placed>=3)break;const c=shuffle([...hexes.values()].filter(h=>h.fi===fi&&h.t!=='L'&&!nbrs(hexes,h).some(n=>TERR[n.t].city)));if(c.length){c[0].t='X';placed++}}
  if(placed<3)continue;
  const land=[...hexes.values()].filter(h=>!TERR[h.t].water);const seen=new Set([key(land[0].q,land[0].r)]),st=[land[0]];
  while(st.length){const h=st.pop();for(const n of nbrs(hexes,h))if(!TERR[n.t].water&&!seen.has(key(n.q,n.r))){seen.add(key(n.q,n.r));st.push(n)}}
  if(seen.size!==land.length)continue;
  const cnt=t=>[...hexes.values()].filter(h=>h.t===t).length;if(cnt('V')<2||cnt('C')<3||cnt('L')<2)continue;
  return hexes;
 }
}
const hexes=genMap();
const RAD=1,SQ=Math.sqrt(3);
const wx=h=>RAD*SQ*(h.q+h.r/2),wz=h=>RAD*1.5*h.r;

/* ---------- escena ---------- */
const canvas=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(30,1,0.5,200);
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;controls.minPolarAngle=.55;controls.maxPolarAngle=1.12;controls.minDistance=9;controls.maxDistance=34;controls.screenSpacePanning=false;controls.target.set(0,.5,0);
camera.position.set(0,17,17);

const hemi=new THREE.HemisphereLight(0xbcd8ff,0x6a5a3a,1);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d6,2.4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
const sc=sun.shadow.camera;sc.left=-13;sc.right=13;sc.top=13;sc.bottom=-13;sc.near=1;sc.far=60;sun.shadow.bias=-0.0008;sun.shadow.normalBias=.03;sun.shadow.radius=3;
scene.add(sun);scene.add(sun.target);

/* texturas */
const TOP={
 M:noiseTex(['#c8a845','#bf9d3c','#d2b24e'],(x,r)=>{for(let j=2;j<32;j+=5)for(let i=0;i<32;i++){if(r()<.7){x.fillStyle=r()<.5?'#6f9a2e':'#88b040';x.fillRect(i,j,1,1)}}}),
 S:noiseTex(['#2d5e32','#27542c','#3a7040'],(x,r)=>{for(let i=0;i<14;i++){x.fillStyle='#4f8f3f';x.fillRect(r()*32|0,r()*32|0,2,1)}for(let i=0;i<4;i++){x.fillStyle='#ff7aa8';x.fillRect(r()*32|0,r()*32|0,1,1)}}),
 C:noiseTex(['#8a7a64','#7e6e58','#9a8a72'],(x,r)=>{for(let i=0;i<10;i++){const a=r()*30|0,b=r()*30|0;x.fillStyle='#b0a690';x.fillRect(a,b,2,1);x.fillStyle='#5a5248';x.fillRect(a,b+1,2,1)}}),
 V:noiseTex(['#4a3c40','#3e3236','#56464a'],(x,r)=>{for(let i=0;i<8;i++){x.fillStyle='#2a2024';x.fillRect(r()*32|0,r()*32|0,2,2)}}),
 X:noiseTex(['#b8a47e','#ac986f','#c2ae88'],(x)=>{x.fillStyle='rgba(80,60,40,.35)';for(let j=0;j<32;j+=4){x.fillRect(0,j,32,1);for(let i=(j%8?2:0);i<32;i+=4)x.fillRect(i,j,1,4)}}),
};
TOP.K=TOP.X;
const waterTex=noiseTex(['#2a6ea8','#2864a0','#3278b2'],(x,r)=>{for(let i=0;i<16;i++){x.fillStyle='#7ec0ec';x.fillRect(r()*30|0,r()*32|0,3,1)}});waterTex.wrapS=waterTex.wrapT=THREE.RepeatWrapping;
const sideTex=pixTex((x,W,H)=>{const r=srand(5);for(let j=0;j<H;j++)for(let i=0;i<W;i++){const n=r();x.fillStyle=j<2?(n<.5?'#5a8a3a':'#4a7a2e'):(j%6===0?'#5a3e26':n<.6?'#7a5434':'#6a4a2e');x.fillRect(i,j,1,1)}for(let i=0;i<10;i++){x.fillStyle='#9a8a74';x.fillRect(r()*W|0,4+(r()*(H-5)|0),2,1)}},32,16);
sideTex.wrapS=sideTex.wrapT=THREE.RepeatWrapping;
const sideRock=sideTex.clone();sideRock.needsUpdate=true;
const sideMat=new THREE.MeshStandardMaterial({map:sideTex,roughness:1});
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.95,flatShading:true},o));
const MAT={trunk:M(0x5a3a1e),leaf:M(0x3f8f4f),leaf2:M(0x2d6a36),leafHi:M(0x6ab04a),corn:M(0x4f8a2e),cob:M(0xf0c040),rock:M(0x9a9282),rock2:M(0x7a7266),ash:M(0x3a2e32),lava:M(0xff5a20,{emissive:0xff4a10,emissiveIntensity:2.2}),step1:M(0xa84a30),step2:M(0xc05a3a),stair:M(0xe8dcc0),gold:M(0xf0c040,{metalness:.3,roughness:.5}),blue:M(0x4a7ad0),red:M(0xc8402a),door:M(0x120c18,{emissive:0xff9a30,emissiveIntensity:0}),post:M(0x4a3020),flame:M(0xffa030,{emissive:0xff7a20,emissiveIntensity:0}),pad:M(0x3f8f4f),flower:M(0xff7aa8)};
const BOX=new THREE.BoxGeometry(1,1,1);
function box(mat,w,h,d,x,y,z,ry=0,parent){const m=new THREE.Mesh(BOX,mat);m.scale.set(w,h,d);m.position.set(x,y+h/2,z);m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}

const world=new THREE.Group();scene.add(world);
const pickables=[];const torches=[];const lavas=[];const waters=[];
for(const h of hexes.values()){
 const T=TERR[h.t];const g=new THREE.Group();g.position.set(wx(h),0,wz(h));world.add(g);h.g=g;h.top=T.h;
 const rr=srand(h.q*131+h.r*71+SEED);
 const geo=new THREE.CylinderGeometry(RAD*.97,RAD*.97,T.h,6,1);geo.translate(0,T.h/2,0);
 let topMat;
 if(T.water){topMat=new THREE.MeshStandardMaterial({map:waterTex,roughness:.15,metalness:.1,transparent:true,opacity:.88,emissive:0x0a2a50,emissiveIntensity:.4});waters.push(topMat)}
 else topMat=new THREE.MeshStandardMaterial({map:TOP[h.t],roughness:1});
 const sm=sideMat.clone();sm.map=sideTex.clone();sm.map.needsUpdate=true;sm.map.repeat.set(6,Math.max(1,T.h*2.2));
 const mesh=new THREE.Mesh(geo,[sm,topMat,sm]);mesh.receiveShadow=true;mesh.castShadow=true;mesh.userData.hex=h;g.add(mesh);pickables.push(mesh);
 const y=T.h;h.stand=T.city?[0,.62]:h.t==='V'?[0,.4]:[0,.05];const spot=()=>{for(let k=0;k<20;k++){const a=rr()*Math.PI*2,d=.18+Math.sqrt(rr())*.5;const x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x-h.stand[0],z-h.stand[1])>.36)return[x,z]}return[.5,-.3]};
 if(h.t==='S')for(let i=0;i<4;i++){const[x,z]=spot();const s=.8+rr()*.5;box(MAT.trunk,.09*s,.32*s,.09*s,x,y,z,0,g);box(rr()<.5?MAT.leaf:MAT.leaf2,.42*s,.26*s,.42*s,x,y+.28*s,z,rr()*3,g);box(MAT.leafHi,.28*s,.2*s,.28*s,x,y+.5*s,z,rr()*3,g)}
 if(h.t==='S'&&rr()<.6){const[x,z]=spot();box(MAT.flower,.06,.06,.06,x,y,z,0,g)}
 if(h.t==='M')for(let i=0;i<10;i++){const[x,z]=spot();const s=.7+rr()*.5;box(MAT.corn,.035,.36*s,.035,x,y,z,0,g);box(MAT.cob,.05,.09,.05,x+.02,y+.2*s,z,0,g)}
 if(h.t==='C')for(let i=0;i<4;i++){const[x,z]=spot();const s=.6+rr()*.8;box(rr()<.5?MAT.rock:MAT.rock2,.3*s,.2*s,.26*s,x,y,z,rr()*3,g)}
 if(h.t==='V'){const cone=new THREE.Mesh(new THREE.CylinderGeometry(.14,.5,.9,8),MAT.ash);cone.position.set(0,y+.45,-.3);cone.castShadow=cone.receiveShadow=true;g.add(cone);
  const lv=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.05,8),MAT.lava);lv.position.set(0,y+.9,-.3);g.add(lv);
  const pl=new THREE.PointLight(0xff6a20,2,4,1.6);pl.position.set(0,y+1.2,-.3);g.add(pl);lavas.push(pl);h.smokeY=y+.95}
 if(h.t==='L')for(let i=0;i<2;i++){const[x,z]=spot();const p=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.02,7),MAT.pad);p.position.set(x*.8,y+.01,z*.8);g.add(p)}
 if(T.city){const big=h.t==='K';const n=big?5:4;let w=big?1.25:1;let yy=y;
  for(let i=0;i<n;i++){box(i%2?MAT.step2:MAT.step1,w,.13,w,0,yy,0,0,g);yy+=.13;w-=big?.2:.19}
  box(MAT.stair,.16,.13*n,.2,0,y,.5*(big?1.25:1)-.1,0,g);
  if(big){[[-.18,MAT.blue],[.18,MAT.red]].forEach(([dx,m])=>{box(m,.24,.22,.24,dx,yy,0,0,g);box(MAT.door,.08,.12,.02,dx,yy,.12,0,g);box(MAT.gold,.26,.05,.26,dx,yy+.22,0,0,g)})}
  else{box(MAT.gold,.3,.22,.3,0,yy,0,0,g);box(MAT.door,.1,.13,.02,0,yy,.15,0,g);box(MAT.blue,.34,.04,.34,0,yy+.22,0,0,g)}
  for(const sx of [-.62,.62]){box(MAT.post,.05,.3,.05,sx,y,.3,0,g);box(MAT.flame,.08,.08,.08,sx,y+.3,.3,0,g)}
  const pl=new THREE.PointLight(0xff9a40,0,5,1.5);pl.position.set(0,y+.7,.5);g.add(pl);torches.push(pl);
  h.name=big?'Teocalli Mayor':pick(['Xalpan','Itzapan','Tecolco','Ayotla'])}
 if(!T.water&&!T.city&&h.t!=='V')for(let i=0;i<3;i++){const[x,z]=spot();box(MAT.leafHi,.04,.06,.04,x,y,z,0,g)}
}

/* sprites billboard */
/* Senda del Jaguar · sprites pixel art v3 (rig por partes, paletas de 3 tonos) */
const PAL3={
 k:'#120c18',q:'#3a2410',
 1:'#f2c8a0',2:'#d89a6c',3:'#a86a44',
 Y:'#ffe070',y:'#eab038',o:'#b07418',
 R:'#f06a50',r:'#c83a28',d:'#7a2018',
 T:'#7ae8d8',t:'#30b0a0',j:'#186e68',
 w:'#f4ecd8',v:'#b8ac90',W:'#ffffff',
 G:'#fff2a8',g:'#f0c040',h:'#a87a1a',
 B:'#b88050',b:'#7a4e2a',n:'#4a2e18',
 x:'#2a2434',z:'#4a4060',O:'#9a8ac8',
 C:'#d09a60',c:'#8a5a30',i:'#5a3818',
 U:'#9ac0ff',u:'#4a7ad0',m:'#2a4a90',
 A:'#c8c0d0',a:'#8a8298',s:'#4e4860',
 P:'#d0a0ff',p:'#8a4ad0',X:'#ff3a2a',
 E:'#a8e878',e:'#58a848',f:'#2a6a2a',F:'#1a4a20',
 N:'#6a8ac8',M:'#34508a',L:'#1c2c58'
};
/* versión más oscura de cada letra (para la pierna o pata lejana) */
const DARKER={Y:'y',y:'o',o:'q',R:'r',r:'d',T:'t',t:'j',G:'g',g:'h',B:'b',b:'n',C:'c',c:'i',U:'u',u:'m',A:'a',a:'s',E:'e',e:'f',f:'F',N:'M',M:'L',1:'2',2:'3',w:'v'};

const PARTS={
 jagBody:[
 "........ko......ok......xO......",
 ".......oYyo....oYyo.....xzO.....",
 ".......oyyyooooyyyo.....xzOx....",
 "......oYYyyyyyyyyyyo....xzOx....",
 ".....oYYyqyyyyyqyyyyo...xzOx....",
 "....oYYyyyyyyqyyyyyyo...xzOx....",
 "...oYyyyyyyyyyyyyqyyyo..xzOx....",
 "..wvwvwYyyyqyyyyyyyyyo..xzOx....",
 ".w111112yyyyyyyyqyyyo...xzOx....",
 ".11W11122yyyyyyyyyyyo...xzOx....",
 "1kWk11223yyqyyyyyyyo...nBBbn....",
 ".111112233yyyyyyyyo.....nbbn....",
 ".21112233yyyyyqyyo......nbn.....",
 "..wvw3wvyyyyyyyyyo......nbn.....",
 "...yyyyyyyyyyyyyyyo...12221.....",
 "..jttj.yyqyyyyyyyyyo.122223.....",
 ".jtTTtj.yyyyyyqyyyyyy2223.......",
 "jtTRRRtj1yyyyyyyyyyyyo..........",
 "jtRgGgRj11yyqyyyyyyyo...........",
 "jtRgggRj12yyyyyyyyyyo...........",
 "jtTRRRtj2yyyyyqyyyyyo...........",
 ".jtTTtj.oyyyyyyyyyyo............",
 "..jttj..oyqyyyyyyyyo............",
 "........rRRRRRRRRRRr............",
 "........rgrrgrrgrrgr............",
 ".........RrrrrrrrrR.............",
 "..........rRrrrrRr..............",
 "...........rrrrrr...............",
 "............rddr................"],
 jagLeg:["yyyyy.","yYyqy.","yyyyo.","yqyyo.","yyyyo.",".yyqo.",".yyyo.",".yyyo.",".qyyo.",".yyyo.",".BbbB.","BBbbbb","nnnnnn"],
 eagBody:[
 "..........iiccc.................",
 "........iccCCCcci...............",
 ".......icCCCCCCcci...........xO.",
 "......iCCWWCCCccci..........xzO.",
 "....hgGCCWkCCCcccci........xz...",
 "..hgGGgCCCCCCcccccci.......b....",
 "...hhgggh111ccccccci......b.....",
 "......h1k1112ccccci......b......",
 "......111122cccccci.....b.......",
 "......11112223ccci.....b........",
 ".......1122233cci.....b.........",
 "......wCwCwCwCcccci..b..........",
 ".....cCcCcCcCcccccci2b..........",
 "....cCcCcccccccccccc223.........",
 "...cCcccccCccccccccc2...........",
 "..mmmm.cccccCcccccci............",
 ".mUUUum.ccccccccccci............",
 "muUwwUum1cccCcccccci............",
 "muwgGwum11ccccccccci............",
 "muwgggum12cccccCcci.............",
 "muUwwUum2cccccccccci............",
 ".mUUUum.icccccccccci............",
 "..mmmm..iccCcccccci.............",
 "........uUUUUUUUUUUu............",
 "........ugugguggugug............",
 ".........UuuuuuuuuU.............",
 "..........uUuuuuUu..............",
 "...........uuuuuu...............",
 "............ummu................"],
 eagLeg:["ccccc.","cCcCc.","cccci.","cCcci.","cccci.",".ccci.",".1223.",".1223.",".1223.",".1223.",".gGgh.","gGgggh","nnnnnn"],
 coyBody:[
 "..............................a....a....",
 ".............................aAa..aAa...",
 "............................aAAaaaAAa...",
 "............................aAAAAAAaa...",
 "...........................aAAAAXAAAa...",
 "...........................aAAAAAAAAAAa.",
 "..........................saAAAAAAAAAkk.",
 "..as.....................saAAAAAAwwAa...",
 ".aAas...................saaaAAAwAwAa....",
 ".aAAas.............saaaaaaaaaAAAAa......",
 "..aAAas......saaaaaAAAAAAAAAAaaa........",
 "...aAAassaaaaAAAAAAAAPAAAAAAAAa.........",
 "....aaAAAAAAAAAAAAAAPAAAAAAAAAa.........",
 ".....saAAAAAAAAAAPPAAAAAAAAAAAa.........",
 "......saAAAAAAAAAAAAAAAAPAAAAAa.........",
 "......saaAAAAAAAAAAAAAAPAAAAAa..........",
 "......ssaaaaaaaaaaaaaaaaaaaaas..........",
 ".......sssaaaaaaaaaaaaaaaaass..........."],
 coyLeg:["aaa.","aAa.","aAa.","aaa.",".aa.",".aa.",".aa.",".as.","sss."],
 ahuBody:[
 "...........................MMMM.....",
 "..........................MNNNMM....",
 ".........................MNNNNNMM...",
 "........1...............MNNNWkNNMM..",
 ".......121..............MNNNNNNNNMM.",
 "......12221.............MNNNNNNNNNNk",
 "......2232..............LMNNNNNwwwM.",
 ".......2L...............LMMNNNNMMM..",
 "........LL.............LLMMMMMML....",
 ".........LML.........LLMMNNNNNML....",
 "..........LMMLLLLLLLMMMNNNNNNNNML...",
 "...........LMMMMMMMMMNNNNNNNNNNNML..",
 "............LMMMMMMMNNNNNNNNNNNNML..",
 ".............LMMMMMMMMMMMMMMMMMMML..",
 "..............LLLLLLLLLLLLLLLLLL...."],
 ahuLeg:["MM.","MN.","MM.","LM.","LM.","11."],
 cipBody:[
 "..........................g...g...g...g.........................",
 "....................g...gGg.gGg.gGg.gGg...g......................",
 "...................gGg.eEEEeeEEEeeEEEeeEEgGg.....................",
 ".................eeEEEEEEEEEEEEEEEEEEEEEEEEee...EEee.............",
 "..............eeEEEEEEEEEEEEEEEEEEEEEEEEEEEEEeeeEEEEEee..........",
 "...........eeeEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEgXEEEeee........",
 ".......eeeeeeEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEeee...",
 "...eeeeeeeeeeeeeeeEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEwEwEwEwEwEweE.",
 "eeeefffffffeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeedXdXdddddddd",
 ".fff.....fffffYYYYYYYYYYYYYYYYYYYYYYYYYYYYfffeeeeeeewewewewewewe.",
 "...........ffYyYyYyYyYyYyYyYyYyYyYyYyYyYyYfffffeeeeeeeeeeeeeee..",
 "............ffyyyyyyyyyyyyyyyyyyyyyyyyyyyyyffff..fffffffffff.....",
 ".............ffffffffffffffffffffffffffffff......................"],
 cipLeg:["eEEe..","eEEe..",".eEe..",".eef..","..ef..",".ffff.","w.w.w."]
};

PARTS.cipBody=(()=>{const W=60,H=24,g=Array.from({length:H},()=>Array(W).fill('.'));
 const set=(x,y,c)=>{if(x>=0&&y>=0&&x<W&&y<H)g[y][x]=c};
 for(let x=0;x<W;x++)for(let y=0;y<H;y++){
  let inside=false,top=0,bot=0;
  const ex=(x-25)/22,eyy=(y-14)/7.5;if(ex*ex+eyy*eyy<=1){inside=true;top=14-7.5*Math.sqrt(1-ex*ex);bot=14+7.5*Math.sqrt(1-ex*ex)}
  if(x<8){const t=x/8;const hw=1+t*2.5;if(Math.abs(y-15)<=hw){inside=true;top=15-hw;bot=15+hw}}
  if(x>=42&&x<59&&y>=6&&y<=11+(x<50?3:0)){inside=true;top=6+(x>52?Math.round((x-52)*.5):0);bot=14}
  if(x>=44&&x<57&&y>=14&&y<=17){inside=true;top=13;bot=17}
  if(x>52&&y<6+Math.round((x-52)*.5))inside=false;
  if(!inside)continue;
  const n=(y-top)/Math.max(1,bot-top);
  let c=n<.22?'E':n<.6?'e':n<.82?'f':'F';
  if(x>8&&x<41&&n>.68&&y>=15)c=(y%2?'Y':'y');if(x>8&&x<41&&y===Math.round(bot))c='o';
  if(c==='e'&&((x+y*2)%5===0)&&n<.5)c='f';
  set(x,y,c);
 }
 for(let x=45;x<59;x++){set(x,12,'d');set(x,13,'d')}
 for(let x=46;x<59;x+=2){set(x,11,'w');set(x,14,'w')}
 set(58,12,'d');set(58,13,'X');
 set(50,7,'g');set(51,7,'G');set(50,8,'X');set(51,8,'g');for(let x=48;x<54;x++)set(x,6,'F');set(57,8,'k');
 for(let x=10;x<44;x+=5){const tb=Math.round(14-7.5*Math.sqrt(Math.max(0,1-((x-25)/22)**2)));set(x,tb-1,'h');set(x+1,tb-1,'g');set(x+1,tb-2,'G');set(x+2,tb-1,'g');set(x+1,tb-3,'G')}
 return g.map(r=>r.join(''));
})();
PARTS.cipLeg=["eEEe..","eEEee.","eeEee.",".eeef.",".eeff.","feffff","w.w.w."];

PARTS.sacBody=[
 "........e.E.e.E.e...............",
 ".......eEeEeEeEeEe..............",
 "......fEeEeEeEeEeEf......gG.....",
 "......YyYyYyYyYyYyo.....gTTg....",
 "......ooooooooooooo....gTjjTg...",
 ".......1112222nnnnn.....gTTg....",
 "......11W12222nnnnnn.....bg.....",
 "......1kW12223nnnnnn.....b......",
 ".......1112223nnnnn......b......",
 "......2112233nnnnnn......b......",
 ".......22233.nnnnnn......b......",
 "........wGgGgw.nnnn......b......",
 "......tTTTTTTTTtnnn.....1b......",
 ".....tTTtttttttTtn.....12b......",
 "....tTtttttttttttTt..122b.......",
 "...tTttgttttttttttTt122.b.......",
 "...12tttgGgtttttttttt...b.......",
 "...223tttgtttttttttTt...b.......",
 ".......ttttttttttttTt...b.......",
 "......tTtttttttttttTt...b.......",
 "......tttttttttttttTj...b.......",
 ".....tTttttttttttttTj...b.......",
 ".....ttttttttttttttjj...b.......",
 ".....wGwGwGwGwGwGwGwj...b.......",
 "....tttttttttttttttjj...b.......",
 "....tTttttttttttttTjj...b.......",
 "....ttttttttttttttjjj...b.......",
 "...tTtttttttttttttTjj...n.......",
 "...tttttttttttttttjjjj..........",
 "...jjjjjjjjjjjjjjjjjj..........."];
PARTS.sacLeg=["1222.","nnnnn"];
PARTS.pocBody=[
 ".......rRRRRRr..................",
 "......rRRRRRRRd.....BBBBBBBBB...",
 "......nnnnnnnnnn....BbbbbbbbBn..",
 ".....1111122nnnnn...BwwvwwvwBn..",
 ".....11W1122nnnnn...BvwwwvwwBn..",
 "....1kW11222nnnn....BwwvwwvwBn..",
 ".....111122233nn....BbbbbbbbBn..",
 ".....1112222333.....BCCcCCcCBn..",
 "......11122233......BCcCCcCCBn..",
 ".......1222........BBbbbbbbbBn..",
 ".....wwwwwwwwwww...BnnnnnnnnBn..",
 "....wWwwwwwwwwwwv..B........Bn..",
 "...wWwwwRRRRwwwwwvBB........Bn..",
 "..1wWwwwwwwwwwwwwvB.............",
 ".12wwwwwwwwwwwwwwvB.............",
 "122.wWwwwwwwwwwwwv..............",
 "Gg..wwwwwwwwwwwwwv..............",
 "GgG.wWwwwwwwwwwwwv..............",
 "gGg.wwwwwwwwwwwwwv..............",
 ".g..wWwwwwwwwwwwvv..............",
 "....wwwwwwwwwwwwvv..............",
 "....rRrRrRrRrRrRrr..............",
 ".....rrrrrrrrrrrrr..............",
 "......wwwwwwwwwwv...............",
 "......wWwwwwwwwvv..............."];
PARTS.pocLeg=["1222.","1223.","1223.","1223.","1223.","1223.","1223.",".223.","BbbB.","nnnnn"];
/* definición de cada personaje: cuerpo, pata, posiciones de patas, tamaño */
const CHARS={
 jaguar:{w:32,h:38,body:'jagBody',leg:'jagLeg',legY:24,legs:[{x:14,far:true},{x:9}],biped:true},
 aguila:{w:32,h:38,body:'eagBody',leg:'eagLeg',legY:24,legs:[{x:14,far:true},{x:9}],biped:true},
 sacerdotisa:{w:32,h:32,body:'sacBody',leg:'sacLeg',legY:29,legs:[{x:13,far:true},{x:8}],biped:true},
 pochteca:{w:32,h:35,body:'pocBody',leg:'pocLeg',legY:23,legs:[{x:11,far:true},{x:7}],biped:true},
 coyote:{w:40,h:27,body:'coyBody',leg:'coyLeg',legY:16,legs:[{x:10,far:true},{x:25,far:true},{x:7},{x:22}],biped:false,bodyY:0},
 ahuizotl:{w:36,h:21,body:'ahuBody',leg:'ahuLeg',legY:14,legs:[{x:17,far:true},{x:29,far:true},{x:14},{x:26}],biped:false,hop:true},
 cipactli:{w:60,h:28,body:'cipBody',leg:'cipLeg',legY:19,legs:[{x:16,far:true},{x:38,far:true},{x:12},{x:34}],biped:false}
};
/* fotogramas: 0-1 reposo, 2-5 caminata */
function framePose(ch,f){
 const walk=f>=2,ph=f-2;
 const pose={bodyDy:0,legs:[]};
 if(!walk)pose.bodyDy=f===1?1:0;
 else pose.bodyDy=(ph%2===1)?-1:0;
 if(ch.hop&&walk)pose.bodyDy=[0,-3,-2,0][ph];
 ch.legs.forEach((L,i)=>{
  let dx=0,dy=0;
  if(walk){
   const phase=ch.biped?(i===0?0:2):((i%2)===((i>>1)&1)?0:2);
   const p=(ph+phase)%4;
   dx=[-2,0,2,0][p];dy=[0,-1,0,0][p];
   if(ch.hop){dx=0;dy=[0,-2,-1,0][ph]}
  }
  pose.legs.push({dx,dy});
 });
 return pose;
}
function composeFrame(name,f){
 const ch=CHARS[name],pose=framePose(ch,f);
 const H=ch.h+2;
 const g=Array.from({length:H},()=>Array(ch.w).fill('.'));
 const stamp=(rows,x,y,dark)=>rows.forEach((r,j)=>[...r].forEach((c,i)=>{if(c==='.')return;const X=x+i,Y=y+j;if(X<0||Y<0||X>=ch.w||Y>=H)return;g[Y][X]=dark?(DARKER[c]||c):c}));
 const leg=PARTS[ch.leg];
 ch.legs.forEach((L,i)=>{if(L.far)stamp(leg,L.x+pose.legs[i].dx,ch.legY+1+pose.legs[i].dy,true)});
 stamp(PARTS[ch.body],0,1+pose.bodyDy,false);
 ch.legs.forEach((L,i)=>{if(!L.far)stamp(leg,L.x+pose.legs[i].dx,ch.legY+1+pose.legs[i].dy,false)});
 return g.map(r=>r.join(''));
}
/* contorno selectivo + oclusión suave + luz de borde */
function renderRows(rows){
 const w=rows[0].length,h=rows.length,W=w+2,H=h+2;
 const at=(i,j)=>(i<0||j<0||i>=w||j>=h)?'.':rows[j][i];
 const hex2=c=>[1,3,5].map(k=>parseInt(c.slice(k,k+2),16));
 const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');const img=x.createImageData(W,H);
 const put=(i,j,rgb)=>{const o=(j*W+i)*4;img.data[o]=rgb[0];img.data[o+1]=rgb[1];img.data[o+2]=rgb[2];img.data[o+3]=255};
 const mix=(a,b,t)=>a.map((v,k)=>Math.round(v+(b[k]-v)*t));
 for(let j=-1;j<=h;j++)for(let i=-1;i<=w;i++){
  const ch=at(i,j);
  if(ch==='.'){
   const n=[[0,-1],[0,1],[-1,0],[1,0]].map(([a,b])=>at(i+a,j+b)).find(q=>q!=='.'&&q!=='k');
   const any=[[0,-1],[0,1],[-1,0],[1,0]].some(([a,b])=>at(i+a,j+b)!=='.');
   if(any)put(i+1,j+1,n?mix(hex2(PAL3[n]),[16,8,28],.78):hex2(PAL3.k));
   continue;
  }
  let rgb=hex2(PAL3[ch]||'#ff00ff');
  const top=at(i,j-1)==='.'||at(i-1,j)==='.';
  if(top&&ch!=='k'&&ch!=='q')rgb=mix(rgb,[255,244,214],.22);
  const btm=at(i+1,j)==='.'||at(i,j+1)==='.'||at(i+1,j+1)==='.';
  if(btm&&!top&&ch!=='k'&&ch!=='q')rgb=mix(rgb.map(v=>v*.78),[42,24,64],.2);
  rgb=rgb.map(v=>Math.round(v*(1-.12*(j/h))));
  put(i+1,j+1,rgb);
 }
 x.putImageData(img,0,0);return c;
}
function buildFrames(name){return[0,1,2,3,4,5].map(f=>renderRows(composeFrame(name,f)))}

const billboards=[];
function makeBillboard(key,scale=1,ringCol=0xff4a3a){
 const canv=buildFrames(key);
 const frames=canv.map(c=>{const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;return t});
 const c=canv[0];const u=.03*scale,w=c.width*u,h=c.height*u;
 const geo=new THREE.PlaneGeometry(w,h);geo.translate(0,h/2-u,0);
 const mat=new THREE.MeshStandardMaterial({map:frames[0],alphaTest:.5,side:THREE.DoubleSide,roughness:1,emissive:0xffffff,emissiveMap:frames[0],emissiveIntensity:.22});
 const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.userData.mat=mat;
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(Math.min(w,1.2)*.34,16),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.4,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;
 const g=new THREE.Group();g.add(shadow);g.add(m);
 const rw=Math.min(w,1.2);const ring=new THREE.Mesh(new THREE.RingGeometry(rw*.3,rw*.38,24),new THREE.MeshBasicMaterial({color:ringCol,transparent:true,opacity:.85,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.016;g.add(ring);g.userData.ring=ring;g.userData.spr=m;g.userData.frames=frames;g.userData.faceLeft=(key==='jaguar'||key==='aguila');g.userData.flip=1;g.userData.walk=false;g.userData.off=Math.random()*3;scene.add(g);billboards.push(g);return g;
}
const slotPos0=(h,slot)=>new THREE.Vector3(wx(h)+h.stand[0]+slot,h.top,wz(h)+h.stand[1]);
const place=(obj,h,slot=0)=>{obj.position.copy(slotPos0(h,slot));obj.userData.hex=h};
const all=[...hexes.values()];
const capital=all.find(h=>h.t==='K');
const hero=makeBillboard('jaguar',1,0xf0c040);place(hero,capital,-.34);
const ally=makeBillboard('aguila',1,0x38c0b0);place(ally,capital,.34);
const free=f=>shuffle(all.filter(h=>f(h)&&!TERR[h.t].city&&!TERR[h.t].water&&h!==capital&&!billboards.some(b=>b.userData.hex===h)));
const coy=makeBillboard('coyote');place(coy,free(h=>h.t==='S'||h.t==='M')[0]);
const ahu=makeBillboard('ahuizotl');place(ahu,free(h=>nbrs(hexes,h).some(n=>n.t==='L'))[0]);
const cip=makeBillboard('cipactli',.85);const vh=free(h=>h.t==='V')[0];place(cip,vh);

/* marcadores */
const arrowTex=pixTex((x)=>{const rows=["kkkkkkk","kyyyyyk",".kyyyk.","..kyk..","...k..."];rows.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch!=='.'){x.fillStyle=ch==='k'?'#120c18':'#f0c040';x.fillRect(i,j,1,1)}}))},7,5);
const arrow=new THREE.Sprite(new THREE.SpriteMaterial({map:arrowTex,depthTest:false,transparent:true}));arrow.scale.set(.28,.2,1);arrow.renderOrder=10;scene.add(arrow);
const ringGeo=new THREE.RingGeometry(RAD*.78,RAD*.9,6);ringGeo.rotateX(-Math.PI/2);ringGeo.rotateY(Math.PI/6);
const ringMat=new THREE.MeshBasicMaterial({color:0xf0c040,transparent:true,opacity:.8,depthWrite:false});


/* partículas */
function points(n,size,color,opacity,blend){const g=new THREE.BufferGeometry();const p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=(rnd()-.5)*16;p[i*3+1]=rnd()*3+.6;p[i*3+2]=(rnd()-.5)*14}g.setAttribute('position',new THREE.BufferAttribute(p,3));const m=new THREE.PointsMaterial({size,color,transparent:true,opacity,depthWrite:false,blending:blend||THREE.NormalBlending,sizeAttenuation:true});const o=new THREE.Points(g,m);scene.add(o);return o}
const dust=points(120,.05,0xfff4d0,.55);
const flies=points(70,.09,0xd8ff70,0,THREE.AdditiveBlending);
const smokeG=new THREE.BufferGeometry();const SMK=40;const smokeP=new Float32Array(SMK*3),smokeL=new Float32Array(SMK);
const vols=all.filter(h=>h.t==='V');
for(let i=0;i<SMK;i++){smokeL[i]=rnd()}
smokeG.setAttribute('position',new THREE.BufferAttribute(smokeP,3));
const smoke=new THREE.Points(smokeG,new THREE.PointsMaterial({size:.22,color:0x8a8090,transparent:true,opacity:.45,depthWrite:false}));scene.add(smoke);

/* post-proceso */
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(256,256),.45,.5,.82);composer.addPass(bloom);
const hT=new ShaderPass(HorizontalTiltShiftShader),vT=new ShaderPass(VerticalTiltShiftShader);
hT.uniforms.r.value=vT.uniforms.r.value=.52;composer.addPass(hT);composer.addPass(vT);
composer.addPass(new OutputPass());

let quality='alta';
function resize(){
 const w=innerWidth,h=innerHeight,pr=quality==='alta'?Math.min(devicePixelRatio,2):1;
 renderer.setPixelRatio(pr);renderer.setSize(w,h,false);composer.setPixelRatio(pr);composer.setSize(w,h);
 camera.aspect=w/h;camera.updateProjectionMatrix();
 const blur=quality==='alta'?4.5:3;hT.uniforms.h.value=blur/(w*pr);vT.uniforms.v.value=blur/(h*pr);
 if(w<h&&!resize.done){camera.position.set(0,27,26);resize.done=true}
}
addEventListener('resize',resize);resize();

/* fases del día */
const PH=[
 {sun:[7,11,6],sc:0xfff1d6,si:2.5,hs:0xbcd8ff,hg:0x6a5a3a,hi:1,bg:0xa9cbe8,fog:0xc8dcea,exp:1.05,night:0},
 {sun:[-10,4.5,5],sc:0xff9a58,si:2.3,hs:0xffc8a0,hg:0x5a3a2a,hi:.75,bg:0xe39a6a,fog:0xe8b088,exp:1.0,night:.3},
 {sun:[5,12,-7],sc:0x7a90ff,si:.45,hs:0x2a3470,hg:0x120c1c,hi:.45,bg:0x0c1028,fog:0x161c40,exp:1.15,night:1}
];
let cur={},target=PH[0];
scene.fog=new THREE.Fog(0xc8dcea,34,80);scene.background=new THREE.Color(0xa9cbe8);
const lerpC=(a,b,t)=>a.lerp(new THREE.Color(b),t);
function setPhase(i){target=PH[i];document.querySelectorAll('[data-ph]').forEach(b=>b.classList.toggle('sel',+b.dataset.ph===i))}
document.querySelectorAll('[data-ph]').forEach(b=>b.onclick=()=>setPhase(+b.dataset.ph));
const sunPos=new THREE.Vector3(...PH[0].sun);let night=0;


/* ================= datos de juego ================= */
const $=id=>document.getElementById(id);
const rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const rpick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const RES={maiz:'Maíz',madera:'Madera',piedra:'Piedra',obsidiana:'Obsidiana'};const RK=Object.keys(RES);
const RESOF={M:'maiz',S:'madera',C:'piedra',V:'obsidiana'};
const PHASES=['Mañana','Tarde','Noche'],AP=[5,5,4];
const HEROES={
 jaguar:{name:'Guerrero jaguar',desc:'+1 a cada tirada de combate'},
 aguila:{name:'Guerrero águila',desc:'Su primer movimiento de cada turno es gratis'},
 sacerdotisa:{name:'Sacerdotisa de Quetzalcóatl',desc:'Repite una tirada por combate y descansar le cura 3'},
 pochteca:{name:'Pochteca',desc:'Recolecta 1 recurso extra una vez por turno'}};
const HK=Object.keys(HEROES);
const BEASTS={
 coyote:{name:'Coyote nahual',lvl:1,str:4,atk:1,glory:1,eff:'Robo: te quita un recurso al azar',scale:1},
 ahuizotl:{name:'Ahuízotl',lvl:2,str:6,atk:1,glory:2,eff:'Arrastre: te hunde y perdés 1 PA',scale:1},
 cipactli:{name:'Cipactli',lvl:3,str:8,atk:2,glory:4,eff:'Fauces: su ataque hace el doble',scale:.85}};
const BY_LVL={1:'coyote',2:'ahuizotl',3:'cipactli'};
const ITEMS={
 coa:{name:'Coa',tier:1,desc:'+1 maíz al recolectar en milpa'},
 hacha:{name:'Hacha de cobre',tier:1,desc:'+1 madera al recolectar en selva'},
 cactli:{name:'Cactli',tier:1,desc:'Sandalias: 1 movimiento gratis por turno'},
 copal:{name:'Copal sagrado',tier:1,desc:'Se consume: cura 3 de vida',use:true},
 atlatl:{name:'Átlatl',tier:2,desc:'+2 a la primera tirada de cada combate'},
 chimalli:{name:'Chimalli',tier:2,desc:'Escudo: bloquea el primer golpe de cada combate'},
 ichca:{name:'Ichcahuipilli',tier:2,desc:'Armadura de algodón: +2 de vida máxima'},
 macuahuitl:{name:'Macuahuitl',tier:3,desc:'Espada de obsidiana: +1 a cada tirada'},
 espejo:{name:'Espejo de Tezcatlipoca',tier:3,desc:'Repetí una tirada por combate'},
 collar:{name:'Collar de jade',tier:3,desc:'+1 PA en cada fase'},
 penacho:{name:'Penacho de quetzal',tier:3,desc:'+3 de gloria al final'}};
const COLORS=['#f0c040','#38c0b0','#ff7aa8','#8ad06a'];
const hdist=(a,b)=>(Math.abs(a.q-b.q)+Math.abs(a.r-b.r)+Math.abs(a.q+a.r-b.q-b.r))/2;
const RICON={maiz:["..g.....",".gyy....",".yyyy...","..yYyy..","..yyYy..","...yyyg.","...gyyg.","....gg.."],madera:["........","..bbbbb.",".bBBbbbb","bBbBBbbb","bBBbBbbn",".bBBbnn.","..nnnn.."],piedra:["...AA...","..AAaA..",".AaAAaa.",".AAAaaa.","AaAaaas.",".sssss.."],obsidiana:["...x....","..xOx...","..xxz...",".xxOzx..",".xxxzx..","xxxOxxx.",".xxxxx.."]};
const RICO={};for(const k in RICON)RICO[k]=renderRows(RICON[k].map(r=>r.padEnd(8,'.'))).toDataURL();
const PORTRAIT={};
function portrait(key,size=44){if(!PORTRAIT[key])PORTRAIT[key]=renderRows(composeFrame(key,0)).toDataURL();return`<img src="${PORTRAIT[key]}" class="spr" style="height:${size}px;width:auto">`}
const resHTML=res=>RK.map(k=>`<span class="res"><img class="ico" src="${RICO[k]}" alt="${RES[k]}">${res[k]}</span>`).join('');
const needHTML=need=>Object.entries(need).map(([k,v])=>`<span class="res"><img class="ico" src="${RICO[k]}" alt="${RES[k]}">×${v}</span>`).join('');

/* stock: pequeños marcadores sobre cada hexágono con recurso */
const pipMat=new THREE.MeshStandardMaterial({color:0xf4ecd8,emissive:0xf4ecd8,emissiveIntensity:.25,roughness:.6});
for(const h of hexes.values()){h.stock=RESOF[h.t]?2:0;if(RESOF[h.t]){h.pips=[0,1].map(i=>{const m=new THREE.Mesh(BOX,pipMat);m.scale.set(.09,.09,.09);m.position.set(-.08+i*.16,h.top+.05,-.72);h.g.add(m);return m})}}
const allHex=[...hexes.values()];
const cities=allHex.filter(h=>TERR[h.t].city);
{const names=shuffle(['Xalpan','Itzapan','Tecolco','Ayotla']);cities.forEach(h=>{h.name=h.t==='K'?'Teocalli Mayor':names.pop()})}

/* ================= entidades 3D ================= */
const camRight=new THREE.Vector3(1,0,0);
const slotPos=(h,s)=>new THREE.Vector3(wx(h)+h.stand[0]+camRight.x*s,h.top,wz(h)+h.stand[1]+camRight.z*s);
const hexCenter=h=>new THREE.Vector3(wx(h)+h.stand[0],h.top,wz(h)+h.stand[1]);
function removeBillboard(g){scene.remove(g);billboards.splice(billboards.indexOf(g),1)}
function walkObj(g,to,dur=620,cb){g.userData.anim={from:g.position.clone(),to,t0:performance.now(),dur,cb};g.userData.walk=true;
 const d=to.clone().sub(g.position);const right=d.dot(camRight)>0;g.userData.flip=g.userData.faceLeft?(right?-1:1):(right?1:-1)}
const SL={1:[0],2:[-.34,.34],3:[-.46,0,.46],4:[-.52,-.18,.18,.52],5:[-.58,-.29,0,.29,.58]};
function layout(){
 if(!G)return;const groups=new Map();
 const add=(h,o)=>{if(o.userData.lock)return;const k=key(h.q,h.r);if(!groups.has(k))groups.set(k,{h,l:[]});groups.get(k).l.push(o)};
 G.beasts.forEach(b=>add(hexOf(b),b.obj));G.players.forEach(p=>add(hexOf(p),p.obj));
 for(const{h,l}of groups.values()){const sl=SL[Math.min(l.length,5)];l.forEach((o,i)=>o.userData.target=slotPos(h,sl[Math.min(i,4)]))}
}

/* efectos: partículas, anillos, textos, destellos, temblor */
const PN=600,pGeo=new THREE.BufferGeometry(),pPos=new Float32Array(PN*3).fill(-999),pCol=new Float32Array(PN*3),pBase=new Float32Array(PN*3),pVel=new Float32Array(PN*3),pLife=new Float32Array(PN),pMax=new Float32Array(PN),pGrav=new Float32Array(PN);
pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));pGeo.setAttribute('color',new THREE.BufferAttribute(pCol,3));
const fxPoints=new THREE.Points(pGeo,new THREE.PointsMaterial({size:.11,vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));fxPoints.frustumCulled=false;scene.add(fxPoints);
let pIdx=0;
function burst(pos,n,color,speed=2.5,opt={}){const c=new THREE.Color(color);for(let k=0;k<n;k++){const i=pIdx=(pIdx+1)%PN;const a=Math.random()*Math.PI*2,e=(opt.up?Math.random()*.9+.3:Math.random()*2-1);const sp=speed*(.4+Math.random()*.8);
 pPos[i*3]=pos.x+(Math.random()-.5)*(opt.spread||.2);pPos[i*3+1]=pos.y+(Math.random()-.5)*(opt.spread||.2);pPos[i*3+2]=pos.z+(Math.random()-.5)*(opt.spread||.2);
 pVel[i*3]=Math.cos(a)*sp*(opt.up?.35:1);pVel[i*3+1]=e*sp;pVel[i*3+2]=Math.sin(a)*sp*(opt.up?.35:1);pBase[i*3]=c.r;pBase[i*3+1]=c.g;pBase[i*3+2]=c.b;pMax[i]=pLife[i]=(opt.life||.8)*(.6+Math.random()*.6);pGrav[i]=opt.grav??-3}}
const fxRings=[];
function ringFx(pos,color,size=1.6,dur=.55){const m=new THREE.Mesh(new THREE.RingGeometry(.3,.42,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.position.copy(pos);scene.add(m);fxRings.push({m,t0:performance.now(),dur:dur*1000,size})}
const floaters=[];
function floatText(txt,pos,color,size=1){const c=document.createElement('canvas'),x=c.getContext('2d');const F='14px "Press Start 2P", monospace';x.font=F;const w=Math.ceil(x.measureText(txt).width)+8;c.width=w;c.height=24;x.font=F;x.textBaseline='middle';x.fillStyle='#120c18';for(const[a,b]of[[3,13],[5,13],[4,12],[4,14],[5,14]])x.fillText(txt,a,b);x.fillStyle=color;x.fillText(txt,4,12);
 const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));const hh=.32*size;s.scale.set(hh*w/24,hh,1);s.position.copy(pos);s.renderOrder=30;scene.add(s);floaters.push({s,t0:performance.now(),y0:pos.y})}
function flash(g,color=0xffffff,dur=180){const m=g.userData.spr.userData.mat;m.emissive.set(color);g.userData.flashUntil=performance.now()+dur}
let shake=null;function doShake(amp=.12,dur=260){shake={amp,t0:performance.now(),dur}}
let bloomKick=0;

/* cámara animada */
let camTween=null;
function tweenCam(pos,tgt,dur=700,cb){camTween={p0:camera.position.clone(),t0v:controls.target.clone(),p1:pos,t1:tgt,s:performance.now(),dur,cb}}

/* ================= estado ================= */
let G=null,B=null;
const curP=()=>G.players[G.cur];
const hexOf=p=>hexes.get(key(p.q,p.r));
const beastAt=h=>G.beasts.find(b=>b.q===h.q&&b.r===h.r);
const heroesAt=h=>G.players.filter(p=>p.q===h.q&&p.r===h.r);
const has=(p,it)=>p.items.includes(it);
const maxAP=p=>Math.max(2,AP[G.phase]-p.dignityLost+(has(p,'collar')?1:0));
function log(m){G.log.unshift(m);if(G.log.length>60)G.log.pop();if(B)return;$('toast').textContent=m;$('toast').classList.add('show');clearTimeout(log.t);log.t=setTimeout(()=>$('toast').classList.remove('show'),2600)}
function msg(title,body,spr){$('mTitle').textContent=title;$('mBody').innerHTML=(spr?portrait(spr,64)+'<br>':'')+body;$('ovMsg').classList.remove('hidden')}
function newDemand(){const t=shuffle(RK.slice()).slice(0,2);const need={};const n=rint(2,4);for(let i=0;i<n;i++){const k=t[i%2];need[k]=(need[k]||0)+1}return{need,glory:n+(need.obsidiana?1:0)}}
function newWanted(tier){const need={};for(let i=0;i<tier+1;i++){const k=rpick(RK);need[k]=(need[k]||0)+1}return{tier,need}}
const lairOk={1:h=>h.t==='M'||h.t==='S',2:h=>h.t==='C'||(!TERR[h.t].water&&!TERR[h.t].city&&nbrs(hexes,h).some(n=>n.t==='L')),3:h=>h.t==='V'};
const canHold=h=>!TERR[h.t].water&&!TERR[h.t].city&&!beastAt(h);
function lairs(lvl,avoid){return allHex.filter(h=>canHold(h)&&lairOk[lvl](h)&&(!avoid||G.players.every(p=>hdist(p,h)>1)))}
function spawn(kind,h,fx){const d=BEASTS[kind];if(!h){const c=lairs(d.lvl,true);h=c.length?rpick(c):rpick(lairs(d.lvl,false))}if(!h)return null;
 const b={kind,q:h.q,r:h.r};b.obj=makeBillboard(kind,d.scale,0xff4a3a);b.obj.position.copy(hexCenter(h));G.beasts.push(b);
 if(fx){const p=hexCenter(h).add(new THREE.Vector3(0,.4,0));burst(p,40,0xb070ff,2,{up:true,life:1});ringFx(p,0xb070ff)}return b}

/* ================= setup ================= */
const setup={n:2,days:5,players:[0,1,2,3].map(i=>({name:'Jugador '+(i+1),hero:HK[i]}))};
function renderSetup(){
 $('nBtns').innerHTML=[2,3,4].map(n=>`<button class="plain ${setup.n===n?'sel':''}" onclick="UI.setN(${n})">${n}</button>`).join('');
 $('dBtns').innerHTML=[[5,'5 días'],[3,'3 días']].map(([n,l])=>`<button class="plain ${setup.days===n?'sel':''}" onclick="UI.setD(${n})">${l}</button>`).join('');
 $('pRows').innerHTML=setup.players.slice(0,setup.n).map((p,i)=>`<div style="margin-bottom:8px"><div class="row"><span class="dot" style="background:${COLORS[i]}"></span>${portrait(p.hero,40)}<input value="${p.name}" maxlength="14" oninput="UI.name(${i},this.value)"></div>
  <button style="width:100%;margin-top:4px" onclick="UI.cycle(${i})">${HEROES[p.hero].name}</button><div class="mut" style="font-size:17px">${HEROES[p.hero].desc}</div></div>`).join('');
}
function fixHeroes(){const u=new Set();setup.players.slice(0,setup.n).forEach(p=>{if(u.has(p.hero))p.hero=HK.find(k=>!u.has(k));u.add(p.hero)})}

/* ================= partida ================= */
function startGame(){
 controls.autoRotate=false;
 G={players:[],beasts:[],respawn:[],day:1,days:setup.days,phase:0,cur:0,start:0,turnCount:0,mode:'act',sel:null,log:[]};
 hero.visible=false;ally.visible=false;[coy,ahu,cip].forEach(o=>removeBillboard(o));removeBillboard(hero);removeBillboard(ally);
 G.players=setup.players.slice(0,setup.n).map((p,i)=>{const o={name:(p.name||'Jugador '+(i+1)).trim(),hero:p.hero,color:COLORS[i],hp:6,maxHp:6,ap:0,res:{maiz:0,madera:0,piedra:0,obsidiana:0},glory:0,dignityLost:0,kills:{coyote:0,ahuizotl:0,cipactli:0},items:[],wanted:[],q:capital.q,r:capital.r,freeMoves:0,gatherBonus:false};
  o.obj=makeBillboard(p.hero,1,parseInt(COLORS[i].slice(1),16));o.obj.position.copy(hexCenter(capital));return o});
 cities.forEach(c=>c.demand=newDemand());
 const n=G.players.length;for(let i=0;i<2+Math.ceil(n/2);i++)spawn('coyote');spawn('ahuizotl');spawn('ahuizotl');spawn('cipactli');
 log('Amanece el primer día. Los héroes parten del Teocalli Mayor.');
 $('ovSetup').classList.add('hidden');$('hud').classList.remove('hidden');$('panel').classList.remove('hidden');
 beginTurn();
}
function setPhaseLight(){target=PH[G.phase]}
function focusOn(p,dur=800){const c=hexCenter(hexOf(p));const off=camera.position.clone().sub(controls.target);off.setLength(Math.max(14,Math.min(off.length(),22)));tweenCam(c.clone().add(off),c.clone().add(new THREE.Vector3(0,.4,0)),dur)}
function beginTurn(){
 const p=curP();p.ap=maxAP(p);p.freeMoves=(p.hero==='aguila'?1:0)+(has(p,'cactli')?1:0);p.gatherBonus=p.hero==='pochteca';
 G.mode='act';G.pending=null;G.sel=hexOf(p);setPhaseLight();focusOn(p);
 $('tPhase').textContent=`Día ${G.day} de ${G.days} · ${PHASES[G.phase]}`;$('tSpr').innerHTML=portrait(p.hero,96);$('tName').textContent=p.name;$('tName').style.color=p.color;
 $('tInfo').textContent=`${HEROES[p.hero].name} · ${p.ap} PA · vida ${p.hp}/${p.maxHp}`;
 $('ovTurn').classList.remove('hidden');update();
}
function startAcecho(){const p=curP();G.mode='acecho';G.furia=clamp(7-p.hp,1,6);G.pending=null;G.hit=new Set();log(`${p.name} acecha con ${G.furia} de furia.`);update()}
function endTurn(){
 G.mode='act';G.turnCount++;
 if(G.turnCount<G.players.length){G.cur=(G.cur+1)%G.players.length;return beginTurn()}
 G.phase++;G.turnCount=0;
 if(G.phase>2){G.phase=0;G.day++;if(G.day>G.days)return endGame();dawn();G.start=(G.start+1)%G.players.length}
 else log(`Día ${G.day}: ${G.phase===1?'cae la tarde':'llega la noche'}.`);
 G.cur=G.start;beginTurn();
}
function dawn(){
 for(const h of allHex)if(RESOF[h.t])h.stock=2;
 G.players.forEach(p=>p.hp=Math.min(p.maxHp,p.hp+1));
 G.respawn.splice(0).forEach(k=>spawn(k,null,true));
 cities.forEach(c=>{if(!c.demand)c.demand=newDemand()});
 log(`Amanece el día ${G.day}. Vuelven los recursos, los pedidos y las bestias.`);
}
function ko(p,why){
 const from=p.obj.position.clone().add(new THREE.Vector3(0,.5,0));burst(from,50,0xb070ff,2.2,{up:true,life:1.1});
 p.dignityLost++;p.hp=p.maxHp;p.q=capital.q;p.r=capital.r;p.ap=0;p.obj.position.copy(hexCenter(capital));
 const to=hexCenter(capital).add(new THREE.Vector3(0,.5,0));setTimeout(()=>{burst(to,40,0xf0c040,2,{up:true});ringFx(to,0xf0c040)},250);
 log(`${p.name} cae ${why}. Despierta en el Teocalli Mayor y pierde 1 de dignidad.`);
}

/* ================= acciones ================= */
function moveTargets(p){return nbrs(hexes,hexOf(p)).filter(h=>!TERR[h.t].water&&(p.freeMoves>0||p.ap>=1))}
function beastTargets(b){return nbrs(hexes,hexOf(b)).filter(canHold)}
function canDo(){const p=curP(),h=hexOf(p),b=beastAt(h),city=TERR[h.t].city;return{
 gather:p.ap>=1&&RESOF[h.t]&&h.stock>0&&!b,fight:p.ap>=1&&!!b,
 deliver:p.ap>=1&&city&&h.demand&&RK.every(k=>p.res[k]>=(h.demand.need[k]||0)),
 forge:p.ap>=1&&city&&p.wanted.some(w=>RK.every(k=>p.res[k]>=(w.need[k]||0))),
 rest:p.ap>=1&&city&&p.hp<p.maxHp,copal:has(p,'copal')&&p.hp<p.maxHp}}
const busy=()=>!!B||G.over||!!G.walking;
function act(a){
 if(busy())return;const p=curP(),h=hexOf(p),top=p.obj.position.clone().add(new THREE.Vector3(0,1.3,0));
 if(a==='gather'){const k=RESOF[h.t];let n=1;if(p.gatherBonus){n++;p.gatherBonus=false}if(k==='maiz'&&has(p,'coa'))n++;if(k==='madera'&&has(p,'hacha'))n++;h.stock--;p.ap--;p.res[k]+=n;
  burst(p.obj.position.clone().add(new THREE.Vector3(0,.2,0)),18,0xfff0b0,1.4,{up:true,life:.7});floatText(`+${n} ${RES[k]}`,top,'#fff0b0',.9);log(`${p.name} recolecta ${n} de ${RES[k].toLowerCase()}.`)}
 if(a==='fight'){p.ap--;return openBattle(beastAt(h))}
 if(a==='deliver'){const d=h.demand;RK.forEach(k=>p.res[k]-=(d.need[k]||0));p.glory+=d.glory;p.ap--;h.demand=null;let extra='';
  if(p.wanted.length<3){const tier=d.glory<=2?1:d.glory<=4?2:3;p.wanted.push(newWanted(tier));extra=` Recibe una carta "Se busca" de nivel ${tier}.`}
  burst(top,50,0xf0c040,2.4,{up:true,life:1.1});ringFx(top,0xf0c040,2);floatText(`+${d.glory} GLORIA`,top,'#f0c040',1.1);log(`${p.name} cumple el pedido de ${h.name}: +${d.glory} de gloria.${extra}`)}
 if(a==='forge'){const w=p.wanted.find(w=>RK.every(k=>p.res[k]>=(w.need[k]||0)));RK.forEach(k=>p.res[k]-=(w.need[k]||0));p.wanted.splice(p.wanted.indexOf(w),1);p.ap--;
  const pool=Object.keys(ITEMS).filter(k=>ITEMS[k].tier===w.tier&&(ITEMS[k].use||!has(p,k)));const it=pool.length?rpick(pool):'copal';p.items.push(it);if(it==='ichca'){p.maxHp+=2;p.hp+=2}
  burst(top,40,0xff9a40,2,{up:true});ringFx(top,0xff9a40);log(`${p.name} forja ${ITEMS[it].name}.`);msg('Objeto forjado',`<b class="gold">${ITEMS[it].name}</b><br><span class="mut">Nivel ${ITEMS[it].tier} · ${ITEMS[it].desc}</span>`)}
 if(a==='rest'){const n=p.hero==='sacerdotisa'?3:2,b0=p.hp;p.hp=Math.min(p.maxHp,p.hp+n);p.ap--;burst(top,20,0x8ad06a,1.2,{up:true});floatText('+'+(p.hp-b0),top,'#8ad06a');log(`${p.name} descansa en ${h.name}.`)}
 if(a==='copal'){p.items.splice(p.items.indexOf('copal'),1);const b0=p.hp;p.hp=Math.min(p.maxHp,p.hp+3);burst(top,24,0xd8d0ff,1.2,{up:true,grav:.5,life:1.2});floatText('+'+(p.hp-b0),top,'#8ad06a');log(`${p.name} quema copal.`)}
 update();
}
function beastArrives(b){const d=BEASTS[b.kind];for(const p of heroesAt(hexOf(b))){const id=p.name+'|'+b.q+','+b.r+b.kind;if(G.hit.has(id))continue;G.hit.add(id);
 p.hp-=d.atk;const pos=p.obj.position.clone().add(new THREE.Vector3(0,.6,0));flash(p.obj,0xff3a2a);burst(pos,26,0xff5a3a,2.4);doShake(.1);floatText('-'+d.atk,pos.clone().add(new THREE.Vector3(0,.7,0)),'#ff7a5a');
 log(`${d.name} embiste a ${p.name}: −${d.atk} de vida.`);if(p.hp<=0)ko(p,`ante ${d.name}`)}}
function onHex(h){
 const p=curP();G.sel=h;
 if(busy())return update();
 if(G.mode==='act'){if(moveTargets(p).includes(h)){if(p.freeMoves>0)p.freeMoves--;else p.ap--;p.q=h.q;p.r=h.r;G.walking=true;p.obj.userData.lock=true;
  walkObj(p.obj,slotPos(h,beastAt(h)||heroesAt(h).length>1?-.34:0),620,()=>{p.obj.userData.lock=false;G.walking=false;update()})}}
 else if(G.pending){const pe=G.pending;
  if(pe.type==='pickBeast'){const b=beastAt(h);if(b&&beastTargets(b).length){pe.type='moveBeast';pe.b=b}}
  else if(pe.type==='moveBeast'){if(beastTargets(pe.b).includes(h)){const b=pe.b;b.q=h.q;b.r=h.r;G.furia--;G.walking=true;b.obj.userData.lock=true;
   walkObj(b.obj,slotPos(h,heroesAt(h).length?.34:0),700,()=>{b.obj.userData.lock=false;G.walking=false;beastArrives(b);update()});log(`${p.name} azuza a ${BEASTS[b.kind].name}.`);G.pending=null}}
  else if(pe.type==='summon'){if(lairs(pe.lvl,false).includes(h)){const b=spawn(BY_LVL[pe.lvl],h,true);G.furia-=pe.lvl+1;log(`${p.name} invoca a ${BEASTS[b.kind].name}.`);setTimeout(()=>{beastArrives(b);update()},350);G.pending=null}}
 }
 update();
}

/* ================= combate en el mapa ================= */
const FACES=[2,3,4,5,'azul','bestia'];
function openBattle(b){
 const p=curP(),d=BEASTS[b.kind],h=hexOf(p);
 B={b,p,d,meter:d.str,first:true,block:has(p,'chimalli'),rerolls:(p.hero==='sacerdotisa'?1:0)+(has(p,'espejo')?1:0),busy:false,pending:null,over:false,
  saved:{pos:camera.position.clone(),tgt:controls.target.clone()}};
 const c=hexCenter(h);B.center=c;
 const r=camRight.clone();B.right=r;
 p.obj.userData.lock=b.obj.userData.lock=true;
 B.heroPos=c.clone().addScaledVector(r,.5);B.beastPos=c.clone().addScaledVector(r,-.55);
 walkObj(p.obj,B.heroPos,420,()=>{p.obj.userData.walk=false;p.obj.userData.flip=1});walkObj(b.obj,B.beastPos,420,()=>{b.obj.userData.walk=false;b.obj.userData.flip=1});
 G.players.forEach(q=>{if(q!==p&&q.q===p.q&&q.r===p.r)q.obj.visible=false});
 const off=camera.position.clone().sub(controls.target);off.y=Math.max(off.y,0);off.setLength(6.2);off.y=Math.max(off.y,2.6);
 controls.enabled=false;tweenCam(c.clone().add(off),c.clone().add(new THREE.Vector3(0,.55,0)),850);
 $('panel').classList.add('hidden');$('hint').classList.add('hidden');$('battle').classList.remove('hidden');B.hiddenDecor=h.g.children.filter(c=>!c.userData.hex&&!(h.pips||[]).includes(c)&&c.type==='Mesh'&&c.visible);B.hiddenDecor.forEach(c=>c.visible=false);$('die').classList.remove('hidden');drawDie('?');
 setBMsg(`¡${d.name} te sale al cruce! Fuerza ${d.str}. ${d.eff}.`);
 const ep=B.beastPos.clone().add(new THREE.Vector3(0,.6,0));setTimeout(()=>{ringFx(ep,0xff3a2a,1.8);burst(ep,30,0xff5a3a,2)},500);
 renderBattle();
}
function setBMsg(t){$('bMsg').innerHTML=t}
function renderBattle(){
 const{p,d,meter}=B;
 $('bBars').innerHTML=`<div class="row" style="gap:6px"><span style="color:${p.color};width:48%">${p.name}</span><span style="width:48%;text-align:right">${d.name}</span></div>
 <div class="row" style="gap:6px"><div class="bar" style="width:48%"><i style="width:${clamp(p.hp/p.maxHp,0,1)*100}%"></i></div><div class="bar" style="width:48%"><i style="width:${clamp(meter/d.str,0,1)*100}%;background:linear-gradient(#b08aff,#5a3080)"></i></div></div>
 <div class="row mut" style="gap:6px;font-size:17px"><span style="width:48%">Vida ${Math.max(0,p.hp)}/${p.maxHp}</span><span style="width:48%;text-align:right">Fuerza ${Math.max(0,meter)}/${d.str}</span></div>`;
 let c;
 if(B.over)c=`<button class="pri" style="grid-column:span 2" onclick="UI.closeBattle()">Volver al mapa</button>`;
 else if(B.pending!=null)c=`<button class="pri" onclick="UI.accept()">Aceptar</button><button onclick="UI.reroll()">Repetir (${B.rerolls})</button>`;
 else c=`<button class="pri" onclick="UI.roll()" ${B.busy?'disabled':''}>Tirar dado</button><button onclick="UI.flee()" ${B.busy?'disabled':''}>Huir</button>${has(p,'copal')&&p.hp<p.maxHp?`<button onclick="UI.bCopal()" ${B.busy?'disabled':''}>Copal</button>`:''}`;
 $('bCmds').innerHTML=c;
}
const dieCtx=$('dieC').getContext('2d');
function drawDie(f){const c=dieCtx;c.clearRect(0,0,28,28);c.fillStyle='#120c18';c.fillRect(1,1,26,26);
 const col=f==='azul'?'#3a6ae0':f==='bestia'?'#c8402a':'#f4ecd8';c.fillStyle=col;c.fillRect(2,2,24,24);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(2,2,24,3);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(2,23,24,3);
 c.fillStyle=(f==='azul'||f==='bestia')?'#fff':'#120c18';
 if(typeof f==='number'){({2:[[8,8],[18,18]],3:[[7,7],[13,13],[19,19]],4:[[8,8],[18,8],[8,18],[18,18]],5:[[7,7],[19,7],[13,13],[7,19],[19,19]]})[f].forEach(([x,y])=>c.fillRect(x-1,y-1,3,3))}
 else if(f==='azul'){c.fillRect(13,5,3,18);c.fillRect(5,13,18,3);c.fillRect(8,8,3,3);c.fillRect(17,8,3,3);c.fillRect(8,17,3,3);c.fillRect(17,17,3,3)}
 else if(f==='bestia'){c.fillRect(7,8,4,3);c.fillRect(17,8,4,3);c.fillRect(7,16,14,2);for(let i=0;i<4;i++)c.fillRect(8+i*4,18,2,3)}
 else{c.font='14px monospace';c.textAlign='center';c.fillText('?',14,19)}}
const faceName=f=>f==='azul'?'el golpe azul':f==='bestia'?'la cara de bestia':`un ${f}`;
function roll(){if(!B||B.busy)return;B.busy=true;renderBattle();const el=$('die');el.classList.add('rolling');let n=0;
 const bb=B;const it=setInterval(()=>{if(B!==bb){clearInterval(it);return}drawDie(rpick(FACES));if(++n>12){clearInterval(it);el.classList.remove('rolling');const f=rpick(FACES);drawDie(f);el.classList.add('land');setTimeout(()=>el.classList.remove('land'),300);
  if(B.rerolls>0&&f!=='azul'){B.pending=f;B.busy=false;setBMsg(`Salió ${faceName(f)}. ¿Aceptás o repetís?`);renderBattle()}else resolve(f)}},65)}
function lunge(g,toward,dist=.45,cb){const base=g.position.clone();const dir=toward.clone().sub(base).setY(0).normalize();g.userData.lunge={base,dir,dist,t0:performance.now(),cb}}
function resolve(f){
 const bb=B;const{p,d,b}=B;B.busy=true;let text='',mult=1,effect=false;
 const bp=()=>b.obj.position.clone().add(new THREE.Vector3(0,.55,0)),hp=()=>p.obj.position.clone().add(new THREE.Vector3(0,.6,0));
 if(f==='bestia'){const heal=Math.min(2,d.str-B.meter);B.meter+=heal;effect=true;text=heal?`¡Cara de bestia! ${d.name} se cura ${heal}.`:`¡Cara de bestia! ${d.name} se enfurece.`;
  const pos=bp();burst(pos,40,0xb070ff,1.6,{up:true,grav:.6,life:1.2});ringFx(b.obj.position.clone().add(new THREE.Vector3(0,.05,0)),0xb070ff,2.2,.8);if(heal)floatText('+'+heal,pos.clone().add(new THREE.Vector3(0,.7,0)),'#d0a0ff');flash(b.obj,0xb070ff,400)}
 else{
  const crit=f==='azul';const bonus=crit?0:(p.hero==='jaguar'?1:0)+(has(p,'macuahuitl')?1:0)+(B.first&&has(p,'atlatl')?2:0);const dmg=crit?B.meter:f+bonus;
  text=crit?'¡Golpe azul! Un ataque crítico.':`Sacaste ${f}${bonus?` +${bonus}`:''}: ${dmg} de daño.`;
  lunge(p.obj,b.obj.position,crit?.7:.45,()=>{});
  setTimeout(()=>{if(B!==bb)return;B.meter-=dmg;const pos=bp();flash(b.obj,crit?0x7ab0ff:0xffffff);doShake(crit?.22:.1,crit?420:240);
   if(crit){burst(pos,90,0x7ab0ff,4,{life:1});ringFx(pos,0x7ab0ff,3.2,.7);ringFx(pos,0xffffff,2,.4);bloomKick=1.4;floatText('¡CRÍTICO!',pos.clone().add(new THREE.Vector3(0,.9,0)),'#9ac0ff',1.3)}
   else{burst(pos,36,0xfff0c0,2.8);burst(pos,14,0xff9a40,1.6);floatText('-'+dmg,pos.clone().add(new THREE.Vector3(0,.7,0)),'#ffffff')}
   renderBattle()},200);
 }
 B.first=false;
 setTimeout(()=>{if(B!==bb)return;
  if(B.meter<=0){B.meter=0;const loot=d.lvl===3?'obsidiana':rpick(RK),amt=d.lvl===3?2:1;
   p.glory+=d.glory;p.kills[b.kind]++;p.res[loot]+=amt;G.beasts.splice(G.beasts.indexOf(b),1);G.respawn.push(b.kind);
   const pos=bp();b.obj.userData.dying=performance.now();burst(pos,80,0xf0c040,2.4,{up:true,life:1.3,grav:-.5});burst(pos,50,0xb070ff,2,{up:true,life:1.1});
   setTimeout(()=>floatText(`+${d.glory} GLORIA`,p.obj.position.clone().add(new THREE.Vector3(0,1.5,0)),'#f0c040',1.1),300);
   B.over=true;B.busy=false;setBMsg(`${text}<br><b class="gold">¡Victoria!</b> +${d.glory} de gloria y ${amt} de ${RES[loot].toLowerCase()}.`);log(`${p.name} vence a ${d.name}.`);renderBattle();return}
  if(effect){
   if(b.kind==='coyote'){const own=RK.filter(k=>p.res[k]>0);if(own.length){const k=rpick(own);p.res[k]--;text+=` Te roba 1 de ${RES[k].toLowerCase()}.`}else text+=' No tenías nada para robar.'}
   if(b.kind==='ahuizotl'){if(p.ap>0){p.ap--;text+=' Te arrastra al agua: −1 PA.'}else{mult=2;text+=' Te arrastra al agua.'}}
   if(b.kind==='cipactli'){mult=2;text+=' ¡Abre sus fauces!'}}
  let dmg=d.atk*mult;if(B.block){B.block=false;dmg=0;text+=' Tu chimalli bloquea el golpe.'}
  lunge(b.obj,p.obj.position,.5);
  setTimeout(()=>{if(B!==bb)return;const pos=hp();if(dmg){flash(p.obj,0xff3a2a);burst(pos,30,0xff5a3a,2.6);doShake(mult>1?.2:.12);floatText('-'+dmg,pos.clone().add(new THREE.Vector3(0,.8,0)),'#ff7a5a',mult>1?1.25:1)}else{burst(pos,24,0xf0c040,2);ringFx(pos,0xf0c040,1.4);floatText('BLOQUEO',pos.clone().add(new THREE.Vector3(0,.8,0)),'#f0c040')}
   p.hp-=dmg;if(dmg)text+=` ${d.name} te hace ${dmg}.`;
   if(p.hp<=0){B.over=true;B.busy=false;p.obj.userData.dying=performance.now();setTimeout(()=>{if(B!==bb)return;B.koPending=true;setBMsg(`${text}<br><b style="color:#ff7a5a">Caíste en combate.</b> Perdés 1 de dignidad.`);renderBattle()},500);return}
   B.busy=false;setBMsg(text);renderBattle()},220);
 },f==='bestia'?700:900);
 setBMsg(text);renderBattle();
}
function flee(){if(!B||B.busy)return;log(`${B.p.name} huye de ${B.d.name}.`);B.over=true;closeBattle()}
function closeBattle(){
 const{p,b}=B;
 if(b.obj.userData.dying)removeBillboard(b.obj);else b.obj.userData.lock=false;
 if(B.koPending){p.obj.userData.dying=0;p.obj.userData.spr.userData.mat.opacity=1;ko(p,`ante ${B.d.name}`)}
 p.obj.userData.lock=false;G.players.forEach(q=>q.obj.visible=true);
 tweenCam(B.saved.pos,B.saved.tgt,800,()=>{controls.enabled=true});
 (B.hiddenDecor||[]).forEach(c=>c.visible=true);B=null;$('hint').classList.remove('hidden');$('battle').classList.add('hidden');$('die').classList.add('hidden');$('panel').classList.remove('hidden');update();
}

/* ================= fin ================= */
function score(p){const set=Object.values(p.kills).every(v=>v>0)?3:0,pen=has(p,'penacho')?3:0;return{glory:p.glory,set,pen,dig:p.dignityLost*2,total:p.glory+set+pen-p.dignityLost*2}}
function endGame(){G.over=true;const rank=G.players.slice().sort((a,b)=>score(b).total-score(a).total||b.items.length-a.items.length);
 $('endList').innerHTML=rank.map((p,i)=>{const s=score(p);return`<div class="row" style="margin:8px 0;align-items:flex-start"><span class="px gold" style="width:22px">${i+1}</span>${portrait(p.hero,40)}<div style="flex:1"><div style="color:${p.color}">${p.name} · <b>${s.total}</b> puntos</div><div class="mut" style="font-size:17px">Gloria ${s.glory}${s.set?` · bestiario +${s.set}`:''}${s.pen?` · penacho +${s.pen}`:''}${s.dig?` · dignidad −${s.dig}`:''}</div></div></div>`}).join('')+`<p class="mut" style="text-align:center">${rank[0].name} será recordado como el héroe del valle.</p>`;
 controls.autoRotate=true;$('ovEnd').classList.remove('hidden');update()}

/* ================= interfaz ================= */
function update(){
 if(!G)return;const p=curP(),h=hexOf(p),cd=canDo();
 $('topInfo').innerHTML=`<span class="px">Día ${G.day}/${G.days}</span><span class="px" style="color:${['#f6dc80','#f0a860','#a8a8ff'][G.phase]}">${PHASES[G.phase]}</span><span class="px" style="color:${p.color}">${p.name}</span>`;
 const mx=maxAP(p);
 $('me').innerHTML=`<div class="row" style="gap:8px">${portrait(p.hero,38)}<div style="flex:1;min-width:0"><div class="row" style="justify-content:space-between"><span style="color:${p.color}">${p.name}</span><span>Gloria <b class="gold">${p.glory}</b></span></div>
  <div class="row" style="gap:6px"><div class="bar" style="flex:1"><i style="width:${p.hp/p.maxHp*100}%"></i></div><span style="font-size:18px">${p.hp}/${p.maxHp}</span></div>
  <div class="row" style="gap:6px;margin-top:2px">${Array.from({length:mx},(_,i)=>`<span class="pip ${i<p.ap?'':'off'}"></span>`).join('')}${p.freeMoves?`<span class="mut" style="font-size:16px">+${p.freeMoves} gratis</span>`:''}</div></div></div>
  <div style="margin-top:4px">${resHTML(p.res)}</div>`;
 const bz=busy();let a='';
 if(G.mode==='act'){const btn=(k,l,ok,pri)=>`<button class="${pri?'pri':''}" onclick="UI.act('${k}')" ${bz||!ok?'disabled':''}>${l}</button>`;
  a=btn('gather','Recolectar',cd.gather)+btn('fight','Luchar',cd.fight)+btn('deliver','Entregar',cd.deliver)+btn('forge','Forjar',cd.forge)+btn('rest','Descansar',cd.rest)+(has(p,'copal')?btn('copal','Copal',cd.copal):'')+`<button class="pri" onclick="UI.acecho()" ${bz?'disabled':''}>Terminar</button>`}
 else{const sum=l=>`<button onclick="UI.ac('summon',${l})" ${bz||G.furia<l+1||!lairs(l,false).length||G.beasts.length>=5+G.players.length?'disabled':''}>Invocar N${l} · ${l+1}</button>`;
  a=`<button onclick="UI.ac('move')" ${bz||G.furia<1||!G.beasts.some(b=>beastTargets(b).length)?'disabled':''}>Mover bestia · 1</button>`+sum(1)+sum(2)+sum(3)+(G.pending?`<button onclick="UI.ac('cancel')">Cancelar</button>`:'')+`<button class="pri" onclick="UI.ac('end')" ${bz?'disabled':''}>Pasar turno</button>`}
 $('acts').innerHTML=a;
 $('hint').textContent=G.mode==='act'?(p.ap>0||p.freeMoves?'Tocá un hexágono dorado para moverte':'Sin PA: tocá Terminar'):!G.pending?`Acecho · furia ${G.furia}`:G.pending.type==='pickBeast'?'Tocá la bestia que querés mover':G.pending.type==='moveBeast'?'Tocá a dónde moverla':'Tocá una guarida violeta';
 const s=G.sel||h,sb=beastAt(s),sh=heroesAt(s);
 let info=`<span class="gold">${s.name||TERR[s.t].name}</span>`;
 if(RESOF[s.t])info+=` · <img class="ico" src="${RICO[RESOF[s.t]]}" alt=""> ${RES[RESOF[s.t]]} ${s.stock}/2`;
 if(TERR[s.t].water)info+=' · no se puede cruzar';
 if(TERR[s.t].city)info+=s.demand?` · Pedido ${needHTML(s.demand.need)}→ <b class="gold">+${s.demand.glory}</b>`:' · sin pedidos hasta el amanecer';
 if(sb){const d=BEASTS[sb.kind];info+=`<br>${d.name} · N${d.lvl} · fuerza ${d.str} · ataque ${d.atk} · <span class="mut">${d.eff}</span>`}
 if(sh.length)info+=`<br><span class="mut">Aquí: ${sh.map(q=>`<span style="color:${q.color}">${q.name}</span>`).join(', ')}</span>`;
 $('info').innerHTML=info;
 showRings();
}
function showDetails(){
 if(!G)return;const p=curP();
 $('dBody').innerHTML=`<div class="px" style="margin-bottom:6px">${p.name}</div>
 <div class="mut">Dignidad ${3-p.dignityLost}/3 · Bestias: ${Object.entries(p.kills).map(([k,v])=>`${BEASTS[k].name} ${v}`).join(', ')}</div>
 <div style="margin:6px 0">${p.items.length?p.items.map(k=>`<div><b class="gold">${ITEMS[k].name}</b> <span class="mut">· ${ITEMS[k].desc}</span></div>`).join(''):'<span class="mut">Sin objetos todavía.</span>'}</div>
 <div>${p.wanted.length?'Se busca: '+p.wanted.map(w=>`<span class="chip">N${w.tier} ${needHTML(w.need)}</span>`).join(''):'<span class="mut">Sin cartas "Se busca".</span>'}</div>
 <div class="px" style="margin:10px 0 4px">Héroes</div>${G.players.map(q=>`<div class="row" style="justify-content:space-between"><span><span class="dot" style="background:${q.color}"></span> ${q.name}</span><span>${q.hp}♥ · <b class="gold">${q.glory}</b> gloria</span></div>`).join('')}
 <div class="px" style="margin:10px 0 4px">Crónica</div><div class="log">${G.log.map(m=>`<div>${m}</div>`).join('')}</div>`;
 $('ovDetails').classList.remove('hidden');
}

/* anillos de selección */
const rings=[];const ringMats={gold:new THREE.MeshBasicMaterial({color:0xf0c040,transparent:true,opacity:.8,depthWrite:false}),red:new THREE.MeshBasicMaterial({color:0xff4a3a,transparent:true,opacity:.8,depthWrite:false}),violet:new THREE.MeshBasicMaterial({color:0xb070ff,transparent:true,opacity:.8,depthWrite:false}),sel:new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35,depthWrite:false})};
function showRings(){rings.forEach(r=>scene.remove(r));rings.length=0;if(!G||G.over||B)return;const p=curP();
 const add=(list,mat)=>list.forEach(n=>{const r=new THREE.Mesh(ringGeo,mat);r.position.set(wx(n),n.top+.02,wz(n));r.userData.hex=n;scene.add(r);rings.push(r)});
 if(G.mode==='act'&&!G.walking)add(moveTargets(p),ringMats.gold);
 else if(G.pending){if(G.pending.type==='pickBeast')add(G.beasts.filter(b=>beastTargets(b).length).map(hexOf),ringMats.red);if(G.pending.type==='moveBeast')add(beastTargets(G.pending.b),ringMats.red);if(G.pending.type==='summon')add(lairs(G.pending.lvl,false),ringMats.violet)}
 if(G.sel)add([G.sel],ringMats.sel)}

window.UI={setN:n=>{setup.n=n;fixHeroes();renderSetup()},setD:n=>{setup.days=n;renderSetup()},name:(i,v)=>setup.players[i].name=v,
 cycle:i=>{const u=new Set(setup.players.slice(0,setup.n).filter((_,j)=>j!==i).map(p=>p.hero));let k=HK.indexOf(setup.players[i].hero);do{k=(k+1)%HK.length}while(u.has(HK[k]));setup.players[i].hero=HK[k];renderSetup()},
 start:startGame,act,acecho:()=>{if(!busy())startAcecho()},ac:(a,l)=>{if(busy())return;if(a==='move')G.pending={type:'pickBeast'};if(a==='summon')G.pending={type:'summon',lvl:l};if(a==='cancel')G.pending=null;if(a==='end'){G.pending=null;return endTurn()}update()},
 roll,flee,accept:()=>{const f=B.pending;B.pending=null;resolve(f)},reroll:()=>{B.rerolls--;B.pending=null;B.busy=false;roll()},bCopal:()=>{const p=B.p;p.items.splice(p.items.indexOf('copal'),1);const b0=p.hp;p.hp=Math.min(p.maxHp,p.hp+3);floatText('+'+(p.hp-b0),p.obj.position.clone().add(new THREE.Vector3(0,1.4,0)),'#8ad06a');burst(p.obj.position.clone().add(new THREE.Vector3(0,.6,0)),24,0x8ad06a,1.2,{up:true});setBMsg(`Quemás copal y recuperás ${p.hp-b0}.`);renderBattle()},
 closeBattle,closeTurn:()=>{$('ovTurn').classList.add('hidden');update()},details:showDetails,help:()=>$('ovHelp').classList.remove('hidden'),
 quality:()=>{quality=quality==='alta'?'baja':'alta';$('bQ').textContent='Calidad '+quality;bloom.enabled=quality==='alta';resize()},
 togglePanel:()=>{$('panel').classList.toggle('mini');$('bMini').textContent=$('panel').classList.contains('mini')?'▴':'▾'}};
renderSetup();

const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let down=null;
canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>8){down=null;return}down=null;if(!G||B||G.over)return;
 ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);const hit=ray.intersectObjects([...rings,...pickables],false)[0];if(hit)onHex(hit.object.userData.hex)});
/* bucle */
const clock=new THREE.Clock();const camDir=new THREE.Vector3();
function tick(){
 const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
 const k=.04;
 sunPos.lerp(new THREE.Vector3(...target.sun),k);sun.position.copy(sunPos);sun.target.position.set(0,0,0);
 lerpC(sun.color,target.sc,k);sun.intensity+=(target.si-sun.intensity)*k;
 lerpC(hemi.color,target.hs,k);lerpC(hemi.groundColor,target.hg,k);hemi.intensity+=(target.hi-hemi.intensity)*k;
 lerpC(scene.background,target.bg,k);lerpC(scene.fog.color,target.fog,k);
 renderer.toneMappingExposure+=(target.exp-renderer.toneMappingExposure)*k;night+=(target.night-night)*k;
 torches.forEach((p,i)=>p.intensity=night*2.6*(0.85+.15*Math.sin(t*9+i*2)));
 MAT.flame.emissiveIntensity=.3+night*3;MAT.door.emissiveIntensity=night*1.6;
 lavas.forEach((p,i)=>p.intensity=(1.2+night*2.2)*(0.85+.15*Math.sin(t*5+i)));
 MAT.lava.emissiveIntensity=2+night*2;
 dust.material.opacity=.5*(1-night);flies.material.opacity=night*.95;
 const dp=dust.geometry.attributes.position;for(let i=0;i<dp.count;i++){dp.setY(i,.6+((dp.getY(i)-.6+dt*.08)%3));dp.setX(i,dp.getX(i)+Math.sin(t*.5+i)*.002)}dp.needsUpdate=true;
 const fp=flies.geometry.attributes.position;for(let i=0;i<fp.count;i++){fp.setX(i,fp.getX(i)+Math.sin(t*1.3+i*7)*.006);fp.setY(i,1+Math.abs(Math.sin(t*.7+i))*1.4);fp.setZ(i,fp.getZ(i)+Math.cos(t*1.1+i*3)*.006)}fp.needsUpdate=true;
 for(let i=0;i<SMK;i++){smokeL[i]+=dt*.25;if(smokeL[i]>1)smokeL[i]-=1;const v=vols[i%vols.length];const l=smokeL[i];smokeP[i*3]=wx(v)+Math.sin(i*3+l*4)*.25*l;smokeP[i*3+1]=v.smokeY+l*2.2;smokeP[i*3+2]=wz(v)-.3+Math.cos(i*5)*.2*l}
 smokeG.attributes.position.needsUpdate=true;smoke.material.opacity=.45*(1-night*.5);
 waters.forEach(m=>{m.map.offset.x=t*.02;m.map.offset.y=Math.sin(t*.4)*.02});
 camRight.setFromMatrixColumn(camera.matrixWorld,0);camRight.y=0;camRight.normalize();
 layout();const now=performance.now();
 ringMat.opacity=.55+.3*Math.sin(t*4);for(const k in ringMats)if(k!=='sel')ringMats[k].opacity=.5+.3*Math.sin(t*4);
 if(G&&!B&&!G.over){const o=curP().obj;arrow.visible=true;arrow.position.set(o.position.x,o.position.y+1.55+Math.sin(t*4)*.08,o.position.z)}else arrow.visible=false;
 for(const b of [...billboards]){const U=b.userData,m=U.spr,mat=m.userData.mat;
  if(U.anim){const A=U.anim,p=Math.min(1,(now-A.t0)/A.dur);b.position.lerpVectors(A.from,A.to,p);b.position.y+=Math.sin(p*Math.PI)*.16;if(p>=1){U.anim=null;U.walk=false;A.cb&&A.cb()}}
  else if(U.lunge){const L=U.lunge,p=Math.min(1,(now-L.t0)/360);b.position.copy(L.base).addScaledVector(L.dir,Math.sin(p*Math.PI)*L.dist);if(p>=1){b.position.copy(L.base);U.lunge=null}}
  else if(U.target&&!U.lock)b.position.lerp(U.target,.15);
  camDir.subVectors(camera.position,b.position);m.rotation.y=Math.atan2(camDir.x,camDir.z);
  const fi=U.walk?2+Math.floor(t*11)%4:Math.floor(t*2.2+U.off)%2;if(mat.map!==U.frames[fi]){mat.map=U.frames[fi];mat.emissiveMap=U.frames[fi]}m.scale.x=U.flip;
  if(U.flashUntil&&now<U.flashUntil)mat.emissiveIntensity=2.4*(Math.floor((U.flashUntil-now)/60)%2?1:.4);else{if(U.flashUntil){mat.emissive.set(0xffffff);U.flashUntil=0}mat.emissiveIntensity=.22+night*.3}
  if(U.dying){const p=(now-U.dying)/800;mat.transparent=true;mat.alphaTest=.01;mat.opacity=Math.max(0,1-p);m.position.y=p*.5}else if(mat.opacity<1){mat.opacity=1;mat.alphaTest=.5;mat.transparent=false;m.position.y=0}
  U.ring.material.opacity=U.dying?0:.6+.25*Math.sin(t*3+b.position.z)}
 for(let i=0;i<PN;i++){if(pLife[i]<=0)continue;pLife[i]-=dt;if(pLife[i]<=0){pPos[i*3+1]=-999;continue}pVel[i*3+1]+=pGrav[i]*dt;const dr=Math.pow(.2,dt);pVel[i*3]*=dr;pVel[i*3+2]*=dr;
  pPos[i*3]+=pVel[i*3]*dt;pPos[i*3+1]+=pVel[i*3+1]*dt;pPos[i*3+2]+=pVel[i*3+2]*dt;const f=pLife[i]/pMax[i];pCol[i*3]=pBase[i*3]*f;pCol[i*3+1]=pBase[i*3+1]*f;pCol[i*3+2]=pBase[i*3+2]*f}
 pGeo.attributes.position.needsUpdate=true;pGeo.attributes.color.needsUpdate=true;
 for(let i=fxRings.length-1;i>=0;i--){const r=fxRings[i],p=(now-r.t0)/r.dur;if(p>=1){scene.remove(r.m);r.m.geometry.dispose();fxRings.splice(i,1);continue}r.m.scale.setScalar(.5+p*r.size);r.m.material.opacity=1-p;r.m.lookAt(camera.position)}
 for(let i=floaters.length-1;i>=0;i--){const f=floaters[i],p=(now-f.t0)/1300;if(p>=1){scene.remove(f.s);floaters.splice(i,1);continue}f.s.position.y=f.y0+Math.min(p*3,1)*.45+p*.3;f.s.material.opacity=p<.7?1:1-(p-.7)/.3}
 bloom.strength=.45+bloomKick;bloomKick*=.9;
 if(camTween){const c=camTween,p=Math.min(1,(now-c.s)/c.dur),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;camera.position.lerpVectors(c.p0,c.p1,e);controls.target.lerpVectors(c.t0v,c.t1,e);if(p>=1){camTween=null;c.cb&&c.cb()}}
 let sh=null;if(shake){const p=(now-shake.t0)/shake.dur;if(p>=1)shake=null;else{const a=shake.amp*(1-p);sh=new THREE.Vector3((Math.random()-.5)*a,(Math.random()-.5)*a,(Math.random()-.5)*a)}}
 if(!camTween)controls.update();else camera.lookAt(controls.target);
 if(sh)camera.position.add(sh);composer.render();if(sh)camera.position.sub(sh);requestAnimationFrame(tick);

}
controls.autoRotate=true;controls.autoRotateSpeed=.5;document.fonts&&document.fonts.load('14px "Press Start 2P"').catch(()=>{});document.getElementById('load').remove();tick();
