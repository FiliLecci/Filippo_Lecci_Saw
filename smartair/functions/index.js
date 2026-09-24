import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import crypto from "crypto";

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

// Elimina una stazione e tutte le sue misurazioni
export const recursiveDeleteCollection = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Operazione non autorizzata.");
  }

  const path = request.data.path;
  if (!path) {
    throw new HttpsError("invalid-argument", "Il percorso 'path' è obbligatorio.");
  }

  try {
    const db = admin.firestore();
    const segments = path.trim().replace(/^\/+|\/+$/g, "").split("/");
    const isDocument = segments.length % 2 === 0;

    const ref = isDocument ? db.doc(path) : db.collection(path);
    await db.recursiveDelete(ref);
    
    return { 
      success: true, 
      message: `Eliminazione ricorsiva completata per ${isDocument ? 'documento' : 'collezione'}: '${path}'` 
    };
  } catch (error) {
    console.error("Errore cancellazione ricorsiva:", error);
    throw new HttpsError("internal", "Impossibile completare la cancellazione automatica.");
  }
});

// Elimina tutti i riferimenti ad una stazione
export const deleteAllStationRefs = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Operazione non autorizzata.");
  }

  const stationId = request.data.stationId;
  if (!stationId) {
    throw new HttpsError("invalid-argument", "L'id della stazione è obbligatorio");
  }

  try {
    const db = admin.firestore();
    const usersSnap = await db.collection('users').get();
    
    // Suddivisione in lotti da max 500 operazioni per limite Firestore
    const batches = [];
    let currentBatch = db.batch();
    let count = 0;

    usersSnap.forEach((userDoc) => {
      const userStationRef = db.doc(`users/${userDoc.id}/stations/${stationId}`);
      currentBatch.delete(userStationRef);
      count++;

      if (count === 500) {
        batches.push(currentBatch.commit());
        currentBatch = db.batch();
        count = 0;
      }
    });

    if (count > 0) {
      batches.push(currentBatch.commit());
    }

    await Promise.all(batches);
    return { success: true, message: 'Stazione eliminata' };
  } catch (error) {
    console.error('Errore deleteStation:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Crea una nuova stazione
export const createNewStation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "L'utente deve essere autenticato.");
  }

  const { uid, name } = request.data;
  const db = admin.firestore();

  try {
    const stationRef = await db.collection('stations').add({
      name,
      owner: uid,
      visibility: 'private',
      device_token: crypto.randomUUID(),
      createdAt: new Date(),
      role: "editor"
    });
    
    await db.collection(`stations/${stationRef.id}/readings`).add({
      temp: 0,
      humidity: 0,
      air_ppm: 0,
      timestamp: new Date()
    });
    
    await db.doc(`users/${uid}/stations/${stationRef.id}`).set({
      role: 'owner',
      nickname: name
    });

    return { stationId: stationRef.id };
  } catch (error) {
    console.error("Errore createNewStation:", error.message);
    throw new HttpsError("internal", "Errore durante la scrittura su Firestore");
  }
});

// Aggiunge una stazione esistente ad un utente
export const addUserStation = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "L'utente deve essere autenticato.");
  }

  const { uid, stationId } = request.data;
  const db = admin.firestore();
  
  try {
    const stationRef = db.collection('stations').doc(stationId);
    const stationSnap = await stationRef.get();
    
    if (!stationSnap.exists) {
      throw new HttpsError("not-found", "Stazione non trovata");
    }

    const userStationRef = db.collection('users').doc(uid).collection('stations').doc(stationId);
    const userStationSnap = await userStationRef.get();
    
    if (userStationSnap.exists) {
      throw new HttpsError("already-exists", "La stazione è già assegnata all'utente");
    }

    const stationData = stationSnap.data();
    const role = stationData.owner === uid ? "editor" : "visualizzatore";

    await userStationRef.set({
      nickname: stationData.name,
      role: role
    });

    return { success: true, stationId };
  } catch (error) {
    console.error('Errore addUserStation:', error.message);
    throw new HttpsError("internal", error.message);
  }
});

// 5. Ritorna il ruolo dell'utente per la stazione
export const getUserStationRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "L'utente deve essere autenticato.");
  }

  const { uid, stationId } = request.data;
  const db = admin.firestore();

  const userStationRef = db.doc(`users/${uid}/stations/${stationId}`);
  const userStationSnap = await userStationRef.get();

  if (!userStationSnap.exists) {
    throw new HttpsError("not-found", "La stazione non è assegnata all'utente");
  }

  return { role: userStationSnap.data().role };
});

// 6. Aggiunge una lettura da dispositivo tramite HTTP
export const addReading = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Device-Token');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const deviceToken = req.get('X-Device-Token');
    const { station_id, temp, humidity, air_ppm, air_raw, timestamp } = req.body;
    const db = admin.firestore();

    if (!deviceToken || !station_id || temp === undefined || humidity === undefined || air_ppm === undefined) {
      return res.status(400).json({ error: 'Campi richiesti mancanti' });
    }

    const stationRef = db.collection('stations').doc(station_id);
    const stationSnap = await stationRef.get();

    if (!stationSnap.exists) {
      return res.status(404).json({ error: 'Stazione non trovata' });
    }

    if (stationSnap.data().device_token !== deviceToken) {
      return res.status(403).json({ error: 'Token non valido' });
    }

    let aqi = 'good';
    if (air_ppm >= 600 && air_ppm < 800) aqi = 'good';
    else if (air_ppm >= 800 && air_ppm < 1000) aqi = 'moderate';
    else if (air_ppm >= 1000 && air_ppm < 1500) aqi = 'poor';
    else if (air_ppm >= 1500) aqi = 'hazardous';

    await stationRef.collection('readings').add({
      temp: parseInt(temp),
      humidity: parseInt(humidity),
      air_ppm: parseFloat(air_ppm),
      air_raw: parseInt(air_raw),
      aqi: aqi,
      timestamp: admin.firestore.Timestamp.fromDate(new Date(parseInt(timestamp) * 1000)),
      receivedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ ok: true, message: 'Lettura salvata con successo', aqi });
  } catch (error) {
    console.error('Errore addReading:', error);
    res.status(500).json({ error: error.message });
  }
});