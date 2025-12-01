import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Droplets, Activity, Cpu } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex-grow flex flex-col justify-center items-center text-center p-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple opacity-10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl space-y-8 mt-10">
        <div className="inline-block px-4 py-1.5 rounded-full border border-neon-blue/30 bg-neon-blue/10 text-neon-blue text-sm font-display tracking-widest mb-4">
          SMART WATER MANAGEMENT SYSTEM v2.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold font-display text-gray-900 dark:text-white leading-tight">
          Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">Hydrology</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Monitor water levels, usage volume, and system health in real-time. 
          Powered by IoT sensors and Gemini AI for visual diagnostics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,243,255,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Launch Dashboard <ArrowRight size={20} />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
          
          <button 
             onClick={() => navigate('/config')}
             className="px-8 py-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 font-semibold"
          >
            Configure Sensors
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left pb-10">
          <div className="p-6 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-neon-blue mb-4">
              <Droplets size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Real-time Monitoring</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Live data stream from ESP32 sensors via ThingSpeak.</p>
          </div>
          <div className="p-6 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-neon-purple mb-4">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Usage Analytics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track daily usage volume and detect anomalies instantly.</p>
          </div>
          <div className="p-6 rounded-xl bg-white/50 dark:bg-dark-card/50 border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-neon-pink mb-4">
              <Cpu size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">AI Diagnostics</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload system photos for instant AI-powered issue analysis.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;