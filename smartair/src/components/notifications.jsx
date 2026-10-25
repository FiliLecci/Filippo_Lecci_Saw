import { useState, useSyncExternalStore } from 'react';
import { LuBell } from "react-icons/lu";
import { IoIosArrowUp } from "react-icons/io";
import { toast } from 'react-toastify'; 
import { addNotificationToUser } from '../firebase/firestore';

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
function notificationBodyConstructor (title, body) {
    return (
        <div className="notification-body">
            <h3>{title}</h3>
            <p>{body}</p>
        </div>
    );
};

export function sendNotification (uid, data) {
    setNewNotifications(true);
    addNotificationToUser(uid, data);
    toast(notificationBodyConstructor(data.title, data.body));
};

export default function Notifications() {
    const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
    const [notificationWindowViewed, setNotificationWindowViewed] = useState(null);
    
    const handleNotificationBtnClick = () => {
        setNewNotifications(false);
        setNotificationWindowViewed(!notificationWindowViewed);

        // mostra la richiesta solo se il permesso è default (non ancora concesso o negato)
        if((notificationPermission === 'default' || Notification.permission === 'default') && notificationWindowViewed === false) {
            Notification.requestPermission().then((permission) => {
                setNotificationPermission(permission != 'granted' ? 'denied' : 'granted');
            });
        }
    }

    // Prende le notifiche dalla cache
    function getNotificationsFromCache() {
        // Recupera le notifiche ricevute
        let res =getUserNotifications().map((notification, index) => (

            <div key={index} className="notification-item">
                <div className={`notification-indicator ${notification.type}`}/>
                <p>{notification.text}</p>
            </div>
        ));

        if(res.length === 0) {
            return (
                <div className="notification-item">
                    Nessuna notifica ricevuta nella sessione attuale
                </div>
            )
        }

        return res;
    }

    function notificationWindowManager() {
        if(!notificationWindowViewed) {
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
                        onClick={handleNotificationBtnClick}
                        >
                        <IoIosArrowUp size={25}/>
                    </button>
                    { getNotificationsFromCache() }
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