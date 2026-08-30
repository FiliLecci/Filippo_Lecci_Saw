/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import { logger }  from "firebase-functions/logger";

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

import { onCall, HttpsError } from "firebase-functions/v2/https";
import admin from 'firebase-admin';

admin.initializeApp();

// Elimina una stazione e tutte le sue misurazioni
export const recursiveDeleteCollection = onCall({}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Operazione non autorizzata.");
  }

  const path = request.data.path;
  if (!path) {
    throw new HttpsError("invalid-argument", "Il percorso 'path' è obbligatorio.");
  }

  try {
    const db = admin.firestore();
    
    // I documenti hanno path con un numero pari di segmenti, mentre le collezioni sono numeri dispari.
    const segments = path.trim().replace(/^\/+|\/+$/g, "").split("/");
    const isDocument = segments.length % 2 === 0;

    let ref;
    if (isDocument) {
      console.log(`[Auto-Detect] Rilevato DOCUMENTO per il percorso: ${path}`);
      ref = db.doc(path);
    } else {
      console.log(`[Auto-Detect] Rilevata COLLEZIONE per il percorso: ${path}`);
      ref = db.collection(path);
    }

    // Esegue la cancellazione ricorsiva sul riferimento rilevato
    await db.recursiveDelete(ref);
    
    return { 
      success: true, 
      message: `Eliminazione ricorsiva completata con successo per ${isDocument ? 'il documento' : 'la collezione'}: '${path}'` 
    };
  } catch (error) {
    console.error("Errore durante la cancellazione ricorsiva:", error);
    throw new HttpsError("internal", "Impossibile completare la cancellazione automatica.");
  }
});

// Elimina tutti i riferimenti ad una stazione
export const deleteAllStationRefs = onCall({}, async (request) => {
  // Verifica autenticazione
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Operazione non autorizzata.");
  }

  const stationId = request.data.stationId;

  console.log(stationId);

  if(!stationId){
    throw new HttpsError("invalid-argument", "L'id della stazione è obbligatorio");
  }

  try {
    console.log("Inizio eliminazione in batch");

    // Usa batch per eliminare atomicamente
    const batch = admin.firestore().batch();

    // Elimina il riferimento da tutti gli utenti
    const usersSnap = await admin.firestore().collection('users').get();
    console.log(usersSnap.size);
    usersSnap.forEach(userDoc => {
      const userStationRef = admin.firestore()
      .doc(`users/${userDoc.id}/stations/${stationId}`);
      console.log("user: ", userDoc.id, " doc: ", userStationRef.id);
      batch.delete(userStationRef);
    });

    // Esegui tutte le operazioni
    await batch.commit();

    return { success: true, message: 'Stazione eliminata' };

  } catch (error) {
    console.error('Errore deleteStation:', error);
    throw new HttpsError('internal', error.message);
  }
});

// Crea una nuova stazione e la assegna all'utente che la ha creata
export const createNewStation = onCall({}, async(request) => {
  // Verifica l'autenticazione dell'utente
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "L'utente deve essere autenticato.");
  }

  const { uid, name } = request.data;

  try {
    console.log("Creazione stazione principale");
    // Scrittura stazione principale
    const stationRef = await admin.firestore().collection('stations').add({
      name,
      owner: uid,
      visibility: 'private',
      device_token: crypto.randomUUID(),
      createdAt: new Date(),
      role: "editor"
    });
    
    console.log("Creazione prima lettura");
    // Scrittura sottocollezione readings
    await admin.firestore().collection(`stations/${stationRef.id}/readings`).add({
      temp: 0,
      humidity: 0,
      air_ppm: 0,
      timestamp:  new Date()
    });
    
    console.log("Aggiunta riferimento per l'utente");
    // Scrittura riferimento utente
    await admin.firestore().doc(`users/${uid}/stations/${stationRef.id}`).set({
      role: 'owner',
      nickname: name
    });

    console.log("Creazione completata");
    return { stationId: stationRef.id };

  } catch (error) {
    console.error(error.message);
    throw new HttpsError("internal", "Errore durante la scrittura su Firestore", error);
  }
});

// Aggiunge una stazione esistente ad un utente
export const addUserStation = onCall({}, async(request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "L'utente deve essere autenticato.");
  }

  const { uid, stationId } = request.data;
  
  try {
    // Controllo se la stazione esiste
    const stationRef = admin.firestore().doc(`stations/${stationId}`);
    const stationSnap = await stationRef.get();
    
    if(!stationRef){
      throw new HttpsError("internal", "Non esiste una stazione per l'id specificato");
    }

    const stationUserSnap = await admin.firestore().collection(`users/${uid}/stations`).get();
    
    stationUserSnap.forEach(doc => {
      if(doc.id === stationRef.id){
        throw new HttpsError("internal", "La stazione è già assegnata all'utente");
      }
    });

    await admin.firestore().collection(`users/${uid}/stations`).doc(stationId).set({
      nickname: stationSnap.data().name,
      role: stationSnap.owner == uid ? "editor" : "visualizzatore"
    });

    console.log("Aggiunta stazione " + stationId + " per l'utente " + uid);

  } catch (error) {
    console.error(error.message);
    throw new HttpsError("cancelled", "Errore durante l'aggiunta della stazione", error);
  }
});

// Ritorna il ruolo dell'utente per la stazione indicata
export const getUserStationRole = onCall({}, async(request) => {
  const {uid, stationId} = request.data;

  // Controlla se la stazione è assegnata all'utente
  const userStationRef = admin.firestore().doc(`users/${uid}/stations/${stationId}`);
  const userStationSnap = await userStationRef.get();

  if(!userStationSnap.exists){
    throw new HttpsError("internal", "La stazione non è assegnata all'utente");
  }

  return userStationSnap.data().role;
});