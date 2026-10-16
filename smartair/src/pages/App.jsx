import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { listenForeground } from "../firebase/config.js";
import { initializeUserDatabase } from '../firebase/firestore';

import Login from './login';
import Dashboard from './dashboard';
import Devices from './devices';
import Account from './account';
import Sidebar from '../components/sidebar';
import DevicesTesting  from './devicesTesting';

function LayoutWrapper() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflow: 'auto',
        background: '#f5f5f5'
      }}>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Utente loggato - inizializza il database se necessario
        try {
          await initializeUserDatabase(authUser.uid);
        } catch (e) {
          console.error('Errore durante l\'inizializzazione:', e);
        }
      }

      setUser(authUser);
      setLoading(false);
    });
    
    return unsub;
  }, []);

  // listener per i messaggi in primo piano
  useEffect(() => {
    if (!user) return; // ascolta solo se loggato

    const unsubscribe = listenForeground((payload) => {
      console.log("Messaggio in primo piano:", payload);
      // visualizza una notifica o aggiorna lo stato dell'applicazione in base al payload
    });

    return unsubscribe;
  }, [user]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: 48 }}>Caricamento...</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login />
        } />
        z
        <Route element={user ? <LayoutWrapper /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/account" element={<Account />} />
          <Route path="/devicesTesting" element={<DevicesTesting />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;