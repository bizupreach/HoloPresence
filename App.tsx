
import React, { useState, useEffect, useMemo } from 'react';
import { createXRStore } from '@react-three/xr';
import ARView from './components/ARView';
import { Info, Maximize2, Move, Camera, AlertCircle, Sparkles } from 'lucide-react';

const VIDEO_ASSET = "https://assets.forthepeople.ai/miraaus/Mira_for_Lalor.mp4";

const App: React.FC = () => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [arError, setArError] = useState<string | null>(null);

  const store = useMemo(() => createXRStore({
    hitTest: true,
  }), []);

  useEffect(() => {
    if (isLaunched) {
      const timer = setTimeout(() => setShowInstructions(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isLaunched]);

  const handleEnterAR = async () => {
    try {
      setArError(null);
      await store.enterAR();
    } catch (err: any) {
      console.error("AR session failed:", err);
      if (err.name === 'NotSupportedError' || err.message?.includes('not supported')) {
        setArError("This browser doesn't support markerless AR. Try Chrome on Android.");
      } else {
        setArError("Could not start AR. Ensure camera permissions are granted.");
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-sans">
      {!isLaunched ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-10">
          <div className="relative animate-pulse">
            <div className="absolute -inset-4 bg-blue-600/20 rounded-full blur-2xl"></div>
            <Camera size={80} className="text-blue-500 relative z-10" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-tighter italic">Mira AR</h1>
            <p className="text-neutral-400 text-lg max-w-xs mx-auto font-medium">
              Experience a life-size hologram in your physical space.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl flex items-center space-x-4">
              <Sparkles className="text-blue-400" size={24} />
              <p className="text-sm text-neutral-300 text-left">High-fidelity Chroma Keying for seamless integration.</p>
            </div>
            <button 
              onClick={() => setIsLaunched(true)}
              className="w-full py-5 font-black text-xl text-white bg-blue-600 rounded-3xl active:scale-95 transition-all shadow-2xl shadow-blue-900/40"
            >
              START EXPERIENCE
            </button>
          </div>
        </div>
      ) : (
        <>
          <ARView videoUrl={VIDEO_ASSET} store={store} />
          
          <div className="absolute bottom-10 left-0 w-full px-8 pointer-events-none z-50 flex flex-col items-center space-y-4">
             {arError && (
               <div className="bg-red-600 text-white text-xs font-bold p-4 rounded-2xl flex items-center space-x-3 shadow-2xl pointer-events-auto max-w-xs text-center">
                 <AlertCircle size={24} />
                 <span>{arError}</span>
               </div>
             )}
             
             <button 
               onClick={handleEnterAR}
               className="bg-white text-black font-black text-2xl px-16 py-6 rounded-full shadow-2xl pointer-events-auto active:scale-90 transition-all border-none"
             >
               ENTER AR
             </button>
          </div>

          {showInstructions && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40 bg-black/90 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 text-center max-w-xs shadow-2xl animate-in fade-in zoom-in duration-700">
              <Move className="text-blue-500 mx-auto mb-6 animate-bounce" size={64} />
              <h2 className="text-2xl font-black mb-2">Scan Floor</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Slowly move your device until a white ring appears. Tap to place Mira.
              </p>
            </div>
          )}

          <div className="absolute top-6 left-6 z-50 pointer-events-auto">
            <button 
              onClick={() => setIsLaunched(false)}
              className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white active:scale-90 transition-all"
            >
              <Info size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
