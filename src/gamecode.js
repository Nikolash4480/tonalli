
/* ================= datos de juego ================= */
const $=id=>document.getElementById(id);
const rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const rpick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const RES={maiz:'Maíz',madera:'Madera',piedra:'Piedra',obsidiana:'Obsidiana'};const RK=Object.keys(RES);
const RESOF={M:'maiz',S:'madera',C:'piedra',V:'obsidiana'};
const PHASES=['Mañana','Tarde','Noche'],AP=[6,6,4];
const HEROES={
 jaguar:{name:'Guerrero jaguar',desc:'+1 a cada tirada de combate'},
 aguila:{name:'Guerrero águila',desc:'Su primer movimiento de cada turno es gratis'},
 sacerdotisa:{name:'Sacerdote de Quetzalcóatl',desc:'Repite una tirada por combate y descansar le cura 3'},
 pochteca:{name:'Cazador de Mixcóatl',desc:'Reflejos: una vez por combate, recibe 1 de daño menos de un golpe (mínimo 1)'}};
const HK=Object.keys(HEROES);
const BEASTS={
 calaca:{name:'Calaca del Mictlán',lvl:1,str:3,atk:2,glory:1,eff:'Saqueo: te roba un recurso',scale:1,trophy:'hueso'},
 tzitzimitl:{name:'Tzitzimitl',lvl:2,str:7,atk:1,glory:2,eff:'Eclipse: tu próxima tirada vale 2 menos',scale:1,trophy:'garra'},
 tlaltecuhtli:{name:'Tlaltecuhtli',lvl:3,str:6,atk:2,glory:4,eff:'Mil fauces: su ataque hace el doble',scale:1,trophy:'colmillo'},
 xiuhcoatl:{name:'Xiuhcóatl',lvl:4,str:11,atk:2,glory:8,eff:'Llamarada: su ataque hace el triple',scale:1,trophy:'corazon',boss:true},
 jaguarsol:{name:'Jaguar del Primer Sol',lvl:4,str:10,atk:2,glory:10,eff:'Devorador de gigantes: su ataque hace el doble y recupera esa fuerza',scale:1,trophy:'pielsol',boss:true},
 alacran:{name:'Alacrán de Yappan',lvl:4,str:10,atk:2,glory:8,eff:'Aguijón: te envenena 3 turnos',scale:1,trophy:'aguijon',boss:true},
 tzinacan:{name:'Tzinacan',lvl:4,str:11,atk:2,glory:8,eff:'Mordida de Mictlán: te roba 2 de vida y 1 PA',scale:1,trophy:'ala',boss:true},
 ahuizotl:{name:'Ahuízotl',lvl:1,str:3,atk:1,glory:1,eff:'Arrastre: te hunde y perdés 1 PA',scale:1,trophy:'hueso'},
 chaneque:{name:'Chaneque',lvl:1,str:2,atk:1,glory:1,eff:'Travesura: te esconde un objeto hasta el amanecer',scale:1,trophy:'hueso'},
 xolotl:{name:'Xólotl',lvl:2,str:7,atk:1,glory:2,eff:'Guía de almas: −1 de vida máxima hasta el amanecer',scale:1,trophy:'garra'},
 nahual:{name:'Nahual',lvl:2,str:6,atk:1,glory:2,eff:'Cambio de forma: su próximo ataque hace el doble',scale:1,trophy:'garra'},
 tepeyollotl:{name:'Tepeyóllotl',lvl:3,str:6,atk:2,glory:4,eff:'Rugido: tu próxima tirada se hace dos veces y queda la peor',scale:1,trophy:'colmillo'},
 quinametzin:{name:'Quinametzin',lvl:3,str:8,atk:2,glory:4,eff:'Mazazo: su ataque hace el doble, pero el siguiente lo pierde',scale:1,trophy:'colmillo'},
 xochitonal:{name:'Xochitónal',lvl:3,str:6,atk:2,glory:4,eff:'Mordida: su ataque hace el doble, no podés huir de este combate y perdés 1 PA',scale:1,trophy:'colmillo'},
 guerrero:{name:'Guerrero sin Sol',lvl:4,str:13,atk:3,glory:15,eff:'Golpe de obsidiana: su ataque hace el doble y te rompe un objeto de defensa',scale:1,trophy:'disco',boss:true}};
const BOSSES=['xiuhcoatl','jaguarsol','alacran','tzinacan'];
const BOSS_INFO={
 xiuhcoatl:{wake:'¡Despertó el Xiuhcóatl!',how:'La serpiente de fuego emerge del volcán.',sign:'¡Xiuhcóatl!',lair:'V'},
 jaguarsol:{wake:'¡Despertó el Jaguar del Primer Sol!',how:'Un sol antiguo se enciende en la selva y el devorador de gigantes vuelve a cazar.',sign:'¡Nahui Ocelotl!',lair:'S',pas:'Piel divina: ignora 1 de daño por tirada y sus golpes no se reducen (el Espejo de Tezcatlipoca le anula la piel).'},
 alacran:{wake:'¡Despertó el Alacrán de Yappan!',how:'La tierra se abre y Yappan sale de debajo de las piedras.',sign:'¡Yappan!',lair:'C',pas:'Caparazón: ignora 1 de daño por tirada. El copal cura su veneno.'},
 tzinacan:{wake:'¡Despertó el Tzinacan!',how:'Una nube de murciélagos sube del Mictlán y se junta en uno solo.',sign:'¡Tzinacan!',lair:'any',pas:'Ala de la noche: de noche esquiva 1 de cada 3 golpes.'}};
const bossName=()=>BEASTS[(G&&G.bossKind)||'xiuhcoatl'].name;
const TROPHY={
 hueso:{name:'Hueso del Mictlán',desc:'Se usa en combate: +1 a la próxima tirada. Si lo guardás, +1 de gloria al final'},
 garra:{name:'Garra estelar',desc:'Se usa en combate: +1 a la próxima tirada'},
 corazon:{name:'Corazón de Xiuhcóatl',desc:'+5 de gloria al final'},
 pielsol:{name:'Piel del Primer Sol',desc:'+6 de gloria al final'},
 aguijon:{name:'Aguijón de Yappan',desc:'+5 de gloria al final'},
 ala:{name:'Ala de Tzinacan',desc:'+5 de gloria al final'},
 disco:{name:'Disco del sol apagado',desc:'+8 de gloria al final'},
 colmillo:{name:'Colmillo de Tlaltecuhtli',desc:'Se usa en combate: +2 a la próxima tirada. Si lo guardás, +2 de gloria al final'}};
const TRO_BON={hueso:1,garra:1,colmillo:2};
const UPGRADES={
 piel:{name:'Piel de obsidiana',desc:'+2 de fuerza'},
 colmillos:{name:'Colmillos afilados',desc:'+1 de ataque'},
 sed:{name:'Sed de sangre',desc:'la cara de bestia la cura 2 más'},
 coraza:{name:'Coraza de jade',desc:'ignora 1 de daño por tirada'},
 nocturna:{name:'Furia nocturna',desc:'de noche ataca +1'},
 letargo:{name:'Letargo',desc:'queda pasiva: no embosca ni embiste a los héroes'}};
const UPK=Object.keys(UPGRADES);
UPGRADES.ira={name:'Furia del Quinto Sol',desc:'+3 de fuerza y +1 de ataque'};
const upN=(b,k)=>(b.up||[]).filter(x=>x===k).length;
const strOf=b=>BEASTS[b.kind].str+2*upN(b,'piel')+3*upN(b,'ira');
const atkOf=b=>BEASTS[b.kind].atk+upN(b,'colmillos')+upN(b,'ira')+(G&&(G.phase===2||G.omen==='eclipse')?upN(b,'nocturna'):0)+(G&&G.omen==='eclipse'?1:0);
const HUNT={calaca:{need:7,pts:[1,2,3,4,6,8,10],trophy:'hueso'},tzitzimitl:{need:5,pts:[1,3,5,8,12],trophy:'garra'},tlaltecuhtli:{need:3,pts:[4,8,13],trophy:'colmillo'}};
const huntPts=p=>Object.keys(HUNT).reduce((a,k)=>a+(p.hunt[k]?HUNT[k].pts[p.hunt[k]-1]:0),0);
const BY_LVL={1:'calaca',2:'tzitzimitl',3:'tlaltecuhtli'};
const ROT={1:['calaca','ahuizotl','chaneque'],2:['tzitzimitl','xolotl','nahual'],3:['tlaltecuhtli','tepeyollotl','quinametzin','xochitonal']};
const slotKind=k=>(typeof G!=='undefined'&&G&&G.lvlKind&&BEASTS[k]&&G.lvlKind[BEASTS[k].lvl])||k;
const KILL0=()=>Object.fromEntries(Object.keys(BEASTS).map(k=>[k,0]));
const KPREF={ahuizotl:1,chaneque:0,xolotl:0,nahual:1,tepeyollotl:0,quinametzin:0,xochitonal:1};
function lairFor(kind){const L=LAIRS[BEASTS[kind].lvl]||[];const i=KPREF[kind];return i!=null&&L[i]?L[i]:rpick(L)}
const ITEMS={
 penacho:{name:'Penacho de quetzal',type:'amuleto',tier:3,desc:'+3 de gloria al final'},
 collar:{name:'Collar de jade',type:'amuleto',tier:3,desc:'+1 PA en cada fase'},
 espejo:{name:'Espejo de Tezcatlipoca',type:'amuleto',tier:2,desc:'Repetí una tirada por combate'},
 mascara:{name:'Máscara de Mictlán',type:'amuleto',tier:2,desc:'Las bestias te ignoran cuando entrás en su casilla'},
 copal:{name:'Copal sagrado',type:'consumible',tier:1,desc:'Una vez por día: cura 3 de vida (se recarga al amanecer)',heal:3},
 estandarte:{name:'Estandarte del tlatoani',type:'amuleto',tier:2,desc:'+1 de gloria en cada pedido que entregues'},
 cacaxtli:{name:'Cacaxtli',type:'herramienta',tier:2,desc:'Mochila: +1 recurso al recolectar, una vez por turno'},
 cacao:{name:'Bolsa de cacao',type:'amuleto',tier:1,desc:'+2 de gloria al final'},
 cactli:{name:'Cactli',type:'herramienta',tier:1,desc:'Sandalias: 1 movimiento gratis por turno'},
 coa:{name:'Coa',type:'herramienta',tier:1,desc:'+1 maíz al recolectar en milpa'},
 hacha:{name:'Hacha de cobre',type:'herramienta',tier:1,desc:'+1 madera al recolectar en selva'},
 macuahuitl:{name:'Macuahuitl',type:'arma',tier:3,desc:'Espada de obsidiana: +1 a cada tirada'},
 atlatl:{name:'Átlatl',type:'arma',tier:2,desc:'+2 a la primera tirada de cada combate'},
 chimalli:{name:'Chimalli',type:'defensa',tier:2,desc:'Escudo: bloquea el primer golpe de cada combate y las embestidas del acecho'},
 ichca:{name:'Ichcahuipilli',type:'defensa',tier:2,desc:'Armadura de algodón: +2 de vida máxima'},
 tepoz:{name:'Tepoztopilli',type:'arma',tier:2,desc:'Lanza: +2 a las tiradas contra bestias de nivel 3 o más'},
 canoa:{name:'Canoa',type:'herramienta',tier:2,desc:'Podés cruzar y pararte en los lagos'},
 amuleto:{name:'Amuleto de Tláloc',type:'amuleto',tier:2,desc:'Anula la cara de bestia una vez por combate'},
 agua:{name:'Agua sagrada',type:'consumible',tier:1,desc:'Una vez por día: cura 4 de vida (se recarga al amanecer)',heal:4},
 red:{name:'Red de cazador',type:'herramienta',tier:1,desc:'Las bestias empiezan con 1 de fuerza menos'},
 caracol:{name:'Caracol marino',type:'amuleto',tier:1,desc:'+1 de furia en el acecho'},
 colibri:{name:'Amuleto de colibrí',type:'defensa',tier:2,desc:'Esquivás 1 de cada 3 golpes (combate y acecho)'},
 pelota:{name:'Pelota de hule',type:'amuleto',tier:1,desc:'Los 2 del dado cuentan como 3'},
 yugo:{name:'Yugo de piedra',type:'defensa',tier:2,desc:'Cada golpe que recibís hace 1 menos (mínimo 1)'},
 anillo:{name:'Anillo de piedra',type:'amuleto',tier:2,desc:'+2 de gloria al final'},
 rodilleras:{name:'Rodilleras de cuero',type:'defensa',tier:1,desc:'+1 PA en la noche'},
 munequeras:{name:'Muñequeras',type:'arma',tier:1,desc:'+1 a la primera tirada de cada combate'}};
const CITY_DECKS={teocalli:['penacho','collar','espejo','mascara','estandarte'],mercado:['cacaxtli','cacao','cactli','coa','hacha'],guerreros:['macuahuitl','atlatl','chimalli','ichca','tepoz'],lago:['canoa','amuleto','agua','red','colibri'],pelota:['pelota','yugo','anillo','rodilleras','munequeras']};
const CITY_RES={teocalli:RK_ALL=>['maiz','madera','piedra','obsidiana'],mercado:()=>['maiz','madera'],guerreros:()=>['obsidiana','piedra','madera'],lago:()=>['maiz','piedra'],pelota:()=>['madera','piedra','maiz']};
const CARD_TROPHY={macuahuitl:{colmillo:1},tepoz:{garra:1},penacho:{hueso:2},mascara:{hueso:1},amuleto:{garra:1},anillo:{hueso:2}};
const haveAmt=(p,k)=>RES[k]?p.res[k]:(p.trophies[k]||0);
const canPay=(p,need)=>Object.entries(need).every(([k,v])=>haveAmt(p,k)>=v);
const pay=(p,need)=>Object.entries(need).forEach(([k,v])=>{if(RES[k])p.res[k]-=v;else p.trophies[k]-=v});
function makeCard(k,theme){const it=ITEMS[k],tro=CARD_TROPHY[k]||{},tn=Object.values(tro).reduce((a,b)=>a+b,0),n=Math.max(1,it.tier+1-tn),pool=CITY_RES[theme]();const need=Object.assign({},tro);for(let i=0;i<n;i++){const r=pool[i%pool.length===0?rint(0,pool.length-1):rint(0,pool.length-1)];need[r]=(need[r]||0)+1}return{item:k,need,glory:n}}
const COLORS=['#f0c040','#38c0b0','#ff7aa8','#8ad06a'];
const hdist=(a,b)=>(Math.abs(a.q-b.q)+Math.abs(a.r-b.r)+Math.abs(a.q+a.r-b.q-b.r))/2;
const RICON={maiz:["..g.....",".gyy....",".yyyy...","..yYyy..","..yyYy..","...yyyg.","...gyyg.","....gg.."],madera:["........","..bbbbb.",".bBBbbbb","bBbBBbbb","bBBbBbbn",".bBBbnn.","..nnnn.."],piedra:["...AA...","..AAaA..",".AaAAaa.",".AAAaaa.","AaAaaas.",".sssss.."],obsidiana:["...x....","..xOx...","..xxz...",".xxOzx..",".xxxzx..","xxxOxxx.",".xxxxx.."]};
RICON.hueso=['w......w','Ww....wW','.wwwwww.','Ww....wW','w......w'];RICON.garra=['..x.....','.xOx....','.xzOx...','..xzOx..','...xzx..','....R...','...RrR..'];RICON.pielsol=['.YYYYY.','YyNYyNY','YNYYYyY','YyYNyYY','.YYYYY.'];RICON.aguijon=['....xx.','...xOx.','..xOx..','.xOx...','xxx....','.R.....'];RICON.ala=['R.....R','RR...RR','RrR.RrR','RrrRrrR','.RrrrR.','..R.R..'];RICON.disco=['..YYY..','.YyNyY.','YyNNNyY','YNNNNNY','YyNNNyY','.YyNyY.','..YYY..'];RICON.corazon=['.RR.RR.','RYyRyyR','RyyyyyR','.RyyyR.','..RyR..','...R...'];RICON.colmillo=['wW..','wWv.','.wWv','.wWv','..wv','..wv','...v'];
const RICO={};for(const k in RICON)RICO[k]=renderRows(RICON[k].map(r=>r.padEnd(8,'.'))).toDataURL();
const PORTRAIT={};
function PORTRAIT_URL(key,hue=0){const c=key+'|'+hue;if(!PORTRAIT[c])PORTRAIT[c]=(typeof NEW_ART!=='undefined'&&NEW_ART[key]?newArtFrames(key)[0]:typeof BOSS_ART!=='undefined'&&BOSS_ART[key]&&key!=='pal'?renderPal(BOSS_ART[key],BOSS_ART.pal):HERO_FRAMES[key]?renderHero(HERO_FRAMES[key][0],hue):renderRows(composeFrame(key,0),hue)).toDataURL();return PORTRAIT[c]}
const QZ_ROWS=["................................................", "..................Gg........gG..................", "..................GGg......gGG..................", ".................gGGGg....gGGGg.................", ".................geEEe....eEEeg.................", "..........g......eeEEef..feEEee......g..........", ".........GGgg....eeEEeeffeeEEee....ggGG.........", ".........gGGeef..eeEEEeffeEEEee..feeGGg.........", ".........gGEEeef.feEEEeRReEEEef.feeEEGg.........", ".........geEEEeeRReeEEeRReEEeeRReeEEEeg.........", "..........eeEEEeRRReEErRRrEEeRRReEEEee..........", "..........feEEEeeRRrEErRRrEErRReeEEEef..........", "..........feejjjjjjjjjjjjjjjjjjjjjjeef..........", "...Gggefff.RjtTttTttTttTTttTttTttTtjR.fffeggG...", "...GGGeeeeejtTtjtTtjtTtjjtTtjtTtjtTtjeeeeeGGG...", "...gGEEEEejttjjjjjjttTttttTttjjjjjjttjeEEEEGg...", "....geEEEEjtjjgggggjjttttttjjgggggjjtjEEEEeg....", ".....eeeEEjtjgGGGGGgjtTttTtjgGGGGGgjtjEEeee.....", "......feeejtgGTTTTTGgttttttgGTTTTTGgtjeeef......", ".......feejtgGTwwwTGgtjttjtgGTwwwTGgtjeef.......", ".......fRRjtgGTwkkTGgttttttgGTkkwTGgtjRRf.......", "....feeeeRjtgGTwkkTGgtTttTtgGTkkwTGgtjReeeef....", "..ggeeeeeejtgGTTTTTGgttttttgGTTTTTGgtjeeeeeegg..", ".GGGEEEEEEjttgGGGGGhtttttttthGGGGGgttjEEEEEEGGG.", ".GGGEEEEEEjtttghhhhtjggggggjthhhhgtttjEEEEEEGGG.", "..ggeeeeeejttTtttttjgGkkkkGgjtttttTttjeeeeeegg..", "....feeeeRjtttttttttgGkGGkGgtttttttttjReeeef....", ".......fRRjjtttttttttggggggtttttttttjjRRf.......", ".......feejrrrrrrrrrrrrrrrrrrrrrrrrrrjeef.......", "......feeerWWrWrWrWrWrWrrWrWrWrWrWrWWreeef......", ".....eeeEErWWWddddddddddddddddddddWWWrEEeee.....", "....geEEEErWWWddddddddddddddddddddWWWrEEEEeg....", "...gGEEEEeerWWddddddddddddddddddddWWreeEEEEGg...", "...GGGeeeeerWddWdWdWdWdWWdWdWdWdWddWreeeeeGGG...", "...GggefffjrrrrrrrrrrrrrrrrrrrrrrrrrrjfffeggG...", "..........jtttTtttTtttTttTtttTtttTtttj..........", "..........fjjjjjjjjjjjjjjjjjjjjjjjjjjf..........", "..........eeEEEeRRReEErRRrEEeRRReEEEee..........", ".........geEEEeeRReeEEeRReEEeeRReeEEEeg.........", ".........gGEEeef.feEEEeRReEEEef.feeEEGg.........", ".........gGGeef..eeEEEeffeEEEee..feeGGg.........", ".........GGgg....eeEEeeffeeEEee....ggGG.........", "..........g......eeEEef..feEEee......g..........", ".................geEEe....eEEeg.................", ".................gGGGg....gGGGg.................", "..................GGg......gGG..................", "..................Gg........gG..................", "................................................"];
function portrait(key,size=44,hue=0){return`<img src="${PORTRAIT_URL(key,hue)}" class="spr" style="height:${size}px;width:auto">`}
const HERO_HUE={jaguar:45,aguila:30,sacerdotisa:172,pochteca:8},PLAYER_HUE=[45,175,330,100];
function heroHue(list,i){const k=list[i].hero;if(!list.slice(0,i).some(q=>q.hero===k))return 0;return PLAYER_HUE[i]}
const resHTML=res=>RK.map(k=>`<span class="res" data-tip="${RES[k]}"><img class="ico" src="${RICO[k]}" alt="${RES[k]}">${res[k]}</span>`).join('');
const needHTML=need=>Object.entries(need).map(([k,v])=>`<span class="res" data-tip="${RES[k]||TROPHY[k].name+': '+TROPHY[k].desc}"><img class="ico" src="${RICO[k]}" alt="${RES[k]||TROPHY[k].name}">×${v}</span>`).join('');

/* stock: pequeños marcadores sobre cada hexágono con recurso */
const pipMat=new THREE.MeshStandardMaterial({color:0xf4ecd8,emissive:0xf4ecd8,emissiveIntensity:.25,roughness:.6});
for(const h of hexes.values()){h.stock=RESOF[h.t]?2:0;if(RESOF[h.t]){h.pips=[0,1].map(i=>{const m=new THREE.Mesh(BOX,pipMat);m.scale.set(.09,.09,.09);m.position.set(-.08+i*.16,h.top+.05,-.72);h.g.add(m);return m})}}
const allHex=[...hexes.values()];
const cities=allHex.filter(h=>TERR[h.t].city);
const CITY_INFO={teocalli:{name:'Teocalli Mayor',kind:'Capital sagrada',col:'#f0c040'},mercado:{name:'Xalpan',kind:'Ciudad mercado',col:'#e8703a'},guerreros:{name:'Itzapan',kind:'Ciudad guerrera',col:'#9a6ae0'},lago:{name:'Tecolco',kind:'Ciudad del lago',col:'#30b8d8'},pelota:{name:'Ayotla',kind:'Ciudad del juego de pelota',col:'#6ab84a'}};
cities.forEach(h=>{h.name=CITY_INFO[h.theme].name});

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
function tweenCam(pos,tgt,dur=700,cb,arc=0){camTween={p0:camera.position.clone(),t0v:controls.target.clone(),p1:pos,t1:tgt,s:performance.now(),dur,cb,arc}}


const ICONS={
 gather:["....yy......","...yYy.g....","..yyy.gg....","..y..gg.....",".bbbbbbbbb..",".bBBbBBbBb..",".bbbbbbbbb..","..bBbBbBb...","..bbbbbbb...","...nnnnn...."],
 fight:["x.........x.",".xO.....Ox..","..xO...Ox...","...xO.Ox....","....xOx.....","....xOx.....","...xO.Ox....","..bb...bb...",".bb.....bb..","bb.......bb."],
 deliver:[".....gg.....","....gGGg....","....rrrr....","...rRwwRr...","..rrRwwRrr..",".rRRrwwrRRr.","rrrrrwwrrrrr"],
 forge:["....R.......","...RyR..R...","..RyYyRRyR..","..RyYYyyYR..","...RyyyyR...","....xxxx....","...xOzzzx...","..xxxxxxxx..","....nnnn....","...nnnnnn..."],
 rest:[".rr...rr.","rRRr.rRrr","rRrrrrrrr","rrrrrrrrd",".rrrrrrd.","..rrrrd..","...rrd...","....d...."],
 copal:["...A.A..","..A.A...","...A.A..","..A.A...","bbbbbbbb",".bBBBBb.","..bbbb.."],
 end:["bbbbbbb",".wyyyw.","..wyw..","...y...","..w.w..",".wyyyw.","bbbbbbb"],
 paw:[".a...a.","aA..aA.","...a...",".a.Aa..","..aAAa.",".aAAAAa","..aAAa."]};
ICONS.hunt=['.g..g..g.','gGg.gGg.g','gYgggGgYg','ggggggggg','gRgTgRgTg','ggggggggg'];ICONS.fly=['..TTT..','.T...T.','T..t..T','T.t.t.T','T..t..T','.T...T.','..TTT..'];ICONS.trade=['.yy..bb.','yYyybBbb','.yy..bb.','..w..w..','.wwwwww.','..w..w..'];ICONS.shield=['.gggg.','gTTTTg','gTRRTg','gTRRTg','gTTTTg','.gggg.'];ICONS.gem=['..G...','.GgG..','GgEgG.','gEEEg.','.gEg..','..g...'];ICONS.board=['wwwwwww','wbbbbbw','wwwwwww','wbbbbbw','wwwwwww','wbbbbbw','wwwwwww'];
const ICO={};for(const k in ICONS){const w=Math.max(...ICONS[k].map(r=>r.length));ICO[k]=renderRows(ICONS[k].map(r=>r.padEnd(w,'.'))).toDataURL()}
const TYPEICO={arma:'fight',defensa:'shield',amuleto:'gem',consumible:'copal',herramienta:'gather'};
const LABEL={fly:'Viajar con el viento',trade:'Comerciar',hunt:'Entregar trofeos (cacería)',gather:'Recolectar',fight:'Luchar',deliver:'Entregar pedido',agua:'Agua sagrada',rest:'Descansar',copal:'Copal',end:'Terminar',paw:'Mover bestia'};
const WHY={fly:'parate en un Altar de Ehécatl con 2 PA',trade:'en el mercado de Xalpan, con 2 recursos iguales',hunt:'en el Teocalli Mayor, con trofeos de una cacería abierta',gather:'acá no hay recurso para juntar (o hay una bestia)',fight:'no hay ninguna bestia en tu hexágono',deliver:'tenés que estar en una ciudad con los recursos de su carta',agua:'ya la usaste hoy o no estás herido',rest:'solo en una ciudad y si estás herido',copal:'ya lo usaste hoy o no estás herido'};
function toast(m){$('toast').textContent=m;$('toast').classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('show'),2400)}
function signText(txt,g){const c=document.createElement('canvas'),x=c.getContext('2d');const F='12px "Press Start 2P", monospace';x.font=F;const w=Math.ceil(x.measureText(txt).width)+18;c.width=w;c.height=26;
 x.fillStyle='#0a0710';x.fillRect(0,0,w,26);x.fillStyle='#e3b04b';x.fillRect(1,1,w-2,24);x.fillStyle='#1a1422';x.fillRect(2,2,w-4,22);x.fillStyle='#2a2036';x.fillRect(2,2,w-4,9);
 x.font=F;x.textBaseline='middle';x.fillStyle='#000000';x.fillText(txt,10,15);x.fillStyle='#ffffff';x.fillText(txt,9,14);
 const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
 const hh=.44;s.scale.set(hh*w/26,hh,1);const pos=g.position.clone().add(new THREE.Vector3(0,1.85,0));s.position.copy(pos);s.renderOrder=31;scene.add(s);floaters.push({s,t0:performance.now(),y0:pos.y,sign:true})}
function acechoOptions(){if(!G||G.mode!=='acecho')return[];const o=[];
 if(G.furia>=1&&G.beasts.some(b=>!BEASTS[b.kind].boss&&beastTargets(b).length))o.push('paw');
 [...new Set(G.respawn.map(r=>r.kind))].forEach(k=>{const l=BEASTS[k].lvl;if(G.furia>=l+1&&lairs(l,false).length&&G.beasts.length<5+G.players.length)o.push('sum:'+k)});return o}
function anyAction(p){const cd=canDo();return moveTargets(p).length>0||cd.gather||cd.fight||cd.deliver||cd.rest||cd.hunt}
function autoCheck(){clearTimeout(autoCheck.t);if(!G||B||G.over||G.walking||G.transition)return;
 autoCheck.t=setTimeout(()=>{if(!G||B||G.over||G.walking||G.transition)return;const p=curP();
  if(G.endAfterKO||G.mode==='respawn')return;if(G.mode==='act'&&!anyAction(p))startAcecho();
  else if(G.mode==='acecho'&&!G.pending&&!acechoOptions().length){toast('Sin más acciones: turno siguiente');endTurn()}},1000)}


const OMENS={
 lluvia:{name:'Lluvias de Tláloc',desc:'La milpa da maíz doble'},
 eclipse:{name:'Eclipse',desc:'Todo el día es de noche y las bestias atacan +1'},
 fiesta:{name:'Fiesta del Sol',desc:'Las cartas de ciudad dan +1 de gloria'},
 migracion:{name:'Migración',desc:'Al amanecer las bestias se mueven 1 casilla'},
 viento:{name:'Viento de Ehécatl',desc:'Todos tienen 1 movimiento gratis por turno'},
 erupcion:{name:'Erupción',desc:'Los volcanes dan obsidiana doble, pero subir quita 1 de vida'},
 niebla:{name:'Niebla del Mictlán',desc:'Las bestias no emboscan'}};
const omen=k=>G&&G.omen===k;
/* clima */
function mkPts(n,size,color,opacity,blend){const g=new THREE.BufferGeometry();const a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=(Math.random()-.5)*26;a[i*3+1]=Math.random()*9;a[i*3+2]=(Math.random()-.5)*24}g.setAttribute('position',new THREE.BufferAttribute(a,3));const m=new THREE.PointsMaterial({size,color,transparent:true,opacity,depthWrite:false,blending:blend||THREE.NormalBlending});const o=new THREE.Points(g,m);o.frustumCulled=false;o.visible=false;scene.add(o);return o}
const rainGeo=new THREE.BufferGeometry();const RN=1400;const rainArr=new Float32Array(RN*6);for(let i=0;i<RN;i++){const x=(Math.random()-.5)*28,y=Math.random()*10,z=(Math.random()-.5)*26;rainArr.set([x,y,z,x+.06,y-.45,z],i*6)}rainGeo.setAttribute('position',new THREE.BufferAttribute(rainArr,3));
const rainObj=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xb8d8ff,transparent:true,opacity:.55,depthWrite:false}));rainObj.frustumCulled=false;rainObj.visible=false;scene.add(rainObj);
const WX={rain:rainObj,petals:mkPts(300,.32,0xffa020,1),ash:mkPts(450,.24,0x2e2a2c,.85),dust:mkPts(320,.2,0xe0c898,.7)};
const citySmoke=mkPts(160,.16,0xb8b0a8,.35);citySmoke.visible=true;const smokeSrc=cities.map(c=>[wx(c),c.top+.5,wz(c)]);const smokeLife=new Float32Array(160).map(()=>Math.random());
let fogT={near:40,far:95};
function weatherTick(dt,t){
 altarFx.forEach((m,i)=>{m.rotation.z+=dt*(2+i);m.position.y=.22+(i*.14)+Math.sin(t*2+i)*.03});
 const k=G&&G.omen;WX.rain.visible=k==='lluvia';WX.petals.visible=k==='fiesta';WX.ash.visible=k==='erupcion';WX.dust.visible=k==='viento'||k==='migracion';
 const step=(o,f)=>{if(!o.visible)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){f(a,i)}a.needsUpdate=true};
 if(WX.rain.visible){const a=WX.rain.geometry.attributes.position;for(let i=0;i<RN;i++){let y=a.getY(i*2)-dt*16;if(y<0)y+=10;a.setY(i*2,y);a.setY(i*2+1,y-.45)}a.needsUpdate=true}
 step(WX.petals,(a,i)=>{let y=a.getY(i)-dt*.9;if(y<0)y+=9;a.setY(i,y);a.setX(i,a.getX(i)+Math.sin(t*1.5+i)*dt*.6);a.setZ(i,a.getZ(i)+Math.cos(t+i)*dt*.4)});
 step(WX.ash,(a,i)=>{let y=a.getY(i)-dt*.6;if(y<0)y+=9;a.setY(i,y);a.setX(i,a.getX(i)+Math.sin(t*.7+i)*dt*.3)});
 step(WX.dust,(a,i)=>{let x=a.getX(i)+dt*(k==='viento'?6:2.2);if(x>13)x-=26;a.setX(i,x);a.setY(i,.4+Math.abs(Math.sin(t*.8+i))*2)});
 const cs=citySmoke.geometry.attributes.position;for(let i=0;i<cs.count;i++){smokeLife[i]+=dt*.22;if(smokeLife[i]>1)smokeLife[i]-=1;const s=smokeSrc[i%smokeSrc.length],l=smokeLife[i];cs.setXYZ(i,s[0]+Math.sin(i*7+l*3)*.25*l-.2,s[1]+l*2.4,s[2]+Math.cos(i*3)*.2*l-.2)}cs.needsUpdate=true;
 citySmoke.material.opacity=k==='erupcion'?.5:.3;
 fogT=k==='niebla'?{near:8,far:34}:k==='erupcion'?{near:22,far:70}:k==='lluvia'?{near:26,far:80}:{near:40,far:95};
 scene.fog.near+=(fogT.near-scene.fog.near)*.03;scene.fog.far+=(fogT.far-scene.fog.far)*.03;
 if(k==='lluvia'){sun.intensity*=.985;hemi.intensity*=.99;scene.fog.color.lerp(new THREE.Color(0x8a9ab0),.04)}
 if(k==='niebla')scene.fog.color.lerp(new THREE.Color(0x9a9aa8),.03);if(k==='erupcion')scene.fog.color.lerp(new THREE.Color(0x6a4038),.02);
}
function drawOmen(){const P={no:0,ocasionales:.35,frecuentes:.65}[G.omenMode||'ocasionales'];if(Math.random()>=P){G.omen=null;setPhaseLight();return}const keys=Object.keys(OMENS).filter(k=>k!==G.omen);G.omen=rpick(keys);const o=OMENS[G.omen];log(`Presagio del día ${G.day}: ${o.name}.`);setTimeout(()=>sfxP('presagio'),2300);
 setTimeout(()=>msg('Presagio del día',`<div class="card" style="text-align:center;border-color:#b070ff"><div style="font-size:15px;opacity:.7">Día ${G.day}</div><b style="font-size:24px">${o.name}</b><div>${o.desc}</div></div>`),2400);
 if(G.omen==='migracion')setTimeout(()=>{G.beasts.filter(b=>!BEASTS[b.kind].boss).forEach((b,i)=>{const t=nbrs(hexes,hexOf(b)).filter(canStand);if(!t.length)return;const h=rpick(t);b.q=h.q;b.r=h.r;b.obj.userData.lock=true;setTimeout(()=>walkObj(b.obj,slotPos(h,0),700,()=>{b.obj.userData.lock=false}),i*80)})},800)}

/* guardado */
function saveGame(){if(!G||G.over)return;try{const d={v:1,lvlKind:G.lvlKind||null,stage:G.stage||null,stageDone:!!G.stageDone,bestias:G.bestias,bossKind:G.bossKind,extras:G.extras,altars:G.altars,respawnMode:G.respawnMode,omenMode:G.omenMode,seed:SEED,day:G.day,days:G.days,phase:G.phase,cur:G.cur,start:G.start,turnCount:G.turnCount,respawn:G.respawn,hunts:G.hunts,kindUps:G.kindUps||{},bossDone:!!G.bossDone,omen:G.omen||null,log:G.log.slice(0,30),
 players:G.players.map(p=>({name:p.name,hero:p.hero,color:p.color,hue:p.hue||0,hp:p.hp,maxHp:p.maxHp,res:p.res,glory:p.glory,dignityLost:p.dignityLost,kills:p.kills,trophies:p.trophies,hunt:p.hunt,items:p.items,used:p.used||{},poison:p.poison||0,soul:p.soul||0,hidden:p.hidden||null,q:p.q,r:p.r})),
 beasts:G.beasts.map(b=>({kind:b.kind,q:b.q,r:b.r,up:b.up,wound:b.wound||0})),cities:cities.map(c=>({card:c.card,deck:c.deck,done:c.done||[]})),stock:allHex.filter(h=>RESOF[h.t]).map(h=>h.stock)};
 persistSave(d)}catch(e){console.warn(e)}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY)}catch(e){}}
function continueGame(){const d=SAVED;try{
 controls.autoRotate=false;[coy,ahu,cip,hero,ally].forEach(o=>removeBillboard(o));
 G={lvlKind:d.lvlKind||null,stage:d.stage||null,stageDone:!!d.stageDone,bestias:d.bestias||'clasicas',bossKind:d.bossKind||'xiuhcoatl',extras:d.extras||'ninguno',altars:!!d.altars,respawnMode:d.respawnMode||'auto',omenMode:d.omenMode||'ocasionales',hunts:d.hunts,kindUps:d.kindUps||{},players:[],beasts:[],respawn:(d.respawn||[]).map(r=>typeof r==='string'?{kind:r}:r),day:d.day,days:d.days,phase:d.phase,cur:d.cur,start:d.start,turnCount:d.turnCount,mode:'act',sel:null,log:d.log||[],bossDone:d.bossDone,omen:d.omen};
 G.players=d.players.map((s,i)=>{const o=Object.assign({ap:0,freeMoves:0,gatherBonus:false},s);o.kills=Object.assign(KILL0(),o.kills);o.trophies=Object.assign({hueso:0,garra:0,colmillo:0,corazon:0,pielsol:0,aguijon:0,ala:0,disco:0},o.trophies);o.obj=makeBillboard(o.hero,1,parseInt(o.color.slice(1),16),o.hue);o.obj.position.copy(hexCenter(hexOf(o)));return o});
 d.beasts.forEach(s=>{const h=hexes.get(key(s.q,s.r));const b=spawn(s.kind,h,false);if(b){b.up=s.up||[];b.wound=s.wound||0;if(b.up.includes('ira')){b.obj.scale.setScalar(1.2);const fl=new THREE.PointLight(0xff5020,2.2,3,1.6);fl.position.set(0,1.2,0);b.obj.add(fl);b.obj.userData.rage=true}}});
 cities.forEach((c,i)=>{c.card=d.cities[i].card;c.deck=d.cities[i].deck;c.done=d.cities[i].done||[]});
 let si=0;allHex.filter(h=>RESOF[h.t]).forEach(h=>h.stock=d.stock[si++]);
 log(`Partida retomada: día ${G.day}, ${PHASES[G.phase].toLowerCase()}.`);if(G.stage)setTimeout(()=>{stageAsh(true);setPhaseLight()},400);
 if(G.altars)buildAltars();
 $('ovSetup').classList.add('hidden');$('hud').classList.remove('hidden');$('panel').classList.remove('hidden');beginTurn();
 }catch(e){console.error(e);if(NET.on){toast('Error al sincronizar la partida');return}clearSave();toast('No se pudo cargar la partida guardada');location.reload()}}

/* ================= estado ================= */
let G=null,B=null;
const curP=()=>G.players[G.cur];
const hexOf=p=>hexes.get(key(p.q,p.r));
const beastAt=h=>G.beasts.find(b=>b.q===h.q&&b.r===h.r);
const heroesAt=h=>G.players.filter(p=>p.q===h.q&&p.r===h.r);
const has=(p,it)=>p.items.includes(it)&&!(p.broken&&p.broken[it])&&!(p.hidden&&p.hidden[it]);
const maxAP=p=>Math.max(2,AP[G.phase]-p.dignityLost+(has(p,'collar')?1:0)+(G.phase===2&&has(p,'rodilleras')?1:0));
function log(m){G.log.unshift(m);if(G.log.length>60)G.log.pop()}
const msgQ=[];function msg(title,body,spr){if(!$('ovMsg').classList.contains('hidden')){msgQ.push([title,body,spr]);return}$('mTitle').textContent=title;$('mBody').innerHTML=(spr?portrait(spr,64)+'<br>':'')+body;$('ovMsg').classList.remove('hidden')}
function msgNext(){$('ovMsg').classList.add('hidden');if(msgQ.length){const m=msgQ.shift();setTimeout(()=>msg(...m),250)}}
function newDemand(){const t=shuffle(RK.slice()).slice(0,2);const need={};const n=rint(2,4);for(let i=0;i<n;i++){const k=t[i%2];need[k]=(need[k]||0)+1}return{need,glory:n+(need.obsidiana?1:0)}}
function newWanted(tier){const need={};for(let i=0;i<tier+1;i++){const k=rpick(RK);need[k]=(need[k]||0)+1}return{tier,need}}
const canStand=h=>!TERR[h.t].water&&!TERR[h.t].city&&!TERR[h.t].district;
const canHold=h=>canStand(h)&&!beastAt(h);
const beastsAt=h=>G.beasts.filter(b=>b.q===h.q&&b.r===h.r);
const LAIRS={1:[],2:[],3:[]},LAIRN={1:2,2:2,3:2},CAP={calaca:6,tzitzimitl:4,tlaltecuhtli:3,ahuizotl:6,chaneque:6,xolotl:4,nahual:4,tepeyollotl:3,quinametzin:3,xochitonal:3,xiuhcoatl:1,jaguarsol:1,alacran:1,tzinacan:1,guerrero:1},START={calaca:5,tzitzimitl:3,tlaltecuhtli:2};
const LAIRCOL={1:0xffa040,2:0xb070ff,3:0xff3030};
(function pickLairs(){const used=[];const free=h=>!TERR[h.t].water&&!TERR[h.t].city&&!TERR[h.t].district&&!used.includes(h)&&cities.every(c=>hdist(c,h)>=2);
 const nearT=(h,t)=>nbrs(hexes,h).some(n=>n.t===t);const prefs={3:[h=>h.t==='V',h=>h.t==='V'],2:[h=>h.t==='C',h=>h.t==='M'||h.t==='S'],1:[h=>h.t==='S',h=>nearT(h,'L')||h.t==='M']};
 const dCap=h=>hdist(h,capital);
 for(const lvl of [3,2,1])for(let n=0;n<LAIRN[lvl];n++){
  let c=allHex.filter(h=>free(h)&&prefs[lvl][n%2](h)&&dCap(h)>=3);if(!c.length&&lvl===3)c=allHex.filter(h=>free(h)&&prefs[3][0](h)&&dCap(h)>=2);if(!c.length&&lvl===3)c=allHex.filter(h=>free(h)&&h.t==='C'&&nearT(h,'V')&&dCap(h)>=2);if(!c.length)c=allHex.filter(h=>free(h)&&dCap(h)>=3);if(!c.length)c=allHex.filter(h=>free(h)&&dCap(h)>=2);
  const score=h=>Math.min(dCap(h)+1,...used.map(u=>hdist(u,h)*(u.lair===lvl?1.4:1)),99)+rnd()*.8;
  c.sort((x,y)=>score(y)-score(x));const h=c[0];if(!h)continue;LAIRS[lvl].push(h);used.push(h);h.lair=lvl}
 const em=c=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:1.6});const glow={1:em(0xffa040),2:em(0xb070ff),3:em(0xff3020)};
 const bone=new THREE.MeshStandardMaterial({color:0xf4ecd8,roughness:.8}),dark=new THREE.MeshStandardMaterial({color:0x120c18});
 const tooth=new THREE.ConeGeometry(.035,.14,4);
 for(const lvl of [1,2,3])for(const h of LAIRS[lvl]){const L=new THREE.Group();const a=Math.atan2(wz(h),wx(h));const lp=h.t==='V'?[.45,0]:[-.36,-.3];L.position.set(lp[0],h.top,lp[1]);L.rotation.y=-a+Math.PI/2;L.scale.setScalar(1.6);
  h.g.children.filter(c=>c.type==='Mesh'&&!c.userData.hex&&!(h.pips||[]).includes(c)&&Math.hypot(c.position.x-lp[0],c.position.z-lp[1])<.42&&c.position.y>h.top-.01&&c.geometry===BOX).forEach(c=>h.g.remove(c));h.g.add(L);
  if(lvl===1){box(MAT.wood,.04,.38,.04,-.15,0,0,0,L);box(MAT.wood,.04,.38,.04,.15,0,0,0,L);box(MAT.wood,.38,.03,.03,0,.3,0,0,L);box(MAT.wood,.38,.03,.03,0,.18,0,0,L);
   for(const yy of [.21,.33])for(let i=0;i<4;i++){const x=-.11+i*.075;box(bone,.06,.06,.06,x,yy-.03,.02,0,L);box(dark,.015,.015,.01,x-.013,yy+.005,.052,0,L);box(dark,.015,.015,.01,x+.013,yy+.005,.052,0,L)}
   for(let i=0;i<5;i++)box(glow[1],.05,.05,.05,-.2+i*.1,0,.14,i,L)}
  if(lvl===2){box(MAT.obs,.08,.4,.08,-.14,0,0,0,L);box(MAT.obs,.08,.4,.08,.14,0,0,0,L);box(MAT.obs,.38,.08,.1,0,.4,0,0,L);box(MAT.obs,.12,.06,.12,0,.48,0,.78,L);
   const orb=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),glow[2]);orb.position.set(0,.22,0);L.add(orb);box(glow[2],.04,.04,.04,-.14,.42,.05,0,L);box(glow[2],.04,.04,.04,.14,.42,.05,0,L)}
  if(lvl===3){const pit=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.02,12),glow[3]);pit.position.y=.01;L.add(pit);
   for(let i=0;i<10;i++){const an=i/10*Math.PI*2;const t=new THREE.Mesh(tooth,bone);t.position.set(Math.cos(an)*.22,.07,Math.sin(an)*.22);t.rotation.z=-Math.cos(an)*.4;t.rotation.x=Math.sin(an)*.4;t.castShadow=true;L.add(t)}
   for(let i=0;i<6;i++){const an=i/6*Math.PI*2+.3;box(MAT.stone2,.09,.06,.09,Math.cos(an)*.3,0,Math.sin(an)*.3,an,L)}}
 }
})();
const ALTARS=(()=>{const r=srand(SEED*7+3);const used=[];const ok=h=>!TERR[h.t].water&&!TERR[h.t].city&&!TERR[h.t].district&&!h.lair&&h.t!=='V'&&cities.every(c=>hdist(c,h)>=2);
 for(let n=0;n<4;n++){const c=allHex.filter(h=>ok(h)&&!used.includes(h));const sc=h=>Math.min(hdist(h,capital),...used.map(u=>hdist(u,h)),99)+r()*.9;c.sort((a,b)=>sc(b)-sc(a));if(c[0])used.push(c[0])}return used})();
const altarFx=[];
function buildAltars(){const stone=new THREE.MeshStandardMaterial({color:0xc8c0b0,roughness:.9}),wind=new THREE.MeshStandardMaterial({color:0x7ae8f0,emissive:0x38c0d8,emissiveIntensity:1.2,transparent:true,opacity:.75});
 ALTARS.forEach(h=>{h.altar=true;const g=new THREE.Group();g.position.set(.38,h.top,-.32);h.g.add(g);
  h.g.children.filter(c=>c.type==='Mesh'&&!c.userData.hex&&!(h.pips||[]).includes(c)&&Math.hypot(c.position.x-.38,c.position.z+.32)<.42&&c.geometry===BOX).forEach(c=>h.g.remove(c));
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.3,.34,.08,10),stone);base.position.y=.04;base.castShadow=base.receiveShadow=true;g.add(base);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;box(stone,.06,.3,.06,Math.cos(a)*.24,.08,Math.sin(a)*.24,0,g)}
  for(let i=0;i<3;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.12+i*.07,.018,6,18),wind);t.rotation.x=Math.PI/2;t.position.y=.22+i*.14;g.add(t);altarFx.push(t)}})}
function lairs(lvl,avoid){if(lvl===4)return allHex.filter(h=>h.t==='V'&&canHold(h));const L=LAIRS[lvl].filter(canHold);if(L.length)return L;
 /* guaridas llenas: la casilla libre más cercana a una guarida */const n=[...new Set(LAIRS[lvl].flatMap(h=>nbrs(hexes,h)))].filter(canHold);return n.length?n:allHex.filter(canHold)}
function spawn(kind,h,fx){const d=BEASTS[kind];if(G.beasts.filter(b=>b.kind===kind).length>=CAP[kind])return null;if(!h){const c=lairs(d.lvl);const pf=KPREF[kind]!=null&&LAIRS[d.lvl]?LAIRS[d.lvl][KPREF[kind]]:null;h=pf&&c.includes(pf)?pf:c.length?rpick(c):null}if(!h)return null;
 const b={kind,q:h.q,r:h.r,up:[]};if(G&&G.kindUps&&G.kindUps[kind]&&!d.boss)b.up=G.kindUps[kind].slice();b.obj=makeBillboard(kind,d.scale,d.boss?0xff9a20:0xff4a3a);b.obj.position.copy(hexCenter(h));G.beasts.push(b);
 if(fx){const p=hexCenter(h).add(new THREE.Vector3(0,.4,0));if(!entranceFx(b,p)){burst(p,40,0xb070ff,2,{up:true,life:1});ringFx(p,0xb070ff)}}return b}
function entranceFx(b,p){const k=b.kind,V=(x,y,z)=>p.clone().add(new THREE.Vector3(x,y,z));const S=n=>{try{sfxP(n)}catch(e){}};
 if(k==='ahuizotl'){burst(V(0,-.2,0),50,0x5ab8e0,2.2,{up:true,grav:1.6,life:1});ringFx(V(0,-.35,0),0x8ad8ff,1.8,.7);signText('¡Ahuízotl!',b.obj)}
 else if(k==='chaneque'){burst(p,46,0x6ab040,1.8,{up:true,grav:.5,life:1.3});burst(V(0,.2,0),14,0x9af0a0,1.2,{up:true,life:1.1});signText('¡Chaneque!',b.obj)}
 else if(k==='xolotl'){burst(p,50,0x5aa0ff,1.6,{up:true,grav:-.4,life:1.4});ringFx(V(0,-.35,0),0x7ab8ff,2,.8);signText('¡Xólotl!',b.obj)}
 else if(k==='nahual'){burst(p,60,0x6a3a90,1.4,{up:true,grav:-.2,life:1.6});burst(p,20,0x2a1a30,1.2,{life:1.2});signText('¡Nahual!',b.obj)}
 else if(k==='tepeyollotl'){doShake(.3,700);burst(V(0,-.3,0),50,0x8a6a40,2.4,{up:true,grav:1.4,life:.9});ringFx(V(0,-.35,0),0xffa040,2.4,.8);signText('¡Tepeyóllotl!',b.obj)}
 else if(k==='quinametzin'){[0,350,700].forEach((d,i)=>setTimeout(()=>{doShake(.15+i*.08,300);burst(V(0,-.35,0),24,0x9a8060,1.8,{up:true,grav:1.6,life:.7})},d));signText('¡Quinametzin!',b.obj)}
 else if(k==='xochitonal'){burst(V(0,-.2,0),50,0x40b0a0,2,{up:true,grav:1.4,life:1});burst(p,20,0xff8a5a,1.4,{up:true,life:1});ringFx(V(0,-.35,0),0x60e0c0,2,.7);signText('¡Xochitónal!',b.obj)}
 else return false;S(k+'_entrada');return true}

/* ================= setup ================= */
const setup={bestias:'clasicas',extras:'ninguno',altars:false,respawn:'elegida',omens:'ocasionales',n:2,days:7,players:[0,1,2,3].map(i=>({name:'Jugador '+(i+1),hero:HK[i]}))};
function renderSetup(){  if($('gfxBtns'))$('gfxBtns').innerHTML=[['mesa','Tablero de mesa'],['hd','Alta definición']].map(([k,n])=>`<button class="plain ${(k==='hd')===GFX_HD?'sel':''}" onclick="UI.gfx('${k}')">${n}</button>`).join('');if($('bGfx'))$('bGfx').textContent='Mapa: '+(GFX_HD?'alta definición':'tablero de mesa');
 if(SAVED&&SAVED.v===1&&$('contBox')){$('contBox').classList.remove('hidden');$('contInfo').textContent=`Día ${SAVED.day}/${SAVED.days} · ${PHASES[SAVED.phase].toLowerCase()} · ${SAVED.players.length} jugadores · turno de ${SAVED.players[SAVED.cur].name}`}
 $('nBtns').innerHTML=[2,3,4].map(n=>`<button class="plain ${setup.n===n?'sel':''}" onclick="UI.setN(${n})">${n}</button>`).join('');
 $('xBtns').innerHTML=[['ninguno','Ninguno'],['quinta','Quinta ciudad'],['mercado','Mercado']].map(([k,l])=>`<button class="plain ${setup.extras===k?'sel':''}" style="text-align:center;font-size:17px;padding:7px 2px" onclick="UI.setX('${k}')">${l}</button>`).join('');
 $('aBtns').innerHTML=[[false,'Sin altares'],[true,'Con altares']].map(([k,l])=>`<button class="plain ${setup.altars===k?'sel':''}" style="text-align:center" onclick="UI.setA(${k})">${l}</button>`).join('');
 $('oBtns').innerHTML=[['no','Apagados'],['ocasionales','Ocasionales'],['frecuentes','Frecuentes']].map(([k,l])=>`<button class="plain ${setup.omens===k?'sel':''}" style="text-align:center;font-size:17px;padding:7px 2px" onclick="UI.setO('${k}')">${l}</button>`).join('');
 $('bkBtns').innerHTML=[['clasicas','Clásicas'],['aleatorias','Aleatorias']].map(([k,l])=>`<button class="plain ${setup.bestias===k?'sel':''}" style="text-align:center" onclick="UI.setBk('${k}')">${l}</button>`).join('');const bn0=$('bossNote');if(bn0)bn0.textContent=setup.bestias==='aleatorias'?'Cada nivel sortea su bestia (entre 3 o 4 por nivel) y, en partidas de 7 días, el día 6 despierta un jefe al azar: Xiuhcóatl, Jaguar del Primer Sol, Alacrán de Yappan o Tzinacan':'En partidas de 7 días, el día 6 despierta el Xiuhcóatl';
 $('rBtns').innerHTML=[['elegida','La elige el jugador'],['auto','Automática']].map(([k,l])=>`<button class="plain ${setup.respawn===k?'sel':''}" style="text-align:center" onclick="UI.setR('${k}')">${l}</button>`).join('');
 $('dBtns').innerHTML=[[5,'5 días'],[7,'7 días']].map(([n,l])=>`<button class="plain ${setup.days===n?'sel':''}" onclick="UI.setD(${n})">${l}</button>`).join('');
 $('pRows').innerHTML=setup.players.slice(0,setup.n).map((p,i)=>`<div style="margin-bottom:10px"><div class="row"><span class="dot" style="background:${COLORS[i]}"></span>${portrait(p.hero,34,heroHue(setup.players.slice(0,setup.n),i))}<input value="${p.name}" maxlength="14" oninput="UI.name(${i},this.value)"></div>
  <div class="row" style="gap:4px;margin-top:4px">${HK.map(k=>`<button class="plain hpick ${p.hero===k?'sel':''}" onclick="UI.pick(${i},'${k}')" aria-label="${HEROES[k].name}" title="${HEROES[k].name}">${portrait(k,40)}</button>`).join('')}</div><div style="font-size:18px"><b>${HEROES[p.hero].name}</b> <span class="mut">· ${HEROES[p.hero].desc}</span></div></div>`).join('');
}
function fixHeroes(){const u=new Set();setup.players.slice(0,setup.n).forEach(p=>{if(u.has(p.hero))p.hero=HK.find(k=>!u.has(k));u.add(p.hero)})}

/* ================= partida ================= */
function startGame(){
 if(setup.extras!==EXTRAS){try{sessionStorage.setItem('sendaJaguar.pending',JSON.stringify(setup));location.reload();return}catch(e){}}
 try{sessionStorage.removeItem('sendaJaguar.pending')}catch(e){}
 controls.autoRotate=false;
 G={lvlKind:setup.bestias==='aleatorias'?{1:rpick(ROT[1]),2:rpick(ROT[2]),3:rpick(ROT[3])}:null,bestias:setup.bestias,bossKind:setup.bestias==='aleatorias'?rpick(BOSSES):'xiuhcoatl',extras:setup.extras,altars:setup.altars,respawnMode:setup.respawn,omenMode:setup.omens,hunts:{calaca:null,tzitzimitl:null,tlaltecuhtli:null},players:[],beasts:[],respawn:[],day:1,days:setup.days,phase:0,cur:0,start:0,turnCount:0,mode:'act',sel:null,log:[]};
 hero.visible=false;ally.visible=false;[coy,ahu,cip].forEach(o=>removeBillboard(o));removeBillboard(hero);removeBillboard(ally);
 G.players=setup.players.slice(0,setup.n).map((p,i)=>{const o={name:(p.name||'Jugador '+(i+1)).trim(),hero:p.hero,color:COLORS[i],hp:6,maxHp:6,ap:0,res:{maiz:0,madera:0,piedra:0,obsidiana:0},glory:0,dignityLost:0,kills:KILL0(),trophies:{hueso:0,garra:0,colmillo:0,corazon:0,pielsol:0,aguijon:0,ala:0,disco:0},hunt:{calaca:0,tzitzimitl:0,tlaltecuhtli:0},items:[],q:capital.q,r:capital.r,freeMoves:0,gatherBonus:false};
  o.hue=heroHue(setup.players.slice(0,setup.n),i);o.obj=makeBillboard(p.hero,1,parseInt(COLORS[i].slice(1),16),o.hue);o.obj.position.copy(hexCenter(capital));return o});
 cities.forEach(c=>{c.deck=shuffle(CITY_DECKS[c.theme].slice()).map(k=>makeCard(k,c.theme));c.card=c.deck.shift()});
 if(G.altars)buildAltars();
 for(const k0 in START){const k=slotKind(k0),lv=BEASTS[k].lvl;for(let i=0;i<START[k0];i++){const L=KPREF[k]!=null&&i%2===0?lairFor(k):LAIRS[lv][i%LAIRS[lv].length];const near=shuffle(allHex.filter(h=>canHold(h)&&hdist(h,L)<=2&&hdist(h,capital)>=2&&cities.every(c=>hdist(c,h)>=2)));const h=canHold(L)?L:(near[0]||L);spawn(k,h)}}
 log('Amanece el primer día. Los héroes parten del Teocalli Mayor.');
 $('ovSetup').classList.add('hidden');$('hud').classList.remove('hidden');$('panel').classList.remove('hidden');
 beginTurn();
}
/* ---- transiciones de fase: el sol recorre el cielo ---- */
const PHK={
 med:{sun:[0,14,2],sc:0xfff6e4,si:2.6,hs:0xc4dcff,hg:0x6a5a3a,hi:1.05,bg:0xa4cdf0,fog:0xc8dcea,exp:1.06,night:0},
 ocaso:{sun:[-14,1.4,3],sc:0xff6a30,si:1.7,hs:0xc87aa0,hg:0x3a2430,hi:.6,bg:0xb05a6a,fog:0xc07878,exp:.98,night:.5},
 crep:{sun:[10,4,-8],sc:0x8a6aff,si:.32,hs:0x4a3a80,hg:0x1a1020,hi:.45,bg:0x2a2050,fog:0x3a2c5a,exp:1.08,night:.85},
 alba:{sun:[13,1.6,4],sc:0xff8a70,si:1.3,hs:0xd0a0c8,hg:0x3a3040,hi:.62,bg:0xd890a0,fog:0xe0b0b8,exp:1.0,night:.4}};
const PH_PATH={'0>1':['med'],'1>2':['ocaso','crep'],'2>0':['alba'],'0>2':['ocaso','crep'],'1>0':['crep','alba'],'2>1':['alba','med']};
let phLast=null,phAnim=null;const _tgt={};
function phMix(a,b,t){const o={};for(const k of['si','hi','exp','night'])o[k]=a[k]+(b[k]-a[k])*t;
 for(const k of['sc','hs','hg','bg','fog'])o[k]=new THREE.Color(a[k]).lerp(new THREE.Color(b[k]),t).getHex();
 const va=new THREE.Vector3(...a.sun),vb=new THREE.Vector3(...b.sun),r=va.length()+(vb.length()-va.length())*t;
 const v=va.clone().normalize().lerp(vb.clone().normalize(),t);if(v.lengthSq()<1e-4)v.set(0,1,0);v.normalize().multiplyScalar(r);o.sun=[v.x,v.y,v.z];return o}
function setPhaseLight(){if(G&&G.stage){phAnim=null;target=STAGE_LIGHT;return}const to=G&&G.omen==='eclipse'?2:G?G.phase:0;
 if(phLast===null||phLast===to||!G||G.tut&&false){phLast=to;if(!phAnim)target=PH[to];return}
 const keys=[PH[phLast],...(PH_PATH[phLast+'>'+to]||[]).map(k=>PHK[k]),PH[to]];const from=phLast;phLast=to;
 phAnim={keys,t0:performance.now(),seg:1500,from,to};phOverlay(from,to);requestAnimationFrame(phStep)}
function phStep(){if(!phAnim)return;const a=phAnim,n=a.keys.length-1,e=Math.min(1,(performance.now()-a.t0)/(a.seg*n));
 const x=e*n,i=Math.min(n-1,Math.floor(x)),f=x-i,s=f*f*(3-2*f);target=phMix(a.keys[i],a.keys[i+1],s);phDraw(e);
 if(e<1)requestAnimationFrame(phStep);else{target=a.keys[n];phAnim=null;phHide()}}
/* estrellas que aparecen de noche */
const STARS=(()=>{const g=new THREE.BufferGeometry(),N=420,pos=new Float32Array(N*3);for(let i=0;i<N;i++){const u=Math.random()*Math.PI*2,v=Math.acos(Math.random()*.9+.1),R=88;pos[i*3]=Math.sin(v)*Math.cos(u)*R;pos[i*3+1]=Math.cos(v)*R*.7+6;pos[i*3+2]=Math.sin(v)*Math.sin(u)*R}
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.PointsMaterial({color:0xfff4d8,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false});const p=new THREE.Points(g,m);p.renderOrder=-1;scene.add(p);return p})();
(function starLoop(){const tn=(target&&target.night)||0;STARS.material.opacity+=((tn>.7?(tn-.7)/.3:0)*.9-STARS.material.opacity)*.05;STARS.rotation.y+=.00008;requestAnimationFrame(starLoop)})();
/* cartel de la fase: arco del cielo con el sol o la luna */
const PH_NAME=['Mañana','Tarde','Noche'];
function phOverlay(from,to){const el=$('phFx');if(!el)return;el.classList.remove('hidden','out');el.dataset.from=from;el.dataset.to=to;
 $('phTxt').textContent=to===0?`Amanece · Día ${G.day}`:to===1?'Cae la tarde':'Llega la noche';phDraw(0)}
function phHide(){const el=$('phFx');if(!el)return;setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.classList.add('hidden'),500)},700)}
function phDraw(e){const cv=$('phCv');if(!cv||!phAnim&&e<1)return;const a=phAnim||{from:+$('phFx').dataset.from,to:+$('phFx').dataset.to};const x=cv.getContext('2d'),W=cv.width,H=cv.height;x.clearRect(0,0,W,H);
 const t=target;const bg=new THREE.Color(t.bg).getStyle(),fg=new THREE.Color(t.fog).getStyle();
 const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,bg);gr.addColorStop(1,fg);x.fillStyle=gr;x.beginPath();x.ellipse(W/2,H,W/2-2,H-4,0,Math.PI,0);x.fill();
 x.strokeStyle='rgba(236,196,96,.55)';x.setLineDash([3,4]);x.lineWidth=2;x.beginPath();x.ellipse(W/2,H,W/2-14,H-16,0,Math.PI,0);x.stroke();x.setLineDash([]);
 // posición del astro sobre el arco: mañana 0.3, tarde 0.72, noche (luna) 0.5 en otro ciclo
 const P={0:.28,1:.74,2:1.08},p0=a.from===2?-.08:P[a.from],p1=a.to===2?1.08:P[a.to];let p=p0+(p1-p0)*e;
 const night=t.night>.6;if(a.to===2&&p>1){p=1.0}
 const ang=Math.PI*(1-Math.min(1,Math.max(0,p))),cx=W/2+Math.cos(ang)*(W/2-14),cy=H-Math.sin(ang)*(H-16);
 if(a.to===2&&e>.55){const q=(e-.55)/.45,ma=Math.PI*(1-q*.5),mx=W/2+Math.cos(ma)*(W/2-14),my=H-Math.sin(ma)*(H-16);x.fillStyle='#e8ecff';x.beginPath();x.arc(mx,my,9,0,7);x.fill();x.fillStyle=bg;x.beginPath();x.arc(mx+4,my-3,8,0,7);x.fill();
  x.fillStyle='rgba(255,244,216,.8)';for(let i=0;i<14;i++){const sx=(i*53%W),sy=(i*31%(H-20))+6;if(q>i/14)x.fillRect(sx,sy,2,2)}}
 if(!(a.to===2&&p>=1)){x.fillStyle='rgba(255,210,100,.35)';x.beginPath();x.arc(cx,cy,15,0,7);x.fill();x.fillStyle=a.to===1||t.sc>0xff0000&&t.si<2?'#ff9a40':'#ffd860';x.beginPath();x.arc(cx,cy,9,0,7);x.fill();
  x.strokeStyle='#ffd860';x.lineWidth=2;for(let i=0;i<8;i++){const r=i*Math.PI/4+performance.now()/900;x.beginPath();x.moveTo(cx+Math.cos(r)*12,cy+Math.sin(r)*12);x.lineTo(cx+Math.cos(r)*16,cy+Math.sin(r)*16);x.stroke()}}
 x.fillStyle='rgba(20,14,24,.85)';x.fillRect(0,H-3,W,3)}

function focusOn(p,dur=800){const c=hexCenter(hexOf(p));const off=camera.position.clone().sub(controls.target);off.setLength(Math.max(14,Math.min(off.length(),22)));tweenCam(c.clone().add(off),c.clone().add(new THREE.Vector3(0,.4,0)),dur)}
function beginTurn(){
 saveGame();
 const p=curP();if(p.poison>0){p.poison--;if(p.hp>1){p.hp--;setTimeout(()=>{floatText('-1 veneno',p.obj.position.clone().add(new THREE.Vector3(0,1.4,0)),'#7ad06a',.9);burst(p.obj.position.clone().add(new THREE.Vector3(0,.7,0)),20,0x7ad06a,1.2,{up:true,life:1})},900)}log(`${p.name} sufre el veneno de Yappan (${p.poison} turnos más).`)}p.ap=maxAP(p);p.freeMoves=(p.hero==='aguila'?1:0)+(has(p,'cactli')?1:0)+(omen('viento')?1:0);p.gatherBonus=false;p.cacBonus=has(p,'cacaxtli');
 G.mode='act';G.pending=null;G.sel=hexOf(p);setPhaseLight();G.transition=true;
 const pc=hexCenter(hexOf(p));const asp=innerWidth/innerHeight;const tanH=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*asp;
 const dist=clamp(11/tanH,15,asp>1?31:24);const follow=asp>1?.25:.65;const c=new THREE.Vector3(0,.5,0).lerp(pc,follow);
 const off=camera.position.clone().sub(controls.target).normalize().multiplyScalar(dist);
 const toPlayer=()=>tweenCam(c.clone().add(off),c.clone(),1500,()=>{G.transition=false;update()},0);
 if(G.bossRage){const b=G.bossRage;G.bossRage=null;const bc=hexCenter(hexOf(b));const o2=off.clone().setLength(8);
  setTimeout(()=>tweenCam(bc.clone().add(o2),bc.clone().add(new THREE.Vector3(0,.8,0)),2000,()=>{
   const pos=bc.clone().add(new THREE.Vector3(0,.9,0));b.obj.scale.setScalar(1.2);const fl=new THREE.PointLight(0xff5020,2.2,3,1.6);fl.position.set(0,1.2,0);b.obj.add(fl);b.obj.userData.rage=true;
   burst(pos,160,0xff3a10,3.8,{up:true,life:1.5});burst(pos,80,0xffd040,2.6,{up:true,life:1.2});ringFx(pos,0xff3a10,4,1);ringFx(pos,0xffd040,2.6,.7);flash(b.obj,0xff3a10,900);doShake(.4,1100);bloomKick=1.2;
   setTimeout(()=>signText('¡Furia del Quinto Sol!',b.obj),1100);
   setTimeout(()=>{msg(`¡${BEASTS[b.kind].name} se enfurece!`,`Último día: recibe la <b class="gold">Furia del Quinto Sol</b>.<br><span class="mut">+3 de fuerza y +1 de ataque · ahora fuerza ${strOf(b)}, ataque ${atkOf(b)}.</span><br>Vencerla da <b class="gold">${BEASTS[b.kind].glory+b.up.length} de gloria</b> y su trofeo.`,b.kind);toPlayer()},2700)},3),1800);
 }else if(G.bossIntro){const b=G.bossIntro;G.bossIntro=null;const bc=hexCenter(hexOf(b));const o2=off.clone().setLength(8);
  setTimeout(()=>tweenCam(bc.clone().add(o2),bc.clone().add(new THREE.Vector3(0,.8,0)),2000,()=>{
   const pos=bc.clone().add(new THREE.Vector3(0,.8,0)),T=bossEntrance(b,pos),d=BEASTS[b.kind],I=BOSS_INFO[b.kind];
   setTimeout(()=>signText(I.sign,b.obj),T-1400);
   setTimeout(()=>{msg(I.wake,`${I.how}<br><span class="mut">Nivel 4 · fuerza ${d.str} · ataque ${d.atk} · ${d.eff}.${I.pas?'<br>'+I.pas:''}</span><br>Vencerlo da <b class="gold">${d.glory} de gloria</b> y su trofeo (${TROPHY[d.trophy].name}: ${TROPHY[d.trophy].desc}).`,b.kind);toPlayer()},T)},3),2600);
 }else toPlayer();
 const bn=$('banner');bn.innerHTML=`${portrait(p.hero,44,p.hue)}<div><div class="px mut">Día ${G.day}/${G.days} · ${G.stage?'Ocaso eterno':PHASES[G.phase]}</div><div class="px" style="font-size:11px;color:${p.color};margin-top:4px">Turno de ${p.name}</div><div class="mut" style="font-size:17px">${p.ap} PA · vida ${p.hp}/${p.maxHp}</div></div>`;
 bn.classList.remove('show');void bn.offsetWidth;bn.classList.add('show');clearTimeout(beginTurn.t);beginTurn.t=setTimeout(()=>bn.classList.remove('show'),2800);
 update();
}
function startAcecho(){const p=curP();G.mode='acecho';G.furia=clamp(7-p.hp,1,6)+(has(p,'caracol')?1:0);G.pending=null;G.hit=new Set();log(`${p.name} acecha con ${G.furia} de furia.`);update()}
function randomRespawnHex(kind){const L=lairFor(kind);if(!L)return null;if(canHold(L)&&Math.random()<.5)return L;const n=nbrs(hexes,L).filter(h=>canHold(h)&&cities.every(c=>hdist(c,h)>=2));if(n.length)return rpick(n);const f=lairs(BEASTS[kind].lvl);return f.length?rpick(f):null}
function runRespawn(done){const q=(G.pendingRespawn||[]).filter(r=>G.beasts.filter(b=>b.kind===r.kind).length<CAP[r.kind]);G.pendingRespawn=[];
 if(!q.length)return done();G.rp={q,i:0,done};G.mode='respawn';nextRespawn()}
function nextRespawn(){const R=G.rp;while(R.i<R.q.length&&(G.beasts.filter(b=>b.kind===R.q[R.i].kind).length>=CAP[R.q[R.i].kind]||!lairs(BEASTS[R.q[R.i].kind].lvl).length))R.i++;if(R.i>=R.q.length){G.mode='act';G.rp=null;return R.done()}const r=R.q[R.i];const who=G.players[(G.start+R.i)%G.players.length];
 const bn=$('banner');bn.innerHTML=`${portrait(r.kind,44)}<div><div class="px mut">Reaparición</div><div class="px" style="font-size:10px;color:${who.color};margin-top:4px">${who.name}</div><div style="font-size:17px">elegí la guarida de ${BEASTS[r.kind].name}</div></div>`;bn.classList.add('show');
 const c=new THREE.Vector3(0,.5,0);const asp=innerWidth/innerHeight;const tanH=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*asp;const off=camera.position.clone().sub(controls.target).setLength(clamp(11/tanH,20,asp>1?31:44));tweenCam(c.clone().add(off),c,900);update()}
function pickRespawn(h){const R=G.rp,r=R.q[R.i];if(!lairs(BEASTS[r.kind].lvl).includes(h)){if(beastAt(h))toast('Ya hay una bestia en esa guarida');return}spawn(r.kind,h,true);log(`${G.players[(G.start+R.i)%G.players.length].name} hace reaparecer a ${BEASTS[r.kind].name}.`);R.i++;$('banner').classList.remove('show');setTimeout(nextRespawn,500)}
function endTurn(){
 G.mode='act';G.pending=null;G.turnCount++;
 if(G.turnCount<G.players.length){G.cur=(G.cur+1)%G.players.length;return beginTurn()}
 if(G.stage){G.turnCount=0;G.stage.left--;if(G.stage.left<=0)return stageFinale();G.cur=G.start;log('El ocaso no termina.');return beginTurn()}
 G.phase++;G.turnCount=0;
 if(G.phase===2&&G.day===G.days&&!G.stageDone&&!G.tut&&(G.forceStage||Math.random()<STAGE_P)){G.stageDone=true;G.phase=1;return startStage()}
 if(G.phase>2){G.phase=0;G.day++;if(G.day>G.days)return endGame();G.start=(G.start+1)%G.players.length;dawn();G.cur=G.start;return runRespawn(()=>beginTurn())}
 else log(`Día ${G.day}: ${G.phase===1?'cae la tarde':'llega la noche'}.`);
 G.cur=G.start;beginTurn();
}
function dawn(){
 G.beasts.forEach(b=>b.wound=0);
 for(const h of allHex)if(RESOF[h.t])h.stock=2;
 G.players.forEach(p=>{if(p.soul){p.maxHp+=p.soul;p.soul=0}p.hidden=null;p.hp=Math.min(p.maxHp,p.hp+1);p.used={}});
 if(G.respawnMode==='auto')G.respawn=G.respawn.filter(r=>!spawn(r.kind,randomRespawnHex(r.kind),true));
 else{G.pendingRespawn=G.respawn.splice(0)}
 if(G.day===G.days){const bb=G.beasts.find(x=>BEASTS[x.kind].boss);if(bb&&bb.kind!=='guerrero'&&!upN(bb,'ira')){bb.up.push('ira');G.bossRage=bb;log(`¡${BEASTS[bb.kind].name} recibe la Furia del Quinto Sol!`)}}
 drawOmen();
 if(G.days>=7&&G.day===6&&!G.bossDone){G.bossDone=true;const bk=G.bossKind||'xiuhcoatl',li=BOSS_INFO[bk].lair;const pool=li==='any'?allHex.filter(canHold):allHex.filter(x=>x.t===li&&canHold(x));const h=pool.length?rpick(pool):rpick(allHex.filter(canHold));if(h){const b=spawn(bk,h,false);b.obj.visible=false;G.bossIntro=b;log(`¡${BOSS_INFO[bk].wake.replace(/[¡!]/g,'')}!`)}}
 upgradeBeasts();
 cities.forEach(c=>{if(!c.card&&c.deck.length)c.card=c.deck.shift()});
 log(`Amanece el día ${G.day}. Vuelven los recursos, los pedidos y las bestias.`);
}
function giveUpgrade(b,fx,delay=0){const k=rpick(UPK);b.up.push(k);if(fx)setTimeout(()=>{if(!b.obj.parent)return;const pos=b.obj.position.clone().add(new THREE.Vector3(0,.6,0));burst(pos,30,0xb070ff,1.6,{up:true,life:1.1});ringFx(pos,0xb070ff,1.6);signText(UPGRADES[k].name,b.obj)},delay);return k}
const UP_PLAN={7:{2:[1,2],3:[2,3],4:[1,3],5:[1,2,3]},5:{2:[1,2],3:[2,3]}};
function upgradeBeasts(){const plan=(UP_PLAN[G.days]||UP_PLAN[7])[G.day];if(!plan)return;G.kindUps=G.kindUps||{};const got=[];
 plan.forEach(lvl=>{const kind=lvl<4?slotKind(BY_LVL[lvl]):(G.bossKind||'xiuhcoatl');if(!kind)return;const alive=G.beasts.filter(b=>b.kind===kind);
  if(BEASTS[kind].boss&&!alive.length)return; // si ya lo mataron, no se mejora nada
  const have=BEASTS[kind].boss?(alive[0]?alive[0].up:[]):(G.kindUps[kind]||[]);const k=rpick(UPK.filter(u=>!(u==='letargo'&&have.includes(u))));if(!BEASTS[kind].boss)(G.kindUps[kind]=G.kindUps[kind]||[]).push(k);
  alive.forEach((b,i)=>{b.up.push(k);const d=(BEASTS[kind].boss?10200:2200)+got.length*500+i*140;setTimeout(()=>{if(!b.obj.parent)return;const pos=b.obj.position.clone().add(new THREE.Vector3(0,.6,0));burst(pos,30,0xb070ff,1.6,{up:true,life:1.1});ringFx(pos,0xb070ff,1.6);signText(UPGRADES[k].name,b.obj)},d)});
  got.push([kind,k])});
 if(!got.length)return;
 log('Se fortalecen: '+got.map(([kind,k])=>`${BEASTS[kind].name} (${UPGRADES[k].name})`).join(', ')+'.');
 const cards=got.map(([kind,k])=>`<div class="card" style="text-align:left;margin:8px 0"><div class="row" style="gap:8px">${portrait(kind,40)}<div><b>${BEASTS[kind].name}</b><div style="font-size:15px;opacity:.7">Nivel ${BEASTS[kind].lvl}</div></div></div><div style="margin-top:6px;padding-top:6px;border-top:1px dashed #b08a50"><b style="color:#7a3c9a">+ ${UPGRADES[k].name}</b><div style="font-size:16px">${UPGRADES[k].desc}</div></div></div>`).join('');
 const boss=got.some(([kind])=>BEASTS[kind].boss);
 setTimeout(()=>msg('Las bestias se fortalecen',`${boss?bossName()+' se fortalece.':'Cada una de estas bestias recibe una mejora. Las que reaparezcan llegan con las mismas mejoras.'}${cards}`),boss?9800:2000)}
function ko(p,why){
 if(G&&p===curP()&&!G.over)G.endAfterKO=true;
 const from=p.obj.position.clone().add(new THREE.Vector3(0,.5,0));burst(from,50,0xb070ff,2.2,{up:true,life:1.1});
 p.dignityLost++;p.hp=p.maxHp;{const tot=RK.reduce((s,k)=>s+(p.res[k]||0),0);let n=Math.ceil(tot/2);const lost={};while(n>0){const own=RK.filter(k=>p.res[k]>0);if(!own.length)break;const k=rpick(own);p.res[k]--;lost[k]=(lost[k]||0)+1;n--}p._lostRes=Object.entries(lost).map(([k,v])=>`${v} de ${RES[k].toLowerCase()}`).join(', ')}p.q=capital.q;p.r=capital.r;p.ap=0;p.obj.position.copy(hexCenter(capital));
 const to=hexCenter(capital).add(new THREE.Vector3(0,.5,0));setTimeout(()=>{burst(to,40,0xf0c040,2,{up:true});ringFx(to,0xf0c040)},250);
 log(`${p.name} cae ${why}. Despierta en el Teocalli Mayor y pierde 1 de dignidad${p._lostRes?' y '+p._lostRes:''}.`);if(p._lostRes)setTimeout(()=>toast(`${p.name} pierde ${p._lostRes}`),600);
}

/* ================= acciones ================= */
const moveCost=h=>h.t==='V'?2:1;
function payMove(p,h){let c=moveCost(h);if(p.freeMoves>0){p.freeMoves--;c--}return c}
function moveTargets(p){return nbrs(hexes,hexOf(p)).filter(h=>(!TERR[h.t].water||has(p,'canoa'))&&p.ap>=moveCost(h)-(p.freeMoves>0?1:0))}
const MOVE={calaca:2,tzitzimitl:3,tlaltecuhtli:1,ahuizotl:2,chaneque:3,xolotl:2,nahual:3,tepeyollotl:2,quinametzin:1,xochitonal:1,xiuhcoatl:1,jaguarsol:1,alacran:1,tzinacan:1,guerrero:1};
function beastPath(b,dest){const R=MOVE[b.kind]||1,fly=b.kind==='tzitzimitl',st=hexOf(b);const par=new Map([[key(st.q,st.r),null]]),dist=new Map([[key(st.q,st.r),0]]),q=[st];
 while(q.length){const h=q.shift(),d=dist.get(key(h.q,h.r));if(h===dest)break;if(d>=R)continue;for(const n of nbrs(hexes,h)){const k=key(n.q,n.r);if(par.has(k))continue;const pass=fly?!TERR[n.t].city&&!TERR[n.t].district:canStand(n);if(!pass)continue;par.set(k,h);dist.set(k,d+1);q.push(n)}}
 const out=[];let c=dest;while(c&&c!==st){out.unshift(c);c=par.get(key(c.q,c.r))}return out}
function beastTargets(b){const R=MOVE[b.kind]||1,fly=b.kind==='tzitzimitl',st=hexOf(b);const seen=new Map([[key(st.q,st.r),0]]),q=[st],out=[];
 while(q.length){const h=q.shift(),d=seen.get(key(h.q,h.r));if(d>=R)continue;for(const n of nbrs(hexes,h)){const k=key(n.q,n.r);if(seen.has(k))continue;const pass=fly?!TERR[n.t].city&&!TERR[n.t].district:canStand(n);if(!pass)continue;seen.set(k,d+1);q.push(n);if(canStand(n))out.push(n)}}return out}
function canDo(){const p=curP(),h=hexOf(p),b=beastAt(h),city=TERR[h.t].city;return{
 gather:p.ap>=gatherCost(h)&&RESOF[h.t]&&h.stock>0&&!b,fight:p.ap>=1&&!!b,
 deliver:p.ap>=1&&city&&h.card&&canPay(p,h.card.need),
 fly:G.altars&&h.altar&&p.ap>=(omen('viento')?0:2)&&ALTARS.length>1,trade:G.extras==='mercado'&&h.theme==='mercado'&&p.ap>=1&&RK.some(k=>p.res[k]>=2),rest:p.ap>=1&&city&&p.hp<p.maxHp,hunt:p.ap>=1&&h.t==='K'&&Object.keys(HUNT).some(k=>G.hunts[k]===null&&p.trophies[HUNT[k].trophy]>0&&p.hunt[k]<HUNT[k].need),copal:has(p,'copal')&&!(p.used||{}).copal&&(p.hp<p.maxHp||p.poison>0),agua:has(p,'agua')&&!(p.used||{}).agua&&p.hp<p.maxHp}}
const gatherCost=h=>h.t==='C'||h.t==='V'?2:1;
const busy=()=>!!B||G.over||!!G.walking||!!G.transition||G.mode==='respawn';
function act(a){
 if(busy())return;const p=curP(),h=hexOf(p),top=p.obj.position.clone().add(new THREE.Vector3(0,1.3,0));if(a!=='fight')signText(LABEL[a],p.obj);
 if(a==='gather'){const k=RESOF[h.t];let n=1;if(p.gatherBonus){n++;p.gatherBonus=false}if(p.cacBonus){n++;p.cacBonus=false}if(k==='maiz'&&has(p,'coa'))n++;if(k==='maiz'&&omen('lluvia'))n*=2;if(k==='obsidiana'&&omen('erupcion'))n*=2;if(k==='madera'&&has(p,'hacha'))n++;h.stock--;p.ap-=gatherCost(h);p.res[k]+=n;
  burst(p.obj.position.clone().add(new THREE.Vector3(0,.2,0)),18,0xfff0b0,1.4,{up:true,life:.7});floatText(`+${n} ${RES[k]}`,top,'#fff0b0',.9);log(`${p.name} recolecta ${n} de ${RES[k].toLowerCase()}.`)}
 if(a==='fight'){return openBattle(beastsAt(h)[0])}
 if(a==='deliver'){const c=h.card,it=ITEMS[c.item];pay(p,c.need);const gl=c.glory+(has(p,'estandarte')?1:0)+(omen('fiesta')?1:0);p.glory+=gl;p.ap--;(h.done=h.done||[]).push({item:c.item,need:c.need,glory:c.glory,by:p.name});h.card=null;p.items.push(c.item);if(c.item==='ichca'){p.maxHp+=2;p.hp+=2}
  burst(top,50,0xf0c040,2.4,{up:true,life:1.1});ringFx(top,0xf0c040,2);floatText(`+${gl} GLORIA`,top,'#f0c040',1.1);
  log(`${p.name} cumple la carta de ${h.name}: +${gl} de gloria y ${it.name}.`);msg('Carta cumplida',`${cardHTML(h,c)}<div style="margin-top:8px">Ganás <b class="gold">${gl} de gloria</b> y el objeto <b>${it.name}</b>.</div>`)}
 if(a==='hunt'){return showHuntPick()}
 if(a==='fly'){G.pending=G.pending&&G.pending.type==='fly'?null:{type:'fly'};return update()}
 if(a==='trade'){return showTrade()}
 if(a==='rest'){const n=p.hero==='sacerdotisa'?3:2,b0=p.hp;p.hp=Math.min(p.maxHp,p.hp+n);p.ap--;burst(top,20,0x8ad06a,1.2,{up:true});floatText('+'+(p.hp-b0),top,'#8ad06a');log(`${p.name} descansa en ${h.name}.`)}
 if(a==='copal'&&p.poison){p.poison=0;log(`${p.name} quema copal y se libra del veneno.`)}if(a==='copal'||a==='agua'){p.used=p.used||{};p.used[a]=true;const b0=p.hp;p.hp=Math.min(p.maxHp,p.hp+ITEMS[a].heal);burst(top,24,0xd8d0ff,1.2,{up:true,grav:.5,life:1.2});floatText('+'+(p.hp-b0),top,'#8ad06a');log(`${p.name} usa ${ITEMS[a].name}.`)}
 update();
}
function beastArrives(b){const d=BEASTS[b.kind];if(b.kind==='quinametzin'||b.kind==='tepeyollotl'){doShake(.18,400);burst(b.obj.position.clone().add(new THREE.Vector3(0,.1,0)),24,0x8a6a40,1.6,{life:.7})}if(b.kind==='ahuizotl'||b.kind==='xochitonal')burst(b.obj.position.clone().add(new THREE.Vector3(0,.15,0)),18,0x5ab8e0,1.4,{up:true,grav:1.4,life:.7});if(b.kind==='tlaltecuhtli'){doShake(.25,600);burst(b.obj.position.clone().add(new THREE.Vector3(0,.1,0)),40,0x8a6a40,2,{life:.8})}
 if(upN(b,'letargo'))return;
 for(const p of heroesAt(hexOf(b))){const id=p.name+'|'+b.q+','+b.r+b.kind;if(G.hit.has(id))continue;G.hit.add(id);
  const pos=p.obj.position.clone().add(new THREE.Vector3(0,.6,0));
  if(has(p,'chimalli')){burst(pos,24,0xf0c040,2);ringFx(pos,0xf0c040,1.4);floatText('BLOQUEO',pos.clone().add(new THREE.Vector3(0,.8,0)),'#f0c040');log(`El chimalli de ${p.name} detiene a ${d.name}.`);continue}
  if(has(p,'colibri')&&Math.random()<1/3){burst(pos,20,0x38c0b0,2);floatText('ESQUIVA',pos.clone().add(new THREE.Vector3(0,.8,0)),'#38c0b0');log(`${p.name} esquiva a ${d.name}.`);continue}
  p.hp-=1;flash(p.obj,0xff3a2a);burst(pos,26,0xff5a3a,2.4);doShake(.1);floatText('-1',pos.clone().add(new THREE.Vector3(0,.7,0)),'#ff7a5a');log(`${d.name} embiste a ${p.name}: −1 de vida.`);
  if(b.kind==='calaca'){const own=RK.filter(k=>p.res[k]>0);if(own.length){const k=rpick(own);p.res[k]--;floatText('-1 '+RES[k],pos.clone().add(new THREE.Vector3(0,1.1,0)),'#ff9a40',.85);log(`La calaca le roba 1 de ${RES[k].toLowerCase()} a ${p.name}.`)}}
  if(p.hp<=0){ko(p,`ante ${d.name}`);checkKOEnd()}}}
function onHex(h){
 const p=curP();G.sel=h;
 if(G.mode==='respawn'){pickRespawn(h);return}
 if(G.mode==='act'&&G.pending&&G.pending.type==='fly'){if(ALTARS.includes(h)&&h!==hexOf(p)){flyTo(p,h)}else{G.pending=null;update()}return}
 if(busy())return update();
 const moving=G.mode==='act'&&moveTargets(p).includes(h);
 if(TERR[h.t].city&&!moving){showCityCard(h)}
 if(G.mode==='act'){if(moveTargets(p).includes(h)){p.ap-=payMove(p,h);p.q=h.q;p.r=h.r;G.walking=true;p.obj.userData.lock=true;
  walkObj(p.obj,slotPos(h,beastAt(h)||heroesAt(h).length>1?-.34:0),620,()=>{p.obj.userData.lock=false;G.walking=false;if(TERR[h.t].city)showCityCard(h);if(h.t==='V'&&omen('erupcion')){p.hp=Math.max(1,p.hp-1);const ps=p.obj.position.clone().add(new THREE.Vector3(0,.6,0));burst(ps,30,0xff6020,2);floatText('-1',ps.clone().add(new THREE.Vector3(0,.8,0)),'#ff7a5a')}
   const foes=omen('niebla')?[]:beastsAt(h).filter(b=>!upN(b,'letargo'));
   if(foes.length&&!has(p,'mascara')){signText('¡Emboscada!',foes[0].obj);setTimeout(()=>openBattle(foes[0]),500)}else{if(foes.length)toast('La Máscara de Mictlán te oculta de las bestias');update()}})}}
 else if(G.pending){const pe=G.pending;
  if(pe.type==='pickBeast'){const b=beastAt(h);if(b&&BEASTS[b.kind].boss){toast(`${BEASTS[b.kind].name} no obedece a nadie`)}else if(b&&beastTargets(b).length){pe.type='moveBeast';pe.b=b}}
  else if(pe.type==='moveBeast'){if(beastTargets(pe.b).includes(h)){const b=pe.b;pe.fq=b.q;pe.fr=b.r;b.q=h.q;b.r=h.r;G.furia--;G.walking=true;b.obj.userData.lock=true;
   const path=(()=>{const bb={kind:b.kind,q:pe.fq,r:pe.fr};return beastPath(bb,h)})();const stepW=i=>{const hh=path[i]||h,last=i>=path.length-1;walkObj(b.obj,last?slotPos(h,heroesAt(h).length?.34:0):hexCenter(hh),last&&i===0?520:380,()=>{if(!last)return stepW(i+1);b.obj.userData.lock=false;G.walking=false;beastArrives(b);update()})};stepW(0);log(`${p.name} azuza a ${BEASTS[b.kind].name}.`);G.pending=null}}
  else if(pe.type==='summon'){const lv=BEASTS[pe.kind].lvl;if(lairs(lv,false).includes(h)){G.respawn.splice(G.respawn.findIndex(r=>r.kind===pe.kind),1);const b=spawn(pe.kind,h,true);G.furia-=lv+1;signText('Invocar',curP().obj);log(`${p.name} invoca a ${BEASTS[b.kind].name}.`);setTimeout(()=>{beastArrives(b);update()},350);G.pending=null}}
 }
 update();
}

/* ================= combate en el mapa ================= */
const FACES=[2,3,4,5,'azul','bestia'];
function openBattle(b){
 const p=curP(),d=BEASTS[b.kind],h=hexOf(p);
 B={b,p,d,max:strOf(b),meter:Math.max(1,strOf(b)-(b.wound||0)-(has(p,'red')?1:0)),amulet:has(p,'amuleto'),first:true,curse:0,garra:0,block:has(p,'chimalli'),rerolls:(p.hero==='sacerdotisa'?1:0)+(has(p,'espejo')?1:0),busy:false,pending:null,over:false,
  saved:{pos:camera.position.clone(),tgt:controls.target.clone()}};
 const c=hexCenter(h);B.center=c;
 const r=camRight.clone();B.right=r;
 p.obj.userData.lock=b.obj.userData.lock=true;
 const bw=b.obj.userData.frames[0].image.width*.03*d.scale/2;B.heroPos=c.clone().addScaledVector(r,.45+Math.max(0,bw-.6)*.35);B.beastPos=c.clone().addScaledVector(r,-(bw*.8+.1));
 walkObj(p.obj,B.heroPos,420,()=>{const U=p.obj.userData;U.walk=false;U.flip=U.heroArt?-1:1;U.inCombat=true});walkObj(b.obj,B.beastPos,420,()=>{b.obj.userData.walk=false;b.obj.userData.flip=1});
 G.players.forEach(q=>{if(q!==p&&q.q===p.q&&q.r===p.r)q.obj.visible=false});
 const off=camera.position.clone().sub(controls.target);off.y=Math.max(off.y,0);off.setLength(6.2);off.y=Math.max(off.y,2.6);
 controls.enabled=false;tweenCam(c.clone().add(off),c.clone().add(new THREE.Vector3(0,.55,0)),850);
 $('panel').classList.add('hidden');$('hint').classList.add('hidden');$('battle').classList.remove('hidden');B.hiddenDecor=h.g.children.filter(c=>!c.userData.hex&&!(h.pips||[]).includes(c)&&(c.type==='Mesh'||c.isInstancedMesh||c.isGroup)&&c.visible);B.hiddenDecor.forEach(c=>c.visible=false);$('die').classList.remove('hidden');drawDie('?');
 setBMsg(`${p.ap<1?'<b style="color:#ff9a40">No te quedan PA para tirar: solo podés huir.</b><br>':''}¡${d.name} te sale al cruce! Fuerza ${B.meter}/${B.max}, ataque ${atkOf(b)}. ${d.eff}.${b.up.length?' Mejoras: '+b.up.map(k=>UPGRADES[k].name).join(', ')+'.':''}`);
 const ep=B.beastPos.clone().add(new THREE.Vector3(0,.6,0));setTimeout(()=>{ringFx(ep,0xff3a2a,1.8);burst(ep,30,0xff5a3a,2)},500);
  renderBattle();
}
/* habilidad de presencia: las bestias de nivel 1 y 2 la usan al empezar el combate */
function presence(B){const{p,b}=B,k=b.kind,P=()=>p.obj.position.clone().add(new THREE.Vector3(0,1.2,0));
 if(k==='calaca'){const own=RK.filter(r=>p.res[r]>0);if(!own.length)return' ¡Saqueo! Busca qué robarte, pero no llevás nada.';const r=rpick(own);p.res[r]--;floatText('-1 '+RES[r],P(),'#ff9a40',.85);return` ¡Saqueo! Te roba 1 de ${RES[r].toLowerCase()}.`}
 if(k==='ahuizotl'){if(p.ap<=1)return' ¡Arrastre! Intenta hundirte, pero resistís.';p.ap--;floatText('-1 PA',P(),'#5ab8e0',.85);return' ¡Arrastre! Te hunde en el agua: perdés 1 PA.'}
 if(k==='chaneque'){const own=p.items.filter(i=>!(p.broken||{})[i]&&!(p.hidden||{})[i]);if(!own.length)return' ¡Travesura! Busca algo para esconderte, pero no llevás nada.';const i=rpick(own);p.hidden=p.hidden||{};p.hidden[i]=true;if(i==='chimalli')B.block=false;floatText(ITEMS[i].name,P(),'#9af0a0',.75);return` ¡Travesura! Te esconde: ${ITEMS[i].name} (vuelve al amanecer).`}
 if(k==='tzitzimitl'){B.curse=2;return' ¡Eclipse! Tu primera tirada vale 2 menos.'}
 if(k==='xolotl'){if(p.maxHp<=2)return' ¡Guía de almas! Tu alma resiste.';p.maxHp--;p.soul=(p.soul||0)+1;p.hp=Math.min(p.hp,p.maxHp);floatText('-1 vida máx.',P(),'#7ab8ff',.8);return' ¡Guía de almas! Perdés 1 de vida máxima hasta el amanecer.'}
 if(k==='nahual'){B.shift=true;return' ¡Cambio de forma! Su primer ataque hará el doble.'}
 return''}
function setBMsg(t){$('bMsg').innerHTML=t}
function renderBattle(){
 const{p,d,meter}=B;
 $('bBars').innerHTML=`<div class="row" style="gap:6px"><span style="color:${p.color};width:48%">${p.name}</span><span style="width:48%;text-align:right">${d.name}</span></div>
 <div class="row" style="gap:6px"><div class="bar" style="width:48%"><i style="width:${clamp(p.hp/p.maxHp,0,1)*100}%"></i></div><div class="bar" style="width:48%"><i style="width:${clamp(meter/B.max,0,1)*100}%;background:linear-gradient(#b08aff,#5a3080)"></i></div></div>
 <div class="row mut" style="gap:6px;font-size:17px"><span style="width:48%">Vida ${Math.max(0,p.hp)}/${p.maxHp} · PA ${p.ap}</span><span style="width:48%;text-align:right">Fuerza ${Math.max(0,meter)}/${B.max}</span></div>${B.curse?'<div style="color:#b08aff;font-size:17px">Eclipse: −2 a tu próxima tirada</div>':''}${B.garra?`<div style="color:#c0a0ff;font-size:17px">${B.troK?TROPHY[B.troK].name:'Trofeo'}: +${B.garra} a tu próxima tirada</div>`:''}`;
 let c;
 if(B.over&&B.next&&p.hp>0)c=`<button class="pri" onclick="UI.nextFight()">Enfrentar a ${B.next?BEASTS[B.next.kind].name:''}</button><button onclick="UI.fleeNext()">Huir · ${p.ap>=1?'1 PA':'1 vida'}</button>`;
 else if(B.over){c='';if(!B.autoClose){const bb=B;B.autoClose=setTimeout(()=>{if(B===bb&&!B.closing){B.closing=true;closeBattle()}},1800)}}
 else if(B.pending!=null)c=`<button class="pri" onclick="UI.accept()">Aceptar</button><button onclick="UI.reroll()">Repetir (${B.rerolls})</button>`;
 else c=`<button class="pri" onclick="UI.roll()" ${B.busy?'disabled':''}>Tirar dado · 1 PA</button><button onclick="UI.flee()" ${B.busy||(B.noFlee&&!B.over&&B.p.ap>=1)?'disabled':''}>Huir · ${p.ap>=1?'1 PA':'1 vida'}</button>${['copal','agua'].filter(k=>has(p,k)&&!(p.used||{})[k]&&p.hp<p.maxHp).map(k=>`<button onclick="UI.bUse('${k}')" ${B.busy?'disabled':''}>${ITEMS[k].name}</button>`).join('')}${B.garra?'':Object.keys(TRO_BON).filter(k=>p.trophies[k]>0).map(k=>`<button onclick="UI.trophy('${k}')" ${B.busy?'disabled':''}>${TROPHY[k].name.split(' ')[0]} (+${TRO_BON[k]}) ×${p.trophies[k]}</button>`).join('')}`;
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
function roll(fromReroll,forced){if(!B||B.busy)return;if(!fromReroll){if(B.p.ap<1){outOfAP();return}B.p.ap--}B.busy=true;renderBattle();const el=$('die');el.classList.add('rolling');let n=0;
 const bb=B;const it=setInterval(()=>{if(B!==bb){clearInterval(it);return}drawDie(rpick(FACES));if(++n>12){clearInterval(it);el.classList.remove('rolling');let f=forced??rpick(FACES);if(B.roar&&forced==null){B.roar=false;const f2=rpick(FACES),rk=x=>x==='bestia'?0:x==='azul'?9:x;if(rk(f2)<rk(f)){f=f2}toast(`Rugido: se tiró dos veces y quedó ${faceName(f)}`)}drawDie(f);el.classList.add('land');setTimeout(()=>el.classList.remove('land'),300);
  if(B.rerolls>0&&f!=='azul'){B.pending=f;B.busy=false;setBMsg(`Salió ${faceName(f)}. ¿Aceptás o repetís?`);renderBattle()}else resolve(f)}},65)}
function lunge(g,toward,dist=.45,cb){const base=g.position.clone();const dir=toward.clone().sub(base).setY(0).normalize();g.userData.lunge={base,dir,dist,t0:performance.now(),cb}}
function resolve(f){
 const bb=B;const{p,d,b}=B;B.busy=true;let text='',mult=1,effect=false,shiftNext=false,stunNext=false;
 const bp=()=>b.obj.position.clone().add(new THREE.Vector3(0,.55,0)),hp=()=>p.obj.position.clone().add(new THREE.Vector3(0,.6,0));
 if(f==='bestia'&&B.amulet){B.amulet=false;f='anulada';text='¡El Amuleto de Tláloc anula la cara de bestia!';ringFx(p.obj.position.clone().add(new THREE.Vector3(0,.7,0)),0x38c0b0,1.6);signText('Tláloc',p.obj)}
 if(f==='anulada'){}
 else if(f==='bestia'){const heal=Math.min(2+2*upN(b,'sed'),B.max-B.meter);B.meter+=heal;effect=true;text=heal?`¡Cara de bestia! ${d.name} se cura ${heal}.`:`¡Cara de bestia! ${d.name} se enfurece.`;
  const pos=bp();burst(pos,40,0xb070ff,1.6,{up:true,grav:.6,life:1.2});ringFx(b.obj.position.clone().add(new THREE.Vector3(0,.05,0)),0xb070ff,2.2,.8);if(heal)floatText('+'+heal,pos.clone().add(new THREE.Vector3(0,.7,0)),'#d0a0ff');flash(b.obj,0xb070ff,400)}
 else{
  const crit=f==='azul';if(f===2&&has(p,'pelota'))f=3;const BP=crit?[]:[[p.hero==='jaguar'?1:0,'jaguar'],[has(p,'macuahuitl')?1:0,'macuahuitl'],[B.first&&has(p,'atlatl')?2:0,'átlatl'],[B.first&&has(p,'munequeras')?1:0,'muñequeras'],[d.lvl>=3&&has(p,'tepoz')?2:0,'tepoztopilli'],[B.garra,B.troK?TROPHY[B.troK].name.split(' ')[0].toLowerCase():'trofeo'],[-B.curse,'eclipse']].filter(x=>x[0]);const bonus=BP.reduce((s,x)=>s+x[0],0);const armor=upN(b,'coraza')+(b.kind==='alacran'?1:0)+(b.kind==='jaguarsol'&&!has(p,'espejo')?1:0);const critD=d.lvl<=2?4:d.boss?4:6;let dmg=crit?Math.min(B.meter,critD):Math.max(0,f+bonus-armor);const tzDodge=!crit&&b.kind==='tzinacan'&&(G.phase===2||G.omen==='eclipse')&&Math.random()<1/3;if(tzDodge)dmg=0;B.garra=0;
  text=crit?(B.meter<=critD?'¡Golpe azul! Un ataque crítico que la derriba.':`¡Golpe azul! Ataque crítico: ${Math.min(B.meter,critD)} de daño.`):`Sacaste ${f}${BP.map(([v,l])=>` ${v>0?'+':'−'}${Math.abs(v)} ${l}`).join('')}${armor?` −${armor} ${b.kind==='jaguarsol'?'piel divina':b.kind==='alacran'?'caparazón':'coraza'}`:''}: ${dmg} de daño.${tzDodge?' ¡El Tzinacan se desvanece en la noche y esquiva!':''}`;B.curse=0;
  lunge(p.obj,b.obj.position,crit?.7:.45,()=>{});
  setTimeout(()=>{if(B!==bb)return;B.meter-=dmg;const pos=bp();flash(b.obj,crit?0x7ab0ff:0xffffff);doShake(crit?.22:.1,crit?420:240);
   if(crit){burst(pos,90,0x7ab0ff,4,{life:1});ringFx(pos,0x7ab0ff,3.2,.7);ringFx(pos,0xffffff,2,.4);bloomKick=1.4;floatText('¡CRÍTICO!',pos.clone().add(new THREE.Vector3(0,.9,0)),'#9ac0ff',1.3)}
   else{burst(pos,36,0xfff0c0,2.8);burst(pos,14,0xff9a40,1.6);floatText('-'+dmg,pos.clone().add(new THREE.Vector3(0,.7,0)),'#ffffff')}
   renderBattle()},200);
 }
 B.first=false;
 setTimeout(()=>{if(B!==bb)return;
  if(B.meter<=0){B.meter=0;const tr=d.trophy;
   const gl=d.glory+b.up.length;p.glory+=gl;p.kills[b.kind]++;p.trophies[tr]++;setTimeout(()=>floatText(TROPHY[tr].name,p.obj.position.clone().add(new THREE.Vector3(0,1.9,0)),'#ffffff',.8),700);if(b.kind==='guerrero'){const pp=b.obj.position.clone().add(new THREE.Vector3(0,1,0));burst(pp,120,0xffd040,3.4,{up:true,life:1.6});ringFx(pp,0xffd040,3.6,1);bloomKick=1.6;signText('El disco se enciende',b.obj)}sfxP(b.kind+'_muere');G.beasts.splice(G.beasts.indexOf(b),1);if(!d.boss)G.respawn.push({kind:b.kind,by:G.players.indexOf(p)});else log(`¡${p.name} derrota a ${d.name}!`);
   const pos=bp();b.obj.userData.dying=performance.now();burst(pos,80,0xf0c040,2.4,{up:true,life:1.3,grav:-.5});burst(pos,50,0xb070ff,2,{up:true,life:1.1});
   setTimeout(()=>floatText(`+${gl} GLORIA`,p.obj.position.clone().add(new THREE.Vector3(0,1.5,0)),'#f0c040',1.1),300);
   const nx=has(p,'mascara')?[]:beastsAt(hexOf(p)).filter(x=>x!==b&&!upN(x,'letargo'));B.next=nx[0]||null;B.over=true;B.busy=false;setBMsg(`${text}<br><b class="gold">¡Victoria!</b> +${gl} de gloria y obtenés <b>${TROPHY[tr].name}</b> <img class="ico" src="${RICO[tr]}" alt="">.`);log(`${p.name} vence a ${d.name}.`);renderBattle();return}
  if(effect){
   const ep=b.obj.position.clone().add(new THREE.Vector3(0,1.2,0));
   if(b.kind==='calaca'){const own=RK.filter(k=>p.res[k]>0);if(own.length){const k=rpick(own);p.res[k]--;text+=` ¡Saqueo! Te roba 1 de ${RES[k].toLowerCase()}.`;floatText('-1 '+RES[k],p.obj.position.clone().add(new THREE.Vector3(0,1.5,0)),'#ff9a40',.85)}else text+=' Intenta saquearte, pero no tenés nada.';signText('Saqueo',b.obj)}
   if(b.kind==='tzitzimitl'){B.curse=2;text+=' ¡Eclipse! Tu próxima tirada vale 2 menos.';signText('Eclipse',b.obj);burst(p.obj.position.clone().add(new THREE.Vector3(0,.9,0)),30,0x6a4ad0,1.2,{grav:.3,life:1.3})}
   if(b.kind==='tlaltecuhtli'){mult=2;text+=' ¡Mil fauces!';signText('Mil fauces',b.obj)}
   if(b.kind==='jaguarsol'){mult=2;B.steal=true;text+=' ¡Devorador de gigantes!';signText('Devorador',b.obj);setTimeout(()=>{burst(p.obj.position.clone().add(new THREE.Vector3(0,.6,0)),60,0xffc040,2.6,{life:.9});bloomKick=1.1},250)}
   if(b.kind==='alacran'){p.poison=3;text+=' ¡Aguijón! Quedás envenenado 3 turnos.';signText('Aguijón',b.obj);setTimeout(()=>burst(p.obj.position.clone().add(new THREE.Vector3(0,.7,0)),40,0x7ad06a,1.8,{up:true,grav:.4,life:1.2}),250)}
   if(b.kind==='tzinacan'){B.bite=2;p.ap=Math.max(0,p.ap-1);text+=' ¡Mordida de Mictlán! Te roba vida y 1 PA.';signText('Mordida',b.obj);setTimeout(()=>burst(p.obj.position.clone().add(new THREE.Vector3(0,.7,0)),40,0xb02050,2,{life:1}),250)}
   if(b.kind==='guerrero'){mult=2;const DEF=['chimalli','yugo','ichca'].filter(k=>has(p,k)&&!(p.broken||{})[k]);if(DEF.length){const k=rpick(DEF);p.broken=p.broken||{};p.broken[k]=true;if(k==='chimalli')B.block=false;if(k==='ichca'){p.maxHp-=2;p.hp=Math.min(p.hp,p.maxHp)}text+=` ¡Golpe de obsidiana! Te rompe: ${ITEMS[k].name}.`}else text+=' ¡Golpe de obsidiana!';signText('Golpe de obsidiana',b.obj);setTimeout(()=>{burst(p.obj.position.clone().add(new THREE.Vector3(0,.6,0)),60,0x30202a,2.6,{life:1});burst(p.obj.position.clone().add(new THREE.Vector3(0,.6,0)),30,0xff4020,2,{life:.8})},250)}
   if(b.kind==='ahuizotl'){p.ap=Math.max(0,p.ap-1);text+=' ¡Arrastre! Te hunde en el agua: perdés 1 PA.';signText('Arrastre',b.obj);setTimeout(()=>burst(p.obj.position.clone().add(new THREE.Vector3(0,.4,0)),40,0x5ab8e0,2,{up:true,grav:1.5,life:.9}),250)}
   if(b.kind==='chaneque'){const own=p.items.filter(k=>!(p.broken||{})[k]&&!(p.hidden||{})[k]);if(own.length){const k=rpick(own);p.hidden=p.hidden||{};p.hidden[k]=true;text+=` ¡Travesura! Te esconde: ${ITEMS[k].name} (vuelve al amanecer).`;if(k==='chimalli')B.block=false}else text+=' ¡Travesura! Busca algo para esconderte, pero no llevás nada.';signText('Travesura',b.obj);setTimeout(()=>burst(p.obj.position.clone().add(new THREE.Vector3(0,.8,0)),30,0x6ab040,1.4,{up:true,grav:.5,life:1.1}),250)}
   if(b.kind==='xolotl'){if(p.maxHp>2){p.maxHp--;p.soul=(p.soul||0)+1;p.hp=Math.min(p.hp,p.maxHp);text+=' ¡Guía de almas! Perdés 1 de vida máxima hasta el amanecer.'}else text+=' ¡Guía de almas! Tu alma resiste.';signText('Guía de almas',b.obj);setTimeout(()=>burst(p.obj.position.clone().add(new THREE.Vector3(0,.7,0)),40,0x5aa0ff,1.6,{up:true,grav:-.4,life:1.3}),250)}
   if(b.kind==='nahual'){shiftNext=true;text+=' ¡Cambio de forma! Su próximo ataque hará el doble.';signText('Cambio de forma',b.obj);burst(b.obj.position.clone().add(new THREE.Vector3(0,.6,0)),50,0x6a3a90,1.6,{up:true,grav:-.2,life:1.4})}
   if(b.kind==='tepeyollotl'){B.roar=true;text+=' ¡Rugido! Tu próxima tirada se hace dos veces y queda la peor.';signText('Rugido',b.obj);doShake(.22,500);ringFx(b.obj.position.clone().add(new THREE.Vector3(0,.3,0)),0xffa040,2.6,.8)}
   if(b.kind==='quinametzin'){mult=2;stunNext=true;text+=' ¡Mazazo!';signText('Mazazo',b.obj);setTimeout(()=>{doShake(.28,500);burst(p.obj.position.clone().add(new THREE.Vector3(0,.3,0)),50,0x9a8060,2.4,{up:true,grav:1.5,life:.9})},250)}
   if(b.kind==='xochitonal'){mult=2;B.noFlee=true;p.ap=Math.max(0,p.ap-1);text+=' ¡Mordida! Te atrapa: no podés huir y perdés 1 PA.';signText('Mordida',b.obj);setTimeout(()=>burst(p.obj.position.clone().add(new THREE.Vector3(0,.5,0)),40,0x40b0a0,2,{life:1}),250)}
   if(b.kind==='xiuhcoatl'){mult=3;text+=' ¡Llamarada!';signText('Llamarada',b.obj);setTimeout(()=>{burst(p.obj.position.clone().add(new THREE.Vector3(0,.6,0)),70,0xff6a20,3,{life:.9});bloomKick=1.2},250)}}
  if(B.shift){B.shift=false;mult*=2;text+=' ¡Forma bestial!'}if(B.stun&&!effect){B.stun=false;mult=0;text+=` ${d.name} se recupera del mazazo y no ataca.`}
  let dmg=(atkOf(b)+(b.kind==='guerrero'&&B.meter*2<=B.max?1:0))*mult+(B.bite||0);if(shiftNext)B.shift=true;if(stunNext)B.stun=true;const noRed=b.kind==='jaguarsol';const dodge=has(p,'colibri')&&Math.random()<1/3;if(dodge){dmg=0;text+=' ¡Esquivás el golpe!'}else if(B.block){B.block=false;dmg=0;text+=' Tu chimalli bloquea el golpe.'}else if(dmg>1&&has(p,'yugo')&&!noRed){dmg-=1;text+=' (yugo −1)'}if(dmg>1&&p.hero==='pochteca'&&!noRed&&!B.reflex){B.reflex=true;dmg-=1;text+=' (reflejos −1)'}
  if(B.steal&&dmg){B.meter=Math.min(B.max,B.meter+dmg);text+=` Recupera ${dmg} de fuerza.`}if(B.bite&&dmg){B.meter=Math.min(B.max,B.meter+2)}B.steal=false;B.bite=0;
  lunge(b.obj,p.obj.position,.5);sfxP(effect?b.kind+'_ataque':'zarpazo');
  setTimeout(()=>{if(B!==bb)return;const pos=hp();if(dmg){flash(p.obj,0xff3a2a);burst(pos,30,0xff5a3a,2.6);doShake(mult>1?.2:.12);floatText('-'+dmg,pos.clone().add(new THREE.Vector3(0,.8,0)),'#ff7a5a',mult>1?1.25:1)}else{burst(pos,24,dodge?0x38c0b0:0xf0c040,2);ringFx(pos,dodge?0x38c0b0:0xf0c040,1.4);floatText(dodge?'ESQUIVA':mult===0?'ATURDIDO':'BLOQUEO',pos.clone().add(new THREE.Vector3(0,.8,0)),'#f0c040')}
   p.hp-=dmg;if(dmg)text+=` ${d.name} te hace ${dmg}.`;
   if(p.hp<=0){B.over=true;B.busy=false;p.obj.userData.dying=performance.now();sfxP('caida');setTimeout(()=>{if(B!==bb)return;B.koPending=true;setBMsg(`${text}<br><b style="color:#ff7a5a">Caíste en combate.</b> Perdés 1 de dignidad.`);renderBattle()},500);return}
   B.busy=false;setBMsg(text);renderBattle();if(p.ap<1&&!B.over)setTimeout(()=>{if(B===bb&&!B.over){outOfAP();setBMsg(text+'<br><b style="color:#ff9a40">Sin PA:</b> te retirás; la bestia conserva sus heridas hasta el amanecer.')}},700)},220);
 },f==='bestia'?700:900);
 setBMsg(text);renderBattle();
}
function saveWound(){if(B&&!B.b.obj.userData.dying)B.b.wound=Math.max(0,B.max-B.meter)}
function outOfAP(){if(!B)return;saveWound();B.over=true;B.busy=false;setBMsg(`<b style="color:#ff9a40">Sin PA:</b> te retirás. ${B.d.name} conserva sus heridas hasta el amanecer (fuerza ${B.meter}/${B.max}).`);log(`${B.p.name} se queda sin fuerzas y se retira de ${B.d.name}.`);renderBattle()}
function flee(){if(!B||B.busy)return;if(B.noFlee&&!B.over&&B.p.ap>=1){toast('¡El Xochitónal no te suelta!');return}const p=B.p;if(!B.over){if(p.ap>=1)p.ap--;else{p.hp=Math.max(1,p.hp-1);floatText('-1',p.obj.position.clone().add(new THREE.Vector3(0,1.4,0)),'#ff7a5a')}}saveWound();log(`${p.name} huye de ${B.d.name}.`);B.over=true;closeBattle()}
function checkKOEnd(){if(G&&G.endAfterKO&&!B){G.endAfterKO=false;G.pending=null;toast('Caíste: tu turno termina');setTimeout(()=>endTurn(),900)}}
function nextFight(){if(!B||!B.next)return;const nb=B.next,saved=B.saved,dead=B.b;if(dead.obj.userData.dying)removeBillboard(dead.obj);(B.hiddenDecor||[]).forEach(c=>c.visible=true);B=null;
 openBattle(nb);B.saved=saved;signText('¡Otra bestia!',nb.obj)}
function fleeNext(){if(!B)return;const p=B.p;if(p.ap>=1)p.ap--;else p.hp=Math.max(1,p.hp-1);log(`${p.name} huye de ${BEASTS[B.next.kind].name}.`);B.next=null;closeBattle()}
function closeBattle(){
 const{p,b}=B;
 if(b.obj.userData.dying)removeBillboard(b.obj);else b.obj.userData.lock=false;
 if(B.koPending){const U=p.obj.userData,m=U.spr,mt=m.userData.mat;U.dying=0;U.lunge=null;U.anim=null;U.walk=false;mt.opacity=1;mt.alphaTest=.5;mt.transparent=false;mt.needsUpdate=true;m.position.y=0;p.obj.scale.setScalar(1);ko(p,`ante ${B.d.name}`);U.target=null;p.obj.position.copy(slotPos(capital,0))}
 p.obj.userData.lock=false;p.obj.userData.inCombat=false;G.players.forEach(q=>q.obj.visible=true);
 tweenCam(B.saved.pos,B.saved.tgt,800,()=>{controls.enabled=true;checkKOEnd()});
 (B.hiddenDecor||[]).forEach(c=>c.visible=true);B=null;$('hint').classList.remove('hidden');$('battle').classList.add('hidden');$('die').classList.add('hidden');$('panel').classList.remove('hidden');update();
}

/* ================= fin ================= */
function score(p){const set=[1,2,3].every(l=>Object.keys(p.kills).some(k=>BEASTS[k]&&BEASTS[k].lvl===l&&p.kills[k]>0))?3:0,pen=(has(p,'penacho')?3:0)+(has(p,'cacao')?2:0)+(has(p,'anillo')?2:0),tro=p.trophies.hueso+p.trophies.colmillo*2+p.trophies.corazon*5+(p.trophies.pielsol||0)*6+(p.trophies.aguijon||0)*5+(p.trophies.ala||0)*5+(p.trophies.disco||0)*8,hun=huntPts(p);const raw=p.glory+set+pen+tro+hun-p.dignityLost*2,sunPen=G&&G.stageLost?Math.floor(Math.max(0,raw)/2):0;return{hun,glory:p.glory,set,pen,tro,dig:p.dignityLost*2,sunPen,total:raw-sunPen}}
function endGame(){G.over=true;clearSave();const rank=G.players.slice().sort((a,b)=>score(b).total-score(a).total||b.items.length-a.items.length);
 $('endList').innerHTML=rank.map((p,i)=>{const s=score(p);return`<div class="row" style="margin:8px 0;align-items:flex-start"><span class="px gold" style="width:22px">${i+1}</span>${portrait(p.hero,40,p.hue)}<div style="flex:1"><div style="color:${p.color}">${p.name} · <b>${s.total}</b> puntos</div><div class="mut" style="font-size:17px">Gloria ${s.glory}${s.set?` · bestiario +${s.set}`:''}${s.pen?` · objetos +${s.pen}`:''}${s.tro?` · trofeos +${s.tro}`:''}${s.hun?` · cacerías +${s.hun}`:''}${s.dig?` · dignidad −${s.dig}`:''}${s.sunPen?` · <span style="color:#ff7a5a">ocaso eterno −${s.sunPen}</span>`:''}</div></div></div>`}).join('')+`<p class="mut" style="text-align:center">${rank[0].name} será recordado como el héroe del valle.</p>`;
 controls.autoRotate=true;$('ovEnd').classList.remove('hidden');update()}

/* ================= interfaz ================= */
function update(){
 if(!G)return;const p=curP(),h=hexOf(p),cd=canDo();
 $('topInfo').innerHTML=`<span class="px">Día ${G.day}/${G.days}</span>${G.omen?`<span class="px" style="color:#d0a0ff" title="${OMENS[G.omen].desc}">${OMENS[G.omen].name}</span>`:''}<span class="px" style="color:${['#f6dc80','#f0a860','#a8a8ff'][G.phase]}">${PHASES[G.phase]}</span><span class="px" style="color:${p.color}">${p.name}</span>`;
 const mx=maxAP(p);
 $('me').innerHTML=`<div class="row" style="gap:6px">${portrait(p.hero,30,p.hue)}<span class="nm" style="color:${p.color}">${p.name}</span><div class="bar" style="flex:1;min-width:40px"><i style="width:${p.hp/p.maxHp*100}%"></i></div><span style="font-size:18px">${p.hp}/${p.maxHp}</span><span class="gold" style="font-size:18px">★${p.glory}</span></div>
  <div class="row" style="gap:6px;margin-top:3px;flex-wrap:wrap"><span>${Array.from({length:mx},(_,i)=>`<span class="pip ${i<p.ap?'':'off'}"></span>`).join(' ')}</span>${p.freeMoves?`<span class="mut" style="font-size:16px">+${p.freeMoves}</span>`:''}<span style="margin-left:auto">${resHTML(p.res)}${Object.entries(p.trophies).filter(([k,v])=>v).map(([k,v])=>`<span class="res" data-tip="${TROPHY[k].name}: ${TROPHY[k].desc}"><img class="ico" src="${RICO[k]}" alt="${TROPHY[k].name}">${v}</span>`).join('')}</span></div>${p.items.length?`<div class="row" style="gap:4px;margin-top:3px;flex-wrap:wrap">${p.items.map(k=>`<span class="itm ${(p.broken||{})[k]||(p.hidden||{})[k]?'off':''}" data-tip="${ITEMS[k].name}: ${ITEMS[k].desc}${(p.broken||{})[k]?' (roto)':(p.hidden||{})[k]?' (escondido hasta el amanecer)':''}"><img class="ico" src="${ICO[TYPEICO[ITEMS[k].type]]}" alt="${ITEMS[k].name}"></span>`).join('')}</div>`:''}`;
 const bz=busy();let a='';const ib=(k,img,cost,ok,extra='')=>`<button class="ib plain ${ok?'':'off'} ${extra}" onclick="UI.tap('${k}')" aria-label="${k.startsWith('sum:')?'Invocar '+BEASTS[k.slice(4)].name:(LABEL[k]||ITEMS[k]?.name)}" title="${k.startsWith('sum:')?'Invocar '+BEASTS[k.slice(4)].name:(LABEL[k]||ITEMS[k]?.name)}"><img src="${img}" alt="">${cost?`<span class="cost">${cost}</span>`:''}</button>`;
 if(G.mode==='respawn'){a='<span class="mut" style="font-size:18px">Reaparición de bestias…</span>'}
 else if(G.mode==='act'){a=['gather','fight','deliver','rest'].map(k=>ib(k,ICO[k],k==='gather'?gatherCost(h):1,!bz&&cd[k])).join('')+(h.t==='K'?ib('hunt',ICO.hunt,1,!bz&&cd.hunt):'')+(G.altars&&h.altar?ib('fly',ICO.fly,omen('viento')?0:2,!bz&&cd.fly):'')+(G.extras==='mercado'&&h.theme==='mercado'?ib('trade',ICO.trade,1,!bz&&cd.trade):'')+['copal','agua'].filter(k=>has(p,k)).map(k=>ib(k,ICO.copal,0,!bz&&cd[k])).join('')+ib('end',ICO.end,0,!bz,'endb')}
 else{const opts=acechoOptions();a=`<span class="px gold" style="align-self:center;margin-right:4px">Furia ${G.furia}</span>`+(opts.includes('paw')?ib('paw',ICO.paw,1,!bz):'')+opts.filter(o=>o.startsWith('sum:')).map(o=>ib(o,PORTRAIT_URL(o.slice(4)),BEASTS[o.slice(4)].lvl+1,!bz,'beast')).join('')+ib('end',ICO.end,0,!bz,'endb')}
 $('acts').innerHTML=a;
 $('hint').textContent=G.mode==='respawn'?'Tocá una guarida violeta':G.pending&&G.pending.type==='fly'?'Tocá el altar de destino':G.transition?'':G.mode==='act'?(p.ap>0||p.freeMoves?'Tocá un hexágono dorado para moverte':''):!G.pending?'Acecho: mové o invocá bestias contra tus rivales':G.pending.type==='pickBeast'?'Tocá la bestia que querés mover':G.pending.type==='moveBeast'?'Tocá a dónde moverla':'Tocá una guarida violeta';
 const s=G.sel||h,sb=beastAt(s),sh=heroesAt(s);
 let info=`<span style="color:${s.theme?CITY_INFO[s.theme].col:'#f0c040'}">${s.name||TERR[s.t].name}</span>`;
 if(RESOF[s.t])info+=` · <img class="ico" src="${RICO[RESOF[s.t]]}" alt=""> ${RES[RESOF[s.t]]} ${s.stock}/2${gatherCost(s)>1?' (2 PA)':''}`;if(s.t==='V')info+=' · subir cuesta 2 PA';
 if(TERR[s.t].water)info+=' · no se puede cruzar';
 if(s.t==='K')info+=' · <span class="gold">entregá trofeos para las cacerías</span>';
 if(TERR[s.t].city)info+=s.card?` · pide ${needHTML(s.card.need)}→ <b data-tip="${ITEMS[s.card.item].name}: ${ITEMS[s.card.item].desc}" style="text-decoration:underline dotted">${ITEMS[s.card.item].name}</b> <b class="gold">★${s.card.glory}</b>`:' · sin carta hasta el amanecer';
 if(sb){const d=BEASTS[sb.kind];const nb=beastsAt(s).length;if(nb>1)info+=` · <b style="color:#ff7a5a">${nb} bestias</b>`;info+=` · ${d.name} · N${d.lvl} · mueve ${MOVE[sb.kind]} · fuerza ${strOf(sb)-(sb.wound||0)}/${strOf(sb)}${sb.wound?' (herida)':''} · ataque ${atkOf(sb)}${sb.up.length?` · <span class="gold">${sb.up.length} mejora${sb.up.length>1?'s':''}</span>`:''} · <span class="mut">${d.eff}</span>`}
 if(s.altar)info+=' · <span style="color:#7ae8f0">Altar de Ehécatl</span>';
 if(s.lair&&!sb)info+=` · <span style="color:#${LAIRCOL[s.lair].toString(16)}">guarida de ${BEASTS[slotKind(BY_LVL[s.lair])].name}</span>`;
 if(sh.length)info+=` · <span class="mut">Aquí: ${sh.map(q=>`<span style="color:${q.color}">${q.name}</span>`).join(', ')}</span>`;
 $('info').innerHTML=info;
 showRings();autoCheck();
}
function cardHTML(c,card){const it=ITEMS[card.item],ok=G&&canPay(curP(),card.need);
 const cc=CITY_INFO[c.theme].col;return`<div class="card" style="border-color:${cc};box-shadow:inset 0 0 0 2px ${cc}88,0 3px 0 rgba(0,0,0,.35)"><div class="row" style="justify-content:space-between;background:${cc};color:#120c18;margin:-7px -9px 4px;padding:4px 9px;border-radius:5px 5px 0 0"><b>${c.name}</b><span style="font-size:16px">${CITY_INFO[c.theme].kind}</span></div>
 <div class="row" style="margin:6px 0;gap:10px"><div class="cardart"><img src="${ICO[TYPEICO[it.type]]}" alt=""></div><div style="flex:1"><b style="font-size:21px">${it.name}</b><div style="font-size:17px">${it.desc}</div><div style="font-size:15px;opacity:.7">${it.type} · nivel ${it.tier}</div></div></div>
 <div class="row" style="justify-content:space-between;border-top:1px dashed #8a6a40;padding-top:4px"><span>Pide ${needHTML(card.need)}</span><b style="color:#a86a00">★ ${card.glory}</b></div>${ok?'<div style="color:#2f6b2a;font-size:16px">Tenés los recursos</div>':''}</div>`}
function showCityCard(c){const body=c.card?cardHTML(c,c.card)+`<div class="mut" style="font-size:16px">Quedan ${c.deck.length} cartas en el mazo${hexOf(curP())===c?'':' · andá a la ciudad para entregarla'}</div>`:`<div class="mut">Sin carta hasta el amanecer${c.deck.length?'':' · mazo agotado'}.</div>`;msg(c.name,body)}
function huntOK(p,k){const H=HUNT[k];return p.ap>=1&&G.hunts[k]===null&&p.trophies[H.trophy]>0&&p.hunt[k]<H.need}
function flyTo(p,h){G.pending=null;p.ap-=omen('viento')?0:2;G.walking=true;const from=p.obj.position.clone().add(new THREE.Vector3(0,.5,0));burst(from,60,0x7ae8f0,2.4,{up:true,life:1.1,grav:1});ringFx(from,0x7ae8f0,2);signText('Viento de Ehécatl',p.obj);
 p.obj.userData.lock=true;setTimeout(()=>{p.q=h.q;p.r=h.r;p.obj.position.copy(slotPos(h,0));const to=p.obj.position.clone().add(new THREE.Vector3(0,.5,0));burst(to,60,0x7ae8f0,2.4,{up:true,life:1.1});ringFx(to,0x7ae8f0,2);
  const c=hexCenter(h);const off=camera.position.clone().sub(controls.target);tweenCam(c.clone().add(off),c.clone().add(new THREE.Vector3(0,.4,0)),700);
  setTimeout(()=>{p.obj.userData.lock=false;G.walking=false;log(`${p.name} viaja con el viento.`);const foes=omen('niebla')?[]:beastsAt(h).filter(b=>!upN(b,'letargo'));if(foes.length&&!has(p,'mascara')){signText('¡Emboscada!',foes[0].obj);setTimeout(()=>openBattle(foes[0]),500)}else update()},750)},450);update()}
function showTrade(){const p=curP();$('mTitle').textContent='Mercado de Xalpan';$('mBody').innerHTML=`<div class="mut" style="font-size:17px;margin-bottom:6px">Cambiá 2 recursos iguales por 1 a elección (1 PA)</div>`+RK.filter(k=>p.res[k]>=2).map(a=>`<div style="margin:6px 0;text-align:left">Dar <img class="ico" src="${RICO[a]}" alt="">×2 por:</div><div class="g3">${RK.filter(b=>b!==a).map(b=>`<button class="plain" style="text-align:center" onclick="UI.trade('${a}','${b}')"><img class="ico" src="${RICO[b]}" alt=""> ${RES[b]}</button>`).join('')}</div>`).join('')||'<div>No tenés 2 recursos iguales.</div>';$('ovMsg').classList.remove('hidden')}
function doTrade(a,b){const p=curP();if(p.ap<1||p.res[a]<2)return;p.ap--;p.res[a]-=2;p.res[b]++;log(`${p.name} cambia 2 de ${RES[a].toLowerCase()} por 1 de ${RES[b].toLowerCase()}.`);floatText(`+1 ${RES[b]}`,p.obj.position.clone().add(new THREE.Vector3(0,1.3,0)),'#fff0b0',.9);$('ovMsg').classList.add('hidden');update()}
function showHuntPick(){const p=curP();$('mTitle').textContent='Cacerías';$('mBody').innerHTML=Object.keys(HUNT).map(k=>{const H=HUNT[k],T=TROPHY[H.trophy],ch=G.hunts[k];const n=Math.min(p.trophies[H.trophy],H.need-p.hunt[k]);
  return`<div class="card" style="text-align:left;border-color:#f0c040"><div class="row" style="gap:6px">${portrait(slotKind(k),30)}<b>Cacería de ${BEASTS[slotKind(k)].name}</b></div>
  <div style="font-size:17px">Acepta solo <img class="ico" src="${RICO[H.trophy]}" alt=""> <b>${T.name}</b> · tenés ${p.trophies[H.trophy]} · progreso ${p.hunt[k]}/${H.need} (${p.hunt[k]?H.pts[p.hunt[k]-1]:0} pts)</div>
  ${ch!==null?`<div style="color:#a86a00"><b>Cerrada: campeón ${G.players[ch].name}</b></div>`:huntOK(p,k)?`<button class="pri" style="width:100%;margin-top:4px;color:#fff;background:#8a5a1e;border-color:#5a3a1e" onclick="UI.huntGive('${k}')">Entregar ${n} · 1 PA</button>`:`<div class="mut" style="font-size:16px;color:#6a5a40">${p.trophies[H.trophy]?'Sin PA':'No tenés '+T.name.toLowerCase()}</div>`}</div>`}).join('');$('ovMsg').classList.remove('hidden')}
function huntGive(k){const p=curP(),H=HUNT[k];if(!huntOK(p,k))return;p.ap--;const n=Math.min(p.trophies[H.trophy],H.need-p.hunt[k]);p.trophies[H.trophy]-=n;p.hunt[k]+=n;
 const top=p.obj.position.clone().add(new THREE.Vector3(0,1.3,0));burst(top,40,0xf0c040,2,{up:true});floatText(`+${n} ${BEASTS[slotKind(k)].name.split(' ')[0]}`,top,'#f0c040',.9);log(`${p.name} entrega ${n} ${TROPHY[H.trophy].name.toLowerCase()} a la cacería de ${BEASTS[slotKind(k)].name} (${p.hunt[k]}/${H.need}).`);
 if(p.hunt[k]>=H.need){G.hunts[k]=G.players.indexOf(p);log(`${p.name} se corona campeón de la cacería de ${BEASTS[slotKind(k)].name}.`);$('ovMsg').classList.add('hidden');
  setTimeout(()=>{const pos=p.obj.position.clone().add(new THREE.Vector3(0,1,0));burst(pos,140,0xf0c040,3.4,{up:true,life:1.6,grav:-1});ringFx(pos,0xf0c040,3.6,1);ringFx(pos,0xffffff,2.2,.6);doShake(.2,500);bloomKick=1;signText('¡Campeón de la cacería!',p.obj);
   msg('¡Campeón de la cacería!',`<b>${p.name}</b> completa la cacería de <b>${BEASTS[k].name}</b> y se lleva <b class="gold">${H.pts[H.need-1]} puntos</b>. Esta cacería queda cerrada.`,k)},250)}
 else showHuntPick();update()}
function huntsHTML(){return`<div class="px gold" style="margin:10px 0 6px">Cacerías</div>`+Object.keys(HUNT).map(k=>{const H=HUNT[k],ch=G.hunts[k];return`<div class="card" style="border-color:#f0c040"><div class="row" style="justify-content:space-between"><span class="row" style="gap:6px">${portrait(slotKind(k),30)}<b>${BEASTS[slotKind(k)].name}</b></span><span style="font-size:16px">${H.need} entregas · ${H.pts.join('·')}</span></div>${ch!==null?`<div style="color:#a86a00"><b>Campeón: ${G.players[ch].name}</b></div>`:''}${G.players.map(q=>`<div class="row" style="gap:6px;font-size:17px"><span class="dot" style="background:${q.color}"></span><span style="width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.name}</span><span>${Array.from({length:H.need},(_,i)=>`<span style="display:inline-block;width:10px;height:10px;margin-right:2px;border:1px solid #5a3a1e;background:${i<q.hunt[k]?'#f0c040':'transparent'}"></span>`).join('')}</span><b style="margin-left:auto">${q.hunt[k]?H.pts[q.hunt[k]-1]:0}</b></div>`).join('')}</div>`}).join('')+`<div class="mut" style="font-size:16px">Entregá huesos, garras o colmillos en el Teocalli Mayor (1 PA). El primero en completar una cacería se corona y la cierra.</div>`}
function showCatalog(){const row=(c,card,state)=>{const it=ITEMS[card.item];return`<div class="card" style="border-color:${CITY_INFO[c.theme].col};margin:4px 0;padding:5px 8px;${state.dim?'opacity:.6':''}"><div class="row" style="gap:8px"><img src="${ICO[TYPEICO[it.type]]}" class="spr" style="width:26px;height:26px" alt=""><div style="flex:1"><b>${it.name}</b> <span style="font-size:15px">· ${it.desc}</span><div style="font-size:15px">Pide ${needHTML(card.need)} · <b style="color:#a86a00">★${card.glory}</b></div></div><span style="font-size:14px;font-weight:bold;color:${state.col}">${state.label}</span></div></div>`};
 $('boardBody').innerHTML=cities.map(c=>`<div class="px" style="margin:10px 0 2px;color:${CITY_INFO[c.theme].col}">${c.name}</div>`+(c.card?row(c,c.card,{label:'DISPONIBLE',col:'#2f6b2a'}):'')+c.deck.map(d=>row(c,d,{label:'EN EL MAZO',col:'#5a3a1e'})).join('')+(c.done||[]).map(d=>row(c,d,{label:'ENTREGADA · '+d.by,col:'#8a2418',dim:true})).join('')).join('')+`<button style="width:100%;margin-top:8px" onclick="UI.board()">Volver a las cartas vigentes</button>`;$('ovBoard').classList.remove('hidden')}
function beastsBoardHTML(){const ku=G.kindUps||{};const tip=k=>`<span data-tip="${UPGRADES[k].name}: ${UPGRADES[k].desc}" style="color:#9a4a00;font-weight:bold;text-decoration:underline dotted">${UPGRADES[k].name}</span>`;
 const row=(kind,ups,note)=>{const d=BEASTS[kind],n=G.beasts.filter(b=>b.kind===kind).length,f=d.str+2*ups.filter(u=>u==='piel').length+3*ups.filter(u=>u==='ira').length,a=d.atk+ups.filter(u=>u==='colmillos'||u==='ira').length;
  return`<div class="card" style="padding:6px 10px"><div class="row" style="gap:8px">${portrait(kind,32)}<b style="flex:1">${d.name}</b><span class="mut" style="font-size:15px">nivel ${d.lvl}${n?` · ${n} en el mapa`:''}</span></div><div style="font-size:16px;margin-top:2px">Fuerza ${f} · ataque ${a}</div>
  <div style="font-size:16px;margin-top:3px;padding-top:3px;border-top:1px dashed #b08a50">${ups.length?'Mejoras: '+ups.map(tip).join(', '):`<span class="mut">${note||'Sin mejoras todavía'}</span>`}</div></div>`};
 let h=[1,2,3].map(l=>{const k=slotKind(BY_LVL[l]);return k?row(k,ku[k]||[]):''}).join('');
 const bb=G.beasts.find(b=>BEASTS[b.kind].boss&&b.obj.visible!==false);
 if(bb)h+=row(bb.kind,bb.up,bb.kind==='guerrero'?'No recibe mejoras':'Recibe la Furia del Quinto Sol el último día');
 return`<div class="px gold" style="font-size:9px;margin:12px 0 6px">Bestias y sus mejoras</div>`+h}
function showBoard(){if(!G)return;$('boardBody').innerHTML=cities.map(c=>c.card?cardHTML(c,c.card)+`<div class="mut" style="font-size:16px;margin:-2px 0 8px 4px">Quedan ${c.deck.length} cartas en el mazo</div>`:`<div class="card" style="opacity:.6;border-color:${CITY_INFO[c.theme].col}"><b style="color:${CITY_INFO[c.theme].col};text-shadow:1px 1px 0 #000">${c.name}</b><div>Sin carta hasta el amanecer${c.deck.length?'':' · mazo agotado'}.</div></div>`).join('')+`<button style="width:100%;margin:4px 0" onclick="UI.catalog()">Ver todas las cartas de cada ciudad</button>`+beastsBoardHTML()+huntsHTML();$('ovBoard').classList.remove('hidden')}
function showDetails(){
 if(!G)return;const p=curP();
 $('dBody').innerHTML=`<div class="px" style="margin-bottom:6px">${p.name}</div>
 <div class="mut">Dignidad ${3-p.dignityLost}/3 · Bestias: ${Object.entries(p.kills).filter(([k,v])=>v>0||['calaca','tzitzimitl','tlaltecuhtli'].map(slotKind).includes(k)).map(([k,v])=>`${BEASTS[k].name} ${v}`).join(', ')}</div>
 <div style="margin:6px 0">${Object.entries(p.trophies).filter(([k,v])=>v).map(([k,v])=>`<div><img class="ico" src="${RICO[k]}" alt=""> <b>${TROPHY[k].name} ×${v}</b> <span class="mut">· ${TROPHY[k].desc}</span></div>`).join('')}${p.items.length?p.items.map(k=>`<div><img class="ico" src="${ICO[TYPEICO[ITEMS[k].type]]}" alt=""> <b class="gold">${ITEMS[k].name}</b> <span class="mut">· ${ITEMS[k].desc}</span></div>`).join(''):'<span class="mut">Sin objetos todavía.</span>'}</div>
 <div class="px" style="margin:10px 0 4px">Héroes</div>${G.players.map(q=>`<div class="row" style="justify-content:space-between"><span><span class="dot" style="background:${q.color}"></span> ${q.name}</span><span>${q.hp}♥ · <b class="gold">${q.glory}</b> gloria</span></div>`).join('')}
 <div class="px" style="margin:10px 0 4px">Crónica</div><div class="log">${G.log.map(m=>`<div>${m}</div>`).join('')}</div>`;
 $('ovDetails').classList.remove('hidden');
}

/* anillos de selección */
const rings=[];const ringMats={gold:new THREE.MeshBasicMaterial({color:0xffd230,transparent:true,opacity:.8,depthWrite:false,depthTest:false}),red:new THREE.MeshBasicMaterial({color:0xff4a3a,transparent:true,opacity:.8,depthWrite:false,depthTest:false}),violet:new THREE.MeshBasicMaterial({color:0xb070ff,transparent:true,opacity:.8,depthWrite:false,depthTest:false}),sel:new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35,depthWrite:false})};
/* anillos más visibles de día: contorno oscuro, relleno suave, siempre por encima y con pulso */
const RING_O=new THREE.RingGeometry(RAD*.74,RAD*.94,6);RING_O.rotateX(-Math.PI/2);RING_O.rotateY(Math.PI/6);
const RING_F=new THREE.CircleGeometry(RAD*.78,6);RING_F.rotateX(-Math.PI/2);RING_F.rotateY(Math.PI/6);
const RING_OM=new THREE.MeshBasicMaterial({color:0x1a0e06,transparent:true,opacity:.6,depthWrite:false,depthTest:false});
const _rf=new Map();const ringFill=m=>{let f=_rf.get(m);if(!f){f=new THREE.MeshBasicMaterial({color:m.color,transparent:true,opacity:.16,depthWrite:false,depthTest:false});_rf.set(m,f)}return f};
let _rpT=0;function ringPulse(){const t=performance.now();if(t-_rpT<16)return;_rpT=t;const k=.5+.5*Math.sin(t/260);for(const m of [ringMats.gold,ringMats.red,ringMats.violet])m.opacity=.78+.22*k;for(const f of _rf.values())f.opacity=.1+.12*k}
function showRings(){rings.forEach(r=>scene.remove(r));rings.length=0;if(!G||G.over||B)return;const p=curP();
 const add=(list,mat)=>list.forEach(n=>{const y=n.top+.03;const r=new THREE.Mesh(ringGeo,mat);r.position.set(wx(n),y,wz(n));r.userData.hex=n;r.renderOrder=12;scene.add(r);rings.push(r);
   if(mat!==ringMats.sel){const o=new THREE.Mesh(RING_O,RING_OM);o.position.set(wx(n),y-.002,wz(n));o.renderOrder=11;o.userData.hex=n;scene.add(o);rings.push(o);const f=new THREE.Mesh(RING_F,ringFill(mat));f.position.set(wx(n),y-.004,wz(n));f.renderOrder=10;f.userData.hex=n;scene.add(f);rings.push(f)}});
 if(G.mode==='respawn'){const r=G.rp.q[G.rp.i];add(lairs(BEASTS[r.kind].lvl),ringMats.violet);return}
 if(G.mode==='act'&&G.pending&&G.pending.type==='fly'){add(ALTARS.filter(h=>h!==hexOf(p)),ringMats.violet);return}
 if(G.mode==='act'&&!G.walking)add(moveTargets(p),ringMats.gold);
 else if(G.pending){if(G.pending.type==='pickBeast')add(G.beasts.filter(b=>!BEASTS[b.kind].boss&&beastTargets(b).length).map(hexOf),ringMats.red);if(G.pending.type==='moveBeast')add(beastTargets(G.pending.b),ringMats.red);if(G.pending.type==='summon')add(lairs(BEASTS[G.pending.kind].lvl,false),ringMats.violet)}
 if(G.sel)add([G.sel],ringMats.sel)}

window.UI={setBk:k=>{setup.bestias=k;renderSetup()},setX:k=>{setup.extras=k;renderSetup()},setA:k=>{setup.altars=k;renderSetup()},trade:(a,b)=>doTrade(a,b),setO:k=>{setup.omens=k;renderSetup()},setR:k=>{setup.respawn=k;renderSetup()},catalog:()=>showCatalog(),nextFight:()=>nextFight(),fleeNext:()=>fleeNext(),cont:()=>continueGame(),forget:()=>{clearSave();SAVED=null;$('contBox').classList.add('hidden')},huntGive:k=>huntGive(k),bUse:k=>{if(!B||B.busy)return;const p=B.p;if((p.used||{})[k])return;p.used=p.used||{};p.used[k]=true;const b0=p.hp;p.hp=Math.min(p.maxHp,p.hp+ITEMS[k].heal);floatText('+'+(p.hp-b0),p.obj.position.clone().add(new THREE.Vector3(0,1.4,0)),'#8ad06a');burst(p.obj.position.clone().add(new THREE.Vector3(0,.6,0)),24,0x8ad06a,1.2,{up:true});setBMsg(`Usás ${ITEMS[k].name} y recuperás ${p.hp-b0}.`);renderBattle()},board:()=>showBoard(),pick:(i,k)=>{setup.players[i].hero=k;renderSetup()},msgNext:()=>msgNext(),trophy:k=>{if(!B||B.busy||B.garra)return;const p=B.p;if(!(p.trophies[k]>0))return;p.trophies[k]--;B.garra=TRO_BON[k];B.troK=k;floatText('+'+B.garra,p.obj.position.clone().add(new THREE.Vector3(0,1.4,0)),'#c0a0ff');burst(p.obj.position.clone().add(new THREE.Vector3(0,.7,0)),20,0xc0a0ff,1.4,{up:true});setBMsg(`Usás ${TROPHY[k].name}: +${B.garra} a tu próxima tirada.`);renderBattle()},garra:()=>UI.trophy('garra'),tap:k=>{if(!G||busy())return;const p=curP();
  if(G.mode==='act'){if(k==='end')return startAcecho();const cd=canDo();if(!cd[k]){toast(`${LABEL[k]}: ${p.ap<1&&k!=='copal'&&k!=='agua'?'no te quedan PA':WHY[k]}`);return}return act(k)}
  if(k==='end'){G.pending=null;return endTurn()}
  if(k==='paw'){G.pending=G.pending&&G.pending.type!=='summon'?null:{type:'pickBeast'}}
  if(k.startsWith('sum:')){const kind=k.slice(4);G.pending=G.pending&&G.pending.kind===kind?null:{type:'summon',kind}}
  update()},
setN:n=>{setup.n=n;renderSetup()},setD:n=>{setup.days=n;renderSetup()},name:(i,v)=>setup.players[i].name=v,
 cycle:i=>{const u=new Set(setup.players.slice(0,setup.n).filter((_,j)=>j!==i).map(p=>p.hero));let k=HK.indexOf(setup.players[i].hero);do{k=(k+1)%HK.length}while(u.has(HK[k]));setup.players[i].hero=HK[k];renderSetup()},
 start:startGame,act,acecho:()=>{if(!busy())startAcecho()},ac:(a,l)=>{if(busy())return;if(a==='move')G.pending={type:'pickBeast'};if(a==='summon')G.pending={type:'summon',lvl:l};if(a==='cancel')G.pending=null;if(a==='end'){G.pending=null;return endTurn()}update()},
 roll,flee,accept:()=>{const f=B.pending;B.pending=null;resolve(f)},reroll:()=>{B.rerolls--;B.pending=null;B.busy=false;roll(true)},bCopal:()=>{const p=B.p;p.items.splice(p.items.indexOf('copal'),1);const b0=p.hp;p.hp=Math.min(p.maxHp,p.hp+3);floatText('+'+(p.hp-b0),p.obj.position.clone().add(new THREE.Vector3(0,1.4,0)),'#8ad06a');burst(p.obj.position.clone().add(new THREE.Vector3(0,.6,0)),24,0x8ad06a,1.2,{up:true});setBMsg(`Quemás copal y recuperás ${p.hp-b0}.`);renderBattle()},
 closeBattle,closeTurn:()=>{$('ovTurn').classList.add('hidden');update()},details:showDetails,menuShow:()=>{const has=!!(SAVED&&SAVED.v===1);$('mCont').classList.toggle('hidden',!has);$('mContInfo').classList.toggle('hidden',!has);if(has&&$('contInfo'))$('mContInfo').textContent=$('contInfo').textContent;$('ovMenu').classList.remove('hidden')},
  menuCont:()=>{$('ovMenu').classList.add('hidden');UI.cont()},
  menuLocal:()=>{$('ovMenu').classList.add('hidden');$('ovSetup').classList.remove('hidden')},
  menuOnline:()=>{$('ovMenu').classList.add('hidden');$('ovOnline').classList.remove('hidden')},
  menuBack:()=>{['ovSetup','ovOnline'].forEach(i=>$(i).classList.add('hidden'));UI.menuShow()},
  help:()=>$('ovHelp').classList.remove('hidden'),
 blur:()=>{const o=['apagado','suave','normal'];blurMode=o[(o.indexOf(blurMode)+1)%3];$('bBlur').textContent='Desenfoque: '+blurMode;resize()},
 gfx:(k)=>{const hd=k?k==='hd':!GFX_HD;if(hd===GFX_HD)return;if(B){toast('Terminá el combate para cambiar el estilo del mapa');return}try{localStorage.setItem('sendaJaguar.gfx',hd?'hd':'mesa');if(G&&!G.over&&!G.tut){saveGame();sessionStorage.setItem('sendaJaguar.resume','1')}}catch(e){}location.reload()},
  quality:()=>{quality=quality==='alta'?'baja':'alta';$('bQ').textContent='Calidad: '+quality;bloom.enabled=quality==='alta';resize()},
 title:()=>{UI.menuShow();$('ovTitle').classList.add('out');setTimeout(()=>$('ovTitle').classList.add('hidden'),650)},togglePanel:()=>{$('panel').classList.toggle('mini');$('bMini').textContent=$('panel').classList.contains('mini')?'▴':'▾'}};
$('tEmb').innerHTML=`<img src="${renderRows(QZ_ROWS).toDataURL()}" class="spr" alt="Rostro de Quetzalcóatl">`;
if(PENDING){$('ovTitle').classList.add('hidden');Object.assign(setup,PENDING);setTimeout(()=>startGame(),400)}
renderSetup();$('boardIco').src=ICO.board;$('bBlur').textContent='Desenfoque: '+blurMode;

/* ---- sonido (motor en audio.js) ---- */
const AUD_KEY='tonalli.audio';const audPref={mute:false,music:.8,sfx:.8};try{Object.assign(audPref,JSON.parse(localStorage.getItem(AUD_KEY)||'{}'))}catch(e){}
function audSave(){try{localStorage.setItem(AUD_KEY,JSON.stringify(audPref))}catch(e){}}
function sfxP(n){if(audPref.mute)return;try{SND.play(n)}catch(e){}}
function phaseTheme(){if(!G||G.over)return'intro';if(G&&G.stage)return'ocaso';if(B)return'combate';return(G.phase===2||G.omen==='eclipse')?'noche':'dia'}
function musicSync(){try{if(audPref.mute){SND.stopMusic();return}SND.init();SND.setVol('music',audPref.music);SND.setVol('sfx',audPref.sfx);const t=phaseTheme();if(SND.theme!==t)SND.playTheme(t)}catch(e){}}
function sndIcon(){const b=$('bSnd');if(b)b.textContent=audPref.mute?'🔇':'🔊'}
{const _t=UI.title;UI.title=()=>{_t();musicSync()}}
{const _bt=beginTurn;beginTurn=function(){const r=_bt.apply(this,arguments);if(G&&!G.over){sfxP('turno');musicSync()}return r}}
{const _sp=setPhaseLight;setPhaseLight=function(){const r=_sp.apply(this,arguments);musicSync();return r}}
{const _ob=openBattle;openBattle=function(b){const r=_ob.apply(this,arguments);if(b)sfxP(b.kind+'_ataque');musicSync();return r}}
{const _cb=closeBattle;closeBattle=function(){const r=_cb.apply(this,arguments);musicSync();return r}}
{const _r=roll;roll=function(){if(B&&!B.busy&&(arguments[0]||B.p.ap>=1))sfxP('dado');return _r.apply(this,arguments)}}
{const _ft=floatText;floatText=function(txt,pos,color){const s=String(txt);if(/GLORIA/.test(s))sfxP('gloria');else if(/CR[IÍ]TICO/.test(s))sfxP('critico');else if(color==='#8ad06a'&&s[0]==='+')sfxP('curar');else if(color==='#d0a0ff')sfxP('furia');else if(s==='ESQUIVA'||s==='BLOQUEO'||s==='-0')sfxP('fallo');else if(/^-\d+$/.test(s))sfxP('golpe');return _ft.apply(this,arguments)}}
{const _st=signText;signText=function(txt){if(/Emboscada/i.test(String(txt)))sfxP('emboscada');return _st.apply(this,arguments)}}
{const _wo=walkObj;walkObj=function(o,to,dur){if(G&&G.players.some(p=>p.obj===o)){sfxP('paso');setTimeout(()=>sfxP('paso'),Math.max(120,(dur||620)/2))}return _wo.apply(this,arguments)}}
{const _a=act;act=function(a){if(a==='gather')sfxP('recolectar');return _a.apply(this,arguments)}}
{const _ub=upgradeBeasts;upgradeBeasts=function(){const n0=JSON.stringify(G.kindUps||{});const r=_ub.apply(this,arguments);if(JSON.stringify(G.kindUps||{})!==n0)setTimeout(()=>sfxP('mejora'),400);return r}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button,.btn,[onclick]');if(t&&!t.matches('#tSnd,#bSnd')&&!/UI\.roll/.test(t.getAttribute('onclick')||''))sfxP('boton')},true);
{const _eg=endGame;endGame=function(){const r=_eg.apply(this,arguments);sfxP('gloria');musicSync();return r}}
UI.snd=()=>{audPref.mute=!audPref.mute;audSave();sndIcon();if(audPref.mute){try{SND.stopAll()}catch(e){}}else musicSync()};
UI.vol=(k,v)=>{audPref[k]=+v;audSave();try{SND.init();SND.setVol(k,+v)}catch(e){}};
sndIcon();
{const _sd=showDetails;showDetails=function(){const r=_sd.apply(this,arguments);const m=$('vMus'),f=$('vSfx');if(m)m.value=audPref.music;if(f)f.value=audPref.sfx;return r}}
// arrancar la intro apenas carga: si el navegador bloquea el audio, queda en pausa y suena con el primer toque
if(!audPref.mute)musicSync();
['pointerdown','touchstart','keydown','click'].forEach(ev=>document.addEventListener(ev,()=>{try{if(!audPref.mute){SND.resume();musicSync()}}catch(e){}},{passive:true}));
UI.act=(...a)=>act(...a);UI.roll=(...a)=>roll(...a);UI.closeBattle=(...a)=>closeBattle(...a);UI.details=()=>showDetails();
function titleSndLabel(){const b=$('tSnd');if(!b)return;const on=!audPref.mute&&SND.state==='running';b.textContent=audPref.mute?'🔇':'🔊';b.classList.toggle('on',on)}
UI.titleSnd=()=>{if(audPref.mute){audPref.mute=false;audSave();sndIcon()}else if(SND.state==='running'){audPref.mute=true;audSave();sndIcon();try{SND.stopAll()}catch(e){};titleSndLabel();return}SND.resume();musicSync();setTimeout(titleSndLabel,150)};
setTimeout(titleSndLabel,300);


/* ================= animación de combate ================= */
const ARROW_TEX=(()=>{try{const a=HERO_ATK.pochteca.arrow;const c=renderHero(a,0);const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.colorSpace=THREE.SRGBColorSpace;return{t,w:c.width,h:c.height}}catch(e){return null}})();
function shootArrow(from,to,dur=230){if(!ARROW_TEX)return;const u=.03;const m=new THREE.Mesh(new THREE.PlaneGeometry(ARROW_TEX.w*u,ARROW_TEX.h*u),new THREE.MeshBasicMaterial({map:ARROW_TEX.t,transparent:true,alphaTest:.5,side:THREE.DoubleSide}));
 const a=from.clone().add(new THREE.Vector3(0,.62,0)),b=to.clone().add(new THREE.Vector3(0,.55,0));m.position.copy(a);scene.add(m);const t0=performance.now();
 const step=()=>{const p=Math.min(1,(performance.now()-t0)/dur);m.position.lerpVectors(a,b,p);m.position.y+=Math.sin(p*Math.PI)*.08;m.lookAt(camera.position);
  const sa=a.clone().project(camera),sb=b.clone().project(camera);m.rotateZ(Math.atan2(sb.y-sa.y,sb.x-sa.x)+Math.PI);
  if(p<1)requestAnimationFrame(step);else{scene.remove(m);m.geometry.dispose();m.material.dispose()}};step()}
const hasAtk=g=>g&&!g.userData.idleN&&g.userData.frames&&g.userData.frames.length>=11;
/* bestias con arte nuevo: animación de ataque propia (cuadros después del reposo) */
const ATK_DUR={nahual:[110,110,140,60,70,120,110,110],tepeyollotl:[120,120,90,90,90,60,90,60,140,120,120,110,110],jaguarsol:[80,70,150,40,60,150,90,90],alacran:[80,130,50,50,160,90,80],tzinacan:[80,150,50,130,90,80],guerrero:[70,80,170,35,50,150,90,90]};
{const _l=lunge;lunge=function(g,toward,dist,cb){
  if(B&&g===B.p.obj&&hasAtk(g)){const U=g.userData;
   const HA=U.heroArt;
   if(B.p.hero==='pochteca'){U.pose={t0:performance.now(),seq:HA?[[8,260],[9,130],[HA.fo,220]]:[[8,150],[9,330]]};setTimeout(()=>shootArrow(g.position,B&&B.b?B.b.obj.position:toward),HA?260:120);return _l.call(this,g,toward,.08,cb)}
   U.pose={t0:performance.now(),seq:HA?[[8,150],[9,140],[HA.fo,220]]:[[8,110],[9,360]]}}
  if(B&&B.b&&g===B.b.obj&&g.userData.atkN){const U=g.userData,D=ATK_DUR[B.b.kind]||[];U.pose={t0:performance.now(),seq:Array.from({length:U.atkN},(_,i)=>[U.idleN+i,D[i]||90])}}
  return _l.apply(this,arguments)}}
{const _f=flash;flash=function(g,color){if(hasAtk(g)&&color===0xff3a2a)g.userData.pose={t0:performance.now(),seq:[[10,320]]};return _f.apply(this,arguments)}}


/* ================= entradas de los jefes ================= */
function riseFrom(b,depth,D,cb){const U=b.obj.userData,y0=b.obj.position.y;U.lock=true;b.obj.position.y=y0-depth;b.obj.visible=true;const t0=performance.now();
 (function rise(){const e=Math.min(1,(performance.now()-t0)/D),k=1-Math.pow(1-e,3),ov=Math.sin(e*Math.PI)*.25;b.obj.position.y=y0-depth*(1-k)+ov*.4;b.obj.scale.set(1.2*(1-ov*.25),1.2*(1+ov*.35),1.2);
  if(e<1)requestAnimationFrame(rise);else{b.obj.position.y=y0;b.obj.scale.setScalar(1.2);U.lock=false;cb&&cb()}})()}
function bossEntrance(b,pos){const k=b.kind,snd=k+'_entrada';
 if(k==='xiuhcoatl'){
  [0,280,560,820].forEach((d,i)=>setTimeout(()=>{burst(pos,60+i*25,i%2?0xffd040:0xff4a10,2.2+i*.5,{up:true,life:1+i*.15});doShake(.12+i*.06,300)},d));
  setTimeout(()=>{sfxP('jefe');riseFrom(b,2.2,1100);burst(pos,140,0xff6a20,3.6,{up:true,life:1.4});burst(pos,60,0x38c0b0,2.4,{up:true,life:1.2});ringFx(pos,0xff6a20,3.5,.9);ringFx(pos,0xffd040,2.2,.6);doShake(.35,900);bloomKick=1.1},1000);
  return 3600}
 if(k==='alacran'){sfxP(snd);
  // la tierra tiembla y se agrieta
  for(let i=0;i<6;i++)setTimeout(()=>{doShake(.1+i*.04,260);burst(pos.clone().add(new THREE.Vector3(0,-.6,0)),26+i*8,i%2?0x8a6a4a:0x5a4a3a,1.4+i*.25,{up:true,life:.9,grav:1.4});ringFx(pos.clone().add(new THREE.Vector3(0,-.65,0)),0x6a5038,1+i*.4,.6)},i*230);
  setTimeout(()=>{riseFrom(b,1.8,1300);burst(pos,90,0x9a7a5a,3,{up:true,life:1.2,grav:1.8});burst(pos,40,0x7ad06a,2,{up:true,life:1});doShake(.38,900)},1400);
  return 4000}
 if(k==='jaguarsol'){sfxP(snd);
  // el cielo se oscurece y un sol antiguo se enciende detrás del jaguar
  phAnim=null;const prev=PH[G.phase];target=Object.assign({},PH[G.phase],{si:.25,hi:.3,exp:.9,bg:0x2a1418,fog:0x3a1c1c,night:.8});
  const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');const g=x.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,'rgba(255,240,180,1)');g.addColorStop(.25,'rgba(255,190,80,.95)');g.addColorStop(.5,'rgba(255,110,40,.5)');g.addColorStop(1,'rgba(255,60,20,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
  const tex=new THREE.CanvasTexture(cv);const sunM=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));sunM.position.copy(pos).add(new THREE.Vector3(0,1.4,-.6));sunM.scale.setScalar(.1);scene.add(sunM);
  const U=b.obj.userData,mat=U.spr&&U.spr.userData.mat;b.obj.visible=true;b.obj.scale.setScalar(1.2);U.sil=0;if(mat){mat.color.setRGB(0,0,0)}
  const t0=performance.now();(function glow(){const e=(performance.now()-t0)/3200;const s=Math.min(1,e*1.6);sunM.scale.setScalar(.2+s*3.2);sunM.material.opacity=.8*Math.min(1,e*2)*(e>.8?Math.max(0,1-(e-.8)/.2):1);
   {const c=Math.max(0,Math.min(1,(e-.55)/.3));U.sil=c;if(mat)mat.color.setRGB(c,c,c)}
   if(e<1)requestAnimationFrame(glow);else{scene.remove(sunM);tex.dispose();U.sil=null;if(mat)mat.color.setRGB(1,1,1);target=prev}})();
  setTimeout(()=>{burst(pos,120,0xffc040,3.4,{up:true,life:1.4});ringFx(pos,0xffd040,4,1);doShake(.3,800);bloomKick=1.4},1500);
  return 4200}
 if(k==='tzinacan'){sfxP(snd);
  // una nube de murciélagos converge y forma al Tzinacan
  const N=110,geo=new THREE.BufferGeometry(),P=new Float32Array(N*3),st=[];for(let i=0;i<N;i++){const a=Math.random()*6.28,r=3+Math.random()*4,y=.5+Math.random()*3;st.push([pos.x+Math.cos(a)*r,pos.y+y,pos.z+Math.sin(a)*r,a])}
  geo.setAttribute('position',new THREE.BufferAttribute(P,3));const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0x2a0c1e,size:.34,transparent:true}));scene.add(pts);const t0=performance.now();
  (function swarm(){const e=Math.min(1,(performance.now()-t0)/2200),k=e*e;for(let i=0;i<N;i++){const s0=st[i],sp=e*5+s0[3];P[i*3]=s0[0]+(pos.x-s0[0])*k+Math.cos(sp*2)*.4*(1-k);P[i*3+1]=s0[1]+(pos.y+.4-s0[1])*k+Math.sin(sp*3)*.3*(1-k);P[i*3+2]=s0[2]+(pos.z-s0[2])*k+Math.sin(sp*2)*.4*(1-k)}geo.attributes.position.needsUpdate=true;
   if(e<1)requestAnimationFrame(swarm);else{scene.remove(pts);geo.dispose();b.obj.visible=true;b.obj.scale.setScalar(.2);const t1=performance.now();(function pop(){const f=Math.min(1,(performance.now()-t1)/400);b.obj.scale.setScalar(.2+1.0*(1-Math.pow(1-f,3))+Math.sin(f*Math.PI)*.15);if(f<1)requestAnimationFrame(pop)})();
    burst(pos,80,0x6a1a3a,3,{up:true,life:1.1});ringFx(pos,0xb04070,3.2,.8);doShake(.3,700);bloomKick=1}})();
  return 3800}
 b.obj.visible=true;return 2000}

/* rugido final: al aparecer, el jefe hace su pose de ataque */
function bossRoar(b,pos){if(!b||!b.obj)return;const U=b.obj.userData,D=ATK_DUR[b.kind]||[];
 const PEAK={alacran:1,tzinacan:1,guerrero:2};
 if(U.atkN&&PEAK[b.kind]!=null){const pk=PEAK[b.kind],up=Array.from({length:pk+1},(_,i)=>[U.idleN+i,(D[i]||90)*1.3]);up[pk][1]=900;U.pose={t0:performance.now(),seq:up.concat(up.slice(0,pk).reverse().map(([f])=>[f,110]))}}
 else{const t0=performance.now(),s0=b.obj.scale.x;(function pulse(){const e=Math.min(1,(performance.now()-t0)/700),k=Math.sin(e*Math.PI);b.obj.scale.set(s0*(1+k*.12),s0*(1+k*.2),s0);if(e<1)requestAnimationFrame(pulse);else b.obj.scale.setScalar(s0)})()}
 const c={xiuhcoatl:0xff6a20,jaguarsol:0xffc040,alacran:0x7ad06a,tzinacan:0xb04070,guerrero:0xff3020}[b.kind]||0xffffff;
 setTimeout(()=>{ringFx(pos,c,3,.7);burst(pos,50,c,2.4,{up:true,life:1});doShake(.2,500)},250)}
{const _be=bossEntrance;bossEntrance=function(b,pos){const T=_be(b,pos);setTimeout(()=>bossRoar(b,pos),Math.max(600,T-1300));return T}}
/* ================= stage: El Guerrero sin Sol ================= */
const STAGE_P=.10;
const STAGE_LIGHT={sun:[-12,4.5,5],sc:0xff4a28,si:2.1,hs:0xd87060,hg:0x5a2a20,hi:1.05,bg:0x5a0e14,fog:0x6a1418,exp:1.1,night:.45};
let stageFx=null;
function stageAsh(on){if(on&&!stageFx){const N=260,g=new THREE.BufferGeometry(),P=new Float32Array(N*3);for(let i=0;i<N;i++){P[i*3]=(Math.random()-.5)*30;P[i*3+1]=Math.random()*12;P[i*3+2]=(Math.random()-.5)*30}g.setAttribute('position',new THREE.BufferAttribute(P,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({color:0x6a5a5a,size:.09,transparent:true,opacity:.85,depthWrite:false}));scene.add(m);stageFx={m,P,g};
  (function fall(){if(!stageFx)return;for(let i=0;i<N;i++){let y=P[i*3+1]-.03;if(y<0)y+=12;P[i*3+1]=y;P[i*3]+=Math.sin(performance.now()/900+i)*.006}g.attributes.position.needsUpdate=true;requestAnimationFrame(fall)})()}
 if(!on&&stageFx){scene.remove(stageFx.m);stageFx.g.dispose();stageFx=null}}
function deathAura(b){const N=70,g=new THREE.BufferGeometry(),P=new Float32Array(N*3),C=new Float32Array(N*3),L=[];for(let i=0;i<N;i++){L.push(Math.random());const ember=i%3===0;const c=new THREE.Color(ember?0xff5020:0x1a1018);C[i*3]=c.r;C[i*3+1]=c.g;C[i*3+2]=c.b}
 g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));const m=new THREE.Points(g,new THREE.PointsMaterial({size:.13,vertexColors:true,transparent:true,opacity:.9,depthWrite:false}));scene.add(m);
 (function tick(){if(!b.obj.parent||b.obj.userData.dying&&performance.now()-b.obj.userData.dying>900){scene.remove(m);g.dispose();return}const o=b.obj.position,t=performance.now()/1000;
  for(let i=0;i<N;i++){L[i]+=(i%3===0?.012:.007);if(L[i]>1)L[i]-=1;const l=L[i],a=i*2.4+t*(i%2?.8:-.6),r=.35+l*.7;P[i*3]=o.x+Math.cos(a)*r;P[i*3+1]=o.y+.2+l*2.2;P[i*3+2]=o.z+Math.sin(a)*r}g.attributes.position.needsUpdate=true;requestAnimationFrame(tick)})()}
function startStage(){G.stage={left:2};log('El sol no se pone. Aparece el Guerrero sin Sol.');saveGame&&0;
 phAnim=null;target=STAGE_LIGHT;stageAsh(true);musicSync();
 const el=$('phFx');if(el){el.classList.remove('hidden','out');$('phTxt').textContent='El sol no se pone';setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.classList.add('hidden'),500)},2600)}
 const pool=allHex.filter(h=>canHold(h)).sort((a,b)=>hdist(a,capital)-hdist(b,capital));const h=pool[0];
 const b=spawn('guerrero',h,false);b.obj.visible=false;
 const bc=hexCenter(h),pos=bc.clone().add(new THREE.Vector3(0,.8,0));const off=camera.position.clone().sub(controls.target).normalize().multiplyScalar(8);
 G.transition=true;
 setTimeout(()=>tweenCam(bc.clone().add(off),bc.clone().add(new THREE.Vector3(0,.8,0)),1800,()=>{
  sfxP('guerrero_entrada');
  // columna de humo y ceniza que baja del cielo
  for(let i=0;i<8;i++)setTimeout(()=>{burst(pos.clone().add(new THREE.Vector3(0,3-i*.35,0)),30,i%2?0x1a1018:0x3a2a2a,1.2,{life:1.2,grav:-.2});doShake(.06+i*.02,200)},i*160);
  setTimeout(()=>{bloomKick=1.6;doShake(.45,1000);burst(pos,120,0xff4020,3.4,{up:true,life:1.4});burst(pos,90,0x140c12,2.6,{up:true,life:1.6});ringFx(pos,0xff3020,4.2,1);
   const U=b.obj.userData;U.sil=0;b.obj.visible=true;b.obj.scale.setScalar(1.2);deathAura(b);const t0=performance.now();
   (function rev(){const e=Math.min(1,(performance.now()-t0)/1400);U.sil=e;if(e<1)requestAnimationFrame(rev);else U.sil=null})()},1400);
  setTimeout(()=>signText('¡El Guerrero sin Sol!',b.obj),2600);setTimeout(()=>bossRoar(b,pos),2900);
  setTimeout(()=>{const d=BEASTS.guerrero;msg('El sol no se pone',`Un guerrero caído que nunca subió con el Sol bajó al valle. Mientras no lo venzan, la tarde no termina: quedan <b>2 fases de ocaso eterno</b> y después la partida termina. <b style="color:#ff7a5a">Si nadie lo vence, todos pierden la mitad de su gloria.</b><br><span class="mut">Fuerza ${d.str} · ataque ${d.atk} · ${d.eff}.<br>Furia del caído: con la mitad de fuerza o menos ataca +1.</span><br>Vencerlo da <b class="gold">${d.glory} de gloria</b> y el ${TROPHY.disco.name} (${TROPHY.disco.desc}).`,'guerrero');
   const p=curP();const c=hexCenter(hexOf(p));const off2=camera.position.clone().sub(controls.target).normalize().multiplyScalar(13);tweenCam(c.clone().add(off2),c.clone(),1500,()=>{G.transition=false;update()},0)},4200)},3),400);
 G.cur=G.start;G.turnCount=0;setTimeout(()=>beginTurn(),5200)}
function stageFinale(){G.transition=true;const g=G.beasts.find(x=>x.kind==='guerrero'),won=!g;G.stageLost=!won;
 const el=$('phFx');if(el){el.classList.remove('hidden','out');$('phTxt').textContent=won?'El guerrero sube con el Sol':'Cae la noche · el valle pierde la mitad de su gloria';}
 // el sol congelado se desploma: noche en dos segundos
 const t0=performance.now();(function fall(){const e=Math.min(1,(performance.now()-t0)/2200);target=phMix(STAGE_LIGHT,PH[2],e*e);if(e<1)requestAnimationFrame(fall)})();
 if(g){setTimeout(()=>{const pos=g.obj.position.clone().add(new THREE.Vector3(0,.8,0));burst(pos,140,0x140c12,2.4,{up:true,life:1.8});burst(pos,60,0x6a5a5a,1.6,{up:true,life:2});g.obj.userData.dying=performance.now();sfxP('guerrero_muere')},700)}
 else{sfxP('gloria')}
 setTimeout(()=>{stageAsh(false);G.stage=null;G.phase=2;endGame()},3600)}
/* ================= bestiario ================= */
const BESTIARY=[
 {k:'calaca',lvl:1,game:1,lore:'Muertos que no terminaron el camino por los nueve niveles del Mictlán. Vagan entre los vivos y se llevan lo que encuentran.'},
 {k:'ahuizotl',rot:1,lvl:1,name:'Ahuízotl',lore:'Perro de agua con una mano en la punta de la cola. Arrastra al fondo a quien se acerca demasiado a la orilla.'},
 {k:'chaneque',rot:1,lvl:1,name:'Chaneque',lore:'Pequeños guardianes del monte y del agua. Espantan a los intrusos y, dicen, pueden robarles el alma.'},
 {k:'tzitzimitl',lvl:2,game:1,lore:'Demonios de las estrellas que bajan del cielo durante los eclipses para devorar a los hombres.'},
 {k:'xolotl',rot:1,lvl:2,name:'Xólotl',lore:'Ser con cabeza de perro, gemelo oscuro de Quetzalcóatl, que guía a las almas hacia el Mictlán.'},
 {k:'nahual',rot:1,lvl:2,name:'Nahual',lore:'Brujo que toma forma de animal para hacer daño en la oscuridad.'},
 {k:'tlaltecuhtli',lvl:3,game:1,lore:'El monstruo de la tierra, con fauces en codos y rodillas. Cada tarde se traga al sol y lo devuelve al amanecer.'},
 {k:'tepeyollotl',rot:1,lvl:3,name:'Tepeyóllotl',lore:'"El corazón del monte": un jaguar colosal cuyo rugido es el eco de los cerros y el temblor de la tierra.'},
 {k:'quinametzin',rot:1,lvl:3,name:'Quinametzin',lore:'Gigantes de la primera era del mundo. Dice la tradición que cuando caían ya no se levantaban: así se formaron las montañas.'},
 {k:'xochitonal',rot:1,lvl:3,name:'Xochitónal',lore:'Lagarto gigante que acecha en el camino al Mictlán. Las almas debían vencerlo para seguir su viaje.'},
 {k:'xiuhcoatl',lvl:4,game:1,boss:1,lore:'La serpiente de fuego, arma de Huitzilopochtli. Con ella venció a Coyolxauhqui en el cerro de Coatepec. Duerme dentro de los volcanes.',pas:'Furia del Quinto Sol: el último día se enfurece (+3 fuerza, +1 ataque).',tro:'Corazón de Xiuhcóatl: +5 de gloria al final.'},
 {k:'jaguarsol',lvl:4,boss:1,rot:1,name:'Jaguar del Primer Sol',str:10,atk:2,glory:10,lore:'En el Primer Sol, Nahui Ocelotl, los gigantes que poblaban el mundo fueron devorados por jaguares. Uno de ellos sigue al acecho.',eff:'Devorador de gigantes: su ataque hace el doble y recupera esa misma fuerza.',pas:'Piel divina: ignora 1 de daño por tirada y sus golpes no se pueden reducir (ni yugo ni reflejos). El Espejo de Tezcatlipoca le anula la piel.',tro:'Piel del Primer Sol: +6 de gloria al final.'},
 {k:'alacran',lvl:4,boss:1,rot:1,name:'Alacrán de Yappan',str:10,atk:2,glory:8,lore:'Yappan, un guerrero que hacía penitencia, fue convertido en alacrán. Una diosa intercedió y debilitó su veneno, pero no su furia.',eff:'Aguijón: te envenena; perdés 1 de vida al empezar cada uno de tus próximos 3 turnos (el copal lo cura).',pas:'Caparazón: ignora 1 de daño por tirada.',tro:'Aguijón de Yappan: +5 de gloria al final.'},
 {k:'guerrero',lvl:4,boss:1,ev:1,name:'Guerrero sin Sol',str:13,atk:3,glory:15,lore:'Los guerreros muertos en batalla acompañaban al Sol. Este nunca subió: su espíritu quedó atado a la tierra, enmascarado y consumido por la furia.',eff:'Golpe de obsidiana: su ataque hace el doble y te rompe un objeto de defensa (chimalli, yugo o ichcahuipilli).',pas:'Furia del caído: con la mitad de fuerza o menos ataca +1.',tro:'Disco del sol apagado: +8 de gloria al final. Si nadie lo vence, todos pierden la mitad de su gloria.'},
 {k:'tzinacan',lvl:4,boss:1,rot:1,name:'Tzinacan',str:11,atk:2,glory:8,lore:'"El murciélago que muerde". Ligado a la noche, la muerte y el sacrificio, sale del Mictlán cuando cae la oscuridad.',eff:'Mordida de Mictlán: te roba 2 de vida y 1 PA, y se cura 2.',pas:'Ala de la noche: de noche esquiva 1 de cada 3 golpes.',tro:'Ala de Tzinacan: +5 de gloria al final.'}];
const LVL_NAME={1:'Nivel 1',2:'Nivel 2',3:'Nivel 3',4:'Nivel 4 · jefes'};
let bestLvl=1;
function bestImg(e){if((e.game||e.rot||e.ev)&&BEASTS[e.k])return PORTRAIT_URL(e.k,0);return(typeof BESTIARY_IMG!=='undefined'&&BESTIARY_IMG[e.k])||''}
function renderBestiary(){
 $('bTabs').innerHTML=[1,2,3,4].map(l=>`<button class="plain ${l===bestLvl?'sel':''}" onclick="UI.bestLvl(${l})">${l===4?'Jefes':'Nivel '+l}</button>`).join('');
 $('bList').innerHTML=BESTIARY.filter(e=>e.lvl===bestLvl).map(e=>{const B0=BEASTS[e.k]||{};const nm=e.name||B0.name;const str=e.str??B0.str,atk=e.atk??B0.atk,gl=e.glory??B0.glory,eff=e.eff||B0.eff;
  const known=e.game||e.boss||e.rot;const tro=e.tro||(B0.trophy&&TROPHY[B0.trophy]?`${TROPHY[B0.trophy].name}: ${TROPHY[B0.trophy].desc}`:'');
  const st=e.ev?'<span class="bChip" style="border-color:#ff5a3a;color:#ff9a7a">Evento raro · ocaso eterno del último día</span>':e.rot?'<span class="bChip" style="border-color:#46a892;color:#8fd8c8">En el juego · bestias aleatorias</span>':e.game?'<span class="bChip" style="border-color:#46a892;color:#8fd8c8">En el juego</span>':'<span class="bChip" style="border-color:#d0a0ff;color:#d0a0ff">Rotación · próximamente</span>';
  return `<div class="bCard ${e.game||e.rot||e.ev?'':'soon'}"><div class="bImg">${bestImg(e)?`<img src="${bestImg(e)}" alt="">`:''}</div><div class="bInfo">
   <div class="bName">${nm}</div><div class="bChips"><span class="bChip">${LVL_NAME[e.lvl]}</span>${st}</div>
   <div class="bLore">${e.lore}</div>
   ${known?`<div class="bStats"><span>Fuerza <b>${str}</b></span><span>Ataque <b>${atk}</b></span><span>Gloria <b class="gold">${gl}</b></span></div>
   <div class="bEff"><b>Habilidad de bestia</b> · ${eff}</div>${e.pas?`<div class="bEff"><b style="color:#ff9a40">Pasiva</b> · ${e.pas}</div>`:''}${tro?`<div class="bEff mut"><b style="color:#ecc460">Trofeo</b> · ${tro}</div>`:''}`
   :`<div class="mut">Estadísticas y habilidad: en diseño.</div>`}
  </div></div>`}).join('')}
UI.bestiary=()=>{renderBestiary();$('ovBest').classList.remove('hidden')};
UI.bestLvl=l=>{bestLvl=l;renderBestiary()};
/* ================= tutorial (mapa reducido) ================= */
const TUT_STEPS=[
 {t:'Bienvenida',x:'Sos un <b class="gold">guerrero jaguar</b> en el Teocalli Mayor. El objetivo es juntar la mayor <b class="gold">gloria</b>: cazando bestias, recolectando y cumpliendo pedidos de las ciudades antes de que termine el último día.',next:true},
 {t:'Moverse',x:'Arriba ves tus <b>PA</b> (puntos de acción). Tocá un <b>hexágono iluminado</b> para caminar: cuesta 1 PA, y subir un volcán cuesta 2. El agua no se cruza.',ev:'move'},
 {t:'Recolectar',x:'Las milpas, selvas, cerros y volcanes tienen recursos (los marcadores sobre el hexágono). Parate en uno y tocá <b>Recolectar</b>. Los recursos sirven para comprar objetos y cumplir pedidos.',ev:'gather',glow:"[onclick=\"UI.tap('gather')\"]"},
 {t:'Una bestia',x:'Una <b>calaca</b> merodea cerca. Caminá hasta su hexágono y tocá <b>Luchar</b>. Cada tirada de dado gasta 1 PA.',ev:'battle',glow:"[onclick=\"UI.tap('fight')\"]"},
 {t:'El dado',x:'Tirá el dado: <b>2 a 5</b> hacen ese daño, la <b style="color:#9ac0ff">cara azul</b> es un golpe crítico y la <b style="color:#d0a0ff">cara de bestia</b> activa la <b>habilidad de bestia</b> del monstruo. Después de tu tirada, la bestia contraataca. Vencela y cerrá el combate.',ev:'battleEnd',inb:true},
 {t:'Pasar el turno',x:'Cuando no te queden PA o quieras terminar, tocá <b>Fin de turno</b>. Cada día tiene mañana, tarde y noche: <b>de noche las bestias se mueven</b> y al amanecer algunas se fortalecen.',ev:'endTurn',glow:"[onclick=\"UI.tap('end')\"]"},
 {t:'¡Listo!',x:'Ya sabés lo básico. En las <b>ciudades</b> podés descansar, comerciar y comprar objetos, y en partidas de 7 días, el día 6 despierta el <b style="color:#ff9a40">Xiuhcóatl</b>. ¡Suerte en la Senda del Jaguar!',next:true,last:true}];
let tutI=-1;
function tutShow(){const st=TUT_STEPS[tutI];const el=$('tut');if(!st){el.classList.add('hidden');return}el.classList.remove('hidden');el.classList.toggle('inb',!!(st.inb||B));
 $('tutT').textContent=st.t.toUpperCase();$('tutN').textContent=`${tutI+1}/${TUT_STEPS.length}`;$('tutX').innerHTML=st.x;
 const nb=$('tutNext');nb.style.display=st.next?'':'none';nb.textContent=st.last?'Ir al menú':'Siguiente';$('tutSkip').style.display=st.last?'none':'';tutGlow()}
function tutGlow(){document.querySelectorAll('.tutGlow').forEach(e=>e.classList.remove('tutGlow'));const st=TUT_STEPS[tutI];if(st&&st.glow)document.querySelectorAll(st.glow).forEach(e=>e.classList.add('tutGlow'))}
function tutEv(e){if(!G||!G.tut)return;const st=TUT_STEPS[tutI];if(st&&st.ev===e){tutI++;setTimeout(tutShow,e==='battle'?900:500)}}
function tutAP(){if(G&&G.tut&&!G.over){const p=curP();if(p&&p.ap<2&&tutI<5)p.ap=3}}
function tutExit(){try{sessionStorage.removeItem('sendaJaguar.tut');localStorage.removeItem(SAVE_KEY)}catch(e){}location.reload()}
UI.tutorial=()=>{try{sessionStorage.setItem('sendaJaguar.tut','1')}catch(e){}location.reload()};
UI.tutNext=()=>{const st=TUT_STEPS[tutI];if(st&&st.last)return tutExit();tutI++;tutShow()};
UI.tutSkip=()=>tutExit();
function startTutorial(){
 $('ovTitle').classList.add('out');setTimeout(()=>$('ovTitle').classList.add('hidden'),400);
 Object.assign(setup,{bestias:'clasicas',n:1,days:2,omens:'no',altars:false,respawn:'auto',extras:EXTRAS});setup.players[0]={name:'Aprendiz',hero:'jaguar'};
 const keep={...START};START.calaca=0;START.tzitzimitl=0;START.tlaltecuhtli=0;
 startGame();Object.assign(START,keep);G.tut=true;G.bossDone=true;
 // calaca a 2 hexágonos del Teocalli, en tierra
 const near=allHex.filter(h=>canHold(h)&&hdist(h,capital)===2&&!TERR[h.t].city);const h=near.length?rpick(near):null;if(h)spawn('calaca',h);
 tutI=0;tutShow();
}
{const _m=walkObj;walkObj=function(o){const r=_m.apply(this,arguments);if(G&&G.tut&&G.players[0]&&G.players[0].obj===o&&!B)setTimeout(()=>tutEv('move'),700);return r}}
{const _a2=act;act=function(a){const p0=curP&&G?curP().ap:0;const r=_a2.apply(this,arguments);if(a==='gather'&&G&&G.tut&&curP().ap!==p0)tutEv('gather');tutAP();return r}}
{const _o2=openBattle;openBattle=function(){const r=_o2.apply(this,arguments);if(G&&G.tut){tutEv('battle');setTimeout(()=>{$('tut').classList.add('inb')},50)}return r}}
{const _c2=closeBattle;closeBattle=function(){const r=_c2.apply(this,arguments);if(G&&G.tut){if(!G.beasts.some(b=>b.kind==='calaca')||TUT_STEPS[tutI]?.ev==='battleEnd')tutEv('battleEnd');tutAP();$('tut').classList.remove('inb');tutGlow()}return r}}
{const _e2=endTurn;endTurn=function(){const r=_e2.apply(this,arguments);if(G&&G.tut){tutEv('endTurn');tutAP()}return r}}
{const _u2=update;update=function(){const r=_u2.apply(this,arguments);if(G&&G.tut){tutAP();tutGlow()}return r}}
{const _sv=saveGame;saveGame=function(){if(G&&G.tut)return;return _sv.apply(this,arguments)}}
{const _ub2=upgradeBeasts;upgradeBeasts=function(){if(G&&G.tut)return;return _ub2.apply(this,arguments)}}
if(TUT)setTimeout(startTutorial,300);
;(()=>{let r=false;try{r=sessionStorage.getItem('sendaJaguar.resume')==='1';sessionStorage.removeItem('sendaJaguar.resume')}catch(e){}let onl=false;try{const s=JSON.parse(sessionStorage.getItem('sendaJaguar.net')||'null');onl=!!(s&&s.code)}catch(e){}/* online: la reconexión ya retoma la partida */
 if(r&&!onl&&SAVED&&SAVED.v===1)setTimeout(()=>{try{$('ovTitle').classList.add('hidden');continueGame()}catch(e){}},300)})();
