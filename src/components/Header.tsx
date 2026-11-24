import React from 'react';
import { HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { MchEmblem } from './MchEmblem';
import { playSound } from '../utils/sound';
import { triggerHaptic } from '../utils/telegram';

interface HeaderProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
  customImageSrc?: string | null;
  soundOn: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
  telegramUsername?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  walletAddress,
  onConnectWallet,
  customImageSrc = null,
  soundOn,
  onToggleSound,
  onOpenHelp,
  telegramUsername,
}) => {
  const handleWalletClick = () => {
    playSound('tap');
    triggerHaptic('light');
    onConnectWallet();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0b14]/92 backdrop-blur-md border-b border-white/10 px-3 py-2.5 transition-colors">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* Left: Avatar + Title + Subtitle */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Circular avatar with neon cyan-to-pink gradient border */}
          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ec4899] shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.35)]">
            <MchEmblem size={32} showGoldRing={false} glow={false} customImageSrc={customImageSrc} />
          </div>

          <div className="leading-tight min-w-0">
            <h1 className="font-display font-extrabold text-[15px] tracking-tight bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent truncate">
              MyCoinHarvest
            </h1>
            <p className="text-[10.5px] text-slate-400 font-medium truncate">
              {telegramUsername ? `${telegramUsername} • Treasure Tag` : 'mycoinharvest.com • MCH'}
            </p>
          </div>
        </div>

        {/* Right: Sound, Help & Connect Wallet */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onToggleSound();
            }}
            className="w-8 h-8 rounded-full bg-[#13192c] border border-white/10 hover:border-[#00f0ff]/40 text-slate-300 hover:text-[#00f0ff] flex items-center justify-center transition active:scale-95"
            aria-label={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
            title={soundOn ? 'Mute sound' : 'Unmute sound'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#00f0ff]" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('tap');
              triggerHaptic('light');
              onOpenHelp();
            }}
            className="w-8 h-8 rounded-full bg-[#13192c] border border-white/10 hover:border-[#00f0ff]/40 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95"
            aria-label="How to play and settings"
            title="How to Play & Settings"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleWalletClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#0e2d3a]/70 hover:bg-[#0e2d3a] border border-[#00f0ff]/40 hover:border-[#00f0ff] text-white text-[11px] font-bold transition-all active:scale-95 shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
          >
            {walletAddress ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_6px_#00f0ff]" />
                <span className="font-mono text-[10.5px]">{walletAddress}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse shadow-[0_0_6px_#f97316]" />
                <span className="text-slate-200">Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
