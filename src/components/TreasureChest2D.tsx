import React, { useState } from 'react';
import { MchEmblem } from './MchEmblem';
import { playSound } from '../utils/sound';
import { triggerHaptic } from '../utils/telegram';

interface TreasureChest2DProps {
  isOpen: boolean;
  onToggle: () => void;
  stashedBounty: number;
  bonusStealth?: string;
  onReset: () => void;
  customImageSrc?: string | null;
  mode?: 'hide' | 'raid';
  raidMeta?: {
    challenger: string;
    isWon: boolean;
  };
  // Step 01 Coin Loading integration
  mchBalance?: number;
  onAddCoins?: (amount: number) => void;
  onAddMaxHalf?: () => void;
}

export const TreasureChest2D: React.FC<TreasureChest2DProps> = ({
  isOpen,
  onToggle,
  stashedBounty,
  bonusStealth = '+20% Stealth',
  onReset,
  customImageSrc = null,
  mode = 'hide',
  raidMeta,
  mchBalance = 1000,
  onAddCoins,
  onAddMaxHalf,
}) => {
  const [popKey, setPopKey] = useState(0);
  const [showReadyBadge, setShowReadyBadge] = useState(false);

  // Coin layer calculation based on actual bounty (0 means empty!)
  const coinLayers =
    stashedBounty <= 0
      ? 0
      : stashedBounty < 100
      ? 1
      : stashedBounty < 200
      ? 2
      : stashedBounty < 400
      ? 3
      : 4;

  const handleChestClick = () => {
    const willOpen = !isOpen;
    playSound(isOpen ? 'chest-close' : 'chest-open');
    triggerHaptic(willOpen ? 'medium' : 'light');
    if (willOpen) {
      setPopKey((prev) => prev + 1);
      setShowReadyBadge(true);
    } else {
      setShowReadyBadge(false);
    }
    onToggle();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChestClick();
    }
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('clear');
    triggerHaptic('light');
    setShowReadyBadge(false);
    onReset();
  };

  const handleCoinAdd = (amount: number) => {
    if (mchBalance < amount) {
      playSound('tap');
      triggerHaptic('warning');
      if (onAddCoins) onAddCoins(amount); // Let parent open store / toast
      return;
    }
    playSound('coin');
    triggerHaptic('light');
    setPopKey((prev) => prev + 1);
    setShowReadyBadge(true);
    if (onAddCoins) onAddCoins(amount);
  };

  const handleMaxHalfClick = () => {
    const half = Math.floor(mchBalance / 2);
    if (half <= 0) {
      playSound('tap');
      triggerHaptic('warning');
      if (onAddCoins) onAddCoins(25); // Prompt store if completely empty
      return;
    }
    playSound('coin');
    triggerHaptic('medium');
    setPopKey((prev) => prev + 1);
    setShowReadyBadge(true);
    if (onAddMaxHalf) onAddMaxHalf();
  };

  const badgeText =
    mode === 'raid'
      ? raidMeta?.isWon
        ? `+${stashedBounty} MCH Cracked!`
        : `${stashedBounty} MCH Locked`
      : stashedBounty > 0
      ? `${stashedBounty} MCH Ready`
      : 'Vault Empty';

  return (
    /* Outer Box Container with glowing Cyan-to-Pink gradient border */
    <div className="relative rounded-[28px] p-[2px] bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ec4899] shadow-[0_0_30px_rgba(0,240,255,0.35)] transition-all duration-300">
      <div className="bg-[#0b0e1b] rounded-[26px] p-3.5 sm:p-4 flex flex-col space-y-3.5 overflow-hidden relative">
        {/* ================= 1. TOP BAR ================= */}
        <div className="w-full flex items-center justify-between gap-2 z-10">
          <button
            type="button"
            onClick={handleChestClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#062430] border border-[#00f0ff] text-[#00f0ff] text-[10.5px] font-display font-bold tracking-wider uppercase transition hover:brightness-125 active:scale-95 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            <span>
              {mode === 'raid'
                ? isOpen
                  ? 'HIDE TARGET VAULT'
                  : 'INSPECT TARGET VAULT'
                : isOpen
                ? 'TAP CHEST TO CLOSE'
                : 'TAP CHEST TO OPEN'}
            </span>
          </button>

          <div className="px-3 py-1.5 rounded-full bg-[#1e1338] border border-[#a855f7] text-white text-[10.5px] font-display font-bold tracking-wide shadow-[0_0_10px_rgba(168,85,247,0.35)]">
            <span>
              {mode === 'raid' ? `BOUNTY: ${stashedBounty} MCH` : `LOADED: ${stashedBounty} MCH`}
            </span>
          </div>
        </div>

        {/* ================= 2. INNER CHEST STAGE ================= */}
        <div
          onClick={handleChestClick}
          onKeyDown={handleKeyDown}
          className="relative w-full rounded-2xl bg-gradient-to-b from-[#060814] to-[#020308] border border-white/5 py-4 px-2 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden group"
          role="button"
          tabIndex={0}
          aria-label="Interactive Cyberpunk Treasure Chest"
        >
          {/* Volumetric Radial Light Rays in the Background */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div
              className="w-full h-full"
              style={{
                background: `repeating-conic-gradient(
                  from 0deg at 50% 50%,
                  rgba(0, 240, 255, 0.12) 0deg 12deg,
                  transparent 12deg 24deg,
                  rgba(168, 85, 247, 0.12) 24deg 36deg,
                  transparent 36deg 48deg,
                  rgba(236, 72, 153, 0.12) 48deg 60deg,
                  transparent 60deg 72deg
                )`,
                filter: 'blur(10px)',
              }}
            />
          </div>

          {/* Floating Neon Diamonds & Sparkle Stars */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-4 left-6 sm:left-10 w-4 h-4 bg-[#00f0ff]/20 border-2 border-[#00f0ff] shadow-[0_0_12px_#00f0ff] transform -rotate-12 skew-x-12 animate-pulse" />
            <div className="absolute top-6 right-6 sm:right-10 w-4 h-4 bg-[#ec4899]/20 border-2 border-[#ec4899] shadow-[0_0_12px_#ec4899] transform rotate-12 -skew-x-12 animate-pulse" />
            <div className="absolute bottom-6 left-8 sm:left-12 text-[#fbbf24] text-xs font-bold drop-shadow-[0_0_6px_#fbbf24]">
              ✦
            </div>
            <div className="absolute bottom-6 right-8 sm:right-12 text-[#00f0ff] text-xs font-bold drop-shadow-[0_0_6px_#00f0ff]">
              ✦
            </div>
          </div>

          {/* SVG Cyber Chest */}
          <div className="relative w-full max-w-[290px] h-[195px] flex items-center justify-center">
            {/* Glowing Cyan Badge ("100 MCH Ready") emerging above chest and slowly vanishing */}
            {showReadyBadge && isOpen && (
              <div
                key={popKey}
                onAnimationEnd={() => setShowReadyBadge(false)}
                className="absolute -top-1 sm:-top-2 left-1/2 -translate-x-1/2 z-30 font-display font-extrabold text-sm sm:text-base text-[#00f0ff] select-none pointer-events-none whitespace-nowrap animate-ready-emerge-vanish"
                style={{
                  textShadow: '0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 35px rgba(0, 240, 255, 0.85)',
                }}
              >
                {badgeText}
              </div>
            )}

            <svg
              viewBox="0 0 320 220"
              className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] overflow-visible"
            >
              <defs>
                <linearGradient id="goldBumperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="25%" stopColor="#fbbf24" />
                  <stop offset="75%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                <linearGradient id="lidArchNeonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                <radialGradient id="vaultLightFan" cx="50%" cy="100%" r="90%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                  <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#00f0ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="emptyVaultFan" cx="50%" cy="100%" r="90%">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
                  <stop offset="70%" stopColor="#a855f7" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="goldCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                <filter id="cyanNeon" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="pinkNeon" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="goldNeon" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Base Ground Rings */}
              <ellipse
                cx="160"
                cy="194"
                rx="105"
                ry="13"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2.5"
                opacity="0.85"
                filter="url(#cyanNeon)"
              />
              <ellipse
                cx="160"
                cy="194"
                rx="82"
                ry="9"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2"
                opacity="0.9"
                filter="url(#pinkNeon)"
              />

              {/* Lower Chest Body */}
              <path
                d="M85 108 L235 108 L235 152 Q235 166 222 166 L98 166 Q85 166 85 152 Z"
                fill="#080b18"
                stroke="#182038"
                strokeWidth="1.5"
              />

              <rect x="85" y="108" width="8" height="48" rx="4" fill="#00f0ff" filter="url(#cyanNeon)" />
              <rect x="227" y="108" width="8" height="48" rx="4" fill="#ec4899" filter="url(#pinkNeon)" />
              <path d="M94 166 L226 166" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
              <rect
                x="80"
                y="102"
                width="160"
                height="11"
                rx="5.5"
                fill="url(#goldBumperGrad)"
                stroke="#f59e0b"
                strokeWidth="1"
                filter="url(#goldNeon)"
              />

              {/* Open Vault Glow & Dynamic Coins (only renders coins when coinLayers > 0) */}
              {isOpen && (
                <g className="transition-opacity duration-300">
                  <polygon
                    points="110,102 210,102 230,72 90,72"
                    fill={coinLayers > 0 ? 'url(#vaultLightFan)' : 'url(#emptyVaultFan)'}
                  />

                  {coinLayers > 0 && (
                    <g className="coins-cluster">
                      {/* Layer 1 Foundation Coins */}
                      <ellipse cx="120" cy="101" rx="14" ry="6" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                      <ellipse cx="145" cy="100" rx="16" ry="6.5" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                      <ellipse cx="175" cy="100" rx="16" ry="6.5" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                      <ellipse cx="200" cy="101" rx="14" ry="6" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />

                      {/* Layer 2 Coins */}
                      {coinLayers >= 2 && (
                        <>
                          <ellipse cx="132" cy="96" rx="14" ry="6" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                          <ellipse cx="160" cy="95" rx="17" ry="7" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                          <ellipse cx="188" cy="96" rx="14" ry="6" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                        </>
                      )}

                      {/* Layer 3 Coins */}
                      {coinLayers >= 3 && (
                        <>
                          <ellipse cx="146" cy="91" rx="15" ry="6" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                          <ellipse cx="174" cy="91" rx="15" ry="6" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                        </>
                      )}

                      {/* Layer 4 Coins */}
                      {coinLayers >= 4 && (
                        <ellipse cx="160" cy="86" rx="15" ry="6" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                      )}
                    </g>
                  )}
                </g>
              )}

              {/* Lid Group */}
              <g
                className="transition-transform duration-300 ease-out origin-[160px_100px]"
                style={{
                  transform: isOpen ? 'translateY(-22px)' : 'translateY(0px)',
                }}
              >
                <path
                  d="M85 82 C85 46, 160 40, 160 40 C160 40, 235 46, 235 82 Z"
                  fill="#0b0e1b"
                  stroke="url(#lidArchNeonGrad)"
                  strokeWidth="2.5"
                />
                <path d="M104 80 Q106 58 114 55" stroke="#00f0ff" strokeWidth="4" strokeLinecap="round" fill="none" filter="url(#cyanNeon)" />
                <path d="M156 80 Q160 52 164 80" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M216 80 Q214 58 206 55" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" fill="none" filter="url(#pinkNeon)" />
                <rect
                  x="80"
                  y="77"
                  width="160"
                  height="11"
                  rx="5.5"
                  fill="url(#goldBumperGrad)"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  filter="url(#goldNeon)"
                />
              </g>

              {/* Medallion Base Socket Outline */}
              <circle cx="160" cy="132" r="30" fill="#000000" stroke="#f59e0b" strokeWidth="2" />
            </svg>

            {/* Official MCH Logo Lock Medallion */}
            <div className="absolute top-[102px] left-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-300">
              <MchEmblem
                size={58}
                showGoldRing={true}
                glow={true}
                customImageSrc={customImageSrc}
              />
            </div>
          </div>

          {/* Helpful Empty Vault Hint when open and 0 MCH */}
          {mode === 'hide' && stashedBounty === 0 && (
            <div className="mt-1 text-[11px] font-semibold text-[#00f0ff]/80 tracking-wide">
              Vault is empty — tap <span className="font-bold text-white">+25</span> or <span className="font-bold text-white">+100</span> below to load MCH
            </div>
          )}
        </div>

        {/* ================= 3. BOUNTY STATUS BAR ================= */}
        {mode === 'hide' ? (
          <div className="w-full rounded-2xl bg-[#080b16] border border-goldMch/60 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-[0_0_12px_rgba(255,209,102,0.2)]">
            <div className="flex flex-col text-[10px] sm:text-[11px] font-extrabold text-slate-400 tracking-wider uppercase leading-tight shrink-0">
              <span>STASHED</span>
              <span>BOUNTY:</span>
            </div>

            <div className="flex items-baseline gap-1 text-lg sm:text-xl font-display font-black text-[#fbbf24] leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
              <span>{stashedBounty}</span>
              <span className="text-xs sm:text-sm">MCH</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="px-2.5 py-1 rounded-full bg-[#062430] border border-cyanGlow text-cyanGlow text-[10.5px] font-bold tracking-wide shadow-[0_0_8px_rgba(20,232,255,0.25)]">
                {bonusStealth}
              </div>

              <button
                type="button"
                onClick={handleResetClick}
                disabled={stashedBounty === 0}
                className="px-3 py-1 rounded-xl bg-[#1e2538] hover:bg-[#2a344e] text-slate-200 text-xs font-bold transition active:scale-95 disabled:opacity-40"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          /* Raid Mode Target Vault Status Bar (no dead Reset or coin load controls) */
          <div className="w-full rounded-2xl bg-[#080b16] border border-[#ec4899]/50 px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-[0_0_12px_rgba(236,72,153,0.18)]">
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {raidMeta?.challenger ? `${raidMeta.challenger}'s Vault` : 'Target Bounty'}
              </div>
              <div className="text-base font-display font-black text-[#fbbf24] leading-tight">
                {stashedBounty} MCH Prize
              </div>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-[11px] font-display font-bold border ${
                raidMeta?.isWon
                  ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e]'
                  : 'bg-[#ec4899]/15 border-[#ec4899]/50 text-[#ec4899]'
              }`}
            >
              {raidMeta?.isWon ? '🔓 VAULT CRACKED' : '🔒 LOCKED VAULT'}
            </div>
          </div>
        )}

        {/* ================= 4. STEP 01 COIN LOADING CONTROLS (HIDE MODE ONLY) ================= */}
        {mode === 'hide' && (
          <div className="w-full space-y-2 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-xs text-[#00f0ff] bg-[#00f0ff]/10 px-1.5 py-0.5 rounded border border-[#00f0ff]/30">
                  01
                </span>
                <span className="font-display font-bold text-xs sm:text-sm text-white">
                  Load MCH Coins Into Vault
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#00f0ff] shrink-0">
                Watch stack rise
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleCoinAdd(25)}
                className={`py-2.5 rounded-xl bg-[#080d1a] hover:bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] font-display font-extrabold text-xs sm:text-sm transition active:scale-95 shadow-[0_0_8px_rgba(0,240,255,0.2)] ${
                  mchBalance < 25 ? 'opacity-45' : ''
                }`}
              >
                +25
              </button>

              <button
                type="button"
                onClick={() => handleCoinAdd(100)}
                className={`py-2.5 rounded-xl bg-[#080d1a] hover:bg-[#a855f7]/15 border border-[#a855f7] text-[#a855f7] font-display font-extrabold text-xs sm:text-sm transition active:scale-95 shadow-[0_0_8px_rgba(168,85,247,0.25)] ${
                  mchBalance < 100 ? 'opacity-45' : ''
                }`}
              >
                +100
              </button>

              <button
                type="button"
                onClick={() => handleCoinAdd(250)}
                className={`py-2.5 rounded-xl bg-[#080d1a] hover:bg-[#ec4899]/15 border border-[#ec4899] text-[#ec4899] font-display font-extrabold text-xs sm:text-sm transition active:scale-95 shadow-[0_0_8px_rgba(236,72,153,0.25)] ${
                  mchBalance < 250 ? 'opacity-45' : ''
                }`}
              >
                +250
              </button>

              <button
                type="button"
                onClick={handleMaxHalfClick}
                className={`py-2.5 rounded-xl bg-[#080d1a] hover:bg-[#fbbf24]/15 border border-[#fbbf24] text-[#fbbf24] font-display font-extrabold text-xs sm:text-sm transition active:scale-95 shadow-[0_0_8px_rgba(251,191,36,0.25)] ${
                  mchBalance < 2 ? 'opacity-45' : ''
                }`}
              >
                Max Half
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
