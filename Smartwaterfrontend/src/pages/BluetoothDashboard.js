
import React, { useState, useEffect, useRef } from 'react';
import { Bluetooth, Send, Terminal, Zap, XCircle } from 'lucide-react';
import NeonCard from '../components/NeonCard';

const BluetoothDashboard = () => {
  const [device, setDevice] = useState(null);
  const [characteristic, setCharacteristic] = useState(null);
  const [status, setStatus] = useState('Disconnected');
  const [logs, setLogs] = useState([]);
  const [inputCmd, setInputCmd] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!navigator.bluetooth) {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time: timestamp, msg, type }]);
  };

  const connectBluetooth = async () => {
    try {
      setStatus('Scanning...');
      addLog('Requesting Bluetooth Device...', 'system');
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] // Nordic UART Service commonly used with ESP32
      });

      setDevice(device);
      addLog(`Connecting to ${device.name}...`, 'system');
      
      const server = await device.gatt.connect();
      // We don't store 'server' in state as it's not used for rendering, preventing unused var warnings
      setStatus('Connected');
      addLog('Connected to GATT Server', 'success');

      // Attempt to find a service - Generic scan if specific UUID fails
      const services = await server.getPrimaryServices();
      if(services.length > 0) {
        addLog(`Found ${services.length} services`, 'info');
        const service = services[0]; // Grab first service for demo
        
        const characteristics = await service.getCharacteristics();
        if(characteristics.length > 0) {
            const char = characteristics[0]; // Grab first char for write/notify
            setCharacteristic(char);
            addLog(`Bound to characteristic: ${char.uuid}`, 'success');
            
            // Try to start notifications
            try {
                await char.startNotifications();
                char.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
                addLog('Notifications started', 'success');
            } catch(e) {
                addLog('Could not start notifications (Read-only?)', 'warning');
            }
        }
      }

    } catch (error) {
      console.error(error);
      setStatus('Error');
      addLog(`Connection failed: ${error.message}`, 'error');
    }
  };

  const handleCharacteristicValueChanged = (event) => {
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    const str = decoder.decode(value);
    addLog(`RX: ${str}`, 'rx');
  };

  const disconnect = () => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
    setCharacteristic(null);
    setStatus('Disconnected');
    addLog('Disconnected', 'system');
  };

  const sendCommand = async (cmd) => {
    if (!characteristic) {
      addLog('Not connected to write characteristic', 'error');
      return;
    }
    try {
      const encoder = new TextEncoder();
      await characteristic.writeValue(encoder.encode(cmd));
      addLog(`TX: ${cmd}`, 'tx');
      setInputCmd('');
    } catch (error) {
      addLog(`Send failed: ${error.message}`, 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(inputCmd) sendCommand(inputCmd);
  };

  if (!isSupported) {
    return (
      <div className="p-10 text-center text-red-500">
        <h2 className="text-2xl font-bold">Web Bluetooth Not Supported</h2>
        <p>Please use Google Chrome, Edge, or Bluefy (iOS).</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-display font-bold">Bluetooth Control</h1>
           <p className="text-gray-500">Direct ESP32 Link</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold border ${status === 'Connected' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-gray-200 dark:bg-gray-800 border-gray-400 text-gray-500'}`}>
            {status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="space-y-6">
           <NeonCard title="Connection" glowColor="blue">
              <div className="flex flex-col gap-4">
                 {!device ? (
                    <button 
                        onClick={connectBluetooth}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <Bluetooth size={24} /> Scan & Connect
                    </button>
                 ) : (
                    <button 
                        onClick={disconnect}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <XCircle size={24} /> Disconnect
                    </button>
                 )}
                 <p className="text-xs text-gray-400 text-center">
                    Uses Generic UART Service. Ensure your ESP32 code supports standard BLE UART.
                 </p>
              </div>
           </NeonCard>

           <NeonCard title="Quick Actions" glowColor="purple">
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => sendCommand('PUMP_ON')} className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg hover:bg-green-500/20 font-mono text-sm">PUMP_ON</button>
                 <button onClick={() => sendCommand('PUMP_OFF')} className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 font-mono text-sm">PUMP_OFF</button>
                 <button onClick={() => sendCommand('BUZZER_ON')} className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-lg hover:bg-yellow-500/20 font-mono text-sm">BUZZ_ON</button>
                 <button onClick={() => sendCommand('RESET')} className="p-3 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-lg hover:bg-blue-500/20 font-mono text-sm">RESET_SYS</button>
              </div>
           </NeonCard>
        </div>

        {/* Terminal Column */}
        <div className="lg:col-span-2">
            <NeonCard title="Serial Terminal" glowColor="green" className="h-[600px] flex flex-col">
                <div className="flex-grow bg-black rounded-lg p-4 font-mono text-sm overflow-auto mb-4 border border-gray-800 shadow-inner custom-scrollbar">
                    {logs.length === 0 && <span className="text-gray-600 italic">Waiting for connection...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className={`mb-1 ${
                            log.type === 'tx' ? 'text-yellow-400' :
                            log.type === 'rx' ? 'text-green-400' :
                            log.type === 'error' ? 'text-red-400' :
                            log.type === 'system' ? 'text-blue-400' : 'text-gray-300'
                        }`}>
                            <span className="opacity-30 mr-2">[{log.time}]</span>
                            {log.type === 'tx' && '> '}
                            {log.type === 'rx' && '< '}
                            {log.msg}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="relative flex-grow">
                        <Terminal size={18} className="absolute left-3 top-3 text-gray-500" />
                        <input 
                            type="text" 
                            value={inputCmd}
                            onChange={(e) => setInputCmd(e.target.value)}
                            placeholder="Enter command (e.g., SET_LEVEL=50)"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-green outline-none font-mono"
                            disabled={!characteristic}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!characteristic}
                        className="px-6 bg-neon-green text-black font-bold rounded-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </NeonCard>
        </div>
      </div>
    </div>
  );
};

export default BluetoothDashboard;
