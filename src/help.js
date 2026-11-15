/* ================= Cómo se juega (con secciones, íconos y ejemplos) ================= */
const HELP_TABS=[['obj','Objetivo'],['turno','Tu turno'],['rec','Recursos'],['comb','Combate'],['best','Bestias'],['ciu','Ciudades'],['acecho','Acecho'],['caer','Caer'],['puntos','Puntaje'],['opc','Opciones']];
let helpTab='obj';
const hI=(src,h=22)=>src?`<img src="${src}" class="spr" style="height:${h}px;width:auto;vertical-align:middle;image-rendering:pixelated">`:'';
const hR=k=>hI(RICO[k],22),hA=k=>hI(ICO[k],22),hP=(k,h=40)=>portrait(k,h);
function hDie(f){try{const save=dieCtx.getImageData(0,0,28,28);drawDie(f);const u=$('dieC').toDataURL();dieCtx.putImageData(save,0,0);return hI(u,26)}catch(e){return''}}
const hEx=t=>`<div class="hex"><b>Ejemplo.</b> ${t}</div>`;
const hRow=(icon,title,text)=>`<div class="hrow"><div class="hico">${icon}</div><div><b>${title}</b><br><span class="mut">${text}</span></div></div>`;
function helpBody(t){const B=k=>BEASTS[k];
 if(t==='obj')return`<div class="hcard"><div class="hrow" style="justify-content:center;gap:10px">${HK.map(k=>hP(k,44)).join('')}</div>
  <p>Sos un héroe del valle. <b class="gold">Gana quien termina con más gloria</b> cuando se acaba el último día.</p>
  <p>La gloria se consigue <b>cazando bestias</b>, <b>cumpliendo los pedidos de las ciudades</b>, completando <b>cacerías</b> y venciendo al <b>jefe</b>.</p></div>
  <div class="hcard"><b>El calendario</b><div class="hgrid3"><div><span style="color:#f6dc80">☀ Mañana</span><br>6 PA</div><div><span style="color:#f0a060">◐ Tarde</span><br>6 PA</div><div><span style="color:#9ab0ff">☾ Noche</span><br>4 PA</div></div>
  <p class="mut">La partida dura 5 o 7 días. En cada fase todos juegan un turno. PA = puntos de acción.</p></div>
  <div class="hcard"><b>Los héroes</b>${HK.map(k=>hRow(hP(k,34),HEROES[k].name,HEROES[k].desc)).join('')}</div>
  <div class="hcard mut">Arrastrá para girar la cámara, pellizcá o usá la rueda para el zoom. Tocá un hexágono para ver qué hay.</div>`;
 if(t==='turno')return`<div class="hcard"><b>Acciones</b>
  ${hRow('<span class="hhex"></span>','Moverte · 1 PA','A un hexágono vecino (marcado en dorado). Subir a un volcán cuesta 2. El agua no se cruza, salvo con canoa.')}
  ${hRow(hA('gather'),'Recolectar · 1 PA','Juntás el recurso del hexágono. Minar piedra u obsidiana cuesta 2.')}
  ${hRow(hA('fight'),'Luchar · gratis','Empezar un combate no cuesta: cada tirada de dado cuesta 1 PA.')}
  ${hRow(hA('deliver'),'Entregar · 1 PA','En una ciudad, cumplís su carta de pedido.')}
  ${hRow(hA('rest'),'Descansar · 1 PA','En una ciudad recuperás vida.')}
  ${hRow(hA('end'),'Terminar el turno','Lo que te sobra se pierde y empieza tu acecho.')}</div>
  ${hEx(`Es de mañana y tenés 6 PA. Te movés 2 hexágonos hasta la milpa (2 PA), juntás maíz dos veces (2 PA) y volvés a la ciudad (2 PA). La entrega queda para la tarde.`)}
  <div class="hcard mut">Si entrás a un hexágono con una bestia, <b>te embosca</b> y empieza el combate, salvo que tengas la Máscara de Mictlán o la bestia esté en Letargo.</div>`;
 if(t==='rec')return`<div class="hcard">
  ${hRow(hR('maiz'),'Maíz','Se junta en la milpa.')}
  ${hRow(hR('madera'),'Madera','Se junta en la selva.')}
  ${hRow(hR('piedra'),'Piedra','Se mina en el cerro (2 PA).')}
  ${hRow(hR('obsidiana'),'Obsidiana','Se mina en el volcán (2 PA).')}</div>
  <div class="hcard"><p>Cada hexágono tiene <b>2 cargas</b> (los cubitos blancos) que vuelven al amanecer.</p><p>No se puede recolectar si hay una bestia en un hexágono vecino.</p></div>
  ${hEx(`Una milpa con 2 cubitos: juntás 2 veces y queda vacía hasta mañana. Si una calaca se para al lado, no podés juntar hasta sacarla.`)}`;
 if(t==='comb')return`<div class="hcard"><b>El dado</b>
  ${hRow(hDie(2)+hDie(5),'2 a 5','Le restás ese número a la fuerza de la bestia.')}
  ${hRow(hDie('azul'),'Golpe azul','Crítico: 4 de daño a las bestias de nivel 1 y 2 y a los jefes, 6 a las de nivel 3.')}
  ${hRow(hDie('bestia'),'Cara de bestia','La bestia se cura 2 y usa su <b>habilidad de bestia</b>.')}
  <p class="mut">Si la bestia sigue en pie después de tu tirada, te ataca.</p></div>
  <div class="hcard"><b>Bonus a la tirada</b>
  ${hRow(hP('jaguar',30),'Guerrero jaguar','+1 a cada tirada.')}
  ${hRow(hR('hueso')||'🦴','Trofeos (uno por tirada)','Tocá el trofeo en el combate para gastarlo: hueso +1, garra +1, colmillo +2.')}
  ${hRow(hA('copal'),'Objetos','Macuahuitl, átlatl, muñequeras y otros suman a la tirada. Copal y agua curan.')}</div>
  ${hEx(`Peleás contra una calaca (fuerza 3) con el guerrero jaguar. Gastás un hueso (+1) y sacás 2: 2 +1 jaguar +1 hueso = 4 de daño. La calaca cae y ganás gloria y otro hueso.`)}
  <div class="hcard mut"><b>Huir</b> cuesta 1 PA, o 1 de vida si no tenés PA (nunca baja de 1). Si te quedás sin PA, te retirás: la bestia conserva sus heridas hasta el amanecer.</div>`;
 if(t==='best'){const L=[['calaca',1],['tzitzimitl',2],['tlaltecuhtli',3]];
  return`<div class="hcard"><b>Bestias del valle</b><p class="mut">Cuanto más alto el nivel, más fuerte y más gloria da.</p>
  ${L.map(([k,l])=>hRow(hP(k,46),`${B(k).name} · nivel ${l}`,`Fuerza ${B(k).str} · ataque ${B(k).atk}<br>Habilidad: ${B(k).eff}.<br>Deja: ${TROPHY[B(k).trophy]?TROPHY[B(k).trophy].name:'—'}.`)).join('')}
  <p class="mut">Con <b>bestias aleatorias</b>, cada nivel sortea su bestia entre varias. Las ves todas en el <b>Bestiario</b>.</p></div>
  <div class="hcard"><b>El jefe</b><div class="hrow" style="gap:8px;justify-content:center">${BOSSES.map(k=>hP(k,52)).join('')}</div>
  <p>Al amanecer del penúltimo día despierta el jefe (con bestias clásicas, el Xiuhcóatl). No se lo puede azuzar y no vuelve si lo vencés. Si sigue vivo al último amanecer, recibe la <b>Furia del Quinto Sol</b> (+3 fuerza, +1 ataque).</p></div>
  <div class="hcard mut"><b>Mejoras.</b> Los amaneceres de los días 3 y 5 (en partidas de 5 días, solo el 3) todas las bestias reciben una mejora al azar: piel de obsidiana, colmillos afilados, sed de sangre, coraza de jade, furia nocturna o letargo. Cada mejora suma +1 de gloria al vencerla.</div>`}
 if(t==='ciu')return`<div class="hcard"><b>Cartas de ciudad</b><p>Cada ciudad, también el Teocalli Mayor, tiene un mazo de 5 cartas. La carta visible pide recursos: si la cumplís, ganás <b class="gold">gloria</b> y su <b>objeto</b>. La siguiente aparece al amanecer.</p><p class="mut">Tocá ${hA('board')} arriba para ver todas las cartas.</p></div>
  ${hEx(`Itzapan pide ${hR('obsidiana')}${hR('obsidiana')}${hR('piedra')}. Llevás eso, entregás (1 PA) y te llevás 3 de gloria y el Macuahuitl, que suma +1 a tus tiradas.`)}
  <div class="hcard"><b>Cacerías</b> ${hA('hunt')}<p>En el Teocalli Mayor entregás trofeos a la cacería de cada bestia (1 PA cada entrega). Cuantos más entregues, más puntos:</p>
  ${hRow(hP('calaca',30),'Calaca · 7 huesos','1 · 2 · 3 · 4 · 6 · 8 · 10 puntos')}
  ${hRow(hP('tzitzimitl',30),'Tzitzimitl · 5 garras','1 · 3 · 5 · 8 · 12 puntos')}
  ${hRow(hP('tlaltecuhtli',30),'Tlaltecuhtli · 3 colmillos','4 · 8 · 13 puntos')}
  <p class="mut">El primero en completarla se corona campeón y la cierra. El trofeo entregado ya no sirve para el combate.</p></div>`;
 if(t==='acecho')return`<div class="hcard"><b>Acecho</b> ${hA('paw')}<p>Al terminar tu turno tenés <b>furia</b> (más cuanto más herido estás) para jugar a las bestias en contra de tus rivales:</p>
  ${hRow(hP('calaca',30),'Mover una bestia · 1','La calaca salta hasta 2, el Tzitzimitl vuela hasta 3 (también sobre el agua) y el Tlaltecuhtli avanza 1.')}
  ${hRow(hA('paw'),'Invocar · 2 a 4','Hacés aparecer una bestia en su guarida.')}
  <p class="mut">Si cae sobre un héroe le quita 1 de vida (el Chimalli lo bloquea). Las ciudades tienen guardias: las bestias no entran.</p></div>
  ${hEx(`Tu rival está juntando obsidiana al lado de un Tzitzimitl. Con 3 de furia lo hacés volar encima suyo: le quita 1 de vida y además ya no puede recolectar.`)}
  <div class="hcard"><b>Guaridas</b><p>Hay 2 guaridas por nivel: tzompantli con velas naranjas (nivel 1), arco de obsidiana con ojo violeta (nivel 2) y fauces de la tierra en los volcanes (nivel 3). Al amanecer, las bestias vencidas reaparecen en una guarida libre: la eligen los jugadores por turnos o se sortea, según la opción de la partida.</p></div>`;
 if(t==='caer')return`<div class="hcard"><b>Si tu vida llega a 0</b>
  ${hRow('<span style="font-size:22px">⬇</span>','Perdés 1 de dignidad','1 PA menos en cada fase y 2 puntos menos al final.')}
  ${hRow(hR('maiz')+hR('piedra'),'Perdés la mitad de tus recursos','Redondeando hacia arriba, elegidos al azar.')}
  ${hRow(hA('rest'),'Volvés al Teocalli Mayor','Con la vida llena. Tu turno termina, sin acecho.')}
  <p class="mut">Tus objetos y trofeos se conservan.</p></div>
  ${hEx(`Caés con 3 de maíz y 2 de piedra (5 recursos): perdés 3 al azar, por ejemplo 2 de maíz y 1 de piedra.`)}`;
 if(t==='puntos')return`<div class="hcard"><b>Puntaje final</b>
  ${hRow('<b class="gold">★</b>','Gloria','La que juntaste en combates, cartas y jefe.')}
  ${hRow(hA('hunt'),'Cacerías','Los puntos de cada cacería según los trofeos entregados.')}
  ${hRow(HK.slice(0,1).map(k=>'<b>+3</b>').join(''),'Las tres bestias','+3 si venciste al menos una de cada nivel.')}
  ${hRow(hR('hueso')||'🦴','Trofeos sin usar','Hueso +1 y colmillo +2 cada uno.')}
  ${hRow('<b>+</b>','Objetos de gloria','Penacho de quetzal, bolsa de cacao y otros.')}
  ${hRow('<b style="color:#ff7a5a">−2</b>','Dignidad','−2 por cada dignidad perdida.')}</div>`;
 if(t==='opc')return`<div class="hcard">
  ${hRow('<span style="font-size:20px">🌀</span>','Altares de Ehécatl','Viajás entre altares por 2 PA.')}
  ${hRow('<span class="hhex"></span>','Quinta ciudad','Juegan las 4 ciudades temáticas.')}
  ${hRow(hA('trade'),'Mercado','En Xalpan cambiás 2 recursos iguales por 1 a elección (1 PA).')}
  ${hRow('<span style="font-size:20px">☄</span>','Presagios','Desde el día 2, un amanecer puede traer lluvias de Tláloc (maíz doble), eclipse (todo el día es noche), fiesta del Sol, migración, viento de Ehécatl, erupción o niebla del Mictlán.')}</div>
  <div class="hcard"><b>Juego online</b><p>Desde el menú: <b>Crear partida</b> te da un código de 4 letras para tus amigos. Cada uno juega desde su dispositivo; solo actúa el jugador de turno.</p><p class="mut">La partida se guarda sola al inicio de cada turno.</p></div>`;
 return''}
function renderHelp(t){helpTab=t||helpTab;$('helpTabs').innerHTML=HELP_TABS.map(([k,n])=>`<button class="plain htab ${k===helpTab?'sel':''}" onclick="UI.helpTab('${k}')">${n}</button>`).join('');$('helpBody').innerHTML=helpBody(helpTab);$('helpBody').scrollTop=0}
UI.help=()=>{renderHelp();$('ovHelp').classList.remove('hidden')};UI.helpTab=k=>renderHelp(k);
