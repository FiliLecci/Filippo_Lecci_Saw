// SERVICE WORKER

self.addEventListener('install', () => {
  console.log('Service Worker installato');
});

self.addEventListener('activate', () => {
  console.log('Service Worker attivato');
});

self.addEventListener('fetch', event => {
  // Nessuna logica per ora
});

/*
// fetch con logica "stale while revalidate"
self.addEventListener("fetch", event => {
  event.respondWith(
    caches
      .match(event.request)
      .then(cachedReply => {
        const networkFetch = fetch(event.request)
          .then(networkReply => {
            caches.open("pwa-assets").then(cache => {
              cache.put(event.request, networkReply.clone());
            });
            return networkReply;
          })
          .catch(console.log);
          return cachedReply || networkFetch;
      })
  );
});
*/

// gestione messaggi dal main thread
self.addEventListener("message", event => {
  console.log("Ricevuto messaggio: ", event.data);

  const msgRep = {
    data: null,
    error: null
  };

  switch (event.data.msgType) {
    case "TEST_REQ":
      msgRep.data = "Test successful.";
      break;

    default:
      msgRep.error = "TYPE_ERROR";
  }

  event.source.postMessage(msgRep);
});