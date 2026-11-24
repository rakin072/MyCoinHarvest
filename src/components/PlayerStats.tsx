import React from 'react';
import { Gift, Sparkles, Zap } from 'lucide-react';
import { playSound } from '../utils/sound';
import { triggerHaptic } from '../utils/telegram';

interface PlayerStatsProps {
  mchBalance: number;
  streak: number;
  stashedBounty: number;
  onOpenStore: (tab?: 'probes' | 'coins') => void;
  onClaimFreeCoins: () => void;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({
  mchBalance,
  streak,
  stashedBounty,
  onOpenStore,
  onClaimFreeCoins,
}) => {
  const rankLabel =
    mchBalance >= 5000 || streak >= 10
      ? 'Apex Hunter'
      : mchBalance >= 1500 || streak >= 5
      ? 'Shadow Raider'
      : 'Scout Rank';

  const handleStoreClick = () => {
    playSound('tap');
    triggerHaptic('light');
    onOpenStore('probes');
  };

  return (
    <div className="space-y-2 max-w-md mx-auto">
      {/* 2 Side-by-Side Rounded Dark Cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* Left Card: MCH Balance */}
        <div className="bg-[#0d111e]/90 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400">
            MCH Coins
          </span>
          <span className="font-display font-extrabold text-sm text-[#fbbf24] drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">
            {mchBalance.toLocaleString()} MCH
          </span>
        </div>

        {/* Right Card: Dynamic Rank & Streak */}
        <div className="bg-[#0d111e]/90 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between gap-1 shadow-sm">
          <span className="text-[11px] font-bold text-[#00f0ff] truncate">
            {rankLabel}
          </span>
          <span className="font-display font-extrabold text-xs sm:text-[13px] text-[#fb923c] drop-shadow-[0_0_6px_rgba(251,146,60,0.3)] shrink-0">
            🔥 {streak}x Streak
          </span>
        </div>
      </div>

      {/* Free Emergency Harvest when balance & stash are low */}
      {mchBalance < 25 && stashedBounty === 0 && (
        <button
          type="button"
          onClick={() => {
            playSound('win');
            triggerHaptic('success');
            onClaimFreeCoins();
          }}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#22c55e]/20 to-[#00f0ff]/20 border border-[#22c55e]/60 text-xs font-display font-bold text-white flex items-center justify-center gap-2 transition active:scale-[0.98] shadow-[0_0_12px_rgba(34,197,94,0.2)]"
        >
          <Gift className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>Claim Free Harvest (+200 MCH Starter Drop)</span>
        </button>
      )}

      {/* Trigger 1: Glowing "+ Buy Plays / Coins" Pill Button */}
      <button
        type="button"
        onClick={handleStoreClick}
        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#fbbf24]/20 via-[#00f0ff]/20 to-[#ec4899]/20 hover:from-[#fbbf24]/30 hover:to-[#ec4899]/30 border border-[#fbbf24]/60 text-xs font-display font-bold text-white shadow-[0_0_14px_rgba(251,191,36,0.25)] flex items-center justify-center gap-2 transition active:scale-[0.98] relative overflow-hidden"
      >
        <Zap className="w-3.5 h-3.5 text-[#fbbf24]" />
        <span>+ Buy Plays / Coins</span>
        <span className="text-[10px] bg-black/60 text-[#fbbf24] px-2 py-0.5 rounded-full border border-[#fbbf24]/40 font-mono font-medium flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          Cards • Stars • Apple Pay
        </span>
      </button>
    </div>
  );
};
