import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserStations, listenToReadings } from '../firebase/firestore';
import { LineChart, AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { calcAqi } from './Utils';

import '../styles/style.css';

export default function Dashboard() {
  const [stations, setStations] = useState([]);                 // lista delle stazioni dell'utente
  const [selectedStation, setSelectedStation] = useState(null); // stazione selezionata al momento  
  const [allReadings, setAllReadings] = useState({});           // prime 15 letture di temperature per tutte le stazioni
  const [readings, setReadings] = useState([]);                 // letture della stazione selezionata
  const uid = auth.currentUser?.uid;

  // carica le stazioni dell'utente
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = getUserStations(uid, (data) => {
      setStations(data);

      // setSelectedStation(prev => {
      //   if (prev) return prev;
      //   return data[0]?.id ?? null;
      // });
    });

    return () => unsubscribe && unsubscribe();
  }, [uid]);

  // lettura dei dati della stazione selezionata
  useEffect(() => {
    if (selectedStation === null || selectedStation === undefined) {
      console.log('Nessuna stazione selezionata - letture non caricate');
      return;
    }
    
    console.log('Carico letture per:', selectedStation);
    const unsub = listenToReadings(selectedStation.id, data => {
      console.log('Letture ricevute:', data.length);
      setReadings(data);
    });
    
    return () => {
      console.log('Unsubscribe da:', selectedStation.id);
      unsub();
    };
  }, [selectedStation]);

  // lettura dei dai per l'anteprima delle stazioni (ultime 15 letture)
  useEffect(() => {
    if (!stations || stations.length === 0) return;

    const unsubscribers = [];

    stations.forEach(station => {
      const unsub = listenToReadings(station.id, data => {
        // Prende solo le ultime 20 letture per l'anteprima
        const recentData = Array.isArray(data) ? data.slice(-20) : [];
        setAllReadings(prev => ({
          ...prev,
          [station.id]: recentData
        }));
      });

      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub && unsub());
    };
  }, [stations]);

  return (
    <div className="dashboard-container" data-panel-open={selectedStation!==null}>
      
      {/* Card delle stazioni disponibili */}
      {stations.length === 0 ? (
        <p style={{ color: '#888', margin: '16px 0' }}>Nessuna stazione trovata. Aggiungine una dalla pagina Dispositivi.</p>
      ) : (
        <div className="dashboard-cards-container">
          <h2>Le tue stazioni</h2>
          <div className="station-cards-grid">
          {stations.map(s => {
            const stationReadings = allReadings[s.id] || [];
            
            // Format dei dati per l'AreaChart della singola card
            const chartData = stationReadings.map((r, idx) => ({
              time: r.timestamp || idx,
              temp: r.temp ?? r.temperature ?? 0
            }));

            // Ultima lettura per calcolare il colore dello stato AQI
            const stationLatest = stationReadings.at(-1);
            const stationAqi = calcAqi(stationLatest?.air_ppm);

            return (
              <button
                key={s.id}
                className="station-btn-card"
                data-focused = {selectedStation ? selectedStation.id === s.id : false}
                onClick={() => setSelectedStation(s)}
              >
                {/* Header Card: Nome a sinistra, Cerchio Stato a destra */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: '25px', 
                    color: '#333',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingRight: '8px'
                  }}>
                    {s.nickname || s.name}
                  </span>
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: stationAqi?.color || '#414141',
                      boxShadow: `0 0 6px ${stationAqi?.color || '#414141'}`,
                      flexShrink: 0
                    }}
                    title={`Stato AQI: ${stationAqi?.label || 'N/A'}`}
                  />
                </div>

                {/* anteprima grafico della temperatura*/}
                <div className="station-btn-card-preview">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`tempGradient-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f44336" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#f44336" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#f44336"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#tempGradient-${s.id})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </button>
            );
          })}
          </div>
        </div>
      )}

      {/* Pannello laterale di visualizzazione dettagliata della stazione*/}
      <div className='station-view-panel' data-open={selectedStation!== null}>
        {selectedStation ? (
          <div className='station-view-body'>

            <div className='station-view-header'>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  className="close-station-view-btn"
                  onClick={() => setSelectedStation(null)}
                  aria-label="Chiudi pannello"
                >
                  ✕
                </button>
                <h2>Dettagli per la stazione: {selectedStation.nickname || selectedStation.name}</h2>
              </div>
            </div>

            <div className='station-view-charts-container'>

              <div className='chart-view'>
                <h3>Temperatura attuale: {readings[readings.length - 1]?.temp || 'N/A'}°C</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={readings}>
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="temp" stroke="#f76d6d" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
              </div>

              <div className='chart-view'>
                <h3>Umidità attuale: {readings[readings.length - 1]?.humidity || 'N/A'}%</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={readings}>
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="humidity" stroke="#2196f3" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
              </div>

              <div className='chart-view'>
                  <h3>CO₂ Equivalente (ppm): {readings[readings.length - 1]?.air_ppm || 'N/A'}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={readings}>
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="air_ppm" stroke="#ec7dda" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
              </div>

            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}