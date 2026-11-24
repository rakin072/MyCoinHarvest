import React from 'react';
import { PRESET_RIDDLES, SQUAD_FRIENDS } from '../data/constants';
import { playSound } from '../utils/sound';
import { Sparkles, Send } from 'lucide-react';

interface DropClueStepProps {
  clue: string;
  onClueChange: (newClue: string) => void;
  selectedFriend: string;
  onSelectFriend: (friendHandle: string) => void;
  customFriend: string;
  onCustomFriendChange: (val: string) => void;
  stashedBounty: number;
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
  onLockAndTag,
}) => {
  // Determine effective friend name for display
  const effectiveFriend = customFriend.trim()
    ? (customFriend.startsWith('@') ? customFriend : `@${customFriend}`)
    : selectedFriend;

  const handlePresetClick = (preset: string) => {
    playSound('tap');
    onClueChange(preset);
  };

  const handleChipClick = (handle: string) => {
    playSound('tap');
    onSelectFriend(handle);
    onCustomFriendChange('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
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
    onLockAndTag();
  };

  return (
    <div className="bg-[#0d111e]/90 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-lg backdrop-blur-md">
      {/* Header Row: "03" in pink */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-sm text-[#ec4899] bg-[#ec4899]/10 px-2 py-0.5 rounded-md border border-[#ec4899]/30">
            03
          </span>
          <h2 className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
            Drop Clue & Tag Friend
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          1-line riddle
        </span>
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
              className={`text-[11px] text-left px-2.5 py-1.5 rounded-xl border transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'bg-[#ec4899]/20 border-[#ec4899] text-white shadow-[0_0_8px_rgba(236,72,153,0.3)]'
                  : 'bg-[#13192c] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
              }`}
            >
              "{riddle}"
            </button>
          );
        })}
      </div>

      {/* Custom Text Input Field */}
      <div className="relative">
        <input
          type="text"
          value={clue}
          onChange={(e) => onClueChange(e.target.value)}
          placeholder="Enter a 1-line riddle for your friend..."
          className="w-full bg-[#080b16] border border-white/15 focus:border-[#ec4899] focus:shadow-[0_0_12px_rgba(236,72,153,0.25)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-[#ec4899]/70" />
        </div>
      </div>

      {/* Quick-Tag Friend Chips (4 horizontal pill buttons) */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
          <span>Squad Quick-Tag:</span>
          <span className="text-[#00f0ff]">{effectiveFriend}</span>
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
          value={customFriend}
          onChange={handleCustomChange}
          placeholder="@ Or enter any Telegram @username"
          className="w-full bg-[#080b16] border border-white/15 focus:border-[#00f0ff] focus:shadow-[0_0_12px_rgba(0,240,255,0.25)] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
        />
      </div>

      {/* Full-width Primary CTA Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={stashedBounty <= 0}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ec4899] text-[#0a0b14] font-display font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-glow-dual hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100"
      >
        <span className="text-base">🔒</span>
        <span className="truncate">
          LOCK STASH & TAG {effectiveFriend.toUpperCase()}
        </span>
        <Send className="w-4 h-4 ml-0.5" />
      </button>

      {stashedBounty <= 0 && (
        <p className="text-center text-[11px] text-amber-400/80 font-medium">
          Load at least +25 MCH into the vault before locking your stash.
        </p>
      )}
    </div>
  );
};
