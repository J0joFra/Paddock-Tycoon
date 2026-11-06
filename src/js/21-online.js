// ================= Online (Firebase Realtime Database) =================
// Incolla qui la configurazione web del progetto Firebase (Impostazioni progetto → Le tue app → Configurazione SDK).
// Finché resta null, il pulsante Online spiega che la modalità non è ancora attiva.
const FIREBASE_CONFIG={
  apiKey:"AIzaSyCLcAxBZWeidBHnjINKLqQqyANEJtH797Q",
  authDomain:"paddock-tycoon-27cf2.firebaseapp.com",
  databaseURL:"https://paddock-tycoon-27cf2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:"paddock-tycoon-27cf2",
  storageBucket:"paddock-tycoon-27cf2.firebasestorage.app",
  messagingSenderId:"708573255384",
  appId:"1:708573255384:web:c28914dad0d8e6685be9ad"
};
const FB_VER='10.12.2';
const NAME_KEY='paddock-tycoon-name',KEY_ON='paddock-tycoon-online',LAST_ROOM='paddock-tycoon-lastroom';
const BAD_NAME=/(cazz|merd|stronz|puttan|troia|vaffan|coglion|frocio|negr|fuck|shit|bitch|cunt|nigg|fagg|porn|dick|pussy|hitler|nazi)/i;
function cleanName(n){n=String(n||'').replace(/[<>&"'`]/g,'').replace(/\s+/g,' ').trim().slice(0,12);if(!n||BAD_NAME.test(n))n=T('Pilota','Driver')+' '+(10+Math.floor(Math.random()*90));return n;}
const lsGet=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const lsSet=(k,v)=>{try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}};
function genCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ';let c='';for(let i=0;i<5;i++)c+=A[Math.floor(Math.random()*A.length)];return c;}
const room=p=>`rooms/${NET.code}${p?'/'+p:''}`;
const PUB_MAX=6,PUB_MIN=3;
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('script'));document.head.appendChild(s);});}
const useLocalNet=()=>lsGet('paddock-tycoon-localnet')==='1';
const onlineReady=()=>!!FIREBASE_CONFIG||useLocalNet();

let fbLoading=null;
function loadFirebase(){
  if(!fbLoading)fbLoading=(async()=>{
    if(!(window.firebase&&firebase.apps))await loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-app-compat.js`);
    if(!firebase.auth)await loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-auth-compat.js`);
    if(!firebase.database)await loadScript(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-database-compat.js`);
    if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
  })().catch(e=>{fbLoading=null;throw e;});
  return fbLoading;
}
let netIniting=null;
function netInit(){
  if(NET.db)return Promise.resolve(NET.db);
  if(!netIniting)netIniting=(async()=>{
    if(useLocalNet()){NET.db=localBackend();await NET.db.ready;}
    else{
      if(!FIREBASE_CONFIG)throw new Error('noconfig');
      await loadFirebase();
      if(!firebase.auth().currentUser)await firebase.auth().signInAnonymously();
      NET.db=fbBackend();
    }
    NET.uid=NET.db.uid;return NET.db;
  })().finally(()=>{netIniting=null;});
  return netIniting;
}
function fbBackend(){
  const d=firebase.database(),r=p=>d.ref('pt/'+p);
  return {uid:firebase.auth().currentUser.uid,
    set:(p,v)=>r(p).set(v),update:(p,v)=>r(p).update(v),remove:p=>r(p).remove(),
    push:(p,v)=>r(p).push(v),get:async p=>(await r(p).get()).val(),
    on:(p,cb)=>{const h=s=>cb(s.val());r(p).on('value',h);return()=>r(p).off('value',h);},
    onAdd:(p,cb)=>{const h=s=>cb(s.key,s.val());r(p).on('child_added',h);return()=>r(p).off('child_added',h);},
    onDisc:(p,v)=>v===null?r(p).onDisconnect().remove():r(p).onDisconnect().set(v),
    txn:(p,fn)=>r(p).transaction(fn).then(x=>({committed:x.committed}))};
}
// Motore locale: simula il database tra le schede dello stesso browser (solo per i test).
function localBackend(){
  const ch=new BroadcastChannel('pt-localnet');let tree={};const L=[],discs=[];
  const uid='u'+Math.random().toString(36).slice(2,10);
  const parts=p=>p.split('/').filter(Boolean);
  const getp=p=>parts(p).reduce((o,k)=>o&&typeof o==='object'?o[k]:undefined,tree);
  const setp=(p,v)=>{const ks=parts(p);let o=tree;for(let i=0;i<ks.length-1;i++){if(typeof o[ks[i]]!=='object'||o[ks[i]]===null)o[ks[i]]={};o=o[ks[i]];}
    if(v===null||v===undefined)delete o[ks[ks.length-1]];else o[ks[ks.length-1]]=JSON.parse(JSON.stringify(v));};
  const fire=()=>L.slice().forEach(l=>l.check());
  const apply=op=>{if(op.k==='set')setp(op.p,op.v);else if(op.k==='upd')for(const x in op.v)setp(op.p+'/'+x,op.v[x]);};
  const doOp=op=>{apply(op);ch.postMessage(op);setTimeout(fire,0);};
  let gotTree;const ready=new Promise(r=>{gotTree=r;setTimeout(r,250);});
  ch.onmessage=e=>{const m=e.data;
    if(m.k==='hello'){ch.postMessage({k:'tree',v:tree});return;}
    if(m.k==='tree'){if(!Object.keys(tree).length&&m.v)tree=m.v;gotTree();setTimeout(fire,0);return;}
    apply(m);setTimeout(fire,0);};
  ch.postMessage({k:'hello'});
  addEventListener('pagehide',()=>discs.forEach(([p,v])=>{apply({k:'set',p,v});ch.postMessage({k:'set',p,v});}));
  return {uid,ready,
    set:(p,v)=>{doOp({k:'set',p,v});return Promise.resolve();},
    update:(p,v)=>{doOp({k:'upd',p,v});return Promise.resolve();},
    remove:p=>{doOp({k:'set',p,v:null});return Promise.resolve();},
    push:(p,v)=>{const id='k'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);doOp({k:'set',p:p+'/'+id,v});return Promise.resolve({key:id});},
    get:async p=>JSON.parse(JSON.stringify(getp(p)??null)),
    on:(p,cb)=>{let last;const l={check(){const v=JSON.stringify(getp(p)??null);if(v!==last){last=v;cb(JSON.parse(v));}}};L.push(l);setTimeout(()=>l.check(),0);return()=>{const i=L.indexOf(l);if(i>=0)L.splice(i,1);};},
    onAdd:(p,cb)=>{const seen=new Set();const l={check(){const o=getp(p)||{};for(const k of Object.keys(o).sort()){if(!seen.has(k)){seen.add(k);cb(k,o[k]);}}}};L.push(l);setTimeout(()=>l.check(),0);return()=>{const i=L.indexOf(l);if(i>=0)L.splice(i,1);};},
    onDisc:(p,v)=>{discs.push([p,v]);},
    txn:async(p,fn)=>{const v=fn(getp(p)??null);if(v!==undefined)doOp({k:'set',p,v});return {committed:v!==undefined};}};
}
function netOff(){NET.offs.forEach(f=>{try{f();}catch(e){}});NET.offs=[];}
function netReset(){netOff();clearInterval(NET.cdT);clearInterval(NET.tick);clearTimeout(NET.timer);
  Object.assign(NET,{on:false,host:false,code:null,pub:false,started:false,pending:{},overlay:null,priv:false,prompt:null,localSheet:false,panel:null,roShown:false,cdT:null,cd:null,tick:null,timer:null,overShown:false,lobby:{}});
  paintNet();}
function netSend(m){if(NET.db&&NET.code)NET.db.push(room('inbox'),{...m,from:NET.uid,ts:Date.now()});}
function netError(e){
  const code=String((e&&(e.code||e.message))||'');
  console.warn('[online]',e);
  const msg=code==='noconfig'?T("L'online non è ancora attivo in questa versione del gioco.",'Online play is not enabled in this version yet.')
    :/operation-not-allowed|admin-restricted/.test(code)?T("Firebase: l'accesso anonimo non è abilitato (Authentication → Metodo di accesso → Anonimo).",'Firebase: anonymous sign-in is not enabled (Authentication → Sign-in method → Anonymous).')
    :/unauthorized-domain/.test(code)?T('Firebase: questo sito non è tra i domini autorizzati (Authentication → Impostazioni).','Firebase: this site is not an authorized domain (Authentication → Settings).')
    :/permission[_ -]denied/i.test(code)?T('Firebase: permesso negato. Controlla di aver pubblicato le regole del database.','Firebase: permission denied. Check that the database rules are published.')
    :/network|script|failed to fetch/i.test(code)?T('Connessione non riuscita. Controlla la rete e riprova.','Connection failed. Check your network and try again.')
    :T('Errore online: ','Online error: ')+esc(code.slice(0,120));
  openSheet(`<h2>🌐 Online</h2><p>${msg}</p><div class="row"><button class="btn dark" data-act="online">${T('Indietro','Back')}</button></div>`,false);
}
const netTry=fn=>async(...a)=>{try{return await fn(...a);}catch(e){netError(e);}};
function paintNet(){const el=$('#netpill');if(!el)return;
  if(!NET.on||!NET.started){el.hidden=true;return;}
  el.hidden=false;el.className='netpill'+(NET.hostAway?' warn':'');
  el.textContent=NET.hostAway?T('📴 Host disconnesso: attendi…','📴 Host disconnected: please wait…'):`🌐 ${NET.code}`;}

// ---------- Schermate ----------
function showOnline(code=''){
  hideMenu();
  if(!onlineReady()){netError(new Error('noconfig'));return;}
  const last=lsGet(LAST_ROOM);
  openSheet(`<h2>🌐 ${T('Gioca online','Play online')}</h2>
    <label class="fld" for="oname">${T('Il tuo nome','Your name')}<input type="text" id="oname" maxlength="12" value="${esc(lsGet(NAME_KEY)||'')}" placeholder="${T('Nome pilota','Driver name')}"></label>
    <div class="plist">
      <button class="btn primary" data-act="quick">⚡ ${T('Partite veloci','Quick games')} <small>${T('con altri giocatori, 3-6 piloti','with other players, 3-6 drivers')}</small></button>
      <button class="btn dark" data-act="create">➕ ${T('Crea stanza per amici','Create a room for friends')}</button>
      <div class="joinrow"><input type="text" id="ocode" maxlength="5" placeholder="${T('CODICE','CODE')}" value="${esc(code)}" autocapitalize="characters" autocomplete="off" aria-label="${T('Codice stanza','Room code')}"><button class="btn" data-act="join">🔑 ${T('Entra','Join')}</button></div>
      ${last&&!code?`<button class="btn" data-act="rejoin" data-v="${esc(last)}">↩︎ ${T('Rientra nella stanza','Rejoin room')} ${esc(last)}</button>`:''}
      <button class="btn out" data-act="menu">‹ Menu</button>
    </div>`,false);
}
function readName(){const el=$('#oname');const v=cleanName(el?el.value:lsGet(NAME_KEY));lsSet(NAME_KEY,v);return v;}
function lobbyHTML(){
  const Lb=NET.lobby||{},ps=Lb.players||{},meta=Lb.meta||{},ids=Object.keys(ps).filter(u=>ps[u].online!==false);
  const cpus=NET.host?NET.cpus:(meta.cpus||0);
  const link=`${location.origin}${location.pathname}#${NET.code}`;
  const seats=ids.map((u,k)=>`<div class="seat">${tok({color:COLORS[k%6]})}<b>${esc(ps[u].name)}</b>${u===meta.host?'<span class="b gold">HOST</span>':''}${u===NET.uid?`<span class="b">${T('tu','you')}</span>`:''}</div>`).join('')
    +Array.from({length:cpus},(_,k)=>`<div class="seat">${tok({color:COLORS[(ids.length+k)%6]})}<b>CPU ${k+1}</b><span class="b">🤖</span></div>`).join('');
  const cd=NET.host?NET.cd:meta.cd;
  const top=NET.pub
    ?`<p>${ids.length<PUB_MIN?T(`⏳ Piloti in attesa: <b>${ids.length}/${PUB_MAX}</b> · si parte da ${PUB_MIN}`,`⏳ Drivers waiting: <b>${ids.length}/${PUB_MAX}</b> · starts from ${PUB_MIN}`):T(`✅ <b>${ids.length}/${PUB_MAX}</b> piloti: ${NET.host?'puoi partire quando vuoi':"l'host può partire"}`,`✅ <b>${ids.length}/${PUB_MAX}</b> drivers: ${NET.host?'you can start whenever you like':'the host can start'}`)}</p>`
    :`<div class="joinrow"><input type="text" readonly value="${esc(link)}" id="olink" aria-label="Link"><button class="btn" data-act="copylink">📋 ${T('Copia link','Copy link')}</button></div><p>${T('Gli amici aprono il link, oppure scelgono “Entra” e scrivono il codice.','Friends open the link, or tap “Join” and type the code.')}</p>`;
  const lonely=NET.pub&&ids.length<2&&Date.now()-(NET.lobbyT||0)>45000;
  return `<h2>${NET.pub?'⚡ '+T('Partita veloce','Quick game'):'🔑 '+T('Stanza','Room')} <span class="code">${esc(NET.code)}</span></h2>${top}
    <div class="seats">${seats}</div>
    ${NET.host
      ?`<div class="row">${NET.pub?(lonely?`<button class="btn sm" data-act="cpustart">🤖 ${T('Intanto gioca con le CPU','Play with CPUs meanwhile')}</button>`:''):`<button class="btn sm" data-act="addcpu" ${ids.length+cpus>=6?'disabled':''}>+ CPU</button><button class="btn sm" data-act="rmcpu" ${cpus?'':'disabled'}>− CPU</button>`}</div>
        <div class="row"><button class="btn primary" data-act="ostart" ${(NET.pub?ids.length>=PUB_MIN:ids.length+cpus>=2)?'':'disabled'}>🚦 ${T('Via!','Go!')}${NET.pub&&ids.length<PUB_MIN?` <small>(min ${PUB_MIN})</small>`:''}</button><button class="btn out" data-act="oleave">${T('Esci','Leave')}</button></div>`
      :`<p class="waitline">⏳ ${NET.pub?T(`L'host avvia la partita da ${PUB_MIN} piloti in su…`,`The host starts the game from ${PUB_MIN} drivers…`):T("In attesa che l'host avvii la partita…",'Waiting for the host to start…')}</p><div class="row"><button class="btn out" data-act="oleave">${T('Esci','Leave')}</button></div>`}`;
}
function showLobby(){if(!NET.on||NET.started)return;openSheet(lobbyHTML(),false);}

// ---------- Stanze ----------
async function joinSelf(name){await NET.db.update(room(`players/${NET.uid}`),{name,online:true,ts:Date.now()});NET.db.onDisc(room(`players/${NET.uid}/online`),false);}
async function createRoom(pub){
  const name=readName();await netInit();const db=NET.db;
  let code=genCode();for(let k=0;k<5&&await db.get(`rooms/${code}/meta`);k++)code=genCode();
  netReset();Object.assign(NET,{on:true,host:true,code,pub:!!pub,cpus:pub?0:1,lobbyT:Date.now()});
  await db.set(room('meta'),{host:NET.uid,pub:!!pub,status:'lobby',ts:Date.now(),hostOnline:true,cpus:NET.cpus});
  db.onDisc(room('meta/hostOnline'),false);
  await joinSelf(name);
  if(pub){await db.set(`public/${code}`,{n:1,max:PUB_MAX,ts:Date.now(),host:name});db.onDisc(`public/${code}`,null);}
  if(!pub)lsSet(LAST_ROOM,code);
  hostListen();showLobby();
}
async function joinRoom(code,quiet){
  code=String(code||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,5);
  if(code.length!==5){if(!quiet)toastSheet(T('Il codice ha 5 lettere.','The code has 5 letters.'));return false;}
  const name=readName();await netInit();const db=NET.db;
  const meta=await db.get(`rooms/${code}/meta`);
  if(!meta||meta.status==='closed'){if(!quiet)toastSheet(T('Stanza non trovata.','Room not found.'));return false;}
  const me=await db.get(`rooms/${code}/players/${NET.uid}`);
  if(meta.status!=='lobby'&&!me){if(!quiet)toastSheet(T('La partita è già iniziata.','That game has already started.'));return false;}
  const ps=await db.get(`rooms/${code}/players`)||{};
  if(!me&&Object.values(ps).filter(x=>x.online!==false).length+(meta.cpus||0)>=6){if(!quiet)toastSheet(T('La stanza è piena.','The room is full.'));return false;}
  netReset();Object.assign(NET,{on:true,host:meta.host===NET.uid,code,pub:!!meta.pub,started:false,lobbyT:Date.now()});
  await joinSelf(name);lsSet(LAST_ROOM,meta.pub?null:code);
  if(NET.host){NET.cpus=meta.cpus||0;hostListen();if(meta.status==='lobby')showLobby();}
  else{guestListen();if(meta.status==='lobby')showLobby();else openSheet(`<p class="waitline">⏳ ${T('Rientro in partita…','Rejoining the game…')}</p>`,false);}
  return true;
}
function closeQuickList(){if(NET.listOff){NET.listOff();NET.listOff=null;}clearInterval(NET.listT);NET.listT=null;}
async function quickMatch(){
  readName();await netInit();const db=NET.db;closeQuickList();
  let last={};
  const paint=list=>{
    if(NET.on)return;last=list||{};
    const now=Date.now();
    const rooms=Object.entries(last).filter(([,v])=>v&&v.n<v.max&&now-v.ts<90000).sort((a,b)=>b[1].n-a[1].n||a[1].ts-b[1].ts);
    openSheet(`<h2>⚡ ${T('Partite veloci','Quick games')}</h2>
      <p>${rooms.length?T('Scegli una partita in attesa di piloti, oppure creane una nuova.','Pick a game waiting for drivers, or create a new one.'):T('Nessuna partita in attesa in questo momento: creane una e aspetta gli altri.','No games waiting right now: create one and wait for others.')}</p>
      <div class="qlist">${rooms.map(([code,v])=>`<button class="qroom" data-act="qjoin" data-v="${esc(code)}"><span class="qhost">${esc(v.host||'?')}</span><span class="qn" aria-hidden="true">${'●'.repeat(Math.min(v.n,v.max))}${'○'.repeat(Math.max(0,v.max-v.n))}</span><b>${v.n}/${v.max}</b><span class="btn sm primary">${T('Entra','Join')}</span></button>`).join('')}</div>
      <div class="row"><button class="btn dark" data-act="qnew">➕ ${T('Crea partita veloce','Create a quick game')}</button><button class="btn out" data-act="qback">${T('Indietro','Back')}</button></div>`,false);
  };
  NET.listOff=db.on('public',paint);
  NET.listT=setInterval(()=>paint(last),15000);
}
async function quickJoin(code){
  closeQuickList();const db=NET.db;
  const r=await db.txn(`public/${code}/n`,n=>n==null||n>=PUB_MAX?undefined:n+1);
  if(!r.committed||!await joinRoom(code,true)){toastSheet(T('Questa partita si è appena riempita o è partita. Scegline un\'altra.','That game just filled up or started. Pick another one.'));return;}
}
function toastSheet(msg){openSheet(`<h2>🌐 Online</h2><p>${msg}</p><div class="row"><button class="btn dark" data-act="online">${T('Indietro','Back')}</button></div>`,false);}

// ---------- Host ----------
function hostListen(){
  const db=NET.db;netOff();NET.lobby={meta:null,players:{}};
  NET.offs.push(db.on(room('meta'),m=>{NET.lobby.meta=m;}));
  NET.offs.push(db.on(room('players'),ps=>{NET.lobby.players=ps||{};
    if(!NET.started){if(NET.pub){db.update(`public/${NET.code}`,{n:Object.values(ps||{}).filter(x=>x.online!==false).length});pubCountdown();}showLobby();}
    else hostPresence(ps||{});}));
  NET.offs.push(db.onAdd(room('inbox'),(k,m)=>hostInbox(k,m)));
  db.update(room('meta'),{hostOnline:true});
  if(NET.pub&&!NET.tick)NET.tick=setInterval(()=>{if(NET.started)return;showLobby();if(Date.now()-(NET.beat||0)>20000){NET.beat=Date.now();db.update(`public/${NET.code}`,{ts:Date.now()});}},5000);
}
function pubCountdown(){
  if(!NET.host||!NET.pub||NET.started)return;
  const n=Object.values(NET.lobby.players||{}).filter(x=>x.online!==false).length;
  if(n>=PUB_MAX)startOnline();
}
async function startOnline(){
  if(NET.started)return;NET.started=true;clearInterval(NET.cdT);clearInterval(NET.tick);NET.tick=null;
  const ps=NET.lobby.players||{},ids=Object.keys(ps).filter(u=>ps[u].online!==false);
  setup.mode='single';if(!setup.limit)setup.limit=20;
  setup.players=ids.map((u,k)=>({name:cleanName(ps[u].name),cpu:false,color:COLORS[k%6],uid:u}))
    .concat(Array.from({length:NET.cpus},(_,k)=>({name:'CPU '+(k+1),cpu:true,color:COLORS[(ids.length+k)%6]})));
  await NET.db.update(room('meta'),{status:'play',cpus:NET.cpus,cd:null});
  if(NET.pub)NET.db.remove(`public/${NET.code}`);
  closeSheet();paintNet();startGame(null);
}
function pushState(){
  if(!NET.on||!NET.host||!NET.started||!S||NET.timer)return;
  const wait=Math.max(0,200-(Date.now()-(NET.lastPush||0)));
  NET.timer=setTimeout(()=>{NET.timer=null;NET.lastPush=Date.now();if(!S||!NET.on)return;
    const s2={...S,log:S.log.slice(0,15),hist:S.over?S.hist:[],asked:{}};
    NET.db.set(room('state'),{j:JSON.stringify(s2),busy:!!busy,ov:NET.overlay||null,t:Date.now()});},wait);
}
function hostFx(o){if(!NET.on||!NET.host||!NET.started)return;NET.fxs=(NET.fxs||0)+1;NET.db.set(room('fx'),{...o,s:NET.fxs});}
function remoteAsk(uid,msg,def){const id=++NET.seq;return new Promise(res=>{NET.pending[id]={res,uid,def};NET.db.set(room(`to/${uid}`),{...msg,id});});}
function sanitizeOffer(o){
  if(!o||typeof o!=='object')return null;
  const ints=a=>Array.isArray(a)?a.map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<32):[];
  const cash=v=>Math.max(0,Math.floor(+v||0));
  const roy=r=>({pct:PCTS.includes(+(r&&r.pct))?+r.pct:0,turns:[1,2,3].includes(+(r&&r.turns))?+r.turns:2});
  return {from:+o.from,to:+o.to,give:ints(o.give),get:ints(o.get),cashGive:cash(o.cashGive),cashGet:cash(o.cashGet),royGive:roy(o.royGive),royGet:roy(o.royGet),pact:[0,1,2,3].includes(+o.pact)?+o.pact:0};
}
function hostInbox(k,m){
  NET.db.remove(room(`inbox/${k}`));
  if(!m||!S)return;
  const p=S.players.find(q=>q.uid&&q.uid===m.from);if(!p)return;
  if(m.t==='choice'||m.t==='edited'){const pd=NET.pending[m.id];
    if(pd&&pd.uid===m.from){delete NET.pending[m.id];NET.db.remove(room(`to/${m.from}`));pd.res(m.t==='choice'?String(m.v):sanitizeOffer(m.o));}return;}
  if(S.over||cur()!==p||p.cpu)return;
  if(m.t==='act'&&GAME_ACT[m.a]){GAME_ACT[m.a](m.ds||{});return;}
  if(m.t==='offer'&&!busy&&['roll','end'].includes(S.phase)){const o=sanitizeOffer(m.o);if(!o||o.from!==p.id)return;
    (async()=>{busy=true;render();await negotiate(o);busy=false;save();render();})();}
}
function hostPresence(ps){
  if(!S)return;
  for(const p of S.players){
    if(!p.uid||p.out)continue;
    const on=!!ps[p.uid]&&ps[p.uid].online!==false;
    if(!on&&!p.away){
      p.away=true;p.cpu=true;log(T(`📴 ${p.name} si è disconnesso: guida la CPU`,`📴 ${p.name} disconnected: the CPU takes over`));
      for(const id in NET.pending){const pd=NET.pending[id];if(pd.uid===p.uid){delete NET.pending[id];NET.db.remove(room(`to/${p.uid}`));pd.res(pd.def);}}
      save();render();
      if(!S.over&&cur()===p&&!busy&&!cpuActive&&['roll','end','buy'].includes(S.phase))cpuTurn();
    }else if(on&&p.away){p.away=false;p.cpu=false;log(T(`📶 ${p.name} è tornato in pista`,`📶 ${p.name} is back on track`));save();render();}
  }
}

// ---------- Ospite ----------
function guestListen(){
  const db=NET.db;netOff();NET.lobby={meta:null,players:{}};let fxInit=false;
  NET.offs.push(db.on(room('meta'),m=>{NET.lobby.meta=m;
    if(!m||m.status==='closed'){netGone(T("L'host ha chiuso la partita.",'The host closed the game.'));return;}
    if(m.status==='lobby'&&NET.started){NET.started=false;NET.overShown=false;S=null;render();}
    if(m.status==='lobby')showLobby();
    NET.hostAway=m.hostOnline===false;paintNet();}));
  NET.offs.push(db.on(room('players'),ps=>{NET.lobby.players=ps||{};if(!NET.started)showLobby();}));
  NET.offs.push(db.on(room('state'),v=>guestState(v)));
  NET.offs.push(db.on(room(`to/${NET.uid}`),v=>guestPrompt(v)));
  NET.offs.push(db.on(room('fx'),v=>{if(!v)return;if(!fxInit){fxInit=true;NET.fxs=v.s;return;}if(v.s<=(NET.fxs||0))return;NET.fxs=v.s;
    if(v.n==='dice'&&v.a)animateDice(v.a,v.b,true);else if(v.n==='confetti')confetti(v.c,true);else if(v.n==='card')cardFx(v.t,true);else if(v.n==='deed')deedFx(v.i,v.p,true);else if(v.n==='coins')coinFx(v.a,v.b,v.m,true);else sfx(v.n,true);}));
}
function guestState(v){
  if(!v||!v.j||!NET.on)return;
  if(NET.lobby.meta&&NET.lobby.meta.status==='lobby')return;
  const first=!NET.started;NET.started=true;
  if(first){hideMenu();musicStop();setTimeout(musicStart,900);for(const k in carRot)delete carRot[k];for(const k in prevCash)delete prevCash[k];$('#cars').innerHTML='';if(!NET.prompt)closeSheet();paintNet();}
  const pt=S&&S.turn,pr=S&&S.round;
  try{S=JSON.parse(v.j);}catch(e){return;}
  busy=!!v.busy;
  if(!first&&(pt!==S.turn||pr!==S.round)&&!S.over){banner(cur());if(isMine(cur()))sfx('bid',true);}
  render();
  if(NET.prompt)return;
  if(S.over){if(!NET.overShown){NET.overShown=true;gameEndLocal(ranking()[0]);setTimeout(()=>{if(!NET.prompt&&S&&S.over)showGameOver();},900);}return;}
  if(NET.localSheet){if(NET.panel==='manage')showManage();else if(NET.panel&&NET.panel.startsWith('info:'))showInfo(+NET.panel.slice(5));return;}
  if(v.ov){openSheet(v.ov,false);$('#sheet').classList.add('ro');NET.roShown=true;}
  else if(NET.roShown)closeSheet();
}
function guestPrompt(v){
  if(!v){if(NET.prompt){NET.prompt=null;choice=null;trResolve=null;closeSheet();}return;}
  if(NET.prompt===v.id)return;NET.prompt=v.id;sfx('card',true);
  if(v.kind==='ask'){choice=val=>{NET.prompt=null;netSend({t:'choice',id:v.id,v:val});closeSheet();};openSheet(v.html,false);}
  else editOffer(v.o,v.locked,v.title).then(o=>{NET.prompt=null;closeSheet();netSend({t:'edited',id:v.id,o:o||null});});
}
function netGone(msg){
  netReset();S=null;GEN++;busy=false;cpuActive=false;choice=null;trResolve=null;
  $('#cars').innerHTML='';render();
  openSheet(`<h2>🌐 Online</h2><p>${msg}</p><div class="row"><button class="btn primary" data-act="menu">🏠 Menu</button></div>`,false);
}
async function netLeave(endForAll){
  if(!NET.on)return;
  const db=NET.db,code=NET.code,wasHost=NET.host,started=NET.started;
  try{
    if(wasHost){
      if(endForAll||!started){await db.update(`rooms/${code}/meta`,{status:'closed',hostOnline:false});if(NET.pub)db.remove(`public/${code}`);setTimeout(()=>db.remove(`rooms/${code}`),4000);lsSet(KEY_ON,null);lsSet(LAST_ROOM,null);}
      else await db.update(`rooms/${code}/meta`,{hostOnline:false});
    }else{await db.update(`rooms/${code}/players/${NET.uid}`,{online:false});if(!started)db.remove(`rooms/${code}/players/${NET.uid}`);}
  }catch(e){}
  netReset();
}
async function resumeOnline(){
  const sv=(()=>{try{return JSON.parse(lsGet(KEY_ON));}catch(e){return null;}})();
  if(!sv||!sv.net){showMenu();return;}
  await netInit();const meta=await NET.db.get(`rooms/${sv.net.code}/meta`);
  if(!meta||meta.status==='closed'||meta.host!==NET.uid){lsSet(KEY_ON,null);toastSheet(T('Questa stanza non esiste più.','This room no longer exists.'));return;}
  hideMenu();musicStop();GEN++;
  netReset();Object.assign(NET,{on:true,host:true,code:sv.net.code,pub:!!sv.net.pub,started:true,cpus:meta.cpus||0});
  S=sv;busy=false;cpuActive=false;
  await joinSelf(lsGet(NAME_KEY)||S.players.find(p=>p.uid===NET.uid)?.name||'Host');
  hostListen();paintNet();
  if(S.phase==='auction')S.phase='buy';if(S.phase==='buy'&&S.pending==null)S.phase='end';if(S.phase==='order')S.phase='roll';
  render();pushState();
  if(S.phase==='stopgo'){cur().stopgo=true;startTurn();}else if(cur().cpu)cpuTurn();
}

