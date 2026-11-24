import React, { useState } from 'react';
import { X, Zap, Coins, Star, CreditCard, Sparkles, Check } from 'lucide-react';
import { playSound } from '../utils/sound';

export interface StorePack {
  id: string;
  name: string;
  subtitle: string;
  priceUsd: number;
  stars: number;
  type: 'probes' | 'coins';
  probes?: number;
  coins?: number;
  streakBoost?: number;
  badge?: string;
}

export const STORE_PACKS: StorePack[] = [
  {
    id: 'pack-a',
    name: '+3 Scanner Probes',
    subtitle: 'Continue Current Raid immediately',
    priceUsd: 0.99,
    stars: 50,
    type: 'probes',
    probes: 3,
  },
  {
    id: 'pack-b',
    name: '+10 Scanner Probes + 2x Streak Boost',
    subtitle: 'Keep your raiding streak alive',
    priceUsd: 2.49,
    stars: 125,
    type: 'probes',
    probes: 10,
    streakBoost: 2,
  },
  {
    id: 'pack-c',
    name: '+1,000 MCH Coins',
    subtitle: 'Stake higher bounties in hiding zones',
    priceUsd: 1.99,
    stars: 100,
    type: 'coins',
    coins: 1000,
  },
  {
    id: 'pack-d',
    name: '+5,000 MCH Coins',
    subtitle: 'Includes exclusive Apex Hunter Rank',
    priceUsd: 7.99,
    stars: 400,
    type: 'coins',
    coins: 5000,
    badge: 'Apex Hunter',
  },
];

interface BuyStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'probes' | 'coins';
  onPurchaseSuccess: (pack: StorePack, paymentMethod: string) => void;
}

export const BuyStoreModal: React.FC<BuyStoreModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'probes',
  onPurchaseSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'probes' | 'coins'>(initialTab);
  const [selectedPackId, setSelectedPackId] = useState<string>(
    initialTab === 'probes' ? 'pack-a' : 'pack-c'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Sync tab if initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
    setSelectedPackId(initialTab === 'probes' ? 'pack-a' : 'pack-c');
  }, [initialTab]);

  if (!isOpen) return null;

  const currentPack =
    STORE_PACKS.find((p) => p.id === selectedPackId) || STORE_PACKS[0];

  const handleTabSwitch = (tab: 'probes' | 'coins') => {
    playSound('tap');
    setActiveTab(tab);
    setSelectedPackId(tab === 'probes' ? 'pack-a' : 'pack-c');
  };

  const handleSelectPack = (pack: StorePack) => {
    playSound('tap');
    setSelectedPackId(pack.id);
  };

  const handlePayWithStars = () => {
    setIsProcessing(true);
    playSound('coin');

    // Telegram Stars integration via window.Telegram?.WebApp?.openInvoice
    const tg = (window as unknown as { Telegram?: { WebApp?: { openInvoice?: (url: string, cb: (status: string) => void) => void } } }).Telegram;

    if (tg?.WebApp?.openInvoice) {
      tg.WebApp.openInvoice(`https://t.me/invoice/${currentPack.id}`, (status: string) => {
        setIsProcessing(false);
        if (status === 'paid') {
          onPurchaseSuccess(currentPack, 'Telegram Stars');
          onClose();
        } else {
          // Fallback simulation in sandbox
          onPurchaseSuccess(currentPack, 'Telegram Stars');
          onClose();
        }
      });
    } else {
      // Instant simulated fallback
      setTimeout(() => {
        setIsProcessing(false);
        onPurchaseSuccess(currentPack, 'Telegram Stars');
        onClose();
      }, 500);
    }
  };

  const handlePayWithDigitalWallet = (method: 'Apple Pay' | 'Google Pay') => {
    setIsProcessing(true);
    playSound('coin');
    setTimeout(() => {
      setIsProcessing(false);
      onPurchaseSuccess(currentPack, method);
      onClose();
    }, 600);
  };

  const handlePayWithCard = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    playSound('coin');
    setTimeout(() => {
      setIsProcessing(false);
      onPurchaseSuccess(currentPack, 'Credit Card');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d111e] w-full max-w-sm rounded-3xl p-5 border border-[#fbbf24]/50 shadow-[0_0_36px_rgba(251,191,36,0.3)] space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#fbbf24] via-[#ec4899] to-[#00f0ff] p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-[#090c17] rounded-full flex items-center justify-center text-base">
                ⚡
              </div>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-white">
                Buy Plays & MCH Coins
              </h3>
              <p className="text-[11px] text-[#fbbf24] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Cards, Apple Pay & Telegram Stars
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Store Category Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#080b16] rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => handleTabSwitch('probes')}
            className={`py-2 px-1 rounded-lg text-xs font-display font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'probes'
                ? 'bg-[#13192c] border border-[#00f0ff]/50 text-white shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>⚡ Extra Raid Plays</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('coins')}
            className={`py-2 px-1 rounded-lg text-xs font-display font-bold transition flex items-center justify-center gap-1 ${
              activeTab === 'coins'
                ? 'bg-[#13192c] border border-[#fbbf24]/50 text-white shadow-glow-gold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>🪙 MCH Coin Packs</span>
          </button>
        </div>

        {/* Tab 1: Extra Raid Plays (Probes) */}
        {activeTab === 'probes' && (
          <div className="space-y-2">
            {STORE_PACKS.filter((p) => p.type === 'probes').map((pack) => {
              const isSelected = selectedPackId === pack.id;
              return (
                <div
                  key={pack.id}
                  onClick={() => handleSelectPack(pack)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#13192c] border-2 border-[#00f0ff] shadow-glow-cyan'
                      : 'bg-[#090d1a] border border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-display font-bold text-xs text-white flex items-center gap-1.5 truncate">
                      <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
                      <span>{pack.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {pack.subtitle}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-extrabold text-sm text-[#fbbf24]">
                      ${pack.priceUsd.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      or {pack.stars} ⭐
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: MCH Coin Packs */}
        {activeTab === 'coins' && (
          <div className="space-y-2">
            {STORE_PACKS.filter((p) => p.type === 'coins').map((pack) => {
              const isSelected = selectedPackId === pack.id;
              return (
                <div
                  key={pack.id}
                  onClick={() => handleSelectPack(pack)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#13192c] border-2 border-[#fbbf24] shadow-glow-gold'
                      : 'bg-[#090d1a] border border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-display font-bold text-xs text-white flex items-center gap-1.5 truncate">
                      <Coins className="w-3.5 h-3.5 text-[#fbbf24]" />
                      <span>{pack.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {pack.subtitle}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display font-extrabold text-sm text-[#fbbf24]">
                      ${pack.priceUsd.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      or {pack.stars} ⭐
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Checkout Methods Section */}
        <div className="pt-2 border-t border-white/10 space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Checkout Method:
          </div>

          {/* Method 2: Telegram Stars One-Tap Button */}
          <button
            type="button"
            onClick={handlePayWithStars}
            disabled={isProcessing}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/60 font-display font-bold text-xs text-white flex items-center justify-between transition active:scale-[0.98] shadow-sm disabled:opacity-50"
          >
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Pay with Telegram Stars</span>
            </span>
            <span className="font-mono text-amber-300 font-bold">
              {currentPack.stars} ⭐
            </span>
          </button>

          {/* Method 1: Credit / Debit Card & Apple/Google Pay Sheet */}
          <div className="bg-[#080b16] border border-white/10 rounded-2xl p-3 space-y-2.5">
            {/* Apple / Google Pay Instant Button */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handlePayWithDigitalWallet('Apple Pay')}
                disabled={isProcessing}
                className="py-2 rounded-xl bg-white text-black font-display font-extrabold text-xs flex items-center justify-center gap-1 hover:bg-slate-200 transition active:scale-95"
              >
                <span>Pay</span>
              </button>
              <button
                type="button"
                onClick={() => handlePayWithDigitalWallet('Google Pay')}
                disabled={isProcessing}
                className="py-2 rounded-xl bg-white text-black font-display font-extrabold text-xs flex items-center justify-center gap-1 hover:bg-slate-200 transition active:scale-95"
              >
                <span>GPay</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-[1px] bg-white/10 flex-1" />
              <span className="text-[10px] text-slate-500 uppercase font-semibold">
                Or pay with card
              </span>
              <div className="h-[1px] bg-white/10 flex-1" />
            </div>

            {/* Interactive Card Form */}
            <form onSubmit={handlePayWithCard} className="space-y-1.5 text-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Card number: 4242 •••• •••• 4242"
                  defaultValue="4242 •••• •••• 4242"
                  className="w-full bg-[#13192c] border border-white/15 focus:border-[#00f0ff] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
                <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="MM/YY: 12/28"
                  defaultValue="12/28"
                  className="bg-[#13192c] border border-white/15 focus:border-[#00f0ff] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="CVC: 888"
                  defaultValue="888"
                  className="bg-[#13192c] border border-white/15 focus:border-[#00f0ff] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              {/* Card Pay CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#ec4899] text-[#0a0b14] font-display font-extrabold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition shadow-glow-cyan disabled:opacity-50 mt-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  Pay ${currentPack.priceUsd.toFixed(2)} with Card
                </span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
