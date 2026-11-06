# Attivare l'online con Firebase

L'online usa **Firebase Realtime Database** (Google), separato da Supabase.
Il telefono di chi crea la stanza fa da "arbitro": esegue le regole e pubblica lo stato della partita;
gli altri inviano solo le proprie mosse. Le stanze vivono in `pt/rooms/<CODICE>` e vengono cancellate a fine partita.

## 1. Crea il progetto (circa 5 minuti)
1. Vai su https://console.firebase.google.com → **Aggiungi progetto** → nome `paddock-tycoon`.
   Google Analytics non serve: puoi disattivarlo.
2. **Build → Authentication → Inizia → Metodo di accesso → Anonimo → Abilita → Salva.**
   Ogni telefono riceve un identificativo anonimo: niente email né password.
3. **Build → Realtime Database → Crea database** → posizione **Belgio (europe-west1)** → **Avvia in modalità bloccata**.
4. Nella scheda **Regole** del database incolla il contenuto di [`database.rules.json`](../database.rules.json) e premi **Pubblica**.
   Le regole permettono di scrivere lo stato della partita solo all'host e di inviare mosse solo ai giocatori della stanza.
5. **Impostazioni progetto (ingranaggio) → Generali → Le tue app → icona Web `</>`** → nome `Paddock Tycoon`
   (non serve Firebase Hosting) → **Registra app**.
6. Copia l'oggetto `firebaseConfig` che compare (apiKey, authDomain, databaseURL, projectId, appId…).

## 2. Inserisci la configurazione nel gioco
Mandala a Claude, oppure fai da te:
1. In `src/js/21-online.js` sostituisci `const FIREBASE_CONFIG=null;` con l'oggetto copiato, per esempio
   `const FIREBASE_CONFIG={apiKey:"…",authDomain:"…",databaseURL:"https://….europe-west1.firebasedatabase.app",projectId:"…",appId:"…"};`
2. `python3 tools/build.py`, aumenta `CACHE` in `sw.js`, commit e push.

La `apiKey` web di Firebase non è un segreto: identifica il progetto e può stare nel codice pubblico.
La protezione vera sono le regole del database e l'accesso anonimo.

## 3. Consigliato
- **Authentication → Impostazioni → Domini autorizzati**: aggiungi `j0jofra.github.io`.
- **Google Cloud Console → API e servizi → Credenziali** → la chiave "Browser key" → limita i referrer HTTP a
  `https://j0jofra.github.io/*`.
- **Play Console → Sicurezza dei dati**: con l'online il gioco tratta un identificativo anonimo, il nome pilota scelto
  e lo stato della partita, solo per far funzionare la partita e cancellati alla fine (nessuna condivisione con terzi
  a parte Google come fornitore del servizio). Aggiorna il modulo di conseguenza.

## Limiti del piano gratuito (Spark)
- **100 connessioni simultanee** (circa 25-30 partite da 4 giocatori nello stesso momento).
- 1 GB di dati salvati, 10 GB al mese scaricati. Una partita da 4 giocatori consuma indicativamente qualche decina di MB.
- Se il gioco cresce si passa al piano Blaze (a consumo, con un tetto di spesa impostabile).
- Le stanze abbandonate senza chiuderle restano nel database: sono piccole, ma ogni tanto conviene ripulire `pt/rooms`.

## Come funziona per i giocatori
- **Crea stanza per amici**: codice di 5 lettere e link da condividere; l'host può aggiungere CPU.
- **Partite veloci**: si apre l'elenco delle partite pubbliche in attesa (host, piloti presenti su 6) e si entra con un tocco,
  oppure se ne crea una nuova. Massimo 6 piloti; l'host la avvia quando vuole da 3 piloti in su (parte da sola a 6).
  Chi resta da solo per 45 secondi può iniziare con le CPU.
- Se un giocatore si disconnette, la CPU guida al posto suo finché non rientra con il codice.
- Se l'host si disconnette, gli altri vedono un avviso; l'host riprende dal menu con **Riprendi partita online**.
- Le trattative "sotto banco" restano private tra i due giocatori coinvolti.
