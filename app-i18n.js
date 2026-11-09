/* ================= i18n — Japanese language mode =================
   English stays the source of truth in the code; this layer translates what the
   learner sees and hears. Japanese speech uses the browser's ja-JP voice
   (Kokoro has no Japanese G2P), keeping the same pause/interrupt semantics. */
let lang='en';try{lang=localStorage.getItem('dotmind_lang')||'en';}catch(e){}

/* ---- task / motion names & descriptions ---- */
const NAMEJA={cal:'触るカレンダー',clock:'触るアナログ時計',season:'季節のシンボル',
 odd:'仲間はずれ探し',trace:'線たどり',count:'模様かぞえ',
 rot:'形の回転',nav:'マス目ナビ',sym:'対称チェック',
 pairs:'位置の記憶',seq:'順番の記憶',story:'物語と地図の記憶',
 maze:'迷路脱出',sudoku:'形ナンプレ4×4',cat:'仲間分け',
 fish:'魚',bird:'鳥',frog:'カエル',rabbit:'ウサギ',dolphin:'イルカ'};
const DESCJA={cal:'浮き上がったマスの曜日を当てます。',clock:'針の位置を触って時刻を読みます。',
 season:'触図のシンボルを季節に当てはめます。',odd:'4つの形からひとつだけ違う形を探します。',
 trace:'絡み合った線を始点から終点までたどります。',count:'散らばった形から塗りつぶしの四角だけ数えます。',
 rot:'Lブロックを頭の中で回して同じ形を探します。',nav:'音声の指示どおりに5×5のマス目を移動します。',
 sym:'形の鏡映対称の向きを判断します。',pairs:'4つの形を覚えて、あとで位置を思い出します。',
 seq:'順に現れた3つの形の順番を思い出します。',story:'短い旅の話を聞き、地図でたどります。',
 maze:'壁を触って道を考え、出口まで進みます。',sudoku:'行と列に同じ形が重ならないように埋めます。',
 cat:'3つは仲間、ひとつだけ仲間はずれ。',
 fish:'泳ぎながら体と尾を左右にしならせます。',bird:'翼を上げ、広げ、下ろして羽ばたきます。',
 frog:'かがんで、跳んで、着地します。',rabbit:'脚を縮めて伸ばしながら跳びはねます。',
 dolphin:'尾を打ち、弧を描いて泳ぎます。'};
const DOMJA={orientation:'見当識',attention:'注意',spatial:'触空間',memory:'記憶',executive:'実行機能'};
const DOMNOTEJA={orientation:'時間 · 場所 · 季節',attention:'選択的注意と弁別',spatial:'心的地図と回転',
 memory:'触覚ワーキングメモリ',executive:'計画 · ルール · 分類'};

/* ---- option word maps ---- */
const OPTJA={Mon:'月曜',Tue:'火曜',Wed:'水曜',Thu:'木曜',Fri:'金曜',Sat:'土曜',Sun:'日曜',
 Spring:'春',Summer:'夏',Autumn:'秋',Winter:'冬',
 circle:'丸',square:'四角',triangle:'三角',cross:'十字',ring:'輪',oval:'楕円',
 'Left–right only':'左右対称のみ','Top–bottom only':'上下対称のみ','Both axes':'上下左右とも対称','Not symmetric':'対称なし',
 'The house':'家','The bridge':'橋','The tree':'木','The pond':'池','The path’s end':'道の終わり'};
const MOVJA={right:'右',left:'左',up:'上',down:'下'};
function movesJa(s){ /* "right 1, then up 2" */
  return s.split(', then ').map(p=>{const m=p.match(/^(right|left|up|down) (\d)$/);
    return m?MOVJA[m[1]]+'へ'+m[2]:p;}).join('、つづいて');}
function optJa(o){o=String(o);
  if(OPTJA[o])return OPTJA[o];
  let m=o.match(/^(\d{1,2}):(\d{2})$/);if(m)return m[2]==='00'?`${+m[1]}時`:`${+m[1]}時${+m[2]}分`;
  m=o.match(/^Row (\d) · Col (\d)$/);if(m)return `${m[1]}行目 · ${m[2]}列目`;
  if(o.includes(' → '))return o.split(' → ').map(x=>OPTJA[x]||x).join(' → ');
  return o;}

/* ---- sentence dictionary (exact) ---- */
const SENTJA={
 'A calendar grid — Monday is the left column. Which weekday column holds the raised “today” mark?':'カレンダーの格子です。いちばん左の列が月曜日。浮き上がった「今日」の印は、何曜日の列にありますか?',
 'Feel the calendar grid. Which weekday holds the raised mark?':'カレンダーの格子に触れてください。浮き上がった印は何曜日ですか?',
 'A tactile analog clock — the short hand is thicker. What time does it show?':'触るアナログ時計です。短い針のほうが太くなっています。何時を指していますか?',
 'Feel the clock face. What time is it showing?':'時計の文字盤に触れてください。何時を指していますか?',
 'One tactile pictogram, centred. Which season does it stand for?':'中央にひとつの触図シンボルがあります。どの季節を表していますか?',
 'Which season does this tactile symbol stand for?':'この触図シンボルは、どの季節を表していますか?',
 'Four shapes in a row. Which position (1–4, left to right) feels different?':'4つの形が横に並んでいます。左から1〜4のうち、どの位置の形が違いますか?',
 'Four shapes in a row. Which one feels different?':'4つの形が並んでいます。ひとつだけ違うのはどれですか?',
 'Four lines weave across the pad. Line A starts at the top-left marker — which endpoint (1 = top, 4 = bottom) does it reach?':'4本の線が交差しながら伸びています。左上の印から始まる線Aは、どの終点(1=上、4=下)につながっていますか?',
 'Trace line A from the top left marker. Which endpoint does it reach?':'左上の印から線Aをたどってください。どの終点につながっていますか?',
 'Shapes are scattered across the pad — some solid squares, some circle outlines. How many solid squares?':'形が散らばっています。塗りつぶしの四角と、輪郭だけの丸があります。塗りつぶしの四角はいくつですか?',
 'How many solid squares can you find?':'塗りつぶされた四角は、いくつ見つかりますか?',
 'Feel the large L-block on the left. Which small candidate (1–4, left to right) is that block rotated 90° clockwise?':'左の大きなLブロックに触れてください。右の小さな候補(左から1〜4)のうち、時計回りに90度回した形はどれですか?',
 'Which candidate matches the block rotated ninety degrees clockwise?':'ブロックを時計回りに90度回した形は、どの候補ですか?',
 'A 5×5 grid; the raised block is your start.':'5×5のマス目です。浮き上がったブロックが出発点です。',
 'Where do you land?':'どこに着きますか?',
 '(rows count from the top)':'(行は上から数えます)',
 'One shape, centred on the pad. Which mirror symmetry does it have?':'中央にひとつの形があります。どの鏡映対称がありますか?',
 'Which mirror symmetry does this shape have?':'この形には、どの鏡映対称がありますか?',
 'The pad is blank again.':'盤面が消えました。',
 '(1–4, left to right)':'(左から1〜4)',
 'Memorise the four shapes…':'4つの形を覚えてください…',
 'Three shapes appeared one after another. Which order did you feel?':'3つの形が順番に現れました。どの順番でしたか?',
 'Which order did the three shapes appear in?':'3つの形は、どの順番で現れましたか?',
 'Explore the map while listening…':'聞きながら地図を探索してください…',
 'What do you reach right after crossing the bridge?':'橋を渡った直後にあるのは何ですか?',
 'What comes right after the bridge?':'橋のすぐ先にあるのは何ですか?',
 'A maze.':'迷路です。',
 'You start top-left; the exit (diamond) is bottom-right.':'左上からスタートし、出口のひし形は右下にあります。',
 'Raised lines are walls — DotPad keys: F1 left, F2 up, F3 down, F4 right (arrow keys also work).':'浮き上がった線は壁です。DotPadのキーは、F1が左、F2が上、F3が下、F4が右です(矢印キーも使えます)。',
 'Find your way from the top left to the diamond at the bottom right.':'左上から、右下のひし形まで進んでください。',
 'On the DotPad: F1 moves left, F2 up, F3 down, and F4 right.':'DotPadでは、F1が左、F2が上、F3が下、F4が右です。',
 'A 4×4 shape sudoku — each row and column holds every shape once.':'4×4の形ナンプレです。どの行にも、どの列にも、同じ形は一度だけ入ります。',
 'Which shape belongs there?':'そこに入る形はどれですか?',
 'Four objects.':'4つのものがあります。',
 'Three share a family — all round.':'3つは丸い形の仲間です。',
 'Which position (1–4) does not belong?':'仲間でないのは、左から何番目(1〜4)ですか?',
 'Which position does not belong with the round shapes?':'丸い形の仲間でないのは、どの位置ですか?',
 'Choose a position from one to four.':'1から4の位置を選んでください。',
 'Correct!':'正解です!','Not quite.':'残念。','Wall.':'壁です。','Hint.':'ヒント。',
 'You escaped the maze.':'迷路を脱出しました。','Well done.':'お見事です。',
 'Task complete.':'課題が終わりました。','Session finished.':'セッション終了です。',
 'Try moving left.':'左へ進んでみてください。','Try moving right.':'右へ進んでみてください。',
 'Try moving up.':'上へ進んでみてください。','Try moving down.':'下へ進んでみてください。',
 'A fish swims, flexing its body and tail from side to side.':'魚が、体と尾を左右にしならせながら泳ぎます。',
 'A full fish silhouette fills the pad; feel the body and tail flex from frame to frame as it swims.':'盤面いっぱいに魚のシルエットがあります。コマごとに体と尾がしなるのを感じてください。',
 'A bird beats its wings.':'鳥が羽ばたいています。','Feel the wings rise and fall between the frames.':'コマの間で、翼が上がり下がりするのを感じてください。',
 'A bird in flight; feel the wings rise, spread and fold between frames.':'飛んでいる鳥です。コマごとに翼が上がり、広がり、たたまれるのを感じてください。',
 'A frog crouches, springs into a leap, stretches through the air, and lands.':'カエルがかがみ、跳び上がり、空中で伸び、着地します。',
 'A frog: sitting, pushing off, stretched in mid-leap, and back in a crouch — step through the jump.':'カエルです。座り、踏み切り、跳躍の途中、そして着地 — コマ送りでジャンプをたどってください。',
 'A rabbit bounds along.':'ウサギが跳びはねています。','Feel its legs gather and stretch with each hop.':'跳ぶたびに、脚が縮んで伸びるのを感じてください。',
 'A rabbit bounding: feel the legs gather under the body, stretch out mid-air, and land again.':'跳びはねるウサギです。脚が体の下に縮み、空中で伸び、また着地するのを感じてください。',
 'A dolphin beats its tail, arcing up and levelling out as it swims.':'イルカが尾を打ちながら、弧を描いて泳ぎます。',
 'A dolphin: feel its body arc upward on the tail beat, then level out, frame by frame.':'イルカです。尾を打つたびに体が弧を描いて上がり、また水平に戻るのを、コマごとに感じてください。',
 'On the DotPad: F1 previous frame, F2 play or pause, F3 next frame.':'DotPadでは、F1で前のコマ、F2で再生と停止、F3で次のコマです。',
};

/* ---- sentence rules (dynamic) ---- */
const RULEJA=[
 [/^Option (\d+): (.+)\.$/,(m)=>`選択肢${m[1]}、${optJa(m[2].replace(/, then /g,' → ')).replace(/ → /g,'、つぎに')}。`],
 [/^Where was the (circle|square|triangle|cross)\?$/,(m)=>`${OPTJA[m[1]]}は、どこにありましたか?`],
 [/^Where was the (circle|square|triangle|cross)\?\s*\(1–4, left to right\)$/,(m)=>`${OPTJA[m[1]]}は、左から何番目(1〜4)にありましたか?`],
 [/^Move (.+)\.$/,(m)=>`${movesJa(m[1])}へ進んでください。`],
 [/^From the raised block, move (.+)\.$/,(m)=>`浮き上がったブロックから、${movesJa(m[1])}へ進んでください。`],
 [/^From home, you follow the path, cross the bridge, and stop at the (tree|pond)\.$/,(m)=>`家から小道を進み、橋を渡って、${OPTJA['The '+m[1]]}の前で止まります。`],
 [/^One cell \(row (\d), column (\d)\) is empty\.$/,(m)=>`${m[1]}行${m[2]}列のマスが空いています。`],
 [/^It is not option (\d)\.$/,(m)=>`選択肢${m[1]}ではありません。`],
 [/^Frame (\d+)\.$/,(m)=>`コマ${m[1]}。`],
 [/^Your score: (\d+)\.$/,(m)=>`スコアは${m[1]}です。`],
 [/^Next task: (.+)\.$/,(m)=>{const t=(typeof TASKS!=='undefined')&&TASKS.find(x=>x.name===m[1]);
   return `次の課題は「${t?(NAMEJA[t.id]||t.name):m[1]}」です。`;}],
 [/^Today you completed (\d+) tasks? and (\d+) trials? — (\d+) correct\.$/,(m)=>`今日は課題を${m[1]}件、問題を${m[2]}問行い、${m[3]}問正解でした。`],
 [/^This week, (.+) practised on (\d+) days? and completed (\d+) trials\.$/,(m)=>`今週、${m[1]}さんは${m[2]}日練習し、${m[3]}問に取り組みました。`],
 [/^No practice recorded for (.+) this week\.$/,(m)=>`今週の${m[1]}さんの記録はありません。`],
];
function trChunk(c){c=c.trim().replace(/^—\s*/,'');if(!c)return '';
  if(SENTJA[c])return SENTJA[c];
  for(const [re,fn] of RULEJA){const m=c.match(re);if(m)return fn(m);}
  return c;}
function trJa(t){if(SENTJA[t])return SENTJA[t];
  const parts=(t.match(/[^.?!]+[.?!]?/g)||[t]).map(p=>p.trim()).filter(Boolean);
  const out=[];let i=0;
  while(i<parts.length){let hit=0; /* greedy: multi-sentence dictionary keys first */
    for(let j=Math.min(parts.length,i+3);j>i;j--){
      const seg=parts.slice(i,j).join(' ');
      if(SENTJA[seg]){out.push(SENTJA[seg]);i=j;hit=1;break;}}
    if(!hit){out.push(trChunk(parts[i]));i++;}}
  return out.join('');}

/* ---- public hooks (override the stubs declared in app-a) ---- */
T=function(s){return lang==='ja'?trJa(s):s;};
Topt=function(o){return lang==='ja'?optJa(o):String(o);};
TNAME=function(x){return lang==='ja'?(NAMEJA[x.id]||x.name):x.name;};
TDOM=function(k){return lang==='ja'?(DOMJA[k]||DOMS[k].label):DOMS[k].label;};

/* ---- UI string table ---- */
const I18N={
 en:{
  trial:(mz,i,n)=>mz?`Run ${i} of ${n}`:`Trial ${i} of ${n}`,
  trialDefault:'Trial — of —',motionLab:'Motion',
  feedOk:t=>`Correct · ${t}s`,feedNo:(x,t)=>`Not quite — it was “${x}” · ${t}s`,
  escaped:(m,o,t)=>`Escaped! ${m} moves (optimal ${o}) · ${t}s`,
  mazeDet:(m,o)=>`${m} moves (opt ${o})`,totalSec:t=>`${t}s total`,
  accDet:(h,n,t)=>`${h}/${n} correct · median ${t}s`,
  plotted:'Plotted on the recovery dashboard as “Today”. On the full program this feeds the weekly curve.',
  taskDoneTxt:(s,nm)=>`Task complete — ★ ${s}. Next up: ${nm} (starts automatically; “End task” stops the session).`,
  sessSum:(a,n,h)=>`Session finished. Today you completed ${a} task${a===1?'':'s'} and ${n} trial${n===1?'':'s'} — ${h} correct. Well done.`,
  exportNote:'You can export this session’s data from the dashboard above.',
  pickTitle:'Pick a task to begin',
  pickDesc:'Select any task card above. Each task runs six short trials; accuracy and response time are recorded and plotted on the recovery dashboard.',
  runs2:'2 runs',trials6:'6 trials',liveMeas:'live measurement',
  addLearner:'＋ Add learner…',promptLearner:'New learner name:',
  confirmSwitch:'Switch learner? The current task will stop.',
  pauseBtn:'⏸ Pause',resumeBtn:'▶ Resume',hintBtn:'💡 Hint',listenBtn:'🔊 Listen',quitBtn:'End task',
  exportBtn:'⬇ Export session data (JSON)',
  pausedStatus:'Paused — narration and timers are stopped.',
  motPlayBtn:'▶ Play',motPauseBtn:'⏸ Pause',motPrevBtn:'⏮ Prev frame',motNextBtn:'⏭ Next frame',motCloseBtn:'✕ Close',
  frameLab:(i,n)=>`Frame ${i} / ${n}`,motSuffix:' — tactile motion',
  motDom:n=>`AliveDot · ${n} frames`,motTag:'play, or step frame by frame',
  motChip:'Tactile motion',motStage:'play & frame-by-frame observation · AliveDot',
  level:n=>`Level ${n}`,doneChip:'✓ completed',
  facTitle:'🛠 Facilitator tools — difficulty override · observation notes · weekly summary',
  facLvl:'Difficulty override (applies from the next trial)',facNote:'Observation note',facWeek:'Weekly summary',
  noteBtn:'Add',sumBtn:'Generate & read aloud',
  notePh:'e.g. tired after maze · strong on calendar',
  langSet:'Language set to English.',
 },
 ja:{
  trial:(mz,i,n)=>mz?`走行 ${i} / ${n}`:`第${i}問 / 全${n}問`,
  trialDefault:'第—問 / —問',motionLab:'モーション',
  feedOk:t=>`正解 · ${t}秒`,feedNo:(x,t)=>`残念 — 正解は「${x}」 · ${t}秒`,
  escaped:(m,o,t)=>`脱出!${m}手(最短${o}) · ${t}秒`,
  mazeDet:(m,o)=>`${m}手(最短${o})`,totalSec:t=>`合計${t}秒`,
  accDet:(h,n,t)=>`${h}/${n} 正解 · 中央値 ${t}秒`,
  plotted:'ダッシュボードに「今日」の★として記録されました。',
  taskDoneTxt:(s,nm)=>`課題終了 — ★ ${s}。次は「${nm}」です(自動で始まります。「終了」で止められます)。`,
  sessSum:(a,n,h)=>`セッション終了です。今日は課題を${a}件、問題を${n}問行い、${h}問正解でした。お疲れさまでした。`,
  exportNote:'セッションのデータは、上のダッシュボードから書き出せます。',
  pickTitle:'課題を選んで開始',
  pickDesc:'上の課題カードを選んでください。各課題は短い問題6問。正答と反応時間が記録され、ダッシュボードに表示されます。',
  runs2:'2回走行',trials6:'全6問',liveMeas:'実測中',
  addLearner:'＋ 学習者を追加…',promptLearner:'新しい学習者の名前:',
  confirmSwitch:'学習者を切り替えますか?進行中の課題は中止されます。',
  pauseBtn:'⏸ 一時停止',resumeBtn:'▶ 再開',hintBtn:'💡 ヒント',listenBtn:'🔊 もう一度聞く',quitBtn:'終了',
  exportBtn:'⬇ セッションデータを書き出す (JSON)',
  pausedStatus:'一時停止中 — 音声とタイマーは止まっています。',
  motPlayBtn:'▶ 再生',motPauseBtn:'⏸ 停止',motPrevBtn:'⏮ 前のコマ',motNextBtn:'⏭ 次のコマ',motCloseBtn:'✕ 閉じる',
  frameLab:(i,n)=>`コマ ${i} / ${n}`,motSuffix:' — 触るモーション',
  motDom:n=>`AliveDot · 全${n}コマ`,motTag:'再生、またはコマ送りで観察',
  motChip:'触るモーション',motStage:'再生とコマ送り観察 · AliveDot',
  level:n=>`レベル${n}`,doneChip:'✓ 完了',
  facTitle:'🛠 進行者ツール — 難易度調整 · 観察メモ · 週間サマリー',
  facLvl:'難易度調整(次の問題から反映)',facNote:'観察メモ',facWeek:'週間サマリー',
  noteBtn:'追加',sumBtn:'作成して読み上げ',
  notePh:'例:迷路のあと疲れ気味 · カレンダーは安定',
  langSet:'日本語に切り替えました。',
 },
};
TXT=function(k,...a){const d=I18N[lang]||I18N.en;const f=(k in d)?d[k]:I18N.en[k];
  return typeof f==='function'?f(...a):f;};

/* ---- Japanese speech: browser ja-JP voice with the same pause/interrupt semantics ---- */
const _sayEn=say;
async function sayJa(t){lastSaid=t;if(paused)return new Promise(()=>{});
  const tok=++sayTok;stopAudio();
  try{if(!('speechSynthesis' in window))return;speechSynthesis.cancel();
    await new Promise(r=>setTimeout(r,80));if(tok!==sayTok)return;
    await new Promise(r=>{const u=new SpeechSynthesisUtterance(t);u.lang='ja-JP';
      const v=(speechSynthesis.getVoices()||[]).find(v=>v.lang&&v.lang.toLowerCase().startsWith('ja'));
      if(v)u.voice=v;u.rate=1.0;u.onend=r;u.onerror=r;speechSynthesis.speak(u);});}catch(e){}}
say=function(t){return lang==='ja'?sayJa(trJa(t)):_sayEn(t);};

/* ---- apply the language to everything already on screen ---- */
function applyLang(){
  try{localStorage.setItem('dotmind_lang',lang);}catch(e){}
  const sel=$('langSel');if(sel)sel.value=lang;
  const set=(id,k)=>{const el=$(id);if(el)el.textContent=TXT(k);};
  const bp=$('btnPause');if(bp)bp.textContent=paused?TXT('resumeBtn'):TXT('pauseBtn');
  set('btnHint','hintBtn');set('btnListen','listenBtn');set('btnQuit','quitBtn');set('btnExport','exportBtn');
  set('btnMotPrev','motPrevBtn');set('btnMotNext','motNextBtn');set('btnMotClose','motCloseBtn');
  const mp=$('btnMotPlay');if(mp)mp.textContent=(mot&&mot.playing)?TXT('motPauseBtn'):TXT('motPlayBtn');
  set('btnNote','noteBtn');set('btnSummary','sumBtn');
  const ni=$('noteInp');if(ni)ni.placeholder=TXT('notePh');
  const fs=document.querySelector('#facPanel summary');if(fs)fs.textContent=TXT('facTitle');
  const fls=document.querySelectorAll('#facPanel .faclab');
  if(fls.length>=3){fls[0].textContent=TXT('facLvl');fls[1].textContent=TXT('facNote');fls[2].textContent=TXT('facWeek');}
  refreshFac();refreshLearnerSel();
  TASKS.forEach(t=>{const c=$('tc-'+t.id);if(!c)return;
    c.querySelector('b').textContent=TNAME(t);
    const d=c.querySelector('b + span');if(d)d.textContent=lang==='ja'?(DESCJA[t.id]||t.desc):t.desc;});
  if(typeof MOTIONS!=='undefined')MOTIONS.forEach(m=>{const c=$('mc-'+m.id);if(!c)return;
    c.querySelector('b').textContent=TNAME(m);
    const d=c.querySelector('b + span');if(d)d.textContent=lang==='ja'?(DESCJA[m.id]||m.desc):m.desc;});
  document.querySelectorAll('#taskGrid .domgroup').forEach((g,i)=>{
    const keys=[...Object.keys(DOMS),'motion'];const k=keys[i];if(!k)return;
    const chip=g.querySelector('.domchip'),st=g.querySelector('.stagechip');
    if(k==='motion'){if(chip)chip.textContent=TXT('motChip');if(st)st.textContent=TXT('motStage');}
    else{if(chip)chip.textContent=TDOM(k);
      if(st)st.textContent=lang==='ja'?(DOMNOTEJA[k]||''):(DOMS[k].note+' · '+DOMS[k].stage);}});
  document.querySelectorAll('.taskcard .done').forEach(d=>d.textContent=TXT('doneChip'));
  if(!cur&&!mot){$('trainerTitle').textContent=TXT('pickTitle');$('qText').textContent=TXT('pickDesc');
    $('trialLab').textContent=TXT('trialDefault');}}
const _lsel=$('langSel');
if(_lsel)_lsel.addEventListener('change',()=>{lang=_lsel.value==='ja'?'ja':'en';
  applyLang();DP.log('Language: '+(lang==='ja'?'日本語':'English'));sayCue(TXT('langSet'));});
if(lang!=='en')applyLang();
