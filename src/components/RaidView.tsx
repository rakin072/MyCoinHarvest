import React from 'react';
import { HIDING_ZONES } from '../data/constants';
import { HidingZone, RaidChallenge } from '../types';
import { playSound } from '../utils/sound';
import { triggerHaptic } from '../utils/telegram';
import confetti from 'canvas-confetti';
import {
  Lock,
  TreePine,
  Train,
  Radio,
  Anchor,
  Gamepad2,
  Milestone,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Flame,
  Snowflake,
} from 'lucide-react';

interface RaidViewProps {
  challenge: RaidChallenge;
  challengeNumber: number;
  totalChallenges: number;
  isIncomingLinkChallenge?: boolean;
  onClaimBounty: (bounty: number, locationName: string, challenger: string, challengeId: string) => void;
  onChestCrack?: () => void;
  onCycleChallenge: () => void;
  probesLeft: number;
  setProbesLeft: React.Dispatch<React.SetStateAction<number>>;
  guessedIds: string[];
  setGuessedIds: React.Dispatch<React.SetStateAction<string[]>>;
  isWon: boolean;
  setIsWon: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenStore: (tab?: 'probes' | 'coins') => void;
}

export const RaidView: React.FC<RaidViewProps> = ({
  challenge,
  challengeNumber,
  totalChallenges,
  isIncomingLinkChallenge = false,
  onClaimBounty,
  onChestCrack,
  onCycleChallenge,
  probesLeft,
  setProbesLeft,
  guessedIds,
  setGuessedIds,
  isWon,
  setIsWon,
  onOpenStore,
}) => {
  const [bannerFeedback, setBannerFeedback] = React.useState<string>(
    'Select 1 of the 8 zones below to deploy a Scanner Probe.'
  );
  const [bannerStatusType, setBannerStatusType] = React.useState<
    'default' | 'hot' | 'cold' | 'win' | 'lost'
  >('default');

  const targetZone = HIDING_ZONES.find((z) => z.id === challenge.targetZoneId) || HIDING_ZONES[7];

  // Reset feedback banner cleanly whenever a new challenge loads
  React.useEffect(() => {
    if (!isWon && guessedIds.length === 0 && probesLeft > 0) {
      setBannerStatusType('default');
      setBannerFeedback('Select 1 of the 8 zones below to deploy a Scanner Probe.');
    }
  }, [challenge.id]);

  // When probes are refilled after hitting 0, restore active scanning banner
  React.useEffect(() => {
    if (probesLeft > 0 && bannerStatusType === 'lost' && !isWon) {
      setBannerStatusType('default');
      setBannerFeedback(
        `Probes refilled! Deploy scanner (${probesLeft} probe${probesLeft > 1 ? 's' : ''} ready).`
      );
    }
  }, [probesLeft, bannerStatusType, isWon]);

  const renderSectorIcon = (iconName: HidingZone['iconName'], color: string) => {
    const iconClass = 'w-4 h-4';
    switch (iconName) {
      case 'safe':
        return <Lock className={iconClass} style={{ color }} />;
      case 'tree':
        return <TreePine className={iconClass} style={{ color }} />;
      case 'train':
        return <Train className={iconClass} style={{ color }} />;
      case 'radio':
        return <Radio className={iconClass} style={{ color }} />;
      case 'anchor':
        return <Anchor className={iconClass} style={{ color }} />;
      case 'gamepad':
        return <Gamepad2 className={iconClass} style={{ color }} />;
      case 'bridge':
        return <Milestone className={iconClass} style={{ color }} />;
      case 'shield':
        return <ShieldCheck className={iconClass} style={{ color }} />;
      default:
        return <Lock className={iconClass} style={{ color }} />;
    }
  };

  const handleScanSector = (zone: HidingZone) => {
    if (isWon || probesLeft <= 0 || guessedIds.includes(zone.id)) return;

    const newGuessed = [...guessedIds, zone.id];
    setGuessedIds(newGuessed);
    const newProbes = probesLeft - 1;
    setProbesLeft(newProbes);

    // Match!
    if (zone.id === challenge.targetZoneId) {
      setIsWon(true);
      setBannerStatusType('win');
      setBannerFeedback(
        `VAULT CRACKED! Found ${challenge.challenger}'s stash in ${zone.name} (+${challenge.bounty} MCH)!`
      );

      playSound('win');
      triggerHaptic('success');
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.65 },
      });

      if (onChestCrack) {
        onChestCrack();
      }

      onClaimBounty(challenge.bounty, zone.name, challenge.challenger, challenge.id);
      return;
    }

    // Missed — compute Hot/Cold proximity feedback
    const diff = Math.abs(zone.sectorIndex - targetZone.sectorIndex);
    if (diff <= 2) {
      setBannerStatusType('hot');
      playSound('radar-hot');
      triggerHaptic('medium');
      if (newProbes > 0) {
        setBannerFeedback(
          `🔥 HOT SIGNAL! Target is within 2 sectors of ${zone.name}. (${newProbes} probe${newProbes > 1 ? 's' : ''} left)`
        );
      } else {
        setBannerStatusType('lost');
        triggerHaptic('error');
        setBannerFeedback(
          `⚠️ Out of probes! Buy +3 probes to continue this raid or skip to next challenge.`
        );
      }
    } else {
      setBannerStatusType('cold');
      playSound('radar-cold');
      triggerHaptic('light');
      if (newProbes > 0) {
        setBannerFeedback(
          `❄️ COLD SIGNAL! Target is far from ${zone.name}. (${newProbes} probe${newProbes > 1 ? 's' : ''} left)`
        );
      } else {
        setBannerStatusType('lost');
        triggerHaptic('error');
        setBannerFeedback(
          `⚠️ Out of probes! Buy +3 probes to continue this raid or skip to next challenge.`
        );
      }
    }
  };

  const handleNextChallenge = () => {
    playSound('tap');
    triggerHaptic('light');
    setBannerStatusType('default');
    setBannerFeedback('Select 1 of the 8 zones below to deploy a Scanner Probe.');
    onCycleChallenge();
  };

  const probeSlots = Math.max(3, probesLeft);

  return (
    <div className="bg-[#0d111e]/90 border border-[#ec4899]/35 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-[0_0_24px_rgba(236,72,153,0.18)] backdrop-blur-md">
      {/* 1. Target Info Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ec4899] via-[#a855f7] to-[#00f0ff] p-[2px] shrink-0 shadow-md">
            <div className="w-full h-full bg-[#0a0d18] rounded-full flex items-center justify-center text-lg">
              {challenge.avatar}
            </div>
          </div>
          <div className="min-w-0">
            <div className="font-display font-extrabold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
              <span>
                Target: <span className="text-[#ec4899] font-black">{challenge.challenger}&apos;s</span> Stash
              </span>
              <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0">
                {isIncomingLinkChallenge ? 'TAGGED' : `#${challengeNumber}/${totalChallenges}`}
              </span>
            </div>
            <div className="text-[11px] font-bold text-[#fbbf24] flex items-center gap-1">
              Bounty Pool: {challenge.bounty} MCH
            </div>
          </div>
        </div>

        {/* Scanner Probes Indicator */}
        <div className="text-right shrink-0">
          <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            PROBES ({probesLeft})
          </div>
          <div className="flex items-center justify-end gap-1 mt-1 max-w-[90px] flex-wrap">
            {Array.from({ length: Math.min(probeSlots, 6) }).map((_, idx) => {
              const isActive = idx < probesLeft;
              return (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]'
                      : 'bg-white/10 shadow-none'
                  }`}
                  title={isActive ? 'Probe ready' : 'Probe used'}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Intercepted Clue Box */}
      <div className="bg-[#080b16] border border-white/10 rounded-xl p-3 space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[#00f0ff] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
          INTERCEPTED CLUE
        </div>
        <p className="text-xs text-slate-200 italic leading-relaxed">
          &ldquo;{challenge.clue}&rdquo;
        </p>
      </div>

      {/* 3. Instruction / Radar Feedback Banner */}
      <div
        className={`rounded-xl px-3 py-2 text-xs font-semibold text-center transition-all ${
          bannerStatusType === 'win'
            ? 'bg-[#fbbf24]/20 border border-[#fbbf24] text-[#fbbf24] shadow-glow-gold'
            : bannerStatusType === 'hot'
            ? 'bg-[#fb923c]/20 border border-[#fb923c] text-[#fb923c]'
            : bannerStatusType === 'cold'
            ? 'bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff]'
            : bannerStatusType === 'lost'
            ? 'bg-rose-500/20 border border-rose-500 text-rose-300'
            : 'bg-[#13192c] border border-white/10 text-slate-300'
        }`}
      >
        {bannerFeedback}
      </div>

      {/* Out of Probes Buy Banner */}
      {probesLeft === 0 && !isWon && (
        <button
          type="button"
          onClick={() => {
            playSound('tap');
            triggerHaptic('medium');
            onOpenStore('probes');
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#ec4899]/30 via-[#a855f7]/30 to-[#00f0ff]/30 border border-[#ec4899] text-xs font-display font-bold text-white shadow-[0_0_16px_rgba(236,72,153,0.35)] flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
        >
          <Zap className="w-4 h-4 text-[#fbbf24] shrink-0" />
          <span>Continue This Raid (+3 Probes • $0.99 / 50 ⭐)</span>
        </button>
      )}

      {/* 4. 8-Sector Raid Scanning Grid (2x4) */}
      <div className="grid grid-cols-2 gap-2">
        {HIDING_ZONES.map((zone) => {
          const isGuessed = guessedIds.includes(zone.id);
          const isTarget = zone.id === challenge.targetZoneId;
          const isHot = Math.abs(zone.sectorIndex - targetZone.sectorIndex) <= 2;

          // Matched winning card
          if (isGuessed && isTarget) {
            return (
              <div
                key={zone.id}
                className="p-2.5 rounded-xl bg-[#fbbf24]/20 border-2 border-[#fbbf24] shadow-glow-gold flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#fbbf24]" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-xs text-[#fbbf24] truncate">
                    {zone.name}
                  </div>
                  <div className="text-[10px] font-extrabold text-white">
                    +{challenge.bounty} MCH Won!
                  </div>
                </div>
              </div>
            );
          }

          // Scanned & Missed Card: Show Hot vs Cold resonance so player can triangulate!
          if (isGuessed && !isTarget) {
            return (
              <div
                key={zone.id}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                  isHot
                    ? 'bg-[#fb923c]/10 border-[#fb923c]/40 opacity-85'
                    : 'bg-[#090c17]/75 border-white/5 opacity-60'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isHot ? 'bg-[#fb923c]/20 text-[#fb923c]' : 'bg-black/40 text-[#00f0ff]/70'
                  }`}
                >
                  {isHot ? <Flame className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-xs text-slate-300 line-through truncate">
                    {zone.name}
                  </div>
                  <div
                    className={`text-[10px] font-bold ${
                      isHot ? 'text-[#fb923c]' : 'text-[#00f0ff]/80'
                    }`}
                  >
                    {isHot ? 'Hot Nearby' : 'Cold Signal'}
                  </div>
                </div>
              </div>
            );
          }

          // Unscanned Card
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => handleScanSector(zone)}
              disabled={isWon || probesLeft <= 0}
              className="p-2.5 rounded-xl bg-[#13192c] hover:bg-[#ec4899]/15 border border-white/10 hover:border-[#ec4899]/60 text-left transition-all active:scale-[0.98] flex items-center gap-2.5 group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0a0d18] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#ec4899]/50 transition-colors">
                {renderSectorIcon(zone.iconName, zone.iconColor)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-xs text-white truncate">
                  {zone.name}
                </div>
                <div className="text-[10px] text-[#ec4899] font-bold tracking-wide">
                  {isWon ? 'Round Ended' : probesLeft <= 0 ? 'No Probes' : 'Scan Sector'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 5. Next Challenge Button (Prominent CTA when round finished) */}
      <button
        type="button"
        onClick={handleNextChallenge}
        className={`w-full py-3 rounded-xl font-display font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] ${
          isWon
            ? 'bg-gradient-to-r from-[#00f0ff] to-[#ec4899] text-[#0a0b14] shadow-glow-dual hover:brightness-110'
            : 'bg-[#080b16] hover:bg-[#101626] border border-[#00f0ff]/35 hover:border-[#00f0ff] text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.15)]'
        }`}
      >
        <span>↻</span>
        <span>
          {isWon
            ? 'Load Next Friend Challenge →'
            : probesLeft === 0
            ? 'Skip & Load Next Challenge (3 Probes)'
            : 'Load Next Friend Challenge'}
        </span>
      </button>
    </div>
  );
};
