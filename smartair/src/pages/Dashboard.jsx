import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserStations, listenToReadings } from '../firebase/firestore';
import { LineChart, AreaChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { calcAqi } from './Utils';

import '../styles/style.css';

export default function Dashboard() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [allReadings, setAllReadings] = useState({});
  const uid = auth.currentUser?.uid;
  const navigate = useNavigate();

  // 1. Carica le stazioni dell'utente al mount
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = getUserStations(uid, (data) => {
      setStations(data);

      setSelectedStation(prev => {
        if (prev) return prev;
        return data[0]?.id ?? null;
      });
    });

    return () => unsubscribe && unsubscribe();
  }, [uid]);

  // 2. Ascolta le letture di TUTTE le stazioni contemporaneamente
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

  // Letture della stazione attualmente selezionata per i grafici grandi in basso
  const selectedReadings = allReadings[selectedStation] || [];
  const latest = selectedReadings.at(-1);
  const aqi = calcAqi(latest?.air_ppm);

  return (
    <div className="dashboard-container">
      
      {/* Card delle stazioni disponibili */}
      {stations.length === 0 ? (
        <p style={{ color: '#888' }}>Nessuna stazione trovata. Aggiungine una dalla pagina Dispositivi.</p>
      ) : (
        <div className="dashboard-cards-container">
          {stations.map(s => {
            const isSelected = selectedStation === s.id;
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
                className="stationSelBtn"
                data-focused = {selectedStation === s.id}
                onClick={() => setSelectedStation(s.id)}
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
                <div style={{ width: '100%', height: '60px', marginTop: 'auto' }}>
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
      )}

      {/* Pannello laterale di visualizzazione dettagliata della stazione*/}
      <div className='station-view-panel'>
        {selectedStation ? (
          <div className='station-view-body'>
            <div className='station-view-header'>

            </div>
            <div className='station-view-charts-container'>
              <div className='chart-view'>

              </div>
              <div className='chart-view'>

              </div>
              <div className='chart-view'>

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