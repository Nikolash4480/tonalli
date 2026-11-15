/* ================= información al pasar el cursor o tocar ================= */
(()=>{const tip=()=>document.getElementById('tip');let tmr=null,hideT=null,supp=false;
 const tgt=e=>{const el=e.target&&e.target.closest&&e.target.closest('[data-tip],[title]');if(!el)return null;if(el.title){el.dataset.tip=el.title;el.removeAttribute('title')}return el.dataset.tip?el:null};
 const show=el=>{const t=tip();if(!t)return;const s=el.dataset.tip;const i=s.indexOf(': ');t.innerHTML=i>0?`<b>${s.slice(0,i)}</b><br>${s.slice(i+2)}`:`<b>${s}</b>`;t.classList.remove('hidden');
  const r=el.getBoundingClientRect(),w=t.offsetWidth,h=t.offsetHeight;let x=Math.min(innerWidth-w-6,Math.max(6,r.left+r.width/2-w/2)),y=r.top-h-8;if(y<6)y=r.bottom+8;t.style.left=x+'px';t.style.top=y+'px';clearTimeout(hideT)};
 const hide=()=>{const t=tip();t&&t.classList.add('hidden')};
 document.addEventListener('mouseover',e=>{if(e.pointerType==='touch')return;const el=tgt(e);el?show(el):hide()});
 document.addEventListener('touchstart',e=>{const el=tgt(e);clearTimeout(tmr);if(!el){hide();return}
  if(el.closest('button')){supp=false;tmr=setTimeout(()=>{supp=true;show(el);hideT=setTimeout(hide,2600)},450)}
  else{show(el);hideT=setTimeout(hide,2600)}},{passive:true});
 document.addEventListener('touchend',()=>clearTimeout(tmr),{passive:true});
 document.addEventListener('touchmove',()=>clearTimeout(tmr),{passive:true});
 document.addEventListener('click',e=>{if(supp){supp=false;e.stopPropagation();e.preventDefault()}},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('[data-tip]'))e.preventDefault()});
})();
