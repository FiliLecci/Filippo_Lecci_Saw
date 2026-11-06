import { precacheAndRoute } from 'workbox-precaching';

self.addEventListener('install', () => {
  console.log('Service Worker installato');
});

self.addEventListener('activate', () => {
  console.log('Service Worker attivato');
});


precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'SmartAir', {
      body: data.body ?? '',
      icon: '/logo.png',
      data: { url: data.url ?? '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url ?? '/')
  );
});