'use strict';
/* ================= framebuffer & drawing ================= */
const W=60,H=40,fb=new Uint8Array(W*H);
function clearFB(){fb.fill(0);}
function P(x,y){x=Math.round(x);y=Math.round(y);if(x>=0&&x<W&&y>=0&&y<H)fb[y*W+x]=1;}
function L(x0,y0,x1,y1,th){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  let dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;
  for(;;){P(x0,y0); if(th){P(x0+1,y0);P(x0,y0+1);} if(x0===x1&&y0===y1)break; const e2=2*err; if(e2>=dy){err+=dy;x0+=sx;} if(e2<=dx){err+=dx;y0+=sy;}}}
function HL(x0,x1,y){L(x0,y,x1,y);} function VL(x,y0,y1){L(x,y0,x,y1);}
function R(x,y,w,h){HL(x,x+w-1,y);HL(x,x+w-1,y+h-1);VL(x,y,y+h-1);VL(x+w-1,y,y+h-1);}
function FR(x,y,w,h){for(let j=0;j<h;j++)for(let i=0;i<w;i++)P(x+i,y+j);}
function C(cx,cy,r){for(let a=0;a<360;a+=3)P(cx+r*Math.cos(a*Math.PI/180),cy+r*Math.sin(a*Math.PI/180));}
function DISC(cx,cy,r){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r)P(cx+x,cy+y);}
function TRI(cx,cy,s){L(cx,cy-s,cx-s,cy+s);L(cx,cy-s,cx+s,cy+s);HL(cx-s,cx+s,cy+s);}
function DIAMOND(cx,cy,s){L(cx,cy-s,cx+s,cy);L(cx+s,cy,cx,cy+s);L(cx,cy+s,cx-s,cy);L(cx-s,cy,cx,cy-s);}
function CROSSH(cx,cy,s){HL(cx-s,cx+s,cy);VL(cx,cy-s,cy+s);P(cx-s,cy-1);P(cx-s,cy+1);}
function ELLIPSE(cx,cy,rx,ry){for(let a=0;a<360;a+=3)P(cx+rx*Math.cos(a*Math.PI/180),cy+ry*Math.sin(a*Math.PI/180));}
function drawShapeAt(name,cx,cy,s){switch(name){
  case 'circle':C(cx,cy,s);break;
  case 'disc':DISC(cx,cy,s);break;
  case 'square':R(cx-s,cy-s,2*s+1,2*s+1);break;
  case 'solidsquare':FR(cx-s,cy-s,2*s+1,2*s+1);break;
  case 'triangle':TRI(cx,cy,s);break;
  case 'cross':CROSSH(cx,cy,s);break;
  case 'diamond':DIAMOND(cx,cy,s);break;
  case 'ring':C(cx,cy,s);C(cx,cy,Math.max(1,s-3));break;
  case 'oval':ELLIPSE(cx,cy,s+2,Math.max(2,s-2));break;}}
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[ri(0,a.length-1)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ================= braille text line (20 cells) ================= */
const BRL={a:0x01,b:0x03,c:0x09,d:0x19,e:0x11,f:0x0B,g:0x1B,h:0x13,i:0x0A,j:0x1A,k:0x05,l:0x07,m:0x0D,n:0x1D,o:0x15,p:0x0F,q:0x1F,r:0x17,s:0x0E,t:0x1E,u:0x25,v:0x27,w:0x3A,x:0x2D,y:0x3D,z:0x35,' ':0,'-':0x24};
const BRLD={'1':0x01,'2':0x03,'3':0x09,'4':0x19,'5':0x11,'6':0x0B,'7':0x1B,'8':0x13,'9':0x0A,'0':0x1A};
let brlCells=new Array(20).fill(0);
function setBraille(str){const cells=[];let num=false;
  for(const ch of (str||'').toLowerCase()){if(cells.length>=20)break;
    if(BRLD[ch]!==undefined){if(!num){cells.push(0x3C);num=true;if(cells.length>=20)break;}cells.push(BRLD[ch]);}
    else{num=false;cells.push(BRL[ch]??0);}}
  while(cells.length<20)cells.push(0);
  brlCells=cells;
  document.getElementById('brlLine').textContent=cells.map(b=>String.fromCodePoint(0x2800+b)).join('');
}
function brlHex(){return brlCells.map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join('');}

/* ================= simulator renderer ================= */
const cv=document.getElementById('sim'),ctx=cv.getContext('2d');
cv.width=640;cv.height=438;
let rafQ=false;
function paint(){rafQ=false;const ox=22,oy=14,pitch=10;
  ctx.clearRect(0,0,cv.width,cv.height);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const on=fb[y*W+x];const px=ox+x*pitch,py=oy+y*pitch+(0);
    ctx.beginPath();ctx.arc(px,py,on?3.6:2.1,0,7);
    if(on){ctx.fillStyle='#e4f222';ctx.shadowColor='rgba(228,242,34,.8)';ctx.shadowBlur=7;}
    else{ctx.fillStyle='rgba(255,255,255,0.11)';ctx.shadowBlur=0;}
    ctx.fill();ctx.shadowBlur=0;}
}
let bleFlushT=null;
function requestPaint(){if(!rafQ){rafQ=true;requestAnimationFrame(paint);}
  if(DP.connected&&bleFlushT==null){bleFlushT=setTimeout(()=>{bleFlushT=null;if(DP.connected)DP.push();},0);}}

/* ================= speech — Kokoro-82M neural TTS with system-voice fallback ================= */
let lastSaid='',kokoro=null,kokoroBusy=false,kokoroAudio=null;
async function loadKokoro(){
  if(kokoro||kokoroBusy)return;kokoroBusy=true;
  const st=document.getElementById('voiceStatus');
  try{
    if(st)st.textContent='Preparing natural voice…';
    const m=await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.0/+esm');
    let tts=null;
    try{tts=await m.KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{dtype:'fp32',device:'webgpu'});}
    catch(e){tts=await m.KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX',{dtype:'q8',device:'wasm'});}
    kokoro=tts;
    if(st)st.textContent='';
    DP.log('Kokoro-82M TTS ready (hexgrad/Kokoro-82M via kokoro-js).');
  }catch(e){
    if(st)st.textContent='';
    DP.log('Kokoro TTS unavailable — using the system voice: '+(e&&e.message||e));
  }
  kokoroBusy=false;}
async function say(t){lastSaid=t;
  if(kokoro){try{
    if(kokoroAudio){try{kokoroAudio.pause();}catch(e){}kokoroAudio=null;}
    const audio=await kokoro.generate(t,{voice:'af_heart'});
    if(lastSaid!==t)return;
    const blob=audio.toBlob?audio.toBlob():new Blob([audio.toWav()],{type:'audio/wav'});
    kokoroAudio=new Audio(URL.createObjectURL(blob));kokoroAudio.play().catch(()=>{});
    return;
  }catch(e){}}
  try{if(!('speechSynthesis' in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-US';u.rate=1.02;speechSynthesis.speak(u);}catch(e){}}
document.getElementById('btnListen').addEventListener('click',()=>{if(lastSaid)say(lastSaid);});
loadKokoro(); /* preload Kokoro in the background on page load */

/* ================= DotPad BLE driver (protocol v3, row-wise live display) ================= */
const DP={
  SVC:'49535343-fe7d-4ae5-8fa9-9fafd205e455',
  NTF:'49535343-1e4d-4bd9-ba61-23c647249616',
  WRT:'49535343-8841-43f4-a8d4-ecbe34729bb3',
  dev:null,wr:null,connected:false,lastRows:new Array(10).fill(null),lastText:null,
  q:Promise.resolve(),rx:'',fn:0,pan:0,
  log(m){const el=document.getElementById('devLog');el.textContent+='\n› '+m;el.scrollTop=el.scrollHeight;},
  hex2(n){return n.toString(16).toUpperCase().padStart(2,'0');},
  csum(hex){let a=0xA5;for(let i=0;i<hex.length;i+=2)a^=parseInt(hex.substr(i,2),16);return (a&255).toString(16).toUpperCase().padStart(2,'0');},
  packet(dataHex,lineId,seq,cmd){const len=5+dataHex.length/2;
    let h='AA55'+len.toString(16).toUpperCase().padStart(4,'0')+this.hex2(lineId)+cmd+seq+dataHex;
    h+=this.csum(h.substring(8));
    const b=new Uint8Array(h.length/2);for(let i=0;i<b.length;i++)b[i]=parseInt(h.substr(i*2,2),16);return b;},
  async rawWrite(bytes){for(let o=0;o<bytes.length;o+=20){await this.wr.writeValue(bytes.slice(o,o+20));}},
  send(dataHex,lineId,seq,cmd){const p=this.packet(dataHex,lineId,seq,cmd);
    this.q=this.q.then(()=>this.rawWrite(p)).then(()=>new Promise(r=>setTimeout(r,55))).catch(()=>{});},
  rowHex(r){let h='';for(let gx=0;gx<30;gx++){let b=0;const px=gx*2,py=r*4;
    for(let k=0;k<4;k++){if(fb[(py+k)*W+px])b|=1<<k;if(fb[(py+k)*W+px+1])b|=1<<(4+k);}h+=this.hex2(b);}return h;},
  push(){if(!this.connected)return;
    for(let r=0;r<10;r++){const h=this.rowHex(r);if(h!==this.lastRows[r]){this.lastRows[r]=h;this.send('00'+h,r+1,'00','0200');}}
    const t=brlHex();if(t!==this.lastText){this.lastText=t;this.send('00'+t,0,'80','0200');}},
  pushAll(){this.lastRows.fill(null);this.lastText=null;this.push();},
  async connect(){
    if(!navigator.bluetooth){this.log('Web Bluetooth is not available in this view. Open this page in Chrome or Edge (HTTPS or a local file) to pair a DotPad. The simulator keeps running.');return;}
    try{
      const d=await navigator.bluetooth.requestDevice({filters:[{namePrefix:'DotPad'}],optionalServices:[this.SVC]});
      if(!d)return;
      const g=await d.gatt.connect();
      const svc=await g.getPrimaryService(this.SVC);
      let ntf;try{ntf=await svc.getCharacteristic(this.NTF);}catch(e){ntf=(await svc.getCharacteristics()).find(c=>c.properties.notify);}
      if(ntf){await ntf.startNotifications();ntf.addEventListener('characteristicvaluechanged',e=>this.onRx(e));}
      try{this.wr=await svc.getCharacteristic(this.WRT);}catch(e){this.wr=null;}
      if(!this.wr||!(this.wr.properties.write||this.wr.properties.writeWithoutResponse))
        this.wr=(await svc.getCharacteristics()).find(c=>c.properties.write||c.properties.writeWithoutResponse);
      if(!this.wr)throw new Error('no writable characteristic');
      d.addEventListener('gattserverdisconnected',()=>{this.connected=false;setStatus(false);this.log('Disconnected.');},{once:true});
      this.dev=d;this.connected=true;setStatus(true,d.name||'DotPad');
      this.log('Connected: '+(d.name||'DotPad'));
      this.send('', 0,'00','0100'); /* device-name handshake */
      setTimeout(()=>this.pushAll(),700);
    }catch(e){this.log('Connect failed: '+e.message);}
  },
  onRx(e){const v=new Uint8Array(e.target.value.buffer);
    this.rx+=[...v].map(x=>x.toString(16).padStart(2,'0')).join('');
    for(;;){const i=this.rx.indexOf('aa55');
      if(i<0){if(this.rx.length>60)this.rx='';break;}
      if(i>0)this.rx=this.rx.slice(i);
      if(this.rx.length<8)break;
      const len=parseInt(this.rx.substr(4,4),16);
      if(isNaN(len)||len>200){this.rx=this.rx.slice(4);continue;}
      const total=8+len*2;if(this.rx.length<total)break;
      const f=this.rx.slice(0,total);this.rx=this.rx.slice(total);this.frame(f);}},
  frame(f){const cmd=f.substr(10,4);
    if(cmd==='0332'){const nib=parseInt(f.substr(16,1),16)||0;this.keyEdge(nib&15);}
    else if(cmd==='0312'){const nib=parseInt(f.substr(19,1),16)||0;this.panEdge(nib&6);}},
  keyEdge(nib){const was=this.fn;this.fn=nib;const map={8:'F1',4:'F2',2:'F3',1:'F4'};
    for(const bit of [8,4,2,1])if((nib&bit)&&!(was&bit))onDeviceKey(map[bit]);},
  panEdge(nib){const was=this.pan;this.pan=nib;
    if((nib&4)&&!(was&4))onDeviceKey('PanL');if((nib&2)&&!(was&2))onDeviceKey('PanR');},
  async pulse(){if(!this.connected){this.log('Tactile pulse needs a connected DotPad.');return;}
    this.log('Tactile pulse ×5 (400 ms).');
    const save=fb.slice();
    for(let k=0;k<5;k++){fb.fill(1);this.pushAll();await new Promise(r=>setTimeout(r,400));fb.fill(0);this.pushAll();await new Promise(r=>setTimeout(r,400));}
    fb.set(save);requestPaint();this.pushAll();}
};
function setStatus(on,name){const pill=document.getElementById('statusPill');
  pill.classList.toggle('on',!!on);
  document.getElementById('statusTxt').textContent=on?('Connected · '+(name||'DotPad')):'No DotPad yet';}
document.getElementById('btnConnect').addEventListener('click',()=>DP.connect());
document.getElementById('btnConnect2').addEventListener('click',()=>DP.connect());
document.getElementById('btnClear').addEventListener('click',()=>{clearFB();setBraille('');requestPaint();DP.pushAll();DP.log('All pins down.');});
document.getElementById('btnPulse').addEventListener('click',()=>DP.pulse());
document.getElementById('btnSync').addEventListener('click',()=>{ /* SYNC: border + diagonals + L marker (top-left) + centre circle */
  clearFB();R(0,0,60,40);L(0,0,59,39);L(59,0,0,39);C(30,20,8);FR(3,3,2,9);FR(3,10,7,2);
  setBraille('sync');requestPaint();DP.pushAll();DP.log('SYNC pattern sent — check border, diagonals, L-marker top-left, centre circle.');});

/* ================= dashboard (simulated demonstration data) ================= */
const WEEKS=[32,38,45,51,58,63,70,78];
const DOMDATA=[['Orientation',40,85],['Attention',35,75],['Tactile-spatial',25,70],['Memory',30,72],['Executive',20,65]];
const liveStars=[];
function drawChart(){
  const svg=document.getElementById('curve');
  const Wc=560,Hc=300,l=38,r=78,t=26,b=34;
  const xi=i=>l+i*(Wc-l-r)/8, yv=v=>t+(1-v/100)*(Hc-t-b);
  const bands=[[0,2,'Sensation','#8a867c'],[2,4,'Perception','#55524a'],[4,6,'Cognition','#2b2924'],[6,7.6,'Function','#0c0a08']];
  let s='';
  for(const [a,bb,lab,col] of bands)
    s+=`<rect x="${xi(a)}" y="${t}" width="${xi(bb)-xi(a)}" height="${Hc-t-b}" fill="${col}" opacity="0.07"/>`+
       `<text x="${xi(a)+5}" y="${t+12}">${lab}</text>`;
  for(const g of [0,25,50,75,100])
    s+=`<line x1="${l}" x2="${Wc-r+40}" y1="${yv(g)}" y2="${yv(g)}" stroke="var(--line)" stroke-width="1"/>`+
       `<text x="${l-8}" y="${yv(g)+3}" text-anchor="end">${g}</text>`;
  const pts=WEEKS.map((v,i)=>`${xi(i)},${yv(v)}`).join(' ');
  s+=`<polyline points="${pts} ${xi(7)},${yv(0)} ${xi(0)},${yv(0)}" fill="var(--blue)" opacity="0.08" stroke="none"/>`;
  s+=`<polyline points="${pts}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
  WEEKS.forEach((v,i)=>{s+=`<circle cx="${xi(i)}" cy="${yv(v)}" r="${i===7?6:3.5}" fill="${i===7?'var(--blue)':'var(--panel)'}" stroke="var(--blue)" stroke-width="2"/>`;
    s+=`<text x="${xi(i)}" y="${Hc-12}" text-anchor="middle">W${i+1}</text>`;});
  s+=`<text x="${xi(7)+14}" y="${yv(78)+4}" font-weight="600" fill="var(--blue)">78</text>`;
  s+=`<text x="${xi(8)}" y="${Hc-12}" text-anchor="middle" font-weight="600">Today</text>`;
  s+=`<line x1="${xi(7.55)}" x2="${xi(7.55)}" y1="${t}" y2="${Hc-b}" stroke="var(--line)" stroke-dasharray="3 4"/>`;
  for(const st of liveStars){
    const x=xi(8)+(st.k%2?7:-7)*(st.k>1?1:0), y=yv(st.score);
    s+=`<text x="${x}" y="${y+5}" text-anchor="middle" font-size="17" fill="var(--lime)" stroke="var(--ink)" stroke-width="0.8">★</text>`;
    s+=`<text x="${x}" y="${y+18}" text-anchor="middle">${st.score}</text>`;}
  s+=`<text x="${l}" y="14" font-weight="600" fill="var(--ink)">Composite tactile-cognition score (0–100)</text>`;
  svg.innerHTML=s;
}
function drawDomBars(){
  document.getElementById('domBars').innerHTML=DOMDATA.map(([nm,a,b])=>
   `<div class="domrow"><span class="nm">${nm}</span><span class="bar"><i style="width:${b}%"></i><i class="base" style="width:${a}%"></i></span><span class="pct num">${a} → ${b}</span></div>`).join('');
}
