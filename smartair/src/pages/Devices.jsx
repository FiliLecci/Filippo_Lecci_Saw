import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { 
  getUserStations, createStation, 
  deleteStationForUser, deleteStationPermanent 
} from '../firebase/firestore';
import {LuTrash, LuEye, LuPen} from 'react-icons/lu';
import { ViewDeviceModal } from '../components/ViewDeviceModal';
import { ConfirmModal } from '../components/ConfirmModal';
import '../index.css';
import '../styles/style.css';

export default function Devices() {
  const [stations, setStations] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null); // Tiene traccia della stazione selezionata per il modal
  const [selectedMode, setSelectedMode] = useState(null); // Tiene traccia della modalità selezionata per il modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false); // Stato per il modal di conferma eliminazione
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

  const handleDelete = async (stationId) => {
    try {
      if(uid === stationId.owner) {
        await deleteStationForUser(uid, stationId);
      }
      else{
        await deleteStationPermanent(uid, stationId);
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione della stazione:', error);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <h1>Dispositivi</h1>

      {/* Form aggiungi stazione */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, height: '40px', alignItems: 'center' }}>
        <input
          className='stationInput'
          placeholder="Nome stazione (es. Camera da letto)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAdd()}
        />
        <button
          className='addBtn'
          onClick={handleAdd}
          disabled={loading}
        >
          {loading ? '...' : 'Aggiungi'}
        </button>
        <hr className="vertBar"/>
        <input
          className='stationInput'
          placeholder='Token stazione esistente'
        />
        <button
          className='addBtn'
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
                  onClick={() => {setSelectedStation(station); 
                                  setSelectedMode('edit');}}
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
                  onClick={() => {setSelectedStation(station); 
                                  setSelectedMode('view');}}
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
                  onClick={() => {
                    /* if (window.confirm(`Sei sicuro di voler eliminare la stazione "${station.nickname || station.name}"?`)) {
                      handleDelete(station.id);
                      } */
                    setSelectedStation(station);
                    setConfirmModalOpen(true);
                  }}
                >
                <LuTrash /> Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    {/* Modale di conferma eliminazione */}
    {selectedStation && (
      <ConfirmModal
        isOpen={confirmModalOpen}
        body={`Sei sicuro di voler eliminare la stazione "${selectedStation.name}"?`}
        confirmText="Conferma"
        cancelText="Annulla"
      onConfirm={() => {handleDelete(selectedStation.id);setConfirmModalOpen(false);}}
      onCancel={() => {setConfirmModalOpen(false);}}
    />
    )}
    {/* Modale di visualizzazione/modifica stazione */}
    <ViewDeviceModal
      isViewed={selectedStation !== null} 
      station={selectedStation} 
      mode={selectedMode} 
      onClose={() => {
        setSelectedStation(null);
        setSelectedMode(null);
        }}
    />
    </div>
  );
}