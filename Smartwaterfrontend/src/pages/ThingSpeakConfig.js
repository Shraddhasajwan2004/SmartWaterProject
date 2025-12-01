import React, { useState, useEffect } from 'react';
import { Save, Database } from 'lucide-react';
import NeonCard from '../components/NeonCard';

const ThingSpeakConfig = () => {
  const [channelId, setChannelId] = useState('');
  const [readKey, setReadKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('hydro_settings');
    if (savedSettings) {
      const { channelId, readKey } = JSON.parse(savedSettings);
      setChannelId(channelId);
      setReadKey(readKey);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const settings = { channelId, readKey };
    localStorage.setItem('hydro_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-3xl font-display font-bold">Connection Settings</h2>
        <p className="text-gray-500">Link your IoT device via ThingSpeak API</p>
      </div>

      <NeonCard title="ThingSpeak Configuration" glowColor="green">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Channel ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Database size={18} />
                </div>
                <input
                  type="text"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-green focus:border-neon-green outline-none transition-all"
                  placeholder="e.g. 123456"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Read API Key</label>
              <input
                type="password"
                value={readKey}
                onChange={(e) => setReadKey(e.target.value)}
                className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-green focus:border-neon-green outline-none transition-all"
                placeholder="e.g. ABC123XYZ"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500 italic">
              * Ensure your ESP32 is transmitting to these fields.
            </p>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-neon-green/90 text-black font-bold rounded-lg hover:bg-neon-green transition-all shadow-[0_0_15px_rgba(0,255,65,0.4)]"
            >
              <Save size={18} /> {saved ? 'Saved!' : 'Save Config'}
            </button>
          </div>
        </form>
      </NeonCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NeonCard title="Field Mapping Guide" glowColor="blue" className="h-full">
           <ul className="space-y-3 text-sm">
             <li className="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
               <span className="font-mono text-neon-blue">Field 1</span>
               <span>Water Level (cm)</span>
             </li>
             <li className="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
               <span className="font-mono text-neon-blue">Field 2</span>
               <span>Volume (Liters)</span>
             </li>
             <li className="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
               <span className="font-mono text-neon-blue">Field 3</span>
               <span>Flow Rate (L/min) [Optional]</span>
             </li>
           </ul>
        </NeonCard>
      </div>
    </div>
  );
};

export default ThingSpeakConfig;