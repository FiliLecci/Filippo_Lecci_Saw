import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column',
                  alignItems: 'center', marginTop: '20vh', gap: 16 }}>
      <h1>SmartAir</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
      <button onClick={handleLogin}>Accedi</button>
      <button onClick={handleRegister}>Registrati</button>
    </div>
  );
}