// ================= Render =================
function coord(i){if(i<=8)return[9,9-i];if(i<=16)return[9-(i-8),1];if(i<=24)return[1,1+(i-16)];return[1+(i-24),9];}
function side(i){if(i%8===0)return'k';if(i<8)return'b';if(i<16)return'l';if(i<24)return't';return'r';}
function buildBoard(){
  let h='';
  SQ.forEach((sq,i)=>{const[r,c]=coord(i);h+=`<button class="cell side-${side(i)}" id="c${i}" data-act="info" data-i="${i}" style="grid-area:${r}/${c}" aria-label="${esc(sq.name)}"></button>`;});
  h+=`<div class="center"><div class="stage"><div class="brand">${logoSVG('board')}</div><div class="dice"><div class="die" id="d1">${dieHTML(5)}</div><div class="die" id="d2">${dieHTML(2)}</div></div><div class="now" id="now"></div><div class="msg" id="msg"></div><div class="pot" id="pot"></div></div></div><div class="cars" id="cars"></div><div class="banner" id="banner"></div><div class="cardfx" id="cardfx" hidden aria-hidden="true"></div>`;
  const panel=document.querySelector('.side');
  $('#board').innerHTML=h;
  if(panel) $('.center').appendChild(panel);
}
function cellHTML(i){
  const sq=SQ[i],o=S&&S.own[i];
  let h='';
  if(sq.t==='c'){
    let tx=`<span>${sq.code}</span>`;
    if(o){ if(o.mort) tx+=`<span class="pr">${T('IPO','MTG')}</span>`; else tx+=o.level===4?`<span class="lv gp">${IC.gp}</span>`:`<span class="lv">${IC.stand.repeat(o.level)}</span>`; }
    else tx+=`<span class="pr">${sq.price}</span>`;
    h=`<span class="strip"></span><span class="ctrk">${cellTrack(i,o)}</span><span class="ctxt">${tx}</span>`;
  } else if(sq.t==='u') h=`${i===10?IC.tyre:IC.fuel}${o?(o.mort?`<span class="pr">${T('IPO','MTG')}</span>`:''):`<span class="pr">${sq.price}</span>`}`;
  else if(sq.t==='go'||['pit','sc','cops'].includes(sq.t)) h=`<span class="lbl">${sq.code}</span>`;
  else if(sq.t==='card') h=`${IC.card}<span>RADIO</span>`;
  else if(sq.t==='tax') h=`${IC.tax}<span>${sq.amount}</span>`;
  else if(sq.t==='drs') h=`<span class="drs">DRS</span><span class="pr">+3</span>`;
  else h=`<span>${sq.code}</span>`;
  if(S&&roysOn(i).length) h+='<span class="roy">%</span>';
  return h;
}
function render(){
  if(!$('#c0')) buildBoard();
  SQ.forEach((sq,i)=>{
    const el=$('#c'+i),o=S&&S.own[i];
    el.innerHTML=cellHTML(i);
    el.className=`cell side-${side(i)} ${sq.t} ${['c','u','go'].includes(sq.t)?'':'special'} ${i%8===0?'k':''} ${o?'owned':''} ${o&&o.mort?'mort':''} ${S&&S.pending===i?'hl':''} ${S&&S.weekend===i?'wk':''} ${sq.g?'grp-'+sq.g:''}`;
    el.style.setProperty('--g',sq.g?G[sq.g].c:'transparent');
    if(o) el.style.setProperty('--oc',P(o.owner).color);
  });
  const now=$('#now'),msg=$('#msg');
  placeCars();
  if(!S){$('#tab').hidden=true;$('#pot').innerHTML='';now.innerHTML=`<small>${T('Griglia di partenza','Starting grid')}</small>`;msg.textContent='';$('#tower').innerHTML='';$('#actions').innerHTML=`<div class="row"><button class="btn primary" data-act="setup">${T('Nuova partita','New game')}</button></div>`;$('#ticker').innerHTML='';return;}
  const p=cur();
  now.innerHTML=S.over?`<small>${T('Bandiera a scacchi','Chequered flag')}</small>`:`${tok(p)} ${esc(p.name)} <small>· ${T('giro','lap')} ${S.round}${S.limit?'/'+S.limit:''}</small>`;
  msg.textContent=S.msg?S.msg.text:'';msg.className='msg '+(S.msg?S.msg.kind:'');
  if(!busy){$('#d1').innerHTML=dieHTML(S.dice[0]);$('#d2').innerHTML=dieHTML(S.dice[1]);}
  $('#pot').innerHTML=(S.champ?`<span>🏆 ${T('Gara','Race')} ${S.champ.idx+1}/${S.champ.n}</span>`:'')+(S.weekend!=null?`<span>🏁 GP ${SQ[S.weekend].code} ×2</span>`:'')+(RU().pot?`<span class="${S.pot>=100?'full':''}">🚨 SC ${fmt(S.pot||0)}</span>`:'');
  $('#tower').innerHTML=S.players.map(q=>`<button class="chip ${q===p&&!S.over?'turn':''} ${q.out?'out':''}" data-act="pinfo" data-i="${q.id}">
    <span class="hm">${helmetSVG(q.color,q.helmet||0)}</span><span class="nm">${esc(q.name)}${q.cpu?'<span class="b">🤖</span>':''}${q.stopgo?'<span class="b red">S&amp;G</span>':''}${q.flags?'<span class="b gold">🏁'+q.flags+'</span>':''}${q.loan?'<span class="b red">🦈</span>':''}${q.away?'<span class="b">📴</span>':''}${S.champ?`<span class="b">${S.champ.pts[q.id]}pt</span>`:''}</span>
    <span class="cash">${q.out?'OUT':fmt(q.cash)}</span></button>`).join('');
  renderActions();
  $('#ticker').innerHTML=`${ICON_LOG}<span>${esc(S.log[0]||'')}</span>`;
  const tab=$('#tab');tab.hidden=false;tab.disabled=!canTrade();
  scheduleAutoEnd();
  if(NET.on&&NET.host)pushState();
  floats();
}
const IC={
  stand:'<svg class="st" viewBox="0 0 12 11" aria-hidden="true"><path d="M1 10.5h10V8.2H8.6V5.9H6.2V3.6H3.8V8.2H1z" fill="#e10a1e" stroke="#15171c" stroke-width=".9" stroke-linejoin="round"/><path d="M6 3.6V.6l2.6 1-2.6 1" fill="#15171c"/></svg>',
  gp:'<svg class="gp" viewBox="0 0 14 14" aria-hidden="true"><path d="M3.5 1.2h7v3.6a3.5 3.5 0 0 1-7 0z" fill="#f5b400" stroke="#15171c" stroke-width=".9"/><path d="M3.5 2.2H1.6a1.9 1.9 0 0 0 2.1 3M10.5 2.2h1.9a1.9 1.9 0 0 1-2.1 3" fill="none" stroke="#15171c" stroke-width=".9"/><path d="M6.2 8.2h1.6v2.4H6.2z" fill="#15171c"/><rect x="4" y="10.6" width="6" height="2.4" rx=".6" fill="#15171c"/></svg>',
  card:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4.5 10a9 9 0 0 1 15 0M7.5 12.8a5 5 0 0 1 9 0"/><circle cx="12" cy="16.5" r="2.2" fill="currentColor" stroke="none"/></svg>',
  tax:'<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="#f5b400"/><text x="12" y="16.6" text-anchor="middle" font-size="13" font-weight="900" fill="#15171c" font-family="Arial,sans-serif">€</text></svg>',
  tyre:'<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#15171c"/><circle cx="12" cy="12" r="7" fill="none" stroke="#f5b400" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="#9ca3af"/></svg>',
  fuel:'<svg class="ic" viewBox="0 0 24 24"><path d="M12 2.5c3.6 4.7 6.6 8.4 6.6 12.1a6.6 6.6 0 0 1-13.2 0c0-3.7 3-7.4 6.6-12.1z" fill="#e10a1e"/><path d="M9 15.2a3 3 0 0 0 3 3" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
};
const CAR=c=>`<svg viewBox="0 0 24 52" aria-hidden="true">
<g fill="#16181d"><rect x=".6" y="35" width="5.2" height="10.5" rx="1.7"/><rect x="18.2" y="35" width="5.2" height="10.5" rx="1.7"/><rect x="1" y="8.2" width="4.6" height="8.8" rx="1.6"/><rect x="18.4" y="8.2" width="4.6" height="8.8" rx="1.6"/></g>
<g fill="none" stroke="#3a3d45" stroke-width=".5"><path d="M3.2 35.6v9.3M20.8 35.6v9.3M3.3 8.8v7.6M20.7 8.8v7.6"/></g>
<path d="M5.5 12.6 10 14.4M18.5 12.6 14 14.4M5.6 40 9.4 38.2M18.4 40 14.6 38.2" stroke="#16181d" stroke-width=".9"/>
<path d="M2.2 4.6Q12 2 21.8 4.6V7.2Q12 5.3 2.2 7.2Z" fill="${c}"/>
<path d="M2.2 6.3Q12 4.4 21.8 6.3" stroke="#16181d" stroke-width=".5" fill="none"/>
<rect x="1.3" y="3.6" width="1.5" height="4.4" rx=".4" fill="#16181d"/><rect x="21.2" y="3.6" width="1.5" height="4.4" rx=".4" fill="#16181d"/>
<path d="M10.7 4.8h2.6l.9 11.4H9.8Z" fill="${c}"/>
<path d="M9.6 15.2h4.8l.7 4.7Q19.3 21.8 19.3 27l-.6 7.2Q16.2 37 14.7 38.1l-.4 6.3H9.7l-.4-6.3Q7.8 37 5.3 34.2L4.7 27q0-5.2 4.2-7.1Z" fill="${c}"/>
<path d="M12 5.4V44" stroke="#fff" stroke-width=".8" opacity=".55"/>
<path d="M6.3 23.4Q7.8 21.4 9.3 21.5v2.7ZM17.7 23.4Q16.2 21.4 14.7 21.5v2.7Z" fill="#16181d"/>
<ellipse cx="12" cy="23.8" rx="2.5" ry="3.7" fill="#16181d"/>
<circle cx="12" cy="24.3" r="1.75" fill="#fff"/><rect x="10.9" y="23" width="2.2" height=".9" rx=".4" fill="#16181d"/>
<path d="M9.2 21.8Q12 18.4 14.8 21.8" stroke="#16181d" stroke-width="1.1" fill="none" stroke-linecap="round"/>
<rect x="10.8" y="28.3" width="2.4" height="3.2" rx="1" fill="#16181d"/>
<rect x="3.8" y="44.8" width="16.4" height="3.6" rx=".8" fill="#16181d"/><rect x="5" y="45.5" width="14" height="1.5" rx=".4" fill="${c}"/>
<rect x="11" y="48.8" width="2" height="1.7" rx=".4" fill="#ff3347"/></svg>`;
// Logo Paddock Tycoon: nastro ad arco + carta di proprietà + dadi
function logoSVG(id='a'){
  const die=(x,y,r,n)=>{const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
    return `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-26" y="-26" width="52" height="52" rx="11" fill="#fff6dd" stroke="#15171c" stroke-width="5"/>${P[n].map(([a,b])=>`<circle cx="${a*12}" cy="${b*12}" r="5" fill="#e10a1e"/>`).join('')}</g>`;};
  return `<svg class="brandlogo" viewBox="0 0 640 290" role="img" aria-label="Paddock Tycoon">
  <defs><path id="pt-arc-${id}" d="M104 164 Q320 80 536 164"/>
  <pattern id="pt-chk-${id}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#fff6dd"/><rect width="6" height="6" fill="#15171c"/><rect x="6" y="6" width="6" height="6" fill="#15171c"/></pattern></defs>
  <g transform="translate(0 6)">
  <path d="M30 128 L104 116 L104 204 L30 216 L56 172 Z" fill="#9d0010" stroke="#15171c" stroke-width="5" stroke-linejoin="round"/>
  <path d="M610 128 L536 116 L536 204 L610 216 L584 172 Z" fill="#9d0010" stroke="#15171c" stroke-width="5" stroke-linejoin="round"/>
  <path d="M78 100 Q320 18 562 100 L562 198 Q320 116 78 198 Z" fill="#e10a1e" stroke="#15171c" stroke-width="6" stroke-linejoin="round"/>
  <path d="M92 116 Q320 38 548 116" fill="none" stroke="#ff5a69" stroke-width="3" opacity=".7"/>
  <text font-family="'Alfa Slab One','Rockwell Extra Bold','Rockwell',Georgia,serif" font-size="70" fill="#15171c" text-anchor="middle" letter-spacing="3" transform="translate(4 6)"><textPath href="#pt-arc-${id}" startOffset="50%">PADDOCK</textPath></text>
  <text font-family="'Alfa Slab One','Rockwell Extra Bold','Rockwell',Georgia,serif" font-size="70" fill="#fff6dd" stroke="#15171c" stroke-width="9" paint-order="stroke" stroke-linejoin="round" text-anchor="middle" letter-spacing="3"><textPath href="#pt-arc-${id}" startOffset="50%">PADDOCK</textPath></text>
  <g transform="translate(0 2)">
  <rect x="176" y="186" width="288" height="86" rx="12" fill="#fff6dd" stroke="#15171c" stroke-width="6"/>
  <path d="M182 192 h276 v14 h-276 z" fill="#e10a1e"/>
  <rect x="182" y="206" width="16" height="60" fill="url(#pt-chk-${id})"/><rect x="442" y="206" width="16" height="60" fill="url(#pt-chk-${id})"/>
  <text x="320" y="257" font-family="'Alfa Slab One','Rockwell Extra Bold','Rockwell',Georgia,serif" font-size="42" fill="#15171c" text-anchor="middle" letter-spacing="4">TYCOON</text>
  </g>
  ${die(126,246,-16,5)}${die(516,246,14,3)}
  </g></svg>`;
}
const carRot={};
const rotFor=i=>i<8?-90:i<16?0:i<24?90:180;
function placeCars(){
  const layer=$('#cars');if(!layer)return;
  if(!S){layer.innerHTML='';return;}
  const c1=$('#c1');$('#board').style.setProperty('--car',Math.max(8,Math.min(c1.offsetWidth,c1.offsetHeight)*.44)+'px');
  const groups={};
  S.players.forEach(p=>{if(!p.out)(groups[p.pos]=groups[p.pos]||[]).push(p.id);});
  S.players.forEach(p=>{
    let el=document.getElementById('car'+p.id);
    if(!el){el=document.createElement('div');el.id='car'+p.id;el.className='car';el.innerHTML=CAR(p.color);layer.appendChild(el);}
    el.hidden=p.out;if(p.out)return;
    const cell=$('#c'+p.pos),g=groups[p.pos],k=g.indexOf(p.id),n=g.length;
    let x=cell.offsetLeft+cell.offsetWidth/2,y=cell.offsetTop+cell.offsetHeight/2;
    if(n>1){const a=k/n*Math.PI*2-Math.PI/2,r=Math.min(cell.offsetWidth,cell.offsetHeight)*.24;x+=Math.cos(a)*r;y+=Math.sin(a)*r;}
    const want=rotFor(p.pos);let cur0=carRot[p.id];
    if(cur0===undefined)cur0=want;else{let d=((want-cur0)%360+540)%360-180;cur0+=d;}
    carRot[p.id]=cur0;
    el.style.transform=`translate(${x}px,${y}px) rotate(${cur0}deg)`;
    el.classList.toggle('me',!S.over&&cur()===p);
  });
}
addEventListener('resize',()=>requestAnimationFrame(placeCars));
const prevCash={};
function floats(){
  S.players.forEach(p=>{
    const prev=prevCash[p.id];prevCash[p.id]=p.cash;
    if(prev===undefined||prev===p.cash)return;
    const chip=document.querySelector(`.chip[data-i="${p.id}"]`);if(!chip)return;
    const r=chip.getBoundingClientRect(),d=p.cash-prev,el=document.createElement('div');
    el.className='float '+(d>0?'plus':'minus');el.textContent=(d>0?'+':'−')+fmt(Math.abs(d));
    el.style.left=Math.max(4,r.right-86)+'px';el.style.top=(r.top-2)+'px';
    $('#fx').appendChild(el);setTimeout(()=>el.remove(),1400);
  });
}
// ---------- Animazioni: carta Radio, carta di proprietà, monete ----------
function anchorRect(id){
  const el=id==='pot'?$('#pot'):id==='board'?$('.center'):typeof id==='number'&&id>=100?$('#c'+(id-100)):document.querySelector(`.chip[data-i="${id}"]`);
  if(!el||el.offsetParent===null&&id!=='board')return null;const r=el.getBoundingClientRect();return r.width?r:null;
}
function fly(html,cls,from,to,dur=700,delay=0){
  if(reduced||!from||!to)return;
  const el=document.createElement('div');el.className='flyer '+cls;el.innerHTML=html;$('#fx').appendChild(el);
  const fx=from.left+from.width/2,fy=from.top+from.height/2,tx=to.left+to.width/2,ty=to.top+to.height/2;
  el.style.left=fx+'px';el.style.top=fy+'px';el.style.transitionDuration=dur+'ms';el.style.transitionDelay=delay+'ms';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transform=`translate(calc(-50% + ${tx-fx}px),calc(-50% + ${ty-fy}px)) scale(.55)`;el.style.opacity='.15';}));
  setTimeout(()=>el.remove(),dur+delay+80);
}
function deedFx(i,pid,remote){
  if(!remote&&NET.on&&NET.host)hostFx({n:'deed',i,p:pid});
  const sq=SQ[i];
  setTimeout(()=>fly(`<span class="dband" style="--g:${gcol(i)}"></span><b>${esc(sq.code)}</b><small>${fmt(sq.price)}</small>`,'deed',anchorRect(100+i),anchorRect(pid),900),60);
}
function coinFx(from,to,amt,remote){
  if(!amt||amt<=0)return;
  if(!remote&&NET.on&&NET.host)hostFx({n:'coins',a:from,b:to,m:amt});
  const n=Math.max(2,Math.min(7,Math.round(Math.log2(amt/10+1))+1)),a=anchorRect(from),b=anchorRect(to);
  for(let k=0;k<n;k++)fly('<i></i>','coin',a,b,620,k*70);
}
let cardT=null;
function cardFx(text,remote){
  if(!remote&&NET.on&&NET.host)hostFx({n:'card',t:text});
  const el=$('#cardfx');if(!el)return;
  el.innerHTML=`<div class="cf"><div class="cf-back"><span>📻</span><b>RADIO BOX</b></div><div class="cf-front"><small>📻 RADIO BOX</small><p>${esc(text)}</p></div></div>`;
  el.hidden=false;el.classList.remove('go');void el.offsetWidth;el.classList.add('go');
  clearTimeout(cardT);cardT=setTimeout(()=>{el.hidden=true;el.classList.remove('go');},reduced?1200:2100);
}
let toastT=null;
function toast(msg){const el=$('#toast');if(!el)return;el.textContent=msg;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,2200);}
function banner(p){const b=$('#banner');if(b)b.innerHTML=`<div style="--pc:${p.color}">${esc(p.name)}</div>`;}
function confetti(n=140,remote){
  if(!remote&&NET.on&&NET.host)hostFx({n:'confetti',c:n});
  if(reduced)return;
  const cv=$('#confetti');cv.hidden=false;const ctx=cv.getContext('2d'),s=devicePixelRatio||1;
  const W=cv.width=innerWidth*s,H=cv.height=innerHeight*s;
  const cols=['#e10a1e','#f5b400','#15171c','#2563eb','#15a34a','#ec4899','#ffffff'];
  const ps=Array.from({length:n},()=>({x:W/2+(Math.random()-.5)*W*.35,y:H*.4,vx:(Math.random()-.5)*16*s,vy:(-Math.random()*13-4)*s,r:Math.random()*6,vr:(Math.random()-.5)*.4,w:(4+Math.random()*5)*s,h:(6+Math.random()*8)*s,c:cols[Math.floor(Math.random()*cols.length)]}));
  const t0=performance.now();
  (function f(t){
    ctx.clearRect(0,0,W,H);
    ps.forEach(q=>{q.vy+=.38*s;q.x+=q.vx;q.y+=q.vy;q.vx*=.985;q.r+=q.vr;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);ctx.fillStyle=q.c;ctx.fillRect(-q.w/2,-q.h/2,q.w,q.h);ctx.restore();});
    if(t-t0<2800)requestAnimationFrame(f);else{ctx.clearRect(0,0,W,H);cv.hidden=true;}
  })(t0);
}
let autoT=null;
function scheduleAutoEnd(){
  if(!S||S.over||!S.autoEnd||S.autoOff||autoT||busy||S.phase!=='end'||!isMine(cur()))return;
  const g=GEN,turn=S.turn,round=S.round;
  autoT=setTimeout(()=>{autoT=null;
    if(g!==GEN||!S||S.autoOff||S.phase!=='end'||busy||!isMine(cur())||S.turn!==turn||S.round!==round)return;
    if(!$('#backdrop').hidden||!$('#menu').hidden||document.querySelector('.coach')){scheduleAutoEnd();return;}
    gameAct('end');},2600);
}
function cancelAutoEnd(){if(S)S.autoOff=true;if(autoT){clearTimeout(autoT);autoT=null;}}
function renderActions(){
  const a=$('#actions'),p=cur();
  if(S.over){a.innerHTML=`<div class="row"><button class="btn primary" data-act="setup">${T('Nuova partita','New game')}</button><button class="btn dark" data-act="results">${T('Classifica','Results')}</button></div>`;return;}
  if(!isMine(p)||S.phase==='auction'){a.innerHTML=`<div class="waitline">${tok(p)} ${esc(p.name)} ${p.cpu?T('in pista…','is racing…'):T('sta giocando…','is playing…')}${p.cpu&&!isGuest()?`<button class="btn sm ffwd ${TURBO?'on':''}" data-act="ffwd" aria-pressed="${TURBO}">⏩ ${TURBO?T('Veloce','Fast'):T('Avanti veloce','Fast forward')}</button>`:''}</div>`;return;}
  let main='';
  if(S.phase==='roll') main=`<div class="row"><button class="btn primary" data-act="roll" ${busy?'disabled':''}>🎲 ${busy?'…':(S.doubles>0?T('Rilancia','Roll again'):T('Lancia','Roll'))}</button></div>`;
  else if(S.phase==='buy'){
    const i=S.pending,sq=SQ[i];
    let hint='';
    if(sq.g){const idx=groupIdx(sq.g);
      if(idx.every(j=>j===i||(S.own[j]&&S.own[j].owner===p.id)))hint=T('⭐ Completa il tuo gruppo','⭐ Completes your group');
      else{const o=S.players.find(q=>q!==p&&!q.out&&idx.filter(j=>S.own[j]&&S.own[j].owner===q.id).length===idx.length-1);if(o)hint=T(`🛑 Blocchi ${o.name}`,`🛑 Blocks ${o.name}`);}}
    main=`<div class="deal" style="--g:${gcol(i)}"><span class="sw"></span><span class="thumb">${sq.t==='c'?trackSVG(i,'mini'):''}</span><div><b>${esc(sq.name)}</b><small>${sq.t==='c'?T('Diritti ','Fee ')+fmt(rentTable(sq)[0])+' · '+G[sq.g].n:T('Dadi ×5 / ×12','Dice ×5 / ×12')}</small>${hint?`<br><span class="hint">${esc(hint)}</span>`:''}</div><span class="px">${fmt(sq.price)}</span></div>
      <div class="row"><button class="btn primary" data-act="buy" ${p.cash>=sq.price&&!busy?'':'disabled'}>${T('Compra','Buy')}</button><button class="btn out" data-act="auction" ${busy?'disabled':''}>${RU().auction?'🔨 '+T('Asta','Auction'):T('Lascia','Pass')}</button></div>`;
  }
  else if(S.phase==='end') main=`<div class="row"><button class="btn primary ${S.autoEnd&&!S.autoOff&&!busy?'auto':''}" data-act="end" ${busy?'disabled':''}>${T('Fine turno','End turn')} ›</button></div>`;
  else main=`<div class="waitline">…</div>`;
  const can=!busy&&['roll','end','buy'].includes(S.phase);
  a.innerHTML=main+`<div class="row"><button class="btn sm" data-act="manage" ${can?'':'disabled'}>🏟️ ${T('Circuiti','Circuits')} · ${propsOf(p).length}</button><button class="btn sm" data-act="log">📋 ${T('Cronaca','Race log')}</button></div>`;
}

