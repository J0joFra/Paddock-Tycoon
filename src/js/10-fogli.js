// ================= Fogli (modali) =================
let sheetDismiss=true, choice=null;
function openSheet(html,dismiss=true,priv=false){$('#sheet').innerHTML=html;$('#sheet').classList.remove('ro');$('#backdrop').hidden=false;sheetDismiss=dismiss;
  if(NET.on){if(NET.host){NET.overlay=(!dismiss&&!priv&&NET.started)?html:null;pushState();}else{NET.localSheet=dismiss;NET.roShown=false;NET.panel=null;}}}
function closeSheet(){$('#backdrop').hidden=true;$('#sheet').innerHTML='';$('#sheet').classList.remove('ro');
  if(NET.on){if(NET.host){NET.overlay=null;pushState();}NET.localSheet=false;NET.roShown=false;NET.panel=null;}}
function ask(html,p,def,priv){
  if(NET.on&&NET.host&&p&&!p.cpu&&p.uid&&p.uid!==NET.uid)return remoteAsk(p.uid,{kind:'ask',html},def);
  return new Promise(res=>{choice=res;openSheet(html,false,priv);});}
const askFor=(p,def,priv)=>html=>ask(html,p,def,priv);
function editFor(p,o,locked,title){
  if(NET.on&&NET.host&&p&&!p.cpu&&p.uid&&p.uid!==NET.uid)return remoteAsk(p.uid,{kind:'edit',o,locked,title},null);
  return editOffer(o,locked,title);}
$('#backdrop').addEventListener('click',e=>{if(e.target.id==='backdrop'&&sheetDismiss)closeSheet();});
const handoff=p=>NET.on?'':S.players.filter(x=>!x.cpu&&!x.out).length>1?`<div class="handoff">📱 ${T('Passa il telefono a','Pass the phone to')} ${tok(p)} ${esc(p.name)}</div>`:'';

async function debtScreen(p,amt,creditor,why){
  while(p.cash<amt){
    const mine=propsOf(p).sort((a,b)=>a-b);
    const tiles=mine.map(i=>{
      const o=S.own[i];let a='';
      if(o.level>0) a+=`<button class="btn xs dark" data-choice="down:${i}">${T('Smonta','Dismantle')} +${fmt(Math.floor(lvCost(i,o.level)/2))}</button>`;
      if(canMortgage(i)) a+=`<button class="btn xs dark" data-choice="mort:${i}">${T('Ipoteca','Mortgage')} +${fmt(mortValue(i))}</button>`;
      if(!a) return '';
      return `<div class="tile ${o.mort?'mort':''}" style="--g:${gcol(i)}"><div class="h"><b>${esc(SQ[i].name)}</b><span>${o.mort?T('IPO','MTG'):LV_SHORT[o.level]}</span></div><div class="a">${a}</div></div>`;
    }).join('');
    const any=hasAssets(p);
    const c=await askFor(p,'__auto')(`${handoff(p)}<h2>${any?T('Servono fondi','You need cash'):T('Bancarotta','Bankruptcy')}</h2>
      <div class="debt"><span>${esc(why)}${creditor?' → '+esc(creditor.name):''}<br><small class="muted">${T('In cassa','Cash')} ${fmt(p.cash)}</small></span><b>${fmt(amt)}</b></div>
      ${any?`<div class="tiles">${tiles}</div>`:`<p>${T('Niente più da ipotecare o smontare.','Nothing left to mortgage or dismantle.')}</p>`}
      <div class="row"><button class="btn ${any?'out':'primary'}" data-choice="bk" ${any?'disabled':''}>${T('Dichiara bancarotta','Declare bankruptcy')}</button></div>`);
    if(c==='__auto'){autoRaise(p,amt);break;}
    if(c==='bk') break;
    const [k,i]=c.split(':');
    if(k==='down') sellUpgrade(+i); else if(k==='mort') mortgage(+i);
    render();
  }
  closeSheet();
}

