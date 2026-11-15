/* ================= juego online (Fase 2) =================
   Partida guardada en una base compartida (Firebase Realtime Database, o un
   simulador local para pruebas). El jugador de turno juega en su dispositivo y,
   al pasar el turno, publica el estado; los demás lo reciben y lo aplican.
   Sirve en tiempo real y por turnos (sin estar conectados a la vez). */
const NET={on:false,code:null,uid:null,seat:-1,driving:false,applying:false,rev:0,room:null,db:null,unsub:null,hb:null,final:false};
const NET_FB_VER='10.12.2';
/* el estado se guarda como texto: Firebase borra listas y objetos vacíos */
const netSnap=r=>{if(!r)return null;if(r.sj){try{return JSON.parse(r.sj)}catch(e){return null}}return r.snap||null};
function netUid(){const S=new URLSearchParams(location.search).get('net')==='local'?sessionStorage:localStorage;let u=null;try{u=S.getItem('sendaJaguar.uid')}catch(e){}if(!u){u='u'+Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);try{S.setItem('sendaJaguar.uid',u)}catch(e){}}return u}
function netName(v){try{if(v!==undefined)localStorage.setItem('sendaJaguar.name',v);return localStorage.getItem('sendaJaguar.name')||''}catch(e){return v||''}}
const netGetPath=(o,p)=>p.split('/').filter(Boolean).reduce((a,k)=>a==null?undefined:a[k],o);
function netSetPath(o,p,v){const ks=p.split('/').filter(Boolean);let a=o;for(let i=0;i<ks.length-1;i++){if(typeof a[ks[i]]!=='object'||a[ks[i]]===null)a[ks[i]]={};a=a[ks[i]]}if(v===null||v===undefined)delete a[ks[ks.length-1]];else a[ks[ks.length-1]]=v}
/* --- simulador local: varias pestañas del mismo navegador comparten la "base" --- */
function netLocalAdapter(){const K='tonalli.netdb',bc=('BroadcastChannel' in window)?new BroadcastChannel('tonalli-net'):null,subs=[];
 const load=()=>{try{return JSON.parse(localStorage.getItem(K)||'{}')}catch(e){return{}}};
 const fire=()=>{const db=load();subs.forEach(s=>s.cb(JSON.parse(JSON.stringify(netGetPath(db,s.p)??null))))};
 const strip=v=>{if(Array.isArray(v)){const o={};v.forEach((x,i)=>{const s=strip(x);if(s!==undefined)o[i]=s});return Object.keys(o).length?(Object.keys(o).length===v.length?Object.values(o):o):undefined}if(v&&typeof v==='object'){const o={};for(const k in v){const s=strip(v[k]);if(s!==undefined)o[k]=s}return Object.keys(o).length?o:undefined}return v===null?undefined:v};
 const save=db=>{db=strip(db)||{};localStorage.setItem(K,JSON.stringify(db));fire();bc&&bc.postMessage(1)};
 bc&&(bc.onmessage=()=>fire());addEventListener('storage',e=>{if(e.key===K)fire()});
 return{kind:'local',
  get:async p=>JSON.parse(JSON.stringify(netGetPath(load(),p)??null)),
  set:async(p,v)=>{const db=load();netSetPath(db,p,v);save(db)},
  update:async(p,o)=>{const db=load();for(const k in o)netSetPath(db,p+'/'+k,o[k]);save(db)},
  tx:async(p,fn)=>{const db=load();const cur=netGetPath(db,p)??null;const nv=fn(cur);if(nv===undefined)return{committed:false,val:cur};netSetPath(db,p,nv);save(db);return{committed:true,val:nv}},
  sub:(p,cb)=>{const s={p,cb};subs.push(s);setTimeout(()=>cb(JSON.parse(JSON.stringify(netGetPath(load(),p)??null))),0);return()=>subs.splice(subs.indexOf(s),1)},
  presence:async(p)=>{const db=load();netSetPath(db,p,Date.now());save(db)},
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
function renderLobby(){const r=NET.room;if(!r)return;const host=r.host===NET.uid,alive=netAlive(r),L=seatList(r);
 $('lbCode').textContent=r.code;
 $('lbSeats').innerHTML=L.map(([uid,s],i)=>{const me=uid===NET.uid;const list=L.map(x=>({hero:x[1].hero}));
  return`<div class="row" style="margin:6px 0;gap:8px"><span class="dot" style="background:${COLORS[i]}"></span>${portrait(s.hero,34,heroHue(list,i))}<div style="flex:1;min-width:0"><div>${esc(s.name)}${me?' <span class="mut">(vos)</span>':''}${uid===r.host?' <span class="gold">· anfitrión</span>':''}</div><div class="mut" style="font-size:15px">${alive(uid)?'● conectado':'○ sin conexión'} · ${HEROES[s.hero].name}</div></div>${me?`<select onchange="UI.netHero(this.value)" style="font:16px inherit;background:#1a1410;color:#f0e6d0;border:1px solid #6a5434;border-radius:6px;padding:4px">${HK.map(k=>`<option value="${k}" ${k===s.hero?'selected':''}>${HEROES[k].name}</option>`).join('')}</select>`:''}</div>`}).join('');
 $('lbDays').innerHTML=[[5,'5 días'],[7,'7 días']].map(([n,l])=>`<button class="plain ${r.days===n?'sel':''}" ${host?`onclick="UI.netDays(${n})"`:'disabled'}>${l}</button>`).join('');
 $('lbStart').classList.toggle('hidden',!host);$('lbWait').classList.toggle('hidden',host);
 $('lbStart').disabled=L.length<2;$('lbStart').textContent=L.length<2?'Esperando jugadores…':`Empezar (${L.length} jugadores)`}
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function netStart(){const r=NET.room;if(!r||r.host!==NET.uid)return;const L=seatList(r);if(L.length<2)return;
 NET.order=L.map(x=>x[0]);await NET.db.update(`rooms/${NET.code}`,{order:NET.order,status:'starting'});
 setup.n=L.length;setup.days=r.days||7;setup.extras=EXTRAS;L.forEach(([uid,s],i)=>{setup.players[i]={name:s.name,hero:s.hero}});
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
 if(netSnap(r)&&r.rev>NET.rev&&r.by!==NET.uid){NET.rev=r.rev;netApply(r)}
 else if(r.rev>NET.rev)NET.rev=r.rev})}
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
function persistSave(d){
 if(G&&G.tut)return;
 if(!NET.on){localStorage.setItem(SAVE_KEY,JSON.stringify(d));return}
 netStash(d);if(NET.applying||!NET.driving)return;
 NET.rev++;const over=NET.final;NET.driving=d.cur===NET.seat&&!over;
 const up={sj:JSON.stringify(d),snap:null,rev:NET.rev,by:NET.uid,status:over?'over':'playing',cur:d.cur,at:Date.now()};NET.db.update(`rooms/${NET.code}`,up).catch(e=>{toast('No se pudo enviar el turno, reintentando…');setTimeout(()=>NET.db.update(`rooms/${NET.code}`,up),3000)});
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
{const _up=update;update=function(){const r=_up.apply(this,arguments);if(NET.on&&G&&!NET.driving&&!G.over){const n=G.players[G.cur]?G.players[G.cur].name:'';$('acts').innerHTML=`<div class="mut" style="padding:6px 2px">Esperando a <b style="color:${G.players[G.cur].color}">${esc(n)}</b>…</div>`;$('hint').textContent=`Turno de ${n}`}return r}}
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
  const sn=netSnap(r);NET.applying=true;try{if(sn.seed!==SEED){netStash(sn);return location.reload()}SAVED=sn;continueGame()}finally{NET.applying=false}
  NET.driving=G.cur===NET.seat;netBeat();netListen();
  if(r.status==='over'){NET.applying=true;try{endGame()}finally{NET.applying=false}}
  else if(NET.driving)toast('¡Es tu turno!');update();netHud()},350)})();
Object.assign(UI,{
 netCreate:()=>netCreate(),netJoin:()=>netJoin(),netLeave:()=>netLeave(),netStart:()=>netStart(),
 netHero:k=>NET.db&&NET.db.update(`rooms/${NET.code}/seats/${NET.uid}`,{hero:k}),
 netDays:n=>NET.db&&NET.room&&NET.room.host===NET.uid&&NET.db.update(`rooms/${NET.code}`,{days:n}),
 netShare:()=>{const t=`¡Jugá Tonalli conmigo! Entrá a ${location.origin+location.pathname} → Juego online → Unirse con el código ${NET.code}`;if(navigator.share)navigator.share({text:t}).catch(()=>{});else{navigator.clipboard&&navigator.clipboard.writeText(t);toast('Invitación copiada')}},
});
{const _mo=UI.menuOnline;UI.menuOnline=function(){const r=_mo.apply(this,arguments);$('onName').value=netName()||'';let last=null;try{last=localStorage.getItem('sendaJaguar.netlast')}catch(e){}$('onLast').classList.toggle('hidden',!last);if(last)$('onLast').textContent='Volver a la sala '+last;$('onLast').onclick=()=>netJoin(last);return r}}
{const _sr=showRings;showRings=function(){const r=_sr.apply(this,arguments);if(NET.on&&!NET.driving)rings.forEach(o=>o.visible=false);return r}}
