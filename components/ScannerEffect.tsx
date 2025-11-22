import React from 'react';

export const ScannerEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
      <div className="w-full h-1 bg-neon-green absolute top-0 animate-scan shadow-[0_0_15px_rgba(0,255,65,0.8)]"></div>
      <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
    </div>
  );
};