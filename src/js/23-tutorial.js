// ================= Tutorial =================
const TUT_KEY='paddock-tycoon-tutorial';
const tutDone=()=>{try{return localStorage.getItem(TUT_KEY)==='1';}catch(e){return true;}};
const TUT_IT=[
  ['#board','🏁 Benvenuto in pista','Il tabellone è un circuito di 32 caselle. Le monoposto girano in senso antiorario; a ogni passaggio dal Semaforo Verde incassi €150M.'],
  ['.dice','🎲 I dadi','Tocca Lancia per muoverti. Con un doppio rilanci, ma al terzo doppio di fila prendi uno Stop & Go.'],
  ['#c22','🏟️ I circuiti','Tocca un circuito per vedere prezzo e diritti. Se ti fermi su uno libero puoi comprarlo o mandarlo all\'asta.'],
  ['#c1','🎨 Gruppi colore','Possiedi tutti i circuiti dello stesso colore? I diritti raddoppiano e puoi costruire tribune e poi il Gran Premio.'],
  ['#tower','🏎️ I piloti','Soldi in cassa di ogni pilota. Toccane uno per vedere i suoi circuiti e proporgli un affare.'],
  ['#actions','🕹️ La plancia','Qui lanci, compri, mandi all\'asta e chiudi il turno. Da “Circuiti” gestisci tribune, ipoteche e lo strozzino.'],
  ['#pot','🚨 Eventi del giro','Ogni giro un GP del weekend paga diritti doppi. Tasse e multe riempiono il montepremi: chi si ferma sulla Safety Car lo incassa.'],
  ['#tab','🤝 Affari','Apri la tendina per trattare con gli avversari: soldi, circuiti, controfferte e accordi sotto banco.'],
  [null,'🚦 Pronto?','Se finisci i soldi puoi ipotecare e smontare; perdi solo quando non ti resta nulla. Buona gara!'],
];
const TUT=T(TUT_IT,[
  ['#board','🏁 Welcome to the track','The board is a 32-space circuit. Cars race anticlockwise; every time you pass Green Light you collect €150M.'],
  ['.dice','🎲 The dice','Tap Roll to move. Roll a double and you go again, but three doubles in a row earn a Stop & Go.'],
  ['#c22','🏟️ Circuits','Tap a circuit to see its price and fees. Land on a free one and you can buy it or send it to auction.'],
  ['#c1','🎨 Colour groups','Own every circuit of one colour? Fees double and you can build grandstands, then the Grand Prix.'],
  ['#tower','🏎️ Drivers','Each driver\'s cash. Tap one to see their circuits and propose a deal.'],
  ['#actions','🕹️ Controls','Roll, buy, auction and end your turn here. Under “Circuits” you manage grandstands, mortgages and the loan shark.'],
  ['#pot','🚨 Lap events','Each lap a Weekend GP pays double fees. Taxes and fines fill the jackpot: land on the Safety Car to collect it.'],
  ['#tab','🤝 Deals','Open the drawer to trade with rivals: cash, circuits, counteroffers and under-the-table deals.'],
  [null,'🚦 Ready?','Out of cash? Mortgage and dismantle; you only lose when nothing is left. Good luck!'],
]);
function tutorial(){
  return new Promise(res=>{
    let k=0;const ov=document.createElement('div');ov.className='coach';document.body.appendChild(ov);
    const finish=()=>{ov.remove();removeEventListener('resize',draw);try{localStorage.setItem(TUT_KEY,'1');}catch(e){}res();};
    function draw(){
      const [sel,t,d]=TUT[k],el=sel&&document.querySelector(sel),r=el&&el.offsetParent!==null?el.getBoundingClientRect():null;
      const vw=innerWidth,vh=innerHeight,bw=Math.min(320,vw-32);
      let spot='',bx=(vw-bw)/2,by=vh/2-90;
      if(r&&r.width){
        const pad=6;spot=`<div class="spot" style="left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px"></div>`;
        const big=r.width*r.height>vw*vh*.5;
        if(big){bx=(vw-bw)/2;by=vh/2-90;}
        else if(r.right+bw+20<vw){bx=r.right+14;by=Math.min(Math.max(12,r.top),vh-200);}
        else if(r.left-bw-20>0){bx=r.left-bw-14;by=Math.min(Math.max(12,r.top),vh-200);}
        else{bx=Math.min(Math.max(12,r.left),vw-bw-12);by=r.bottom+180<vh?r.bottom+12:Math.max(12,r.top-190);}
      }else spot='<div class="spot none"></div>';
      ov.innerHTML=`${spot}<div class="bubble" style="left:${bx}px;top:${by}px;width:${bw}px" role="dialog" aria-live="polite">
        <div class="tstep">${k+1} / ${TUT.length}</div><b>${t}</b><p>${d}</p>
        <div class="row"><button class="btn sm out" data-tut="skip">${T('Salta','Skip')}</button><button class="btn sm primary" data-tut="next">${k===TUT.length-1?T('Via!','Go!'):T('Avanti','Next')}</button></div></div>`;
      const nb=ov.querySelector('[data-tut=next]');nb&&nb.focus({preventScroll:true});
    }
    ov.addEventListener('click',e=>{const b=e.target.closest('[data-tut]');if(!b)return;e.stopPropagation();
      if(b.dataset.tut==='skip'){finish();return;} sfx('bid');k++; if(k>=TUT.length)finish(); else draw();});
    addEventListener('resize',draw);draw();
  });
}

