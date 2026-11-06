// ================= Dati =================
const START_CASH=1400, LAP_BONUS=150, STOPGO_FEE=50, BRIBE=100;
const KEY='paddock-tycoon-v4', MUTE_KEY='paddock-tycoon-muted';
const G={
  g1:{n:'Nuovi Orizzonti',c:'#14b8a6',up:50},
  g2:{n:'Deserto',c:'#f97316',up:60},
  g3:{n:'Oriente',c:'#ec4899',up:90},
  g4:{n:'Americhe',c:'#3b82f6',up:110},
  g5:{n:'Classici',c:'#65a30d',up:140},
  g6:{n:'Leggende',c:'#7c3aed',up:180},
};
const C=(name,code,g,price,km,country,tk)=>({t:'c',name,code,g,price,km,country,tk});
const CARD={t:'card',name:'Radio Box',code:'RADIO'}, DRS={t:'drs',name:'Zona DRS',code:'DRS'};
const SQ=[
  {t:'go',name:'Semaforo Verde',code:'VIA'},
  C('Baia di Biscayne','BAY','g1',60,5.412,'Stati Uniti','MIA'), CARD,
  C('Neon Strip','NEO','g1',70,6.201,'Stati Uniti','LVG'), C('Perla del Deserto','PRL','g1',80,5.419,'Qatar','LUS'),
  {t:'tax',name:"Tassa d'iscrizione",code:'TASSA',amount:80},
  C('Oasi Rossa','OAS','g2',100,5.412,'Bahrein','BHR'), C('Corniche','COR','g2',110,6.174,'Arabia Saudita','JED'),
  {t:'pit',name:'Pit Lane',code:'PIT'},
  C('Isola delle Luci','ISL','g2',120,5.281,'Emirati Arabi','ABU'),
  {t:'u',name:'Fornitore Gomme',code:'GOMME',price:150},
  C('Baia di Mezzanotte','MZN','g3',140,4.940,'Singapore','SIN'), DRS,
  C("Loto d'Oriente",'LOT','g3',150,5.451,'Cina','SHA'), CARD,
  C('Otto Volante','OTT','g3',170,5.807,'Giappone','SUZ'),
  {t:'sc',name:'Safety Car',code:'SC'},
  C('Collina Texana','TEX','g4',190,5.513,'Stati Uniti','COA'), CARD,
  C('Altopiano','ALT','g4',200,4.304,'Messico','MEX'), C('Anello Paulista','PAU','g4',220,4.309,'Brasile','INT'),
  {t:'u',name:'Fornitore Carburante',code:'FUEL',price:150},
  C('Foresta delle Ardenne','ARD','g5',240,7.004,'Belgio','SPA'), DRS,
  {t:'cops',name:'Commissari di gara',code:'DIR'},
  C('Isola del Fiume','ILE','g5',250,4.361,'Canada','MTL'), C('Valle del Danubio','DAN','g5',260,4.381,'Ungheria','HUN'), CARD,
  C('Vecchio Aeroporto','AER','g6',300,5.891,'Regno Unito','SIL'),
  {t:'tax',name:'Superlicenza',code:'TASSA',amount:150},
  C('Tempio della Velocità','TMP','g6',320,5.793,'Italia','MZA'), C('Principato','PRI','g6',380,3.337,'Principato di Monaco','MON'),
];
const PIT=8;
const NAMES_EN={'Semaforo Verde':'Green Light','Baia di Biscayne':'Biscayne Bay','Perla del Deserto':'Desert Pearl',"Tassa d'iscrizione":'Entry Fee','Oasi Rossa':'Red Oasis','Isola delle Luci':'Island of Lights','Fornitore Gomme':'Tyre Supplier','Baia di Mezzanotte':'Midnight Bay',"Loto d'Oriente":'Eastern Lotus','Otto Volante':'Figure Eight','Collina Texana':'Texas Hill','Altopiano':'High Plateau','Anello Paulista':'Paulista Ring','Fornitore Carburante':'Fuel Supplier','Foresta delle Ardenne':'Ardennes Forest','Commissari di gara':'Race Stewards','Isola del Fiume':'River Island','Valle del Danubio':'Danube Valley','Vecchio Aeroporto':'Old Airfield','Superlicenza':'Super Licence','Tempio della Velocità':'Temple of Speed','Principato':'The Principality','Zona DRS':'DRS Zone'};
const CODES_EN={VIA:'GO',TASSA:'TAX',GOMME:'TYRES',DIR:'STW'};
const CTRY_EN={'Stati Uniti':'United States','Bahrein':'Bahrain','Arabia Saudita':'Saudi Arabia','Emirati Arabi':'United Arab Emirates','Cina':'China','Giappone':'Japan','Messico':'Mexico','Brasile':'Brazil','Belgio':'Belgium','Ungheria':'Hungary','Regno Unito':'United Kingdom','Italia':'Italy','Principato di Monaco':'Monaco'};
const GROUPS_EN={g1:'New Horizons',g2:'Desert',g3:'Far East',g4:'Americas',g5:'Classics',g6:'Legends'};
if(LANG==='en'){
  SQ.forEach(s=>{if(NAMES_EN[s.name])s.name=NAMES_EN[s.name];if(CODES_EN[s.code])s.code=CODES_EN[s.code];if(s.country&&CTRY_EN[s.country])s.country=CTRY_EN[s.country];});
  for(const k in G)G[k].n=GROUPS_EN[k];
}
