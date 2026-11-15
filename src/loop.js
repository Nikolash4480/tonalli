 camRight.setFromMatrixColumn(camera.matrixWorld,0);camRight.y=0;camRight.normalize();
 layout();const now=performance.now();
 ringMat.opacity=.55+.3*Math.sin(t*4);for(const k in ringMats)if(k!=='sel')ringMats[k].opacity=.5+.3*Math.sin(t*4);
 if(G&&!B&&!G.over){const o=curP().obj;arrow.visible=true;arrow.position.set(o.position.x,o.position.y+1.55+Math.sin(t*4)*.08,o.position.z)}else arrow.visible=false;
 /* árboles semitransparentes donde hay una bestia o un héroe (y delante de las bestias grandes, mirando desde la cámara) */
 if(treeHexes.length){const occ=new Set();for(const b of billboards){if(!b.visible||!b.parent)continue;const p=b.position;const big=(b.userData.h||1)>1.1;let cx=camera.position.x-p.x,cz=camera.position.z-p.z;const cl=Math.hypot(cx,cz)||1;cx/=cl;cz/=cl;
   for(const h of treeHexes){const dx=wx(h)-p.x,dz=wz(h)-p.z,d=Math.hypot(dx,dz);if(d<.9||(d<2.2&&(dx*cx+dz*cz)/(d||1)>.45&&(big||d<1.9)))occ.add(h)}}
  for(const h of treeHexes){const tgt=occ.has(h)?.32:1;if(h.treeA===tgt)continue;h.treeA+=(tgt-h.treeA)*.18;if(Math.abs(h.treeA-tgt)<.01)h.treeA=tgt;const tr=h.treeA<.99;for(const m of h.treeMats){m.opacity=h.treeA;m.depthWrite=!tr}}}
 for(const b of [...billboards]){const U=b.userData,m=U.spr,mat=m.userData.mat;
  if(U.anim){const A=U.anim,p=Math.min(1,(now-A.t0)/A.dur);b.position.lerpVectors(A.from,A.to,p);b.position.y+=Math.sin(p*Math.PI)*.16;if(p>=1){U.anim=null;U.walk=false;A.cb&&A.cb()}}
  else if(U.lunge){const L=U.lunge,p=Math.min(1,(now-L.t0)/360);b.position.copy(L.base).addScaledVector(L.dir,Math.sin(p*Math.PI)*L.dist);if(p>=1){b.position.copy(L.base);U.lunge=null}}
  else if(U.target&&!U.lock)b.position.lerp(U.target,.15);
  camDir.subVectors(camera.position,b.position);m.rotation.y=Math.atan2(camDir.x,camDir.z);
  let fi=U.idleN?Math.floor(t*(U.walk?14:7)+U.off*3)%U.idleN:U.walk?2+Math.floor(t*(U.frames.length>6?10:11))%(U.frames.length>8?6:U.frames.length-2):Math.floor(t*2.2+U.off)%2;if(U.heroArt&&U.inCombat&&!U.walk)fi=U.heroArt.g0+Math.floor(t*7+U.off*3)%U.heroArt.gN;if(U.pose){let e=now-U.pose.t0,f=-1;for(const[fr,d]of U.pose.seq){if(e<d){f=fr;break}e-=d}if(f<0)U.pose=null;else if(U.frames[f])fi=f}if(mat.map!==U.frames[fi]){mat.map=U.frames[fi];mat.emissiveMap=U.frames[fi]}m.scale.x=U.flip;
  if(U.flashUntil&&now<U.flashUntil)mat.emissiveIntensity=2.4*(Math.floor((U.flashUntil-now)/60)%2?1:.4);else{if(U.flashUntil){mat.emissive.set(U.rage?0xff6030:0xffffff);U.flashUntil=0}mat.emissiveIntensity=U.sil!=null?U.sil*(.22+night*.3):U.rage?.45+Math.sin(t*5)*.15:.22+night*.3}
  if(U.dying){const p=Math.min(1,(now-U.dying)/800);mat.transparent=true;mat.alphaTest=.01;mat.opacity=Math.max(0,1-p);m.position.y=p*.5}else if(mat.opacity<1){mat.opacity=1;mat.alphaTest=.5;mat.transparent=false;m.position.y=0}
  U.ring.material.opacity=U.dying?0:.6+.25*Math.sin(t*3+b.position.z)}
 for(let i=0;i<PN;i++){if(pLife[i]<=0)continue;pLife[i]-=dt;if(pLife[i]<=0){pPos[i*3+1]=-999;continue}pVel[i*3+1]+=pGrav[i]*dt;const dr=Math.pow(.2,dt);pVel[i*3]*=dr;pVel[i*3+2]*=dr;
  pPos[i*3]+=pVel[i*3]*dt;pPos[i*3+1]+=pVel[i*3+1]*dt;pPos[i*3+2]+=pVel[i*3+2]*dt;const f=pLife[i]/pMax[i];pCol[i*3]=pBase[i*3]*f;pCol[i*3+1]=pBase[i*3+1]*f;pCol[i*3+2]=pBase[i*3+2]*f}
 pGeo.attributes.position.needsUpdate=true;pGeo.attributes.color.needsUpdate=true;
 for(let i=fxRings.length-1;i>=0;i--){const r=fxRings[i],p=(now-r.t0)/r.dur;if(p>=1){scene.remove(r.m);r.m.geometry.dispose();fxRings.splice(i,1);continue}r.m.scale.setScalar(.5+p*r.size);r.m.material.opacity=1-p;r.m.lookAt(camera.position)}
 for(let i=floaters.length-1;i>=0;i--){const f=floaters[i],p=(now-f.t0)/(f.sign?1900:1300);if(p>=1){scene.remove(f.s);floaters.splice(i,1);continue}if(f.sign){f.s.position.y=f.y0+Math.min(p*6,1)*.12;f.s.material.opacity=p<.8?Math.min(1,p*8):1-(p-.8)/.2}else{f.s.position.y=f.y0+Math.min(p*3,1)*.45+p*.3;f.s.material.opacity=p<.7?1:1-(p-.7)/.3}}
 weatherTick(dt,t);
 bloom.strength=.45+bloomKick;bloomKick*=.9;
 if(camTween){const c=camTween,p=Math.min(1,(now-c.s)/c.dur),e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;camera.position.lerpVectors(c.p0,c.p1,e);controls.target.lerpVectors(c.t0v,c.t1,e);if(c.arc){const out=camera.position.clone().sub(controls.target).normalize();camera.position.addScaledVector(out,Math.sin(e*Math.PI)*c.arc)}if(p>=1){camTween=null;c.cb&&c.cb()}}
 let sh=null;if(shake){const p=(now-shake.t0)/shake.dur;if(p>=1)shake=null;else{const a=shake.amp*(1-p);sh=new THREE.Vector3((Math.random()-.5)*a,(Math.random()-.5)*a,(Math.random()-.5)*a)}}
 if(!camTween)controls.update();else camera.lookAt(controls.target);
 if(sh)camera.position.add(sh);composer.render();if(sh)camera.position.sub(sh);requestAnimationFrame(tick);
