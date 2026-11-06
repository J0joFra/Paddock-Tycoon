// ================= Suoni =================
let AC=null, muted=false, stepK=0;
try{muted=localStorage.getItem(MUTE_KEY)==='1';}catch(e){}
function ac(){
  if(muted) return null;
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}
  if(AC.state==='suspended') AC.resume();
  return AC;
}
function tone(f,dur,type='sine',vol=.12,when=0,slide){
  const a=ac(); if(!a) return;
  const t=a.currentTime+when, o=a.createOscillator(), g=a.createGain();
  o.type=type; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(slide,t+dur);
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(sfxBus()); o.start(t); o.stop(t+dur+.02);
}
function noise(dur,vol=.2,when=0,hp=800){
  const a=ac(); if(!a) return;
  const t=a.currentTime+when, n=Math.floor(a.sampleRate*dur), buf=a.createBuffer(1,n,a.sampleRate), d=buf.getChannelData(0);
  for(let k=0;k<n;k++) d[k]=(Math.random()*2-1)*(1-k/n);
  const s=a.createBufferSource(), g=a.createGain(), f=a.createBiquadFilter();
  f.type='highpass'; f.frequency.value=hp; s.buffer=buf; g.gain.value=vol;
  s.connect(f).connect(g).connect(sfxBus()); s.start(t);
}
const arp=(notes,step=.09,type='square',vol=.07)=>notes.forEach((n,k)=>tone(n,step*1.6,type,vol,k*step));
const SFX={
  dice:()=>{for(let k=0;k<7;k++) noise(.035,.25,k*.055,1500);},
  step:()=>{const k=Math.min(stepK++,12);tone(105+k*18,.12,'sawtooth',.035,0,170+k*26);},
  coin:()=>{tone(988,.08,'square',.06);tone(1319,.22,'square',.06,.08);},
  pay:()=>tone(420,.18,'triangle',.14,0,210),
  buy:()=>arp([523,659,784,1047]),
  card:()=>{tone(1400,.05,'sine',.1);tone(1800,.05,'sine',.1,.08);tone(1400,.05,'sine',.1,.16);},
  siren:()=>{tone(650,.3,'sawtooth',.05,0,1050);tone(1050,.3,'sawtooth',.05,.3,650);},
  gavel:()=>{noise(.06,.5,0,300);tone(150,.12,'square',.15);},
  bid:()=>tone(700,.08,'triangle',.14,0,900),
  alarm:()=>{tone(540,.12,'square',.07);tone(540,.12,'square',.07,.18);},
  deal:()=>{tone(660,.1,'sine',.12);tone(990,.25,'sine',.12,.1);},
  no:()=>tone(220,.22,'square',.07,0,160),
  build:()=>{noise(.05,.2,0,400);tone(330,.08,'square',.08,.05);tone(494,.12,'square',.08,.13);},
  bankrupt:()=>tone(440,.9,'sawtooth',.08,0,70),
  win:()=>arp([523,659,784,1047,784,1047,1319],.12,'square',.07),
  engine:()=>tone(90,.5,'sawtooth',.05,0,240),
  crowd:()=>crowd(),
};
const VIB={dice:12,pay:25,bankrupt:[70,40,70],gavel:18,siren:[30,40,30],buy:15,win:[40,30,40,30,80]};
