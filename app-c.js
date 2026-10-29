/* ================= trial engine ================= */
const $=id=>document.getElementById(id);
let cur=null,autoNextT=null;
/* ---- adaptive difficulty: one variable per task, adjusted one step at a time ---- */
const ADAPT=new Set(['cal','trace','pairs','maze']);
const LVL={},STREAK={};
function adjustLvl(id,ok){if(!ADAPT.has(id))return;
  if(!ok){LVL[id]=Math.max(0,(LVL[id]??1)-1);STREAK[id]=0;}
  else{STREAK[id]=(STREAK[id]||0)+1;
    if(STREAK[id]>=2){LVL[id]=Math.min(2,(LVL[id]??1)+1);STREAK[id]=0;}}}
const sessionLog=[]; /* per-trial record for field-test export */

/* ---- learner profiles: per-person levels & history, persisted in localStorage ---- */
const LS_DB='dotmind_learners_v1',LS_CUR='dotmind_learner_cur';
let learner='Guest',sessStartLog=0,sessStartStars=0;
function lsLoad(){try{return JSON.parse(localStorage.getItem(LS_DB))||{};}catch(e){return{};}}
function saveLearner(){try{const db=lsLoad();
  db[learner]={lvl:{...LVL},streak:{...STREAK},log:sessionLog,stars:liveStars,saved:Date.now()};
  localStorage.setItem(LS_DB,JSON.stringify(db));localStorage.setItem(LS_CUR,learner);}catch(e){}}
function loadLearner(name){const db=lsLoad(),d=db[name]||{};learner=name;
  for(const k in LVL)delete LVL[k];Object.assign(LVL,d.lvl||{});
  for(const k in STREAK)delete STREAK[k];Object.assign(STREAK,d.streak||{});
  sessionLog.length=0;for(const x of d.log||[])sessionLog.push(x);
  liveStars.length=0;for(const x of d.stars||[])liveStars.push(x);
  sessStartLog=sessionLog.length;sessStartStars=liveStars.length;
  try{localStorage.setItem(LS_CUR,learner);}catch(e){}
  renderHistory();drawChart();}
function renderHistory(){const log=$('liveLog');log.innerHTML='';
  if(!liveStars.length){log.innerHTML='<li class="empty">Complete a task below — your score lands on this chart as ★ Today.</li>';return;}
  liveStars.slice(-6).reverse().forEach(st=>{const li=document.createElement('li');
    li.innerHTML=`<span class="ok">★ ${st.score}</span><span>${st.name||'Task'}</span><span class="t">${st.detail||''}</span>`;
    log.appendChild(li);});}
function refreshLearnerSel(){const sel=$('learnerSel');if(!sel)return;
  const names=Object.keys(lsLoad());if(!names.includes(learner))names.push(learner);
  sel.innerHTML=names.sort().map(n=>`<option value="${n.replace(/"/g,'&quot;')}"${n===learner?' selected':''}>${n}</option>`).join('')
    +'<option value="__add__">＋ Add learner…</option>';}
function initLearners(){
  let n='Guest';try{n=localStorage.getItem(LS_CUR)||'Guest';}catch(e){}
  loadLearner(n);saveLearner();refreshLearnerSel();
  $('learnerSel').addEventListener('change',()=>{const v=$('learnerSel').value;
    setPaused(false);
    if(cur){cleanup();cur=null;idleStart();$('btnQuit').hidden=true;
      $('trainerTitle').textContent='Pick a task to begin';$('trainerDom').innerHTML='';}
    if(v==='__add__'){const nm=(prompt('New learner name:')||'').trim();
      if(nm){saveLearner();loadLearner(nm);saveLearner();}}
    else{saveLearner();loadLearner(v);}
    refreshLearnerSel();DP.log('Learner: '+learner+' — levels and history loaded.');});}

/* ---- pause / resume: stops narration, response timer, exposure countdown, auto-advance ---- */
function setPaused(p){if(p===paused)return;paused=p;
  const b=$('btnPause');if(b){b.textContent=p?'▶ Resume':'⏸ Pause';b.classList.toggle('paused',p);}
  if(p){cancelSpeech();
    if(cur){
      if(cur.tick){clearInterval(cur.tick);cur.tick=null;}
      if(cur.timerOn)cur.pausedEl=performance.now()-cur.t0;
      if(cur.ph){clearTimeout(cur.ph.tmo);if(cur.cd){clearInterval(cur.cd);cur.cd=null;}
        cur.ph.remainMs=Math.max(0,cur.ph.remainMs-(performance.now()-cur.ph.started));}}
    if(autoNextT){clearTimeout(autoNextT);autoNextT=null;}
    $('voiceStatus').textContent='Paused — narration and timers are stopped.';
  }else{$('voiceStatus').textContent='';resumeFlow();}}
function resumeFlow(){
  if(cur&&cur.ph){phaseRun();return;}
  if(cur&&cur.timerOn&&cur.pausedEl!=null){cur.t0=performance.now()-cur.pausedEl;cur.pausedEl=null;
    cur.tick=setInterval(()=>{$('timer').textContent=((performance.now()-cur.t0)/1000).toFixed(1)+'s';},100);return;}
  if(cur&&!cur.timerOn&&(cur.awaiting||(cur.spec&&cur.spec.maze))){const curAt=cur,trialAt=cur.trial;
    say(lastSaid).then(()=>{if(cur===curAt&&cur.trial===trialAt&&!cur.timerOn)startTimer();});return;}
  if(!cur&&pendingNext){const n=pendingNext;
    autoNextT=setTimeout(()=>{autoNextT=null;pendingNext=null;startTask(n);},1500);}}
$('btnPause').addEventListener('click',()=>setPaused(!paused));
function cleanup(){if(autoNextT){clearTimeout(autoNextT);autoNextT=null;}pendingNext=null;
  if(cur){cur.timers?.forEach(t=>clearTimeout(t));if(cur.tick)clearInterval(cur.tick);if(cur.cd)clearInterval(cur.cd);if(cur.ph)clearTimeout(cur.ph.tmo);}
  $('dpad').style.display='none';$('optRow').innerHTML='';$('feed').textContent='';$('feed').className='feed';$('timer').textContent='';$('resultBox').hidden=true;}
function startTask(t){if(paused)setPaused(false);cleanup();idleStop();
  cur={task:t,trial:0,n:t.maze?2:6,res:[],timers:[]};
  $('trainerTitle').textContent=t.name;
  $('trainerDom').innerHTML=`${DOMS[t.dom].label} · ${t.maze?'2 runs':'6 trials'}<br><span class="simtag">live measurement</span>`;
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
  cur.trial++;cur.timerOn=false;cur.pausedEl=null;
  const adaptive=ADAPT.has(cur.task.id);
  cur.lvl=adaptive?(LVL[cur.task.id]??1):null;
  $('trialLab').textContent=(cur.task.maze?'Run':'Trial')+` ${cur.trial} of ${cur.n}`+(adaptive?` · Lv ${cur.lvl+1}`:'');
  tdotsRender();
  $('feed').textContent='';$('feed').className='feed';
  const spec=adaptive?cur.task.gen(cur.lvl):cur.task.gen();cur.spec=spec;
  setBraille(spec.brl||'');
  if(spec.maze){cur.t0=performance.now();drawMaze(spec);
    $('qText').textContent=spec.q;$('timer').textContent='';
    $('optRow').innerHTML='';$('dpad').style.display='grid';
    const curAt=cur; /* response timer starts once the instructions have been read aloud */
    say(spec.say||spec.q).then(()=>{if(cur===curAt&&cur.spec===spec)startTimer();});
    return;}
  $('dpad').style.display='none';
  if(spec.phases){runPhases(spec,0);}else{clearFB();spec.draw();requestPaint();ask(spec);}}
function runPhases(spec,k){
  if(k>=spec.phases.length){clearFB();(spec.qdraw||(()=>{}))();requestPaint();ask(spec);return;}
  const ph=spec.phases[k];clearFB();ph.draw();requestPaint();
  $('optRow').innerHTML='';
  cur.ph={spec,k,label:ph.label,remainMs:ph.ms}; /* pausable exposure countdown */
  if(ph.say)say(ph.say);
  phaseRun();}
function phaseRun(){const P=cur.ph;let remain=Math.ceil(P.remainMs/1000);
  $('qText').textContent=P.label+` (${remain}s)`;
  P.started=performance.now();
  cur.cd=setInterval(()=>{remain--;if(remain>=0)$('qText').textContent=P.label+` (${remain}s)`;},1000);
  P.tmo=setTimeout(()=>{clearInterval(cur.cd);cur.cd=null;const sp=P.spec,kk=P.k;cur.ph=null;runPhases(sp,kk+1);},P.remainMs);}
function startTimer(){cur.timerOn=true;cur.t0=performance.now();
  cur.tick=setInterval(()=>{$('timer').textContent=((performance.now()-cur.t0)/1000).toFixed(1)+'s';},100);}
function ask(spec){
  $('qText').textContent=spec.q;
  let sp=spec.say||spec.q;
  const plain=spec.opts.every((o,i)=>o===String(i+1));
  if(plain)sp+=' Choose a position from one to four.';
  else sp+=' '+spec.opts.map((o,i)=>'Option '+(i+1)+': '+String(o).replace(/→/g,', then ').replace(/\s*·\s*/g,', ')+'.').join(' ');
  const row=$('optRow');row.innerHTML='';
  spec.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='opt';
    b.innerHTML=`<b>${i+1}</b><span>${o}</span>`;b.addEventListener('click',()=>answer(i));row.appendChild(b);});
  cur.awaiting=true;
  /* response timer starts only after the question and options have been read aloud */
  cur.t0=performance.now();$('timer').textContent='';
  const trialAt=cur.trial,curAt=cur;
  say(sp).then(()=>{if(cur===curAt&&cur.awaiting&&cur.trial===trialAt)startTimer();});}
function answer(i){
  if(paused||!cur||!cur.awaiting)return;cur.awaiting=false;cur.timerOn=false;clearInterval(cur.tick);
  const spec=cur.spec,rt=(performance.now()-cur.t0)/1000,ok=i===spec.correct;
  [...$('optRow').children].forEach((b,k)=>{if(k===spec.correct)b.classList.add('correct');else if(k===i&&!ok)b.classList.add('wrong');b.disabled=true;});
  cur.res.push({ok,rt,lvl:cur.lvl});tdotsRender();
  sessionLog.push({task:cur.task.id,trial:cur.trial,lvl:cur.lvl,ok,rt:+rt.toFixed(2),ts:Date.now()});
  adjustLvl(cur.task.id,ok);saveLearner();
  const f=$('feed');f.textContent=ok?`Correct · ${rt.toFixed(1)}s`:`Not quite — it was “${spec.opts[spec.correct]}” · ${rt.toFixed(1)}s`;
  f.className='feed '+(ok?'ok':'no');say(ok?'Correct!':'Not quite.');
  cur.timers.push(setTimeout(nextTrial,1600));}
function mazeDone(s){cur.timerOn=false;clearInterval(cur.tick);
  const rt=(performance.now()-cur.t0)/1000;
  const eff=Math.min(1,s.optimal/Math.max(1,s.moves));
  cur.res.push({ok:true,rt,moves:s.moves,optimal:s.optimal,eff,lvl:cur.lvl});
  sessionLog.push({task:'maze',trial:cur.trial,lvl:cur.lvl,ok:true,rt:+rt.toFixed(2),moves:s.moves,optimal:s.optimal,bumps:s.bumps||0,ts:Date.now()});
  adjustLvl('maze',eff>=0.7);saveLearner();
  $('dpad').style.display='none';tdotsRender();
  const f=$('feed');f.textContent=`Escaped! ${s.moves} moves (optimal ${s.optimal}) · ${rt.toFixed(1)}s`;f.className='feed ok';
  say('You escaped the maze. Well done.');
  cur.timers.push(setTimeout(nextTrial,1200));}
function finishTask(){
  const t=cur.task,res=cur.res;
  let score,detail;
  const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.floor(s.length/2)];};
  if(t.maze&&res.length){const eff=res.reduce((a,r)=>a+r.eff,0)/res.length;score=Math.round(eff*100);
    detail=res.map(r=>`${r.moves} moves (opt ${r.optimal})`).join(' · ')+` · ${res.reduce((a,r)=>a+r.rt,0).toFixed(1)}s total`;}
  else{const hits=res.filter(r=>r.ok).length;score=Math.round(hits/res.length*100);
    detail=`${hits}/${res.length} correct · median ${med(res.map(r=>r.rt)).toFixed(1)}s`;}
  $('resultBox').hidden=false;
  $('resultBox').innerHTML=`<div class="resultcard"><b class="big">★ ${score}</b> &nbsp;${t.name} — ${detail}<br>
   <span style="color:var(--mut);font-size:12.5px">Plotted on the recovery dashboard as “Today”. On the full program this feeds the weekly curve.</span></div>`;
  liveStars.push({score,k:liveStars.length,name:t.name,detail,ts:Date.now()});drawChart();saveLearner();
  const log=$('liveLog');if(log.querySelector('.empty'))log.innerHTML='';
  const li=document.createElement('li');
  li.innerHTML=`<span class="ok">★ ${score}</span><span>${t.name}</span><span class="t">${detail}</span>`;
  log.prepend(li);
  const card=$('tc-'+t.id);if(card)card.querySelector('.done').hidden=false;
  const idx=TASKS.indexOf(t),nxt=TASKS[(idx+1)%TASKS.length];
  $('qText').textContent=`Task complete — ★ ${score}. Next up: ${nxt.name} (starts automatically; “End task” stops the session).`;
  say(`Task complete. Your score: ${score}. Next task: ${nxt.name}.`);
  cur=null;
  pendingNext=nxt;autoNextT=setTimeout(()=>{autoNextT=null;pendingNext=null;startTask(nxt);},6000);}
$('btnQuit').addEventListener('click',()=>{setPaused(false);cleanup();cur=null;
  $('trainerTitle').textContent='Pick a task to begin';$('trainerDom').innerHTML='';
  const sLog=sessionLog.slice(sessStartLog);
  if(sLog.length){ /* spoken end-of-session summary — this session only */
    const n=sLog.length,hits=sLog.filter(r=>r.ok).length,tasksDone=liveStars.length-sessStartStars;
    const sum=`Session finished. Today you completed ${tasksDone} task${tasksDone===1?'':'s'} and ${n} trial${n===1?'':'s'} — ${hits} correct. Well done.`;
    $('qText').textContent=sum+' You can export this session’s data from the dashboard above.';
    say(sum);
    sessStartLog=sessionLog.length;sessStartStars=liveStars.length;
  }else{
    $('qText').textContent='Select any task card above. Each task runs six short trials; accuracy and response time are recorded and plotted on the recovery dashboard.';
  }
  $('btnQuit').hidden=true;idleStart();});
document.getElementById('btnExport').addEventListener('click',()=>{
  const payload={app:'Dot Mind Trainer',learner,exported:new Date().toISOString(),trials:sessionLog.length,data:sessionLog};
  const blob=new Blob([JSON.stringify(payload,null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='dotmind-'+learner.replace(/[^\w-]+/g,'_')+'-'+new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')+'.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  DP.log('Session data exported ('+sessionLog.length+' trials).');});
document.querySelectorAll('#dpad button[data-mv]').forEach(b=>b.addEventListener('click',()=>{if(cur&&cur.spec&&cur.spec.maze)mazeMove(cur.spec,b.dataset.mv);}));
document.addEventListener('keydown',e=>{
  if((e.key==='p'||e.key==='P')&&!e.repeat&&e.target.tagName!=='SELECT'&&e.target.tagName!=='INPUT'){setPaused(!paused);return;}
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

/* ================= interactive speckle background (AccessRadar-style particles) ================= */
(function(){
  const cnv=document.getElementById('bgdots');if(!cnv)return;
  const g=cnv.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W=0,H=0,dpr=1,pts=[],dark=false,greyRGB='40,36,30',exRGB='106,128,6',greyCache=[],exCache=[];
  function colors(){
    const ink=(getComputedStyle(document.documentElement).getPropertyValue('--ink')||'#0c0a08').trim();
    dark=/^#[ef]/i.test(ink); /* light ink => dark theme */
    greyRGB=dark?'226,222,210':'40,36,30';
    exRGB=dark?'228,242,34':'106,128,6';
    greyCache=[];exCache=[]; /* pre-built fill styles — no per-particle string allocation each frame */
    for(let i=0;i<=24;i++){const a=(i/24).toFixed(3);greyCache.push('rgba('+greyRGB+','+a+')');exCache.push('rgba('+exRGB+','+a+')');}
  }
  function build(){
    pts=[];
    const n=Math.round(Math.min(2600,Math.max(1200,(W*H)/420)));
    for(let i=0;i<n;i++)pts.push({
      x:Math.random()*W, y:Math.random()*H,
      s1:Math.random()*Math.PI*2, s2:.4+Math.random()*1.1,   /* per-dot drift phase/speed */
      sz:Math.random()<.8?0.9:1.5,
      fl:.35+Math.random()*.65,                               /* base flicker */
      exc:0});
  }
  function drawStatic(){g.clearRect(0,0,W,H);
    for(const p of pts){g.fillStyle=greyCache[Math.min(24,(p.fl*.3*24)|0)];g.fillRect(p.x,p.y,p.sz,p.sz);}}
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
        g.fillStyle=exCache[Math.min(24,(Math.min(base+e*.9,1)*24)|0)];}
      else g.fillStyle=greyCache[Math.min(24,(base*24)|0)];
      g.fillRect(x-s/2,y-s/2,s,s);}
    requestAnimationFrame(frame);
  }
  resize();addEventListener('resize',resize,{passive:true});
  const mq=matchMedia('(prefers-color-scheme: dark)');
  if(mq.addEventListener)mq.addEventListener('change',()=>{colors();if(reduced)drawStatic();});
  if(!reduced)requestAnimationFrame(frame);
})();

/* ================= init ================= */
initLearners();buildTaskGrid();drawDomBars();idleStart();
