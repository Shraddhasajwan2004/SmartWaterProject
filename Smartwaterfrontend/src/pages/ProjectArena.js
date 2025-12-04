
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Bluetooth, RefreshCw, Droplet, AlertTriangle, Clock, Activity, Zap, Settings, Volume2, CheckCircle, Gauge, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NeonCard from '../components/NeonCard';
import { fetchProxyData } from '../services/api';

const ProjectArena = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('Never');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Derived state from latest feed
  const latest = feeds.length > 0 ? feeds[feeds.length - 1] : {};

  // Metrics based on 8-Field Spec
  const metrics = {
    level: parseFloat(latest.field1 || '0'),          // F1: Level
    objectDetected: latest.field2 === '1',            // F2: Object
    distance: parseFloat(latest.field3 || '0'),       // F3: Distance
    pumpStatus: latest.field4 === '1',                // F4: Pump
    levelOk: latest.field5 === '1',                   // F5: Level OK
    storageOk: latest.field6 === '1',                 // F6: Storage OK
    buzzerStatus: latest.field7 === '1',              // F7: Buzzer
    pumpUsage: parseFloat(latest.field8 || '0')       // F8: Usage
  };

  const fetchData = async () => {
    // Only show loading spinner on initial load or manual refresh, not background interval
    if(lastUpdate === 'Never') setLoading(true);
    
    try {
      const data = await fetchProxyData(); 
      if (data && data.feeds) {
        setFeeds(data.feeds);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        // If feeds array is empty, it means channel is empty or keys are wrong
        if(data && data.feeds && data.feeds.length === 0) {
           setError("Connected, but no data found in ThingSpeak channel.");
        } else {
           setError("No data received.");
        }
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('400')) {
        setError("Configuration missing");
      } else if (msg.includes('401')) {
        setError("Unauthorized: Please Login Again");
      } else if (msg.includes('Failed to fetch')) {
        setError("Cannot connect to Backend Server.");
      } else {
        setError("Error: " + msg);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, []);

  const chartData = feeds.map(f => ({
    time: new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    f1_level: parseFloat(f.field1 || '0'),
    f2_object: f.field2 === '1' ? 1 : 0,
    f3_distance: parseFloat(f.field3 || '0'),
    f4_pump: f.field4 === '1' ? 1 : 0,
    f5_levelOk: f.field5 === '1' ? 1 : 0,
    f6_storageOk: f.field6 === '1' ? 1 : 0,
    f7_buzzer: f.field7 === '1' ? 1 : 0,
    f8_usage: parseFloat(f.field8 || '0'),
  }));

  // Helper Component for Charts
  const ChartWidget = ({ title, dataKey, color, isBinary = false, icon: Icon }) => (
    <NeonCard title={title} glowColor={color} className="flex flex-col relative min-h-[300px]">
      <div className="absolute top-5 right-5 opacity-20 z-0">
        <Icon size={32} />
      </div>
      <div className="flex-grow w-full h-[200px] text-xs z-10 mt-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {isBinary ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                <XAxis dataKey="time" stroke="#666" fontSize={10} tick={false} />
                <YAxis stroke="#666" fontSize={10} domain={[0, 1]} ticks={[0, 1]} width={20} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#12121f', borderColor: '#333', color: '#fff' }}
                  formatter={(value) => [value === 1 ? 'ON' : 'OFF', title]}
                />
                <Line type="stepAfter" dataKey={dataKey} stroke={getColorHex(color)} strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`grad${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getColorHex(color)} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={getColorHex(color)} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                <XAxis dataKey="time" stroke="#666" fontSize={10} tick={false} />
                <YAxis stroke="#666" fontSize={10} domain={['auto', 'auto']} width={30} />
                <Tooltip contentStyle={{ backgroundColor: '#12121f', borderColor: '#333', color: '#fff' }} />
                <Area type="monotone" dataKey={dataKey} stroke={getColorHex(color)} fill={`url(#grad${dataKey})`} strokeWidth={2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 italic">
            Waiting for data...
          </div>
        )}
      </div>
    </NeonCard>
  );

  const getColorHex = (name) => {
    const colors = { blue: '#00f3ff', green: '#00ff41', purple: '#9d00ff', pink: '#ff00ff', red: '#ff4444', yellow: '#ffcc00' };
    return colors[name] || '#ffffff';
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Project Arena</h1>
          <p className="text-gray-500 text-sm">8-Field Real-time Telemetry</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full flex items-center gap-2">
             <Clock size={12} /> Last: {lastUpdate}
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
        <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-6 rounded-lg flex flex-col items-center gap-4 mb-4 text-center animate-pulse">
          <AlertTriangle size={32} />
          <div>
            <h3 className="font-bold text-lg">Connection Required</h3>
            <p className="text-sm opacity-80">Link your ThingSpeak channel to see live data.</p>
          </div>
          <button 
            onClick={() => navigate('/config')}
            className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2 shadow-lg shadow-yellow-500/20"
          >
            <Settings size={18} /> Configure Connection
          </button>
        </div>
      )}

      {error && error !== "Configuration missing" && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} /> {error}
          </div>
          {error.includes("Login Again") && (
             <button
               onClick={() => navigate('/login')}
               className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-bold shadow-lg"
             >
               Login Now
             </button>
          )}
        </div>
      )}

      {/* --- SUMMARY SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* F8: Usage */}
        <NeonCard glowColor="green" className="border-l-4 border-l-neon-green">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-neon-green uppercase tracking-wider">Pump Usage (F8)</p>
              <h2 className="text-4xl font-display font-bold mt-2">{metrics.pumpUsage.toFixed(2)} <span className="text-lg text-gray-500">hr</span></h2>
            </div>
            <Clock className="text-neon-green" size={32} />
          </div>
          <p className="text-xs text-gray-400 mt-2">Accumulated Runtime</p>
        </NeonCard>

        {/* F1: Level */}
        <NeonCard glowColor="blue" className="border-l-4 border-l-neon-blue">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-neon-blue uppercase tracking-wider">Current Level (F1)</p>
              <h2 className="text-4xl font-display font-bold mt-2">{metrics.level.toFixed(1)} <span className="text-lg text-gray-500">cm</span></h2>
            </div>
            <Droplet className="text-neon-blue" size={32} />
          </div>
          <div className="mt-2 text-xs flex items-center gap-2">
             Status: 
             <span className={`${metrics.levelOk ? 'text-green-500' : 'text-red-500'} font-bold`}>
               {metrics.levelOk ? 'OPTIMAL' : 'CRITICAL'}
             </span>
          </div>
        </NeonCard>

        {/* Binary Statuses */}
        <NeonCard glowColor="purple" className="border-l-4 border-l-neon-purple">
           <p className="text-xs font-bold text-neon-purple uppercase tracking-wider mb-3">System State</p>
           <div className="space-y-2">
             <div className={`flex items-center justify-between text-sm p-1 rounded ${metrics.pumpStatus ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                <span className="flex items-center gap-2"><Zap size={14}/> Pump</span>
                <span className="font-bold">{metrics.pumpStatus ? 'ON' : 'OFF'}</span>
             </div>
             <div className={`flex items-center justify-between text-sm p-1 rounded ${metrics.buzzerStatus ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
                <span className="flex items-center gap-2"><Volume2 size={14}/> Buzzer</span>
                <span className="font-bold">{metrics.buzzerStatus ? 'ACTIVE' : 'SILENT'}</span>
             </div>
             <div className={`flex items-center justify-between text-sm p-1 rounded ${metrics.objectDetected ? 'bg-yellow-500/10 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>
                <span className="flex items-center gap-2"><Activity size={14}/> Object</span>
                <span className="font-bold">{metrics.objectDetected ? 'YES' : 'NO'}</span>
             </div>
           </div>
        </NeonCard>

        {/* Quick Link */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col justify-center items-center text-center">
          <p className="text-gray-400 text-sm mb-4">Need manual override?</p>
          <button 
            onClick={() => navigate('/bluetooth')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Bluetooth size={18} /> Open Bluetooth
          </button>
        </div>
      </div>

      {/* --- CHARTS GRID --- */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 mt-8">
        <Activity className="text-neon-blue" size={20} />
        <h3 className="text-xl font-display font-bold text-gray-200">Live Field Analysis</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Row 1 */}
        <ChartWidget title="F1: Water Level (cm)" dataKey="f1_level" color="blue" icon={Droplet} />
        <ChartWidget title="F2: Object Detected" dataKey="f2_object" color="yellow" isBinary={true} icon={Activity} />
        <ChartWidget title="F3: Distance (cm)" dataKey="f3_distance" color="purple" icon={Gauge} />
        <ChartWidget title="F4: Pump Status" dataKey="f4_pump" color="green" isBinary={true} icon={Zap} />

        {/* Row 2 */}
        <ChartWidget title="F5: Level OK" dataKey="f5_levelOk" color="blue" isBinary={true} icon={CheckCircle} />
        <ChartWidget title="F6: Storage OK" dataKey="f6_storageOk" color="purple" isBinary={true} icon={CheckCircle} />
        <ChartWidget title="F7: Buzzer Alert" dataKey="f7_buzzer" color="red" isBinary={true} icon={Volume2} />
        <ChartWidget title="F8: Pump Usage (Hr)" dataKey="f8_usage" color="green" icon={Clock} />
      </div>
    </div>
  );
};

export default ProjectArena;
