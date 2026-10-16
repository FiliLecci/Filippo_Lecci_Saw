import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js').then(
        (registration) => console.log('Service Worker registrato: ', registration)
      );

      // Aspetta che il SW sia attivo
      await navigator.serviceWorker.ready;

    } catch (error) {
      console.error('Registrazione fallita:', error.name, error.message);
    }
  });
}

if (!'Notification' in window){
  alert("Questo browser non supporta le notifiche. Alcune funzionalità potrebbero non funzionare correttamente.");
}
else if (Notification.permission !== 'granted') { 
  // se non è ancora stato dato il permesso per le notifiche lo chiede
  Notification.requestPermission().then((permission) => {
    if (permission !== 'granted') { // permesso negato
      alert("Le notifiche sono state disabilitate. Alcune funzionalità potrebbero non funzionare correttamente.");
    }
    else { // permesso concesso
      var notification = new Notification("SmartAir", {
        lang: "it",
        body: "Notifiche disabilitate",
        icon: "/logo.png",
        vibrate: [200, 100, 200]
      });
    }
  });
}