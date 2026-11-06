import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase/config';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

export async function attivaPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Questo browser non supporta le notifiche push.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permesso notifiche non concesso.');
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      import.meta.env.VITE_VAPID_PUBLIC_KEY
    ),
  });

  const salvaSubscription = httpsCallable(functions, 'savePushSubscription');
  await salvaSubscription({ subscription: subscription.toJSON() });
}