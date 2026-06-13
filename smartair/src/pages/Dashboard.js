import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [readings, setReadings] = useState([]);
  const uid = auth.currentUser.uid;

  useEffect(() => {
    // Ascolta in realtime le ultime 20 letture della prima stazione
    // (lo rendiamo dinamico quando aggiungiamo la gestione dispositivi)
    const q = query(
      collection(db, 'users', uid, 'stations', 'station_01', 'readings'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, snap => {
      const data = snap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .reverse(); // ordine cronologico per il grafico
      setReadings(data);
    });

    return unsub;
  }, [uid]);

  const latest = readings.at(-1);

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>SmartAir</h1>
        <button onClick={() => signOut(auth)}>Esci</button>
      </div>

      {latest && (
        <div style={{ display: 'flex', gap: 16, margin: '24px 0' }}>
          <StatCard label="Temperatura" value={`${latest.temp}°C`} />
          <StatCard label="Umidità" value={`${latest.humidity}%`} />
          <StatCard label="CO₂ eq." value={`${latest.air_ppm} ppm`} />
          <StatCard label="AQI" value={latest.aqi} />
        </div>
      )}

      <h2>Temperatura (ultime letture)</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={readings}>
          <XAxis dataKey="timestamp" hide />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="temp" stroke="#2196f3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ flex: 1, padding: 16, border: '1px solid #eee',
                  borderRadius: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500 }}>{value}</div>
    </div>
  );
}