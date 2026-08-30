// Calcolo dell'indice di qualità dell'aria (AQI) in base alla concentrazione di CO2 in ppm
export function calcAqi(ppm) {
  if (ppm === undefined || ppm === null) return { label: 'N/D', color: '#aaa' };
  if (ppm < 600)  return { label: 'Ottima',   color: '#4caf50' };
  if (ppm < 800)  return { label: 'Buona',    color: '#8bc34a' };
  if (ppm < 1000) return { label: 'Moderata', color: '#ff9800' };
  if (ppm < 1500) return { label: 'Scarsa',   color: '#f44336' };
  return             { label: 'Pessima',  color: '#9c27b0' };
}

function StatCard({ label, value, text_color, background }) {
  return (
    <div style={{ 
      flex: 1, 
      padding: 16, 
      border: '1px solid #eee',
      borderRadius: 8, 
      textAlign: 'center', 
      background: background || 'inherit' 
    }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, color: text_color || 'inherit' }}>{value}</div>
    </div>
  );
}