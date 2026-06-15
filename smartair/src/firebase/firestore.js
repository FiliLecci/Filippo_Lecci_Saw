import { db, auth } from './config';
import {
  collection, doc, addDoc, getDoc, getDocs,
  onSnapshot, query, orderBy, limit, setDoc
} from 'firebase/firestore';

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

// Crea una nuova stazione e la associa all'utente
export async function createStation(uid, name) {
  try {
    console.log('1. Creo stazione per uid:', uid);
    const stationRef = await addDoc(collection(db, 'stations'), {
      name,
      owner: uid,
      device_token: crypto.randomUUID(),
      createdAt: new Date()
    });
    console.log('2. Stazione creata con id:', stationRef.id);

    await setDoc(doc(db, 'users', uid, 'stations', stationRef.id), {
      role: 'owner',
      nickname: name
    });
    console.log('3. Riferimento utente salvato');

    return stationRef.id;
  } catch (e) {
    console.error('Errore createStation:', e.code, e.message);
    throw e;
  }
}

// Ascolta le ultime N letture di una stazione in realtime
export function listenToReadings(stationId, callback, n = 20) {
  console.log('listenToReadings per stationId:', stationId);
  const ref = query(
    collection(db, 'stations', stationId, 'readings'),
    orderBy('timestamp', 'desc'),
    limit(n)
  );
  return onSnapshot(ref, snap => {
    const readings = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .reverse();
    callback(readings);
  });
}