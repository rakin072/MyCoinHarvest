import React from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { playSound } from '../utils/sound';

interface CoinLoadingStepProps {
  mchBalance: number;
  onAddCoins: (amount: number) => void;
  onAddMaxHalf: () => void;
}

export const CoinLoadingStep: React.FC<CoinLoadingStepProps> = ({
  mchBalance,
  onAddCoins,
  onAddMaxHalf,
}) => {
  const handleAmountClick = (amount: number) => {
    if (mchBalance < amount) return;
    playSound('coin');
    onAddCoins(amount);
  };

  const handleMaxHalfClick = () => {
    const half = Math.floor(mchBalance / 2);
    if (half <= 0) return;
    playSound('coin');
    onAddMaxHalf();
  };

  return (
    <div className="bg-[#0d111e]/90 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-lg relative overflow-hidden backdrop-blur-md">
      {/* Step Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-sm text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded-md border border-[#00f0ff]/30">
            01
          </span>
          <h2 className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
            Load MCH Coins Into Vault
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-[#00f0ff] flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Watch coin stack rise
        </span>
      </div>

      {/* 4 Action Buttons in a Single Row */}
      <div className="grid grid-cols-4 gap-2">
        {/* +25 (Cyan) */}
        <button
          onClick={() => handleAmountClick(25)}
          disabled={mchBalance < 25}
          className="relative group py-2.5 px-1 rounded-xl bg-[#13192c] hover:bg-[#00f0ff]/10 border border-[#00f0ff]/50 text-[#00f0ff] font-display font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_10px_rgba(0,240,255,0.15)] hover:shadow-glow-cyan"
        >
          <span className="relative z-10 flex items-center justify-center gap-1">
            <Coins className="w-3 h-3 opacity-75" />
            +25
          </span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-[#00f0ff]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* +100 (Purple) */}
        <button
          onClick={() => handleAmountClick(100)}
          disabled={mchBalance < 100}
          className="relative group py-2.5 px-1 rounded-xl bg-[#13192c] hover:bg-[#a855f7]/15 border border-[#a855f7]/60 text-[#a855f7] font-display font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_10px_rgba(168,85,247,0.15)] hover:shadow-glow-purple"
        >
          <span className="relative z-10 flex items-center justify-center gap-1">
            <Coins className="w-3 h-3 opacity-75" />
            +100
          </span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-[#a855f7]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* +250 (Pink) */}
        <button
          onClick={() => handleAmountClick(250)}
          disabled={mchBalance < 250}
          className="relative group py-2.5 px-1 rounded-xl bg-[#13192c] hover:bg-[#ec4899]/15 border border-[#ec4899]/60 text-[#ec4899] font-display font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_10px_rgba(236,72,153,0.15)] hover:shadow-glow-pink"
        >
          <span className="relative z-10 flex items-center justify-center gap-1">
            <Coins className="w-3 h-3 opacity-75" />
            +250
          </span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-[#ec4899]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Max Half (Gold) */}
        <button
          onClick={handleMaxHalfClick}
          disabled={mchBalance < 2}
          className="relative group py-2.5 px-1 rounded-xl bg-[#13192c] hover:bg-[#fbbf24]/15 border border-[#fbbf24]/60 text-[#fbbf24] font-display font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_10px_rgba(251,191,36,0.15)] hover:shadow-glow-gold"
        >
          <span className="relative z-10 flex items-center justify-center gap-0.5">
            Max Half
          </span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-[#fbbf24]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};
