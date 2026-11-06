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
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js').then(
        () => console.log('Service Worker registrato')
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