import { useState, useEffect, useSyncExternalStore, useRef } from 'react';
import { LuBell } from "react-icons/lu";
import { IoIosArrowUp } from "react-icons/io";
import { toast } from 'react-toastify';
import { addNotificationToUser, getUserNotifications, setNotificationAsRead } from '../firebase/firestore';
import { auth } from '../firebase/config.js';
import {format} from 'date-fns';

import '../styles/Notifications.css';

// Non si possono usre gli state fuori dai blocchi quindi devo fare a questa maniera
var newNotifications = false;
const listeners = new Set();

function setNewNotifications(value) {
  newNotifications = value;
  listeners.forEach((l) => l());
}

export function useNewNotifications() {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => newNotifications
  );
}

// funzione per costruire il corpo della notifica - valutare se fare una funzione dove si passa direttamente il corpo
function notificationBodyConstructor(title, body) {
  return (
    <div className="notification-body">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
};

// Invia una notifica all'utente e la aggiunge su firestore alle altre
export function sendNotification(data) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  setNewNotifications(true);
  addNotificationToUser(uid, data);
  toast(notificationBodyConstructor(data.title, data.body));
}

export default function Notifications() {
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [notificationWindowViewed, setNotificationWindowViewed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    return getUserNotifications(user.uid, (notifications) => {
      // filtro le notifiche che non sono lette
      const newItems = notifications.filter(n => n.read === false);

      // aggiorno subito il set con tutti i doc correnti
      seenIdsRef.current = new Set(notifications.map(n => n.id));

      // mostro notifiche solo per le nuove notifiche che non erano già state viste
      newItems.forEach((n) => {
        toast(notificationBodyConstructor(n.title || 'Nuova notifica', n.body));
      });

      setNewNotifications(newItems.length > 0);
      setNotifications(notifications);
    }, false);

  }, [user?.uid]);

  useEffect(() => {
    // toast per la nuova notifica
    const unreadNotifications = notifications.filter(n => !seenIdsRef.current.has(n.id));

    unreadNotifications.forEach((n) => {
      toast(notificationBodyConstructor(n.title || 'Nuova notifica', n.body));
    });
  }, [newNotifications]);

  const handleNotificationBtnClick = () => {
    setNewNotifications(false);
    setNotificationWindowViewed(true);

    // mostra la richiesta solo se il permesso è default (non ancora concesso o negato)
    if ((notificationPermission === 'default' || Notification.permission === 'default') && notificationWindowViewed === false) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission != 'granted' ? 'denied' : 'granted');
      });
    }

    // TODO imposta le notifiche mostrate come lette su firestore
    setNotificationAsRead(user.uid, notifications.map(n => n.id));
  }

  const handleNotificationCloseBtnClick = () => {
    setNotificationWindowViewed(false);
  }

  function notificationWindowManager() {
    if (!notificationWindowViewed) {
      return (
        // Visualizzazione quando la finestra è chiusa
        <button
          className="notification-btn"
          notification-permission={notificationPermission}
          onClick={handleNotificationBtnClick}
        >
          <div
            className="new-notification-indicator"
            new-notifications={newNotifications ? 'true' : 'false'}
          />
          <LuBell size={25} />
        </button>
      );
    }
    else {
      // Visualizzazione quando la finestra è aperta
      return (
        <div className="notification-window">
          <button
            className="notification-btn"
            onClick={handleNotificationCloseBtnClick}
          >
            <IoIosArrowUp size={25} />
          </button>
          {(notifications ?? []).length === 0 && <p>Nessuna notifica</p>}
          {(notifications ?? []).map((n) => (
            <div key={n.id} className="notification-item">
              <div className="notification-indicator-container">
                <p>{format(new Date(n.time), 'HH:mm')}</p>
                <div className={`notification-indicator ${n.severity}`} />
                <h4>{n.title}</h4>
              </div>
              <div className="notification-content">
                <p>{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  return (
    <div className="notification-container"
      data-notification-window-viewed={notificationWindowViewed}>
      {notificationWindowManager()}
    </div>
  );
};