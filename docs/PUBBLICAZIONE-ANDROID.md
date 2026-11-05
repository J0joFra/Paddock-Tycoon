# Pubblicare Paddock Tycoon su Google Play

Il gioco è una web app installabile ospitata su GitHub Pages. Per Google Play la si impacchetta come
**Trusted Web Activity (TWA)** con [PWABuilder](https://www.pwabuilder.com): l'app Android apre il sito a schermo intero.
Vantaggio: ogni aggiornamento pubblicato su GitHub arriva subito nell'app, senza ricaricare il pacchetto sullo store
(serve un nuovo pacchetto solo se cambiano nome, icona o impostazioni Android).

## 1. Controlla che il sito sia pronto
1. Apri https://j0jofra.github.io/paddock-tycoon/ da Chrome sul telefono.
2. Dal menu di Chrome deve comparire **Installa app**: vuol dire che manifest e service worker funzionano.

## 2. Genera il pacchetto Android con PWABuilder
1. Vai su https://www.pwabuilder.com, incolla `https://j0jofra.github.io/paddock-tycoon/` e premi **Start**.
2. Premi **Package for stores** → **Android** → **Generate package** (opzioni consigliate qui sotto).

| Opzione | Valore |
|---|---|
| Package ID | `io.github.j0jofra.paddocktycoon` (non si potrà più cambiare) |
| App name | `Paddock Tycoon` |
| Launcher name | `Paddock` |
| App version / version code | `1.0.0` / `1` (a ogni nuovo pacchetto aumenta il version code: 2, 3, …) |
| Display mode | `fullscreen` |
| Orientation | `landscape` |
| Status bar / navigation color | `#E10A1E` / `#F3F5F8` |
| Signing key | **Create new** |

3. Scarichi uno zip con:
   - `*.aab` → il file da caricare su Play Console;
   - `signing.keystore` e `signing-key-info.txt` → la **chiave di caricamento**;
   - `assetlinks.json` → serve al punto 4.

> ⚠️ Salva `signing.keystore` e `signing-key-info.txt` in un posto sicuro (es. un password manager) e **non metterli mai su GitHub**:
> il repo è pubblico. Servono per caricare ogni aggiornamento del pacchetto.

## 3. Crea l'app su Play Console
1. **Crea app** → nome `Paddock Tycoon`, lingua predefinita Italiano, tipo **Gioco**, **Gratuita**.
2. **Configura l'app** (la checklist di Play Console):
   - **Norme sulla privacy**: `https://j0jofra.github.io/paddock-tycoon/privacy.html`
   - **Accesso all'app**: tutte le funzioni sono disponibili senza restrizioni.
   - **Annunci**: l'app **non** contiene annunci.
   - **Classificazione dei contenuti** (questionario IARC): categoria Gioco; niente violenza, contenuti sessuali o linguaggio volgare;
     **nessun gioco d'azzardo con denaro reale** né acquisti. I temi "bustarella" e "strozzino" sono umoristici e senza denaro vero.
   - **Pubblico di destinazione**: 13 anni e oltre (così non rientri nelle regole aggiuntive del programma Famiglie).
   - **Sicurezza dei dati**: l'app **non raccoglie né condivide** dati utente.
   - **App governative / finanziarie / salute**: no.
3. **Scheda dello store**: copia i testi da `store/scheda-play-store.md` e carica icona, grafica e screenshot dalla cartella `store/`.

## 4. Collega il sito all'app (toglie la barra dell'indirizzo)
Senza questo passaggio l'app funziona, ma mostra in alto una barra con l'indirizzo del sito.
1. In Play Console → **Test e rilascio → Configurazione → Integrità dell'app → Firma dell'app** copia
   l'impronta **SHA-256 della chiave di firma dell'app** (quella di Google).
2. Aggiungila nel file `assetlinks.json` di PWABuilder, accanto all'impronta della tua chiave di caricamento, nella lista `sha256_cert_fingerprints`.
3. Il file deve stare alla radice del dominio: `https://j0jofra.github.io/.well-known/assetlinks.json`.
   Su GitHub crea il repository **`j0jofra.github.io`** (pubblico), aggiungi:
   - `.well-known/assetlinks.json` (il file aggiornato);
   - un file vuoto `.nojekyll` (altrimenti GitHub Pages ignora le cartelle che iniziano con il punto).
4. Dopo qualche minuto controlla che `https://j0jofra.github.io/.well-known/assetlinks.json` si apra nel browser.

## 5. Test chiuso (obbligatorio per i nuovi account personali)
Gli account sviluppatore personali creati dopo il 13 novembre 2023 devono fare un **test chiuso con almeno 12 tester
per almeno 14 giorni consecutivi** prima di poter chiedere l'accesso alla produzione.
1. **Test → Test chiuso → Crea traccia**, carica il file `.aab`.
2. Aggiungi i tester con una lista di email o un Gruppo Google; condividi il link di partecipazione.
3. Chiedi ai tester di installare l'app e di **tenerla installata e aprirla** durante i 14 giorni.
4. Finiti i 14 giorni: **Dashboard → Richiedi l'accesso alla produzione**, poi crea la release di produzione.

## 6. Aggiornamenti
- **Gioco** (regole, grafica, testi): basta il push su `main`. GitHub Pages aggiorna il sito e l'app lo carica alla riapertura.
- **Pacchetto** (nome, icona, orientamento): rigenera con PWABuilder usando **la stessa chiave** (`Use existing`) e un version code più alto.
