import React, { useState } from 'react';
import { Check, Copy, Send, Sparkles, X, ExternalLink } from 'lucide-react';
import { playSound } from '../utils/sound';
import { buildChallengeShareUrl, copyTextSafely, shareInTelegram, triggerHaptic } from '../utils/telegram';

interface ChallengeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  stashedAmount: number;
  zoneId: string;
  locationName: string;
  friendHandle: string;
  clue: string;
}

export const ChallengeShareModal: React.FC<ChallengeShareModalProps> = ({
  isOpen,
  onClose,
  stashedAmount,
  zoneId,
  locationName,
  friendHandle,
  clue,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = buildChallengeShareUrl({
    zoneId,
    friendHandle,
    bounty: stashedAmount,
  });

  const shareMessage = `🏴‍☠️ I hid ${stashedAmount} MCH for ${friendHandle} in MyCoinHarvest! Clue: "${clue || 'Crack my secret sector!'}" Can you find it in 3 probes?`;

  const handleCopy = async () => {
    playSound('coin');
    triggerHaptic('light');
    const ok = await copyTextSafely(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleTelegramShare = () => {
    playSound('coin');
    triggerHaptic('success');
    shareInTelegram(shareUrl, shareMessage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d111e] w-full max-w-sm rounded-3xl p-5 border border-[#00f0ff]/50 shadow-[0_0_32px_rgba(0,240,255,0.3)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔐</span>
            <div>
              <h3 className="font-display font-extrabold text-base text-white">
                Stash Locked & Tagged!
              </h3>
              <p className="text-[11px] text-[#00f0ff] font-semibold">
                Ready to send to {friendHandle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playSound('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
            aria-label="Close share modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Challenge Summary Card */}
        <div className="bg-[#080b16] border border-white/10 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Tagged Friend:</span>
            <span className="font-display font-bold text-xs text-[#00f0ff]">{friendHandle}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Bounty Stashed:</span>
            <span className="font-display font-extrabold text-sm text-[#fbbf24] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {stashedAmount} MCH
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Hiding Zone:</span>
            <span className="text-xs font-semibold text-white">{locationName}</span>
          </div>
          {clue && (
            <div className="pt-1 border-t border-white/5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Clue:</span>
              <p className="text-xs text-slate-300 italic">&ldquo;{clue}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Telegram Direct Link Box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400">
            Telegram Mini-App Challenge Link:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 bg-[#13192c] border border-white/15 rounded-xl px-3 py-2 text-[11px] text-slate-200 outline-none font-mono"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="bg-[#00f0ff] hover:bg-[#00f0ff]/90 text-[#0a0b14] font-display font-bold text-xs px-3.5 py-2 rounded-xl transition active:scale-95 shrink-0 flex items-center gap-1 shadow-glow-cyan"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Primary Action: Share Directly in Telegram */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleTelegramShare}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#ec4899] text-[#0a0b14] font-display font-extrabold text-xs tracking-wider uppercase transition active:scale-95 flex items-center justify-center gap-1.5 shadow-glow-dual"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Challenge in Telegram</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('tap');
              onClose();
            }}
            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-display font-bold text-xs transition active:scale-95"
          >
            Done &amp; Start Next Round
          </button>
        </div>
      </div>
    </div>
  );
};
