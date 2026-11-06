import { matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

registerRoute(
  new NavigationRoute(
    new NetworkFirst({ cacheName: 'smartair-pages' })
  )
);

setCatchHandler(async ({ request }) => {
  if (request.mode === 'navigate') {
    return (await matchPrecache('/offline.html')) ?? Response.error();
  }

  return Response.error();
});

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