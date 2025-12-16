import React, { useState } from 'react';

export default function DOOM() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-full bg-black flex flex-col relative overflow-hidden">
      {/* Retro CRT Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
      
      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-red-600 font-mono text-xl animate-pulse">
          INITIALIZING IDKFA...
        </div>
      )}

      {/* Embedded DOS Emulator */}
      <iframe
        src="https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Fcustom%2Fdos%2Fdoom.jsdos?anonymous=1"
        className="w-full h-full border-none focus:outline-none"
        onLoad={() => setIsLoaded(true)}
        allow="autoplay; gamepad"
        title="DOOM"
      />
      
      {/* Controls Hint */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-30">
        <span className="bg-black/50 text-white/50 text-xs px-2 py-1 rounded font-mono">
          Click inside to capture mouse • ESC to release
        </span>
      </div>
    </div>
  );
}
