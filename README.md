# gattografy

Piattaforma civica per monitorare le colonie feline della città: colonie, gatti, foto, avvistamenti, cucciolate, commenti, problemi e richieste di soccorso.

## Stack consigliato

- Frontend: React + Vite
- UI: CSS custom e icone `lucide-react`
- Mappa gratuita: OpenStreetMap + Leaflet
- Hosting gratuito: Netlify, Vercel, Cloudflare Pages o GitHub Pages
- Backend gratuito futuro: Supabase free tier per autenticazione, database Postgres, storage immagini e regole di sicurezza

## Avvio locale

```bash
npm install
npm run dev
```

Web app mobile dedicata:

```bash
npm run dev:mobile
```

## Build

```bash
npm run build
```

La cartella da pubblicare è `dist`.

## Pubblicazione gratuita

Procedura operativa corrente: GitHub Pages e' il target principale.

Netlify non va usato come target principale perche' puo' sospendere il sito quando raggiunge i limiti del piano free. GitHub Pages serve bene questa app statica.

```bash
npm run build:github
```

`build:github` ora compila sia app desktop sia app mobile e pubblica la mobile in `dist/mobile`.

La build va pubblicata sul branch `gh-pages` del repository `dnappino/gattografy`.

URL previsto:

```text
https://dnappino.github.io/gattografy/
```

Prima attivazione manuale su GitHub:

1. Vai su `Settings` > `Pages` del repository.
2. In `Build and deployment`, scegli `Deploy from a branch`.
3. Seleziona branch `gh-pages` e cartella `/ (root)`.
4. Salva.

Per Supabase Auth aggiungere anche questo URL in `Authentication` > `URL Configuration`:

```text
https://dnappino.github.io/gattografy/
```

e tra i redirect consentiti:

```text
https://dnappino.github.io/gattografy/**
```

### Netlify solo come fallback

Se si decide esplicitamente di riprovare Netlify, non far buildare Netlify a ogni push GitHub. GitHub resta il repository del codice sorgente, ma la pubblicazione si fa caricando su Netlify la cartella `dist` gia' compilata in locale.

```bash
netlify deploy --prod --dir=dist --no-build
```

Usare `--no-build` e' importante: indica a Netlify di non rieseguire la build e riduce il consumo dei crediti/build minutes.

Se il sito resta collegato a GitHub con auto-build attiva, usare `[skip netlify]` nel messaggio di commit quando non si vuole pubblicare.

La procedura con build automatica sotto e' da evitare salvo decisione esplicita:

1. Carica il progetto su GitHub con nome `gattografy`.
2. Collega il repository a Netlify, Vercel o Cloudflare Pages.
3. Usa questi parametri:
   - build command: `npm run build`
   - publish directory: `dist`
4. Il sito avrà un sottodominio gratuito, per esempio:
   - `gattografy.netlify.app`
   - `gattografy.vercel.app`
   - `gattografy.pages.dev`

## Mappe

La versione attuale usa OpenStreetMap con Leaflet, quindi non richiede una chiave Google Maps e resta adatta a hosting gratuito.

Se in futuro scegliamo Google Maps, serviranno una Google Maps API key e billing abilitato sul progetto Google Cloud. La chiave dovrà stare in una variabile ambiente, non nel codice sorgente.

## Database gratuito

La scelta consigliata è Supabase:

- Postgres gestito
- autenticazione email/password
- storage immagini per avatar, gatti e colonie
- Row Level Security per permessi reali
- integrazione semplice con Netlify, Vercel, Cloudflare Pages o GitHub Pages

File già preparati:

- `.env.example` con `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- `src/lib/supabase.js` con client Supabase opzionale
- `supabase/schema.sql` con tabelle, ruoli, relazioni e policy RLS

Finché le variabili ambiente non sono impostate, l'app mostra `Demo DB` e usa dati seed in memoria. Non usa `localStorage` come persistenza definitiva.

## Autenticazione

Il modal `Accedi / Registrati` è già collegato al client Supabase:

- senza variabili `.env` funziona in modalità demo e non salva password;
- con Supabase configurato usa `supabase.auth.signUp` e `supabase.auth.signInWithPassword`;
- lo schema SQL include un trigger `handle_new_user()` che crea automaticamente la riga `profiles` quando Supabase Auth crea un nuovo utente.

Per provarlo davvero:

1. Crea un progetto Supabase.
2. Esegui `supabase/schema.sql` nel SQL editor.
3. Copia `.env.example` in `.env`.
4. Inserisci `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Riavvia `npm run dev`.

## Colonie da DB

La sezione `Colonie` ora è pronta per Supabase:

- legge `colonies` da Postgres quando Supabase è configurato;
- mostra un banner di stato dati;
- permette di creare una nuova colonia;
- se l'utente è autenticato e Supabase è configurato, la colonia viene inserita in Postgres;
- senza Supabase resta una creazione demo in memoria, esplicitamente segnalata nella UI.

Per ora latitudine e longitudine sono campi manuali. Il passo successivo è aggiungere geocoding gratuito con Nominatim/OpenStreetMap per trasformare automaticamente un indirizzo in coordinate.

## Prossimi passaggi per renderlo reale

- Autenticazione con email, password, username e avatar.
- Ruoli globali: utente, volontario verificato, moderatore, amministratore sito.
- L'amministratore sito ha permessi assoluti: può modificare tutto, deporre o sostituire l'amministratore di una colonia e intervenire su utenti, messaggi e segnalazioni.
- Ogni colonia ha un amministratore colonia, di norma l'utente che la crea.
- L'amministratore colonia può approvare utenti collaboratori che possono editare informazioni, foto, gatti, avvistamenti e commenti della colonia.
- Ogni colonia ha il flag `Dichiarata all'ASL`.
- Meccanismo di richieste di amicizia, richieste di partecipazione a una colonia e messaggistica tra utenti/collaboratori.
- Tabelle `profiles`, `friend_requests`, `messages`, `colonies`, `colony_members`, `cats`, `cat_photos`, `sightings`, `birth_reports`, `comments`, `rescue_requests`.
- Storage per foto avatar, colonie e gatti.
- Moderazione di commenti, segnalazioni e richieste di soccorso.
- Privacy: evitare indirizzi sensibili troppo precisi per colonie vulnerabili.

## Dati demo aggiunti

- Colonia: `Angiporto dei Caserti`
- Indirizzo: `Via Angiporto dei Caserti - Napoli`
- Amministratrice colonia: `ilaria_nappino`
- Email: `ilynap@gmail.com`
- Avatar: gatto bianco e nero locale in `src/assets/cat-3.jpg`

La password richiesta per l'utente demo va impostata nel backend di autenticazione quando lo collegheremo. Non è stata salvata nel codice frontend perché sarebbe visibile a chiunque apra il sito.
