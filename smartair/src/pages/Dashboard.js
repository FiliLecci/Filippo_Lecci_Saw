import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserStations, listenToReadings } from '../firebase/firestore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';


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
    const unsub = listenToReadings(selectedStation, setReadings);
    return unsub;
  }, [selectedStation]);

  const latest = readings.at(-1);

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>SmartAir</h1>
        <button onClick={() => signOut(auth)}>Esci</button>
        <button onClick={() => navigate('/devices')}>Dispositivi</button>
      </div>

      {/* Selettore stazione */}
      {stations.length === 0 ? (
        <p style={{ color: '#888' }}>Nessuna stazione trovata. Aggiungine una dalla pagina Dispositivi.</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
          {stations.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStation(s.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid #ddd',
                background: selectedStation === s.id ? '#2196f3' : 'white',
                color: selectedStation === s.id ? 'white' : 'black',
                cursor: 'pointer'
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
          <StatCard label="AQI" value={latest.aqi} color={aqiColor(latest.aqi)} />
        </div>
      )}

      {/* Grafico */}
      {readings.length > 0 && (
        <>
          <h2>Temperatura</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={readings}>
              <XAxis dataKey="timestamp" hide />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#2196f3" dot={false} />
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

function StatCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, padding: 16, border: '1px solid #eee',
                  borderRadius: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, color: color || 'inherit' }}>{value}</div>
    </div>
  );
}

function aqiColor(aqi) {
  const colors = { good: '#4caf50', moderate: '#ff9800', poor: '#f44336', hazardous: '#9c27b0' };
  return colors[aqi] || 'inherit';
}