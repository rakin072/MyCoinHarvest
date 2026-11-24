import React, { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { PlayerStats } from './components/PlayerStats';
import { ModeTabs } from './components/ModeTabs';
import { TreasureChest2D } from './components/TreasureChest2D';
import { HidingZoneStep } from './components/HidingZoneStep';
import { DropClueStep } from './components/DropClueStep';
import { RaidView } from './components/RaidView';
import { LiveSquadFeed } from './components/LiveSquadFeed';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { ChallengeShareModal } from './components/ChallengeShareModal';
import { BuyStoreModal, StorePack } from './components/BuyStoreModal';
import { HelpSettingsModal } from './components/HelpSettingsModal';
import { HIDING_ZONES, INITIAL_ACTIVITY, RAID_CHALLENGES } from './data/constants';
import { ActivityItem, HidingZone, RaidChallenge } from './types';
import { playSound, setSoundEnabled } from './utils/sound';
import {
  getIncomingStartChallenge,
  getTelegramUser,
  initTelegramWebApp,
  triggerHaptic,
} from './utils/telegram';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'mch_miniapp_state_v1';

interface PersistedState {
  mchBalance: number;
  stashedBounty: number;
  streak: number;
  walletAddress: string | null;
  activityFeed: ActivityItem[];
  soundOn: boolean;
}

interface LockedChallengeSnapshot {
  amount: number;
  zoneId: string;
  locationName: string;
  friendHandle: string;
  clue: string;
}

function loadSavedState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export const App: React.FC = () => {
  const saved = useRef(loadSavedState()).current;

  // Global App State (hydrated from localStorage when available)
  const [mchBalance, setMchBalance] = useState<number>(
    typeof saved.mchBalance === 'number' ? saved.mchBalance : 1000
  );
  const [stashedBounty, setStashedBounty] = useState<number>(
    typeof saved.stashedBounty === 'number' ? saved.stashedBounty : 100
  );
  const [activeTab, setActiveTab] = useState<'hide' | 'raid'>('hide');
  const [streak, setStreak] = useState<number>(
    typeof saved.streak === 'number' ? saved.streak : 2
  );
  const [soundOn, setSoundOn] = useState<boolean>(
    typeof saved.soundOn === 'boolean' ? saved.soundOn : true
  );

  // Telegram user info
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);

  // Interactive Chest & Hide Mode State
  const [isHideChestOpen, setIsHideChestOpen] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<HidingZone>(HIDING_ZONES[0]);
  const [clue, setClue] = useState<string>('Look where neon signals bounce off steel...');
  const [selectedFriend, setSelectedFriend] = useState<string>('@Alex');
  const [customFriend, setCustomFriend] = useState<string>('');
  const [lastLockedChallenge, setLastLockedChallenge] = useState<LockedChallengeSnapshot | null>(null);

  // Raid Mode State
  const [incomingChallenge, setIncomingChallenge] = useState<RaidChallenge | null>(null);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [isRaidChestOpen, setIsRaidChestOpen] = useState<boolean>(false);
  const [raidProbesLeft, setRaidProbesLeft] = useState<number>(3);
  const [raidGuessedIds, setRaidGuessedIds] = useState<string[]>([]);
  const [raidIsWon, setRaidIsWon] = useState<boolean>(false);
  const [claimedChallengeIds, setClaimedChallengeIds] = useState<string[]>([]);

  // Modals & Store State
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(false);
  const [storeTab, setStoreTab] = useState<'probes' | 'coins'>('probes');
  const [walletAddress, setWalletAddress] = useState<string | null>(
    typeof saved.walletAddress === 'string' ? saved.walletAddress : null
  );
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Activity Feed & Custom Emblem
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(
    Array.isArray(saved.activityFeed) && saved.activityFeed.length > 0
      ? saved.activityFeed
      : INITIAL_ACTIVITY
  );
  const [customEmblemSrc, setCustomEmblemSrc] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 3200);
  };

  // Sync sound setting
  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  // Initialize Telegram Mini-App SDK & parse deep-link challenge (?startapp=...)
  useEffect(() => {
    initTelegramWebApp();
    const user = getTelegramUser();
    if (user) {
      setTelegramUsername(user.username ? `@${user.username}` : user.first_name);
    }

    const parsed = getIncomingStartChallenge();
    if (parsed) {
      const matchedZone =
        HIDING_ZONES.find((z) => z.id === parsed.zoneId) ||
        HIDING_ZONES.find(
          (z) => z.name.toLowerCase() === (parsed.zoneName || '').toLowerCase()
        ) ||
        HIDING_ZONES[0];

      const linkedChallenge: RaidChallenge = {
        id: `link-${Date.now()}`,
        challenger: parsed.challenger,
        avatar: '🎯',
        bounty: parsed.bounty,
        clue: `Tagged challenge from ${parsed.challenger} — crack their ${parsed.bounty} MCH vault in 3 probes!`,
        targetZoneId: matchedZone.id,
      };
      setIncomingChallenge(linkedChallenge);
      setActiveTab('raid');
      setRaidProbesLeft(3);
      setRaidGuessedIds([]);
      setRaidIsWon(false);
      setIsRaidChestOpen(false);
      showToast(`Challenge loaded for ${parsed.challenger} (${parsed.bounty} MCH)!`);
    }
  }, []);

  // Persist user progress cleanly
  useEffect(() => {
    try {
      const payload: PersistedState = {
        mchBalance,
        stashedBounty,
        streak,
        walletAddress,
        activityFeed: activityFeed.slice(0, 15),
        soundOn,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [mchBalance, stashedBounty, streak, walletAddress, activityFeed, soundOn]);

  const activeRaidChallenge: RaidChallenge =
    incomingChallenge || RAID_CHALLENGES[currentChallengeIndex % RAID_CHALLENGES.length];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomEmblemSrc(url);
      showToast('Custom chest emblem updated!');
    }
  };

  const handleToggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      if (next) playSound('tap');
      showToast(next ? 'Sound effects enabled' : 'Sound effects muted');
      return next;
    });
  };

  const handleOpenStore = (tab: 'probes' | 'coins' = 'probes') => {
    setStoreTab(tab);
    setIsStoreOpen(true);
  };

  const handlePurchaseSuccess = (pack: StorePack, paymentMethod: string) => {
    playSound('win');
    confetti({
      particleCount: 60,
      spread: 75,
      origin: { y: 0.6 },
    });

    if (pack.type === 'probes') {
      const addedProbes = pack.probes || 3;
      setRaidProbesLeft((prev) => prev + addedProbes);
      if (pack.streakBoost) {
        setStreak((prev) => prev + (pack.streakBoost || 0));
      }
      showToast(`Credited ${pack.name} via ${paymentMethod}!`);
    } else if (pack.type === 'coins') {
      const addedCoins = pack.coins || 1000;
      setMchBalance((prev) => prev + addedCoins);
      showToast(`Credited ${pack.name} via ${paymentMethod}!`);
    }
  };

  // Free starter drop when user runs completely dry
  const handleClaimFreeCoins = () => {
    setMchBalance((prev) => prev + 200);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
    showToast('Harvested +200 MCH starter drop!');
  };

  // Coin Loading Handlers (Step 01)
  const handleAddCoins = (amount: number) => {
    if (mchBalance < amount) {
      showToast('Not enough MCH Coins! Opening Coin Store...');
      handleOpenStore('coins');
      return;
    }
    setMchBalance((prev) => prev - amount);
    setStashedBounty((prev) => prev + amount);
    setIsHideChestOpen(true);
  };

  const handleAddMaxHalf = () => {
    const half = Math.floor(mchBalance / 2);
    if (half <= 0) {
      showToast('Balance too low! Claim free harvest or visit Store.');
      return;
    }
    setMchBalance((prev) => prev - half);
    setStashedBounty((prev) => prev + half);
    setIsHideChestOpen(true);
  };

  const handleResetStash = () => {
    if (stashedBounty <= 0) return;
    setMchBalance((prev) => prev + stashedBounty);
    setStashedBounty(0);
    showToast('Returned stashed bounty to your MCH balance.');
  };

  // Lock Stash & Tag CTA (Step 03)
  const handleLockAndTag = () => {
    if (stashedBounty <= 0) {
      showToast('Load at least +25 MCH into the vault first!');
      return;
    }

    const targetFriend = customFriend.trim()
      ? customFriend.startsWith('@')
        ? customFriend
        : `@${customFriend}`
      : selectedFriend;

    const lockedAmount = stashedBounty;
    const lockedClue = clue.trim() || `Hidden deep inside ${selectedZone.name}...`;

    // Snapshot locked challenge before resetting bounty so ShareModal shows exact values
    setLastLockedChallenge({
      amount: lockedAmount,
      zoneId: selectedZone.id,
      locationName: selectedZone.name,
      friendHandle: targetFriend,
      clue: lockedClue,
    });

    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
    });

    playSound('lock');

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      fullText: `You hid ${lockedAmount} MCH in ${selectedZone.name} and tagged ${targetFriend}`,
      timestamp: 'Just now',
      dotColor: 'cyan',
      type: 'stash',
    };
    setActivityFeed((prev) => [newActivity, ...prev.slice(0, 14)]);

    setIsShareModalOpen(true);
    setStreak((prev) => prev + 1);
    setStashedBounty(0);
    setIsHideChestOpen(false);
  };

  // Claim Bounty from Raid Mode (guarded against double-claim)
  const handleClaimRaidBounty = (
    bounty: number,
    locationName: string,
    challenger: string,
    challengeId: string
  ) => {
    if (claimedChallengeIds.includes(challengeId)) return;
    setClaimedChallengeIds((prev) => [...prev, challengeId]);

    setMchBalance((prev) => prev + bounty);
    setStreak((prev) => prev + 1);
    setIsRaidChestOpen(true);

    const newActivity: ActivityItem = {
      id: `raid-${Date.now()}`,
      fullText: `You cracked ${challenger}'s stash in ${locationName} (+${bounty} MCH)`,
      timestamp: 'Just now',
      dotColor: 'gold',
      type: 'raid',
    };
    setActivityFeed((prev) => [newActivity, ...prev.slice(0, 14)]);
    showToast(`Cracked ${challenger}'s vault! +${bounty} MCH added.`);
  };

  const handleCycleChallenge = () => {
    if (incomingChallenge) {
      setIncomingChallenge(null);
    } else {
      setCurrentChallengeIndex((prev) => prev + 1);
    }
    setRaidProbesLeft(3);
    setRaidGuessedIds([]);
    setRaidIsWon(false);
    setIsRaidChestOpen(false);
  };

  const handleResetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMchBalance(1000);
    setStashedBounty(100);
    setStreak(2);
    setWalletAddress(null);
    setActivityFeed(INITIAL_ACTIVITY);
    setIsHideChestOpen(false);
    setIsRaidChestOpen(false);
    setRaidProbesLeft(3);
    setRaidGuessedIds([]);
    setRaidIsWon(false);
    setClaimedChallengeIds([]);
    setIncomingChallenge(null);
    showToast('Game progress reset to 1,000 MCH!');
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white font-sans cyber-bg-pattern no-select selection:bg-[#00f0ff]/30">
      {/* Mobile Viewport Container with iOS Safe Area padding */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col pb-[max(2rem,env(safe-area-inset-bottom))] relative">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
            <div className="bg-[#0d1222]/95 border border-[#00f0ff] rounded-2xl px-4 py-3 shadow-[0_0_24px_rgba(0,240,255,0.4)] flex items-center gap-2.5">
              <span className="text-lg">⚡</span>
              <p className="font-bold text-xs text-white leading-snug">{toastMessage}</p>
            </div>
          </div>
        )}

        {/* 1. Persistent Top Header */}
        <Header
          walletAddress={walletAddress}
          onConnectWallet={() => setIsWalletModalOpen(true)}
          customImageSrc={customEmblemSrc}
          soundOn={soundOn}
          onToggleSound={handleToggleSound}
          onOpenHelp={() => setIsHelpOpen(true)}
          telegramUsername={telegramUsername}
        />

        {/* Inner Content Area */}
        <main className="flex-1 px-3.5 pt-3 space-y-3.5">
          {/* 2. Player Stats Row with "+ Buy Plays / Coins" Button */}
          <PlayerStats
            mchBalance={mchBalance}
            streak={streak}
            stashedBounty={stashedBounty}
            onOpenStore={handleOpenStore}
            onClaimFreeCoins={handleClaimFreeCoins}
          />

          {/* 3. Mode Switcher Tabs */}
          <ModeTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ================= VIEW 1: HIDE & TAG FRIEND ================= */}
          {activeTab === 'hide' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <TreasureChest2D
                mode="hide"
                isOpen={isHideChestOpen}
                onToggle={() => setIsHideChestOpen((prev) => !prev)}
                stashedBounty={stashedBounty}
                bonusStealth={selectedZone.bonusStealth}
                onReset={handleResetStash}
                customImageSrc={customEmblemSrc}
                mchBalance={mchBalance}
                onAddCoins={handleAddCoins}
                onAddMaxHalf={handleAddMaxHalf}
              />

              <HidingZoneStep
                selectedZoneId={selectedZone.id}
                onSelectZone={(zone) => {
                  triggerHaptic('selection');
                  setSelectedZone(zone);
                }}
              />

              <DropClueStep
                clue={clue}
                onClueChange={setClue}
                selectedFriend={selectedFriend}
                onSelectFriend={setSelectedFriend}
                customFriend={customFriend}
                onCustomFriendChange={setCustomFriend}
                stashedBounty={stashedBounty}
                mchBalance={mchBalance}
                onQuickLoad={handleAddCoins}
                onLockAndTag={handleLockAndTag}
              />
            </div>
          )}

          {/* ================= VIEW 2: RAID FRIEND'S STASH ================= */}
          {activeTab === 'raid' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <TreasureChest2D
                mode="raid"
                isOpen={isRaidChestOpen}
                onToggle={() => setIsRaidChestOpen((prev) => !prev)}
                stashedBounty={activeRaidChallenge.bounty}
                raidMeta={{
                  challenger: activeRaidChallenge.challenger,
                  isWon: raidIsWon,
                }}
                onReset={() => {}}
                customImageSrc={customEmblemSrc}
              />

              <RaidView
                challenge={activeRaidChallenge}
                challengeNumber={(currentChallengeIndex % RAID_CHALLENGES.length) + 1}
                totalChallenges={RAID_CHALLENGES.length}
                isIncomingLinkChallenge={Boolean(incomingChallenge)}
                onClaimBounty={handleClaimRaidBounty}
                onChestCrack={() => setIsRaidChestOpen(true)}
                onCycleChallenge={handleCycleChallenge}
                probesLeft={raidProbesLeft}
                setProbesLeft={setRaidProbesLeft}
                guessedIds={raidGuessedIds}
                setGuessedIds={setRaidGuessedIds}
                isWon={raidIsWon}
                setIsWon={setRaidIsWon}
                onOpenStore={handleOpenStore}
              />
            </div>
          )}

          {/* Persistent Bottom Component: Recent Raids & Tags (Live Squad Feed) */}
          <LiveSquadFeed activity={activityFeed} />
        </main>

        {/* Modals */}
        <BuyStoreModal
          isOpen={isStoreOpen}
          onClose={() => setIsStoreOpen(false)}
          initialTab={storeTab}
          onPurchaseSuccess={handlePurchaseSuccess}
        />

        <ConnectWalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          walletAddress={walletAddress}
          onConnect={(addr, provider) => {
            setWalletAddress(addr);
            showToast(`Connected ${provider} (${addr})`);
          }}
          onDisconnect={() => {
            setWalletAddress(null);
            showToast('Wallet disconnected');
          }}
        />

        <ChallengeShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          stashedAmount={lastLockedChallenge?.amount ?? 100}
          zoneId={lastLockedChallenge?.zoneId ?? selectedZone.id}
          locationName={lastLockedChallenge?.locationName ?? selectedZone.name}
          friendHandle={lastLockedChallenge?.friendHandle ?? selectedFriend}
          clue={lastLockedChallenge?.clue ?? clue}
        />

        <HelpSettingsModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          soundOn={soundOn}
          onToggleSound={handleToggleSound}
          customEmblemSrc={customEmblemSrc}
          onImageUpload={handleImageUpload}
          onResetEmblem={() => {
            setCustomEmblemSrc(null);
            showToast('Restored official MCH logo');
          }}
          onResetProgress={handleResetProgress}
        />
      </div>
    </div>
  );
};

export default App;
