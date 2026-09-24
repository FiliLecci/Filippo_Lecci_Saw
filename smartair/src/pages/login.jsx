import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { MdErrorOutline } from "react-icons/md";

import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      setError('Errore login Google: ' + e.message);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError('Errore: ' + e.message);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError('Errore: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header con logo e titolo */}
        <div className="login-header">
          <div className="logo">
            <img src="/icons/logo_trasp.png" alt="SmartAir" width="80" height="80" />
          </div>
          <p className="subtitle">Monitora la qualità dell'aria</p>
        </div>

        {/* Messaggio di errore */}
        {error && (
          <div className="error-message">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <MdErrorOutline className="icon" />
              {error}
            </span>
          </div>
        )}

        {/* Form */}
        <div className="login-form">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="tuo@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Almeno 6 caratteri"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
              disabled={loading}
            />
          </div>

          {/* Pulsanti Accedi e Registrati */}
          <button
            className="btn btn-primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>

          {/* Divider sfumato */}
          <div className="divider">
            <span>oppure</span>
          </div>

          {/* Pulsante Google */}
          <button
            className="btn btn-google"
            onClick={handleGoogle}
            disabled={loading}
          >
            <img src="/icons/google_logo.svg" alt="Google Logo" width="20" height="20" />
            Accedi con Google
          </button>
        </div>

        {/* Footer */}
        <p className="login-footer">
          SmartAir v1.0 • <a href="#">Privacy</a>
        </p>
      </div>
    </div>
  );
}