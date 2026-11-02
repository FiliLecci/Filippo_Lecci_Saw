import { db, functions } from './config';
import {
  collection, doc, getDoc,
  onSnapshot, query, orderBy, limit, setDoc,
  deleteDoc, serverTimestamp,
  addDoc, where} from 'firebase/firestore';
import { httpsCallable } from "firebase/functions";
import { format } from 'date-fns';

/*
STRUTTURA FILE FIRESTORE
db
 |--users
 |    |--'userId'
 |          |--notifications
 |          |     |--'notId1'
 |          |     |--'notId2'
 |          |     ...
 |          |--stations
 |                |--'stationId1'
 |                |--'stationId2'
 |                ...
 |
 |--stations
 |  |--'stationId1'
 |  |--'stationId2'
 |  ...
*/

// Funzione di inizializzazione del database quando si registra un utente
export async function initializeUserDatabase(uid, email) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    // Creazione del documento utente
    if (!userSnap.exists()) {
      console.log('Inizializzo il database per nuovo utente:', uid);
      
      await setDoc(userRef, {
        email: email ?? null,
        createdAt: serverTimestamp(),
        theme: 'light'
      });

      console.log('Database utente creato con successo');
      return true;
    }

    return false;
  } catch (e) {
    console.error('Errore initializeUserDatabase:', e.code, e.message);
    throw e;
  }
}

// Recupera le stazioni a cui ha accesso l'utente e ritorna un array di oggetti
export function getUserStations(uid, callback) {
  const ref = collection(db, 'users', uid, 'stations');
  // esegue ogni volte che cambia la collezione
  return onSnapshot(ref, async snap => {
    const stations = await Promise.all(
      snap.docs.map(async d => {
        const stationRef = doc(db, 'stations', d.id);
        const stationSnap = await getDoc(stationRef);
        return {
          id: d.id,
          ...d.data(),           // role, nickname
          ...stationSnap.data()  // name, owner, device_token
        };
      })
    );
    callback(stations);
  });
}

// Recupera info dell'utente identificado da un uid
export async function getUserInfo(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

// Modifica il nickname visualizzato per una stazione per l'utente identificato da uid
export async function modifyStationNickname(uid, stationId, newNickname) {
  try {
    await setDoc(doc(db, 'users', uid, 'stations', stationId), {
      nickname: newNickname
    }, { merge: true });
  } catch (e) {
    console.error('Errore modifyStationNickname:', e.code, e.message);
    throw e;
  }
}

// Crea una nuova stazione e la associa all'utente
export async function createStation(uid, name) {
  try {

    const createNewStation = httpsCallable(functions, "createNewStation");
    const stationRef = await createNewStation({uid: uid, name: name});

    return stationRef.id;

  } catch (e) {
    console.error('Errore createStation:', e.code, e.message);
    throw e;
  }
}

// Aggiungi la stazione all'utente
export async function addStationToUser(uid, stationId) {
  try {
    const addUserStation = httpsCallable(functions, "addUserStation");
    const stationRef = await addUserStation({uid: uid, stationId: stationId});

    return stationRef.id;
  } catch (e) {
    console.error('Errore addStationToUser: ', e.code, e.message);
    throw e;
  }
}

// Elimina una stazione per un utente se questo non è il proprietario
// Si può fare qua perché si elimina un solo file
export async function deleteStationForUser(stationId) {
  try {
    // Eliminazione del documento
    await deleteDoc(doc(db, 'users', uid, 'stations', stationId));
    console.log('Stazione rimossa per utente:', uid);

  } catch (e) {
    console.error('Errore deleteStationForUser:', e.code, e.message);
    throw e;
  }
}

// Elimina una stazione in modo permanente se l'utente ne è proprietario
// TODO Questa roba va fatta in una cloud function perché deve toccare dati che non appartengono all'utente e deve fare eliminazioni ricorsive anche delle letture
export async function deleteStationPermanent(stationId) {
  console.log("Inizio eliminazione della stazione: " + stationId);

  try {
    const deleteStationRefs = httpsCallable(functions, "deleteAllStationRefs");
    const res2 = await deleteStationRefs({stationId: stationId});

    console.log('Riferimenti della stazione rimossi per tutti gli utenti: ', res2);
    
    const recursiveDeleteCollection = httpsCallable(functions, "recursiveDeleteCollection");
    const res1 = await recursiveDeleteCollection({ path: `stations/${stationId}` });

    console.log('Stazione eliminata permanentemente: ', res1);    
  }
  catch (e) {
    console.error('Errore deleteStationPermanent:', e.code, e.message);
    throw e;
  }
}

// Ascolta le ultime N letture di una stazione in realtime
export function listenToReadings(stationId, callback, n = 20) {
  const ref = query(
    collection(db, 'stations', stationId, 'readings'),
    orderBy('timestamp', 'desc'),
    limit(n)
  );
  return onSnapshot(ref, snap => {
    const readings = snap.docs
      .map(d => {
        const data = d.data();
        // converte il timestamp in una stringa per i grafici (eventualmente da fare in una funziona a parte se servirà averlo in altri formati)
        return {
          id: d.id,
          ...data,
          timestamp: data.timestamp?.toDate().toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
          })
        };
      })
      .reverse();
    callback(readings);
  }, error => {
    console.error('Errore snapshot:', error.code, error.message);
  });
}

// Genera letture casuali per la stazione specificata
export async function generateTestReadings(stationId){
  try {

    const generateTestReadingsFunction = httpsCallable(functions, "generateTestReadings");
    await generateTestReadingsFunction({stationId: stationId});

  } catch (e) {
    console.error("Errore generazione dati di test: ", e.code, e.message);
    throw e;
  }
}

/* Genera una lettura oltre la soglia per la stazione specificata e per il tipo indicato
 * Tipi accettati:
 * "TEMP_LIMIT"     temperatura oltre la soglia
 * "HUM_LIMIT"      umidità oltre la soglia
 * "PPM_LIMIT"      ppm oltre la soglia
 * "ALL"            tutti i valori oltre la soglia
 */
export async function generateLimitReading(station_Id, limitType){
  try {
    const generateLimitReadingFunction= httpsCallable(functions, "generateLimitReading");
    await generateLimitReadingFunction({stationId: station_Id, type: limitType});
  } catch (e) {
    console.error("Errore generazione lettura oltre il limite: ", e.code, e.message);
    throw e;
  }
}

/* Aggiunge una notifica per l'utente
 * data deve essere un oggetto composto come:
 * {
 *  title: "Titolo della notifica"
 *  body: "Corpo della notifica"
 *  severity: severità della notifica
 * }
 */
export async function addNotificationToUser(uId, notification){
  const notificationCollection = collection(db, 'users', uId, 'notifications');
  let newDoc = null;

  try {
    await addDoc(notificationCollection, {
      title: notification.title,
      body: notification.body,
      severity: notification.severity,
      time: Date.now(), // se serve formattarlo si fa da UI sennò fa casino la orderBy
      read: false,
    }).then((document) => {
      newDoc = document;
    });
  } catch (e) {
    console.error("Errore inserimento notifica: ", e);
  }

  return newDoc;
}

// Passa alla callback l'array di notifiche non lette dall'utente definito da uid
export function getUserNotifications(uid, callback){
  const q = query(
    collection(db, "users", uid, "notifications"),
    where("read", "==", false),
    orderBy("time", "desc")
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}