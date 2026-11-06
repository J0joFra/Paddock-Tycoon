// ================= Dadi =================
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const dieHTML=n=>Array.from({length:9},(_,k)=>`<i class="${PIPS[n].includes(k)?'on':''}"></i>`).join('');
async function animateDice(a,b,remote){
  if(!remote&&NET.on&&NET.host)hostFx({n:'dice',a,b});
  const d1=$('#d1'),d2=$('#d2');sfx('dice',true);
  d1.classList.add('rolling');d2.classList.add('rolling');
  for(let k=0;k<8;k++){d1.innerHTML=dieHTML(vis6());d2.innerHTML=dieHTML(vis6());await wait(55);}
  d1.classList.remove('rolling');d2.classList.remove('rolling');
  d1.innerHTML=dieHTML(a);d2.innerHTML=dieHTML(b);
}

