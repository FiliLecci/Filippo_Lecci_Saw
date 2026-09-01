import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { 
  getUserStations, createStation, 
  deleteStationForUser, deleteStationPermanent, 
  addStationToUser, getUserStationRole
} from '../firebase/firestore';
import {LuTrash, LuEye, LuPen, LuPlus} from 'react-icons/lu';
import { ViewDeviceModal } from '../components/ViewDeviceModal';
import { ConfirmModal } from '../components/ConfirmModal';
import '../index.css';
import '../styles/style.css';

export default function Devices() {
  const [stations, setStations] = useState([]);
  const [newName, setNewName] = useState('');
  const [stationId, setStationId] = useState('');
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

  const handleExistingStationAdd = async () => {
    if(!stationId.trim()) 
      return;

    setLoading(true);
    try{
      await addStationToUser(uid, stationId.trim());
    } catch (e){}
    finally {
      setStationId('');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if(uid == selectedStation.owner) {
        console.log("Eliminazione permanente della stazione.");
        await deleteStationPermanent(uid, selectedStation.id);
      }
      else{
        console.log("Eliminazione della stazione per l'utente.");
        await deleteStationForUser(uid, selectedStation.id);
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione della stazione:', error);
    }
  };

  return (
    <>
    <div className="devices-container">
      <h1>Dispositivi</h1>

      {/* campi aggiunta stazioni */}
      <div className="add-station-container">
        <div className="add-station-inputs">
          <input
            className='station-input'
            placeholder="Nome stazione (es. Camera da letto)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            className='add-btn'
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? '...' : <LuPlus size="25" style={{display: 'block'}} />}
          </button>
        </div>
        <hr className="vertBar"/>
        <div className="add-station-inputs">
          <input
            className='station-input'
            placeholder='Id stazione esistente'
            value={stationId}
            onChange={e => setStationId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleExistingStationAdd()}
          />
          <button
            className='add-btn'
            onClick={handleExistingStationAdd}
            disabled={loading}
          >
            {loading ? '...' : <LuPlus size="25" style={{display: 'block'}} />}
          </button> 
        </div>
      </div>

      {/* Griglia stazioni*/}
      {stations.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', marginTop: 48 }}>
          Nessuna stazione. Aggiungine una sopra!
        </p>
      ) : (
        <div className="devices-grid">
          {stations.map(station => (
            <div
              key={station.id}
              className='devices-item'
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>
                {station.name || 'N/D'}
              </h3>
              
              <p style={{ margin: 0, fontSize: 12, color: '#d3d3d3' }}>
                📍 {station.nickname || 'N/D'}
              </p>
              
              <p style={{ margin: '8px 0 0 0', fontSize: 11, color: '#aaa', wordBreak: 'break-all' }}>
                ID: <code>{station.id}</code>
              </p>
              
              <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#aaa' }}>
                Token: <code style={{ fontSize: 10 }}>
                  {station.device_token?.substring(0, 8) || 'N/D'}...
                </code>
              </p>
              
              <div className="station-btn-group">
                {/* Renderizza pulsante modifica solo se è editor */}
                {station.role == "editor" && 
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
                }
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
    </div>
    {/* finestra di conferma eliminazione */}
    {selectedStation && (
      <ConfirmModal
        isOpen={confirmModalOpen}
        body={`Sei sicuro di voler eliminare la stazione "${selectedStation.name}"?`}
        confirmText="Elimina"
        cancelText="Annulla"
        onConfirm={() => {
          handleDelete();
          setConfirmModalOpen(false);
        }}
        onCancel={() => {setConfirmModalOpen(false);}}
      />
    )}
    {/* finestra di visualizzazione/modifica stazione */}
    <ViewDeviceModal
      isViewed={selectedStation !== null} 
      station={selectedStation} 
      mode={selectedMode} 
      onClose={() => {
        setSelectedStation(null);
        setSelectedMode(null);
        }}
    />
    </>
  );
}