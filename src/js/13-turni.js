// ================= Turni =================
function afterPhase(){const p=cur();return (S.lastDbl&&!p.out&&!p.stopgo&&!S.over)?'roll':'end';}
async function roll(){
  if(busy||S.over||S.phase!=='roll') return;
  busy=true;render();
  const p=cur(),d1=rnd6(),d2=rnd6();
  await animateDice(d1,d2);
  S.dice=[d1,d2];S.lastDbl=d1===d2;if(S.lastDbl)S.doubles++;
  log(`${p.name} 🎲 ${d1}+${d2}${S.lastDbl?T(' doppio',' double'):''}`);
  if(S.doubles>=3) await stopGo(p,T('3 doppi: Stop & Go','3 doubles: Stop & Go'));
  else{setMsg(S.lastDbl?T(`Doppio! ${d1+d2}`,`Double! ${d1+d2}`):`${d1+d2}`);await moveSteps(p,d1+d2);await resolve(p);}
  if(S.phase!=='buy'&&!S.over) S.phase=afterPhase();
  busy=false;save();render();
}
function buy(){
  if(S.phase!=='buy'||busy) return;
  const p=cur(),i=S.pending,sq=SQ[i];if(p.cash<sq.price)return;
  p.cash-=sq.price;S.own[i]={owner:p.id,level:0,mort:false};sfx('buy');deedFx(i,p.id);
  log(T(`${p.name} compra ${sq.name} (${fmt(sq.price)})`,`${p.name} buys ${sq.name} (${fmt(sq.price)})`));
  const full=sq.g&&ownsGroup(p,sq.g);
  pgsGroups(p);
  setMsg(full?T(`Gruppo ${G[sq.g].n} completo!`,`${G[sq.g].n} group complete!`):T(`${sq.code} è tuo`,`${sq.code} is yours`),'good');
  if(full) confetti(80);
  S.pending=null;S.phase=afterPhase();save();render();
}
async function toAuction(){
  if(S.phase!=='buy'||busy) return;
  busy=true;const i=S.pending;S.pending=null;
  if(RU().auction)await auction(i);
  else{log(T(`${cur().name} lascia ${SQ[i].name}`,`${cur().name} passes on ${SQ[i].name}`));setMsg(T(`${SQ[i].code} resta libero`,`${SQ[i].code} stays for sale`));}
  S.phase=afterPhase();busy=false;save();render();
}
function endTurn(){if(S.over||busy||S.phase!=='end')return;nextTurn();}
function nextTurn(){
  if(S.over) return;
  const n=S.players.length;let i=S.turn,k=0,crossed=false;
  do{i=(i+1)%n;k++;if(i===(S.first||0))crossed=true;}while(P(i).out&&k<=n);
  if(crossed){
    S.round++;
    const exp=(S.roys||[]).filter(r=>S.round>r.until).length+(S.pacts||[]).filter(x=>S.round>x.until).length;
    S.roys=(S.roys||[]).filter(r=>S.round<=r.until);S.pacts=(S.pacts||[]).filter(x=>S.round<=x.until);
    if(exp) log(T(`${exp} accordi sotto banco scaduti`,`${exp} under-the-table deals expired`));
    recordHist();
    if(S.limit&&S.round>S.limit){log(T(`Fine dei ${S.limit} giri`,`${S.limit} laps completed`));endGame();return;}
    pickWeekend();
  }
  S.turn=i;startTurn();
}
async function startTurn(){
  const p=cur();
  S.doubles=0;S.lastDbl=false;S.phase='roll';S.pending=null;S.autoOff=false;
  if(isMine(cur()))TURBO=false;
  setMsg(T(`Tocca a ${p.name}`,`${p.name}'s turn`));banner(p);keepAwake();
  if(p.loan&&S.round>p.loan.due){
    const owe=r5(p.loan.owe*1.2);p.loan=null;
    setMsg(T(`🦈 Lo strozzino riscuote ${fmt(owe)}`,`🦈 The loan shark collects ${fmt(owe)}`),'warn');log(T(`🦈 Lo strozzino riscuote ${fmt(owe)} da ${p.name} (con mora)`,`🦈 The loan shark collects ${fmt(owe)} from ${p.name} (with penalty)`));sfx('siren');render();await wait(900);
    await pay(p,owe,null,T('strozzino','loan shark'),{full:true});
    if(p.out||S.over){save();render();if(!S.over){await wait(700);nextTurn();}return;}
  }
  if(p.stopgo){
    S.phase='stopgo';save();render();
    const c=p.cpu?cpuStopGo(p):await askFor(p,'skip')(`${handoff(p)}<h2>🚦 Stop &amp; Go</h2><p>${esc(p.name)} ${T('è fermo in Pit Lane.','is stuck in Pit Lane.')}</p>
      <div class="row">
        ${p.flags>0?`<button class="btn primary" data-choice="flag">${T('Bandiera verde','Green flag')} ×${p.flags}</button>`:''}
        <button class="btn ${p.flags?'dark':'primary'}" data-choice="pay" ${p.cash>=STOPGO_FEE?'':'disabled'}>${T('Paga','Pay')} ${fmt(STOPGO_FEE)}</button>
        <button class="btn dark" data-choice="bribe" ${p.cash>=BRIBE?'':'disabled'}>🕶️ ${T('Bustarella','Bribe')} ${fmt(BRIBE)} <small>50%</small></button>
        <button class="btn out" data-choice="skip">${T('Salto il turno','Skip my turn')}</button>
      </div>`);
    closeSheet();
    p.stopgo=false;
    if(c==='flag'){p.flags--;log(T(`${p.name} usa Bandiera verde`,`${p.name} uses a Green flag`));sfx('coin');S.phase='roll';}
    else if(c==='pay'){p.cash-=STOPGO_FEE;if(RU().pot)S.pot=(S.pot||0)+STOPGO_FEE;sfx('pay');log(T(`${p.name} paga lo Stop & Go`,`${p.name} pays the Stop & Go`));S.phase='roll';}
    else if(c==='bribe'){
      p.cash-=BRIBE;if(RU().pot)S.pot=(S.pot||0)+BRIBE;sfx('pay');
      if(rand()<.5){if(mineHuman(p))pgsAch('bribe');setMsg(T('🕶️ Commissari corrotti: si riparte!','🕶️ Stewards bribed: back on track!'),'good');log(T(`${p.name} corrompe i commissari`,`${p.name} bribes the stewards`));S.phase='roll';sfx('deal');}
      else{setMsg(T('🕶️ Bustarella scoperta! Turno saltato','🕶️ Bribe exposed! Turn skipped'),'warn');log(T(`${p.name} scoperto a corrompere i commissari`,`${p.name} caught bribing the stewards`));S.phase='end';sfx('siren');}
    }
    else{setMsg(T(`${p.name} sconta lo Stop & Go`,`${p.name} serves the Stop & Go`),'warn');log(T(`${p.name} salta il turno`,`${p.name} skips a turn`));S.phase='end';}
    save();render();
    if(S.phase==='end'){await wait(900);endTurn();return;}
  }
  save();render();
  if(p.cpu) cpuTurn();
}

