// ================= Regole, carte e costanti di gioco =================
const r5=x=>Math.max(5,Math.round(x/5)*5);
const r10=x=>Math.ceil(x/10)*10;
const rentTable=sq=>[r5(sq.price*.07),r5(sq.price*.45),r5(sq.price*1.2),r5(sq.price*2.4),r5(sq.price*3.6)];
const LV_SHORT=T(['Base','1T','2T','3T','GP'],['Base','1G','2G','3G','GP']);
const COLORS=['#e10a1e','#2563eb','#d97706','#9333ea','#15a34a','#0891b2'];
const PCTS=[0,10,20,30,40,50,60,70,75];
const DF={easy:{reserve:260,build:380,bid:.8,accept:1.0,trade:.4},normal:{reserve:150,build:250,bid:1,accept:1.1,trade:1},shark:{reserve:70,build:140,bid:1.2,accept:1.25,trade:1}};
const RU=()=>Object.assign({cash:START_CASH,auction:true,under:true,pot:true},(S&&S.rules)||{});
const df=()=>DF[(S&&S.diff)||'normal'];
const PTS=[25,18,15,12,10,8];
const RACES=T(['GP Oasi Rossa','GP del Principato',"GP dell'Isola del Fiume",'GP del Vecchio Aeroporto','GP delle Ardenne','GP del Tempio','GP di Mezzanotte','GP Otto Volante','GP Paulista','GP Neon Strip'],
  ['Red Oasis GP','Principality GP','River Island GP','Old Airfield GP','Ardennes GP','Temple GP','Midnight GP','Figure Eight GP','Paulista GP','Neon Strip GP']);
const FINALE=T('GP Neon Strip','Neon Strip GP');
const MODES=[['single',T('Partita singola','Quick game')],['c3',T('🏆 Campionato · 3 gare','🏆 Championship · 3 races')],['c5',T('🏆 5 gare','🏆 5 races')]];
const DIFFS=[['easy',T('🙂 Facile','🙂 Easy')],['normal',T('😐 Normale','😐 Normal')],['shark',T('🦈 Squalo','🦈 Shark')]];

const CARDS=[
  {txt:T('Giro più veloce! +€100M','Fastest lap! +€100M'), fx:async p=>gain(p,100)},
  {txt:T('Vittoria sotto la pioggia. Lo sponsor versa €150M','Win in the rain. Your sponsor pays €150M'), fx:async p=>gain(p,150)},
  {txt:T('Track limits ×3. Multa €50M','Track limits ×3. €50M fine'), fx:async p=>pay(p,50,null,'track limits')},
  {txt:T('Nuovo title sponsor. +€200M','New title sponsor. +€200M'), fx:async p=>gain(p,200)},
  {txt:T('Ala anteriore distrutta. Riparazione €80M','Front wing destroyed. €80M repair'), fx:async p=>pay(p,80,null,T('riparazione ala','wing repair'))},
  {txt:T('Unsafe release: Stop & Go!','Unsafe release: Stop & Go!'), fx:async p=>stopGo(p,'Unsafe release · Stop & Go')},
  {txt:T('Undercut perfetto: vai al Semaforo Verde','Perfect undercut: go to Green Light'), fx:async p=>{await moveTo(p,0); await resolve(p);}},
  {txt:T('Scia sul rettilineo: avanti di 4','Slipstream on the straight: forward 4'), fx:async p=>{await moveSteps(p,4); await resolve(p);}},
  {txt:T('Testacoda: indietro di 3','Spin! Back 3'), fx:async p=>{await moveSteps(p,-3); await resolve(p);}},
  {txt:T('Diritti TV: ogni avversario ti paga €30M','TV rights: every rival pays you €30M'), fx:async p=>{for(const o of rivals(p)) await pay(o,30,p,T('diritti TV','TV rights'));}},
  {txt:T('Festa in hospitality: €25M a ogni avversario','Hospitality party: pay every rival €25M'), fx:async p=>{for(const o of rivals(p)){ if(p.out) break; await pay(p,25,o,'hospitality'); }}},
  {txt:T('Ispezione dei commissari: €25M a tribuna, €100M a GP','Stewards inspection: €25M per grandstand, €100M per GP'), fx:async p=>{
    let n=0; for(const i of propsOf(p)){ const l=S.own[i].level; n+= l===4?100:l*25; }
    if(n>0) await pay(p,n,null,T('ispezione dei commissari','stewards inspection')); }},
  {txt:T('Bandiera verde: annulla uno Stop & Go. Tienila!','Green flag: cancels a Stop & Go. Keep it!'), fx:async p=>{p.flags++; sfx('coin');}},
  {txt:T('Invito al Tempio della Velocità: vai lì','Invitation to the Temple of Speed: go there'), fx:async p=>{await moveTo(p,30); await resolve(p);}},
  {txt:T("Test privato: vai all'Otto Volante",'Private test: go to Figure Eight'), fx:async p=>{await moveTo(p,15); await resolve(p);}},
  {txt:T('Fuga di notizie: un giornalista ti paga €40M per uno scoop','News leak: a journalist pays you €40M for a scoop'), fx:async p=>gain(p,40)},
  {txt:T('Spionaggio tecnico scoperto: multa €120M','Technical espionage exposed: €120M fine'), fx:async p=>pay(p,120,null,T('spionaggio','espionage'))},
  {txt:T('Pole position al sabato: +€60M','Saturday pole position: +€60M'), fx:async p=>gain(p,60)},
  {txt:T('Pit stop da 1,8 secondi: avanti di 2','1.8-second pit stop: forward 2'), fx:async p=>{await moveSteps(p,2); await resolve(p);}},
  {txt:T('Gomme finite: rientri in Pit Lane (senza penalità)','Tyres worn out: back to Pit Lane (no penalty)'), fx:async p=>{p.pos=PIT;sfx('engine');render();await wait(400);}},
  {txt:T('Ordine di scuderia: raggiungi il pilota più ricco','Team orders: join the richest driver'), fx:async p=>{const l=rivals(p).sort((a,b)=>netWorth(b)-netWorth(a))[0]; if(!l||l.pos===p.pos) return; await moveTo(p,l.pos); await resolve(p);}},
  {txt:T('Diretta in streaming: +€20M per ogni tuo circuito','Live stream: +€20M for each circuit you own'), fx:async p=>{const n=propsOf(p).length; if(n) gain(p,20*n);}},
  {txt:T('Lo sponsor ti scarica: €15M per ogni tuo circuito','Sponsor drops you: €15M for each circuit you own'), fx:async p=>{const n=propsOf(p).length; if(n) await pay(p,15*n,null,T('sponsor perso','lost sponsor'));}},
  {txt:T('Bandiera gialla: vai alla Safety Car','Yellow flag: go to Safety Car'), fx:async p=>{await moveTo(p,16); await resolve(p);}},
];

