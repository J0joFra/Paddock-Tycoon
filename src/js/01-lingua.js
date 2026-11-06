// ================= Lingua =================
const LANG_KEY='paddock-tycoon-lang';
const LANG=(()=>{try{const v=localStorage.getItem(LANG_KEY);if(v==='it'||v==='en')return v;}catch(e){}return (navigator.language||'it').toLowerCase().startsWith('it')?'it':'en';})();
const T=(it,en)=>LANG==='en'?en:it;
document.documentElement.lang=LANG;
const NET={on:false,host:false,code:null,uid:null,db:null,offs:[],pending:{},seq:0,lobby:{},cpus:0};
const isMine=p=>!!p&&!p.cpu&&(!NET.on||p.uid===NET.uid);
const isGuest=()=>NET.on&&!NET.host;
function applyStatic(){
  if(LANG!=='en')return;
  const set=(sel,attr,val)=>{const e=document.querySelector(sel);if(e){if(attr)e.setAttribute(attr,val);else e.textContent=val;}};
  set('#fsbtn','aria-label','Fullscreen');set('.ib[data-act=rules]','aria-label','Rules');set('.ib[data-act=pause]','aria-label','Pause and menu');
  set('#tab',null,'🤝 Deals');set('.rotate h2',null,'Rotate your phone');set('.rotate .btn',null,'Play in landscape');
}
