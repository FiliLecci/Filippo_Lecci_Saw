import { db, auth, functions } from './config';
import {
  collection, doc, addDoc, getDoc, getDocs,
  onSnapshot, query, orderBy, limit, setDoc,
  deleteDoc,  CollectionReference
} from 'firebase/firestore';
import { httpsCallable } from "firebase/functions";

// In questo file definisco solo le funzione che hanno a che fare con firestone e che ci interagiscono direttamente.

// Recupera le stazioni a cui ha accesso l'utente
export function getUserStations(uid, callback) {
  const ref = collection(db, 'users', uid, 'stations');
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
export async function addStationToUser(uid, stationToken) {
  try {
    const addUserStation = httpsCallable(functions, "addUserStation");
    const stationRef = await addUserStation({uid: uid, stationToken: stationToken});
  } catch (e) {
    console.error('Errore addStationToUser: ', e.code, e.message);
    throw e;
  }
}

// Elimina una stazione per un utente se questo non è il proprietario
export async function deleteStationForUser(uid, stationId) {
  try {
    const stationRef = doc(db, 'stations', stationId);
    const stationSnap = await getDoc(stationRef);

    if(!stationSnap.exists()) {
      throw new Error('Stazione non trovata');
    }
    
    const stationData = stationSnap.data();

    // Eliminazione del documento
    await deleteDoc(doc(db, 'users', uid, 'stations', stationId));
    console.log('Stazione rimossa per utente:', uid);
  } catch (e) {
    console.error('Errore deleteStationForUser:', e.code, e.message);
    throw e;
  }
}

// Elimina una stazione in modo permanente se l'utente ne è proprietario
export async function deleteStationPermanent(uid, stationId) {
  try {
    const recursiveDeleteCollection = httpsCallable(functions, "recursiveDeleteCollection");
    const res1 = await recursiveDeleteCollection({ path: `stations/${stationId}` });

    console.log('Stazione eliminata permanentemente: ', res1);
    
    const deleteStationRefs = httpsCallable(functions, "deleteAllStationRefs");
    const res2 = await deleteStationRefs({stationId: stationId});

    console.log('Riferimenti della stazione rimossi per tutti gli utenti: ', res2);
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