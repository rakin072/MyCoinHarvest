import React from 'react';
import { playSound } from '../utils/sound';

interface ModeTabsProps {
  activeTab: 'hide' | 'raid';
  onTabChange: (tab: 'hide' | 'raid') => void;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const handleTab = (tab: 'hide' | 'raid') => {
    playSound('tap');
    onTabChange(tab);
  };

  return (
    <div className="grid grid-cols-2 gap-2 p-1 bg-[#0d111e]/80 border border-white/10 rounded-2xl max-w-md mx-auto shadow-inner">
      {/* Tab 1: 🔒 Hide & Tag Friend */}
      <button
        type="button"
        onClick={() => handleTab('hide')}
        className={`py-2.5 px-2 rounded-xl font-display font-extrabold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 ${
          activeTab === 'hide'
            ? 'bg-gradient-to-r from-[#00f0ff]/20 via-[#a855f7]/20 to-[#ec4899]/20 border border-[#00f0ff]/60 text-white shadow-glow-cyan'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
      >
        <span>🔒</span>
        <span>Hide & Tag Friend</span>
      </button>

      {/* Tab 2: 📡 Raid Friend's Stash */}
      <button
        type="button"
        onClick={() => handleTab('raid')}
        className={`py-2.5 px-2 rounded-xl font-display font-extrabold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 ${
          activeTab === 'raid'
            ? 'bg-gradient-to-r from-[#ec4899]/25 via-[#a855f7]/25 to-[#00f0ff]/25 border border-[#ec4899]/60 text-white shadow-glow-pink'
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
      >
        <span>📡</span>
        <span>Raid Friend's Stash</span>
      </button>
    </div>
  );
};
