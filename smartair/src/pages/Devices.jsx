import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { getUserStations, createStation } from '../firebase/firestore';
import {LuTrash, LuEye, LuPen} from 'react-icons/lu'

export default function Devices() {
  const [stations, setStations] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const uid = auth.currentUser.uid;

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
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <h1>Dispositivi</h1>

      {/* Form aggiungi stazione */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <input
          placeholder="Nome stazione (es. Camera da letto)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAdd()}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 14
          }}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          {loading ? '...' : 'Aggiungi'}
        </button>
      </div>

      {/* CSS Grid */}
      {stations.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: 48 }}>
          Nessuna stazione. Aggiungine una sopra!
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20
        }}>
          {stations.map(station => (
            <div
              key={station.id}
              style={{
                padding: 16,
                background: 'white',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>
                {station.nickname || station.name}
              </h3>
              
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                📍 {station.name}
              </p>
              
              <p style={{ margin: '8px 0 0 0', fontSize: 11, color: '#aaa', wordBreak: 'break-all' }}>
                ID: <code>{station.id}</code>
              </p>
              
              <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#aaa' }}>
                Token: <code style={{ fontSize: 10 }}>
                  {station.device_token?.substring(0, 8) || 'N/D'}...
                </code>
              </p>
              
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = '#eeeeee'}
                  onMouseLeave={e => e.target.style.background = '#f5f5f5'}
                >
                  <LuPen /> Modifica
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = '#eeeeee'}
                  onMouseLeave={e => e.target.style.background = '#f5f5f5'}
                >
                  <LuEye /> Visualizza
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#ffebee',
                    border: '1px solid #ffcdd2',
                    borderRadius: 6,
                    color: '#d32f2f',
                    cursor: 'pointer',
                    fontSize: 12,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.target.style.background = '#ffcdd2'}
                  onMouseLeave={e => e.target.style.background = '#ffebee'}
                >
                <LuTrash /> Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}