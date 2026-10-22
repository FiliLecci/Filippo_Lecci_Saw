import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App';
import { ToastContainer, toast } from 'react-toastify'; 

import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
    <ToastContainer />
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  const notify = (text) => toast(text);

  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js').then(
        () => console.log('Service Worker registrato')
      );

      // Aspetta che il SW sia attivo
      await navigator.serviceWorker.ready;

      notify("Service worker partito scemo");

    } catch (error) {
      console.error('Registrazione fallita:', error.name, error.message);
    }
  });
}

// ATTIVAZIONE DELLE NOTIFICHE

if (!'Notification' in window){
  alert("Questo browser non supporta le notifiche. Alcune funzionalità potrebbero non funzionare correttamente.");
}
else if (Notification.permission !== 'granted') { 
  // se non è ancora stato dato il permesso per le notifiche lo chiede
  Notification.requestPermission().then((permission) => {
    if (permission !== 'granted') { // permesso negato
      alert("Le notifiche sono state disabilitate. Alcune funzionalità potrebbero non funzionare correttamente.");
    }
    var notification = new Notification("SmartAir", {
      lang: "it",
      body: "Notifiche abilitate",
      icon: "/logo.png",
      vibrate: [200, 100, 200]
    });
  });
}