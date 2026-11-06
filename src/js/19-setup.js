// ================= Setup =================
let setup={rules:{cash:START_CASH,auction:true,under:true,pot:true},showRules:false,mode:'single',climit:12,fast:false,cpuFast:false,diff:'normal',autoEnd:true,players:[{name:T('Tu','You'),cpu:false,color:COLORS[0]},{name:'CPU Alfa',cpu:true,color:COLORS[1]},{name:'CPU Bravo',cpu:true,color:COLORS[2]}],limit:20};
function syncNames(){setup.players.forEach((p,i)=>{const v=$('#pname-'+i);if(v)p.name=v.value;});const l=$('#limit');if(l)setup.limit=+l.dataset.v;}
function showSetup(){
  const rows=setup.players.map((p,i)=>`<div class="prow">
    <span class="pcol"><button class="swatch" style="--pc:${p.color}" data-act="col" data-i="${i}" aria-label="${T('Colore','Colour')}"></button><button class="helmb" data-act="helm" data-i="${i}" aria-label="${T('Casco','Helmet')}">${helmetSVG(p.color,p.helmet||0)}</button></span>
    <input type="text" id="pname-${i}" value="${esc(p.name)}" maxlength="12" aria-label="${T('Nome','Name')}">
    <div class="seg"><button class="${p.cpu?'':'on'}" data-act="human" data-i="${i}">👤</button><button class="${p.cpu?'on':''}" data-act="cpu" data-i="${i}">🤖</button></div>
    <button class="btn xs" data-act="rm" data-i="${i}" ${setup.players.length<=2?'disabled':''} aria-label="${T('Rimuovi','Remove')}">✕</button></div>`).join('');
  openSheet(`<h2>${T('Griglia di partenza','Starting grid')}</h2>
    <div class="seg">${MODES.map(([v,l])=>`<button class="${setup.mode===v?'on':''}" data-act="mode" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="tiles" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${rows}</div>
    <div class="row"><button class="btn sm" data-act="add" ${setup.players.length>=6?'disabled':''}>+ ${T('Pilota','Driver')}</button>
      <div class="seg">${[[false,T('Ritmo normale','Normal pace')],[true,T('Veloce','Fast')]].map(([v,l])=>`<button class="${setup.fast===v?'on':''}" data-act="pace" data-v="${v}">${l}</button>`).join('')}</div>
      <div class="seg">${[[false,T('CPU normali','Normal CPUs')],[true,T('⏩ CPU rapide','⏩ Fast CPUs')]].map(([v,l])=>`<button class="${setup.cpuFast===v?'on':''}" data-act="cpufast" data-v="${v}">${l}</button>`).join('')}</div>
      <div class="seg">${[[true,T('Fine turno auto','Auto end turn')],[false,T('Manuale','Manual')]].map(([v,l])=>`<button class="${setup.autoEnd===v?'on':''}" data-act="autoend" data-v="${v}">${l}</button>`).join('')}</div>
      <div class="seg">${DIFFS.map(([v,l])=>`<button class="${setup.diff===v?'on':''}" data-act="diff" data-v="${v}">${l}</button>`).join('')}</div>
      ${setup.mode==='single'
        ?`<div class="seg" id="limit" data-v="${setup.limit}">${[[12,T('12 giri','12 laps')],[20,T('20 giri','20 laps')],[30,T('30 giri','30 laps')],[0,T('∞ Ultimo in gara','∞ Last one standing')]].map(([v,l])=>`<button class="${setup.limit==v?'on':''}" data-act="lim" data-v="${v}">${l}</button>`).join('')}</div>`
        :`<div class="seg">${[8,12,15].map(v=>`<button class="${setup.climit==v?'on':''}" data-act="climit" data-v="${v}">${v} ${T('giri a gara','laps per race')}</button>`).join('')}</div>`}</div>
    <button class="btn sm rulesbtn" data-act="hrules" aria-expanded="${setup.showRules}">⚖️ ${T('Regole della casa','House rules')} ${setup.showRules?'▴':'▾'}</button>
    ${setup.showRules?`<div class="hrules">
      <div class="setrow"><span>💶 ${T('Soldi iniziali','Starting cash')}</span><div class="seg">${[1000,1400,2000].map(v=>`<button class="${setup.rules.cash===v?'on':''}" data-act="rule" data-k="cash" data-v="${v}">${fmt(v)}</button>`).join('')}</div></div>
      ${[['auction','🔨 '+T('Aste','Auctions')],['under','🕶️ '+T('Accordi sotto banco','Under-the-table deals')],['pot','🚨 '+T('Montepremi Safety Car','Safety Car jackpot')]].map(([k,l])=>`<div class="setrow"><span>${l}</span><div class="seg">${[[true,T('Sì','On')],[false,T('No','Off')]].map(([v,t])=>`<button class="${setup.rules[k]===v?'on':''}" data-act="rule" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div></div>`).join('')}
    </div>`:''}
    <div class="row"><button class="btn primary" data-act="start">🚦 ${T('Via!','Go!')}</button>${S&&!S.over?`<button class="btn out" data-act="close">${T('Riprendi','Resume')}</button>`:'<button class="btn out" data-act="menu">‹ Menu</button>'}</div>`,!!S);
}
async function chooseOrder(){
  const res={};let cont=S.players.map(p=>p.id),tie=false;
  const view=(btn)=>{
    const sums=cont.filter(id=>res[id]).map(id=>res[id][0]+res[id][1]),mx=Math.max(0,...sums);
    return `<h2>🏎️ ${T('Chi parte in pole?','Who starts on pole?')}</h2>${tie?`<p><b>${T('Pari! Spareggio.','Tie! Roll-off.')}</b></p>`:''}
      <div class="order">${S.players.map(p=>{const r=res[p.id];const on=r&&cont.includes(p.id)&&r[0]+r[1]===mx;
        return `<div class="${on?'best':''}">${tok(p)}<span>${esc(p.name)}</span><span class="dd">${r?`<span class="die">${dieHTML(r[0])}</span><span class="die">${dieHTML(r[1])}</span>`:'<span class="muted">…</span>'}</span><span class="sum">${r?r[0]+r[1]:''}</span></div>`;}).join('')}</div>${btn}`;
  };
  for(let guard=0;guard<10&&cont.length>1;guard++){
    for(const id of cont){
      const p=P(id);
      if(p.cpu){openSheet(view(`<div class="waitline">${tok(p)} ${esc(p.name)} ${T('lancia…','is rolling…')}</div>`),false);await wait(550);}
      else await askFor(p,'roll')(view(`${handoff(p)}<div class="row"><button class="btn primary" data-choice="roll">🎲 ${T('Lancia','Roll')} ${esc(p.name)}</button></div>`));
      res[id]=[rnd6(),rnd6()];sfx('dice');
      openSheet(view(''),false);await wait(450);
    }
    const mx=Math.max(...cont.map(id=>res[id][0]+res[id][1]));
    const top=cont.filter(id=>res[id][0]+res[id][1]===mx);
    if(top.length>1){tie=true;cont=top;cont.forEach(id=>delete res[id]);openSheet(view(''),false);await wait(700);}
    else cont=top;
  }
  const w=P(cont[0]);
  sfx('engine');
  const pole=`<div class="pole">${tok(w)} ${esc(w.name)} ${T('parte in pole!','starts on pole!')}</div>`;
  if(S.players.every(p=>p.cpu)){openSheet(view(pole),false);await wait(1200);}
  else if(NET.on){openSheet(view(pole),false);await wait(1800);}
  else await ask(view(pole+`<div class="row"><button class="btn primary" data-choice="go">🚦 ${T('Semaforo verde','Lights out')}</button></div>`));
  closeSheet();
  return w.id;
}
const DAILY_KEY='paddock-tycoon-daily';
const todayStr=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const dailySeed=ds=>[...('PT'+ds)].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
function dailyRec(){try{return JSON.parse(lsGet(DAILY_KEY))||{};}catch(e){return {};}}
let DAILY_PENDING=null,SETUP_BAK=null;
function startDaily(){
  const date=todayStr();
  SETUP_BAK=JSON.parse(JSON.stringify(setup));
  setup.mode='single';setup.limit=15;setup.diff='normal';setup.rules={cash:START_CASH,auction:true,under:true,pot:true};
  setup.players=[{name:lsGet(NAME_KEY)||T('Tu','You'),cpu:false,color:COLORS[0],helmet:(setup.players[0]&&setup.players[0].helmet)||0},
    {name:'CPU Alfa',cpu:true,color:COLORS[1]},{name:'CPU Bravo',cpu:true,color:COLORS[2]},{name:'CPU Charlie',cpu:true,color:COLORS[3]}];
  DAILY_PENDING={date,seed:dailySeed(date)};
  startGame(null);
}
function showDailyResult(){
  const d=S.daily,me=S.players.find(mineHuman);if(!d||!me)return '';
  const score=me.out?0:netWorth(me),pos=ranking().indexOf(me)+1;
  const rec=dailyRec(),r=rec[d.date]||{best:0,pos:9,tries:0};
  if(!S.dailySaved){S.dailySaved=true;r.tries++;if(score>r.best){r.best=score;r.pos=pos;}rec[d.date]=r;
    const keys=Object.keys(rec).sort();while(keys.length>30)delete rec[keys.shift()];lsSet(DAILY_KEY,JSON.stringify(rec));save();}
  const share=T(`Paddock Tycoon · Sfida del giorno ${d.date}: ${fmt(score)} (${pos}° posto)`,`Paddock Tycoon · Daily challenge ${d.date}: ${fmt(score)} (P${pos})`);
  return `<div class="daily"><h3>📅 ${T('Sfida del giorno','Daily challenge')} · ${d.date}</h3>
    <div class="ptiles"><div class="ptile"><small>${T('Questa partita','This run')}</small><b>${fmt(score)}</b></div><div class="ptile"><small>${T('Record di oggi','Today\'s best')}</small><b>${fmt(r.best)}</b></div><div class="ptile"><small>${T('Tentativi','Attempts')}</small><b>${r.tries}</b></div></div>
    <div class="joinrow"><input type="text" readonly id="dshare" value="${esc(share)}" aria-label="${T('Risultato','Result')}"><button class="btn sm" data-act="dcopy">📋 ${T('Copia','Copy')}</button></div></div>`;
}
async function startGame(champ=null){
  hideMenu();musicStop();GEN++;
  syncNames();
  setup.players.forEach((p,i)=>{p.name=(p.name||'').trim()||`${T('Pilota','Driver')} ${i+1}`;});
  if(!champ&&setup.mode!=='single'){
    const n=setup.mode==='c5'?5:3;
    const names=shuffle(RACES.filter(r=>r!==FINALE)).slice(0,n-1).concat(FINALE);
    champ={n,idx:0,names,pts:setup.players.map(()=>0),wins:setup.players.map(()=>0),limit:setup.climit||12,results:[]};
  }
  S={players:setup.players.map((p,i)=>({id:i,name:p.name,color:p.color,cpu:p.cpu,uid:p.uid||null,helmet:p.helmet||0,cash:setup.rules.cash,pos:0,out:false,stopgo:false,flags:0,loan:null})),
    own:{},roys:[],pacts:[],turn:0,phase:'roll',doubles:0,lastDbl:false,dice:[5,2],round:1,limit:setup.limit,
    deck:shuffle([...CARDS.keys()]),deckPos:0,log:[],msg:null,over:false,pending:null,asked:{},
    pot:0,weekend:null,stats:{},first:0,fast:setup.fast,cpuFast:setup.cpuFast,diff:setup.diff,autoEnd:setup.autoEnd,rules:{...setup.rules},hist:[],champ};
  if(champ) S.limit=champ.limit;
  if(DAILY_PENDING){
    S.daily=DAILY_PENDING;DAILY_PENDING=null;S.rngN=0;setRng(S.daily.seed,0);
    S.deck=shuffle([...CARDS.keys()]);
    const free=shuffle(SQ.map((q,i)=>i).filter(i=>SQ[i].t==='c'));
    S.players.forEach((p,k)=>{for(const i of free.slice(k*2,k*2+2))S.own[i]={owner:p.id,level:0,mort:false};});
    if(SETUP_BAK){Object.assign(setup,SETUP_BAK);SETUP_BAK=null;}
  }else setRng(null);
  S.phase='order';
  $('#cars').innerHTML='';for(const k in carRot)delete carRot[k];for(const k in prevCash)delete prevCash[k];
  closeSheet();render();
  if(champ){sfx('engine');await ask(`<h2>🏆 ${esc(champ.names[champ.idx])}</h2><p>${T('Gara','Race')} ${champ.idx+1} ${T('di','of')} ${champ.n} · ${champ.limit} ${T('giri','laps')}${champ.idx===champ.n-1?T(' · <b>punti doppi</b>',' · <b>double points</b>'):''}</p>${champ.idx?champTable(champ):''}<div class="row"><button class="btn primary" data-choice="go">${T('Allo schieramento','To the grid')}</button></div>`);closeSheet();}
  if(!NET.on&&!tutDone()) await tutorial();
  const w=await chooseOrder();
  S.first=S.turn=w;S.phase='roll';recordHist();
  log(T('Semaforo verde!','Lights out!'));pickWeekend();sfx('engine');setTimeout(musicStart,900);startTurn();
}

