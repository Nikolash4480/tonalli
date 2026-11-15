/* Tonalli · audio procedural (Web Audio, sin archivos) */
const SND=(()=>{
 let ctx=null,wetToSmooth,smooth,master,music,sfx,musicMain,sfxMain,hallMain,dlyMain,themeBus=null,sfxBuses=[],rev,hall,hallIn,dly,noiseBuf,cur=null,timer=null,vol={master:.8,music:.8,sfx:.8},muted=false;
 const PENTA=[0,3,5,7,10];
 function init(){if(ctx)return ctx;ctx=new (window.AudioContext||window.webkitAudioContext)();
  master=ctx.createGain();master.gain.value=muted?0:vol.master;const outG=ctx.createGain();outG.gain.value=.82;master.connect(outG);outG.connect(ctx.destination);
  music=ctx.createGain();music.gain.value=vol.music;sfx=ctx.createGain();sfx.gain.value=vol.sfx;const lim=ctx.createDynamicsCompressor();lim.threshold.value=-6;lim.knee.value=4;lim.ratio.value=8;lim.attack.value=.01;lim.release.value=.3;const limG=ctx.createGain();limG.gain.value=.7;lim.connect(limG);
  // reverb: impulso generado (sala de piedra)
  rev=ctx.createConvolver();const L=ctx.sampleRate*2.2,ir=ctx.createBuffer(2,L,ctx.sampleRate);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);let y=0;for(let i=0;i<L;i++){const k=.35-.3*(i/L);y+=k*((Math.random()*2-1)-y);d[i]=y*2.2*Math.pow(1-i/L,3.2)}}
  rev.buffer=ir;const rg=ctx.createGain();rg.gain.value=.28;rev.connect(rg);rg.connect(master);
  hall=ctx.createConvolver();{const L2=ctx.sampleRate*4.5,ir2=ctx.createBuffer(2,L2,ctx.sampleRate);for(let c=0;c<2;c++){const d=ir2.getChannelData(c);let y=0;for(let i=0;i<L2;i++){const k=.25-.22*(i/L2);y+=k*((Math.random()*2-1)-y);d[i]=y*2.6*Math.pow(1-i/L2,2.2)}}hall.buffer=ir2}hallIn=ctx.createGain();hallIn.gain.value=.5;hallIn.connect(hall);hall.connect(master);
  {dly=ctx.createGain();const dL=ctx.createDelay(1),dR=ctx.createDelay(1),fb=ctx.createGain(),pL=ctx.createStereoPanner(),pR=ctx.createStereoPanner(),lp=ctx.createBiquadFilter();
   dL.delayTime.value=.395;dR.delayTime.value=.395;fb.gain.value=.38;pL.pan.value=-.8;pR.pan.value=.8;lp.type='lowpass';lp.frequency.value=2800;const wet=ctx.createGain();wet.gain.value=.35;
   dly.connect(dL);dL.connect(lp);lp.connect(pL);lp.connect(dR);dR.connect(pR);dR.connect(fb);fb.connect(dL);pL.connect(wet);pR.connect(wet);wet.connect(master);wetToSmooth=wet}
  {smooth=ctx.createGain();smooth.gain.value=.5;const out=ctx.createGain();out.gain.value=.22;const lens=[.0437,.0571,.0683,.0797,.1013,.1201];
   lens.forEach((L,i)=>{const d=ctx.createDelay(.5),f=ctx.createGain(),lp=ctx.createBiquadFilter(),p=ctx.createStereoPanner();d.delayTime.value=L;f.gain.value=.78;lp.type='lowpass';lp.frequency.value=2200;p.pan.value=i%2?.6:-.6;
    smooth.connect(d);d.connect(lp);lp.connect(f);f.connect(d);lp.connect(p);p.connect(out)});out.connect(master)}
  music.connect(master);music.connect(smooth);wetToSmooth.connect(smooth);sfx.connect(lim);limG.connect(master);sfx.connect(rev);musicMain=music;sfxMain=sfx;hallMain=hallIn;dlyMain=dly;
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const nd=noiseBuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  return ctx}
 const hz=m=>440*Math.pow(2,(m-69)/12);
 function env(g,t,a,peak,d){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d)}
 function noise(out,t,dur,type,f,q,peak,a=.003){const s=ctx.createBufferSource();s.buffer=noiseBuf;const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=ctx.createGain();env(g,t,a,peak,dur);s.connect(fl);fl.connect(g);g.connect(out);s.start(t,Math.random()*.5);s.stop(t+a+dur+.05)}
 /* ---- instrumentos ---- */
 function flute(out,t,m,dur,v=.18,breath=.35){const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),lf=ctx.createOscillator(),lg=ctx.createGain(),fl=ctx.createBiquadFilter();
  o.type='sine';o2.type='triangle';const f=hz(m);o.frequency.value=f;o2.frequency.value=f*2;const g2=ctx.createGain();g2.gain.value=.12;
  lf.frequency.value=5.2;lg.gain.value=f*.012;lf.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);
  // pequeño glissando de entrada, típico de flauta de barro
  o.frequency.setValueAtTime(f*.97,t);o.frequency.linearRampToValueAtTime(f,t+.06);
  fl.type='lowpass';fl.frequency.value=2600;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.07);g.gain.setValueAtTime(v,t+Math.max(.08,dur-.12));g.gain.exponentialRampToValueAtTime(0.0001,t+dur+.08);
  o.connect(g);o2.connect(g2);g2.connect(g);g.connect(fl);fl.connect(out);[o,o2,lf].forEach(x=>{x.start(t);x.stop(t+dur+.15)});
  if(breath>0)noise(out,t,.09,'bandpass',f*2,2,v*breath,.02)}
 function tepo(out,t,f,v=.35){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.5,t);o.frequency.exponentialRampToValueAtTime(f,t+.02);env(g,t,.002,v,.28);o.connect(g);g.connect(out);o.start(t);o.stop(t+.35);
  const o2=ctx.createOscillator(),g2=ctx.createGain();o2.type='square';o2.frequency.value=f*2.76;env(g2,t,.001,v*.08,.05);o2.connect(g2);g2.connect(out);o2.start(t);o2.stop(t+.1);noise(out,t,.03,'bandpass',1800,3,v*.4)}
 function huehue(out,t,v=.6,f=72){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.6,t);o.frequency.exponentialRampToValueAtTime(f,t+.06);env(g,t,.004,v,.55);o.connect(g);g.connect(out);o.start(t);o.stop(t+.7);noise(out,t,.08,'lowpass',500,1,v*.4)}
 function rattle(out,t,v=.12,len=.05){noise(out,t,len,'highpass',4500,.7,v,.004)}
 function conch(out,t,m=45,dur=1.8,v=.22){const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),fl=ctx.createBiquadFilter();o.type='sawtooth';o2.type='sine';const f=hz(m);
  o.frequency.setValueAtTime(f*.92,t);o.frequency.linearRampToValueAtTime(f,t+.35);o.frequency.setValueAtTime(f,t+dur*.7);o.frequency.linearRampToValueAtTime(f*.94,t+dur);o2.frequency.value=f;
  fl.type='lowpass';fl.frequency.setValueAtTime(400,t);fl.frequency.linearRampToValueAtTime(1300,t+.4);fl.frequency.linearRampToValueAtTime(600,t+dur);fl.Q.value=3;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.3);g.gain.setValueAtTime(v,t+dur*.75);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(fl);o2.connect(fl);fl.connect(g);g.connect(out);o.start(t);o2.start(t);o.stop(t+dur+.1);o2.stop(t+dur+.1)}

 function choir(out,t,ms,dur,v=.12,soft=false){const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+dur*.45);g.gain.setValueAtTime(v,t+dur*.8);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  const f1=ctx.createBiquadFilter(),f2=ctx.createBiquadFilter(),mix=ctx.createGain();f1.type=f2.type='bandpass';f1.frequency.value=760;f2.frequency.value=1180;f1.Q.value=f2.Q.value=5;mix.gain.value=2.2;
  ms.forEach(m=>{for(const det of[-9,-3,4,10]){const o=ctx.createOscillator();o.type=soft?'triangle':'sawtooth';o.frequency.value=hz(m);o.detune.value=soft?det*.5:det;const lf=ctx.createOscillator(),lg=ctx.createGain();lf.frequency.value=4.6+Math.random();lg.gain.value=6;lf.connect(lg);lg.connect(o.detune);o.connect(f1);o.connect(f2);o.start(t);lf.start(t);o.stop(t+dur+.1);lf.stop(t+dur+.1)}});
  f1.connect(mix);f2.connect(mix);const lo=ctx.createBiquadFilter();lo.type='lowpass';lo.frequency.value=soft?1300:2400;mix.connect(lo);lo.connect(g);g.connect(out);g.connect(hallIn)}
 function boom(out,t,v=.9){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(34,t+.5);env(g,t,.005,v,2.2);o.connect(g);g.connect(out);g.connect(hallIn);o.start(t);o.stop(t+2.4);noise(out,t,.4,'lowpass',300,1,v*.5)}
 function taiko(out,t,v=.7){for(const [d,f] of[[0,64],[.012,72],[.02,58]])huehue(out,t+d,v*.6,f);noise(hallIn,t,.15,'lowpass',400,1,v*.5)}

 function growl(out,t,f,dur,v,rough=28){const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),am=ctx.createGain(),lf=ctx.createOscillator(),lfg=ctx.createGain(),lp=ctx.createBiquadFilter();
  o.type='sawtooth';o2.type='square';o.frequency.setValueAtTime(f*1.25,t);o.frequency.exponentialRampToValueAtTime(f,t+dur*.3);o.frequency.exponentialRampToValueAtTime(f*.8,t+dur);o2.frequency.value=f*.5;
  lf.frequency.value=rough;lfg.gain.value=.5;am.gain.value=.5;lf.connect(lfg);lfg.connect(am.gain);
  lp.type='lowpass';lp.frequency.setValueAtTime(300,t);lp.frequency.linearRampToValueAtTime(900,t+dur*.25);lp.frequency.linearRampToValueAtTime(250,t+dur);lp.Q.value=4;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.08);g.gain.setValueAtTime(v,t+dur*.6);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(am);o2.connect(am);am.connect(lp);lp.connect(g);g.connect(out);[o,o2,lf].forEach(x=>{x.start(t);x.stop(t+dur+.05)})}
 function shriek(out,t,f0,f1,dur,v){const o=ctx.createOscillator(),g=ctx.createGain(),bp=ctx.createBiquadFilter(),lf=ctx.createOscillator(),lg=ctx.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur*.4);o.frequency.exponentialRampToValueAtTime(f0*.8,t+dur);
  lf.frequency.value=11;lg.gain.value=f0*.06;lf.connect(lg);lg.connect(o.frequency);bp.type='bandpass';bp.frequency.value=2200;bp.Q.value=2.5;env(g,t,.03,v,dur);o.connect(bp);bp.connect(g);g.connect(out);o.start(t);lf.start(t);o.stop(t+dur+.1);lf.stop(t+dur+.1);noise(out,t,dur*.8,'bandpass',3500,3,v*.4,.02)}
 function hiss(out,t,dur,v){noise(out,t,dur,'highpass',3800,.6,v,.06)}
 function roar(out,t,dur,v){const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;bp.frequency.setValueAtTime(300,t);bp.frequency.exponentialRampToValueAtTime(1600,t+dur*.4);bp.frequency.exponentialRampToValueAtTime(400,t+dur);const g=ctx.createGain();env(g,t,.1,v,dur);s.connect(bp);bp.connect(g);g.connect(out);g.connect(hallIn);s.start(t);s.stop(t+dur+.2)}
 function flap(out,t,n,gap,v){for(let k=0;k<n;k++)noise(out,t+k*gap,.09,'lowpass',500,1,v,.02)}
 function bones(out,t,n,v,spread=.06,f0=86){for(let k=0;k<n;k++){const tt=t+k*spread*(0.6+Math.random()*.8);tepo(out,tt,hz(f0-k*1.5+Math.random()*6),v*(1-k/(n*1.4)));noise(out,tt,.02,'highpass',5000,1,v*.3)}}

 function pluck(out,t,m,v=.08,pan=0){const o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter(),p=ctx.createStereoPanner();o.type='triangle';o.frequency.value=hz(m);lp.type='lowpass';lp.frequency.setValueAtTime(3200,t);lp.frequency.exponentialRampToValueAtTime(500,t+.25);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(0.0001,t+.45);p.pan.value=pan;o.connect(lp);lp.connect(g);g.connect(p);p.connect(out);p.connect(dly);o.start(t);o.stop(t+.5)}
 function sub(out,t,m,dur,v=.2,beat=.5){const o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();o.type='sine';o.frequency.value=hz(m);lp.type='lowpass';lp.frequency.value=180;g.gain.setValueAtTime(0.0001,t);
  for(let b=0;b<dur/beat-.01;b++){const tb=t+b*beat;g.gain.setTargetAtTime(v*.35,tb,.012);g.gain.setTargetAtTime(v,tb+.06,beat*.22)}
  g.gain.setTargetAtTime(0.0001,t+dur-.08,.04);o.connect(lp);lp.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.3)}
 function kick(out,t,v=.5,f=55){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f*2.2,t);o.frequency.exponentialRampToValueAtTime(f,t+.07);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(0.0001,t+.7);o.connect(g);g.connect(out);o.start(t);o.stop(t+.75)}
 function glideFlute(out,t,notes,beat,v=.12){const o=ctx.createOscillator(),g=ctx.createGain(),lf=ctx.createOscillator(),lg=ctx.createGain(),lp=ctx.createBiquadFilter(),dg=ctx.createGain();o.type='sine';lf.frequency.value=5;lg.gain.value=3;lf.connect(lg);lg.connect(o.frequency);
  lp.type='lowpass';lp.frequency.value=2400;dg.gain.value=.6;let tt=t;g.gain.setValueAtTime(0.0001,t);
  notes.forEach(([m,d])=>{if(m){o.frequency.setTargetAtTime(hz(m),tt,.035);g.gain.setTargetAtTime(v,tt,.05);g.gain.setTargetAtTime(v*.75,tt+beat*d*.6,.2)}else g.gain.setTargetAtTime(0.0001,tt,.08);tt+=beat*d});
  g.gain.setTargetAtTime(0.0001,tt,.15);o.connect(lp);lp.connect(g);g.connect(out);g.connect(dg);dg.connect(dly);g.connect(smooth);o.start(t);lf.start(t);o.stop(tt+1);lf.stop(tt+1)}
 function crackle(out,t,dur,dens,v){for(let k=0;k<dur*dens;k++){const tt=t+Math.random()*dur;noise(out,tt,.008+Math.random()*.015,'highpass',2500+Math.random()*3000,1,v*(.4+Math.random()*.6),.001)}}
 function flame(out,t,dur,v){const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.Q.value=.9;bp.frequency.setValueAtTime(250,t);bp.frequency.exponentialRampToValueAtTime(1800,t+dur*.35);bp.frequency.exponentialRampToValueAtTime(500,t+dur);
  const am=ctx.createGain(),lf=ctx.createOscillator(),lg=ctx.createGain();lf.type='sawtooth';lf.frequency.value=17;lg.gain.value=.35;am.gain.value=.65;lf.connect(lg);lg.connect(am.gain);
  const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+dur*.25);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(bp);bp.connect(am);am.connect(g);g.connect(out);g.connect(hallIn);s.start(t);lf.start(t);s.stop(t+dur+.1);lf.stop(t+dur+.1)}
 function croak(out,t,f,dur,v){const o=ctx.createOscillator(),g=ctx.createGain(),am=ctx.createGain(),lf=ctx.createOscillator(),lg=ctx.createGain(),bp=ctx.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*.85,t+dur);
  lf.frequency.value=34;lg.gain.value=.5;am.gain.value=.5;lf.connect(lg);lg.connect(am.gain);bp.type='bandpass';bp.frequency.value=f*3;bp.Q.value=3;env(g,t,.02,v,dur);o.connect(am);am.connect(bp);bp.connect(g);g.connect(out);o.start(t);lf.start(t);o.stop(t+dur+.05);lf.stop(t+dur+.05)}
 function chomp(out,t,f,v){tepo(out,t,f,v);noise(out,t+.01,.04,'bandpass',1400,2,v*.6)}

 function softPad(out,t,ms,dur,v=.05){const g=ctx.createGain(),lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(700,t);lp.frequency.linearRampToValueAtTime(1400,t+dur*.5);lp.frequency.linearRampToValueAtTime(800,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.35,dur*.12));g.gain.setValueAtTime(v,t+dur*.75);g.gain.linearRampToValueAtTime(0,t+dur);
  ms.forEach((m,i)=>{const o=ctx.createOscillator(),p=ctx.createStereoPanner();o.type='sine';o.frequency.value=hz(m);p.pan.value=(i%2?.35:-.35);const og=ctx.createGain();og.gain.value=1/ms.length;o.connect(og);og.connect(p);p.connect(lp);o.start(t);o.stop(t+dur+.05);
   const o2=ctx.createOscillator();o2.type='sine';o2.frequency.value=hz(m+12)*1.002;const g2=ctx.createGain();g2.gain.value=.25/ms.length;o2.connect(g2);g2.connect(lp);o2.start(t);o2.stop(t+dur+.05)});lp.connect(g);g.connect(out);g.connect(smooth)}
 function softPluck(out,t,m,v=.05,pan=0){const o=ctx.createOscillator(),g=ctx.createGain(),p=ctx.createStereoPanner();o.type='sine';o.frequency.value=hz(m);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.setTargetAtTime(0,t+.012,.12);p.pan.value=pan;o.connect(g);g.connect(p);p.connect(out);p.connect(dly);o.start(t);o.stop(t+.8)}
 function softWood(out,t,f,v=.05){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.3,t);o.frequency.setTargetAtTime(f,t,.01);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.003);g.gain.setTargetAtTime(0,t+.004,.05);o.connect(g);g.connect(out);o.start(t);o.stop(t+.4)}
 function softKick(out,t,v=.4,f=52){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.8,t);o.frequency.setTargetAtTime(f,t,.025);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.setTargetAtTime(0,t+.01,.16);o.connect(g);g.connect(out);o.start(t);o.stop(t+1)}
 function softSwell(out,t,m,dur,v=.04){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(hz(m)*.97,t);o.frequency.linearRampToValueAtTime(hz(m),t+.5);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+dur*.4);g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g);g.connect(out);g.connect(smooth);o.start(t);o.stop(t+dur+.05)}
 /* ---- música: patrones por tema ---- */
 const THEMES={
  dia:{bpm:92,root:57,drums:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],tep:[1,0,1,1,0,1,0,0,1,0,1,0,0,1,1,0],rat:.8,fl:.55,oct:12},
  noche:{bpm:70,root:52,drums:[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],tep:[0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0],rat:.25,fl:.35,oct:12},
  combate:{bpm:124,root:50,drums:[1,0,0,1,0,0,1,0,1,0,1,0,0,1,1,0],tep:[1,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1],rat:1,fl:.3,oct:12},
 };

 const INTRO={bpm:76,mel:[[74,2],[77,1],[79,1],[81,3],[79,1],[77,1],[74,1],[72,2],[74,4],[69,2],[72,1],[74,1],[77,2],[79,1],[77,1],[74,6],[0,2]],
  chords:[[38,50,53,57],[34,46,50,53],[36,48,52,55],[38,50,53,57]]};
 let IOPT={};
 function playIntro(){const T=INTRO,beat=60/T.bpm,bar=beat*4;let start=ctx.currentTime+.15,loop=0;const off=k=>(IOPT.mute||[]).includes(k);
  const sched=()=>{if(cur!=='intro')return;if(start>ctx.currentTime+bar*4.5)return;const t0=start,full=true;
   T.chords.forEach((c,i)=>{const tb=t0+i*bar;
    if(!off('coro'))softPad(music,tb,c.map(m=>m<48?m+12:m),bar*1.3,.07);
    const arp=[c[1]+12,c[2]+12,c[3]+12,c[2]+12];for(let k=0;k<16;k++)if(!off('punteo')&&(k%2===0||full))softPluck(music,tb+k*beat/4,arp[k%4]+(k>=8&&i%2?12:0),k%4===0?.045:.03,k%2?.45:-.45);
    {if(!off('bajo'))sub(music,tb,c[0],bar,.13,beat);if(!off('tambores')){softKick(music,tb,.38,50);softKick(music,tb+beat*2,.2,58)}if(!off('teponaztli')){softWood(music,tb+beat*1.5,hz(69),.04);softWood(music,tb+beat*3.5,hz(64),.04)}}
    if(full&&i===3&&!off('tambores'))for(let k=0;k<4;k++)softKick(music,tb+beat*2+k*beat/2,.08+k*.04,64)});
   if(loop===0&&!off('tambores')){softKick(music,t0,.5,46);softKick(music,t0+.02,.3,62)}
   if(loop%2===0&&!off('caracol'))softSwell(music,t0,50,3,.045);
   if(full&&!off('flauta'))glideFlute(music,t0,T.mel.map(([m,d])=>[m?m+(loop%3===2?12:0):0,d]),beat,.1);
   start+=bar*4;loop++};
  const bus=themeBus,run=()=>withBus(bus,true,sched);run();timer=setInterval(run,250)}
 // ===== Ocaso eterno: tema único del stage del Guerrero sin Sol (Re frigio, latido, coro y silbido de muerte)
 const OCASO={bpm:62,chords:[[38,50,53,57],[39,51,55,58],[36,48,51,55],[38,50,53,57]],
  mel:[[74,3],[75,1],[74,2],[72,2],[70,4],[69,4],[72,2],[74,2],[75,4],[74,6],[0,2],[77,3],[75,1],[74,4],[70,2],[72,2],[69,8]]};
 function playOcaso(){const T=OCASO,beat=60/T.bpm,bar=beat*4;let start=ctx.currentTime+.15,loop=0;
  const sched=()=>{if(cur!=='ocaso')return;if(start>ctx.currentTime+bar*4.5)return;const t0=start;
   T.chords.forEach((c,i)=>{const tb=t0+i*bar;
    softPad(music,tb,c.map(m=>m<48?m+12:m),bar*1.25,.075);
    sub(music,tb,c[0]-12>24?c[0]-12:c[0],bar,.14,beat*2);
    for(let k=0;k<4;k++){softKick(music,tb+k*beat,.34,46);softKick(music,tb+k*beat+beat*.28,.2,52)}   // latido lub-dub
    if(i%2===1)for(let k=0;k<3;k++)softWood(music,tb+beat*2.5+k*beat/3,hz(62-k*2),.035);
    if(loop>0&&i===3)for(let k=0;k<6;k++)softKick(music,tb+beat*2+k*beat/3,.1+k*.05,60)});
   softSwell(music,t0,38,bar*1.6/1,.05);if(loop%2===1)softSwell(music,t0+bar*2,45,bar*1.2,.04);
   if(loop>0)glideFlute(music,t0,T.mel.map(([m,d])=>[m?m+(loop%2?0:-12)+12:0,d/2]),beat*2,.085);
   // silbido de la muerte: una caída larga y lejana cada 2 vueltas
   if(loop%2===0)glideFlute(music,t0+bar*3,[[88,1],[64,3]],beat*1.5,.035);
   start+=bar*4;loop++};
  const bus=themeBus,run=()=>withBus(bus,true,sched);run();timer=setInterval(run,250)}
 function playTheme(name,opt){if(name!=='intro'&&name!=='ocaso'&&!THEMES[name])return;IOPT=opt||{};init();if(ctx.state==='suspended')ctx.resume();if(cur===name&&!opt)return;stopMusic();themeBus=mkBus(musicMain);cur=name;if(name==='intro')return playIntro();if(name==='ocaso')return playOcaso();const T=THEMES[name];const step=60/T.bpm/4;let next=ctx.currentTime+.1,i=0,phrase=[],mel=0;
  const sched=()=>{if(cur!==name)return;while(next<ctx.currentTime+.4){const s=i%16;
    if(T.drums[s])huehue(music,next,s===0?.55:.38,s===0?68:82);
    if(T.tep[s])tepo(music,next,s%4===0?hz(T.root+12):hz(T.root+19),.22);
    if(Math.random()<T.rat*(s%2?.4:.8))rattle(music,next,.05+.04*(s%4===0),.04);
    if(s===0&&i%64===0&&name!=='combate')conch(music,next,T.root-12,1.6,.1);
    if(s%2===0&&Math.random()<T.fl){ // frase de flauta pentatónica, paso a paso
      mel=Math.max(0,Math.min(9,mel+[-2,-1,-1,0,1,1,2][Math.floor(Math.random()*7)]));const deg=PENTA[mel%5]+12*Math.floor(mel/5);
      flute(music,next,T.root+T.oct+deg,step*(Math.random()<.3?4:2)*.95,.11)}
    next+=step;i++}};
  const bus=themeBus,run=()=>withBus(bus,true,sched);run();timer=setInterval(run,100)}
 function mkBus(main){const b={g:ctx.createGain(),h:ctx.createGain(),d:ctx.createGain()};b.g.connect(main);b.h.connect(hallMain);b.d.connect(dlyMain);return b}
 function withBus(b,isMusic,fn){const sv=[music,sfx,hallIn,dly];if(isMusic)music=b.g;else sfx=b.g;hallIn=b.h;dly=b.d;try{fn()}finally{[music,sfx,hallIn,dly]=sv}}
 function killBus(b,t=.25){if(!b)return;[b.g,b.h,b.d].forEach(x=>fadeKill(x,t))}
 function fadeKill(g,t=.25){if(!g||!ctx)return;const n=ctx.currentTime;g.gain.cancelScheduledValues(n);g.gain.setValueAtTime(g.gain.value,n);g.gain.linearRampToValueAtTime(0,n+t);setTimeout(()=>{try{g.disconnect()}catch(e){}},t*1000+80)}
 function stopMusic(){cur=null;if(timer)clearInterval(timer);timer=null;if(themeBus){killBus(themeBus);themeBus=null}}
 function stopSfx(){sfxBuses.forEach(b=>killBus(b,.12));sfxBuses=[]}
 function stopAll(){stopMusic();stopSfx()}
 /* ---- efectos ---- */
 const FX={
  paso:t=>{huehue(sfx,t,.12,140);rattle(sfx,t,.03,.03)},
  boton:t=>tepo(sfx,t,hz(76),.12),
  dado:t=>{for(let k=0;k<7;k++){tepo(sfx,t+k*.055+Math.random()*.02,hz(80+Math.floor(Math.random()*6)),.1);rattle(sfx,t+k*.055,.04,.02)}tepo(sfx,t+.45,hz(64),.3)},
  golpe:t=>{huehue(sfx,t,.7,60);noise(sfx,t,.12,'bandpass',1200,1.2,.35);tepo(sfx,t,hz(55),.2)},
  fallo:t=>{const s=ctx.createBufferSource();s.buffer=noiseBuf;const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=2;f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(2400,t+.25);const g=ctx.createGain();env(g,t,.04,1.4,.24);s.connect(f);f.connect(g);g.connect(sfx);s.start(t,Math.random()*.5);s.stop(t+.4);tepo(sfx,t+.22,hz(70),.2)},
  gloria:t=>{[0,3,5,7,12].forEach((d,k)=>flute(sfx,t+k*.09,69+d,.22,.16));for(let k=0;k<8;k++)rattle(sfx,t+k*.05,.06,.03)},
  recolectar:t=>{tepo(sfx,t,hz(74),.22);tepo(sfx,t+.12,hz(79),.22)},
  turno:t=>conch(sfx,t,50,1.1,.2),
  emboscada:t=>{tepo(sfx,t,hz(62),.4);tepo(sfx,t+.07,hz(61),.4);noise(sfx,t,.25,'highpass',2000,.7,.2);huehue(sfx,t+.05,.5,55)},
  bestiaMuere:t=>{[12,7,5,0].forEach((d,k)=>flute(sfx,t+k*.14,62+d,.18,.14));huehue(sfx,t+.6,.4,50)},
  curar:t=>{[0,7,12].forEach((d,k)=>flute(sfx,t+k*.07,72+d,.3,.1))},
  jefe:t=>{
   // retumbo de tierra que crece
   const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(80,t);lp.frequency.linearRampToValueAtTime(300,t+3.4);lp.Q.value=6;
   const rg=ctx.createGain();rg.gain.setValueAtTime(0.0001,t);rg.gain.exponentialRampToValueAtTime(.5,t+3.3);rg.gain.exponentialRampToValueAtTime(0.0001,t+3.6);s.connect(lp);lp.connect(rg);rg.connect(sfx);s.start(t);s.stop(t+3.7);
   // coro grave: Re menor -> Si bemol -> La (i - VI - V), crece
   choir(sfx,t,[38,45,50,53],1.5,.07);choir(sfx,t+1.2,[34,46,50,53],1.4,.09);choir(sfx,t+2.3,[33,45,49,52],1.4,.11);
   // patrón de tambores de guerra (DUM . . DUM . DUM DUM .) x2, luego redoble
   const pat=[0,.75,1.25,1.5];for(const r of[0,1.6])pat.forEach(p=>taiko(sfx,t+.2+r+p*.55,.55+r*.1));
   for(let k=0;k<10;k++){huehue(sfx,t+2.7+k*.07,.25+k*.05,70+(k%2)*10);rattle(sfx,t+2.7+k*.07,.06+k*.01,.05)}
   // caracoles en acorde sosteniendo
   conch(sfx,t+.1,33,3.4,.2);conch(sfx,t+.8,40,2.8,.15);
   // GOLPE FINAL a los 3.5s: boom, coro fuerte en Re mayor (tercera de picardía), caracoles, flauta
   const H=t+3.5;boom(sfx,H,1);taiko(sfx,H,1);taiko(sfx,H+.03,.8);
   choir(sfx,H,[26,38,45,50,54,57],3.2,.2);conch(sfx,H,33,3,.32);conch(sfx,H+.02,45,2.8,.22);
   [24,19,17,12].forEach((d,k)=>flute(sfx,H+.15+k*.13,62+d,.3,.15));
   for(let k=0;k<3;k++)taiko(sfx,H+1.2+k*.5,.5-k*.12)},
  calaca_ataque:t=>{bones(sfx,t,6,.25,.05);[0,1,2].forEach(k=>shriek(sfx,t+.3+k*.13,420-k*40,520-k*50,.11,.3))},
  calaca_muere:t=>{bones(sfx,t,14,.3,.07,90);huehue(sfx,t+.9,.25,90)},
  tzitzimitl_ataque:t=>{flap(sfx,t,4,.11,.9);shriek(sfx,t+.35,700,1500,.6,.6)},
  tzitzimitl_muere:t=>{shriek(sfx,t,1200,500,1.1,.55);flap(sfx,t+.1,3,.18,.8);noise(sfx,t+.4,.6,'bandpass',800,1,.4,.2)},
  tlaltecuhtli_ataque:t=>{croak(sfx,t,150,.45,.3);[[.18,hz(70)],[.27,hz(76)],[.33,hz(66)],[.42,hz(72)],[.5,hz(63)]].forEach(([d,f])=>chomp(sfx,t+d,f,.25));noise(sfx,t+.5,.35,'bandpass',2600,1.5,.12,.05)},
  tlaltecuhtli_muere:t=>{croak(sfx,t,140,.5,.3);croak(sfx,t+.55,115,.7,.25);croak(sfx,t+1.3,90,1,.2);for(let k=0;k<10;k++)tepo(sfx,t+.6+k*.12+Math.random()*.05,hz(50+Math.random()*8),.14);noise(sfx,t+.8,1.2,'bandpass',500,1,.15,.2)},
  xiuhcoatl_ataque:t=>{hiss(sfx,t,.5,.18);flame(sfx,t+.2,1.8,.6);crackle(sfx,t+.25,1.6,40,.22);growl(sfx,t+.3,46,1.4,.18,20);boom(sfx,t+.25,.55);
   const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(110,t+.3);o.frequency.exponentialRampToValueAtTime(55,t+2.4);env(g,t+.3,.15,.25,2.2);o.connect(g);g.connect(hallIn);g.connect(sfx);o.start(t+.3);o.stop(t+2.7)},
  // ===== Jaguar del Primer Sol: rugido profundo + resplandor solar
  jaguarsol_entrada:t=>{choir(sfx,t,[38,45,50,57],3.2,.08,true);for(let k=0;k<6;k++)flute(sfx,t+.4+k*.35,62+[0,3,7,10,12,15][k],.6,.07);boom(sfx,t+1.5,.8);taiko(sfx,t+1.5,.6);growl(sfx,t+1.6,52,2.2,.34,16);growl(sfx,t+1.7,78,1.6,.16,30);conch(sfx,t+2.2,45,1.6,.16)},
  jaguarsol_ataque:t=>{growl(sfx,t,58,1.1,.36,14);growl(sfx,t+.05,92,.7,.18,34);huehue(sfx,t+.25,.7,54);noise(sfx,t+.2,.25,'bandpass',900,1.2,.5);for(let k=0;k<4;k++)flute(sfx,t+.35+k*.06,74+k*4,.25,.06)},
  jaguarsol_muere:t=>{growl(sfx,t,50,2.4,.3,12);choir(sfx,t+.6,[50,57,62,66],2.6,.1,true);for(let k=0;k<5;k++)flute(sfx,t+1+k*.3,74-k*3,.7,.06);boom(sfx,t+2.2,.6)},
  // ===== Alacrán de Yappan: quitina, siseo y aguijón
  alacran_entrada:t=>{for(let k=0;k<7;k++){taiko(sfx,t+k*.23,.35+k*.06);noise(sfx,t+k*.23,.3,'lowpass',160,2,.5)}boom(sfx,t+1.5,.9);for(let k=0;k<14;k++)tepo(sfx,t+1.6+k*.05,hz(70+(k%3)*5),.12);hiss(sfx,t+1.8,1.2,.14);growl(sfx,t+2,40,1.4,.2,40)},
  alacran_ataque:t=>{for(let k=0;k<6;k++)tepo(sfx,t+k*.04,hz(76+(k%2)*6),.14);hiss(sfx,t+.15,.4,.16);shriek(sfx,t+.3,1800,600,.18,.08);noise(sfx,t+.42,.12,'highpass',3000,1,.6);huehue(sfx,t+.45,.5,70)},
  alacran_muere:t=>{for(let k=0;k<10;k++)tepo(sfx,t+k*.08+Math.random()*.03,hz(60+Math.random()*20),.16);hiss(sfx,t+.3,1.4,.12);noise(sfx,t+.8,.6,'lowpass',220,1,.6);boom(sfx,t+1,.5)},
  // ===== Tzinacan: aleteos y chillidos
  tzinacan_entrada:t=>{for(let k=0;k<28;k++){const tt=t+k*.07;noise(sfx,tt,.06,'bandpass',600+Math.random()*500,2,.25*(.4+k/28))}for(let k=0;k<5;k++)shriek(sfx,t+.5+k*.28,3200+k*300,1600,.16,.05);growl(sfx,t+2,60,1.2,.18,30);shriek(sfx,t+2.1,2600,700,.6,.12);boom(sfx,t+2.1,.5)},
  tzinacan_ataque:t=>{for(let k=0;k<5;k++)noise(sfx,t+k*.06,.05,'bandpass',800,2,.35);shriek(sfx,t+.2,3600,1400,.22,.12);shriek(sfx,t+.3,2800,900,.3,.08);huehue(sfx,t+.4,.45,66)},
  tzinacan_muere:t=>{shriek(sfx,t,3000,400,1.2,.12);for(let k=0;k<16;k++)noise(sfx,t+.3+k*.08,.05,'bandpass',500+k*30,2,.25*(1-k/16));growl(sfx,t+.4,46,1.6,.2,20)},
  // ===== Guerrero sin Sol: viento de ceniza, latido y tambor de guerra apagado
  guerrero_entrada:t=>{hiss(sfx,t,3,.1);for(let k=0;k<8;k++)huehue(sfx,t+k*.4,.35+k*.05,46);choir(sfx,t+.5,[33,40,45,48],3,.1);boom(sfx,t+1.4,1);conch(sfx,t+1.5,33,2.4,.24);growl(sfx,t+1.6,40,2,.24,10);for(let k=0;k<4;k++)taiko(sfx,t+2.6+k*.32,.7)},
  guerrero_ataque:t=>{noise(sfx,t,.22,'bandpass',500,1.2,.6);boom(sfx,t+.18,.6);for(let k=0;k<5;k++)tepo(sfx,t+.2+k*.03,hz(84-k*3),.12);growl(sfx,t+.1,48,.8,.22,12)},
  guerrero_muere:t=>{growl(sfx,t,44,1.8,.26,10);choir(sfx,t+.8,[45,52,57,61],2.6,.1,true);for(let k=0;k<6;k++)flute(sfx,t+1.2+k*.22,69+[0,4,7,12,16,19][k],.6,.07);boom(sfx,t+1,.5)},
  // ===== bestias de rotación
  ahuizotl_entrada:t=>{for(let k=0;k<5;k++)noise(sfx,t+k*.09,.35,'lowpass',500-k*60,1.5,.35,.01);noise(sfx,t+.1,.5,'bandpass',1800,2,.18,.02);growl(sfx,t+.45,120,.5,.16,40)},
  ahuizotl_ataque:t=>{noise(sfx,t,.4,'lowpass',380,2,.45,.01);growl(sfx,t+.05,110,.45,.22,44);chomp(sfx,t+.35,hz(68),.25);noise(sfx,t+.4,.6,'bandpass',900,1.5,.16,.02)},
  ahuizotl_muere:t=>{shriek(sfx,t,900,300,.5,.14);for(let k=0;k<6;k++)noise(sfx,t+.3+k*.1,.25,'lowpass',420-k*40,1.5,.25*(1-k/7),.01)},
  chaneque_entrada:t=>{for(let k=0;k<9;k++)rattle(sfx,t+k*.06+Math.random()*.03,.08,.04);[0,4,7].forEach((d,k)=>flute(sfx,t+.4+k*.09,79+d,.16,.08));shriek(sfx,t+.7,1400,2200,.18,.08)},
  chaneque_ataque:t=>{[0,3,7,12].forEach((d,k)=>flute(sfx,t+k*.05,81+d,.1,.08));shriek(sfx,t+.2,1600,2600,.2,.1);rattle(sfx,t+.3,.12,.15);tepo(sfx,t+.35,hz(82),.2)},
  chaneque_muere:t=>{[12,7,4,0].forEach((d,k)=>flute(sfx,t+k*.1,79+d,.18,.09));rattle(sfx,t+.4,.1,.3)},
  xolotl_entrada:t=>{flame(sfx,t,1,.25);choir(sfx,t+.1,[50,57,62],1.4,.06,true);growl(sfx,t+.6,90,.6,.18,36);shriek(sfx,t+.9,600,1100,.5,.12)},
  xolotl_ataque:t=>{growl(sfx,t,95,.5,.26,40);chomp(sfx,t+.25,hz(66),.3);flame(sfx,t+.2,.6,.22);[0,5,10].forEach((d,k)=>flute(sfx,t+.3+k*.06,70+d,.2,.06))},
  xolotl_muere:t=>{shriek(sfx,t,800,1600,.8,.14);choir(sfx,t+.4,[50,57,62,66],1.8,.08,true);flame(sfx,t+.2,1.2,.15)},
  nahual_entrada:t=>{hiss(sfx,t,1,.12);noise(sfx,t,1.1,'bandpass',300,1,.2,.4);growl(sfx,t+.7,70,.9,.26,30);shriek(sfx,t+1,500,900,.6,.14)},
  nahual_ataque:t=>{growl(sfx,t,80,.6,.3,32);noise(sfx,t+.25,.2,'bandpass',1400,1.2,.5);noise(sfx,t+.33,.16,'bandpass',2000,1.2,.4);huehue(sfx,t+.35,.5,58)},
  nahual_muere:t=>{shriek(sfx,t,700,250,1,.16);growl(sfx,t+.2,60,1,.2,24);hiss(sfx,t+.6,.9,.1)},
  tepeyollotl_entrada:t=>{boom(sfx,t,.7);for(let k=0;k<6;k++)tepo(sfx,t+.1+k*.09+Math.random()*.04,hz(48+Math.random()*8),.2);growl(sfx,t+.3,46,1.6,.36,14);growl(sfx,t+.35,70,1.1,.18,28)},
  tepeyollotl_ataque:t=>{growl(sfx,t,50,1,.38,14);growl(sfx,t+.05,80,.6,.2,30);boom(sfx,t+.3,.5);huehue(sfx,t+.32,.7,50);noise(sfx,t+.3,.25,'bandpass',800,1.2,.4)},
  tepeyollotl_muere:t=>{growl(sfx,t,44,2,.3,12);boom(sfx,t+.8,.6);for(let k=0;k<8;k++)tepo(sfx,t+.9+k*.1,hz(46+Math.random()*6),.16)},
  quinametzin_entrada:t=>{for(let k=0;k<3;k++){boom(sfx,t+k*.55,.55+k*.15);taiko(sfx,t+k*.55,.5)}growl(sfx,t+1.5,40,1.2,.24,10)},
  quinametzin_ataque:t=>{growl(sfx,t,44,.5,.24,12);noise(sfx,t+.1,.3,'lowpass',260,1,.5,.15);boom(sfx,t+.4,.8);taiko(sfx,t+.4,.8);for(let k=0;k<6;k++)tepo(sfx,t+.45+k*.05,hz(52+k*2),.14)},
  quinametzin_muere:t=>{growl(sfx,t,40,1.4,.28,10);boom(sfx,t+1.1,1);taiko(sfx,t+1.12,.9);for(let k=0;k<10;k++)tepo(sfx,t+1.2+k*.08+Math.random()*.04,hz(44+Math.random()*10),.18)},
  xochitonal_entrada:t=>{for(let k=0;k<4;k++)noise(sfx,t+k*.12,.45,'lowpass',420-k*40,1.5,.3,.02);hiss(sfx,t+.5,.9,.16);croak(sfx,t+.9,95,.7,.24)},
  xochitonal_ataque:t=>{hiss(sfx,t,.35,.18);chomp(sfx,t+.25,hz(58),.35);chomp(sfx,t+.35,hz(55),.3);noise(sfx,t+.3,.4,'lowpass',500,1.5,.3,.02);croak(sfx,t+.45,100,.4,.2)},
  xochitonal_muere:t=>{croak(sfx,t,90,.9,.26);hiss(sfx,t+.4,1.2,.12);for(let k=0;k<5;k++)noise(sfx,t+.7+k*.12,.3,'lowpass',380,1.5,.2*(1-k/6),.02)},
  xiuhcoatl_muere:t=>{flame(sfx,t,2.6,.5);crackle(sfx,t,2.6,30,.18);hiss(sfx,t+.2,2.2,.16);growl(sfx,t,40,2.6,.3,14);boom(sfx,t+2,.8);choir(sfx,t+2,[38,45,50,54],2.8,.12)},
  zarpazo:t=>{const s=ctx.createBufferSource();s.buffer=noiseBuf;const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=1.4;f.frequency.setValueAtTime(350,t);f.frequency.exponentialRampToValueAtTime(1800,t+.16);const g=ctx.createGain();env(g,t,.02,.6,.18);s.connect(f);f.connect(g);g.connect(sfx);s.start(t,Math.random()*.5);s.stop(t+.3);huehue(sfx,t+.13,.5,58)},
 critico:t=>{boom(sfx,t,.8);huehue(sfx,t,.8,52);noise(sfx,t,.18,'bandpass',1500,1,.4);[0,7,12,19].forEach((d,k)=>flute(sfx,t+.05+k*.05,76+d,.25,.12));for(let k=0;k<6;k++)rattle(sfx,t+.05+k*.04,.08,.03)},
 caida:t=>{[7,5,3,0,-5].forEach((d,k)=>flute(sfx,t+k*.16,62+d,.3,.15));huehue(sfx,t+.8,.7,48);conch(sfx,t+.7,38,1.4,.16)},
 furia:t=>{growl(sfx,t,70,.9,.25,24);rattle(sfx,t+.1,.1,.25);huehue(sfx,t+.05,.4,60)},
 mejora:t=>{conch(sfx,t,40,1.2,.18);tepo(sfx,t+.25,hz(62),.35);tepo(sfx,t+.4,hz(65),.35);rattle(sfx,t+.25,.08,.3)},
 presagio:t=>{flute(sfx,t,64,.5,.12);flute(sfx,t+.25,63,.7,.12);rattle(sfx,t,.05,.4)},
 };
 const FXGAIN={ahuizotl_entrada:1.4,ahuizotl_ataque:1.8,ahuizotl_muere:1.8,chaneque_entrada:1.4,chaneque_ataque:1.8,chaneque_muere:1.8,xolotl_entrada:1.4,xolotl_ataque:1.8,xolotl_muere:1.8,nahual_entrada:1.4,nahual_ataque:1.8,nahual_muere:1.8,tepeyollotl_entrada:1.4,tepeyollotl_ataque:1.8,tepeyollotl_muere:1.8,quinametzin_entrada:1.4,quinametzin_ataque:1.8,quinametzin_muere:1.8,xochitonal_entrada:1.4,xochitonal_ataque:1.8,xochitonal_muere:1.8,paso:3.2,boton:4,golpe:1.5,recolectar:1.8,turno:1.3,curar:1.9,gloria:1.4,presagio:1.6,calaca_ataque:2.4,calaca_muere:1.6,tzitzimitl_ataque:2.1,tzitzimitl_muere:3,tlaltecuhtli_ataque:2.2,tlaltecuhtli_muere:3.4,bestiaMuere:1.5,jefe:.85,xiuhcoatl_ataque:.8,xiuhcoatl_muere:.75,jaguarsol_entrada:.85,alacran_entrada:.85,tzinacan_entrada:1.2,jaguarsol_ataque:1.1,alacran_ataque:1.6,tzinacan_ataque:1.5,jaguarsol_muere:1.1,alacran_muere:1.6,tzinacan_muere:1.5,guerrero_entrada:.8,guerrero_ataque:1.3,guerrero_muere:1.1};
 function play(n,opt){init();if(ctx.state==='suspended')ctx.resume();const f=FX[n];if(!f)return;if(opt&&opt.exclusive)stopSfx();
  const bus=mkBus(sfxMain);bus.g.gain.value=FXGAIN[n]||1;sfxBuses.push(bus);if(sfxBuses.length>24)sfxBuses.shift();withBus(bus,false,()=>f(ctx.currentTime+.01));
  setTimeout(()=>{const i=sfxBuses.indexOf(bus);if(i>=0)sfxBuses.splice(i,1)},9000)}
 function setVol(k,v){vol[k]=v;if(!ctx)return;if(k==='master')master.gain.value=muted?0:v;if(k==='music')musicMain.gain.value=v;if(k==='sfx')sfxMain.gain.value=v}
 function mute(m){muted=m;if(ctx)master.gain.value=m?0:vol.master}
 return{init,resume:()=>{try{init();if(ctx.state!=='running')ctx.resume()}catch(e){}},get state(){return ctx?ctx.state:'none'},play,playTheme,stopMusic,stopSfx,stopAll,setVol,mute,get theme(){return cur},FX:Object.keys(FX),THEMES:['intro',...Object.keys(THEMES)]};
})();
