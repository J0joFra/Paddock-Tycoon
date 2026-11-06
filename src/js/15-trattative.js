// ================= Trattative =================
function tradable(p){return propsOf(p).filter(i=>S.own[i].level===0&&!(SQ[i].g&&groupHasUpgrades(SQ[i].g)));}
function blankOffer(from,to){return {from,to,give:[],get:[],cashGive:0,cashGet:0,royGive:{pct:0,turns:2},royGet:{pct:0,turns:2},pact:0};}
function invert(o){return {from:o.to,to:o.from,give:[...o.get],get:[...o.give],cashGive:o.cashGet,cashGet:o.cashGive,royGive:{...o.royGet},royGet:{...o.royGive},pact:o.pact};}
function offerValid(o){
  const a=P(o.from),b=P(o.to);
  return !a.out&&!b.out&&a.cash>=o.cashGive&&b.cash>=o.cashGet&&o.give.every(i=>S.own[i]&&S.own[i].owner===a.id)&&o.get.every(i=>S.own[i]&&S.own[i].owner===b.id)
    &&(o.give.length||o.get.length||o.cashGive||o.cashGet||o.pact);
}
function execOffer(o){
  const a=P(o.from),b=P(o.to);
  o.give.forEach(i=>S.own[i].owner=b.id);o.get.forEach(i=>S.own[i].owner=a.id);
  a.cash+=o.cashGet-o.cashGive;b.cash+=o.cashGive-o.cashGet;
  pgsGroups(a);pgsGroups(b);
  if(mineHuman(a)||mineHuman(b)){const n=(+lsGet('paddock-tycoon-deals')||0)+1;lsSet('paddock-tycoon-deals',String(n));if(n>=5)pgsAch('dealmaker');}
  S.roys=S.roys||[];S.pacts=S.pacts||[];
  if(o.royGive.pct) o.give.forEach(i=>S.roys.push({prop:i,holder:a.id,pct:o.royGive.pct,until:S.round+o.royGive.turns}));
  if(o.royGet.pct) o.get.forEach(i=>S.roys.push({prop:i,holder:b.id,pct:o.royGet.pct,until:S.round+o.royGet.turns}));
  if(o.pact) S.pacts.push({a:a.id,b:b.id,until:S.round+o.pact});
  st(a.id).deals++;st(b.id).deals++;
  sfx('deal');log(`🤝 ${T('Affare','Deal')} ${a.name} ⇄ ${b.name}`);setMsg(`🤝 ${T('Affare','Deal')} ${a.name} ⇄ ${b.name}`,'good');
  save();render();
}
function rentPower(p){return propsOf(p).reduce((s,i)=>s+(S.own[i].mort?0:(SQ[i].t==='u'?40:rentOf(i))),0);}
function valFor(i,receiver,bundle){
  const sq=SQ[i];let v=S.own[i].mort?sq.price*.5:sq.price;
  if(sq.g&&groupIdx(sq.g).every(j=>bundle.includes(j)||(S.own[j]&&S.own[j].owner===receiver.id))) v+=sq.price*1.5;
  return v;
}
const royFactor=r=>Math.min(.8,r.pct/100*r.turns*.35);
function cpuEval(o){ // dal punto di vista di chi riceve l'offerta (o.to)
  const R=P(o.to),A=P(o.from);
  let gain=o.cashGive+o.give.reduce((s,i)=>s+valFor(i,R,o.give)*(1-royFactor(o.royGive)),0)
          +o.get.reduce((s,i)=>s+SQ[i].price*royFactor(o.royGet),0);
  let loss=o.cashGet+o.get.reduce((s,i)=>s+(S.own[i].mort?SQ[i].price*.5:SQ[i].price)+(valFor(i,A,o.get)-SQ[i].price)*.6,0);
  if(o.pact){const d=(rentPower(A)-rentPower(R))*o.pact*.4; if(d>0) gain+=d; else loss+=-d;}
  return {gain,loss};
}
function cpuRespond(o){
  const R=P(o.to),A=P(o.from);
  const {gain,loss}=cpuEval(o);
  if(gain>=loss*df().accept+5&&gain>0) return {type:'accept'};
  const deficit=r10(loss*1.15-gain+10);
  const c=invert(o);
  if(c.cashGive>0){const red=Math.min(c.cashGive,deficit);c.cashGive-=red;const rest=deficit-red;if(rest>0)c.cashGet+=rest;}
  else c.cashGet+=deficit;
  if(c.cashGet<=A.cash&&deficit<1500&&rand()<.85) return {type:'counter',offer:c,line:T('Così non ci sto. Facciamo così:',"Not like that. Here's my offer:")};
  if(RU().under&&c.give.length&&!c.royGive.pct){const c2=invert(o);c2.royGive={pct:50,turns:3};if(cpuEval(invert(c2)).gain>=0) return {type:'counter',offer:c2,line:T('Niente soldi? Allora mi tengo il 50% dei diritti per 3 giri.',"No cash? Then I keep 50% of the fees for 3 laps.")};}
  return {type:'reject'};
}
function offerSummary(o,viewer){
  const me=P(viewer),other=P(viewer===o.from?o.to:o.from);
  const v=viewer===o.from?o:invert(o);
  const lst=a=>a.length?a.map(i=>`<span class="pick ${S.own[i].mort?'mort':''}"><span class="sw" style="--g:${gcol(i)}"></span>${esc(SQ[i].code)}</span>`).join(''):'';
  const side=(props,cash)=>`<div class="picks">${lst(props)}${cash?`<span class="pick">💰 ${fmt(cash)}</span>`:''}${!props.length&&!cash?'<span class="muted">—</span>':''}</div>`;
  const cl=[];
  if(v.royGive.pct&&v.give.length) cl.push(T(`Tu tieni il ${v.royGive.pct}% dei diritti su ciò che cedi per ${v.royGive.turns} giri`,`You keep ${v.royGive.pct}% of the fees on what you give for ${v.royGive.turns} laps`));
  if(v.royGet.pct&&v.get.length) cl.push(T(`${esc(other.name)} tiene il ${v.royGet.pct}% su ciò che ti cede per ${v.royGet.turns} giri`,`${esc(other.name)} keeps ${v.royGet.pct}% on what you get for ${v.royGet.turns} laps`));
  if(v.pact) cl.push(T(`Patto: nessun diritto tra voi per ${v.pact} giri`,`Pact: no fees between you for ${v.pact} laps`));
  return `<div class="trade"><div><h3>${T('Ricevi','You get')}</h3>${side(v.get,v.cashGet)}</div><div><h3>${T('Dai','You give')}</h3>${side(v.give,v.cashGive)}</div></div>
    ${cl.length?`<div class="clauses"><h3>🕶️ ${T('Sotto banco','Under the table')}</h3>${cl.map(t=>`<div class="cl">${t}</div>`).join('')}</div>`:''}`;
}
let TR=null,trResolve=null;
function editOffer(o,locked,title){return new Promise(res=>{TR={o,locked,title};trResolve=res;paintEditor();});}
function paintEditor(err=''){
  const o=TR.o,a=P(o.from),b=P(o.to);
  const pick=(i,side)=>`<button class="pick ${o[side].includes(i)?'on':''} ${S.own[i].mort?'mort':''}" data-act="tr-pick" data-side="${side}" data-i="${i}"><span class="sw" style="--g:${gcol(i)}"></span>${esc(SQ[i].code)}</button>`;
  const step=(key,max)=>`<div class="step"><button class="btn xs dark" data-act="tr-cash" data-k="${key}" data-d="-50">−50</button><button class="btn xs dark" data-act="tr-cash" data-k="${key}" data-d="-10">−10</button><b>${fmt(o[key])}</b><button class="btn xs dark" data-act="tr-cash" data-k="${key}" data-d="10">+10</button><button class="btn xs dark" data-act="tr-cash" data-k="${key}" data-d="50">+50</button></div>`;
  const sel=(id,vals,cur,lab)=>`<select id="${id}" data-act-change="tr-sel">${vals.map(v=>`<option value="${v}" ${v==cur?'selected':''}>${lab(v)}</option>`).join('')}</select>`;
  openSheet(`${handoff(a)}<h2>${TR.title}</h2>
    ${TR.locked?'':`<div class="seg">${rivals(a).map(q=>`<button class="${q.id===o.to?'on':''}" data-act="tr-to" data-i="${q.id}">${tok(q)}${esc(q.name)}</button>`).join('')}</div>`}
    <div class="trade">
      <div><h3>${T('Dai','You give')} · ${fmt(a.cash)}</h3><div class="picks">${tradable(a).map(i=>pick(i,'give')).join('')||'<span class="muted">—</span>'}</div>${step('cashGive')}</div>
      <div><h3>${T('Da','From')} ${esc(b.name)} · ${fmt(b.cash)}</h3><div class="picks">${tradable(b).map(i=>pick(i,'get')).join('')||'<span class="muted">—</span>'}</div>${step('cashGet')}</div>
    </div>
    ${RU().under?`<div class="clauses"><h3>🕶️ ${T('Sotto banco','Under the table')}</h3>
      <div class="cl">${T('Tieni il','Keep')} ${sel('rg',PCTS,o.royGive.pct,v=>v+'%')} ${T('dei diritti su ciò che cedi per','of the fees on what you give for')} ${sel('rgt',[1,2,3],o.royGive.turns,v=>v+T(' giri',' laps'))}</div>
      <div class="cl">${esc(b.name)} ${T('tiene il','keeps')} ${sel('rr',PCTS,o.royGet.pct,v=>v+'%')} ${T('su ciò che ti cede per','on what you get for')} ${sel('rrt',[1,2,3],o.royGet.turns,v=>v+T(' giri',' laps'))}</div>
      <div class="cl">${T('Patto di non belligeranza','Non-aggression pact')} ${sel('pc',[0,1,2,3],o.pact,v=>v?v+T(' giri',' laps'):T('no','none'))}</div>
    </div>`:''}
    ${tradeMeter(o)}
    ${err?`<p style="color:var(--red);font-weight:700">${err}</p>`:''}
    <div class="row"><button class="btn primary" data-act="tr-send">${T('Invia','Send')}</button><button class="btn out" data-act="tr-cancel">${TR.locked?T('Rifiuta','Decline'):T('Annulla','Cancel')}</button></div>`,false,true);
}
function tradeMeter(o){
  if(!o.give.length&&!o.get.length&&!o.cashGive&&!o.cashGet&&!o.pact)return '';
  const me=cpuEval(invert(o)),bal=me.gain-me.loss,scale=Math.max(150,me.gain+me.loss);
  const x=Math.max(-1,Math.min(1,bal/scale));
  const label=x>.15?T('A tuo favore','In your favour'):x<-.15?T('A suo favore','In their favour'):T('Equilibrato','Balanced');
  const R=P(o.to);let odds='';
  if(R.cpu){const e=cpuEval(o),need=e.loss*df().accept+5,r=e.gain/(need||1);
    odds=r>=1?T('🟢 Probabile che accetti','🟢 Likely to accept'):r>=.8?T('🟡 Potrebbe fare una controfferta','🟡 May counter'):T('🔴 Probabile che rifiuti','🔴 Likely to refuse');}
  return `<div class="meter"><div class="mbar"><span class="mfill ${x<0?'neg':'pos'}" style="--x:${Math.abs(x)*50}%"></span><i></i></div><div class="mtxt"><b>${label}</b>${odds?`<span>${odds}</span>`:''}</div></div>`;
}
document.addEventListener('change',e=>{if(TR&&e.target&&['rg','rgt','rr','rrt','pc'].includes(e.target.id)){readSelects();paintEditor();}});
function readSelects(){
  const o=TR.o,v=id=>{const e=$('#'+id);return e?+e.value:0;};
  o.royGive={pct:v('rg'),turns:v('rgt')||2};o.royGet={pct:v('rr'),turns:v('rrt')||2};o.pact=v('pc');
  if(!RU().under){o.royGive.pct=0;o.royGet.pct=0;o.pact=0;}
}
async function negotiate(o){
  for(let chain=0;chain<6;chain++){
    if(!offerValid(o)){log(T('Trattativa saltata','Negotiation fell through'));return false;}
    const R=P(o.to),A=P(o.from);
    let resp;
    if(R.cpu){
      resp=cpuRespond(o);
      if(resp.type!=='accept'){
        if(A.cpu&&resp.type==='counter'){ // tra CPU: accettano la controfferta se ancora conveniente
          const ev=cpuEval(resp.offer); resp= ev.gain>=ev.loss? {type:'accept',offer:resp.offer}:{type:'reject'};
          if(resp.type==='accept'){execOffer(resp.offer);return true;}
        }
      }
    } else {
      const c=await askFor(R,'no',true)(`${handoff(R)}<h2>📨 ${T('Offerta da','Offer from')} ${tok(A)} ${esc(A.name)}</h2>${o.line?`<p><b>“${esc(o.line)}”</b></p>`:''}${offerSummary(o,R.id)}
        <div class="row"><button class="btn primary" data-choice="ok">${T('Accetta','Accept')}</button><button class="btn dark" data-choice="counter">${T('Controfferta','Counteroffer')}</button><button class="btn out" data-choice="no">${T('Rifiuta','Decline')}</button></div>`);
      closeSheet();
      if(c==='ok') resp={type:'accept'};
      else if(c==='no') resp={type:'reject'};
      else{
        const n=await editFor(R,invert(o),true,T(`Controfferta a ${esc(A.name)}`,`Counteroffer to ${esc(A.name)}`));
        resp=n?{type:'counter',offer:n}:{type:'reject'};
      }
    }
    if(resp.type==='accept'){execOffer(o);if(R.cpu&&!A.cpu) await say(T(`${esc(R.name)} accetta! 🤝`,`${esc(R.name)} accepts! 🤝`),A);return true;}
    if(resp.type==='reject'){sfx('no');log(T(`${R.name} rifiuta ${A.name}`,`${R.name} declines ${A.name}`));setMsg(T(`${R.name} rifiuta l'offerta`,`${R.name} declines the offer`),'warn');render();if(R.cpu&&!A.cpu) await say(T(`${esc(R.name)} rifiuta.`,`${esc(R.name)} declines.`),A);return false;}
    o=resp.offer;if(resp.line)o.line=resp.line;
    sfx('bid');log(T(`${R.name} fa una controfferta`,`${R.name} makes a counteroffer`));
  }
  log(T('Trattativa arenata','Negotiation stalled'));return false;
}
function say(t,p){return askFor(p,'ok',true)(`<h2>${t}</h2><div class="row"><button class="btn primary" data-choice="ok">OK</button></div>`).then(()=>closeSheet());}
function canTrade(){return !!S&&!S.over&&!busy&&isMine(cur())&&['roll','end'].includes(S.phase)&&rivals(cur()).length>0;}
async function startTrade(pre={}){
  if(!canTrade()) return;
  const p=cur(),q=pre.to!=null&&!P(pre.to).out?P(pre.to):rivals(p)[0];
  const draft=blankOffer(p.id,q.id);
  if(pre.get) draft.get=pre.get.filter(i=>tradable(q).includes(i));
  if(pre.give) draft.give=pre.give.filter(i=>tradable(p).includes(i));
  if(isGuest()){const o=await editOffer(draft,false,T('Proponi affare','Propose a deal'));closeSheet();if(o)netSend({t:'offer',o});return;}
  busy=true; render();
  const o=await editOffer(draft,false,T('Proponi affare','Propose a deal'));
  closeSheet();
  if(o) await negotiate(o);
  busy=false;save();render();
}

