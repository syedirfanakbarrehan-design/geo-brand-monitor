import React, { useState } from 'react';
import { Gamepad2, Maximize2, Minimize2, ChevronDown, ChevronUp, Sparkles, Trophy } from 'lucide-react';

interface GeoDriveEmbedWidgetProps {
  onUnlockAudit?: () => void;
  className?: string;
}

export const GeoDriveEmbedWidget: React.FC<GeoDriveEmbedWidgetProps> = ({
  onUnlockAudit,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all duration-300 ${className} ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : ''
      }`}
    >
      {/* Widget Header / Compact Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-3.5 sm:p-4 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Geo-Drive 3D Courier</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                Interactive Mini-Game
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Deliver AI search prompts in the 3D open-world city to unlock free brand audit passes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {onUnlockAudit && (
            <button
              onClick={onUnlockAudit}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/60 hover:bg-indigo-600 text-indigo-100 hover:text-white border border-indigo-400/40 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Claim Free Audit</span>
            </button>
          )}

          {isOpen && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={toggleOpen}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isOpen ? 'Collapse Game' : 'Play Inside Dashboard'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Embed Frame (Expanded State) */}
      {isOpen && (
        <div className={`relative bg-slate-950 ${isFullscreen ? 'flex-1 w-full' : 'h-[460px] sm:h-[520px] w-full'}`}>
          <iframe
            src="/geo-drive.html"
            title="Geo-Drive 3D Embedded Mini-Game"
            className="w-full h-full border-0"
            allow="accelerometer; gyroscope;"
          />

          {/* Quick return pill when in fullscreen */}
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-30 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg border border-slate-700 shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Fullscreen</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
