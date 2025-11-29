import React, { useState } from 'react';

const DEFAULT_SERVICE = '0000ffe0-0000-1000-8000-00805f9b34fb'; // example, change to your service
const DEFAULT_CHAR = '0000ffe1-0000-1000-8000-00805f9b34fb';

export default function BluetoothReader() {
  const [status, setStatus] = useState('idle');
  const [deviceName, setDeviceName] = useState(null);
  const [bleData, setBleData] = useState(null);
  const [serverRef, setServerRef] = useState(null);

  const connect = async () => {
    try {
      setStatus('requesting');
      const opts = {
        filters: [{ namePrefix: 'ESP' }], // ESP32 BLE device name prefix; adjust as needed
        optionalServices: [DEFAULT_SERVICE]
      };
      const device = await navigator.bluetooth.requestDevice(opts);
      setDeviceName(device.name || device.id);
      setStatus('connecting');
      const server = await device.gatt.connect();
      setServerRef(server);
      const service = await server.getPrimaryService(DEFAULT_SERVICE);
      const char = await service.getCharacteristic(DEFAULT_CHAR);
      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', e => {
        const value = new TextDecoder().decode(e.target.value);
        setBleData(value);
      });
      setStatus('connected');
      device.ongattserverdisconnected = () => {
        setStatus('disconnected');
      };
    } catch (err) {
      console.error('BLE error', err);
      setStatus('error');
    }
  };

  const disconnect = async () => {
    try {
      if (serverRef && serverRef.connected) {
        serverRef.disconnect();
      }
    } catch (err) {
      console.warn('disconnect err', err);
    } finally {
      setStatus('idle');
      setDeviceName(null);
      setBleData(null);
    }
  };

  return (
    <div className="card">
      <h2>Bluetooth (optional)</h2>
      <div>
        <strong>Status:</strong> {status}
      </div>
      <div>
        <button onClick={connect} disabled={status === 'connecting' || status === 'connected'}>
          Connect BLE
        </button>
        <button onClick={disconnect} disabled={status !== 'connected'}>
          Disconnect
        </button>
      </div>
      <div>
        <strong>Device:</strong> {deviceName ?? '—'}
      </div>
      <div>
        <strong>Last BLE data:</strong>
        <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{bleData ?? '—'}</pre>
      </div>
      <p className="muted">Note: This is optional — using ThingSpeak HTTP push is recommended for persistence.</p>
    </div>
  );
}
