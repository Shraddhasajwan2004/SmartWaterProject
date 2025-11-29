import React from 'react';
import ThingSpeakChart from './components/ThingSpeakChart';
import UsageSummary from './components/UsageSummary';
import TapUsageCard from './components/TapUsageCard';
import BluetoothReader from './components/BluetoothReader';
import LatestReadingCard from './components/LatestReadingCard';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Smart Water Management — Dashboard</h1>
        <p>ESP32 → ThingSpeak → Backend → This Dashboard</p>
      </header>

      <main className="container">
        <section className="left">
          <UsageSummary />
          <TapUsageCard />
          <LatestReadingCard />
          <BluetoothReader />
        </section>

        <section className="right">
          <ThingSpeakChart />
        </section>
      </main>

      <footer className="footer">
        <small>Built with MERN — Frontend (React). Connects to backend at <code>{process.env.REACT_APP_API_BASE || 'http://localhost:5000'}</code></small>
      </footer>
    </div>
  );
}
