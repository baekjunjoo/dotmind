/* ================= trial engine ================= */
const $=id=>document.getElementById(id);
let cur=null,autoNextT=null;
function cleanup(){if(autoNextT){clearTimeout(autoNextT);autoNextT=null;}
  if(cur){cur.timers?.forEach(t=>clearTimeout(t));if(cur.tick)clearInterval(cur.tick);if(cur.cd)clearInterval(cur.cd);}
  $('dpad').style.display='none';$('optRow').innerHTML='';$('feed').textContent='';$('feed').className='feed';$('timer').textContent='';$('resultBox').hidden=true;}
function startTask(t){cleanup();idleStop();
  cur={task:t,trial:0,n:t.maze?1:3,res:[],timers:[]};
  $('trainerTitle').textContent=t.name;
  $('trainerDom').innerHTML=`${DOMS[t.dom].label} · ${t.maze?'1 run':'3 trials'}<br><span class="simtag">live measurement</span>`;
  $('btnQuit').hidden=false;
  document.getElementById('trainer').scrollIntoView({behavior:'smooth',block:'start'});
  nextTrial();}
function tdotsRender(){const el=$('tdots');el.innerHTML='';
  for(let i=0;i<cur.n;i++){const d=document.createElement('i');
    if(i<cur.res.length)d.className=cur.res[i].ok?'hit':'miss';
    else if(i===cur.trial-1)d.className='cur';
    el.appendChild(d);}}
function nextTrial(){
  if(!cur)return;
  if(cur.trial>=cur.n)return finishTask();
  cur.trial++;$('trialLab').textContent=(cur.task.maze?'Run':'Trial')+` ${cur.trial} of ${cur.n}`;tdotsRender();
  $('feed').textContent='';$('feed').className='feed';
  const spec=cur.task.gen();cur.spec=spec;
  setBraille(spec.brl||'');
  if(spec.maze){cur.t0=performance.now();drawMaze(spec);
    $('qText').textContent=spec.q;say(spec.say||spec.q);
    $('optRow').innerHTML='';$('dpad').style.display='grid';startTimer();return;}
  $('dpad').style.display='none';
  if(spec.phases){runPhases(spec,0);}else{clearFB();spec.draw();requestPaint();ask(spec);}}
function runPhases(spec,k){
  if(k>=spec.phases.length){clearFB();(spec.qdraw||(()=>{}))();requestPaint();ask(spec);return;}
  const ph=spec.phases[k];clearFB();ph.draw();requestPaint();
  $('optRow').innerHTML='';
  let remain=Math.round(ph.ms/1000);
  $('qText').textContent=ph.label+` (${remain}s)`;
  if(ph.say)say(ph.say);
  cur.cd=setInterval(()=>{remain--;if(remain>=0)$('qText').textContent=ph.label+` (${remain}s)`;},1000);
  cur.timers.push(setTimeout(()=>{clearInterval(cur.cd);runPhases(spec,k+1);},ph.ms));}
function startTimer(){cur.t0=performance.now();
  cur.tick=setInterval(()=>{$('timer').textContent=((performance.now()-cur.t0)/1000).toFixed(1)+'s';},100);}
function ask(spec){
  $('qText').textContent=spec.q;
  let sp=spec.say||spec.q;
  const plain=spec.opts.every((o,i)=>o===String(i+1));
  if(plain)sp+=' Choose a position from one to four.';
  else sp+=' '+spec.opts.map((o,i)=>'Option '+(i+1)+': '+String(o).replace(/→/g,', then ')+'.').join(' ');
  say(sp);
  const row=$('optRow');row.innerHTML='';
  spec.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='opt';
    b.innerHTML=`<b>${i+1}</b><span>${o}</span>`;b.addEventListener('click',()=>answer(i));row.appendChild(b);});
  cur.awaiting=true;startTimer();}
function answer(i){
  if(!cur||!cur.awaiting)return;cur.awaiting=false;clearInterval(cur.tick);
  const spec=cur.spec,rt=(performance.now()-cur.t0)/1000,ok=i===spec.correct;
  [...$('optRow').children].forEach((b,k)=>{if(k===spec.correct)b.classList.add('correct');else if(k===i&&!ok)b.classList.add('wrong');b.disabled=true;});
  cur.res.push({ok,rt});tdotsRender();
  const f=$('feed');f.textContent=ok?`Correct · ${rt.toFixed(1)}s`:`Not quite — it was “${spec.opts[spec.correct]}” · ${rt.toFixed(1)}s`;
  f.className='feed '+(ok?'ok':'no');say(ok?'Correct!':'Not quite.');
  cur.timers.push(setTimeout(nextTrial,1600));}
function mazeDone(s){clearInterval(cur.tick);
  const rt=(performance.now()-cur.t0)/1000;
  const eff=Math.min(1,s.optimal/Math.max(1,s.moves));
  cur.res.push({ok:true,rt,moves:s.moves,optimal:s.optimal,eff});
  $('dpad').style.display='none';tdotsRender();
  const f=$('feed');f.textContent=`Escaped! ${s.moves} moves (optimal ${s.optimal}) · ${rt.toFixed(1)}s`;f.className='feed ok';
  say('You escaped the maze. Well done.');
  cur.timers.push(setTimeout(finishTask,1200));}
function finishTask(){
  const t=cur.task,res=cur.res;
  let score,detail;
  const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.floor(s.length/2)];};
  if(t.maze&&res.length){const r=res[0];score=Math.round(r.eff*100);
    detail=`${r.moves} moves · optimal ${r.optimal} · ${r.rt.toFixed(1)}s`;}
  else{const hits=res.filter(r=>r.ok).length;score=Math.round(hits/res.length*100);
    detail=`${hits}/${res.length} correct · median ${med(res.map(r=>r.rt)).toFixed(1)}s`;}
  $('resultBox').hidden=false;
  $('resultBox').innerHTML=`<div class="resultcard"><b class="big">★ ${score}</b> &nbsp;${t.name} — ${detail}<br>
   <span style="color:var(--mut);font-size:12.5px">Plotted on the recovery dashboard as “Today”. On the full program this feeds the weekly curve.</span></div>`;
  liveStars.push({score,k:liveStars.length});drawChart();
  const log=$('liveLog');if(log.querySelector('.empty'))log.innerHTML='';
  const li=document.createElement('li');
  li.innerHTML=`<span class="ok">★ ${score}</span><span>${t.name}</span><span class="t">${detail}</span>`;
  log.prepend(li);
  const card=$('tc-'+t.id);if(card)card.querySelector('.done').hidden=false;
  const idx=TASKS.indexOf(t),nxt=TASKS[(idx+1)%TASKS.length];
  $('qText').textContent=`Task complete — ★ ${score}. Next up: ${nxt.name} (starts automatically; “End task” stops the session).`;
  say(`Task complete. Your score: ${score}. Next task: ${nxt.name}.`);
  cur=null;
  autoNextT=setTimeout(()=>{autoNextT=null;startTask(nxt);},6000);}
$('btnQuit').addEventListener('click',()=>{cleanup();cur=null;
  $('trainerTitle').textContent='Pick a task to begin';$('trainerDom').innerHTML='';
  $('qText').textContent='Select any task card above. Each task runs three short trials; accuracy and response time are recorded and plotted on the recovery dashboard.';
  $('btnQuit').hidden=true;idleStart();});
document.querySelectorAll('#dpad button[data-mv]').forEach(b=>b.addEventListener('click',()=>{if(cur&&cur.spec&&cur.spec.maze)mazeMove(cur.spec,b.dataset.mv);}));
document.addEventListener('keydown',e=>{
  if(cur&&cur.spec&&cur.spec.maze){const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];
    if(m){e.preventDefault();mazeMove(cur.spec,m);return;}}
  if(cur&&cur.awaiting&&/^[1-5]$/.test(e.key)){const i=+e.key-1;if(i<cur.spec.opts.length)answer(i);}});
function onDeviceKey(k){
  if(cur&&cur.spec&&cur.spec.maze){const m={F1:'left',F2:'up',F3:'down',F4:'right',PanL:'left',PanR:'right'}[k];if(m)mazeMove(cur.spec,m);return;}
  if(cur&&cur.awaiting){const i={F1:0,F2:1,F3:2,F4:3}[k];if(i!=null&&i<cur.spec.opts.length)answer(i);}}

/* ================= idle animation (breathing sun) ================= */
let idleT=null,idlePhase=0;
function idleFrame(){clearFB();const cx=30,cy=20;C(cx,cy,7);DISC(cx,cy,2);
  const rr=idlePhase%2?15:12;
  for(let k=0;k<8;k++){const a=(k*45+(idlePhase%2?22:0))*Math.PI/180;
    L(cx+10*Math.cos(a),cy+10*Math.sin(a),cx+rr*Math.cos(a),cy+rr*Math.sin(a));}
  requestPaint();}
function idleStart(){idleStop();setBraille('dot mind');idleFrame();
  idleT=setInterval(()=>{if(cur){idleStop();return;}idlePhase++;idleFrame();},1400);}
function idleStop(){if(idleT){clearInterval(idleT);idleT=null;}}

/* ================= ticker motion ================= */
setInterval(()=>{document.querySelectorAll('[data-tick]').forEach(el=>{
  const v=+el.dataset.tick + ri(1,9)*( el.dataset.tick>1000?8:1 );
  el.dataset.tick=v;el.classList.add('tick');
  setTimeout(()=>{el.textContent=v.toLocaleString('en-US');el.classList.remove('tick');},260);});},2600);

/* ================= interactive speckle background (AccessRadar-style particles) ================= */
(function(){
  const cnv=document.getElementById('bgdots');if(!cnv)return;
  const g=cnv.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W=0,H=0,dpr=1,pts=[],dark=false,greyRGB='40,36,30',exRGB='106,128,6';
  function colors(){
    const ink=(getComputedStyle(document.documentElement).getPropertyValue('--ink')||'#0c0a08').trim();
    dark=/^#[ef]/i.test(ink); /* light ink => dark theme */
    greyRGB=dark?'226,222,210':'40,36,30';
    exRGB=dark?'228,242,34':'106,128,6';
  }
  function build(){
    pts=[];
    const n=Math.round(Math.min(5200,Math.max(1600,(W*H)/240)));
    for(let i=0;i<n;i++)pts.push({
      x:Math.random()*W, y:Math.random()*H,
      s1:Math.random()*Math.PI*2, s2:.4+Math.random()*1.1,   /* per-dot drift phase/speed */
      sz:Math.random()<.8?0.9:1.5,
      fl:.35+Math.random()*.65,                               /* base flicker */
      exc:0});
  }
  function drawStatic(){g.clearRect(0,0,W,H);
    for(const p of pts){g.fillStyle='rgba('+greyRGB+','+(p.fl*.3)+')';g.fillRect(p.x,p.y,p.sz,p.sz);}}
  function resize(){dpr=Math.min(1.75,devicePixelRatio||1);W=innerWidth;H=innerHeight;
    cnv.width=W*dpr;cnv.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);colors();build();
    if(reduced)drawStatic();}
  const mx={x:-9999,y:-9999,tx:-9999,ty:-9999,on:false};
  addEventListener('pointermove',e=>{mx.tx=e.clientX;mx.ty=e.clientY;
    if(!mx.on){mx.x=mx.tx;mx.y=mx.ty;}mx.on=true;},{passive:true});
  document.addEventListener('pointerleave',()=>{mx.on=false;});
  const R=130,R2=R*R;
  let last=0;
  function frame(ts){
    if(!last)last=ts;const dt=Math.min(ts-last,50)/1000;last=ts;const t=ts/1000;
    mx.x+=(mx.tx-mx.x)*.2;mx.y+=(mx.ty-mx.y)*.2;
    g.clearRect(0,0,W,H);
    for(const p of pts){
      if(mx.on){const dx=p.x-mx.x,dy=p.y-mx.y,d2=dx*dx+dy*dy;
        if(d2<R2)p.exc=Math.max(p.exc,Math.pow(1-Math.sqrt(d2)/R,1.3));}
      p.exc*=(1-dt*1.6);                                     /* excitation decays like the sweep */
      const wx=Math.sin(t*p.s2+p.s1)*1.6, wy=Math.cos(t*p.s2*.8+p.s1*2)*1.6;
      const tw=.5+.5*Math.sin(t*2.4*p.s2+p.s1*3);            /* twinkle */
      const base=p.fl*(.16+.3*tw);
      const e=p.exc;
      let x=p.x+wx,y=p.y+wy;const s=p.sz+e*1.3;
      if(e>.02){const dx=x-mx.x,dy=y-mx.y,d=Math.max(14,Math.hypot(dx,dy));
        x+=dx/d*5*e;y+=dy/d*5*e;
        g.fillStyle='rgba('+exRGB+','+Math.min(base+e*.9,1)+')';}
      else g.fillStyle='rgba('+greyRGB+','+base+')';
      g.fillRect(x-s/2,y-s/2,s,s);}
    requestAnimationFrame(frame);
  }
  resize();addEventListener('resize',resize,{passive:true});
  const mq=matchMedia('(prefers-color-scheme: dark)');
  if(mq.addEventListener)mq.addEventListener('change',()=>{colors();if(reduced)drawStatic();});
  if(!reduced)requestAnimationFrame(frame);
})();

/* ================= init ================= */
buildTaskGrid();drawChart();drawDomBars();idleStart();
