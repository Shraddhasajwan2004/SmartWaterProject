import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ThingSpeakChart() {
  const [labels, setLabels] = useState([]);
  const [levelData, setLevelData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/reads/recent', { params: { limit: 200 } });
      const rows = res.data || [];
      const asc = rows.slice().sort((a,b)=> new Date(a.created_at) - new Date(b.created_at));
      setLabels(asc.map(r => dayjs(r.created_at).format('HH:mm:ss')));
      setLevelData(asc.map(r => r.water_level_cm ?? null));
      setVolumeData(asc.map(r => r.volume_liters ?? null));
    } catch (err) {
      console.error('Chart load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: 'Level (cm)',
        data: levelData,
        yAxisID: 'y1',
        tension: 0.2,
        pointRadius: 1,
      },
      {
        label: 'Volume (L)',
        data: volumeData,
        yAxisID: 'y2',
        tension: 0.2,
        pointRadius: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    stacked: false,
    plugins: {
      title: { display: true, text: 'Water Level & Volume (recent)' },
      legend: { position: 'top' }
    },
    scales: {
      y1: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Level (cm)' }
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Volume (L)' }
      }
    }
  };

  return (
    <div className="card">
      <h2>Live Chart</h2>
      {loading ? <div>Loading chart…</div> : <Line options={options} data={data} />}
    </div>
  );
}
