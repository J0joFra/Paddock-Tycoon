// ================= Google Play Games (solo app Android) =================
// ID copiati da Play Console → Play Games Services → Obiettivi / Classifiche. Vuoti = funzione disattivata.
const PGS_IDS={
  ach:{first_win:'',champion:'',full_group:'',grand_prix:'',bribe:'',loan_paid:'',jackpot:'',dealmaker:'',online_win:'',tycoon:''},
  lb:{networth:'',wins:''}
};
const PGS={ready:false,signed:false,plugin:null};
function pgsInit(){
  const C=window.Capacitor;
  if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
  try{PGS.plugin=C.registerPlugin?C.registerPlugin('PlayGames'):(C.Plugins&&C.Plugins.PlayGames);}catch(e){PGS.plugin=null;}
  if(!PGS.plugin)return;
  PGS.ready=true;
  PGS.plugin.status().then(r=>{PGS.signed=!!(r&&r.signedIn);}).catch(()=>{});
}
function pgsAch(key){profAch(key);const id=PGS_IDS.ach[key];if(!PGS.ready||!id)return;PGS.plugin.unlock({id}).catch(()=>{});}
function pgsScore(key,score){const id=PGS_IDS.lb[key];if(!PGS.ready||!id||!(score>0))return;PGS.plugin.submitScore({id,score:Math.floor(score)}).catch(()=>{});}
async function pgsShow(kind){
  if(!PGS.ready)return;
  if(!PGS.signed){const r=await PGS.plugin.signIn().catch(()=>null);PGS.signed=!!(r&&r.signedIn);if(!PGS.signed){openSheet(`<h2>🎮 Google Play Games</h2><p>${T('Accesso non riuscito. Controlla di avere Google Play Giochi e riprova.','Sign-in failed. Make sure Google Play Games is available and try again.')}</p><div class="row"><button class="btn dark" data-act="close">${T('Chiudi','Close')}</button></div>`);return;}}
  try{if(kind==='ach')await PGS.plugin.showAchievements();else await PGS.plugin.showLeaderboard({id:''});}catch(e){}
}
const mineHuman=p=>!!p&&!p.cpu&&isMine(p);
function pgsGroups(p){if(mineHuman(p)&&Object.keys(G).some(g=>ownsGroup(p,g)))pgsAch('full_group');}
const PROF_KEY='paddock-tycoon-profile';
const ACH_INFO={first_win:['🏁','Prima vittoria','First win','Vinci una partita','Win a game'],champion:['🏆','Campione del mondo','World champion','Vinci un campionato','Win a championship'],
  full_group:['🎨','Gruppo completo','Full set','Possiedi tutti i circuiti di un colore','Own every circuit of one colour'],grand_prix:['🏟️','Padrone del GP','Grand Prix host','Ospita un Gran Premio','Host a Grand Prix'],
  bribe:['🕶️','Mani in pasta','Greased palms','Corrompi i commissari','Bribe the stewards'],loan_paid:['🦈','Debito saldato','Debt cleared','Restituisci un prestito allo strozzino','Pay back the loan shark'],
  jackpot:['🚨','Montepremi','Jackpot','Incassa almeno €200M dalla Safety Car','Collect at least €200M from the Safety Car'],dealmaker:['🤝','Faccendiere','Wheeler-dealer','Chiudi 5 affari','Close 5 deals'],
  online_win:['🌐','Re della rete','Online king','Vinci una partita online','Win an online game'],tycoon:['💰','Tycoon','Tycoon','Raggiungi €10.000M di patrimonio','Reach €10,000M net worth']};
const PROF0={games:0,wins:0,champs:0,best:0,rent:0,deals:0,built:0,bankrupt:0,online:0,onlineWins:0,ach:{}};
function prof(){try{const p=Object.assign({},PROF0,JSON.parse(lsGet(PROF_KEY))||{});p.ach=p.ach||{};return p;}catch(e){return {...PROF0,ach:{}};}}
function profSave(p){lsSet(PROF_KEY,JSON.stringify(p));}
function profAch(key){const p=prof();if(p.ach[key])return;p.ach[key]=Date.now();profSave(p);toast(`${ACH_INFO[key][0]} ${T('Obiettivo','Achievement')}: ${T(ACH_INFO[key][1],ACH_INFO[key][2])}`);}
function profGameEnd(w){
  if(!S||S.profDone)return;const mine=S.players.filter(mineHuman);if(!mine.length)return;S.profDone=true;
  const p=prof();p.games++;if(NET.on)p.online++;
  if(mineHuman(w)){p.wins++;if(NET.on)p.onlineWins++;}
  const c=S.champ;if(c&&c.idx>=c.n-1&&mineHuman(P(champOrder(c)[0])))p.champs++;
  for(const q of mine){p.best=Math.max(p.best,q.out?0:netWorth(q));const s2=(S.stats||{})[q.id]||{};p.rent+=s2.rent||0;p.deals+=s2.deals||0;p.built+=s2.built||0;if(q.out)p.bankrupt++;}
  profSave(p);
}
function showProfile(){
  const p=prof(),name=lsGet(NAME_KEY)||T('Pilota','Driver');
  const tile=(l,v)=>`<div class="ptile"><small>${l}</small><b>${v}</b></div>`;
  const pct=p.games?Math.round(p.wins/p.games*100):0;
  openSheet(`<h2>👤 ${esc(name)}</h2>
    <div class="ptiles">${tile(T('Partite','Games'),p.games)}${tile(T('Vittorie','Wins'),`${p.wins} <small>(${pct}%)</small>`)}${tile(T('Campionati','Championships'),p.champs)}${tile(T('Patrimonio record','Record net worth'),fmt(p.best))}${tile(T('Diritti incassati','Fees collected'),fmt(p.rent))}${tile(T('Affari','Deals'),p.deals)}${tile(T('Tribune e GP','Grandstands & GPs'),p.built)}${tile('Online',`${p.onlineWins}/${p.online}`)}</div>
    <h3>${T('Obiettivi','Achievements')} · ${Object.keys(p.ach).length}/${Object.keys(ACH_INFO).length}</h3>
    <div class="achs">${Object.entries(ACH_INFO).map(([k,a])=>`<div class="ach ${p.ach[k]?'on':''}"><span>${a[0]}</span><div><b>${T(a[1],a[2])}</b><small>${T(a[3],a[4])}</small></div></div>`).join('')}</div>
    <div class="row">${PGS.ready?`<button class="btn" data-act="pgsach">🎮 Google Play Games</button>`:''}<button class="btn dark" data-act="close">${T('Chiudi','Close')}</button></div>`);
}
function gameEndLocal(w){profGameEnd(w);pgsGameEnd(w);}
function pgsGameEnd(w){
  if(!S||S.pgsDone)return;S.pgsDone=true;
  for(const p of S.players)if(mineHuman(p)&&!p.out)pgsScore('networth',netWorth(p));
  if(mineHuman(w)){
    pgsAch('first_win');if(NET.on)pgsAch('online_win');
    const n=(+lsGet('paddock-tycoon-wins')||0)+1;lsSet('paddock-tycoon-wins',String(n));pgsScore('wins',n);
  }
  const c=S.champ;if(c&&c.idx>=c.n-1&&mineHuman(P(champOrder(c)[0])))pgsAch('champion');
}

