# SmartAir — Webapp per monitoraggio dispositivi IoT

SmartAir è una webapp single-page pensata per monitorare dispositivi IoT che fungono da rilevatori di parametri ambientali. Fornisce una dashboard in tempo reale, una lista dispositivi, gestione account e pannelli per visualizzare lo stato dei dispositivi.

Ogni utente può creare nuove stazioni e il server genererà un nuovo token che verrà usato dai dispositivi per pubblicare dati su firestore, l'id di ogni stazione potrà essere poi condiviso con altri utenti che a loro volta potranno vedere i dati di essa.

## Scopo

L'obiettivo è offrire un'interfaccia semplice per:
- visualizzare lo stato e i dati dei dispositivi;
- gestire i dispositivi registrati;
- condividere stazioni tra utenti;
- autenticare utenti e proteggere l'accesso ai dati.

## Caratteristiche principali

- Login con gestione sessione;
- Dashboard riassuntiva con metriche principali;
- Pagina dispositivi con aggiunta/visualizzazione/modifica;
- Modal per conferme e visualizzazione dettagliata dei dispositivi;
- Integrazione con Firebase per autenticazione e Firestore (configurazione in `src/firebase`).

## Utilizzo webapp

- La webapp è ospitata su firebase all'indirizzo https://smartair-8fabf.web.app/
- Accedere tramite la pagina `Login` con le credenziali del proprio account, sso con Google oppure usare le seguenti credenziali di test che non ricevono dati dinamici e contengono delle stazione con dati fittizzi:
  - user: test@user.com
  - psw: testUser
- Aprire `Dashboard` per una panoramica rapida dei dispositivi;
- Andare su `Devices` per vedere la lista, aggiungere o selezionare un dispositivo e visualizzarne i dettagli;
- Usare `Account` per modificare le informazioni dell'utente o effettuare il logout.

