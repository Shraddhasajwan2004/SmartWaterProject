import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bluetooth, RefreshCw, Droplet, AlertTriangle, Clock, Activity, Zap, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NeonCard from '../components/NeonCard';
import { fetchThingSpeakData } from '../services/thingSpeakService';

const ProjectArena = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('Never');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Bluetooth State
  const [bleDevice, setBleDevice] = useState(null);
  const [bleStatus, setBleStatus] = useState('disconnected'); // disconnected, scanning, connected

  // Derived state
  const latestFeed = feeds.length > 0 ? feeds[feeds.length - 1] : null;
  const currentLevel = latestFeed ? parseFloat(latestFeed.field1 || '0') : 0;
  const currentVolume = latestFeed ? parseFloat(latestFeed.field2 || '0') : 0;

  const fetchData = async () => {
    setLoading(true);
    const saved = localStorage.getItem('hydro_settings');
    if (!saved) {
      setError("Configuration missing");
      setLoading(false);
      return;
    }
    
    const settings = JSON.parse(saved);
    const data = await fetchThingSpeakData(settings);
    
    if (data && data.feeds) {
      setFeeds(data.feeds);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } else {
      setError("Failed to fetch data. Verify Channel ID & API Key.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Bluetooth Handler
  const handleBluetoothScan = async () => {
    if (!navigator.bluetooth) {
      alert("Web Bluetooth is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    try {
      setBleStatus('scanning');
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });

      setBleDevice(device);
      const server = await device.gatt.connect();
      console.log('Connected to:', server);
      setBleStatus('connected');
      
      device.addEventListener('gattserverdisconnected', () => {
        setBleStatus('disconnected');
        setBleDevice(null);
      });

    } catch (err) {
      console.error("Bluetooth Error:", err);
      setBleStatus('disconnected');
    }
  };

  const handleDisconnect = () => {
    if (bleDevice && bleDevice.gatt.connected) {
      bleDevice.gatt.disconnect();
    }
    setBleDevice(null);
    setBleStatus('disconnected');
  };

  // Format data for chart
  const chartData = feeds.map(f => ({
    time: new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    level: parseFloat(f.field1 || '0'),
    volume: parseFloat(f.field2 || '0'),
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Project Arena</h1>
          <p className="text-gray-500 text-sm">Real-time Telemetry Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full flex items-center gap-2">
             <Clock size={12} /> Updated: {lastUpdate}
          </span>
          <button 
            onClick={fetchData} 
            className={`p-2 rounded-full bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {error === "Configuration missing" && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-6 rounded-lg flex flex-col items-center gap-4 mb-4 text-center">
          <AlertTriangle size={32} />
          <div>
            <h3 className="font-bold text-lg">Connection Required</h3>
            <p className="text-sm opacity-80">Link your ThingSpeak channel to see live data.</p>
          </div>
          <button 
            onClick={() => navigate('/config')}
            className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Settings size={18} /> Configure Connection
          </button>
        </div>
      )}

      {error && error !== "Configuration missing" && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center gap-2 mb-4">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NeonCard glowColor="blue" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Droplet size={64} className="text-neon-blue" />
          </div>
          <p className="text-sm font-medium text-gray-500 uppercase">Field 1 (Level)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold font-display text-gray-900 dark:text-white">{currentLevel.toFixed(1)}</span>
            <span className="text-sm text-neon-blue">raw</span>
          </div>
        </NeonCard>

        <NeonCard glowColor="purple" className="relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={64} className="text-neon-purple" />
          </div>
          <p className="text-sm font-medium text-gray-500 uppercase">Field 2 (Volume)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold font-display text-gray-900 dark:text-white">{currentVolume.toFixed(1)}</span>
            <span className="text-sm text-neon-purple">raw</span>
          </div>
        </NeonCard>
        
        <NeonCard glowColor="green" className="relative overflow-hidden">
          <p className="text-sm font-medium text-gray-500 uppercase">BLE Status</p>
           <div className="mt-2 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${bleStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
            <span className="text-2xl font-bold font-display text-gray-900 dark:text-white capitalize">{bleStatus}</span>
          </div>
           <p className="text-xs text-gray-400 mt-2">{bleDevice ? bleDevice.name : 'No device linked'}</p>
        </NeonCard>

        <NeonCard glowColor="pink" className="relative overflow-hidden">
          <p className="text-sm font-medium text-gray-500 uppercase">System Status</p>
          <div className="mt-2">
             <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-500 border border-green-500/50 text-sm font-bold">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               ONLINE
             </span>
          </div>
        </NeonCard>
      </div>

      {/* Charts & Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Water Level */}
          <NeonCard title="Field 1 Chart (Ultrasonic)" glowColor="blue" className="h-[400px] flex flex-col">
            <div className="flex-grow w-full h-full min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                  <XAxis dataKey="time" stroke="#666" fontSize={10} tickMargin={10} minTickGap={30} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12121f', borderColor: '#333', color: '#fff' }}
                    itemStyle={{ color: '#00f3ff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="level" 
                    stroke="#00f3ff" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorLevel)" 
                    name="Field 1" 
                    isAnimationActive={false} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-gray-500">
                 No data available to plot.
               </div>
            )}
            </div>
          </NeonCard>

          {/* Chart 2: Volume */}
          <NeonCard title="Field 2 Chart (IR)" glowColor="purple" className="h-[400px] flex flex-col">
            <div className="flex-grow w-full h-full min-h-[300px]">
             {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9d00ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9d00ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                  <XAxis dataKey="time" stroke="#666" fontSize={10} tickMargin={10} minTickGap={30} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#12121f', borderColor: '#333', color: '#fff' }}
                    itemStyle={{ color: '#9d00ff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#9d00ff" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorVol)" 
                    name="Field 2"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-gray-500">
                 No data available to plot.
               </div>
             )}
            </div>
          </NeonCard>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <NeonCard title="Bluetooth Control" glowColor="blue">
             <div className="flex flex-col items-center justify-center space-y-4 py-4">
               <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${bleStatus === 'connected' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                 <Bluetooth size={32} />
               </div>
               <div className="text-center">
                 <p className="font-bold">{bleDevice ? bleDevice.name : 'No Device Selected'}</p>
                 <p className="text-sm text-gray-500 capitalize">Status: {bleStatus}</p>
               </div>
               
               {bleStatus === 'connected' ? (
                  <button 
                    onClick={handleDisconnect}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-semibold shadow-lg"
                  >
                    Disconnect
                  </button>
               ) : (
                 <button 
                    onClick={handleBluetoothScan}
                    disabled={bleStatus === 'scanning'}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                   {bleStatus === 'scanning' ? <RefreshCw className="animate-spin" size={18}/> : <Zap size={18} />}
                   {bleStatus === 'scanning' ? 'Scanning...' : 'Scan for Devices'}
                 </button>
               )}
               
               <p className="text-xs text-gray-400 text-center">
                 Requires Chrome/Edge. Ensure Bluetooth is ON.
               </p>
             </div>
          </NeonCard>

           <NeonCard title="Latest Reading" glowColor="purple">
              {latestFeed ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Timestamp</span>
                    <span className="font-mono text-sm">{new Date(latestFeed.created_at).toLocaleTimeString()}</span>
                  </div>
                   <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Entry ID</span>
                    <span className="font-mono text-sm">#{latestFeed.entry_id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-400">Field 1</span>
                    <span className="font-mono text-neon-blue">{latestFeed.field1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Field 2</span>
                    <span className="font-mono text-neon-purple">{latestFeed.field2}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">No data received yet.</div>
              )}
           </NeonCard>
        </div>
      </div>
    </div>
  );
};

export default ProjectArena;