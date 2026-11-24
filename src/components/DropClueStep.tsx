import React from 'react';
import { PRESET_RIDDLES, SQUAD_FRIENDS } from '../data/constants';
import { playSound } from '../utils/sound';
import { triggerHaptic } from '../utils/telegram';
import { Send, Sparkles, X, Coins } from 'lucide-react';

interface DropClueStepProps {
  clue: string;
  onClueChange: (val: string) => void;
  selectedFriend: string;
  onSelectFriend: (handle: string) => void;
  customFriend: string;
  onCustomFriendChange: (val: string) => void;
  stashedBounty: number;
  mchBalance: number;
  onQuickLoad: (amount: number) => void;
  onLockAndTag: () => void;
}

export const DropClueStep: React.FC<DropClueStepProps> = ({
  clue,
  onClueChange,
  selectedFriend,
  onSelectFriend,
  customFriend,
  onCustomFriendChange,
  stashedBounty,
  mchBalance,
  onQuickLoad,
  onLockAndTag,
}) => {
  const effectiveFriend = customFriend.trim()
    ? customFriend.startsWith('@')
      ? customFriend
      : `@${customFriend}`
    : selectedFriend;

  const handlePresetClick = (preset: string) => {
    playSound('tap');
    triggerHaptic('selection');
    onClueChange(preset);
  };

  const handleChipClick = (handle: string) => {
    playSound('tap');
    triggerHaptic('selection');
    onSelectFriend(handle);
    onCustomFriendChange('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s+/g, '');
    onCustomFriendChange(val);
    if (val.trim()) {
      onSelectFriend(val.startsWith('@') ? val : `@${val}`);
    } else {
      onSelectFriend('@Alex');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stashedBounty <= 0) return;
    triggerHaptic('success');
    onLockAndTag();
  };

  return (
    <div className="bg-[#0d111e]/90 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-lg backdrop-blur-md">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-sm text-[#ec4899] bg-[#ec4899]/10 px-2 py-0.5 rounded-md border border-[#ec4899]/30">
            03
          </span>
          <h2 className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
            Drop Clue & Tag Friend
          </h2>
        </div>
        <span className="text-xs font-medium text-slate-400">1-line riddle</span>
      </div>

      {/* 3 Clickable Preset Riddle Pills */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_RIDDLES.map((riddle, idx) => {
          const isActive = clue === riddle;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetClick(riddle)}
              className={`text-[11px] px-2.5 py-1.5 rounded-full border transition-all duration-150 active:scale-95 text-left ${
                isActive
                  ? 'bg-[#ec4899]/15 border-[#ec4899] text-white shadow-[0_0_8px_rgba(236,72,153,0.3)]'
                  : 'bg-[#13192c] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
              }`}
            >
              &ldquo;{riddle}&rdquo;
            </button>
          );
        })}
      </div>

      {/* Custom Text Input Field */}
      <div className="relative">
        <input
          type="text"
          maxLength={90}
          value={clue}
          onChange={(e) => onClueChange(e.target.value)}
          placeholder="Enter a 1-line riddle for your friend..."
          className="w-full bg-[#080b16] border border-white/15 focus:border-[#ec4899] focus:shadow-[0_0_12px_rgba(236,72,153,0.25)] rounded-xl pl-3.5 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
        />
        {clue ? (
          <button
            type="button"
            onClick={() => onClueChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
            aria-label="Clear riddle"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-[#ec4899]/70" />
          </div>
        )}
      </div>

      {/* Quick-Tag Friend Chips */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
          <span>Squad Quick-Tag:</span>
          <span className="text-[#00f0ff] font-bold">{effectiveFriend}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {SQUAD_FRIENDS.map((f) => {
            const isChipSelected =
              !customFriend.trim() && selectedFriend.toLowerCase() === f.handle.toLowerCase();
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleChipClick(f.handle)}
                className={`py-2 px-1 rounded-xl border text-xs font-display font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                  isChipSelected
                    ? 'bg-[#0e2d3a] border-[#00f0ff] text-white shadow-glow-cyan'
                    : 'bg-[#13192c] border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                }`}
              >
                <span>{f.avatar}</span>
                <span className="truncate">{f.handle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Username Input Field */}
      <div className="relative">
        <input
          type="text"
          maxLength={32}
          value={customFriend}
          onChange={handleCustomChange}
          placeholder="@ Or enter any Telegram @username"
          className="w-full bg-[#080b16] border border-white/15 focus:border-[#00f0ff] focus:shadow-[0_0_12px_rgba(0,240,255,0.25)] rounded-xl pl-3.5 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
        />
        {customFriend && (
          <button
            type="button"
            onClick={() => {
              onCustomFriendChange('');
              onSelectFriend('@Alex');
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
            aria-label="Clear custom username"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Load helper when vault is empty */}
      {stashedBounty <= 0 && (
        <div className="flex items-center justify-between gap-2 bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-xl px-3 py-2">
          <span className="text-[11px] text-amber-300 font-medium">
            Load MCH into vault first to lock & tag.
          </span>
          {mchBalance >= 25 && (
            <button
              type="button"
              onClick={() => {
                playSound('coin');
                triggerHaptic('light');
                onQuickLoad(mchBalance >= 100 ? 100 : 25);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#fbbf24] text-[#0a0b14] font-display font-extrabold text-[11px] shrink-0 flex items-center gap-1 active:scale-95 transition"
            >
              <Coins className="w-3 h-3" />
              +{mchBalance >= 100 ? '100' : '25'} MCH
            </button>
          )}
        </div>
      )}

      {/* Full-width Primary CTA Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={stashedBounty <= 0}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ec4899] text-[#0a0b14] font-display font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-glow-dual hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
      >
        <span className="text-base">🔒</span>
        <span className="truncate">
          LOCK STASH ({stashedBounty} MCH) & TAG {effectiveFriend.toUpperCase()}
        </span>
        <Send className="w-4 h-4 ml-0.5 shrink-0" />
      </button>
    </div>
  );
};
