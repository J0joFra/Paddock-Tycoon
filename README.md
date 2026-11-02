# Paddock Tycoon

Gioco da tavolo di compravendita a tema Formula 1, pensato per il telefono in orizzontale.
Compra circuiti, costruisci tribune, ospita il Gran Premio e manda in bancarotta gli avversari.

## Come si gioca

- Da 2 a 6 giocatori, umani o CPU, sullo stesso telefono.
- Si parte con €1400M; ogni passaggio dal **Semaforo Verde** vale €150M.
- 18 circuiti in 6 gruppi di colore, da Miami (€60M) a Monaco (€380M).
- Con un gruppo completo costruisci fino a **3 tribune** per circuito, poi il **Gran Premio**.
- Caselle speciali: **Radio Box** (carte), **Zona DRS** (+3 caselle), **Safety Car** (sosta libera),
  **Commissari FIA** (Stop & Go in Pit Lane), **Fornitori** Gomme e Carburante.
- Scambi di circuiti e denaro tra giocatori; anche le CPU fanno offerte.
- Vince l'ultimo in gara, oppure il patrimonio più alto dopo 15 o 25 giri.
- La partita si salva automaticamente nel browser.

Il regolamento completo è nel gioco, pulsante **Regole**.

## Avvio

È un unico file statico: apri `index.html` nel browser, oppure pubblicalo con GitHub Pages
(Settings → Pages → Deploy from branch → `main` / root).

Sul telefono, aggiungendo il sito alla schermata Home (Android: menu → *Installa app*;
iPhone: Condividi → *Aggiungi alla schermata Home*) il gioco si apre a schermo intero
e bloccato in orizzontale grazie a `manifest.webmanifest`. In verticale il gioco chiede di ruotare il telefono.
