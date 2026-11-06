// ================= Schede =================
function showInfo(i){
  const sq=SQ[i],o=S&&S.own[i];let h='';
  if(sq.t==='c'){
    const t=rentTable(sq),g=G[sq.g],cl=o&&!o.mort?o.level:-1;
    const cells=[['Base',t[0],0],[T('Gruppo','Group'),t[0]*2,-2],['1T',t[1],1],['2T',t[2],2],['3T',t[3],3],['GP',t[4],4]];
    h=`<div class="band" style="--g:${g.c}"></div><h2>${esc(sq.name)}</h2>
      <div class="trkcard" style="--g:${g.c}">${trackSVG(i,'big')}<span class="trkkm"><b>${T(sq.km.toFixed(3).replace('.',','),sq.km.toFixed(3))}</b> km</span><span class="trkcc">${esc(sq.country)}</span></div>
      <div class="facts"><span class="fact">${g.n}</span><span class="fact">${T('Prezzo','Price')} <b>${fmt(sq.price)}</b></span><span class="fact">${T('Tribuna','Grandstand')} <b>${fmt(g.up)}</b></span><span class="fact">GP <b>${fmt(g.up*2)}</b></span></div>
      <div class="rt">${cells.map(([l,v,k])=>`<div class="${k===cl?'cur':''}"><small>${l}</small><b>${v}</b></div>`).join('')}</div>
      <div class="facts"><span class="fact">${T('Gruppo','Group')}</span>${groupIdx(sq.g).map(j=>{const oj=S&&S.own[j];return `<span class="fact">${oj?tok(P(oj.owner)):'<span class="tk" style="--pc:#cbd2dc"></span>'} ${esc(SQ[j].code)}${oj?' · '+esc(P(oj.owner).name):' · '+T('libero','free')}</span>`;}).join('')}</div>`;
  } else if(sq.t==='u') h=`<h2>${esc(sq.name)}</h2><div class="facts"><span class="fact">${T('Prezzo','Price')} <b>${fmt(sq.price)}</b></span><span class="fact">${T('Dadi','Dice')} <b>×5</b></span><span class="fact">${T('Entrambi','Both')} <b>×12</b></span></div>`;
  else{
    const d=T({go:`+${fmt(LAP_BONUS)} a ogni passaggio`,card:'Pesca un messaggio del muretto',tax:`Paghi ${fmt(sq.amount||0)}`,drs:'Avanzi di 3',pit:'Qui si sconta lo Stop & Go',sc:'Sosta libera e montepremi',cops:'Stop & Go in Pit Lane'},{go:`+${fmt(LAP_BONUS)} every time you pass`,card:'Draw a message from the pit wall',tax:`Pay ${fmt(sq.amount||0)}`,drs:'Move forward 3',pit:'Stop & Go penalties are served here',sc:'Free parking and jackpot',cops:'Stop & Go in Pit Lane'})[sq.t];
    h=`<h2>${esc(sq.name)}</h2><p>${d}</p>`;
  }
  if(o){
    const facts=[`${tok(P(o.owner))} <b>${esc(P(o.owner).name)}</b>`];
    if(o.mort) facts.push(T('Ipotecato','Mortgaged'));
    roysOn(i).forEach(r=>facts.push(`🕶️ ${esc(P(r.holder).name)} ${r.pct}% ${T('fino al giro','until lap')} ${r.until}`));
    h+=`<div class="facts">${facts.map(f=>`<span class="fact">${f}</span>`).join('')}</div>`;
    if(S&&!S.over&&isMine(cur())){
      const me=cur(),turnOk=!busy&&['roll','end','buy'].includes(S.phase);
      if(o.owner===me.id&&turnOk) h+=`<h3>${T('Gestisci','Manage')}</h3><div class="ctl">${ctlButtons(me,i,'info')}</div>`;
      else if(o.owner!==me.id&&canTrade()){
        const ok=tradable(P(o.owner)).includes(i);
        h+=`<div class="row"><button class="btn primary" data-act="tradefor" data-i="${i}" data-o="${o.owner}" ${ok?'':'disabled'}>🤝 ${T('Tratta con','Deal with')} ${esc(P(o.owner).name)}</button></div>${ok?'':`<p>${T('Ha tribune nel gruppo: prima deve smontarle.','The group has grandstands: they must be dismantled first.')}</p>`}`;
      }
    }
  }
  openSheet(h+`<div class="row"><button class="btn dark" data-act="close">${T('Chiudi','Close')}</button></div>`);
  if(NET.on)NET.panel='info:'+i;
}
function showPlayer(id){
  const q=P(id),mine=propsOf(q).sort((a,b)=>a-b);
  const deals=[...(S.roys||[]).filter(r=>r.holder===id).map(r=>`🕶️ ${r.pct}% ${T('su','on')} ${SQ[r.prop].code} ${T('fino al giro','until lap')} ${r.until}`),
    ...(S.pacts||[]).filter(x=>x.a===id||x.b===id).map(x=>`🤝 ${T('Patto con','Pact with')} ${esc(P(x.a===id?x.b:x.a).name)} ${T('fino al giro','until lap')} ${x.until}`)];
  openSheet(`<h2>${tok(q)} ${esc(q.name)}</h2>
    <div class="facts"><span class="fact">${T('Cassa','Cash')} <b>${fmt(q.cash)}</b></span>${q.loan?`<span class="fact">🦈 ${T('Debito','Debt')} <b>${fmt(q.loan.owe)}</b> · ${T('giro','lap')} ${q.loan.due}</span>`:''}<span class="fact">${T('Patrimonio','Net worth')} <b>${fmt(netWorth(q))}</b></span><span class="fact">${T('Diritti/giro','Fees/lap')} ~<b>${fmt(rentPower(q))}</b></span></div>
    <div class="picks">${mine.map(i=>`<span class="pick ${S.own[i].mort?'mort':''}"><span class="sw" style="--g:${gcol(i)}"></span>${SQ[i].code}${S.own[i].level?' · '+LV_SHORT[S.own[i].level]:''}</span>`).join('')||`<span class="muted">${T('Nessun circuito','No circuits')}</span>`}</div>
    ${deals.length?`<div class="clauses"><h3>${T('Sotto banco','Under the table')}</h3>${deals.map(d=>`<div class="cl">${d}</div>`).join('')}</div>`:''}
    <div class="row">${canTrade()&&!q.out&&q!==cur()?`<button class="btn primary" data-act="tradefor" data-o="${q.id}">🤝 ${T('Proponi affare','Propose a deal')}</button>`:''}<button class="btn dark" data-act="close">${T('Chiudi','Close')}</button></div>`);
}
function ctlButtons(p,i,ctx){
  const sq=SQ[i],o=S.own[i];let a='';
  if(o.mort) return `<button class="btn xs primary" data-act="unmort" data-ctx="${ctx}" data-i="${i}" ${p.cash>=unmortCost(i)?'':'disabled'}>${T('Riscatta','Unmortgage')} −${unmortCost(i)}</button>`;
  if(sq.t==='c'&&o.level<4&&ownsGroup(p,sq.g)) a+=`<button class="btn xs primary" data-act="up" data-ctx="${ctx}" data-i="${i}" ${canUpgrade(p,i)?'':'disabled'}>+${o.level===3?'GP':T('Tribuna','Grandstand')} ${upCost(i)}</button>`;
  if(o.level>0) a+=`<button class="btn xs dark" data-act="down" data-ctx="${ctx}" data-i="${i}">− ${T('Smonta','Dismantle')}</button>`;
  if(canMortgage(i)) a+=`<button class="btn xs" data-act="mort" data-ctx="${ctx}" data-i="${i}">${T('Ipoteca','Mortgage')} +${mortValue(i)}</button>`;
  return a||`<span class="muted">${T('Completa il gruppo per costruire','Complete the group to build')}</span>`;
}
function showManage(){
  const p=cur(),mine=propsOf(p).sort((a,b)=>a-b);
  const tiles=mine.map(i=>{
    const sq=SQ[i],o=S.own[i],a=ctlButtons(p,i,'manage');
    return `<div class="tile ${o.mort?'mort':''}" style="--g:${gcol(i)}"><div class="h"><b>${esc(sq.name)}</b><span>${o.mort?T('IPO','MTG'):(sq.t==='c'?LV_SHORT[o.level]:'')} · ${fmt(o.mort?0:rentOf(i))}</span></div><div class="a">${a}</div></div>`;
  }).join('');
  openSheet(`<h2>🏟️ ${T('I tuoi circuiti','Your circuits')} <span class="muted" style="font-size:15px;font-style:normal">${fmt(p.cash)}</span></h2>
    <div class="tiles">${tiles||`<p>${T('Ancora nessuno.','None yet.')}</p>`}</div>
    <div class="clauses"><h3>🦈 ${T('Strozzino del paddock','Paddock loan shark')}</h3>${p.loan
      ?`<div class="cl">${T(`Devi ${fmt(p.loan.owe)} entro il giro ${p.loan.due}. Dopo, riscuote con il 20% di mora.`,`You owe ${fmt(p.loan.owe)} by lap ${p.loan.due}. After that, he collects with a 20% penalty.`)}</div><div class="row"><button class="btn sm primary" data-act="repay" ${p.cash>=p.loan.owe?'':'disabled'}>${T('Restituisci','Repay')} ${fmt(p.loan.owe)}</button></div>`
      :`<div class="cl">${T('Contanti subito. Restituisci il 30% in più entro 3 giri.','Cash now. Pay back 30% more within 3 laps.')}</div><div class="row">${[100,200,300].map(n=>`<button class="btn sm primary" data-act="loan" data-v="${n}">+${fmt(n)}</button>`).join('')}</div>`}</div>
    <div class="row"><button class="btn dark" data-act="close">${T('Chiudi','Close')}</button></div>`);
  if(NET.on)NET.panel='manage';
}
function showRules(){
  const R=T([['🏎️ Pole position','All\'inizio tutti lanciano i dadi: il più alto parte per primo.'],['🎲 Giro',`2 dadi, +${fmt(LAP_BONUS)} al via. Doppio = rilanci; 3 doppi = Stop & Go.`],
    ['🏟️ Circuiti','Compra o manda all\'asta. Gruppo completo = diritti ×2.'],
    ['🏗️ Tribune e GP','Con il gruppo: fino a 3 tribune, poi il Gran Premio.'],
    ['🔨 Aste','Se nessuno compra, tutti rilanciano. Chi passa è fuori.'],
    ['🏦 Ipoteche','50% subito, niente diritti. Riscatti al 55%.'],
    ['💥 Bancarotta','Se non puoi pagare: smonta e ipoteca. Perdi solo senza più nulla.'],
    ['🤝 Affari','Circuiti e soldi, con controfferte a catena.'],
    ['🕶️ Sotto banco','Cedi ma tieni 10–75% dei diritti per 1–3 giri. Patti di non belligeranza.'],
    ['🚦 Stop & Go',`Paga ${fmt(STOPGO_FEE)}, usa la Bandiera verde, salta, o tenta la bustarella (50%).`],
    ['🏁 GP del weekend','A ogni giro un circuito ospita il GP: diritti ×2.'],
    ['🚨 Montepremi SC','Tasse, multe e bustarelle finiscono nel montepremi: chi si ferma sulla Safety Car lo incassa.'],
    ['🦈 Strozzino','Nella scheda Circuiti: fino a €300M subito, da restituire +30% entro 3 giri. In ritardo: +20% di mora.'],
    ['🌐 Online','Stanza con codice per gli amici o partita casuale. Se qualcuno si disconnette guida la CPU finché non rientra.'],
    ['🏆 Campionato','3 o 5 gare a giri contati. Punti per l\'ordine d\'arrivo: 25-18-15-12-10-8. L\'ultima gara vale doppio.'],
    ['⚖️ Regole della casa','Nella griglia di partenza: soldi iniziali, aste, accordi sotto banco e montepremi attivabili o no.'],
    ['📅 Sfida del giorno','Ogni giorno una partita uguale per tutti: tu contro 3 CPU per 15 giri, partenza con 2 circuiti a testa. Conta il patrimonio finale.'],
    ['🏁 Fine','Ultimo in gara, oppure patrimonio più alto a fine giri.']],[['🏎️ Pole position','At the start everyone rolls the dice: the highest starts first.'],['🎲 Lap',`2 dice, +${fmt(LAP_BONUS)} when you pass GO. Double = roll again; 3 doubles = Stop & Go.`],
    ['🏟️ Circuits','Buy it or send it to auction. Full colour group = fees ×2.'],
    ['🏗️ Grandstands and GP','With the full group: up to 3 grandstands, then the Grand Prix.'],
    ['🔨 Auctions','If nobody buys, everyone bids. Whoever passes is out.'],
    ['🏦 Mortgages','Get 50% now, no fees while mortgaged. Buy back at 55%.'],
    ['💥 Bankruptcy','Can\'t pay? Dismantle and mortgage. You only lose when nothing is left.'],
    ['🤝 Deals','Circuits and cash, with chains of counteroffers.'],
    ['🕶️ Under the table','Sell but keep 10–75% of the fees for 1–3 laps. Non-aggression pacts.'],
    ['🚦 Stop & Go',`Pay ${fmt(STOPGO_FEE)}, use a Green flag, skip a turn, or try a bribe (50%).`],
    ['🏁 Weekend GP','Every lap one circuit hosts the GP: fees ×2.'],
    ['🚨 SC jackpot','Taxes, fines and bribes go into the jackpot: land on the Safety Car to collect it.'],
    ['🦈 Loan shark','In the Circuits panel: up to €300M now, pay back +30% within 3 laps. Late: +20% penalty.'],
    ['🌐 Online','Room code for friends or a random match. If someone disconnects, the CPU drives for them until they rejoin.'],
    ['🏆 Championship','3 or 5 races with a lap limit. Points by finishing order: 25-18-15-12-10-8. The last race counts double.'],
    ['⚖️ House rules','In the starting grid: starting cash, auctions, under-the-table deals and jackpot can be switched on or off.'],
    ['📅 Daily challenge','Every day the same game for everyone: you vs 3 CPUs for 15 laps, each starting with 2 circuits. Final net worth is your score.'],
    ['🏁 Finish','Last driver standing, or highest net worth when the laps run out.']]);
  openSheet(`<h2>${T('Regolamento','Rules')}</h2><div class="rules">${R.map(([t,d])=>`<div><b>${t}</b>${d}</div>`).join('')}</div><p style="font-size:11px">${T('Tracciati disegnati da dati open source di Tomislav Bacinger (github.com/bacinger/f1-circuits, licenza MIT). Gioco di fantasia: nomi dei circuiti inventati, nessun legame con campionati, squadre o circuiti reali.','Track layouts drawn from open-source data by Tomislav Bacinger (github.com/bacinger/f1-circuits, MIT licence). A work of fiction: circuit names are invented and not affiliated with any real championship, team or circuit.')}</p><div class="row"><button class="btn primary" data-act="tutorial">🎓 ${T('Tutorial guidato','Guided tutorial')}</button><button class="btn dark" data-act="close">${T('Chiudi','Close')}</button></div>`);
}
function showLog(){openSheet(`<h2>${T('Direzione gara','Race control')}</h2><ol class="logl">${S.log.map(t=>`<li>${esc(t)}</li>`).join('')}</ol><div class="row"><button class="btn dark" data-act="close">${T('Chiudi','Close')}</button></div>`);}
function awards(){
  const best=k=>{const p=[...S.players].sort((a,b)=>st(b.id)[k]-st(a.id)[k])[0];return st(p.id)[k]>0?p:null;};
  const a=[[T('💰 Re dei diritti','💰 Fee king'),'rent',v=>fmt(v)],[T('🤝 Faccendiere','🤝 Wheeler-dealer'),'deals',v=>v+T(' affari',' deals')],[T('🏗️ Costruttore','🏗️ Builder'),'built',v=>v+T(' tribune/GP',' grandstands/GPs')]]
    .map(([t,k,f])=>{const p=best(k);return p?`<div>${t}<b>${tok(p)} ${esc(p.name)} · ${f(st(p.id)[k])}</b></div>`:'';}).join('');
  return a?`<div class="stats">${a}</div>`:'';
}
function niceStep(raw){const p=Math.pow(10,Math.floor(Math.log10(raw)));const n=raw/p;return (n<=1?1:n<=2?2:n<=5?5:10)*p;}
function chartHTML(){
  const h=S.hist||[];if(h.length<2)return '';
  const W=440,H=170,L=44,Rr=10,TP=10,B=24;
  const step=niceStep(Math.max(1,...h.flatMap(x=>x.v))/4),top=step*Math.ceil(Math.max(1,...h.flatMap(x=>x.v))/step);
  const x=k=>L+(W-L-Rr)*k/(h.length-1),y=v=>TP+(H-TP-B)*(1-v/top);
  let g='';
  for(let v=0;v<=top+1e-9;v+=step) g+=`<line x1="${L}" x2="${W-Rr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L-6}" y="${y(v)+3.5}" text-anchor="end" font-size="10" fill="var(--muted)">${v>=1000?(v/1000).toFixed(v%1000?1:0)+'k':v}</text>`;
  g+=`<text x="${L}" y="${H-6}" font-size="10" fill="var(--muted)">${T('Giro','Lap')} ${h[0].r}</text><text x="${W-Rr}" y="${H-6}" text-anchor="end" font-size="10" fill="var(--muted)">${T('Giro','Lap')} ${h[h.length-1].r}</text>`;
  const lines=S.players.map((p,pi)=>`<polyline points="${h.map((e,k)=>x(k).toFixed(1)+','+y(e.v[pi]).toFixed(1)).join(' ')}" fill="none" stroke="${p.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(h.length-1)}" cy="${y(h[h.length-1].v[pi])}" r="4" fill="${p.color}" stroke="var(--surface)" stroke-width="2"/>`).join('');
  return `<div class="nw"><h3>${T('Patrimonio giro per giro','Net worth lap by lap')}</h3><div class="nwbox"><svg viewBox="0 0 ${W} ${H}" id="nwsvg" data-l="${L}" data-r="${Rr}" data-w="${W}" role="img" aria-label="${T('Andamento del patrimonio di ogni pilota','Net worth of each driver over time')}">${g}${lines}<line id="nwx" x1="0" x2="0" y1="${TP}" y2="${H-B}" stroke="var(--muted)" stroke-width="1" visibility="hidden"/><rect x="${L}" y="${TP}" width="${W-L-Rr}" height="${H-TP-B}" fill="transparent"/></svg><div class="nwtip" id="nwtip" hidden></div></div>
    <div class="legend">${S.players.map(p=>`<span>${tok(p)} ${esc(p.name)}</span>`).join('')}</div></div>`;
}
document.addEventListener('pointermove',e=>{
  const svg=e.target.closest&&e.target.closest('#nwsvg');const tip=$('#nwtip');
  if(!svg||!tip||!S||!S.hist){if(tip)tip.hidden=true;const l=$('#nwx');if(l)l.setAttribute('visibility','hidden');return;}
  const r=svg.getBoundingClientRect(),W=+svg.dataset.w,L=+svg.dataset.l,Rr=+svg.dataset.r,h=S.hist;
  const vx=(e.clientX-r.left)/r.width*W,k=Math.max(0,Math.min(h.length-1,Math.round((vx-L)/(W-L-Rr)*(h.length-1))));
  const px=L+(W-L-Rr)*k/(h.length-1),ln=$('#nwx');ln.setAttribute('x1',px);ln.setAttribute('x2',px);ln.setAttribute('visibility','visible');
  const rows=S.players.map((p,i)=>[p,h[k].v[i]]).sort((a,b)=>b[1]-a[1]);
  tip.innerHTML=`<b>${T('Giro','Lap')} ${h[k].r}</b>${rows.map(([p,v])=>`<div>${tok(p)} ${esc(p.name)} <b>${fmt(v)}</b></div>`).join('')}`;
  tip.hidden=false;const left=px/W*r.width;tip.style.left=(left>r.width/2?left-tip.offsetWidth-10:left+10)+'px';
});
function champOrder(c){return S.players.map(p=>p.id).sort((a,b)=>c.pts[b]-c.pts[a]||c.wins[b]-c.wins[a]);}
function champTable(c){
  return `<h3>${T('Classifica piloti','Driver standings')}</h3><div class="rank">${champOrder(c).map((id,k)=>`<div><span class="pos">${k+1}</span><span>${tok(P(id))} ${esc(P(id).name)}${c.wins[id]?` <small class="muted">· ${c.wins[id]} ${c.wins[id]>1?T('vittorie','wins'):T('vittoria','win')}</small>`:''}</span><b>${c.pts[id]} ${T('pt','pts')}</b></div>`).join('')}</div>`;
}
function showGameOver(){
  const r=ranking(),c=S.champ;
  if(c){
    const last=c.idx>=c.n-1,lead=P(champOrder(c)[0]);
    if(last&&!S.champFx){S.champFx=true;setTimeout(()=>{confetti(260);sfx('win');},900);}
    openSheet(`<h2>${last?T(`🏆 ${esc(lead.name)} campione del mondo!`,`🏆 ${esc(lead.name)} is world champion!`):`🏁 ${esc(c.names[c.idx])}`}</h2>
      <h3>${T("Ordine d'arrivo",'Finishing order')}${last?T(' · punti doppi',' · double points'):''}</h3>
      <div class="rank">${r.map((p,k)=>`<div><span class="pos">${k+1}</span><span>${tok(p)} ${esc(p.name)}${p.out?' · out':''}</span><b>+${(S.gained||[])[k]||0} ${T('pt','pts')}</b></div>`).join('')}</div>
      ${champTable(c)}
      ${chartHTML()}
      ${awards()}
      <div class="row">${last?`<button class="btn primary" data-act="setup">${T('Nuovo campionato','New championship')}</button>`:`<button class="btn primary" data-act="nextrace">▶ ${esc(c.names[c.idx+1])}</button>`}<button class="btn dark" data-act="home">🏠 Menu</button></div>`);
    return;
  }
  openSheet(`<h2>🏁 ${T(`${esc(r[0].name)} campione!`,`${esc(r[0].name)} is the champion!`)}</h2>
    <div class="rank">${r.map((p,k)=>`<div><span class="pos">${k+1}</span><span>${tok(p)} ${esc(p.name)}${p.out?' · out':''}</span><b>${fmt(netWorth(p))}</b></div>`).join('')}</div>
    ${S.daily?showDailyResult():''}
    ${chartHTML()}
    ${awards()}
    <div class="row">${S.daily?`<button class="btn primary" data-act="daily">🔁 ${T('Riprova la sfida','Retry the challenge')}</button>`:''}${NET.on?(NET.host?`<button class="btn primary" data-act="orematch">${T('Rivincita','Rematch')}</button>`:''):`${S.daily?'':`<button class="btn primary" data-act="setup">${T('Rivincita','Rematch')}</button>`}`}<button class="btn dark" data-act="home">🏠 Menu</button></div>`);
}

