import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// inizializzazione del canale per messaggi tra main thread e worker thread
const msgChannel = new MessageChannel();

// handler dei messaggi in arrivo dal service worker
msgChannel.port1.onmessage = (event) => {
  console.log("Messaggio ricevuto dal Service Worker: ", event.data);
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrato:', registration.scope);
    } catch (error) {
      console.error('Registrazione fallita:', error.name, error.message);
    }
  });
}