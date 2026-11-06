# Paddock Tycoon

Gioco da tavolo di compravendita a tema corse automobilistiche, pensato per il telefono in orizzontale.
Compra circuiti, costruisci tribune, ospita il Gran Premio e manda in bancarotta gli avversari.

## Come si gioca

- **Online** (Firebase): stanza con codice o link per gli amici, oppure partite veloci pubbliche (elenco delle partite in attesa, 3-6 piloti, avvio deciso dall'host); se qualcuno si disconnette guida la CPU. Da attivare seguendo [docs/ONLINE-FIREBASE.md](docs/ONLINE-FIREBASE.md).

- **Durata**: 12, 20 (predefinita) o 30 giri, oppure fino all'ultimo in gara. **Fine turno automatico** attivabile nella griglia di partenza.
- Quando compri, il gioco ti segnala se completi un gruppo o se blocchi un avversario; la scheda di un circuito mostra i proprietari del suo gruppo.

- **Italiano e inglese**: la lingua segue quella del telefono e si cambia dal menu principale.

- **Menu principale** con Continua, Partita veloce, Campionato, Impara a giocare e Regolamento; in partita il pulsante ≡ apre la pausa per tornare al menu (la partita resta salvata) o abbandonarla.

- **Pole position**: all'inizio ognuno lancia i dadi, il punteggio più alto parte per primo (con spareggio).

- Da 2 a 6 giocatori, umani o CPU, sullo stesso telefono.
- Si parte con €1400M; ogni passaggio dal **Semaforo Verde** vale €150M.
- 18 circuiti in 6 gruppi di colore, da Miami (€60M) a Monaco (€380M).
- Con un gruppo completo costruisci fino a **3 tribune** per circuito, poi il **Gran Premio**.
- Caselle speciali: **Radio Box** (carte), **Zona DRS** (+3 caselle), **Safety Car** (sosta libera),
  **Commissari FIA** (Stop & Go in Pit Lane), **Fornitori** Gomme e Carburante.
- **Aste**: se nessuno compra un circuito, tutti rilanciano (+10 / +50 / +100) finché resta un solo offerente.
- **Ipoteche e bancarotta**: se non puoi pagare si apre la schermata dei debiti, dove smonti tribune e ipotechi
  circuiti (50% subito, riscatto al 55%). Perdi solo quando non hai più né soldi né beni da ipotecare.
- **Affari con controfferte**: proponi circuiti e denaro; chi riceve può accettare, rifiutare o rilanciare con una controfferta.
- **Sotto banco**: cedi un circuito ma tieni dal 10% al 75% dei suoi diritti per 1–3 giri, oppure stringi un
  patto di non belligeranza. Allo Stop & Go puoi tentare la bustarella ai commissari (50% di riuscita).
- **GP del weekend**: a ogni giro un circuito a caso ospita il Gran Premio e i suoi diritti raddoppiano.
- **Montepremi Safety Car**: tasse, multe e bustarelle finiscono nel montepremi; chi si ferma sulla Safety Car lo incassa.
- Monoposto dettagliate (ala con paratie, sospensioni, pance, halo, casco) animate sul tabellone, banner di turno, importi volanti, coriandoli, vibrazione e premi a fine partita.
- La pista occupa tutto lo schermo e la plancia di gioco sta dentro il circuito.
- Tendina **Affari** sul bordo destro; toccando un GP di un avversario puoi trattarlo subito, toccando un tuo GP lo gestisci.
- **Campionato**: 3 o 5 gare da 8, 12 o 15 giri, con punti per piazzamento (25-18-15-12-10-8) e ultima gara a punti doppi. Tra una gara e l'altra: ordine d'arrivo e classifica piloti.
- **Tutorial guidato** alla prima partita, che evidenzia passo passo le parti dello schermo; si può rivedere dal Regolamento.
- **Tracciati veri**: toccando un circuito si vede il suo tracciato reale disegnato, con bandiera di partenza e una monoposto che gira; miniature anche all'acquisto, all'asta e su ogni casella del tabellone, colorate come il proprietario (grigie se libere, tratteggiate se ipotecate).
- **Difficoltà CPU**: Facile, Normale o Squalo.
- **Strozzino del paddock**: prestiti fino a €300M da restituire +30% entro 3 giri, altrimenti riscuote con la mora.
- 23 carte Radio Box, suono del motore che sale di giri a ogni passo, schermo sempre acceso durante la partita.
- A fine partita: grafico del patrimonio giro per giro (con dettaglio al tocco) e premi.
- Da tastiera: Spazio/Invio per lanciare o finire il turno, C per comprare, A per l'asta.
- Ritmo normale o veloce, scelto nella griglia di partenza.
- **Musica del menu**: loop elettronico da corsa generato dal browser (Web Audio, nessun file audio), che sfuma quando inizia la partita; si spegne con il pulsante 🎵 Musica.
- Effetti sonori sintetizzati, disattivabili con l'icona dell'altoparlante.
- Vince l'ultimo in gara, oppure il patrimonio più alto dopo 15 o 25 giri.
- La partita si salva automaticamente nel browser.

Il regolamento completo è nel gioco, pulsante **Regole**.

## Avvio

È un unico file statico: apri `index.html` nel browser, oppure pubblicalo con GitHub Pages
(Settings → Pages → Deploy from branch → `main` / root).

Sul telefono, aggiungendo il sito alla schermata Home (Android: menu → *Installa app*;
iPhone: Condividi → *Aggiungi alla schermata Home*) il gioco si apre a schermo intero
e bloccato in orizzontale grazie a `manifest.webmanifest`. In verticale il gioco chiede di ruotare il telefono.

## Sviluppo

- App Android: `npm ci`, `python3 tools/build.py --native`, `npx cap sync android`, poi `android/` si apre con Android Studio (oppure lascia fare a GitHub Actions).

- Il codice è diviso per argomento:
  - `src/head.html`, `src/style.css`, `src/body.html`: intestazione, stili e struttura della pagina;
  - `src/js/NN-nome.js`: gli script, caricati in ordine numerico (lingua, dati, tracciati, regole, stato, suoni,
    preferenze, musica, economia, schede, movimento, aste, turni, CPU, trattative, dadi, disegno, setup, menu,
    online, Play Games, tutorial, eventi, tasto indietro, avvio).
- `python3 tools/build.py` li unisce in un unico file `dist/game.html` e genera `index.html` (web app, con `tools/head.html`);
  `--native` crea anche `www/` per l'app Android.
- Test automatici (browser vero con Playwright): `npm ci`, `npx playwright install chromium`, poi `npm test`.
  Coprono partite complete tra CPU con controlli di coerenza (soldi, proprietà, tribune, ipoteche), regole della casa,
  campionato, inglese, sfida del giorno riproducibile, partita online tra due schede con subentro della CPU e Play Games simulato.
  `GAMES=10 npm test` gioca più partite. Girano anche su GitHub Actions a ogni push (`.github/workflows/test.yml`).
- Dopo ogni modifica: build, test, poi aumenta la versione di `CACHE` in `sw.js` così i telefoni scaricano l'aggiornamento.
- `tools/mktracks.py` rigenera i tracciati dal dataset open source.
- Online: configurazione in `FIREBASE_CONFIG` in `src/js/21-online.js`, regole in `database.rules.json`. Per provare senza Firebase, in console del browser: `localStorage.setItem('paddock-tycoon-localnet','1')` e apri due schede dello stesso sito.

## Pubblicazione

- Web app installabile (manifest, icone, funzionamento offline): https://j0jofra.github.io/paddock-tycoon/
- Privacy policy: [privacy.html](privacy.html)
- Guida per Google Play: [docs/PUBBLICAZIONE-ANDROID.md](docs/PUBBLICAZIONE-ANDROID.md)
- App Android nativa (Capacitor) e Google Play Games: [docs/PLAY-GAMES.md](docs/PLAY-GAMES.md) — compilata da GitHub Actions (`.github/workflows/android.yml`)
- Testi e grafiche per lo store: [store/](store/)

## Crediti

Il logo usa il carattere Alfa Slab One (SIL Open Font License, © The Alfa Slab One Project Authors).
I tracciati sono generati dai dati open source di [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits)
(licenza MIT, © 2019-2025 Tomislav Bacinger). Paddock Tycoon è un gioco di fantasia: i nomi di circuiti, squadre ed eventi sono inventati e non hanno legami con campionati, squadre o circuiti reali.
