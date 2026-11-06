# App Android nativa e Google Play Games

L'app Android ora è un'app **nativa con Capacitor** (cartella `android/`): contiene il gioco, funziona offline e usa
**Google Play Games Services v2** per accesso, obiettivi e classifiche. Sostituisce il pacchetto PWABuilder (TWA).
Il pacchetto viene compilato da **GitHub Actions** (scheda *Actions → App Android*), non serve Android Studio.

> Ogni aggiornamento del gioco richiede una nuova versione su Play Console (la web app su GitHub Pages invece si aggiorna da sola).

## 1. Chiave di firma (una volta sola)
Serve una **chiave di caricamento**. Se hai già generato il pacchetto con PWABuilder, **riusa quella chiave**
(`signing.keystore` + password e alias in `signing-key-info.txt`): l'ID pacchetto è lo stesso, `io.github.j0jofra.paddocktycoon`.

Se non hai ancora una chiave, creala con Java installato (o da Android Studio → Build → Generate Signed Bundle):
```bash
keytool -genkeypair -v -keystore upload.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
```
Conservala in un posto sicuro e **non metterla nel repository** (è pubblico).

Poi in GitHub → repository → **Settings → Secrets and variables → Actions → New repository secret** aggiungi:

| Secret | Valore |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | il file della chiave in base64 (`base64 -w0 upload.keystore` su Linux, `base64 -i upload.keystore` su Mac, `certutil -encode` su Windows) |
| `ANDROID_KEYSTORE_PASSWORD` | password del keystore |
| `ANDROID_KEY_ALIAS` | alias della chiave |
| `ANDROID_KEY_PASSWORD` | password della chiave |

## 2. Compilare l'app
- **Actions → App Android → Run workflow** (puoi indicare la versione, es. `1.0.0`), oppure crea un tag `v1.0.0`.
- A fine esecuzione scarichi l'artifact `paddock-tycoon-<versione>`: contiene `app-release.aab` (da caricare su Play Console)
  e `app-release.apk` (da installare sul telefono per provare).
- Senza i secrets la build produce un APK di debug per le prove e un AAB non firmato (Play Console non lo accetta).
- Il codice versione cresce da solo a ogni esecuzione (100 + numero esecuzione).

## 3. Configurare Play Games Services
1. Play Console → la tua app → **Crescita → Play Games Services → Configurazione e gestione → Configurazione**.
2. Scegli **Sì, il mio gioco usa già le API di Google** → no: **crea un nuovo progetto Play Games Services**.
3. **Credenziali → Aggiungi credenziale → Android**: crea il client OAuth con il pacchetto `io.github.j0jofra.paddocktycoon`
   e l'impronta **SHA-1** della chiave di firma dell'app (Play Console → Configurazione → Integrità dell'app → Firma dell'app).
   Aggiungi anche la SHA-1 della chiave di caricamento, così funziona pure l'APK di prova.
4. Copia l'**ID progetto** numerico di Play Games Services (in alto nella pagina di configurazione) e mandalo a Claude:
   va in `android/app/src/main/res/values/strings.xml` → `game_services_project_id`.
5. **Tester**: aggiungi il tuo account Google tra i tester di Play Games Services finché la configurazione non è pubblicata.

## 4. Obiettivi e classifiche da creare
In **Play Games Services → Obiettivi** e **→ Classifiche** crea questi elementi, poi copia gli ID (es. `CgkI...`) e mandali a Claude:
vanno in `PGS_IDS` in `src/js/22-playgames.js`.

### Obiettivi
| Chiave | Nome (IT) | Descrizione (IT) | Name (EN) | Description (EN) | Punti |
|---|---|---|---|---|---|
| `first_win` | Prima vittoria | Vinci una partita | First win | Win a game | 10 |
| `champion` | Campione del mondo | Vinci un campionato | World champion | Win a championship | 50 |
| `full_group` | Gruppo completo | Possiedi tutti i circuiti di un colore | Full set | Own every circuit of one colour | 10 |
| `grand_prix` | Padrone del GP | Ospita un Gran Premio su un tuo circuito | Grand Prix host | Host a Grand Prix on one of your circuits | 20 |
| `bribe` | Mani in pasta | Corrompi i commissari e ripartire | Greased palms | Bribe the stewards and get back on track | 15 |
| `loan_paid` | Debito saldato | Restituisci un prestito allo strozzino | Debt cleared | Pay back the loan shark | 10 |
| `jackpot` | Montepremi | Incassa almeno €200M dalla Safety Car | Jackpot | Collect at least €200M from the Safety Car | 15 |
| `dealmaker` | Faccendiere | Chiudi 5 affari | Wheeler-dealer | Close 5 deals | 20 |
| `online_win` | Re della rete | Vinci una partita online | Online king | Win an online game | 25 |
| `tycoon` | Tycoon | Raggiungi €10.000M di patrimonio | Tycoon | Reach €10,000M net worth | 25 |

### Classifiche
| Chiave | Nome (IT) | Name (EN) | Formato | Ordine |
|---|---|---|---|---|
| `networth` | Patrimonio record | Record net worth | Numerico, nessun decimale, unità "M€" | Più alto è meglio |
| `wins` | Vittorie | Wins | Numerico | Più alto è meglio |

Per le icone di obiettivi e classifiche puoi usare `store/icon-512.png`.

## 5. Pubblicare
- Carica l'AAB nel **test chiuso** (vedi `docs/PUBBLICAZIONE-ANDROID.md`, sezioni 3 e 5).
- In Play Games Services → **Pubblica** la configurazione (obiettivi e classifiche diventano visibili a tutti).
- **Sicurezza dei dati**: Play Games gestisce il profilo giocatore di Google; nel modulo indica che l'app usa Google Play Games Services.

## Note
- Gli obiettivi si sbloccano per i giocatori umani su quel telefono. Nelle partite online, chi non è l'host riceve a fine partita
  vittoria, classifiche e Tycoon; gli altri obiettivi li riceve l'host o chi gioca offline.
- Per provare il ponte senza telefono: nel browser `window.Capacitor` non esiste e i pulsanti Play Games non compaiono.
