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

if (!('Notification' in window)) {
  alert("Questo browser non supporta le notifiche. Alcune funzionalità potrebbero non funzionare correttamente.");
}