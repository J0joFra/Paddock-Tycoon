# Paddock Tycoon

Gioco da tavolo di compravendita a tema Formula 1, pensato per il telefono in orizzontale.
Compra circuiti, costruisci tribune, ospita il Gran Premio e manda in bancarotta gli avversari.

## Come si gioca

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
- Monoposto animate sul tabellone, banner di turno, importi volanti, coriandoli, vibrazione e premi a fine partita.
- La pista occupa tutto lo schermo e la plancia di gioco sta dentro il circuito.
- Tendina **Affari** sul bordo destro; toccando un GP di un avversario puoi trattarlo subito, toccando un tuo GP lo gestisci.
- **Campionato**: 3 o 5 gare da 8, 12 o 15 giri, con punti F1 (25-18-15-12-10-8) e ultima gara a punti doppi. Tra una gara e l'altra: ordine d'arrivo e classifica piloti.
- **Tutorial guidato** alla prima partita, che evidenzia passo passo le parti dello schermo; si può rivedere dal Regolamento.
- **Scuderie**: ogni pilota ha un vantaggio (💰 Sponsor d'oro, 🔧 Ingegneri, ⚖️ Avvocati, 📣 Marketing, 🪽 Aerodinamica). Si sceglie toccando l'icona nella griglia di partenza.
- **Difficoltà CPU**: Facile, Normale o Squalo.
- **Strozzino del paddock**: prestiti fino a €300M da restituire +30% entro 3 giri, altrimenti riscuote con la mora.
- 23 carte Radio Box, suono del motore che sale di giri a ogni passo, schermo sempre acceso durante la partita.
- A fine partita: grafico del patrimonio giro per giro (con dettaglio al tocco) e premi.
- Da tastiera: Spazio/Invio per lanciare o finire il turno, C per comprare, A per l'asta.
- Ritmo normale o veloce, scelto nella griglia di partenza.
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
