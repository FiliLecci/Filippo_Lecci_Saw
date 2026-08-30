import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserStations, listenToReadings } from '../firebase/firestore';
import { LineChart, AreaChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { calcAqi } from './Utils';

import '../styles/style.css';

export default function Dashboard() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [readings, setReadings] = useState({});
  const uid = auth.currentUser.uid;
  const navigate = useNavigate();

  // Carica le stazioni dell'utente
useEffect(() => {
  if (!stations || stations.length === 0) return;

  const unsubscribers = [];

  stations.forEach(station => {
    const unsub = listenToReadings(station.id, data => {
      setAllReadings(prev => ({
        ...prev,
        [station.id]: data // Aggiorna solo le letture della stazione specifica
      }));
    });

    unsubscribers.push(unsub);
  });

  // Funzione di cleanup: rimuove tutti i listener creati
  return () => {
    unsubscribers.forEach(unsub => unsub && unsub());
  };
}, [stations]); // Si riattiva se l'elenco delle stazioni cambia

  // Ascolta le letture della stazione selezionata
  useEffect(() => {
    if (!selectedStation) return;
    const unsub = listenToReadings(selectedStation, data => {
      console.log('Readings ricevuti:', data);
      setReadings(data);
    });
    return unsub;
  }, [selectedStation]);

  const latest = readings.at(-1);

  const aqi = calcAqi(latest?.air_ppm);
  
  return (
    // Contenitore principale
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      
      {/* Selettore stazione */}
      {stations.length === 0 ? (
        <p style={{ color: '#888' }}>Nessuna stazione trovata. Aggiungine una dalla pagina Dispositivi.</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
          {stations.map(s => (
            <button
              key={s.id}
              className="stationSelBtn"
              onClick={() => setSelectedStation(s.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                width: '200px',
                padding: '12px',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                // Sfondo sfumato dall'alto verso il basso
                background: 'linear-gradient(180deg, #ffffff 0%, #e3f2fd 100%)',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(33, 150, 243, 0.25)',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                overflow: 'hidden'
              }}
            >
              {/* Header Card: Nome a sinistra, Cerchio Stato a destra */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ 
                  fontWeight: '600', 
                  fontSize: '15px', 
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
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: calcAqi(s.air_ppm),
                    boxShadow: `0 0 6px ${calcAqi(s.air_ppm)}`,
                    flexShrink: 0
                  }}
                  title={`Stato: ${s.status || 'Verde'}`}
                />
              </div>

              {/* Anteprima Grafico Temperatura con ResponsiveContainer */}
              <div style={{ width: '100%', height: '60px', marginTop: 'auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      {/* Sfumatura rossa dall'alto verso il basso */}
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
                      isAnimationActive={false} // Rimuove l'animazione al cambio di selezione se desiderato
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Stat cards */}      
      {latest && (
        <div style={{ display: 'flex', gap: 16, margin: '24px 0' }}>
          <StatCard label="Temperatura" value={`${latest.temp}°C`} />
          <StatCard label="Umidità" value={`${latest.humidity}%`} />
          <StatCard label="CO₂ eq." value={`${latest.air_ppm} ppm`} />
          <StatCard label="AQI" value={aqi.label} background={aqi.color} />
        </div>
      )}

      {/* Grafico */}
      {readings.length > 0 && (
        <>
          <h2>Temperatura & Umidità</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={readings}>
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#f8ac08" dot={false} />
              <Line type="monotone" dataKey="humidity" stroke="#3f24a3" dot={false} />
            </LineChart>
          </ResponsiveContainer>

          <h2>CO₂ equivalente (ppm)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={readings}>
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="air_ppm" stroke="#ff7043" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, text_color, background}) {
  return (
    <div style={{ flex: 1, padding: 16, border: '1px solid #eee',
                  borderRadius: 8, textAlign: 'center', background: background || 'inherit' }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, color: text_color || 'inherit' }}>{value}</div>
    </div>
  );
}