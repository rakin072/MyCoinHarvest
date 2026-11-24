import React, { useState } from 'react';
import { MchEmblem } from './MchEmblem';
import { playSound } from '../utils/sound';

interface TreasureChest2DProps {
  isOpen: boolean;
  onToggle: () => void;
  stashedBounty: number;
  bonusStealth?: string;
  onReset: () => void;
  customImageSrc?: string | null;
  // Step 01 Coin Loading integration (exact layout from Image 2)
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
  mchBalance = 1000,
  onAddCoins,
  onAddMaxHalf,
}) => {
  const [popKey, setPopKey] = useState(0);
  const [showReadyBadge, setShowReadyBadge] = useState(false);

  // Coin layer calculation based on bounty (stacks higher as bounty increases)
  const coinLayers = Math.min(5, Math.max(1, Math.ceil(stashedBounty / 50)));

  const handleChestClick = () => {
    const willOpen = !isOpen;
    playSound(isOpen ? 'chest-close' : 'chest-open');
    if (willOpen) {
      setPopKey((prev) => prev + 1);
      setShowReadyBadge(true);
    } else {
      setShowReadyBadge(false);
    }
    onToggle();
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('clear');
    setShowReadyBadge(false);
    onReset();
  };

  const handleCoinAdd = (amount: number) => {
    if (mchBalance < amount) return;
    playSound('coin');
    setPopKey((prev) => prev + 1);
    setShowReadyBadge(true);
    if (onAddCoins) onAddCoins(amount);
  };

  const handleMaxHalfClick = () => {
    const half = Math.floor(mchBalance / 2);
    if (half <= 0) return;
    playSound('coin');
    setPopKey((prev) => prev + 1);
    setShowReadyBadge(true);
    if (onAddMaxHalf) onAddMaxHalf();
  };

  // Determine ready amount: default 100 MCH as in user specification/screenshot
  const readyAmount = stashedBounty > 0 ? stashedBounty : 100;

  return (
    /* Outer Box Container with glowing Cyan-to-Pink gradient border matching Image 2 */
    <div className="relative rounded-[28px] p-[2px] bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ec4899] shadow-[0_0_30px_rgba(0,240,255,0.35)] transition-all duration-300">
      <div className="bg-[#0b0e1b] rounded-[26px] p-3.5 sm:p-4 flex flex-col space-y-3.5 overflow-hidden relative">
        
        {/* ================= 1. TOP BAR ================= */}
        <div className="w-full flex items-center justify-between gap-2 z-10">
          {/* Left Pill: TAP CHEST TO OPEN / CLOSE (or Tap Chest to Peek) */}
          <button
            type="button"
            onClick={handleChestClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#062430] border border-[#00f0ff] text-[#00f0ff] text-[11px] font-display font-bold tracking-wider uppercase transition hover:brightness-125 active:scale-95 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            <span>{isOpen ? 'TAP CHEST TO CLOSE' : 'TAP CHEST TO OPEN / PEEK'}</span>
          </button>

          {/* Right Pill: LOADED: {stashedBounty} MCH */}
          <div className="px-3.5 py-1.5 rounded-full bg-[#1e1338] border border-[#a855f7] text-white text-[11px] font-display font-bold tracking-wide shadow-[0_0_10px_rgba(168,85,247,0.35)]">
            <span>LOADED: {stashedBounty} MCH</span>
          </div>
        </div>

        {/* ================= 2. INNER CHEST STAGE (Image 2) ================= */}
        <div
          onClick={handleChestClick}
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
            {/* Top-Left: Tilted Neon Cyan Diamond */}
            <div className="absolute top-4 left-6 sm:left-10 w-4 h-4 bg-[#00f0ff]/20 border-2 border-[#00f0ff] shadow-[0_0_12px_#00f0ff] transform -rotate-12 skew-x-12 animate-pulse" />
            
            {/* Top-Right: Tilted Neon Hot Pink Diamond */}
            <div className="absolute top-6 right-6 sm:right-10 w-4 h-4 bg-[#ec4899]/20 border-2 border-[#ec4899] shadow-[0_0_12px_#ec4899] transform rotate-12 -skew-x-12 animate-pulse" />

            {/* Bottom-Left: Glowing Gold Sparkle Star */}
            <div className="absolute bottom-6 left-8 sm:left-12 text-[#fbbf24] text-xs font-bold drop-shadow-[0_0_6px_#fbbf24]">
              ✦
            </div>

            {/* Bottom-Right: Glowing Cyan Sparkle Star */}
            <div className="absolute bottom-6 right-8 sm:right-12 text-[#00f0ff] text-xs font-bold drop-shadow-[0_0_6px_#00f0ff]">
              ✦
            </div>
          </div>

          {/* SVG Cyber Chest (Exact geometry & colors from Image 2) */}
          <div className="relative w-full max-w-[290px] h-[195px] flex items-center justify-center">
            
            {/* ================= USER SPECIFIC FEATURE: "100 MCH Ready" Glowing Cyan Badge ================= */}
            {/* Appears centered directly over the chest lid when opened, and then vanishes slowly */}
            {showReadyBadge && isOpen && (
              <div
                key={popKey}
                onAnimationEnd={() => setShowReadyBadge(false)}
                className="absolute -top-1 sm:-top-2 left-1/2 -translate-x-1/2 z-30 font-display font-extrabold text-sm sm:text-base text-[#00f0ff] select-none pointer-events-none whitespace-nowrap animate-ready-emerge-vanish"
                style={{
                  textShadow: '0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 35px rgba(0, 240, 255, 0.85)',
                }}
              >
                {readyAmount} MCH Ready
              </div>
            )}

            <svg
              viewBox="0 0 320 220"
              className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] overflow-visible"
            >
              <defs>
                {/* Gold Bumper Bar Metallic Gradient */}
                <linearGradient id="goldBumperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="25%" stopColor="#fbbf24" />
                  <stop offset="75%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                {/* Lid Outer Arch Neon Gradient */}
                <linearGradient id="lidArchNeonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                {/* Inner Vault Light Fan Gradient */}
                <radialGradient id="vaultLightFan" cx="50%" cy="100%" r="90%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                  <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#00f0ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
                </radialGradient>

                {/* Coin Gradient */}
                <linearGradient id="goldCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                {/* Neon Glow Filters */}
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

              {/* ================= BASE GROUND RINGS ================= */}
              {/* Outer Cyan Ring */}
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
              {/* Inner Hot Pink Ring */}
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

              {/* ================= LOWER CHEST BODY ================= */}
              {/* Dark Body Cavity */}
              <path
                d="M85 108 L235 108 L235 152 Q235 166 222 166 L98 166 Q85 166 85 152 Z"
                fill="#080b18"
                stroke="#182038"
                strokeWidth="1.5"
              />

              {/* Left Glowing Cyan Rib Stripe */}
              <rect
                x="85"
                y="108"
                width="8"
                height="48"
                rx="4"
                fill="#00f0ff"
                filter="url(#cyanNeon)"
              />

              {/* Right Glowing Hot Pink Rib Stripe */}
              <rect
                x="227"
                y="108"
                width="8"
                height="48"
                rx="4"
                fill="#ec4899"
                filter="url(#pinkNeon)"
              />

              {/* Bottom Body Edge Outline */}
              <path
                d="M94 166 L226 166"
                stroke="#ec4899"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.8"
              />

              {/* Top Gold Bumper Bar of Body (Directly under the opening) */}
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

              {/* ================= OPEN VAULT GLOW & COINS ================= */}
              {isOpen && (
                <g className="transition-opacity duration-300">
                  {/* Glowing light fan projecting upward */}
                  <polygon
                    points="110,102 210,102 230,72 90,72"
                    fill="url(#vaultLightFan)"
                  />

                  {/* Dynamic Golden Coins Resting on the Opening */}
                  <g className="coins-cluster">
                    {/* Foundation Coins */}
                    <ellipse cx="120" cy="101" rx="14" ry="6" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                    <ellipse cx="145" cy="100" rx="16" ry="6.5" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                    <ellipse cx="175" cy="100" rx="16" ry="6.5" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />
                    <ellipse cx="200" cy="101" rx="14" ry="6" fill="url(#goldCoinGrad)" stroke="#78350f" strokeWidth="0.8" />

                    {/* Layer 2 Coins (as bounty rises) */}
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
                </g>
              )}

              {/* ================= LID GROUP (TRANSFORMS UP WHEN OPEN) ================= */}
              <g
                className="transition-transform duration-300 ease-out origin-[160px_100px]"
                style={{
                  transform: isOpen ? 'translateY(-22px)' : 'translateY(0px)',
                }}
              >
                {/* Curved Outer Arch Dome of the Lid */}
                <path
                  d="M85 82 C85 46, 160 40, 160 40 C160 40, 235 46, 235 82 Z"
                  fill="#0b0e1b"
                  stroke="url(#lidArchNeonGrad)"
                  strokeWidth="2.5"
                />

                {/* Vertical Neon Rib Arches on the Lid (Left=Cyan, Center=Purple, Right=Pink) */}
                {/* Left Rib (Cyan) */}
                <path
                  d="M104 80 Q106 58 114 55"
                  stroke="#00f0ff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#cyanNeon)"
                />

                {/* Center Rib (Purple) */}
                <path
                  d="M156 80 Q160 52 164 80"
                  stroke="#a855f7"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Right Rib (Hot Pink) */}
                <path
                  d="M216 80 Q214 58 206 55"
                  stroke="#ec4899"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#pinkNeon)"
                />

                {/* Horizontal Gold Bumper Bar on the Lid */}
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

            {/* Official MCH Logo Lock Medallion (Image 1 Uploaded Asset inside Double Gold Ring) */}
            <div className="absolute top-[102px] left-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-300">
              <MchEmblem 
                size={58} 
                showGoldRing={true} 
                glow={true} 
                customImageSrc={customImageSrc} 
              />
            </div>
          </div>
        </div>

        {/* ================= 3. BOUNTY STATUS BAR (Image 2) ================= */}
        <div className="w-full rounded-2xl bg-[#080b16] border border-goldMch/60 px-4 py-2.5 flex items-center justify-between gap-2 shadow-[0_0_12px_rgba(255,209,102,0.2)]">
          {/* Left Column: STASHED BOUNTY: */}
          <div className="flex flex-col text-[10px] sm:text-[11px] font-extrabold text-slate-400 tracking-wider uppercase leading-tight">
            <span>STASHED</span>
            <span>BOUNTY:</span>
          </div>

          {/* Middle Column: 100 MCH / 150 MCH (Bold Gold) */}
          <div className="flex flex-col text-lg sm:text-xl font-display font-black text-[#fbbf24] leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
            <span>{stashedBounty}</span>
            <span>MCH</span>
          </div>

          {/* Right Section: +20% Stealth & Reset Button */}
          <div className="flex items-center gap-2">
            {/* Pill: +20% Stealth */}
            <div className="px-3 py-1 rounded-full bg-[#062430] border border-cyanGlow text-cyanGlow text-[11px] font-bold tracking-wide shadow-[0_0_8px_rgba(20,232,255,0.25)]">
              {bonusStealth}
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetClick}
              disabled={stashedBounty === 0}
              className="px-3.5 py-1 rounded-xl bg-[#1e2538] hover:bg-[#2a344e] text-slate-200 text-xs font-bold transition active:scale-95 disabled:opacity-40"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ================= 4. STEP 01 COIN LOADING CONTROLS (Image 2) ================= */}
        <div className="w-full space-y-2 pt-1">
          {/* Row: "Load MCH Coins Into Vault" (Left) & "Watch coin stack rise" (Right) */}
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-xs sm:text-sm text-white">
              Load MCH Coins Into Vault
            </span>
            <span className="text-xs font-semibold text-[#00f0ff]">
              Watch coin stack rise
            </span>
          </div>

          {/* 4 Action Buttons in a Single Row */}
          <div className="grid grid-cols-4 gap-2">
            {/* +25 (Cyan) */}
            <button
              type="button"
              onClick={() => handleCoinAdd(25)}
              disabled={mchBalance < 25}
              className="py-2.5 rounded-xl bg-[#080d1a] hover:bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] font-display font-extrabold text-xs sm:text-sm transition active:scale-95 shadow-[0_0_8px_rgba(0,240,255,0.2)] disabled:opacity-40"
            >
              +25
            </button>

            {/* +100 (Purple) */}
            <button
              type="button"
              onClick={() => handleCoinAdd(100)}
              disabled={mchBalance < 100}
              className="py-2.5 rounded-xl bg-[#080d1a] hover:bg-[#a855f7]/15 border border-[#a855f7] text-[#a855f7] font-display font-extrabold text-xs sm:text-sm transition active:scale-95 shadow-[0_0_8px_rgba(168,85,247,0.25)] disabled:opacity-40"
            >
              +100
            </button>

            {/* +250 (Pink) */}
            <button
              type="button"
              onClick={() => handleCoinAdd(250)}
              disabled={mchBalance < 250}
              className="py-2.5 rounded-xl bg-[#080d1a] hover:bg-[#ec4899]/15 border border-[#ec4899] text-[#ec4899] font-display font-extrabold text-xs sm:text-sm transition active:scale-95 shadow-[0_0_8px_rgba(236,72,153,0.25)] disabled:opacity-40"
            >
              +250
            </button>

            {/* Max Half (Gold) */}
            <button
              type="button"
              onClick={handleMaxHalfClick}
              disabled={mchBalance < 2}
              className="py-2.5 rounded-xl bg-[#080d1a] hover:bg-[#fbbf24]/15 border border-[#fbbf24] text-[#fbbf24] font-display font-extrabold text-xs sm:text-sm transition active:scale-95 shadow-[0_0_8px_rgba(251,191,36,0.25)] disabled:opacity-40"
            >
              Max Half
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
