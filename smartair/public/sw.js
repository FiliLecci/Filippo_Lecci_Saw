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