import { useState } from 'react';
import { auth } from '../firebase/config';
import { updatePassword, signOut } from 'firebase/auth';

export default function Account() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  const handleChangePassword = async () => {
    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Le password non corrispondono');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updatePassword(user, password);
      setSuccess('Password cambiata con successo');
      setPassword('');
      setPasswordConfirm('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 500 }}>
      <h1>Impostazioni Account</h1>

      <div style={{ marginBottom: 24, padding: 16, background: 'white', borderRadius: 8 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
          Email
        </label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #ddd',
            background: '#f9f9f9',
            color: '#666',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: 'white', borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Cambia password</h3>
        <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
          Nuova password
        </label>
        <input
          type="password"
          placeholder="Nuova password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #ddd',
            marginBottom: 12,
            boxSizing: 'border-box'
          }}
        />

        <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>
          Conferma password
        </label>
        <input
          type="password"
          placeholder="Conferma password"
          value={passwordConfirm}
          onChange={e => setPasswordConfirm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #ddd',
            marginBottom: 12,
            boxSizing: 'border-box'
          }}
        />

        {error && <p style={{ color: '#f44336', fontSize: 13, margin: '8px 0' }}>{error}</p>}
        {success && <p style={{ color: '#4caf50', fontSize: 13, margin: '8px 0' }}>{success}</p>}

        <button
          onClick={handleChangePassword}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          {loading ? 'Aggiornamento...' : 'Aggiorna password'}
        </button>
      </div>
    </div>
  );
}