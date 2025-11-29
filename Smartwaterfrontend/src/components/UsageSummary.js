import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function UsageSummary() {
  const [today, setToday] = useState(0);
  const [month, setMonth] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);

  async function load() {
    try {
      const [r1, r2, cur] = await Promise.all([
        api.get('/api/stats/usage', { params: { range: 'today' } }),
        api.get('/api/stats/usage', { params: { range: 'month' } }),
        api.get('/api/reads/latest')
      ]);
      setToday(Number(r1.data.liters || 0));
      setMonth(Number(r2.data.liters || 0));
      if (cur.data) {
        setCurrentVolume(cur.data.volume_liters ?? null);
        setCurrentLevel(cur.data.water_level_cm ?? null);
      }
    } catch (err) {
      console.error('UsageSummary load error', err);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card">
      <h2>Usage Summary</h2>
      <div className="summary-grid">
        <div>
          <h3>Today used</h3>
          <p>{today ? `${today.toFixed(2)} L` : '—'}</p>
        </div>

        <div>
          <h3>This month</h3>
          <p>{month ? `${month.toFixed(2)} L` : '—'}</p>
        </div>

        <div>
          <h3>Current Volume</h3>
          <p>{currentVolume ? `${currentVolume.toFixed(1)} L` : '—'}</p>
        </div>

        <div>
          <h3>Current Level</h3>
          <p>{currentLevel ? `${currentLevel.toFixed(1)} cm` : '—'}</p>
        </div>
      </div>
    </div>
  );
}
