import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  isMockup: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, isMockup }) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  if (!isMockup) {
    // Normal full screen responsive view
    return <div className="w-full h-full flex flex-col bg-neutral-950 text-white">{children}</div>;
  }

  // Realistic Mobile Phone Frame (e.g. iPhone / Modern Smartphone)
  return (
    <div className="w-full min-h-screen bg-neutral-950 flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none">
      {/* Outer Phone Shell */}
      <div className="relative w-full max-w-[420px] h-[92vh] max-h-[860px] bg-black rounded-[48px] p-3 shadow-2xl ring-1 ring-neutral-800 shadow-emerald-950/20 flex flex-col border-[3px] border-neutral-700/80">
        
        {/* Dynamic Island / Speaker notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-neutral-900 rounded-full z-50 flex items-center justify-center border border-neutral-800 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 mr-2 border border-neutral-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-blue-950/80 border border-blue-900/50" />
        </div>

        {/* Mobile Status Bar */}
        <div className="h-7 w-full px-7 flex items-center justify-between text-[11px] font-semibold text-neutral-300 z-40 bg-neutral-950 rounded-t-[40px] pt-1">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-neutral-300" />
            <Wifi className="w-3 h-3 text-neutral-300" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 w-full overflow-hidden rounded-[38px] bg-neutral-950 flex flex-col relative border border-neutral-800/40">
          {children}
        </div>

        {/* Home Bar Indicator */}
        <div className="h-4 w-full flex items-center justify-center bg-neutral-950 rounded-b-[40px] pt-1">
          <div className="w-32 h-1 bg-neutral-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
