// Calcolo dell'indice di qualità dell'aria (AQI) in base alla concentrazione di CO2 in ppm
export function calcAqi(ppm) {
  if (ppm === undefined || ppm === null) return { label: 'N/D', color: '#aaa' };
  if (ppm < 600)  return { label: 'Ottima',   color: '#4caf50' };
  if (ppm < 800)  return { label: 'Buona',    color: '#8bc34a' };
  if (ppm < 1000) return { label: 'Moderata', color: '#ff9800' };
  if (ppm < 1500) return { label: 'Scarsa',   color: '#f44336' };
  return             { label: 'Pessima',  color: '#9c27b0' };
}