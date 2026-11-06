// ================= CPU =================
function cpuStopGo(p){
  if(p.flags>0) return 'flag';
  if(p.cash>=400&&rand()<.25) return 'bribe';
  if(p.cash>=250) return 'pay';
  return 'skip';
}
// Diritto più alto che la CPU rischia di pagare nelle prossime 12 caselle
function dangerAhead(p){
  let m=0;for(let d=2;d<=12;d++){const i=(p.pos+d)%32,o=S.own[i];if(o&&o.owner!==p.id&&!o.mort&&!P(o.owner).out&&!pactActive(p.id,o.owner))m=Math.max(m,SQ[i].t==='u'?60:rentOf(i));}
  return m;
}
function completesFor(q,i){const sq=SQ[i];return !!sq.g&&groupIdx(sq.g).every(j=>j===i||(S.own[j]&&S.own[j].owner===q.id));}
function cpuWantsBuy(p,i){
  const sq=SQ[i];
  const completes=completesFor(p,i),blocks=S.players.some(q=>q!==p&&!q.out&&completesFor(q,i));
  if(p.cash<sq.price){
    if(completes&&!p.loan&&S.diff!=='easy'){const need=sq.price-p.cash;const n=[100,200,300].find(v=>v>=need+30);
      if(n){p.cash+=n;p.loan={owe:Math.round(n*1.3),due:S.round+3};log(T(`🦈 ${p.name} prende ${fmt(n)} dallo strozzino`,`🦈 ${p.name} borrows ${fmt(n)} from the loan shark`));return true;}}
    return false;
  }
  if(completes)return true;
  const reserve=Math.max(df().reserve,dangerAhead(p)*.6)*(blocks?.5:1);
  return p.cash-sq.price>=reserve;
}
function cpuManage(p){
  // restituisce il prestito appena può permetterselo
  if(p.loan&&p.cash-p.loan.owe>=Math.max(250,dangerAhead(p))){p.cash-=p.loan.owe;log(T(`${p.name} salda lo strozzino (${fmt(p.loan.owe)})`,`${p.name} pays off the loan shark (${fmt(p.loan.owe)})`));p.loan=null;}
  const building=propsOf(p).some(i=>SQ[i].t==='c'&&S.own[i].level<4&&ownsGroup(p,SQ[i].g));
  for(const i of propsOf(p)) if(S.own[i].mort&&p.cash-unmortCost(i)>=(building?650:400)) unmortgage(i);
  // ipoteca circuiti isolati per finanziare tribune su un gruppo completo
  if(S.diff!=='easy'){
    const target=propsOf(p).filter(i=>SQ[i].t==='c'&&S.own[i].level<4&&ownsGroup(p,SQ[i].g)&&!groupHasMort(SQ[i].g));
    if(target.length){
      const cost=Math.min(...target.map(upCost));
      const lone=propsOf(p).filter(i=>canMortgage(i)&&(SQ[i].t==='u'||!ownsGroup(p,SQ[i].g))).sort((a,b)=>SQ[a].price-SQ[b].price);
      for(let k=0;k<2&&lone.length&&p.cash<cost+df().build;k++)mortgage(lone.shift());
    }
  }
  for(let n=0;n<20;n++){
    const o=propsOf(p).filter(i=>canUpgrade(p,i)&&p.cash-upCost(i)>=df().build).sort((a,b)=>S.own[a].level-S.own[b].level||upCost(a)-upCost(b));
    if(!o.length)break;upgrade(o[0]);
  }
}
async function cpuSeekTrade(p){
  S.asked=S.asked||{};
  if(rand()>df().trade) return;
  // vende a caro prezzo un circuito che completa il gruppo di un avversario, se è a corto di soldi
  if(p.cash<220){
    for(const i of tradable(p)){const q=S.players.find(x=>x!==p&&!x.out&&completesFor(x,i));if(!q)continue;
      const key='s'+p.id+'-'+i;if(S.asked[key]&&S.round-S.asked[key]<5)continue;S.asked[key]=S.round;
      const price=r10(SQ[i].price*(2.3+rand()*.6));if(q.cash<price)continue;
      const offer=blankOffer(p.id,q.id);offer.give=[i];offer.cashGet=price;
      if(RU().under&&rand()<.5)offer.royGive={pct:[20,30,40][Math.floor(rand()*3)],turns:2};
      await negotiate(offer);render();await wait(400);return;}
  }
  // patto di non belligeranza con chi ha i diritti più pericolosi
  if(RU().under&&rand()<.2&&p.cash>300){
    const q=rivals(p).filter(x=>rentPower(x)>rentPower(p)*1.6&&!pactActive(p.id,x.id)).sort((a,b)=>rentPower(b)-rentPower(a))[0];
    const key='p'+p.id+'-'+(q&&q.id);
    if(q&&!(S.asked[key]&&S.round-S.asked[key]<6)){S.asked[key]=S.round;
      const offer=blankOffer(p.id,q.id);offer.pact=2;offer.cashGive=r10(Math.min(p.cash-200,rentPower(q)*.35+60));
      if(offer.cashGive>0){await negotiate(offer);render();await wait(400);return;}}
  }
  for(const g of Object.keys(G)){
    if(groupHasUpgrades(g)) continue;
    const idx=groupIdx(g),mine=idx.filter(i=>S.own[i]&&S.own[i].owner===p.id);
    if(mine.length!==idx.length-1) continue;
    const j=idx.find(i=>!mine.includes(i));
    if(!S.own[j]||S.own[j].owner===p.id) continue;
    const q=P(S.own[j].owner),key=p.id+'-'+j;
    if(S.asked[key]&&S.round-S.asked[key]<4) continue;
    S.asked[key]=S.round;
    const swap=tradable(p).find(i=>{const s=SQ[i];return s.g&&s.g!==g&&groupIdx(s.g).every(k=>k===i||(S.own[k]&&S.own[k].owner===q.id));});
    const cash=r10(SQ[j].price*(1.6+rand()*.6));
    if(swap===undefined&&p.cash-cash<200) continue;
    const offer=blankOffer(p.id,q.id);
    offer.get=[j];
    if(swap!==undefined) offer.give=[swap]; else offer.cashGive=cash;
    // tocco "corrotto": a volte offre un patto o una percentuale
    if(RU().under&&rand()<.35) offer.pact=1+Math.floor(rand()*2);
    await negotiate(offer);
    render();await wait(400);
    return;
  }
}
async function cpuTurn(){
  if(cpuActive) return; cpuActive=true;
  let doEnd=false;const p=cur();
  try{
    await wait(700);
    for(let g=0;g<14&&!S.over&&cur()===p;g++){
      if(S.phase==='roll'){if(S.doubles===0) await cpuSeekTrade(p);cpuManage(p);render();await roll();await wait(450);}
      else if(S.phase==='buy'){if(cpuWantsBuy(p,S.pending))buy();else await toAuction();await wait(500);}
      else if(S.phase==='end'){cpuManage(p);save();render();await wait(500);doEnd=true;break;}
      else break;
    }
  } finally {cpuActive=false;}
  if(doEnd&&cur()===p) endTurn();
}

