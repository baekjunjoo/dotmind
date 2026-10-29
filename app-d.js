/* ================= AliveDot — tactile motion: playable animal animations =================
   Tactile graphics are usually frozen frames. Here each animal is an 8-frame loop the
   learner can play, or hold and study frame by frame — on screen and on the DotPad. */
const MOTIONS=[
{id:'fish',icon:'🐟',name:'Fish',frames:8,brl:'fish',
 desc:'Swims across the pad, flicking its tail up and down.',
 q:'A fish glides from left to right; its tail flicks up and down as it swims. Dots along the bottom are the sea floor.',
 say:'A fish swims from left to right across the pad, flicking its tail.',
 draw(f){const cx=10+f*5,cy=20,tf=(f%2?3:-3);
   ELLIPSE(cx,cy,7,4);P(cx+4,cy-1);                                   /* body + eye */
   L(cx-6,cy-2,cx-11,cy-4+tf);L(cx-6,cy+2,cx-11,cy+4+tf);VL(cx-11,cy-4+tf,cy+4+tf); /* tail */
   L(cx,cy-4,cx+2,cy-7);L(cx+2,cy-7,cx+4,cy-4);                       /* dorsal fin */
   P(cx+9,cy-5);P(cx+11,cy-8);                                        /* bubbles */
   for(let x=2;x<58;x+=4)P(x,36);                                     /* sea floor */
 }},
{id:'bird',icon:'🐦',name:'Bird',frames:8,brl:'bird',
 desc:'Beats its wings up and down as it crosses the sky.',
 q:'A bird flies from left to right; feel the wings rise and fall with each frame. Dots far below are the ground.',
 say:'A bird flies from left to right, beating its wings up and down.',
 draw(f){const cx=9+f*6,cy=15,w=[-7,-4,0,4,7,4,0,-4][f];
   ELLIPSE(cx,cy,5,3);DISC(cx+5,cy-2,1);L(cx+6,cy-2,cx+9,cy-1);       /* body, head, beak */
   L(cx-5,cy,cx-9,cy+2);                                              /* tail */
   L(cx-1,cy-1,cx-7,cy+w,1);L(cx+1,cy-1,cx+6,cy+w,1);                 /* wings */
   for(let x=4;x<58;x+=6)P(x,36);                                     /* ground */
 }},
{id:'frog',icon:'🐸',name:'Frog',frames:8,brl:'frog',
 desc:'Crouches, leaps through an arc, and lands.',
 q:'Follow the frog along the ground line: it crouches, takes off, stretches through the air, and lands to the right.',
 say:'A frog crouches, leaps through the air, and lands further to the right.',
 draw(f){HL(2,58,33);                                                 /* ground */
   const K=[[9,29,0],[9,30,1],[17,24,2],[26,20,2],[35,24,2],[43,29,3],[47,29,0],[47,30,1]][f],
     x=K[0],y=K[1],pose=K[2];
   ELLIPSE(x,y,5,3);C(x-2,y-4,1);C(x+2,y-4,1);                        /* body + eye bumps */
   if(pose===0){L(x-4,y+2,x-6,y+4);L(x+4,y+2,x+6,y+4);}               /* sitting */
   if(pose===1){L(x-4,y+2,x-7,y+3);L(x+4,y+2,x+7,y+3);}               /* crouched */
   if(pose===2){L(x-4,y+2,x-9,y+6,1);L(x+4,y+1,x+9,y-2);}             /* stretched in air */
   if(pose===3){L(x-4,y+2,x-7,y+4);L(x+4,y+2,x+8,y+2);}               /* landing */
 }},
{id:'rabbit',icon:'🐰',name:'Rabbit',frames:8,brl:'rabbit',
 desc:'Hops along the ground; its ears tilt back mid-air.',
 q:'A rabbit hops from left to right along the ground line — crouch, spring, stretch, land. Its tall ears tilt back in the air.',
 say:'A rabbit hops from left to right. Its ears tilt back while it is in the air.',
 draw(f){HL(2,58,34);
   const K=[[10,30,0],[10,31,1],[18,26,2],[26,23,2],[34,26,2],[41,30,3],[46,30,0],[46,31,1]][f],
     x=K[0],y=K[1],pose=K[2],eb=pose===2?3:0;
   ELLIPSE(x,y,6,4);DISC(x+6,y-3,2);                                  /* body + head */
   L(x+5,y-5,x+3-eb,y-11);L(x+7,y-5,x+6-eb,y-11);                     /* ears */
   P(x-6,y-1);                                                        /* tail */
   if(pose===2){L(x-4,y+3,x-9,y+6);L(x+3,y+3,x+8,y+5);}               /* legs stretched */
   else{L(x-3,y+3,x-5,y+5);L(x+3,y+3,x+5,y+5);}
 }},
{id:'dolphin',icon:'🐬',name:'Dolphin',frames:8,brl:'dolphin',
 desc:'Arcs out of the water and dives back in.',
 q:'A dolphin breaks the wavy surface line, arcs through the air from left to right, and dives back under — feel the splash dots where it enters.',
 say:'A dolphin leaps out of the water in an arc, then dives back in with a splash.',
 draw(f){for(let x=2;x<58;x+=3)P(x,30);P(5,31);P(29,31);P(53,31);     /* water surface */
   if(f===7){TRI(30,28,2);P(24,29);P(36,29);return;}                  /* under water: fin + ripples */
   const K=[[8,30,-2],[14,24,-2],[22,17,-1],[30,14,0],[38,17,1],[46,24,2],[52,30,2]][f],
     x=K[0],y=K[1],tilt=K[2];
   ELLIPSE(x,y,7,3);                                                  /* body */
   L(x-2,y-3,x,y-6);L(x,y-6,x+2,y-3);                                 /* dorsal fin */
   L(x+6,y,x+10,y+tilt);                                              /* nose */
   L(x-7,y,x-10,y-3);L(x-7,y,x-10,y+3);                               /* tail fluke */
   if(f===0||f===6){P(x-3,32);P(x+3,32);P(x,33);}                     /* splash */
 }},
];
let mot=null,motT=null;
function motDraw(){if(!mot)return;clearFB();mot.m.draw(mot.f);requestPaint();
  const lab=$('motLab');if(lab)lab.textContent='Frame '+(mot.f+1)+' / '+mot.m.frames;}
function motStep(d){if(!mot)return;if(mot.playing)motPlay(false);
  mot.f=(mot.f+d+mot.m.frames)%mot.m.frames;motDraw();sayCue('Frame '+(mot.f+1)+'.');}
function motPlay(p){if(!mot)return;mot.playing=p;
  const b=$('btnMotPlay');if(b)b.textContent=p?'⏸ Pause':'▶ Play';
  if(motT){clearInterval(motT);motT=null;}
  if(p)motT=setInterval(()=>{if(paused||!mot)return;mot.f=(mot.f+1)%mot.m.frames;motDraw();},700);}
function stopMotion(reset){if(motT){clearInterval(motT);motT=null;}
  const c=$('motCtrl');if(c)c.hidden=true;
  if(!mot)return;mot=null;
  if(reset){idleStart();$('trainerTitle').textContent='Pick a task to begin';$('trainerDom').innerHTML='';
    $('trialLab').textContent='Trial — of —';
    $('qText').textContent='Select any task card above. Each task runs six short trials; accuracy and response time are recorded and plotted on the recovery dashboard.';}}
function startMotion(m){if(paused)setPaused(false);
  if(cur){cleanup();cur=null;$('btnQuit').hidden=true;}
  stopMotion(false);idleStop();
  mot={m,f:0,playing:false};
  $('trainerTitle').textContent=m.name+' — tactile motion';
  $('trainerDom').innerHTML='AliveDot · '+m.frames+' frames<br><span class="simtag">play, or step frame by frame</span>';
  $('trialLab').textContent='Motion';$('tdots').innerHTML='';$('timer').textContent='';
  $('qText').textContent=m.q;$('optRow').innerHTML='';$('dpad').style.display='none';
  $('feed').textContent='';$('feed').className='feed';$('resultBox').hidden=true;
  const c=$('motCtrl');if(c)c.hidden=false;
  setBraille(m.brl);motDraw();
  document.getElementById('trainer').scrollIntoView({behavior:'smooth',block:'start'});
  const at=mot; /* auto-play once the description has been read aloud */
  say(m.say+' On the DotPad: F1 previous frame, F2 play or pause, F3 next frame.')
    .then(()=>{if(mot===at&&mot&&!mot.playing)motPlay(true);});}
/* pin-art thumbnails rendered at runtime from each animal's key frame (no embedded images) */
const MOT_KEYF={fish:1,bird:4,frog:2,rabbit:2,dolphin:3};
function motThumb(m){const save=fb.slice();clearFB();m.draw(MOT_KEYF[m.id]??0);
  const c=document.createElement('canvas');c.width=640;c.height=438;const g=c.getContext('2d');
  const ox=22,oy=14,pitch=10,TAU=6.2832;
  g.fillStyle='rgba(255,255,255,0.11)';g.beginPath();
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!fb[y*W+x]){const px=ox+x*pitch,py=oy+y*pitch;g.moveTo(px+2.1,py);g.arc(px,py,2.1,0,TAU);}
  g.fill();
  g.fillStyle='#e4f222';g.shadowColor='rgba(228,242,34,.8)';g.shadowBlur=7;g.beginPath();
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(fb[y*W+x]){const px=ox+x*pitch,py=oy+y*pitch;g.moveTo(px+3.6,py);g.arc(px,py,3.6,0,TAU);}
  g.fill();g.shadowBlur=0;
  fb.set(save);
  try{return c.toDataURL('image/webp',0.72);}catch(e){return c.toDataURL();}}
/* animal cards — appended to the task grid as their own domain group */
(function(){const host=document.getElementById('taskGrid');if(!host)return;
  const g=document.createElement('div');g.className='domgroup';
  g.innerHTML=`<h3><span class="domchip">Tactile motion</span><span class="stagechip">play & frame-by-frame observation · AliveDot</span></h3>`;
  const row=document.createElement('div');row.className='grid g3';
  MOTIONS.forEach(m=>{const b=document.createElement('button');b.className='taskcard';b.id='mc-'+m.id;
    b.innerHTML=`<span class="arrow">↗</span><b>${m.name}</b><span>${m.desc}</span><span class="minipad"><img class="thumb" alt="" loading="lazy"></span>`;
    b.querySelector('.thumb').src=motThumb(m);
    b.addEventListener('click',()=>startMotion(m));row.appendChild(b);});
  g.appendChild(row);host.appendChild(g);})();
/* controls */
$('btnMotPrev').addEventListener('click',()=>motStep(-1));
$('btnMotNext').addEventListener('click',()=>motStep(1));
$('btnMotPlay').addEventListener('click',()=>{if(mot)motPlay(!mot.playing);});
$('btnMotClose').addEventListener('click',()=>{stopMotion(true);});
/* DotPad keys while a motion is open: F1 prev · F2 play/pause · F3 next (panning keys step too) */
const _odkMotion=onDeviceKey;
onDeviceKey=function(k){
  if(mot){if(k==='F1'||k==='PanL')motStep(-1);
    else if(k==='F2')motPlay(!mot.playing);
    else if(k==='F3'||k==='PanR')motStep(1);
    return;}
  _odkMotion(k);};
/* starting a task closes any open motion */
const _stMotion=startTask;
startTask=function(t){stopMotion(false);_stMotion(t);};
document.addEventListener('keydown',e=>{if(!mot)return;
  if(e.key==='ArrowLeft'){e.preventDefault();motStep(-1);}
  else if(e.key==='ArrowRight'){e.preventDefault();motStep(1);}
  else if(e.key===' '){e.preventDefault();motPlay(!mot.playing);}});
