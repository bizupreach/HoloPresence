
import React, { useState, useEffect, useMemo } from 'react';
import { createXRStore } from '@react-three/xr';
import ARView from './components/ARView';
import { Info, Maximize2, Move, Camera, AlertCircle, ExternalLink } from 'lucide-react';

const VIDEO_ASSET = "https://assets.forthepeople.ai/miraaus/Mira_for_Lalor.mp4";

const App: React.FC = () => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [arError, setArError] = useState<string | null>(null);

  // Initialize XR Store for @react-three/xr v6
  const store = useMemo(() => createXRStore({
    hitTest: true,
  }), []);

  // Auto-hide instructions after launch
  useEffect(() => {
    if (isLaunched) {
      const timer = setTimeout(() => setShowInstructions(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isLaunched]);

  const handleEnterAR = async () => {
    try {
      setArError(null);
      await store.enterAR();
    } catch (err: any) {
      console.error("AR session failed:", err);
      // Detailed error for common WebXR failures
      if (err.name === 'NotSupportedError' || err.message?.includes('not supported')) {
        setArError("Markerless AR (Hit Test) is not supported on this browser. Try Chrome on Android.");
      } else if (err.name === 'SecurityError') {
        setArError("AR was blocked. Please ensure you're on HTTPS and have granted camera permissions.");
      } else {
        setArError("Could not start AR session. This device might not support markerless WebAR.");
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-neutral-950 text-white overflow-hidden font-sans">
      {!isLaunched ? (
        // Landing Screen
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 animate-in fade-in duration-700">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-75"></div>
            <div className="relative bg-black rounded-full p-6">
              <Camera size={64} className="text-blue-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              HoloPresence
            </h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Professional Life-Size AR Avatars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg text-left">
            <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-2xl flex items-start space-x-3">
              <Move className="text-blue-500 shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-sm text-white">Surface Placement</h3>
                <p className="text-xs text-neutral-500">Detect floors and tables in real-time.</p>
              </div>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 p-4 rounded-2xl flex items-start space-x-3">
              <Maximize2 className="text-cyan-500 shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-sm text-white">Scale Accuracy</h3>
                <p className="text-xs text-neutral-500">Realistic 1:1 human height rendering.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsLaunched(true)}
            className="group relative inline-flex items-center justify-center px-12 py-4 font-bold text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-500 active:scale-95 shadow-xl shadow-blue-900/40"
          >
            Launch Experience
          </button>
          
          <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-neutral-600">
            <span>Requires WebXR Support</span>
            <ExternalLink size={10} />
          </div>
        </div>
      ) : (
        // AR Mode UI
        <>
          <ARView videoUrl={VIDEO_ASSET} store={store} />
          
          {/* Main AR Control Button */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-4 w-full px-6 pointer-events-none">
             {arError && (
               <div className="bg-red-500/95 text-white text-xs p-4 rounded-2xl flex items-center space-x-3 max-w-xs animate-in slide-in-from-bottom-4 shadow-2xl pointer-events-auto">
                 <AlertCircle size={20} className="shrink-0" />
                 <span className="font-medium">{arError}</span>
               </div>
             )}
             
             <button 
               onClick={handleEnterAR}
               className="bg-white text-black font-black text-xl px-14 py-6 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-none active:scale-95 transition-all hover:bg-neutral-100 pointer-events-auto"
             >
               ENTER AR
             </button>
          </div>

          {/* Instructions Overlay */}
          {showInstructions && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 bg-black/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 text-center max-w-sm animate-in fade-in zoom-in duration-700 shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-500/30 p-6 rounded-full">
                  <Move className="text-blue-400 animate-pulse" size={64} />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Detecting Surface</h2>
              <p className="text-sm text-gray-300 leading-relaxed px-2">
                Scan your environment by moving your device. Once a white ring appears on the floor, tap the screen to anchor the hologram.
              </p>
            </div>
          )}

          {/* Top Bar Controls */}
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-50">
            <button 
              onClick={() => setIsLaunched(false)}
              className="p-3 bg-black/50 backdrop-blur-xl rounded-full border border-white/20 text-white pointer-events-auto active:scale-90 transition-transform shadow-xl"
            >
              <Info size={24} />
            </button>
            
            <div className="bg-black/50 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/20 text-[11px] font-bold tracking-tight text-blue-400 flex items-center space-x-2 shadow-xl">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              <span>WEBXR_V6_ACTIVE</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
