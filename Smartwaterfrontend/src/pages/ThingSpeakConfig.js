import React, { useState, useEffect } from 'react';
import { Save, Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import NeonCard from '../components/NeonCard';
import { saveDeviceConfig, getDeviceConfig } from '../services/api';

const ThingSpeakConfig = () => {
  const [channelId, setChannelId] = useState('');
  const [readKey, setReadKey] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const config = await getDeviceConfig();
      if (config) {
        setChannelId(config.channelId || '');
        setReadKey(config.readKey || '');
      }
    } catch (error) {
      console.error("Failed to load config", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Saving...' });
    
    try {
      // 1. Save Config
      await saveDeviceConfig({ channelId, readKey });
      
      // 2. Verify Config by reloading (Double check persistence)
      await loadSettings();
      
      setStatus({ type: 'success', msg: 'Configuration Saved Successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: 'Failed to save configuration. Please try again.' });
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
      <Loader2 className="animate-spin mb-4 text-neon-blue" size={32} />
      <p>Loading configuration...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-3xl font-display font-bold">Connection Settings</h2>
        <p className="text-gray-500">Link your IoT device via ThingSpeak API</p>
      </div>

      <NeonCard title="ThingSpeak Configuration" glowColor="green">
        <form onSubmit={handleSave} className="space-y-6">
          {status.msg && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${
              status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 
              status.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 
              'bg-blue-500/10 text-blue-500'
            }`}>
              {status.type === 'success' ? <CheckCircle size={20} /> : status.type === 'error' ? <AlertCircle size={20}/> : <Loader2 className="animate-spin" size={20}/>}
              {status.msg}
            </div>
          )}

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
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-green outline-none"
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
                className="block w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-green outline-none"
                placeholder="e.g. ABC123XYZ"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500 italic">
              * Stored securely in the cloud database.
            </p>
            <button
              type="submit"
              disabled={status.type === 'loading'}
              className="flex items-center gap-2 px-6 py-2.5 bg-neon-green/90 text-black font-bold rounded-lg hover:bg-neon-green transition-all shadow-[0_0_15px_rgba(0,255,65,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} /> {status.type === 'loading' ? 'Saving...' : 'Save Config'}
            </button>
          </div>
        </form>
      </NeonCard>
    </div>
  );
};

export default ThingSpeakConfig;