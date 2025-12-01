
import React, { useState, useEffect } from 'react';
import { Save, Download, Copy, Check, Wifi, Key } from 'lucide-react';
import NeonCard from '../components/NeonCard';

const CodeGenerator = () => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [channelId, setChannelId] = useState('');
  const [writeApiKey, setWriteApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    // Try to load basic ThingSpeak settings first
    const generalSettings = localStorage.getItem('hydro_settings');
    if (generalSettings) {
      const { channelId } = JSON.parse(generalSettings);
      if (channelId) setChannelId(channelId);
    }

    // Try to load specific generator settings
    const generatorSettings = localStorage.getItem('hydro_code_config');
    if (generatorSettings) {
      const parsed = JSON.parse(generatorSettings);
      if (parsed.ssid) setSsid(parsed.ssid);
      if (parsed.password) setPassword(parsed.password);
      if (parsed.writeApiKey) setWriteApiKey(parsed.writeApiKey);
      if (parsed.channelId) setChannelId(parsed.channelId); // Override if specific exists
    }
  }, []);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const config = { ssid, password, channelId, writeApiKey };
    localStorage.setItem('hydro_code_config', JSON.stringify(config));
    alert("Configuration saved locally!");
  };

  const generateCode = () => {
    return `
/*
 * HydroNeon ESP32 Firmware
 * Generated for Channel ID: ${channelId || 'YOUR_CHANNEL_ID'}
 */

#include <WiFi.h>
#include "ThingSpeak.h"

// --- WI-FI CREDENTIALS ---
const char* ssid = "${ssid || 'YOUR_WIFI_SSID'}";
const char* password = "${password || 'YOUR_WIFI_PASSWORD'}";

// --- THINGSPEAK SETTINGS ---
unsigned long myChannelNumber = ${channelId || 0};
const char* myWriteAPIKey = "${writeApiKey || 'YOUR_WRITE_API_KEY'}";

WiFiClient  client;

// --- SENSOR PINS ---
const int trigPin = 5;
const int echoPin = 18;
const int irPin = 4;

void setup() {
  Serial.begin(115200);
  
  // Pin Modes
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(irPin, INPUT);

  // WiFi Connection
  WiFi.mode(WIFI_STA);
  ThingSpeak.begin(client); 
  
  connectToWifi();
}

void loop() {
  // 1. Check Network
  if(WiFi.status() != WL_CONNECTED){
    connectToWifi();
  }

  // 2. Read Sensors
  // Ultrasonic (Level)
  long duration;
  float distanceCm;
  
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  duration = pulseIn(echoPin, HIGH);
  distanceCm = duration * 0.034 / 2;
  
  // IR Sensor (Volume/Flow proxy)
  int irValue = digitalRead(irPin);
  // Inverting logic: 0 usually means obstacle/liquid detected for some IR sensors
  int flowStatus = (irValue == LOW) ? 1 : 0; 

  // 3. Debug Print
  Serial.print("Level: ");
  Serial.print(distanceCm);
  Serial.print("cm | Flow: ");
  Serial.println(flowStatus);

  // 4. Upload to ThingSpeak
  ThingSpeak.setField(1, distanceCm);
  ThingSpeak.setField(2, flowStatus);
  
  int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
  
  if(x == 200){
    Serial.println("Channel update successful.");
  } else {
    Serial.println("Problem updating channel. HTTP error code " + String(x));
  }
  
  // ThingSpeak limit: update every 15 seconds
  delay(15000);
}

void connectToWifi() {
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected.");
}
    `.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generateCode()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "HydroNeon_ESP32.ino";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold mb-2">Firmware Generator</h2>
        <p className="text-gray-500">Configure and download code for your ESP32 device</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <NeonCard title="Device Config" glowColor="purple">
            <form onSubmit={handleSaveConfig} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">WiFi SSID</label>
                <div className="relative">
                  <Wifi size={16} className="absolute left-3 top-3 text-gray-500"/>
                  <input 
                    type="text" 
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-neon-purple outline-none"
                    placeholder="Network Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">WiFi Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-3 text-gray-500"/>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-neon-purple outline-none"
                    placeholder="Network Password"
                  />
                </div>
              </div>

              <hr className="border-gray-700 my-4"/>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">ThingSpeak Channel ID</label>
                <input 
                  type="text" 
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-neon-purple outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Write API Key</label>
                <input 
                  type="password" 
                  value={writeApiKey}
                  onChange={(e) => setWriteApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-neon-purple outline-none"
                  placeholder="Found in API Keys tab"
                />
              </div>

              <button 
                type="submit" 
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Save size={16} /> Save Configuration
              </button>
            </form>
          </NeonCard>
          
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-sm text-blue-200">
            <strong>Note:</strong> We use the <em>Write API Key</em> here to send data, unlike the Dashboard which uses the <em>Read Key</em>.
          </div>
        </div>

        {/* Code Preview Panel */}
        <div className="lg:col-span-2">
          <NeonCard title="Generated Firmware (C++)" glowColor="blue" className="h-full flex flex-col">
            <div className="relative flex-grow bg-gray-900 rounded-lg p-4 font-mono text-xs md:text-sm text-gray-300 overflow-auto max-h-[600px] border border-gray-800 shadow-inner">
              <pre className="whitespace-pre-wrap break-all">
                {generateCode()}
              </pre>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button 
                onClick={handleCopy}
                className="flex-1 py-3 border border-neon-blue text-neon-blue hover:bg-neon-blue/10 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              
              <button 
                onClick={handleDownload}
                className="flex-1 py-3 bg-neon-blue text-black rounded-lg font-bold shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} /> Download .ino
              </button>
            </div>
          </NeonCard>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
