// ================= Musica del menu (sintetizzata) =================
const MUSIC_KEY='paddock-tycoon-music';
const MUSIC={on:true,playing:false,timer:null,next:0,step:0,out:null,delay:null,noise:null};
try{MUSIC.on=localStorage.getItem(MUSIC_KEY)!=='0';}catch(e){}
const mf=m=>440*Math.pow(2,(m-69)/12);
// La minore · Fa · Do · Sol, 120 BPM, sedicesimi
const CHORDS=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]];
const ARP=[0,1,2,3,2,1,0,1,2,3,4,3,2,1,2,3];
function mVoice(type,f,t,dur,vol,dest,att=.008){
  const a=AC,o=a.createOscillator(),g=a.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(dest);o.start(t);o.stop(t+dur+.05);return o;
}
function mNoise(t,dur,vol,type,freq){
  const a=AC,s2=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();
  s2.buffer=MUSIC.noise;f.type=type;f.frequency.value=freq;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s2.connect(f).connect(g).connect(MUSIC.out);s2.start(t,Math.random()*.5);s2.stop(t+dur+.02);
}
function mStep(t,k){
  const a=AC,bar=Math.floor(k/16)%4,st=k%16,ch=CHORDS[bar],loop=Math.floor(k/64);
  // cassa
  if(st%4===0){const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.85,t);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.connect(g).connect(MUSIC.out);o.start(t);o.stop(t+.3);}
  // rullante e charleston
  if(st===4||st===12) mNoise(t,.16,.32,'bandpass',1900);
  if(st%2===0) mNoise(t,st%4===2?.06:.03,st%4===2?.13:.06,'highpass',7500);
  // basso in ottavi, salto d'ottava
  if(st%2===0){const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;lp.connect(MUSIC.out);mVoice('sawtooth',mf(ch[0]-24+(st===6||st===14?12:0)),t,.2,.13,lp);}
  // arpeggio con eco (entra dal secondo giro)
  if(loop>0||bar>1){const tones=[ch[0],ch[1],ch[2],ch[0]+12,ch[1]+12];mVoice('square',mf(tones[ARP[st]]+12),t,.11,.035,MUSIC.delay);}
  // accordo di sottofondo
  if(st===0){const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=950;lp.connect(MUSIC.out);ch.forEach((m,j)=>{mVoice('sawtooth',mf(m)*(1+(j-1)*.003),t,2.1,.028,lp,.35);});}
  // piccolo riff ogni secondo giro
  if(loop%2===1&&(st===0||st===3||st===6||st===10)&&bar<3){mVoice('triangle',mf(ch[[2,1,0,1][[0,3,6,10].indexOf(st)]]+12),t,.32,.07,MUSIC.delay);}
}
// Brano della partita: più calmo, 96 BPM, Do · La minore · Fa · Sol con piano elettrico
const GCH=[[48,52,55,59],[45,48,52,55],[41,45,48,52],[43,47,50,55]];
function gStep(t,k){
  const a=AC,bar=Math.floor(k/16)%4,st=k%16,ch=GCH[bar],loop=Math.floor(k/64);
  if(st===0||st===8){const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(40,t+.14);g.gain.setValueAtTime(.42,t);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g).connect(MUSIC.out);o.start(t);o.stop(t+.32);}
  if(st===4||st===12)mNoise(t,.09,.08,'bandpass',2400);
  if(st%4===2)mNoise(t,.04,.05,'highpass',8000);
  if(st%4===0){const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;lp.connect(MUSIC.out);mVoice('triangle',mf(ch[0]-12),t,.42,.14,lp,.01);}
  if(st===0||st===7){const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1700;lp.connect(MUSIC.out);ch.forEach((m,j)=>mVoice(j%2?'sine':'triangle',mf(m+12),t+j*.012,1.15,.03,lp,.02));}
  if(loop>0&&[3,6,10,14].includes(st)&&(k*7+bar)%3!==0){const sc=[ch[0],ch[1],ch[2],ch[3]||ch[0]+12];mVoice('sine',mf(sc[(k+bar)%4]+24),t,.5,.04,MUSIC.delay,.01);}
}
function mSchedule(){
  if(!MUSIC.playing||!AC)return;
  const game=MUSIC.track==='game',spb=60/(game?96:120)/4;
  while(MUSIC.next<AC.currentTime+.15){(game?gStep:mStep)(MUSIC.next,MUSIC.step);MUSIC.next+=spb;MUSIC.step++;}
}
function musicStart(){
  const want=!$('#menu').hidden?'menu':(S&&PREFS.gameMusic?'game':null);
  if(!MUSIC.on||muted||!want)return;
  if(MUSIC.playing){if(MUSIC.track===want)return;musicStop(.4);clearTimeout(MUSIC.sw);MUSIC.sw=setTimeout(musicStart,500);return;}
  MUSIC.track=want;
  const a=ac();if(!a)return;
  if(!MUSIC.noise){const n=a.sampleRate,b=a.createBuffer(1,n,n),d=b.getChannelData(0);for(let k=0;k<n;k++)d[k]=Math.random()*2-1;MUSIC.noise=b;}
  const out=a.createGain(),comp=a.createDynamicsCompressor(),dl=a.createDelay(1),fb=a.createGain(),wet=a.createGain();
  out.gain.setValueAtTime(0,a.currentTime);out.gain.linearRampToValueAtTime(musicLevel(want),a.currentTime+1.8);
  dl.delayTime.value=.375;fb.gain.value=.32;wet.gain.value=.35;
  const dIn=a.createGain();dIn.connect(out);dIn.connect(dl);dl.connect(fb).connect(dl);dl.connect(wet).connect(out);
  out.connect(comp).connect(a.destination);
  MUSIC.out=out;MUSIC.delay=dIn;MUSIC.playing=true;MUSIC.next=a.currentTime+.12;MUSIC.step=0;
  MUSIC.timer=setInterval(mSchedule,25);paintMusic();
}
function musicStop(fade=.7){
  if(!MUSIC.playing)return;
  clearInterval(MUSIC.timer);MUSIC.playing=false;
  const g=MUSIC.out,t=AC.currentTime;
  try{g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+fade);}catch(e){}
  setTimeout(()=>{try{g.disconnect();}catch(e){}},fade*1000+300);paintMusic();
}
function paintMusic(){const b=$('#musicbtn');if(b){b.textContent=(MUSIC.on&&!muted?'🎵 ':'🔇 ')+T('Musica','Music');b.setAttribute('aria-pressed',MUSIC.on&&!muted?'true':'false');}}
function crowd(dur=2.6,vol=.24){
  const a=ac();if(!a)return;const t=a.currentTime,n=Math.floor(a.sampleRate*dur),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);
  let lp=0;for(let k=0;k<n;k++){lp=lp*.96+(Math.random()*2-1)*.04;d[k]=lp*5+(Math.random()*2-1)*.12;}
  const src=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain();bp.type='bandpass';bp.frequency.value=950;bp.Q.value=.55;src.buffer=buf;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.35);g.gain.setValueAtTime(vol,t+dur*.55);g.gain.linearRampToValueAtTime(0,t+dur);
  src.connect(bp).connect(g).connect(sfxBus());src.start(t);
  for(let k=0;k<6;k++){const f=520+Math.random()*600;tone(f,.3+Math.random()*.2,'sine',.022,.15+Math.random()*dur*.55,f*(1.3+Math.random()*.6));}
}
function sfx(n,remote){
  if(!remote&&n!=='step'&&NET.on&&NET.host)hostFx({n});
  if(muted) return;
  if(SFX[n]) try{SFX[n]();}catch(e){}
  if(VIB[n]&&PREFS.vib&&navigator.vibrate) try{navigator.vibrate(VIB[n]);}catch(e){}
}
const ICON_ON='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19.5 5.5a9 9 0 0 1 0 13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const ICON_OFF='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const ICON_LOG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>';
function paintSound(){ $('#sndbtn').innerHTML=muted?ICON_OFF:ICON_ON; }

