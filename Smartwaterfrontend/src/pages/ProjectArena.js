
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { RefreshCw, Droplet, AlertTriangle, Clock, Zap, Activity, Volume2, CheckCircle, Gauge } from 'lucide-react';
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

  // Metrics for Header Cards
  const metrics = {
    waterLevel: parseFloat(latest.field1 || '0'),       // Field 1
    pumpUsage: parseFloat(latest.field8 || '0'),        // Field 8 (Summary)
    pumpStatus: latest.field4 === '1',                  // Field 4
    buzzerStatus: latest.field7 === '1'                 // Field 7
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchProxyData(); 
      if (data && data.feeds) {
        setFeeds(data.feeds);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } else {
        setError("Failed to fetch data.");
      }
    } catch (err) {
      if (err.message && err.message.includes('400')) {
        setError("Configuration missing");
      } else {
        setError("Failed to connect to server.");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, []);

  // Map ALL 8 Fields for Charts
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
    <NeonCard title={title} glowColor={color} className="h-[250px] flex flex-col relative">
      <div className="absolute top-4 right-4 opacity-20">
        <Icon size={24} />
      </div>
      <div className="flex-grow w-full h-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          {isBinary ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
              <XAxis dataKey="time" stroke="#666" fontSize={10} hide />
              <YAxis stroke="#666" fontSize={10} domain={[0, 1]} ticks={[0, 1]} />
              <Tooltip contentStyle={{ backgroundColor: '#12121f', borderColor: '#333', color: '#fff' }} />
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
              <XAxis dataKey="time" stroke="#666" fontSize={10} hide />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#12121f', borderColor: '#333', color: '#fff' }} />
              <Area type="monotone" dataKey={dataKey} stroke={getColorHex(color)} fill={`url(#grad${dataKey})`} strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </NeonCard>
  );

  const getColorHex = (name) => {
    const colors = { blue: '#00f3ff', green: '#00ff41', purple: '#9d00ff', pink: '#ff00ff', red: '#ff4444', yellow: '#ffcc00' };
    return colors[name] || '#ffffff';
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Project Arena</h1>
          <p className="text-gray-500 text-sm">8-Field Real-time Telemetry</p>
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {/* SUMMARY CARDS (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Field 8 Special Summary */}
        <NeonCard glowColor="green" className="border-2 border-neon-green/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-neon-green uppercase tracking-wider">Pump Usage (Summary)</p>
              <h2 className="text-4xl font-display font-bold mt-2">{metrics.pumpUsage.toFixed(2)} <span className="text-lg text-gray-500">hrs</span></h2>
            </div>
            <Zap className="text-neon-green animate-pulse" size={32} />
          </div>
          <p className="text-xs text-gray-400 mt-2">Total runtime accumulated</p>
        </NeonCard>

        {/* Level Summary */}
        <NeonCard glowColor="blue">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-neon-blue uppercase tracking-wider">Current Level</p>
              <h2 className="text-4xl font-display font-bold mt-2">{metrics.waterLevel.toFixed(1)} <span className="text-lg text-gray-500">cm</span></h2>
            </div>
            <Droplet className="text-neon-blue" size={32} />
          </div>
        </NeonCard>

        {/* Binary Statuses */}
        <NeonCard glowColor="purple">
           <p className="text-xs font-bold text-neon-purple uppercase tracking-wider mb-3">Active Alerts</p>
           <div className="space-y-2">
             <div className={`flex items-center gap-2 text-sm ${metrics.pumpStatus ? 'text-green-400' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${metrics.pumpStatus ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></div>
                Pump Status: {metrics.pumpStatus ? 'ON' : 'OFF'}
             </div>
             <div className={`flex items-center gap-2 text-sm ${metrics.buzzerStatus ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${metrics.buzzerStatus ? 'bg-red-400 animate-ping' : 'bg-gray-600'}`}></div>
                Buzzer: {metrics.buzzerStatus ? 'RINGING' : 'SILENT'}
             </div>
           </div>
        </NeonCard>

        {/* Quick Link */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col justify-center">
          <button 
            onClick={() => navigate('/bluetooth')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Zap size={18} /> Direct Bluetooth Control
          </button>
        </div>
      </div>

      {/* 8 CHARTS GRID */}
      <h3 className="text-xl font-display font-bold text-gray-300 border-b border-gray-700 pb-2 mt-8">Live Field Analysis (Fields 1-8)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Field 1: Water Level */}
        <ChartWidget 
          title="F1: Water Level (cm)" 
          dataKey="f1_level" 
          color="blue" 
          icon={Droplet} 
        />

        {/* Field 2: Object Detected (Binary) */}
        <ChartWidget 
          title="F2: Object Detected" 
          dataKey="f2_object" 
          color="yellow" 
          isBinary={true} 
          icon={Activity} 
        />

        {/* Field 3: Object Distance */}
        <ChartWidget 
          title="F3: Obj. Distance (cm)" 
          dataKey="f3_distance" 
          color="purple" 
          icon={Gauge} 
        />

        {/* Field 4: Pump On (Binary) */}
        <ChartWidget 
          title="F4: Pump Status" 
          dataKey="f4_pump" 
          color="green" 
          isBinary={true} 
          icon={Zap} 
        />

        {/* Field 5: Water Level OK (Binary) */}
        <ChartWidget 
          title="F5: Water Level OK" 
          dataKey="f5_levelOk" 
          color="blue" 
          isBinary={true} 
          icon={CheckCircle} 
        />

        {/* Field 6: Storage Level OK (Binary) */}
        <ChartWidget 
          title="F6: Storage OK" 
          dataKey="f6_storageOk" 
          color="purple" 
          isBinary={true} 
          icon={CheckCircle} 
        />

        {/* Field 7: Buzzer On (Binary) */}
        <ChartWidget 
          title="F7: Buzzer Alert" 
          dataKey="f7_buzzer" 
          color="red" 
          isBinary={true} 
          icon={Volume2} 
        />

        {/* Field 8: Pump Usage */}
        <ChartWidget 
          title="F8: Pump Usage (Hr)" 
          dataKey="f8_usage" 
          color="green" 
          icon={Clock} 
        />
      </div>
    </div>
  );
};

export default ProjectArena;
