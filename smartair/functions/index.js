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

export const recursiveDeleteCollection = onCall({cors: true}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Operazione non autorizzata.");
  }

  const path = request.data.path;
  if (!path) {
    throw new HttpsError("invalid-argument", "Il percorso 'path' è obbligatorio.");
  }

  try {
    const db = admin.getFirestore();
    
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
export const deleteAllStationRefs = onCall({cors: true}, async (request) => {
  // Verifica autenticazione
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Operazione non autorizzata.");
  }

  const stationId = request.data.stationId;
  if(!stationId){
    throw new HttpsError("invalid-argument", "L'id della stazione è obbligatorio");
  }

  try {
    // Verifica che l'utente sia il proprietario
    const stationRef = admin.firestore().collection('stations').doc(stationId);
    const stationSnap = await stationRef.get();

    if (!stationSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Stazione non trovata');
    }

    if (stationSnap.data().owner !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Non hai i permessi');
    }

    console.log("Inizio eliminazione in batch");

    // Usa batch per eliminare atomicamente
    const batch = admin.firestore().batch();

    // Elimina la stazione globale
    batch.delete(stationRef);

    // Elimina il riferimento da tutti gli utenti
    const usersSnap = await admin.firestore().collection('users').get();
    usersSnap.forEach(userDoc => {
      const userStationRef = admin.firestore()
        .collection('users').doc(userDoc.id)
        .collection('stations').doc(stationId);
      batch.delete(userStationRef);
    });

    // Esegui tutte le operazioni
    await batch.commit();

    return { success: true, message: 'Stazione eliminata' };

  } catch (error) {
    console.error('Errore deleteStation:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});