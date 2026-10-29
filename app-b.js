/* ================= curriculum data ================= */
const STAGENAME=['Sensation','Perception','Cognition','Function'];
const SESS=[
 {n:1,t:'Opening the world by touch',d:'Device familiarisation and orientation: graphic area vs braille line, two-handed scanning technique; read the tactile clock and today’s weather icon.',tags:['Orientation','Tactile basics'],st:1},
 {n:2,t:'Find the hidden shape',d:'Selective attention: compare line textures, trace tangled lines end to end, spot the odd shape hiding among equals.',tags:['Attention'],st:1},
 {n:3,t:'Drawing a mental map',d:'Spatial representation: corner-to-corner pointing games, 3×3 grid positions, a simplified floor plan of the trainee’s own room.',tags:['Tactile-spatial'],st:2},
 {n:4,t:'Memory at the fingertips',d:'Tactile working memory: feel a layout for ten seconds, then recall what moved — a tactile Kim’s Game and matching pairs.',tags:['Memory','Attention'],st:2},
 {n:5,t:'Pieces and rotations',d:'Constructive ability: tactile tangram, mental rotation of felt shapes, completing symmetric figures.',tags:['Tactile-spatial','Executive'],st:2},
 {n:6,t:'Rules and codes',d:'Logical reasoning: shape sequences, 4×4 tactile sudoku, braille-to-graphic word–picture matching.',tags:['Executive','Memory'],st:3},
 {n:7,t:'Route planning',d:'Complex problem solving: staged maze escape, then planning the shortest route home → pharmacy → park on a tactile map.',tags:['Executive','Tactile-spatial'],st:3},
 {n:8,t:'My tactile canvas',d:'Integration and reminiscence: draw a remembered object or face in the companion app and explore it together on the DotPad.',tags:['Integration','Reminiscence'],st:4},
];
document.getElementById('sessGrid').innerHTML=SESS.map(s=>
 `<div class="sess"><div class="shead"><span class="snum">Session ${s.n} · Stage ${s.st} ${STAGENAME[s.st-1]}</span></div>
  <b>${s.t}</b><p>${s.d}</p><div class="tags">${s.tags.map(x=>`<i>${x}</i>`).join('')}</div></div>`).join('');

/* ================= 15 tasks ================= */
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function optsAround(v,min,max,n=4){const set=new Set([v]);while(set.size<n){const c=ri(min,max);set.add(c);}  const a=shuffle([...set]);return {opts:a.map(String),correct:a.indexOf(v)};}
function optsFrom(list,correctVal,n=4){const others=shuffle(list.filter(x=>x!==correctVal)).slice(0,n-1);const a=shuffle([correctVal,...others]);return {opts:a,correct:a.indexOf(correctVal)};}

const TASKS=[
/* ---- Orientation ---- */
{id:'cal',dom:'orientation',name:'Tactile calendar',desc:'Find today on a raised month grid and name its weekday.',gen(lvl=1){
  const col=ri(0,6),row=ri(0,4);
  const nDis=[0,2,4][lvl]||0; /* adaptive variable: distractor outline marks */
  const dis=shuffle(Array.from({length:35},(_,i)=>i).filter(i=>i!==row*7+col)).slice(0,nDis);
  const draw=()=>{for(let c=0;c<=7;c++)VL(2+c*8,4,38);for(let r=0;r<=5;r++)HL(2,58,4+r*7);FR(2+col*8+2,4+row*7+2,5,4);
    for(const d of dis)C(2+(d%7)*8+4,4+Math.floor(d/7)*7+3,2);};
  const o=optsFrom(DAYS,DAYS[col],4);
  return {draw,q:'A calendar grid — Monday is the left column. Which weekday column holds the raised “today” mark?',...o,brl:'calendar',say:'Feel the calendar grid. Which weekday holds the raised mark?'};}},
{id:'clock',dom:'orientation',name:'Tactile analog clock',desc:'Read the hour and minute hands by touch.',gen(){
  const times=[[3,0],[6,0],[9,0],[10,0],[1,30],[4,30],[7,30],[2,0]];const [h,m]=pick(times);
  const draw=()=>{const cx=30,cy=20,r=16;C(cx,cy,r);
    for(let k=0;k<12;k++){const a=k*30*Math.PI/180;P(cx+(r-2)*Math.sin(a),cy-(r-2)*Math.cos(a));}
    const ha=((h%12)*30+m*0.5)*Math.PI/180, ma=m*6*Math.PI/180;
    L(cx,cy,cx+8*Math.sin(ha),cy-8*Math.cos(ha),1);L(cx,cy,cx+13*Math.sin(ma),cy-13*Math.cos(ma));};
  const fmt=(h,m)=>h+':'+String(m).padStart(2,'0');
  const pool=times.map(t=>fmt(t[0],t[1]));
  const o=optsFrom([...new Set(pool)],fmt(h,m),4);
  return {draw,q:'A tactile analog clock — the short hand is thicker. What time does it show?',...o,brl:'clock',say:'Feel the clock face. What time is it showing?'};}},
{id:'season',dom:'orientation',name:'Season symbols',desc:'Match a tactile pictogram to its season.',gen(){
  const kinds=[
   ['Summer',()=>{C(30,19,7);for(let k=0;k<8;k++){const a=k*45*Math.PI/180;L(30+10*Math.cos(a),19+10*Math.sin(a),30+15*Math.cos(a),19+15*Math.sin(a));}}],
   ['Winter',()=>{for(let k=0;k<3;k++){const a=k*60*Math.PI/180;L(30-13*Math.cos(a),20-13*Math.sin(a),30+13*Math.cos(a),20+13*Math.sin(a));}C(30,20,4);}],
   ['Autumn',()=>{DIAMOND(30,18,10);VL(30,10,28);L(30,28,30,34,1);L(26,31,34,31);}],
   ['Spring',()=>{DISC(30,20,3);C(30,11,4);C(30,29,4);C(21,20,4);C(39,20,4);}]];
  const k=pick(kinds);
  const o=optsFrom(['Spring','Summer','Autumn','Winter'],k[0],4);
  return {draw:k[1],q:'One tactile pictogram, centred. Which season does it stand for?',...o,brl:'season',say:'Which season does this tactile symbol stand for?'};}},
/* ---- Attention ---- */
{id:'odd',dom:'attention',name:'Odd one out',desc:'Scan four shapes and find the one that differs.',gen(){
  const odd=ri(0,3),oddShape=pick(['square','triangle']),xs=[7,21,35,49];
  const draw=()=>{xs.forEach((x,i)=>{if(i===odd)drawShapeAt(oddShape,x+2,20,4);else C(x+2,20,4);});};
  return {draw,q:'Four shapes in a row. Which position (1–4, left to right) feels different?',opts:['1','2','3','4'],correct:odd,brl:'odd one out',say:'Four shapes in a row. Which one feels different?'};}},
{id:'trace',dom:'attention',name:'Line tracing',desc:'Follow a tangled line from its start to the right endpoint.',gen(lvl=1){
  const ys=[6,15,24,33];
  let perm; /* adaptive variable: entanglement */
  if(lvl===0){perm=[0,1,2,3];const k=ri(0,2);[perm[k],perm[k+1]]=[perm[k+1],perm[k]];}
  else perm=shuffle([0,1,2,3]);
  const off=lvl===2?[-5,-3,3,5]:[-2,-1,1,2];
  const draw=()=>{for(let i=0;i<4;i++){FR(0,ys[i]-1,3,3);
      const ym=(ys[i]+ys[perm[i]])/2+off[i];
      L(4,ys[i],20,ys[i]);L(20,ys[i],33,ym);L(33,ym,46,ys[perm[i]]);L(46,ys[perm[i]],55,ys[perm[i]]);}
    for(let k=0;k<4;k++)for(let d=0;d<=k;d++)P(58,ys[k]-3+d*2);};
  return {draw,q:'Four lines weave across the pad. Line A starts at the top-left marker — which endpoint (1 = top, 4 = bottom) does it reach?',opts:['1','2','3','4'],correct:perm[0],brl:'trace a',say:'Trace line A from the top left marker. Which endpoint does it reach?'};}},
{id:'count',dom:'attention',name:'Pattern counting',desc:'Count only the solid squares among scattered shapes.',gen(){
  const cells=shuffle(Array.from({length:15},(_,i)=>i));
  const k=ri(3,5),mm=ri(2,3);
  const draw=()=>{for(let j=0;j<k;j++){const c=cells[j];FR(6+(c%5)*11,7+Math.floor(c/5)*11,4,4);}
    for(let j=0;j<mm;j++){const c=cells[k+j];C(8+(c%5)*11,9+Math.floor(c/5)*11,3);}};
  const o=optsAround(k,2,7);
  return {draw,q:'Shapes are scattered across the pad — some solid squares, some circle outlines. How many solid squares?',...o,brl:'count',say:'How many solid squares can you find?'};}},
/* ---- Tactile-spatial ---- */
{id:'rot',dom:'spatial',name:'Shape rotation',desc:'Mentally rotate an L-block and find its match.',gen(){
  const M=[[1,0],[1,0],[1,1]];
  const rot=m=>{const R=m[0].map((_,c)=>m.map(r=>r[c]).reverse());return R;};
  const mir=m=>m.map(r=>r.slice().reverse());
  const draw90=rot(M),draw180=rot(rot(M)),draw270=rot(rot(rot(M))),drawMir=mir(M);
  const cands=shuffle([{m:draw90,ok:true},{m:draw180,ok:false},{m:draw270,ok:false},{m:drawMir,ok:false}]);
  const correct=cands.findIndex(c=>c.ok);
  const dm=(m,x,y,s)=>{for(let r=0;r<m.length;r++)for(let c=0;c<m[0].length;c++)if(m[r][c])FR(x+c*s,y+r*s,s-1,s-1);};
  const draw=()=>{dm(M,4,11,6);VL(21,6,34);
    cands.forEach((cd,i)=>{dm(cd.m,25+i*9,15,3);for(let d=0;d<=i;d++)P(25+i*9+d*2,36);});};
  return {draw,q:'Feel the large L-block on the left. Which small candidate (1–4, left to right) is that block rotated 90° clockwise?',opts:['1','2','3','4'],correct,brl:'rotate',say:'Which candidate matches the block rotated ninety degrees clockwise?'};}},
{id:'nav',dom:'spatial',name:'Grid navigation',desc:'Follow spoken directions across a 5×5 grid.',gen(){
  const sr=ri(1,3),sc=ri(1,3);
  const mv=[];let tr=sr,tc=sc;
  const dirs=shuffle([['right',0,1],['left',0,-1],['up',-1,0],['down',1,0]]);
  for(const [nm,dr,dc] of dirs.slice(0,2)){const steps=ri(1,2);
    if(tr+dr*steps<0||tr+dr*steps>4||tc+dc*steps<0||tc+dc*steps>4)continue;
    tr+=dr*steps;tc+=dc*steps;mv.push(`${nm} ${steps}`);}
  if(!mv.length){tc=Math.min(4,sc+1);mv.push('right 1');}
  const draw=()=>{for(let c=0;c<=5;c++)VL(15+c*6,5,35);for(let r=0;r<=5;r++)HL(15,45,5+r*6);FR(16+sc*6,6+sr*6,4,4);};
  const fmt=(r,c)=>`Row ${r+1} · Col ${c+1}`;
  const pool=[];for(let r=0;r<5;r++)for(let c=0;c<5;c++)pool.push(fmt(r,c));
  const o=optsFrom(pool,fmt(tr,tc),4);
  return {draw,q:`A 5×5 grid; the raised block is your start. Move ${mv.join(', then ')}. Where do you land? (rows count from the top)`,...o,brl:'grid',say:`From the raised block, move ${mv.join(', then ')}. Where do you land?`};}},
{id:'sym',dom:'spatial',name:'Symmetry check',desc:'Decide which mirror axis a felt shape has.',gen(){
  const CLASSES=[
   ['Left–right only',[()=>{TRI(30,19,13);},()=>{R(21,18,19,14);L(21,18,30,9);L(30,9,39,18);}]],
   ['Top–bottom only',[()=>{VL(22,8,32);L(22,8,40,20);L(22,32,40,20);},()=>{HL(18,34,20);L(34,20,27,13);L(34,20,27,27);}]],
   ['Both axes',[()=>{DIAMOND(30,20,12);},()=>{FR(27,9,7,23);FR(19,17,23,7);}]],
   ['Not symmetric',[()=>{VL(24,8,32);FR(25,9,12,7);},()=>{FR(24,10,5,16);FR(24,22,14,5);}]]];
  const ci=ri(0,3);
  const draw=pick(CLASSES[ci][1]);
  return {draw,q:'One shape, centred on the pad. Which mirror symmetry does it have?',opts:CLASSES.map(c=>c[0]),correct:ci,brl:'mirror',say:'Which mirror symmetry does this shape have?'};}},
/* ---- Memory ---- */
{id:'pairs',dom:'memory',name:'Position memory',desc:'Memorise four shapes for 8 seconds, then recall one.',gen(lvl=1){
  const expo=[12000,8000,5000][lvl]||8000; /* adaptive variable: exposure time */
  const shapes=shuffle(['circle','square','triangle','cross']),xs=[8,22,36,50];
  const target=pick(shapes),slot=shapes.indexOf(target);
  const layout=()=>{xs.forEach((x,i)=>{drawShapeAt(shapes[i],x+2,18,4);HL(x-1,x+6,27);});};
  const qdraw=()=>{xs.forEach(x=>HL(x-1,x+6,27));};
  return {phases:[{draw:layout,ms:expo,label:'Memorise the four shapes…'}],qdraw,
    q:`The pad is blank again. Where was the ${target}? (1–4, left to right)`,opts:['1','2','3','4'],correct:slot,brl:'memory',say:`Where was the ${target}?`};}},
{id:'seq',dom:'memory',name:'Sequence recall',desc:'Three shapes appear in turn — recall their order.',gen(){
  const order=shuffle(['circle','square','triangle']);
  const phases=order.map((s,i)=>({draw:()=>drawShapeAt(s,30,20,10),ms:1700,label:`Shape ${i+1} of 3…`}));
  const fmt=a=>a.join(' → ');
  const alts=new Set([fmt(order)]);while(alts.size<4)alts.add(fmt(shuffle(order)));
  const a=shuffle([...alts]);
  return {phases,qdraw:()=>{},q:'Three shapes appeared one after another. Which order did you feel?',opts:a,correct:a.indexOf(fmt(order)),brl:'order',say:'Which order did the three shapes appear in?'};}},
{id:'story',dom:'memory',name:'Story & map recall',desc:'Listen to a short journey, then retrace it on the map.',gen(){
  const third=pick([['tree',()=>{FR(47,27,3,6);C(48,22,5);}],['pond',()=>{ELLIPSE(49,28,7,4);}]]);
  const draw=()=>{R(4,24,11,10);L(4,24,9,18);L(9,18,14,24);HL(14,56,33);VL(26,28,33);VL(34,28,33);L(26,28,30,26);L(30,26,34,28);third[1]();};
  const story=`From home, you follow the path, cross the bridge, and stop at the ${third[0]}.`;
  const o=optsFrom(['The house','The bridge',`The ${third[0]}`,'The path’s end'],`The ${third[0]}`,4);
  return {phases:[{draw,ms:9000,label:'Explore the map while listening…',say:story}],qdraw:draw,keep:true,
    q:`${story} — What do you reach right after crossing the bridge?`,...o,brl:'journey',say:story+' What comes right after the bridge?'};}},
/* ---- Executive ---- */
{id:'maze',dom:'executive',name:'Maze escape',desc:'Feel the walls, plan a route, walk to the exit.',maze:true,gen(lvl=1){return genMaze(lvl);}},
{id:'sudoku',dom:'executive',name:'Shape sudoku 4×4',desc:'Complete the row so no shape repeats.',gen(){
  const base=shuffle(['circle','square','triangle','cross']);
  const grid=[0,1,2,3].map(r=>[0,1,2,3].map(c=>base[(r+c)%4]));
  const br=ri(0,3),bc=ri(0,3);const missing=grid[br][bc];
  const draw=()=>{for(let k=0;k<=4;k++){VL(12+k*9,2,38);HL(12,48,2+k*9);}
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){if(r===br&&c===bc)continue;drawShapeAt(grid[r][c],16+c*9+0,6+r*9+0,3);}};
  const o=optsFrom(['circle','square','triangle','cross'],missing,4);
  return {draw,q:`A 4×4 shape sudoku — each row and column holds every shape once. One cell (row ${br+1}, column ${bc+1}) is empty. Which shape belongs there?`,...o,brl:'sudoku',say:'Which shape completes the empty cell?'};}},
{id:'cat',dom:'executive',name:'Category sort',desc:'Three belong together — find the outsider.',gen(){
  const round=shuffle(['circle','ring','oval']).slice(0,3);
  const odd=pick(['square','triangle']);const slot=ri(0,3);
  const items=round.slice();items.splice(slot,0,odd);
  const xs=[8,22,36,50];
  const draw=()=>{xs.forEach((x,i)=>drawShapeAt(items[i],x+2,20,4));};
  return {draw,q:'Four objects. Three share a family — all round. Which position (1–4) does not belong?',opts:['1','2','3','4'],correct:slot,brl:'sort',say:'Which position does not belong with the round shapes?'};}},
];
const DOMS={
 orientation:{label:'Orientation',chip:'O',note:'time · place · season',stage:'Stage 1 · Sensation'},
 attention:{label:'Attention',chip:'A',note:'selective focus & discrimination',stage:'Stage 1–2'},
 spatial:{label:'Tactile-spatial',chip:'S',note:'mental maps & rotation',stage:'Stage 2–3'},
 memory:{label:'Memory',chip:'M',note:'tactile working memory',stage:'Stage 2–3'},
 executive:{label:'Executive function',chip:'E',note:'planning · rules · categories',stage:'Stage 3–4'},
};
const THUMBS=window.__TH||{};
function buildTaskGrid(){
  const host=document.getElementById('taskGrid');host.innerHTML='';
  for(const key of Object.keys(DOMS)){
    const d=DOMS[key];
    const g=document.createElement('div');g.className='domgroup';
    g.innerHTML=`<h3><span class="domchip">${d.label}</span><span class="stagechip">${d.note} · ${d.stage}</span></h3>`;
    const row=document.createElement('div');row.className='grid g3';
    TASKS.filter(t=>t.dom===key).forEach(t=>{
      const b=document.createElement('button');b.className='taskcard';b.id='tc-'+t.id;
      b.innerHTML=`<span class="arrow">↗</span><b>${t.name}</b><span>${t.desc}</span><span class="done" hidden>✓ completed</span><span class="minipad"><img class="thumb" alt="" loading="lazy"></span>`;
      b.addEventListener('click',()=>startTask(t));row.appendChild(b);
      const th=b.querySelector('.thumb'); if(THUMBS[t.id])th.src=THUMBS[t.id];});
    g.appendChild(row);host.appendChild(g);}
}

/* ================= maze ================= */
function genMaze(lvl=1){
  const [CO,RO,cs]=[[5,4,9],[7,5,8],[9,6,6]][lvl]||[7,5,8]; /* adaptive variable: maze size */
  const vis=Array.from({length:RO},()=>Array(CO).fill(false));
  const wallsH=Array.from({length:RO+1},()=>Array(CO).fill(true));
  const wallsV=Array.from({length:RO},()=>Array(CO+1).fill(true));
  const st=[[0,0]];vis[0][0]=true;
  while(st.length){const [r,c]=st[st.length-1];
    const nb=shuffle([[r-1,c,'u'],[r+1,c,'d'],[r,c-1,'l'],[r,c+1,'r']]).find(([rr,cc])=>rr>=0&&rr<RO&&cc>=0&&cc<CO&&!vis[rr][cc]);
    if(!nb){st.pop();continue;}
    const [rr,cc,dir]=nb;vis[rr][cc]=true;
    if(dir==='u')wallsH[r][c]=false;if(dir==='d')wallsH[r+1][c]=false;
    if(dir==='l')wallsV[r][c]=false;if(dir==='r')wallsV[r][c+1]=false;
    st.push([rr,cc]);}
  /* BFS optimal */
  const dist=Array.from({length:RO},()=>Array(CO).fill(-1));dist[0][0]=0;const qq=[[0,0]];
  while(qq.length){const [r,c]=qq.shift();
    const steps=[[r-1,c,()=>!wallsH[r][c]],[r+1,c,()=>!wallsH[r+1][c]],[r,c-1,()=>!wallsV[r][c]],[r,c+1,()=>!wallsV[r][c+1]]];
    for(const [rr,cc,open] of steps)if(rr>=0&&rr<RO&&cc>=0&&cc<CO&&dist[rr][cc]<0&&open()){dist[rr][cc]=dist[r][c]+1;qq.push([rr,cc]);}}
  return {maze:true,wallsH,wallsV,RO,CO,cs,player:[0,0],goal:[RO-1,CO-1],moves:0,optimal:dist[RO-1][CO-1],
    q:'A maze. You start top-left; the exit (diamond) is bottom-right. Raised lines are walls — DotPad keys: F1 left, F2 up, F3 down, F4 right (arrow keys also work).',brl:'maze',
    say:'Find your way from the top left to the diamond at the bottom right. On the DotPad: F1 moves left, F2 up, F3 down, and F4 right.'};
}
function drawMaze(s,hidePlayer){clearFB();const ox=2,oy=0,cs=s.cs||8,ctr=Math.floor(cs/2),po=(cs-3)>>1;
  for(let r=0;r<=s.RO;r++)for(let c=0;c<s.CO;c++)if(s.wallsH[r][c])HL(ox+c*cs,ox+c*cs+cs,oy+r*cs);
  for(let r=0;r<s.RO;r++)for(let c=0;c<=s.CO;c++)if(s.wallsV[r][c])VL(ox+c*cs,oy+r*cs,oy+r*cs+cs);
  DIAMOND(ox+s.goal[1]*cs+ctr,oy+s.goal[0]*cs+ctr,2);
  if(!hidePlayer)FR(ox+s.player[1]*cs+po,oy+s.player[0]*cs+po,3,3);
  requestPaint();}
let bumpT=null;
function wallBump(s){ /* boundary feedback: spoken cue + tactile throb of the player marker */
  sayCue('Wall.');
  if(bumpT)clearInterval(bumpT);let k=0;
  bumpT=setInterval(()=>{k++;
    if(k>4||!cur||cur.spec!==s){clearInterval(bumpT);bumpT=null;drawMaze(s);return;}
    drawMaze(s,k%2===1);},160);}
function mazeHint(s){ /* BFS from the goal; return the direction of the next optimal step */
  const {RO,CO,wallsH,wallsV}=s;
  const dist=Array.from({length:RO},()=>Array(CO).fill(-1));
  dist[s.goal[0]][s.goal[1]]=0;const q=[s.goal.slice()];
  while(q.length){const [r,c]=q.shift();
    const st=[[r-1,c,()=>!wallsH[r][c]],[r+1,c,()=>!wallsH[r+1][c]],[r,c-1,()=>!wallsV[r][c]],[r,c+1,()=>!wallsV[r][c+1]]];
    for(const [rr,cc,open] of st)if(rr>=0&&rr<RO&&cc>=0&&cc<CO&&dist[rr][cc]<0&&open()){dist[rr][cc]=dist[r][c]+1;q.push([rr,cc]);}}
  const [pr,pc]=s.player;
  const cand=[['up',pr-1,pc,()=>!wallsH[pr][pc]],['down',pr+1,pc,()=>!wallsH[pr+1][pc]],['left',pr,pc-1,()=>!wallsV[pr][pc]],['right',pr,pc+1,()=>!wallsV[pr][pc+1]]];
  for(const [dir,rr,cc,open] of cand)if(rr>=0&&rr<RO&&cc>=0&&cc<CO&&open()&&dist[rr][cc]===dist[pr][pc]-1)return dir;
  return null;}
function mazeMove(s,dir){if(paused)return;const [r,c]=s.player;let nr=r,nc=c;
  if(dir==='up'&&!s.wallsH[r][c])nr--;else if(dir==='down'&&!s.wallsH[r+1][c])nr++;
  else if(dir==='left'&&!s.wallsV[r][c])nc--;else if(dir==='right'&&!s.wallsV[r][c+1])nc++;
  else{s.bumps=(s.bumps||0)+1;wallBump(s);return;}
  s.player=[nr,nc];s.moves++;drawMaze(s);
  if(nr===s.goal[0]&&nc===s.goal[1])mazeDone(s);}
