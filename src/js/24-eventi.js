// ================= Eventi =================
async function goFullscreen(){
  try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen({navigationUI:'hide'});}catch(e){}
  try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape');}catch(e){}
}
const GAME_ACT={
  roll:()=>roll(),buy:()=>buy(),auction:()=>toAuction(),end:()=>endTurn(),
  up:d=>{const i=+d.i;if(canUpgrade(cur(),i)){upgrade(i);save();render();}},
  down:d=>{const i=+d.i;if(S.own[i]&&S.own[i].owner===cur().id&&S.own[i].level>0){sellUpgrade(i);save();render();}},
  mort:d=>{const i=+d.i;if(S.own[i]&&canMortgage(i)&&S.own[i].owner===cur().id){mortgage(i);save();render();}},
  unmort:d=>{const i=+d.i;if(S.own[i]&&S.own[i].owner===cur().id&&S.own[i].mort){unmortgage(i);save();render();}},
  loan:d=>{const p=cur();if(p.loan||p.cpu)return;const n=+d.v;if(![100,200,300].includes(n))return;p.cash+=n;p.loan={owe:Math.round(n*1.3),due:S.round+3};sfx('coin');log(T(`🦈 ${p.name} prende ${fmt(n)} dallo strozzino`,`🦈 ${p.name} borrows ${fmt(n)} from the loan shark`));save();render();},
  repay:()=>{const p=cur();if(!p.loan||p.cash<p.loan.owe)return;if(mineHuman(p))pgsAch('loan_paid');p.cash-=p.loan.owe;log(T(`${p.name} salda lo strozzino (${fmt(p.loan.owe)})`,`${p.name} pays off the loan shark (${fmt(p.loan.owe)})`));p.loan=null;sfx('pay');save();render();},
};
function gameAct(a,b){
  if(!S||S.over||!isMine(cur()))return false;
  const d=b&&b.dataset?{i:b.dataset.i,v:b.dataset.v}:(b||{});
  if(isGuest()){netSend({t:'act',a,ds:d});return true;}
  GAME_ACT[a](d);return true;
}
const ACT={
  roll:b=>gameAct('roll',b),buy:b=>gameAct('buy',b),auction:b=>gameAct('auction',b),end:b=>gameAct('end',b),
  info:b=>showInfo(+b.dataset.i),pinfo:b=>showPlayer(+b.dataset.i),close:()=>closeSheet(),log:()=>showLog(),
  pause:()=>showPause(),home:()=>quitToMenu(true),menu:()=>{if(S)quitToMenu(true);else{closeSheet();showMenu();}},
  tomenu:()=>quitToMenu(false),abandon:()=>confirmAbandon(),doabandon:()=>quitToMenu(true),
  resume:()=>resumeSaved(),
  newsingle:()=>{setup.mode='single';hideMenu();showSetup();},
  newchamp:()=>{if(setup.mode==='single')setup.mode='c3';hideMenu();showSetup();},
  learn:()=>{try{localStorage.removeItem(TUT_KEY);}catch(e){}setup.mode='single';hideMenu();showSetup();},
  rules:()=>showRules(),setup:()=>{hideMenu();showSetup();},start:()=>startGame(),results:()=>showGameOver(),
  sound:()=>{muted=!muted;try{localStorage.setItem(MUTE_KEY,muted?'1':'0');}catch(e){}paintSound();sfx('coin');if(muted)musicStop(.2);else musicStart();},
  music:()=>{if(MUSIC.on&&!muted&&performance.now()-(MUSIC.unlockedAt||-1e9)<600){musicStart();paintMusic();return;}if(muted){muted=false;try{localStorage.setItem(MUTE_KEY,'0');}catch(e){}paintSound();MUSIC.on=true;}else MUSIC.on=!MUSIC.on;try{localStorage.setItem(MUSIC_KEY,MUSIC.on?'1':'0');}catch(e){}if(MUSIC.on)musicStart();else musicStop(.3);paintMusic();},
  fullscreen:()=>goFullscreen(),
  manage:()=>showManage(),
  up:b=>{if(gameAct('up',b)&&!isGuest())after(b);},
  down:b=>{if(gameAct('down',b)&&!isGuest())after(b);},
  mort:b=>{if(gameAct('mort',b)&&!isGuest())after(b);},
  unmort:b=>{if(gameAct('unmort',b)&&!isGuest())after(b);},
  trade:()=>startTrade(),
  loan:b=>{if(gameAct('loan',b)&&!isGuest())showManage();},
  repay:b=>{if(gameAct('repay',b)&&!isGuest())showManage();},
  diff:b=>{syncNames();setup.diff=b.dataset.v;showSetup();},
  mode:b=>{syncNames();setup.mode=b.dataset.v;showSetup();},
  climit:b=>{syncNames();setup.climit=+b.dataset.v;showSetup();},
  nextrace:()=>{const c=S.champ;if(!c||c.idx>=c.n-1)return;c.idx++;startGame(c);},
  tutorial:()=>{closeSheet();tutorial();},
  settings:()=>showSettings(),profile:()=>showProfile(),
  daily:()=>{closeSheet();if(S&&!S.over&&!S.daily&&!NET.on){save();}if(NET.on)netLeave(true);S=null;startDaily();},
  dcopy:()=>{const el=$('#dshare');if(!el)return;const ok=()=>{el.select();};try{navigator.clipboard.writeText(el.value).then(()=>{sfx('coin');toast(T('Copiato','Copied'));},ok);}catch(e){ok();}},
  pref:b=>{const k=b.dataset.k;PREFS[k]=b.dataset.v==='true';savePrefs();applyPrefs();if(k==='gameMusic'){if(PREFS.gameMusic)musicStart();else if(MUSIC.track==='game')musicStop(.4);}showSettings();},
  ffwd:()=>{if(isGuest())return;TURBO=!TURBO;render();},
  pgsach:()=>pgsShow('ach'),pgslb:()=>pgsShow('lb'),
  online:()=>showOnline(),resumeon:netTry(()=>resumeOnline()),
  quick:netTry(()=>quickMatch()),qjoin:netTry(b=>quickJoin(b.dataset.v)),qnew:netTry(()=>{closeQuickList();return createRoom(true);}),qback:()=>{closeQuickList();showOnline();},create:netTry(()=>createRoom(false)),
  join:netTry(()=>joinRoom(($('#ocode')||{}).value)),rejoin:netTry(b=>joinRoom(b.dataset.v)),
  copylink:()=>{const el=$('#olink');if(!el)return;const t=el.value;const ok=()=>{el.select();};try{navigator.clipboard.writeText(t).then(()=>sfx('coin'),ok);}catch(e){ok();}},
  addcpu:()=>{if(!NET.host||NET.started)return;NET.cpus=Math.min(NET.cpus+1,5);NET.db.update(room('meta'),{cpus:NET.cpus});showLobby();},
  rmcpu:()=>{if(!NET.host||NET.started)return;NET.cpus=Math.max(0,NET.cpus-1);NET.db.update(room('meta'),{cpus:NET.cpus});showLobby();},
  cpustart:()=>{if(!NET.host||NET.started)return;NET.cpus=2;startOnline();},
  ostart:()=>{if(!NET.host||NET.started)return;const n=Object.values(NET.lobby.players||{}).filter(x=>x.online!==false).length;if(NET.pub&&n<PUB_MIN)return;startOnline();},
  oleave:()=>{if(NET.host&&NET.started&&S&&!S.over&&!NET.confirmLeave){NET.confirmLeave=true;openSheet(`<h2>🏳️ ${T('Chiudere la partita per tutti?','End the game for everyone?')}</h2><p>${T('Sei l\'host: se esci, la partita finisce anche per gli altri.','You are the host: if you leave, the game ends for everyone.')}</p><div class="row"><button class="btn primary" data-act="oleave">${T('Sì, chiudi','Yes, end it')}</button><button class="btn out" data-act="close">${T('Annulla','Cancel')}</button></div>`);return;}
    NET.confirmLeave=false;quitToMenu(true);},
  orematch:()=>{if(!NET.host)return;GEN++;busy=false;cpuActive=false;NET.started=false;NET.overShown=false;S=null;$('#cars').innerHTML='';closeSheet();render();NET.db.update(room('meta'),{status:'lobby'});NET.db.remove(room('state'));showLobby();},
  lang:()=>{try{localStorage.setItem(LANG_KEY,LANG==='en'?'it':'en');}catch(e){}if(S&&!S.over)save();location.reload();},
  tradefor:b=>{closeSheet();startTrade({to:+b.dataset.o,get:b.dataset.i!==undefined?[+b.dataset.i]:[]});},
  'tr-to':b=>{readSelects();TR.o.to=+b.dataset.i;TR.o.get=[];TR.o.cashGet=0;paintEditor();},
  'tr-pick':b=>{readSelects();const a=TR.o[b.dataset.side],i=+b.dataset.i,k=a.indexOf(i);if(k>=0)a.splice(k,1);else a.push(i);paintEditor();},
  'tr-cash':b=>{readSelects();const o=TR.o,k=b.dataset.k,max=k==='cashGive'?P(o.from).cash:P(o.to).cash;o[k]=Math.max(0,Math.min(max,o[k]+ +b.dataset.d));paintEditor();},
  'tr-send':()=>{readSelects();const o=TR.o;delete o.line;
    if(!(o.give.length||o.get.length||o.cashGive||o.cashGet||o.pact)) return paintEditor(T('Scegli almeno qualcosa.','Pick at least one thing.'));
    const r=trResolve;trResolve=null;closeSheet();r({...o});},
  'tr-cancel':()=>{const r=trResolve;trResolve=null;closeSheet();r(null);},
  add:()=>{syncNames();const used=setup.players.map(p=>p.color);setup.players.push({name:'CPU '+['Alfa','Bravo','Charlie','Delta','Echo','Fox'][setup.players.length],cpu:true,color:COLORS.find(c=>!used.includes(c))});showSetup();},
  rm:b=>{syncNames();setup.players.splice(+b.dataset.i,1);showSetup();},
  human:b=>{syncNames();setup.players[+b.dataset.i].cpu=false;showSetup();},
  cpu:b=>{syncNames();setup.players[+b.dataset.i].cpu=true;showSetup();},
  lim:b=>{syncNames();setup.limit=+b.dataset.v;showSetup();},
  pace:b=>{syncNames();setup.fast=b.dataset.v==='true';showSetup();},
  autoend:b=>{syncNames();setup.autoEnd=b.dataset.v==='true';showSetup();},
  hrules:()=>{syncNames();setup.showRules=!setup.showRules;showSetup();},
  rule:b=>{syncNames();const k=b.dataset.k;setup.rules[k]=k==='cash'?+b.dataset.v:b.dataset.v==='true';showSetup();},
  cpufast:b=>{syncNames();setup.cpuFast=b.dataset.v==='true';showSetup();},
  helm:b=>{syncNames();const p=setup.players[+b.dataset.i];p.helmet=((p.helmet||0)+1)%HELMS;showSetup();},
  col:b=>{syncNames();const p=setup.players[+b.dataset.i],used=setup.players.map(x=>x.color);let k=COLORS.indexOf(p.color);for(let n=0;n<6;n++){k=(k+1)%6;if(!used.includes(COLORS[k]))break;}p.color=COLORS[k];showSetup();},
};
function after(b){save();render();if(b.dataset.ctx==='info')showInfo(+b.dataset.i);else showManage();}
const NO_GAME_OK=['daily','dcopy','hrules','rule','profile','settings','pref','helm','ffwd','pgsach','pgslb','qjoin','qnew','qback','online','resumeon','quick','create','join','rejoin','copylink','addcpu','rmcpu','cpustart','ostart','oleave','orematch','lang','music','pause','home','menu','tomenu','abandon','doabandon','resume','newsingle','newchamp','learn','fullscreen','sound','setup','start','rules','close','add','rm','human','cpu','col','lim','pace','info','diff','autoend','cpufast','mode','climit','tutorial'];
document.addEventListener('pointerdown',()=>{MUSIC.unlockedAt=performance.now();ac();setTimeout(musicStart,30);},{once:true});
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-choice]');
  if(c&&!c.disabled&&choice){const r=choice;choice=null;r(c.dataset.choice);return;}
  const b=e.target.closest('[data-act]');if(!b||b.disabled)return;
  const f=ACT[b.dataset.act];if(!f)return;
  if(!S&&!NO_GAME_OK.includes(b.dataset.act))return;
  if(S&&S.phase==='end'&&!['end','close','sound','music','fullscreen'].includes(b.dataset.act))cancelAutoEnd();
  f(b);
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('#backdrop').hidden&&sheetDismiss){closeSheet();return;}
  if(!S||S.over||!$('#backdrop').hidden||!isMine(cur())||e.target.closest('input,select,textarea'))return;
  const k=e.key.toLowerCase();
  if(k===' '||k==='enter'){e.preventDefault();if(S.phase==='roll')gameAct('roll');else if(S.phase==='end')gameAct('end');}
  else if(k==='c'&&S.phase==='buy')gameAct('buy');
  else if(k==='a'&&S.phase==='buy')gameAct('auction');
});
let wakeLock=null;
async function keepAwake(){try{if(!wakeLock&&navigator.wakeLock){wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>wakeLock=null);}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(S&&!S.over)keepAwake();musicStart();}else musicStop(.1);});

