import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  if (user === undefined) return <p>Caricamento...</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <Login />
        }/>
        <Route path="/" element={
          user ? <Dashboard /> : <Navigate to="/login" />
        }/>
        <Route path="/devices" element={
          user ? <Devices /> : <Navigate to="/login" />
        }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;