import React, { useState, useRef } from 'react';
import { Camera, Loader2, RefreshCw, Key, ExternalLink } from 'lucide-react';
import NeonCard from '../components/NeonCard';
import { analyzeImage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const ImageAnalysis = () => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState(null); // 'MISSING_KEY' | null
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setAnalysis('');
        setErrorType(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setLoading(true);
    setAnalysis('');
    setErrorType(null);

    // Remove Data URL prefix for API
    const base64Data = image.split(',')[1];
    const prompt = "Analyze this image in the context of water management equipment. Identify any pipes, meters, leaks, or water bodies. Assess the condition and suggest maintenance if necessary. Be concise.";
    
    const result = await analyzeImage(base64Data, prompt);
    
    if (result === 'MISSING_KEY') {
      setErrorType('MISSING_KEY');
    } else {
      setAnalysis(result);
    }
    
    setLoading(false);
  };

  const reset = () => {
    setImage(null);
    setAnalysis('');
    setErrorType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold mb-2">Visual Diagnostics</h2>
        <p className="text-gray-500">AI-Powered Image Understanding for Maintenance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <NeonCard title="Source Image" glowColor="pink" className="h-full flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 min-h-[300px] overflow-hidden relative group">
              {image ? (
                <img src={image} alt="Uploaded" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-8">
                   <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-neon-pink">
                     <Camera size={32} />
                   </div>
                   <p className="text-sm font-medium">Upload photo of equipment</p>
                   <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG</p>
                </div>
              )}
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <div className="mt-6 flex gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 border border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10 rounded-lg font-bold transition-all uppercase text-sm tracking-wide"
              >
                Select Image
              </button>
              {image && (
                <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 py-3 bg-neon-pink text-white rounded-lg font-bold shadow-[0_0_15px_rgba(255,0,255,0.4)] hover:shadow-[0_0_25px_rgba(255,0,255,0.6)] transition-all uppercase text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Analyze AI'}
                </button>
              )}
            </div>
          </NeonCard>
        </div>

        {/* Output Section */}
        <div>
          <NeonCard title="Gemini Analysis" glowColor="blue" className="h-full min-h-[400px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-neon-blue space-y-4">
                <Loader2 size={48} className="animate-spin" />
                <p className="animate-pulse">Processing visual data...</p>
              </div>
            ) : errorType === 'MISSING_KEY' ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                  <Key size={32} />
                </div>
                <h3 className="text-xl font-bold text-red-500">API Key Missing</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  This feature requires a Google Gemini API Key.
                </p>
                <div className="bg-gray-800 p-4 rounded-lg text-left text-xs text-gray-300 w-full space-y-2">
                  <p>1. Get a key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-neon-blue underline">aistudio.google.com</a></p>
                  <p>2. Add <strong>REACT_APP_API_KEY</strong> to your Netlify Environment Variables.</p>
                  <p>3. Trigger a redeploy.</p>
                </div>
                <button onClick={() => setErrorType(null)} className="text-sm text-gray-500 hover:text-white underline">
                  Dismiss
                </button>
              </div>
            ) : analysis ? (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
                <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button onClick={reset} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                    <RefreshCw size={14} /> Clear Results
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <p>Waiting for analysis...</p>
                <p className="text-xs opacity-50">Upload an image and click Analyze</p>
              </div>
            )}
          </NeonCard>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalysis;