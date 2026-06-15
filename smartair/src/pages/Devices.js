import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { getUserStations, createStation } from '../firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Devices() {
  const [stations, setStations] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const uid = auth.currentUser.uid;
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = getUserStations(uid, setStations);
    return unsub;
  }, [uid]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    await createStation(uid, newName.trim());
    setNewName('');
    setLoading(false);
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dispositivi</h1>
        <button onClick={() => navigate('/')}>← Dashboard</button>
      </div>

      {/* Aggiungi stazione */}
      <div style={{ display: 'flex', gap: 8, margin: '24px 0' }}>
        <input
          placeholder="Nome stazione (es. Camera da letto)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }}
        />
        <button onClick={handleAdd} disabled={loading}>
          {loading ? '...' : 'Aggiungi'}
        </button>
      </div>

      {/* Lista stazioni */}
      {stations.length === 0 ? (
        <p style={{ color: '#888' }}>Nessuna stazione ancora.</p>
      ) : (
        stations.map(s => (
          <div key={s.id} style={{ padding: 16, border: '1px solid #eee',
                                    borderRadius: 8, marginBottom: 12 }}>
            <div style={{ fontWeight: 500 }}>{s.nickname || s.name}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              ID: {s.id}
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              Token ESP32: <code>{s.device_token}</code>
            </div>
            <div style={{ fontSize: 12, color: '#aaa' }}>
              Ruolo: {s.role}
            </div>
          </div>
        ))
      )}
    </div>
  );
}