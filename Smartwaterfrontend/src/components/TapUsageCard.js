import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function TapUsageCard(){
  const [totalSec, setTotalSec] = useState(0);
  const [count, setCount] = useState(0);

  async function load() {
    try {
      const r = await api.get('/api/stats/tap', { params: { range: 'today' } });
      setTotalSec(Number(r.data.total_seconds || 0));
      setCount(Number(r.data.count || 0));
    } catch (err) {
      console.error('TapUsage load error', err);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;

  return (
    <div className="card">
      <h2>Tap Usage (Today)</h2>
      <div>
        <strong>Total time:</strong> {`${mins}m ${secs}s`}
      </div>
      <div>
        <strong>Times used:</strong> {count}
      </div>
    </div>
  );
}
