"""Arma el juego a partir de src/:  npm install && python3 build.py
Genera dist/tonalli.html (un solo archivo) e index.html (con config.js para GitHub Pages)."""
import re,os,subprocess,json
S='src/';rd=lambda f:open(S+f,encoding='utf-8').read()
s=rd('hd2d.html');ui=rd('ui.html')
spr=rd('sprites.js')+'\n'+rd('beastart.js')+'\n'+rd('heroart.js')
game=rd('gamecode.js')+'\n'+rd('net.js')+'\n'+rd('help.js')
script=s[s.index('<script type="module">'):s.index('</script>',s.index('<script type="module">'))+len('</script>')]
a=script.index("/* sprites billboard */\n")+len("/* sprites billboard */\n");b=script.index("function makeBillboard(")
script=script[:a]+rd('audio.js')+"\n"+spr+"\nconst billboards=[];\n"+script[b:]
a=script.index("const rings=[];");b=script.index("showMoves();",a)+len("showMoves();");script=script[:a]+script[b:]
script=re.sub(r"document\.getElementById\('bQ'\)\.onclick=.*\n","",script)
script=re.sub(r"document\.getElementById\('bRot'\)\.onclick=.*\n","",script)
a=script.index("/* interacción */");b=script.index("/* bucle */");script=script[:a]+game+rd('handler.js')+script[b:]
a=script.index(" if(hop){");END=" controls.update();composer.render();requestAnimationFrame(tick);";b=script.index(END)
script=script[:a]+rd('loop.js')+script[b+len(END):]
script=script.replace("document.getElementById('load').remove();tick();","controls.autoRotate=true;controls.autoRotateSpeed=.5;document.fonts&&document.fonts.load('14px \"Press Start 2P\"').catch(()=>{});document.getElementById('load').remove();tick();")
out=ui+"\n"+script+"\n</body>\n</html>\n"
os.makedirs('dist',exist_ok=True)
a=out.index('<script type="module">')+len('<script type="module">');b=out.index('</script>',a)
js=out[a:b].replace("from 'three/addons/","from 'three/examples/jsm/")
pre=rd('entry-prelude.js');pre=pre[pre.index('function showFail'):pre.index("throw new Error('sin WebGL')}})();")+len("throw new Error('sin WebGL')}})();")]
lines=js.split('\n');imp=[l for l in lines if l.startswith('import ')];rest=[l for l in lines if not l.startswith('import ')]
open('dist/entry.js','w',encoding='utf-8').write('\n'.join(imp)+'\n'+pre+'\n'+'\n'.join(rest))
subprocess.run(['npx','esbuild','dist/entry.js','--bundle','--minify','--format=iife','--outfile=dist/out.js','--log-level=warning'],check=True)
h=re.sub(r'<script type="importmap">.*?</script>\n','',out,flags=re.S)
a=h.index('<script type="module">');b=h.index('</script>',a)+len('</script>')
h=h[:a]+'<script>\n'+open('dist/out.js',encoding='utf-8').read()+'\n</script>'+h[b:]
open('dist/tonalli.html','w',encoding='utf-8').write(h)
cfg=open('config.js',encoding='utf-8').read().replace('window.TONALLI_FIREBASE =','window.TONALLI_FIREBASE_DEFAULT =')
i=h.index('<head>')+len('<head>')
open('index.html','w',encoding='utf-8').write(h[:i]+'\n<script src="config.js"></script>\n<script>'+cfg+'</script>\n'+h[i:])
print('OK: index.html y dist/tonalli.html')
