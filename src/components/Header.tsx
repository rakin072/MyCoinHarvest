import React from 'react';
import { MchEmblem } from './MchEmblem';
import { playSound } from '../utils/sound';

interface HeaderProps {
  walletAddress: string | null;
  onConnectWallet: () => void;
  customImageSrc?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  walletAddress,
  onConnectWallet,
  customImageSrc = null,
}) => {
  const handleWalletClick = () => {
    playSound('tap');
    onConnectWallet();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0b14]/90 backdrop-blur-md border-b border-white/10 px-3.5 py-3 transition-colors">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* Left: Avatar + Title + Subtitle */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Circular avatar with neon cyan-to-pink gradient border */}
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ec4899] shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.35)]">
            <MchEmblem size={36} showGoldRing={false} glow={false} customImageSrc={customImageSrc} />
          </div>

          <div className="leading-tight min-w-0">
            <h1 className="font-display font-extrabold text-base tracking-tight bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent truncate">
              MyCoinHarvest
            </h1>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              mycoinharvest.com • Treasure T...
            </p>
          </div>
        </div>

        {/* Right: Pill button "Connect Wallet" with glowing orange status dot inside a dark teal border */}
        <button
          onClick={handleWalletClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0e2d3a]/70 hover:bg-[#0e2d3a] border border-[#00f0ff]/40 hover:border-[#00f0ff] text-white text-xs font-bold transition-all active:scale-95 shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
        >
          {walletAddress ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_6px_#00f0ff]" />
              <span className="font-mono text-[11px]">{walletAddress}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse shadow-[0_0_6px_#f97316]" />
              <span className="text-slate-200">Connect Wallet</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
