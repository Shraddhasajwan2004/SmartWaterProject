import React, { useEffect, useState } from 'react';
import api from '../api/api';
import dayjs from 'dayjs';

export default function LatestReadingCard(){
  const [latest, setLatest] = useState(null);

  const load = async () => {
    try {
      const r = await api.get('/api/reads/latest');
      setLatest(r.data);
    } catch (err) {
      console.error('latest reading error', err);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  if (!latest) {
    return <div className="card"><h2>Latest Reading</h2><div>Loading…</div></div>;
  }

  return (
    <div className="card">
      <h2>Latest Reading</h2>
      <div><strong>Time:</strong> {dayjs(latest.created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
      <div><strong>Tank distance:</strong> {latest.distance_tank_cm ?? '—'} cm</div>
      <div><strong>Tap distance:</strong> {latest.distance_person_cm ?? '—'} cm</div>
      <div><strong>Level:</strong> {latest.water_level_cm ? `${latest.water_level_cm.toFixed(1)} cm` : '—'}</div>
      <div><strong>Volume:</strong> {latest.volume_liters ? `${latest.volume_liters.toFixed(1)} L` : '—'}</div>
      <div><strong>Person present:</strong> {latest.person_present == null ? '—' : latest.person_present ? 'Yes' : 'No'}</div>
    </div>
  );
}
