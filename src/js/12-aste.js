// ================= Aste =================
function cpuMaxBid(p,i){
  const sq=SQ[i];let v=sq.price;
  if(sq.g){
    const idx=groupIdx(sq.g),mine=idx.filter(j=>S.own[j]&&S.own[j].owner===p.id).length;
    if(mine===idx.length-1) v*=1.8; else if(mine>0) v*=1.3;
    if(S.players.some(o=>o!==p&&!o.out&&idx.filter(j=>S.own[j]&&S.own[j].owner===o.id).length===idx.length-1)) v*=1.35;
  }
  return Math.min(Math.floor(v*df().bid*(.85+rand()*.3)),p.cash-60);
}
async function auction(i){
  const sq=SQ[i];
  let ids=S.players.filter(p=>!p.out).map(p=>p.id);
  const start=ids.indexOf(S.turn);ids=ids.slice(start).concat(ids.slice(0,start));
  const all=[...ids];let bid=0,leader=null,k=0;const max={};
  sfx('gavel');S.phase='auction';
  const view=(p,human)=>`${human?handoff(p):''}<h2>🔨 ${T('Asta','Auction')} · ${esc(sq.name)}</h2>
    <div class="auc"><div class="thumb">${sq.t==='c'?trackSVG(i,'mini'):`<div class="band" style="--g:${gcol(i)};width:8px;height:56px"></div>`}</div>
    <div><div class="big">${fmt(bid)}</div><div class="who">${leader!==null?tok(P(leader))+' '+esc(P(leader).name):'<span class="muted">'+T('Nessuna offerta · listino ','No bids yet · list price ')+fmt(sq.price)+'</span>'}</div></div></div>
    <div class="bidders">${all.map(id=>`<span class="${ids.includes(id)?'':'gone'}">${tok(P(id))}${esc(P(id).name)}</span>`).join('')}</div>
    ${human?`<div class="row">${[10,50,100].map(n=>`<button class="btn ${n===10?'primary':'dark'}" data-choice="${n}" ${bid+n>p.cash?'disabled':''}>+${n}</button>`).join('')}<button class="btn out" data-choice="pass">${T('Passo','Pass')}</button></div>`
      :`<div class="waitline">${tok(p)} ${esc(p.name)} ${T('ci pensa…','is thinking…')}</div>`}`;
  for(let guard=0;guard<300&&ids.length;guard++){
    if(ids.length===1&&leader===ids[0]) break;
    const pid=ids[k%ids.length];
    if(pid===leader){k++;continue;}
    const p=P(pid);let c;
    if(p.cpu){
      openSheet(view(p,false),false);await wait(650);
      if(max[pid]===undefined) max[pid]=cpuMaxBid(p,i);
      const room=max[pid]-bid;
      c= room>=10 ? (room>150&&rand()<.4?'50':'10') : 'pass';
    } else {if(NET.on&&!isMine(p))openSheet(view(p,false),false);c=await ask(view(p,true),p,'pass');}
    if(c==='pass'){ids.splice(k%ids.length,1);log(T(`${p.name} passa`,`${p.name} passes`));sfx('no');}
    else{bid+=+c;leader=pid;k++;sfx('bid');}
  }
  closeSheet();
  if(leader!==null){
    const w=P(leader);w.cash-=bid;S.own[i]={owner:w.id,level:0,mort:false};deedFx(i,w.id);pgsGroups(w);
    sfx('gavel');setMsg(T(`🔨 ${w.name} vince ${sq.code} a ${fmt(bid)}`,`🔨 ${w.name} wins ${sq.code} for ${fmt(bid)}`),'good');log(T(`Asta: ${w.name} compra ${sq.name} per ${fmt(bid)}`,`Auction: ${w.name} buys ${sq.name} for ${fmt(bid)}`));
  } else {setMsg(T(`${sq.code}: nessuna offerta`,`${sq.code}: no bids`));log(T(`Asta deserta per ${sq.name}`,`No bids for ${sq.name}`));}
}

