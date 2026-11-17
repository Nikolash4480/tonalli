/* ================= juego online (Fase 2) =================
   Partida guardada en una base compartida (Firebase Realtime Database, o un
   simulador local para pruebas). El jugador de turno juega en su dispositivo y,
   al pasar el turno, publica el estado; los demás lo reciben y lo aplican.
   Sirve en tiempo real y por turnos (sin estar conectados a la vez). */
const NET={on:false,code:null,uid:null,seat:-1,driving:false,applying:false,rev:0,room:null,db:null,unsub:null,hb:null,final:false};
const NET_FB_VER='10.12.2';
/* el estado se guarda como texto: Firebase borra listas y objetos vacíos */
const netSnap=r=>{if(!r)return null;/* si hay jugadas en vivo de este mismo turno, retomar desde ahí (recargas, reconexiones) */if(r.live&&r.live.sj&&r.live.rev===r.rev&&r.sj){try{const d=JSON.parse(r.live.sj);delete d.fight;return d}catch(e){}}if(r.sj){try{return JSON.parse(r.sj)}catch(e){return null}}return r.snap||null};
function netUid(){const S=new URLSearchParams(location.search).get('net')==='local'?sessionStorage:localStorage;let u=null;try{u=S.getItem('sendaJaguar.uid')}catch(e){}if(!u){u='u'+Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);try{S.setItem('sendaJaguar.uid',u)}catch(e){}}return u}
function netName(v){try{if(v!==undefined)localStorage.setItem('sendaJaguar.name',v);return localStorage.getItem('sendaJaguar.name')||''}catch(e){return v||''}}
const netGetPath=(o,p)=>p.split('/').filter(Boolean).reduce((a,k)=>a==null?undefined:a[k],o);
function netSetPath(o,p,v){const ks=p.split('/').filter(Boolean);let a=o;for(let i=0;i<ks.length-1;i++){if(typeof a[ks[i]]!=='object'||a[ks[i]]===null)a[ks[i]]={};a=a[ks[i]]}if(v===null||v===undefined)delete a[ks[ks.length-1]];else a[ks[ks.length-1]]=v}
/* --- simulador local: varias pestañas del mismo navegador comparten la "base" --- */
function netLocalAdapter(){const K='tonalli.netdb',bc=('BroadcastChannel' in window)?new BroadcastChannel('tonalli-net'):null,subs=[];
 const PK='tonalli.netpres:';/* la presencia va en claves aparte: así los latidos de varias pestañas no pisan el estado */
 const load=()=>{let db={};try{db=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(PK)){const v=+localStorage.getItem(k);const p=k.slice(PK.length);if(netGetPath(db,p.split('/presence/')[0]))netSetPath(db,p,v)}}}catch(e){}return db};
 const fire=()=>{const db=load();subs.forEach(s=>s.cb(JSON.parse(JSON.stringify(netGetPath(db,s.p)??null))))};
 const strip=v=>{if(Array.isArray(v)){const o={};v.forEach((x,i)=>{const s=strip(x);if(s!==undefined)o[i]=s});return Object.keys(o).length?(Object.keys(o).length===v.length?Object.values(o):o):undefined}if(v&&typeof v==='object'){const o={};for(const k in v){const s=strip(v[k]);if(s!==undefined)o[k]=s}return Object.keys(o).length?o:undefined}return v===null?undefined:v};
 const save=db=>{db=strip(db)||{};const rm=o=>{if(o&&typeof o==='object')for(const k in o){if(k==='presence')delete o[k];else rm(o[k])}};rm(db);localStorage.setItem(K,JSON.stringify(db));fire();bc&&bc.postMessage(1)};
 bc&&(bc.onmessage=()=>fire());addEventListener('storage',e=>{if(e.key===K)fire()});
 return{kind:'local',
  get:async p=>JSON.parse(JSON.stringify(netGetPath(load(),p)??null)),
  set:async(p,v)=>{const db=load();netSetPath(db,p,v);save(db)},
  update:async(p,o)=>{const db=load();for(const k in o)netSetPath(db,p+'/'+k,o[k]);save(db)},
  tx:async(p,fn)=>{const db=load();const cur=netGetPath(db,p)??null;const nv=fn(cur);if(nv===undefined)return{committed:false,val:cur};netSetPath(db,p,nv);save(db);return{committed:true,val:nv}},
  sub:(p,cb)=>{const s={p,cb};subs.push(s);setTimeout(()=>cb(JSON.parse(JSON.stringify(netGetPath(load(),p)??null))),0);return()=>subs.splice(subs.indexOf(s),1)},
  presence:async(p)=>{localStorage.setItem(PK+p,String(Date.now()));fire();bc&&bc.postMessage(1)},
 }}
/* --- Firebase Realtime Database (hosting propio) --- */
async function netFirebaseAdapter(cfg){
 const A=await import(`https://www.gstatic.com/firebasejs/${NET_FB_VER}/firebase-app.js`);
 const D=await import(`https://www.gstatic.com/firebasejs/${NET_FB_VER}/firebase-database.js`);
 const app=A.initializeApp(cfg,'tonalli');const db=D.getDatabase(app);const R=p=>D.ref(db,p);
 return{kind:'firebase',
  get:async p=>(await D.get(R(p))).val(),
  set:(p,v)=>D.set(R(p),v),
  update:(p,o)=>D.update(R(p),o),
  tx:async(p,fn)=>{const r=await D.runTransaction(R(p),cur=>{const nv=fn(cur);return nv===undefined?undefined:nv});return{committed:r.committed,val:r.snapshot.val()}},
  sub:(p,cb)=>D.onValue(R(p),s=>cb(s.val())),
  presence:async(p)=>{await D.set(R(p),Date.now());try{D.onDisconnect(R(p)).remove()}catch(e){}},
 }}
function netLoadCfg(){return new Promise(res=>{if(window.TONALLI_FIREBASE)return res();const s=document.createElement('script');const base=location.pathname.endsWith('/')?location.pathname:location.pathname.replace(/[^/]*$/,'')+'';s.src=base+'config.js?v='+Date.now();s.onload=s.onerror=()=>res();document.head.appendChild(s);setTimeout(res,4000)})}
async function netAdapter(){if(NET.db)return NET.db;
 const q=new URLSearchParams(location.search);
 if(q.get('net')==='local'){NET.db=netLocalAdapter();return NET.db}
 await netLoadCfg();window.TONALLI_FIREBASE=window.TONALLI_FIREBASE||window.TONALLI_FIREBASE_DEFAULT;
 const cfg=window.TONALLI_FIREBASE;if(!cfg||!cfg.databaseURL)throw new Error('noconfig');
 NET.db=await netFirebaseAdapter(cfg);return NET.db}
const netCodeGen=()=>{const L='ABCDEFGHJKLMNPQRSTUVWXYZ';let s='';for(let i=0;i<4;i++)s+=L[Math.floor(Math.random()*L.length)];return s};
const netAlive=r=>{const now=Date.now(),pr=(r&&r.presence)||{};return uid=>pr[uid]&&now-pr[uid]<30000};
function netBeat(){clearInterval(NET.hb);const go=()=>NET.db&&NET.code&&NET.db.presence(`rooms/${NET.code}/presence/${NET.uid}`).catch(()=>{});go();NET.hb=setInterval(go,10000)}
function netStash(snap){try{sessionStorage.setItem('sendaJaguar.net',JSON.stringify({code:NET.code,uid:NET.uid,snap:snap||null}))}catch(e){}}
function netForget(){try{sessionStorage.removeItem('sendaJaguar.net');localStorage.removeItem('sendaJaguar.netlast')}catch(e){}}
const netHeroesFree=()=>HK;
/* --- sala --- */
async function netCreate(){const name=($('onName').value||'').trim()||'Jugador';netName(name);
 let db;try{db=await netAdapter()}catch(e){return netErr(e)}
 NET.uid=netUid();
 for(let i=0;i<8;i++){const code=netCodeGen();const r=await db.tx(`rooms/${code}`,cur=>cur?undefined:{code,host:NET.uid,created:Date.now(),status:'lobby',days:7,seats:{[NET.uid]:{name,hero:HK[0],t:Date.now()}}});
  if(r.committed){NET.code=code;break}}
 if(!NET.code)return toast('No se pudo crear la sala, probá de nuevo');
 try{localStorage.setItem('sendaJaguar.netlast',NET.code)}catch(e){}
 netEnterLobby()}
async function netJoin(codeIn){const code=(codeIn||$('onCode').value||'').trim().toUpperCase();if(code.length!==4)return toast('El código tiene 4 letras');
 const name=($('onName').value||'').trim()||'Jugador';netName(name);
 let db;try{db=await netAdapter()}catch(e){return netErr(e)}
 NET.uid=netUid();const room=await db.get(`rooms/${code}`);if(!room)return toast('No existe una partida con ese código');
 const seats=room.seats||{};
 if(!seats[NET.uid]){if(room.status!=='lobby')return toast('Esa partida ya empezó');if(Object.keys(seats).length>=4)return toast('La sala está llena (4 jugadores)');
  const used=Object.values(seats).map(s=>s.hero);const hero=HK.find(k=>!used.includes(k))||HK[0];
  await db.update(`rooms/${code}/seats/${NET.uid}`,{name,hero,t:Date.now()})}
 NET.code=code;try{localStorage.setItem('sendaJaguar.netlast',code)}catch(e){}
 if(room.status==='playing'&&netSnap(room))return netBootInto(room);
 netEnterLobby()}
function netErr(e){toast(e&&e.message==='noconfig'?'El juego online no está configurado en esta versión':'No se pudo conectar: revisá tu internet');console.warn(e)}
function netEnterLobby(){$('ovOnline').classList.add('hidden');$('ovLobby').classList.remove('hidden');netBeat();
 NET.unsub&&NET.unsub();NET.unsub=NET.db.sub(`rooms/${NET.code}`,r=>{NET.room=r;if(!r){toast('La sala se cerró');return netLeave()}
  if(r.status==='playing'&&netSnap(r)&&!NET.on){return netBootInto(r)}renderLobby()});
 clearInterval(NET.lt);NET.lt=setInterval(()=>NET.room&&!NET.on&&renderLobby(),5000)}
function seatList(r){return Object.entries((r&&r.seats)||{}).sort((a,b)=>a[1].t-b[1].t)}
const LB_OPTS={days:[[5,'5 días'],[7,'7 días']],bestias:[['clasicas','Clásicas'],['aleatorias','Aleatorias']],extras:[['ninguno','Ninguno'],['quinta','Quinta ciudad'],['mercado','Mercado']],altars:[[false,'Sin altares'],[true,'Con altares']],respawn:[['elegida','La elige el jugador'],['auto','Automática']],omens:[['no','Apagados'],['ocasionales','Ocasionales'],['frecuentes','Frecuentes']]};
const LB_DEF={days:7,bestias:'clasicas',extras:'ninguno',altars:false,respawn:'elegida',omens:'ocasionales'};
const lbOpt=(r,k)=>{const o=(r&&r.opts)||{};return o[k]!==undefined?o[k]:(k==='days'&&r&&r.days)||LB_DEF[k]};
function renderLobby(){const r=NET.room;if(!r)return;const host=r.host===NET.uid,alive=netAlive(r),L=seatList(r);const list=L.map(x=>({hero:x[1].hero}));
 $('lbCode').textContent=r.code;
 $('lbSeats').innerHTML=L.map(([uid,s],i)=>{const me=uid===NET.uid;
  return`<div style="margin-bottom:10px"><div class="row" style="gap:8px"><span class="dot" style="background:${COLORS[i]}"></span>${portrait(s.hero,34,heroHue(list,i))}<div style="flex:1;min-width:0"><div>${esc(s.name)}${me?' <span class="mut">(vos)</span>':''}${uid===r.host?' <span class="gold">· anfitrión</span>':''}</div><div class="mut" style="font-size:15px">${alive(uid)?'● conectado':'○ sin conexión'}</div></div></div>
   ${me?`<div class="row" style="gap:4px;margin-top:4px">${HK.map(k=>`<button class="plain hpick ${s.hero===k?'sel':''}" onclick="UI.netHero('${k}')" aria-label="${HEROES[k].name}" title="${HEROES[k].name}">${portrait(k,40)}</button>`).join('')}</div>`:''}
   <div style="font-size:17px"><b>${HEROES[s.hero].name}</b> <span class="mut">· ${HEROES[s.hero].desc}</span></div></div>`}).join('');
 const btns=(id,k,style)=>{$(id).innerHTML=LB_OPTS[k].map(([v,l])=>`<button class="plain ${lbOpt(r,k)===v?'sel':''}" style="text-align:center;${style||''}" ${host?`onclick='UI.netOpt("${k}",${JSON.stringify(v)})'`:'disabled'}>${l}</button>`).join('')};
 btns('lbDays','days');btns('lbBk','bestias');btns('lbX','extras','font-size:17px;padding:7px 2px');btns('lbA','altars');btns('lbR','respawn');btns('lbO','omens','font-size:17px;padding:7px 2px');
 $('lbBoss').textContent=(lbOpt(r,'bestias')==='aleatorias'?'Cada nivel sortea su bestia':'Bestias clásicas')+(+lbOpt(r,'days')>=7?(lbOpt(r,'bestias')==='aleatorias'?' · el día 6 despierta un jefe al azar':' · el día 6 despierta el Xiuhcóatl'):' · sin jefe en partidas de 5 días');
 $('lbOptNote').textContent=host?'Elegí las opciones de la partida:':'Opciones de la partida (las elige el anfitrión):';
 $('lbStart').classList.toggle('hidden',!host);$('lbWait').classList.toggle('hidden',host);
 $('lbStart').disabled=L.length<2;$('lbStart').textContent=L.length<2?'Esperando jugadores…':`Empezar (${L.length} jugadores)`}
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function netStart(){const r=NET.room;if(!r||r.host!==NET.uid)return;const L=seatList(r);if(L.length<2)return;
 NET.order=L.map(x=>x[0]);await NET.db.update(`rooms/${NET.code}`,{order:NET.order,status:'starting'});
 setup.n=L.length;['days','bestias','extras','altars','respawn','omens'].forEach(k=>setup[k]=lbOpt(r,k));L.forEach(([uid,s],i)=>{setup.players[i]={name:s.name,hero:s.hero}});
 if(setup.extras!==EXTRAS){try{sessionStorage.setItem('sendaJaguar.nethost',JSON.stringify({code:NET.code,uid:NET.uid,order:NET.order}))}catch(e){}}
 NET.on=true;NET.seat=0;NET.driving=true;NET.rev=0;netStash(null);
 $('ovLobby').classList.add('hidden');clearInterval(NET.lt);
 NET.unsub&&NET.unsub();netListen();startGame()}
function netLeave(){clearInterval(NET.hb);clearInterval(NET.lt);NET.unsub&&NET.unsub();NET.unsub=null;
 if(NET.db&&NET.code&&NET.room&&NET.room.status==='lobby'){const r=NET.room;if(r.host===NET.uid&&seatList(r).length<=1)NET.db.set(`rooms/${NET.code}`,null);else NET.db.set(`rooms/${NET.code}/seats/${NET.uid}`,null)}
 NET.code=null;NET.room=null;netForget();$('ovLobby').classList.add('hidden');UI.menuShow()}
/* --- entrar a una partida en curso (recarga con el mapa de la partida) --- */
function netBootInto(r){netStash(netSnap(r));location.reload()}
/* --- durante la partida --- */
function netListen(){NET.unsub=NET.db.sub(`rooms/${NET.code}`,r=>{if(!r)return;NET.room=r;netHud();
 if(netSnap(r)&&r.rev>NET.rev&&r.by!==NET.uid){NET.rev=r.rev;NET.fight=null;netApply(r)}
 else if(r.rev>NET.rev)NET.rev=r.rev;
 netLiveMaybe(r.live)})}
function netApply(r){const d=netSnap(r);if(!G||d.seed!==SEED){netStash(d);return location.reload()}
 NET.applying=true;try{
  if(B)try{closeBattle()}catch(e){}
  G.players.forEach(p=>p.obj&&removeBillboard(p.obj));G.beasts.forEach(b=>b.obj&&removeBillboard(b.obj));
  SAVED=d;continueGame();netStash(d);
  NET.driving=G.cur===NET.seat;
  if(r.status==='over'){endGame()}
  else if(NET.driving){toast('¡Es tu turno!');try{sfxP('gloria')}catch(e){}document.title='¡Tu turno! · Tonalli'}
  else document.title='Tonalli · Senda del Jaguar';
 }finally{NET.applying=false}netHud();update()}
function persistSave(d){clearTimeout(NET.liveT);NET.lastLive='';
 if(G&&G.tut)return;
 if(!NET.on){localStorage.setItem(SAVE_KEY,JSON.stringify(d));return}
 netStash(d);if(NET.applying||!NET.driving)return;
 NET.rev++;const over=NET.final;NET.driving=d.cur===NET.seat&&!over;
 const up={sj:JSON.stringify(d),snap:null,rev:NET.rev,by:NET.uid,status:over?'over':'playing',cur:d.cur,at:Date.now()};(NET.db?Promise.resolve():NET.ready).then(()=>NET.db.update(`rooms/${NET.code}`,up)).catch(e=>{toast('No se pudo enviar el turno, reintentando…');setTimeout(()=>NET.db.update(`rooms/${NET.code}`,up),3000)});
 netHud()}
const myTurn=()=>!NET.on||NET.driving;
function netHud(){let el=$('netHud');if(!NET.on){el&&el.remove();return}
 if(!el){el=document.createElement('div');el.id='netHud';el.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:max(46px,calc(env(safe-area-inset-top) + 40px));z-index:40;background:rgba(20,14,10,.82);border:1px solid rgba(227,176,75,.5);border-radius:14px;padding:3px 10px;font-size:15px;color:#f0e6d0;pointer-events:none;white-space:nowrap';document.body.appendChild(el)}
 const r=NET.room||{};const alive=netAlive(r);const order=r.order||[];
 const dots=order.map((u,i)=>`<span style="color:${COLORS[i]};opacity:${alive(u)?1:.35}">●</span>`).join(' ');
 const curName=G&&G.players[G.cur]?G.players[G.cur].name:'';
 el.innerHTML=`<span class="gold">${NET.code}</span> ${dots} · ${NET.driving?'<b>tu turno</b>':'turno de '+esc(curName)}`}
/* bloquear acciones cuando no es tu turno */
{const _oh=onHex;onHex=function(h){if(!myTurn()){toast('Esperá tu turno');return}return _oh.apply(this,arguments)}}
{const _ac=act;act=function(){if(!myTurn())return;return _ac.apply(this,arguments)}}
{const _ac2=autoCheck;autoCheck=function(){if(NET.on&&(!NET.driving||NET.applying))return;return _ac2.apply(this,arguments)}}
{const _up=update;update=function(){const r=_up.apply(this,arguments);if(NET.on&&G&&!NET.driving&&!G.over){const n=G.players[G.cur]?G.players[G.cur].name:'';$('acts').innerHTML=`<div class="mut" style="padding:6px 2px">Esperando a <b style="color:${G.players[G.cur].color}">${esc(n)}</b>…</div>`;const f=NET.fight;$('hint').textContent=f&&!f.over?`${n} pelea contra ${BEASTS[f.kind].name} · le quedan ${f.meter} de ${f.max}`:`Turno de ${n}`}if(NET.on&&NET.driving)netLiveSched();return r}}
{const _eg=endGame;endGame=function(){if(NET.on&&NET.driving&&!NET.applying){NET.final=true;try{saveGame()}finally{NET.final=false}}const r=_eg.apply(this,arguments);if(NET.on){netForget();document.title='Tonalli · Senda del Jaguar'}return r}}
{const _ba=buildAltars;buildAltars=function(){if(buildAltars.done)return;buildAltars.done=true;return _ba.apply(this,arguments)}}
{const _lg=log;log=function(m){if(NET.applying&&/^Partida retomada/.test(m))return;return _lg.apply(this,arguments)}}
/* reconexión: la pestaña recuerda la partida; al recargar sigue donde estaba */
;(()=>{let st=null;try{st=JSON.parse(sessionStorage.getItem('sendaJaguar.net')||'null')}catch(e){}if(!st||!st.code)return;
 setTimeout(async()=>{try{await netAdapter()}catch(e){netForget();return netErr(e)}
  NET.uid=st.uid||netUid();NET.code=st.code;const r=await NET.db.get(`rooms/${NET.code}`);
  if(!r||!netSnap(r)){netForget();return toast('La partida online ya no existe')}
  NET.room=r;NET.order=r.order||[];NET.seat=NET.order.indexOf(NET.uid);NET.on=true;NET.rev=r.rev||0;
  if(NET.seat<0){NET.on=false;netForget();return toast('No formás parte de esa partida')}
  $('ovTitle').classList.add('hidden');['ovMenu','ovSetup','ovOnline','ovLobby'].forEach(i=>$(i)&&$(i).classList.add('hidden'));
  const sn=netSnap(r);NET.applying=true;try{if(sn.seed!==SEED){netStash(sn);return location.reload()}if(G){G.players.forEach(p=>p.obj&&removeBillboard(p.obj));G.beasts.forEach(b=>b.obj&&removeBillboard(b.obj))}SAVED=sn;continueGame()}finally{NET.applying=false}
  NET.driving=G.cur===NET.seat;netBeat();netListen();
  if(r.status==='over'){NET.applying=true;try{endGame()}finally{NET.applying=false}}
  else if(NET.driving)toast('¡Es tu turno!');update();netHud()},350)})();
Object.assign(UI,{
 netCreate:()=>netCreate(),netJoin:()=>netJoin(),netLeave:()=>netLeave(),netStart:()=>netStart(),
 netHero:k=>NET.db&&NET.db.update(`rooms/${NET.code}/seats/${NET.uid}`,{hero:k}),
 netDays:n=>UI.netOpt('days',n),
 netOpt:(k,v)=>NET.db&&NET.room&&NET.room.host===NET.uid&&NET.db.update(`rooms/${NET.code}/opts`,{[k]:v}),
 netShare:()=>{const t=`¡Jugá Tonalli conmigo! Entrá a ${location.origin+location.pathname} → Juego online → Unirse con el código ${NET.code}`;if(navigator.share)navigator.share({text:t}).catch(()=>{});else{navigator.clipboard&&navigator.clipboard.writeText(t);toast('Invitación copiada')}},
});
{const _mo=UI.menuOnline;UI.menuOnline=function(){const r=_mo.apply(this,arguments);$('onName').value=netName()||'';let last=null;try{last=localStorage.getItem('sendaJaguar.netlast')}catch(e){}$('onLast').classList.toggle('hidden',!last);if(last)$('onLast').textContent='Volver a la sala '+last;$('onLast').onclick=()=>netJoin(last);return r}}
{const _sr=showRings;showRings=function(){const r=_sr.apply(this,arguments);if(NET.on&&!NET.driving)rings.forEach(o=>o.visible=false);return r}}

/* volver al menú principal desde la partida */
UI.toMenu=()=>{if(B){toast('Terminá el combate antes de salir');return}if(midAction()){toast('Esperá a que termine la acción en curso');return}
 const online=NET.on;const msg=online?'¿Salir de la partida online? Podés volver a entrar con el código '+NET.code+'.':'¿Volver al menú principal? La partida queda guardada y la podés continuar.';
 if(!confirm(msg))return;
 try{if(!online&&G&&!G.over&&!G.tut)saveGame(true)}catch(e){}
 if(online){try{sessionStorage.removeItem('sendaJaguar.net')}catch(e){}}
 try{sessionStorage.setItem('sendaJaguar.toMenu','1')}catch(e){}location.reload()};
;(()=>{let m=false;try{m=sessionStorage.getItem('sendaJaguar.toMenu')==='1';sessionStorage.removeItem('sendaJaguar.toMenu')}catch(e){}if(m)setTimeout(()=>{try{$('ovTitle').classList.add('hidden');UI.menuShow()}catch(e){}},300)})();
{const _sd=showDetails;showDetails=function(){const r=_sd.apply(this,arguments);const b=$('bMenu');if(b){b.classList.toggle('hidden',!!(G&&G.tut));b.textContent=NET.on?'Salir de la partida online':'Volver al menú principal'}return r}}

;(()=>{let h=null;try{h=JSON.parse(sessionStorage.getItem('sendaJaguar.nethost')||'null');sessionStorage.removeItem('sendaJaguar.nethost')}catch(e){}if(!h||!PENDING)return;
 NET.uid=h.uid;NET.code=h.code;NET.order=h.order;NET.on=true;NET.seat=0;NET.driving=true;NET.rev=0;netStash(null);
 NET.ready=netAdapter().then(()=>{netBeat();netListen()}).catch(e=>netErr(e))})();

/* --- sincronización en vivo: cada acción del que juega se refleja en los demás --- */
NET.liveSeq=0;NET.liveSeen={};NET.lastLive='';NET.liveT=null;NET.fight=null;
function netLiveSched(){if(!NET.on||!NET.driving||NET.applying||!G||G.over||G.tut)return;clearTimeout(NET.liveT);NET.liveT=setTimeout(netLivePush,180)}
function netLivePush(){if(!NET.on||!NET.driving||NET.applying||!G||G.over||!NET.db)return;
 let d;try{d=snapState(true)}catch(e){return}
 d.fight=B&&B.b?{kind:B.b.kind,who:G.players.indexOf(B.p),meter:B.meter,max:B.max,over:!!B.over}:null;
 const s=JSON.stringify(d);if(s===NET.lastLive)return;NET.lastLive=s;
 NET.db.update(`rooms/${NET.code}`,{live:{rev:NET.rev,seq:++NET.liveSeq,by:NET.uid,sj:s}}).catch(()=>{})}
function netLiveMaybe(L){if(!L||!L.sj||NET.driving||NET.applying||L.by===NET.uid||L.rev!==NET.rev||!G)return;
 if(L.seq<=(NET.liveSeen[L.rev]||0))return;NET.liveSeen[L.rev]=L.seq;let d;try{d=JSON.parse(L.sj)}catch(e){return}netLiveApply(d)}
function netLiveApply(d){if(d.seed!==SEED||d.day!==G.day||d.phase!==G.phase||d.cur!==G.cur||d.players.length!==G.players.length)return;
 const walkTo=(o,q,r,hero)=>{const h=hexes.get(key(q,r));if(!h)return;o.userData.lock=true;walkObj(o,slotPos(h,hero&&(beastAt(h)||heroesAt(h).length>1)?-.34:0),620,()=>{o.userData.lock=false})};
 const PF=['hp','maxHp','res','glory','dignityLost','kills','trophies','hunt','items','used','poison','soul','hidden','broken','ap','freeMoves','gatherBonus','cacBonus'];
 d.players.forEach((s,i)=>{const p=G.players[i];PF.forEach(k=>{if(s[k]!==undefined)p[k]=s[k]});if(s.q!==p.q||s.r!==p.r){p.q=s.q;p.r=s.r;walkTo(p.obj,s.q,s.r,true)}});
 const same=d.beasts.length===G.beasts.length&&d.beasts.every((s,i)=>s.kind===G.beasts[i].kind);
 if(same)d.beasts.forEach((s,i)=>{const b=G.beasts[i];b.up=s.up||[];b.wound=s.wound||0;if(s.q!==b.q||s.r!==b.r){b.q=s.q;b.r=s.r;walkTo(b.obj,s.q,s.r)}});
 else{const keyB=b=>b.kind+'@'+b.q+','+b.r,want=d.beasts.map(keyB);
  G.beasts.forEach(b=>{if(!want.includes(keyB(b))){try{burst(b.obj.position.clone().add(new THREE.Vector3(0,.6,0)),50,0xf0c040,2,{up:true,life:1.1})}catch(e){}}removeBillboard(b.obj)});G.beasts=[];
  d.beasts.forEach(s=>{const h=hexes.get(key(s.q,s.r));const b=spawn(s.kind,h,false);if(b){b.up=s.up||[];b.wound=s.wound||0;if(b.up.includes('ira')){b.obj.scale.setScalar(1.2);b.obj.userData.rage=true}}})}
 cities.forEach((c,i)=>{const s=d.cities[i];if(s){c.card=s.card;c.deck=s.deck;c.done=s.done||[]}});
 let si=0;allHex.filter(h=>RESOF[h.t]).forEach(h=>{if(d.stock&&d.stock[si]!==undefined)h.stock=d.stock[si];si++});
 G.hunts=d.hunts;G.kindUps=d.kindUps||{};G.respawn=(d.respawn||[]).map(r=>typeof r==='string'?{kind:r}:r);G.omen=d.omen;
 const nl=d.log||[],old=G.log[0];const fresh=[];for(const m of nl){if(m===old)break;fresh.push(m)}G.log=nl.slice();
 fresh.slice(0,2).reverse().forEach((m,i)=>setTimeout(()=>toast(String(m).replace(/<[^>]+>/g,'')),i*900));
 const f=d.fight;const was=NET.fight;NET.fight=f;
 if(f&&!was){const w=G.players[f.who];const b=G.beasts.find(x=>x.kind===f.kind&&x.q===w.q&&x.r===w.r);if(b)try{signText('¡Combate!',b.obj)}catch(e){}}
 update()}
{const _rb=renderBattle;renderBattle=function(){const r=_rb.apply(this,arguments);netLiveSched();return r}}
