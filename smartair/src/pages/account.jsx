import { useState } from 'react';
import { auth } from '../firebase/config';
import { updatePassword } from 'firebase/auth';
import { LuBellRing, LuBellOff } from 'react-icons/lu';
import { attivaPush } from '../push';

import '../styles/account.css'

export default function Account() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pushError, setPushError] = useState('');
  const [pushSuccess, setPushSuccess] = useState('');
  const [pushLoading, setPushLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;
  const notificationsSupported = typeof Notification !== 'undefined';
  const pushPermission = notificationsSupported ? Notification.permission : 'unsupported';

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

  const handleNotificationClick = async () => {
    setPushLoading(true);
    setPushError('');
    setPushSuccess('');

    try {
      await attivaPush();
      setPushSuccess('Notifiche push attivate su questo dispositivo.');
    } catch (e) {
      setPushError(e.message);
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <div className="account_page">
      <div className="account_section">
        <h1>Impostazioni Account</h1>

        <div className="account_section"
        >
          <label>
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

        <div className="account_section">
          <h3 className="section_title">Cambia password</h3>
          <div className="account_section_inline">
            <input
              type="password"
              placeholder="Nuova password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Conferma password"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
            />
          </div>

          {error && <p style={{ color: '#f44336', fontSize: 13, margin: '8px 0' }}>{error}</p>}
          {success && <p style={{ color: '#4caf50', fontSize: 13, margin: '8px 0' }}>{success}</p>}

          <button
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? 'Aggiornamento...' : 'Aggiorna password'}
          </button>
        </div>

        <div className='account_section'>
          <h3>Notifiche push</h3>
          <button
            onClick={handleNotificationClick}
            disabled={pushLoading || !notificationsSupported}
            aria-label="Attiva notifiche push"
          >
            {pushPermission === 'granted' ? <LuBellRing /> : <LuBellOff />}
            {pushLoading ? 'Attivazione...' : 'Attiva notifiche'}
          </button>
          {!notificationsSupported && <p>Questo browser non supporta le notifiche push.</p>}
          {pushPermission === 'denied' && <p>Il permesso è stato negato. Modificalo nelle impostazioni del browser.</p>}
          {pushError && <p role="alert" style={{ color: '#f44336', fontSize: 13, margin: '8px 0' }}>{pushError}</p>}
          {pushSuccess && <p role="status" style={{ color: '#4caf50', fontSize: 13, margin: '8px 0' }}>{pushSuccess}</p>}
        </div>
      </div>
    </div>
  );
}