
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let down=null;
canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>8){down=null;return}down=null;if(!G||B||G.over)return;
 ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);const hits=ray.intersectObjects([...rings,world],true).filter(x=>!x.object.userData.noPick&&x.object.visible);
 const hexOfHit=x=>{let o=x.object;while(o&&!o.userData.hex&&!o.userData.hexG)o=o.parent;return o?(o.userData.hex||o.userData.hexG):null};
 const mt=G.mode==='act'?moveTargets(curP()):[];const mv=hits.map(hexOfHit).find(x=>x&&mt.includes(x));
 const ringHit=hits.find(x=>rings.includes(x.object)&&x.object.material!==ringMats.sel);
 const target=mv||(ringHit&&ringHit.object.userData.hex)||hits.map(hexOfHit).find(Boolean);if(target)onHex(target)});
