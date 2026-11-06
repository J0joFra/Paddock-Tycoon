// ================= Movimento e caselle =================
async function moveSteps(p,n){
  const dir=Math.sign(n);stepK=0;
  for(let k=0;k<Math.abs(n);k++){
    p.pos=(p.pos+dir+32)%32;
    if(dir>0&&p.pos===0){const b=LAP_BONUS;p.cash+=b;sfx('coin');log(T(`${p.name} passa dal via +${fmt(b)}`,`${p.name} passes GO +${fmt(b)}`));}
    else sfx('step');
    render(); await wait(130);
  }
}
async function moveTo(p,t){const n=(t-p.pos+32)%32;await moveSteps(p,n===0?32:n);}
async function stopGo(p,reason){sfx('siren');setMsg(reason,'warn');log(`${p.name}: ${reason}`);p.pos=PIT;p.stopgo=true;render();await wait(700);}

async function resolve(p){
  if(p.out||S.over) return;
  const sq=SQ[p.pos];
  if(sq.t==='c'||sq.t==='u'){
    const o=S.own[p.pos];
    if(!o){S.phase='buy';S.pending=p.pos;setMsg(T(`${sq.name} libero`,`${sq.name} is for sale`));return;}
    if(o.owner===p.id){setMsg(T(`In casa a ${sq.code}`,`Home track: ${sq.code}`));return;}
    const owner=P(o.owner);
    if(o.mort){setMsg(T(`${sq.code} ipotecato: gratis`,`${sq.code} is mortgaged: free`),'good');return;}
    if(pactActive(p.id,owner.id)){setMsg(T(`🤝 Patto con ${owner.name}: gratis`,`🤝 Pact with ${owner.name}: free`),'good');log(T(`${p.name} non paga ${owner.name} (patto)`,`${p.name} pays nothing to ${owner.name} (pact)`));return;}
    const r=rentOf(p.pos);
    if(o.level===4||S.weekend===p.pos)sfx('crowd');
    setMsg(`${S.weekend===p.pos?'🏁 GP! ':''}${T('Diritti','Fee')} ${fmt(r)} → ${owner.name}`,'warn');render();
    const ok=await pay(p,r,owner,T(`diritti ${sq.name}`,`fee at ${sq.name}`));
    if(ok) st(owner.id).rent+=r;
    if(ok) for(const ry of roysOn(p.pos)){
      const h=P(ry.holder); if(h.out||ry.holder===owner.id) continue;
      const cut=Math.floor(r*ry.pct/100); if(cut<=0) continue;
      const amt=Math.min(cut,owner.cash); owner.cash-=amt; h.cash+=amt;
      log(T(`🕶️ ${h.name} incassa il ${ry.pct}% (${fmt(amt)}) su ${sq.name}`,`🕶️ ${h.name} collects ${ry.pct}% (${fmt(amt)}) on ${sq.name}`));
    }
    return;
  }
  switch(sq.t){
    case 'card':return drawCard(p);
    case 'tax':setMsg(`${sq.name} ${fmt(sq.amount)}`,'warn');await pay(p,sq.amount,null,sq.name);return;
    case 'drs':{const n=3;setMsg(T(`DRS aperto: +${n}`,`DRS open: +${n}`),'good');sfx('engine');render();await wait(500);await moveSteps(p,n);return resolve(p);}
    case 'cops':return stopGo(p,T('Commissari di gara · Stop & Go','Race stewards · Stop & Go'));
    case 'pit':setMsg(T('Transito in Pit Lane','Driving through Pit Lane'));return;
    case 'sc':
      if(S.pot>0){const w=S.pot;S.pot=0;coinFx('pot',p.id,w);gain(p,w);if(w>=200&&mineHuman(p))pgsAch('jackpot');setMsg(T(`🚨 Montepremi Safety Car: +${fmt(w)}`,`🚨 Safety Car jackpot: +${fmt(w)}`),'good');log(T(`${p.name} incassa il montepremi (${fmt(w)})`,`${p.name} collects the jackpot (${fmt(w)})`));render();if(w>=150)confetti(90);}
      else setMsg(T('Safety Car: montepremi vuoto','Safety Car: the jackpot is empty'));
      return;
    case 'go':setMsg(T('Semaforo Verde!','Green Light!'));return;
  }
}
async function drawCard(p){
  if(!S.deck||S.deckPos>=S.deck.length){S.deck=shuffle([...CARDS.keys()]);S.deckPos=0;}
  const c=CARDS[S.deck[S.deckPos++]];
  sfx('card');setMsg('📻 '+c.txt,'card');log(`${p.name} · Radio: ${c.txt}`);render();
  cardFx(c.txt);
  await wait(1900);
  await c.fx(p);
}

