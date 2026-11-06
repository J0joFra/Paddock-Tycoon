// ================= Stato e utilità =================
let S=null, busy=false, cpuActive=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let GEN=0;
let TURBO=false;
const speedK=()=>{const c=S&&S.players&&S.players[S.turn];return (reduced?.35:1)*(S&&S.fast?.45:1)*(TURBO?.08:1)*(S&&S.cpuFast&&c&&c.cpu?.35:1);};
const wait=ms=>{const g=GEN;return new Promise(r=>setTimeout(()=>{if(g===GEN)r();},ms*speedK()));};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>'€'+n+'M';
// Generatore casuale della logica di gioco: Math.random di solito, con seme nella sfida del giorno
let RNG=Math.random;
const rand=()=>RNG();
function seeded(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function setRng(seed,n=0){if(seed==null){RNG=Math.random;return;}const g=seeded(seed);for(let i=0;i<n;i++)g();RNG=()=>{if(S)S.rngN=(S.rngN||0)+1;return g();};}
const rnd6=()=>1+Math.floor(rand()*6);
const vis6=()=>1+Math.floor(Math.random()*6);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const cur=()=>S.players[S.turn];
const P=id=>S.players[id];
const rivals=p=>S.players.filter(o=>o!==p&&!o.out);
const propsOf=p=>Object.keys(S.own).map(Number).filter(i=>S.own[i].owner===p.id);
const groupIdx=g=>SQ.map((s,i)=>i).filter(i=>SQ[i].g===g);
const ownsGroup=(p,g)=>groupIdx(g).every(i=>S.own[i]&&S.own[i].owner===p.id);
const groupHasUpgrades=g=>groupIdx(g).some(i=>S.own[i]&&S.own[i].level>0);
const groupHasMort=g=>groupIdx(g).some(i=>S.own[i]&&S.own[i].mort);
function helmetSVG(c,d=0){
  const pat=d===1?'<path d="M10.8 3h2.6v18h-2.6z" fill="#fff"/>':d===2?'<path d="M3 8.5l9 5.2 9-5.2v3.2l-9 5.2-9-5.2z" fill="#fff"/>':d===3?'<path d="M7 5.6l.8 1.7 1.9.2-1.4 1.2.4 1.9-1.7-1-1.7 1 .4-1.9-1.4-1.2 1.9-.2zM16.6 4.4l.6 1.4 1.5.1-1.1 1 .3 1.5-1.3-.8-1.3.8.3-1.5-1.1-1 1.5-.1z" fill="#fff"/>':'';
  return `<svg class="helm" viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id="hc"><path d="M3 15a9 9 0 0 1 18 0v3.5a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 18.5z"/></clipPath></defs><path d="M3 15a9 9 0 0 1 18 0v3.5a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 18.5z" fill="${c}" stroke="#15171c" stroke-width="1.4"/><g clip-path="url(#hc)">${pat}</g><path d="M9 12.4h11.2v4.3H9.7a2 2 0 0 1-.7-1.5z" fill="#15171c"/><path d="M11 13.6h7.6" stroke="#6b7280" stroke-width=".9"/></svg>`;
}
const HELMS=4;
const tok=(p,cls='')=>`<span class="tk ${cls}" style="--pc:${p.color}"></span>`;
const gcol=i=>SQ[i].g?G[SQ[i].g].c:'#9ca3af';

function save(){if(!S||isGuest())return;try{if(NET.on)localStorage.setItem(KEY_ON,JSON.stringify({...S,net:{code:NET.code,pub:NET.pub}}));else localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function loadSaved(){try{const s=localStorage.getItem(KEY);return s?JSON.parse(s):null;}catch(e){return null;}}
function log(t){S.log.unshift(t);S.log.length=Math.min(S.log.length,80);}
function setMsg(text,kind='info'){S.msg={text,kind};}

