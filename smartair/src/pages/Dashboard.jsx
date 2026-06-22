import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserStations, listenToReadings } from '../firebase/firestore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { calcAqi } from './Utils';

import '../styles/style.css';

export default function Dashboard() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [readings, setReadings] = useState([]);
  const uid = auth.currentUser.uid;
  const navigate = useNavigate();

  // Carica le stazioni dell'utente
  useEffect(() => {
    const unsub = getUserStations(uid, data => {
      setStations(data);
      if (data.length > 0 && !selectedStation) {
        setSelectedStation(data[0].id);
      }
    });
    return unsub;
  }, [uid]);

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
                background: selectedStation === s.id ? '#2196f3' : 'white',
                color: selectedStation === s.id ? 'white' : 'black'
              }}
            >
              {s.nickname || s.name}
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