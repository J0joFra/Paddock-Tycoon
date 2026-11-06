// ================= Economia =================
function gain(p,n){p.cash+=n;sfx('coin');log(`${p.name} +${fmt(n)}`);}
function lvCost(i,l){const up=G[SQ[i].g].up,b=l===4?up*2:up,o=S.own[i];return b;}
function upCost(i){return lvCost(i,S.own[i].level+1);}
function levelValue(i,l){const up=G[SQ[i].g].up;return l<=3?l*up:5*up;}
function propValue(i){const o=S.own[i];return (o.mort?SQ[i].price/2:SQ[i].price)+(SQ[i].t==='c'?levelValue(i,o.level):0);}
function netWorth(p){return p.cash+propsOf(p).reduce((a,i)=>a+propValue(i),0)-(p.loan?p.loan.owe:0);}
const mortValue=i=>Math.floor(SQ[i].price/2);
const unmortCost=i=>r5(SQ[i].price*.55);
function pactActive(a,b){return (S.pacts||[]).some(x=>((x.a===a&&x.b===b)||(x.a===b&&x.b===a))&&S.round<=x.until);}
function roysOn(i){return (S.roys||[]).filter(r=>r.prop===i&&S.round<=r.until);}
function rentOf(i){
  const sq=SQ[i],o=S.own[i],owner=P(o.owner);
  if(o.mort) return 0;
  if(sq.t==='u'){const n=propsOf(owner).filter(j=>SQ[j].t==='u'&&!S.own[j].mort).length;return (S.dice[0]+S.dice[1])*(n===2?12:5);}
  const t=rentTable(sq);
  let r=o.level===0?(ownsGroup(owner,sq.g)?t[0]*2:t[0]):t[o.level];
  if(S.weekend===i) r*=2;
  return r;
}
function pickWeekend(){
  const cs=SQ.map((s,i)=>i).filter(i=>SQ[i].t==='c');
  S.weekend=cs[Math.floor(rand()*cs.length)];
  log(T(`🏁 GP del weekend: ${SQ[S.weekend].name} · diritti ×2`,`🏁 Weekend GP: ${SQ[S.weekend].name} · fees ×2`));
}
const st=id=>(S.stats=S.stats||{})[id]||(S.stats[id]={rent:0,deals:0,built:0});
function canUpgrade(p,i){const sq=SQ[i],o=S.own[i];return sq.t==='c'&&o&&o.owner===p.id&&o.level<4&&ownsGroup(p,sq.g)&&!groupHasMort(sq.g)&&p.cash>=upCost(i);}
function upgrade(i){const p=P(S.own[i].owner),c=upCost(i);p.cash-=c;S.own[i].level++;if(S.own[i].level===4)sfx('crowd');if(S.own[i].level===4&&mineHuman(p))pgsAch('grand_prix');st(p.id).built++;sfx('build');log(T(`${p.name}: ${S.own[i].level===4?'GP':'tribuna'} a ${SQ[i].name} (−${fmt(c)})`,`${p.name}: ${S.own[i].level===4?'GP':'grandstand'} at ${SQ[i].name} (−${fmt(c)})`));}
function sellUpgrade(i){const o=S.own[i],p=P(o.owner),c=lvCost(i,o.level),b=Math.floor(c/2);o.level--;p.cash+=b;sfx('coin');log(T(`${p.name} smonta a ${SQ[i].name} (+${fmt(b)})`,`${p.name} dismantles at ${SQ[i].name} (+${fmt(b)})`));}
function canMortgage(i){const o=S.own[i];return o&&!o.mort&&o.level===0&&(SQ[i].t==='u'||!groupHasUpgrades(SQ[i].g));}
function mortgage(i){const o=S.own[i],p=P(o.owner);o.mort=true;p.cash+=mortValue(i);sfx('coin');log(T(`${p.name} ipoteca ${SQ[i].name} (+${fmt(mortValue(i))})`,`${p.name} mortgages ${SQ[i].name} (+${fmt(mortValue(i))})`));}
function unmortgage(i){const o=S.own[i],p=P(o.owner),c=unmortCost(i);if(p.cash<c)return;p.cash-=c;o.mort=false;sfx('pay');log(T(`${p.name} riscatta ${SQ[i].name} (−${fmt(c)})`,`${p.name} unmortgages ${SQ[i].name} (−${fmt(c)})`));}
function hasAssets(p){return propsOf(p).some(i=>S.own[i].level>0||canMortgage(i));}
function autoRaise(p,need){
  for(let g=0;g<200&&p.cash<need;g++){
    const ups=propsOf(p).filter(i=>S.own[i].level>0).sort((a,b)=>G[SQ[a].g].up-G[SQ[b].g].up);
    if(ups.length){sellUpgrade(ups[0]);continue;}
    const m=propsOf(p).filter(canMortgage).sort((a,b)=>SQ[a].price-SQ[b].price);
    if(m.length){mortgage(m[0]);continue;}
    break;
  }
}
async function pay(p,amt,creditor,why,opt={}){
  if(p.out||amt<=0) return true;
  if(p.cash<amt){
    sfx('alarm');
    if(p.cpu) autoRaise(p,amt); else await debtScreen(p,amt,creditor,why);
  }
  if(p.cash<amt){await bankrupt(p,creditor);return false;}
  p.cash-=amt; if(creditor) creditor.cash+=amt; else if(RU().pot) S.pot=(S.pot||0)+amt;
  coinFx(p.id,creditor?creditor.id:'pot',amt);
  sfx('pay'); log(`${p.name} −${fmt(amt)}${creditor?' → '+creditor.name:''} · ${why}`);
  return true;
}
async function bankrupt(p,creditor){
  sfx('bankrupt');
  if(creditor){creditor.cash+=p.cash;}
  for(const i of propsOf(p)){ if(creditor){S.own[i].owner=creditor.id;S.own[i].level=0;} else delete S.own[i]; }
  p.cash=0;p.out=true;p.stopgo=false;p.outAt=Date.now();
  S.roys=(S.roys||[]).filter(r=>r.holder!==p.id);
  S.pacts=(S.pacts||[]).filter(x=>x.a!==p.id&&x.b!==p.id);
  log(T(`💥 ${p.name} in bancarotta${creditor?': tutto a '+creditor.name:''}`,`💥 ${p.name} is bankrupt${creditor?': everything goes to '+creditor.name:''}`));
  setMsg(T(`${p.name} in bancarotta!`,`${p.name} is bankrupt!`),'warn'); render(); await wait(900);
  checkOver();
}
function checkOver(){if(S.players.filter(p=>!p.out).length<=1&&!S.over)endGame();}
function ranking(){return [...S.players].sort((a,b)=>(a.out-b.out)||(netWorth(b)-netWorth(a))||((b.outAt||0)-(a.outAt||0)));}
function recordHist(){S.hist=S.hist||[];if(S.players.some(p=>mineHuman(p)&&!p.out&&netWorth(p)>=10000))pgsAch('tycoon');const v=S.players.map(p=>p.out?0:Math.max(0,netWorth(p)));const last=S.hist[S.hist.length-1];if(last&&last.r===S.round)last.v=v;else S.hist.push({r:S.round,v});}
function endGame(){
  recordHist();
  S.over=true;S.phase='over';
  const w=ranking()[0];
  const c=S.champ;
  if(c&&!S.scored){
    S.scored=true;const mult=c.idx===c.n-1?2:1;
    S.gained=ranking().map((p,k)=>{const g=(PTS[k]||0)*mult;c.pts[p.id]+=g;return g;});
    c.wins[w.id]++;c.results.push(ranking().map(p=>p.id));
  }
  setMsg(c?T(`🏁 ${w.name} vince il ${c.names[c.idx]}!`,`🏁 ${w.name} wins the ${c.names[c.idx]}!`):T(`🏁 ${w.name} campione!`,`🏁 ${w.name} is the champion!`),'good');log(T(`Bandiera a scacchi: vince ${w.name}`,`Chequered flag: ${w.name} wins`));
  sfx('win');sfx('crowd');save();render();confetti(220);gameEndLocal(w);showGameOver();
}

