import { useState, useEffect, useSyncExternalStore } from 'react';
import { LuBell } from "react-icons/lu";
import { IoIosArrowUp } from "react-icons/io";
import { toast } from 'react-toastify'; 
import { addNotificationToUser, getUserNotifications } from '../firebase/firestore';
import { auth } from '../firebase/config.js';

import '../styles/Notifications.css';

// Non si possono usre gli state fuori dai blocchi quindi devo fare a questa maniera
var newNotifications = false;
const listeners = new Set();
const user = auth.currentUser;

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
function notificationBodyConstructor (title, body) {
    return (
        <div className="notification-body">
            <h3>{title}</h3>
            <p>{body}</p>
        </div>
    );
};

/* Invia una notifica all'utente e la aggiunge su firestore alle altre
 * 
 */
export function sendNotification (data) {
    if (!user.uid) return;

    setNewNotifications(true);
    addNotificationToUser(user.uid, data);
    toast(notificationBodyConstructor(data.title, data.body));
};

export default function Notifications() {
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    const [notificationWindowViewed, setNotificationWindowViewed] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!notificationWindowViewed || !user?.uid) return;

        const unsub = getUserNotifications(user.uid, setNotifications);
        return unsub;
    }, [notificationWindowViewed, user?.id]);
    
    const handleNotificationBtnClick = () => {
        setNewNotifications(false);
        setNotificationWindowViewed(true);

        // mostra la richiesta solo se il permesso è default (non ancora concesso o negato)
        if((notificationPermission === 'default' || Notification.permission === 'default') && notificationWindowViewed === false) {
            Notification.requestPermission().then((permission) => {
                setNotificationPermission(permission != 'granted' ? 'denied' : 'granted');
            });
        }
    }

    const handleNotificationCloseBtnClick = () => {
        setNotificationWindowViewed(false);
    }

    function notificationWindowManager() {
        if(!notificationWindowViewed) {
            return (
                // Visualizzazione quando la finestra è chiusa
                <button 
                    className="notification-btn"
                    notification-permission={ notificationPermission }
                    onClick={ handleNotificationBtnClick }
                    >
                    <div
                        className="new-notification-indicator"
                        new-notifications={newNotifications ? 'true' : 'false'}
                    />
                    <LuBell size={25}/>
                </button>
            );
        }
        else {
            // Visualizzazione quando la finestra è aperta
            return(
                <div className="notification-window">
                    <button 
                        className="notification-btn"
                        onClick={ handleNotificationCloseBtnClick }
                        >
                        <IoIosArrowUp size={25}/>
                    </button>
                    {(notifications ?? []).length === 0 && <p>Nessuna notifica</p>}
                    {(notifications ?? []).map((n) => (
                        <div key={n.id} className="notification-item">
                            <div className={`notification-indicator ${n.severity}`} />
                            <p>{n.body}</p>
                        </div>
                    ))}
                </div>
            );
        }
    }

    return (
        <div className="notification-container" 
            data-notification-window-viewed={notificationWindowViewed}>
                { notificationWindowManager() }
        </div>
    );
};