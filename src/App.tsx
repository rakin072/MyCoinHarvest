import React, { useState } from 'react';
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
import { HIDING_ZONES, INITIAL_ACTIVITY, RAID_CHALLENGES } from './data/constants';
import { ActivityItem, HidingZone } from './types';
import { playSound } from './utils/sound';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  // Global App State
  const [mchBalance, setMchBalance] = useState<number>(1000);
  const [stashedBounty, setStashedBounty] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'hide' | 'raid'>('hide');
  const [streak, setStreak] = useState<number>(2);

  // Interactive Chest & Gameplay State
  const [isChestOpen, setIsChestOpen] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<HidingZone>(HIDING_ZONES[0]);
  const [clue, setClue] = useState<string>('Look where neon signals bounce off steel...');
  const [selectedFriend, setSelectedFriend] = useState<string>('@Alex');
  const [customFriend, setCustomFriend] = useState<string>('');
  
  // Raid Challenge State
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const currentRaidChallenge = RAID_CHALLENGES[currentChallengeIndex % RAID_CHALLENGES.length];
  const [raidProbesLeft, setRaidProbesLeft] = useState<number>(3);
  const [raidGuessedIds, setRaidGuessedIds] = useState<string[]>([]);
  const [raidIsWon, setRaidIsWon] = useState<boolean>(false);

  // Modals & Store State
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(false);
  const [storeTab, setStoreTab] = useState<'probes' | 'coins'>('probes');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Activity Feed
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
  const [customEmblemSrc, setCustomEmblemSrc] = useState<string | null>(null);

  // File handler for optional local image testing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomEmblemSrc(url);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Store Handler
  const handleOpenStore = (tab: 'probes' | 'coins' = 'probes') => {
    setStoreTab(tab);
    setIsStoreOpen(true);
  };

  // Purchase Success Callback
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
      showToast(`Purchased ${pack.name} via ${paymentMethod}! Probes refilled.`);
    } else if (pack.type === 'coins') {
      const addedCoins = pack.coins || 1000;
      setMchBalance((prev) => prev + addedCoins);
      showToast(`Purchased ${pack.name} via ${paymentMethod}! Added to balance.`);
    }
  };

  // Coin Loading Handlers (Step 01 inside the Master Treasure Box)
  const handleAddCoins = (amount: number) => {
    if (mchBalance < amount) {
      showToast('Not enough MCH Coins! Opening store...');
      handleOpenStore('coins');
      return;
    }
    setMchBalance((prev) => prev - amount);
    setStashedBounty((prev) => prev + amount);
    setIsChestOpen(true); // Automatically opens chest if closed
  };

  const handleAddMaxHalf = () => {
    const half = Math.floor(mchBalance / 2);
    if (half <= 0) return;
    setMchBalance((prev) => prev - half);
    setStashedBounty((prev) => prev + half);
    setIsChestOpen(true);
  };

  const handleResetStash = () => {
    if (stashedBounty <= 0) return;
    setMchBalance((prev) => prev + stashedBounty);
    setStashedBounty(0);
    showToast('Reset! Returned stashed bounty to balance.');
  };

  // Lock Stash & Tag CTA (Step 03)
  const handleLockAndTag = () => {
    const targetFriend = customFriend.trim()
      ? (customFriend.startsWith('@') ? customFriend : `@${customFriend}`)
      : selectedFriend;

    // Confetti effect
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
    });

    playSound('lock');

    // Add to Live Squad Feed with Cyan dot
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      fullText: `You hid ${stashedBounty} MCH in ${selectedZone.name} and tagged ${targetFriend}`,
      timestamp: 'Just now',
      dotColor: 'cyan',
      type: 'stash',
    };
    setActivityFeed((prev) => [newActivity, ...prev]);

    // Open Share Modal
    setIsShareModalOpen(true);

    // Increment streak
    setStreak((prev) => prev + 1);

    // Reset stashed bounty for next round
    setStashedBounty(0);
  };

  // Claim Bounty from Raid Mode
  const handleClaimRaidBounty = (bounty: number, locationName: string, challenger: string) => {
    setMchBalance((prev) => prev + bounty);
    setStreak((prev) => prev + 1);
    setIsChestOpen(true);

    // Add to Live Squad Feed with Gold dot
    const newActivity: ActivityItem = {
      id: `raid-${Date.now()}`,
      fullText: `You cracked ${challenger}'s stash in ${locationName} (+${bounty} MCH)`,
      timestamp: 'Just now',
      dotColor: 'gold',
      type: 'raid',
    };
    setActivityFeed((prev) => [newActivity, ...prev]);
  };

  const effectiveFriendDisplay = customFriend.trim()
    ? (customFriend.startsWith('@') ? customFriend : `@${customFriend}`)
    : selectedFriend;

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white font-sans cyber-bg-pattern no-select selection:bg-[#00f0ff]/30">
      {/* Mobile Viewport Container */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col pb-8 relative">
        
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
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
        />

        {/* Inner Content Area */}
        <main className="flex-1 px-3.5 pt-3 space-y-3.5">
          
          {/* 2. Player Stats Row with "+ Buy Plays / Coins" Button */}
          <PlayerStats 
            mchBalance={mchBalance} 
            streak={streak} 
            onOpenStore={handleOpenStore}
          />

          {/* 3. Mode Switcher Tabs */}
          <ModeTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ================= VIEW 1: HIDE & TAG FRIEND ================= */}
          {activeTab === 'hide' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* EXACT Box Container from Reference Image 2:
                  Contains Top Bar, Animated Chest with Official Tree MCH Logo,
                  Bounty Status Bar with Reset, and Step 01 Coin Loading Controls! */}
              <TreasureChest2D
                isOpen={isChestOpen}
                onToggle={() => setIsChestOpen((prev) => !prev)}
                stashedBounty={stashedBounty}
                bonusStealth={selectedZone.bonusStealth}
                onReset={handleResetStash}
                customImageSrc={customEmblemSrc}
                mchBalance={mchBalance}
                onAddCoins={handleAddCoins}
                onAddMaxHalf={handleAddMaxHalf}
              />

              {/* Step 02 Pick Hiding Zone (8 Spots) */}
              <HidingZoneStep
                selectedZoneId={selectedZone.id}
                onSelectZone={(zone) => setSelectedZone(zone)}
              />

              {/* Step 03 Drop Clue & Tag Friend */}
              <DropClueStep
                clue={clue}
                onClueChange={setClue}
                selectedFriend={selectedFriend}
                onSelectFriend={setSelectedFriend}
                customFriend={customFriend}
                onCustomFriendChange={setCustomFriend}
                stashedBounty={stashedBounty}
                onLockAndTag={handleLockAndTag}
              />
            </div>
          )}

          {/* ================= VIEW 2: RAID FRIEND'S STASH ================= */}
          {activeTab === 'raid' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Keep the interactive 2D Treasure Chest at the top */}
              <TreasureChest2D
                isOpen={isChestOpen}
                onToggle={() => setIsChestOpen((prev) => !prev)}
                stashedBounty={currentRaidChallenge.bounty}
                bonusStealth="+20% Radar Bonus"
                onReset={() => {}}
                customImageSrc={customEmblemSrc}
                mchBalance={mchBalance}
              />

              {/* Target Info Header, Clue Box, Scanner Grid & Out of Probes Refill */}
              <RaidView 
                onClaimBounty={handleClaimRaidBounty}
                onChestCrack={() => setIsChestOpen(true)}
                currentChallengeIndex={currentChallengeIndex}
                onCycleChallenge={() => {
                  setCurrentChallengeIndex((prev) => prev + 1);
                  setRaidProbesLeft(3);
                  setRaidGuessedIds([]);
                  setRaidIsWon(false);
                }}
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

          {/* Quick Emblem Asset Tester / Support for IMG_0900.jpeg */}
          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span>Emblem Asset:</span>
              <span className="text-slate-300 font-mono">
                {customEmblemSrc ? 'Custom Uploaded' : 'Official IMG_0900.jpeg Logo'}
              </span>
            </span>
            <label className="text-[#00f0ff] hover:underline cursor-pointer font-medium">
              Change Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </main>

        {/* Buy Plays & MCH Coins Payment Store Modal */}
        <BuyStoreModal
          isOpen={isStoreOpen}
          onClose={() => setIsStoreOpen(false)}
          initialTab={storeTab}
          onPurchaseSuccess={handlePurchaseSuccess}
        />

        {/* Connect Wallet Modal */}
        <ConnectWalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          walletAddress={walletAddress}
          onConnect={(addr) => setWalletAddress(addr)}
          onDisconnect={() => setWalletAddress(null)}
        />

        {/* Challenge Share Modal */}
        <ChallengeShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          stashedAmount={stashedBounty || 150}
          locationName={selectedZone.name}
          friendHandle={effectiveFriendDisplay}
          clue={clue}
        />

      </div>
    </div>
  );
};

export default App;
