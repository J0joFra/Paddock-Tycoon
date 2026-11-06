// ================= Preferenze =================
const PREF_KEY='paddock-tycoon-prefs';
const PREFS=Object.assign({music:70,sfx:85,gameMusic:true,night:false,big:false,pat:false,vib:true},(()=>{try{return JSON.parse(localStorage.getItem(PREF_KEY))||{};}catch(e){return {};}})());
function savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify(PREFS));}catch(e){}}
let SFXBUS=null;
function sfxBus(){if(!SFXBUS||SFXBUS.context!==AC){SFXBUS=AC.createGain();SFXBUS.connect(AC.destination);}SFXBUS.gain.value=PREFS.sfx/100;return SFXBUS;}
const musicLevel=tr=>(tr==='menu'?.5:.3)*PREFS.music/100;
function applyPrefs(){
  const r=document.documentElement;
  if(PREFS.night)r.dataset.mode='night';else delete r.dataset.mode;
  r.toggleAttribute('data-big',!!PREFS.big);r.toggleAttribute('data-pat',!!PREFS.pat);
  if(SFXBUS)SFXBUS.gain.value=PREFS.sfx/100;
  if(MUSIC.playing&&MUSIC.out&&AC){MUSIC.out.gain.cancelScheduledValues(AC.currentTime);MUSIC.out.gain.setTargetAtTime(musicLevel(MUSIC.track),AC.currentTime,.1);}
}
