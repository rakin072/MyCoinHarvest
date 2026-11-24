import React from 'react';
import { Volume2, VolumeX, X, HelpCircle, RotateCcw, ImagePlus } from 'lucide-react';
import { playSound } from '../utils/sound';
import { triggerHaptic } from '../utils/telegram';

interface HelpSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  customEmblemSrc: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetEmblem: () => void;
  onResetProgress: () => void;
}

export const HelpSettingsModal: React.FC<HelpSettingsModalProps> = ({
  isOpen,
  onClose,
  soundOn,
  onToggleSound,
  customEmblemSrc,
  onImageUpload,
  onResetEmblem,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d111e] w-full max-w-sm rounded-3xl p-5 border border-[#00f0ff]/45 shadow-[0_0_32px_rgba(0,240,255,0.25)] space-y-4 max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#00f0ff]" />
            <h3 className="font-display font-extrabold text-base text-white">
              How to Play & Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              playSound('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Game Guide */}
        <div className="bg-[#080b16] border border-white/10 rounded-2xl p-3.5 space-y-2.5 text-xs">
          <div className="font-display font-bold text-[#00f0ff] uppercase tracking-wider text-[10px]">
            2 Game Modes
          </div>
          <div className="space-y-1.5 text-slate-300 leading-relaxed">
            <p>
              <strong className="text-white">🔒 Hide & Tag Friend:</strong> Load MCH coins into your vault, pick 1 of 8 cyber sectors, drop a riddle, and share your Telegram link.
            </p>
            <p>
              <strong className="text-white">📡 Raid Friend&apos;s Stash:</strong> Read the intercepted clue and use 3 Scanner Probes. <span className="text-[#fb923c] font-semibold">🔥 Hot</span> means within 2 sectors; <span className="text-[#00f0ff] font-semibold">❄️ Cold</span> means farther away!
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <div className="font-display font-bold text-slate-400 uppercase tracking-wider text-[10px]">
            Preferences
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onToggleSound();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#13192c] hover:bg-white/10 border border-white/10 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-[#00f0ff]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="font-display font-bold text-xs text-white">
                Sound Effects
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                soundOn
                  ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              {soundOn ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Custom Chest Emblem */}
          <div className="p-3 rounded-2xl bg-[#13192c] border border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <ImagePlus className="w-4 h-4 text-[#ec4899] shrink-0" />
              <div className="min-w-0">
                <div className="font-display font-bold text-xs text-white">
                  Chest Emblem
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {customEmblemSrc ? 'Custom image active' : 'Official MCH Logo'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {customEmblemSrc && (
                <button
                  type="button"
                  onClick={() => {
                    playSound('tap');
                    onResetEmblem();
                  }}
                  className="px-2 py-1 rounded-lg bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white"
                >
                  Default
                </button>
              )}
              <label className="px-2.5 py-1 rounded-lg bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/25 cursor-pointer text-[11px] font-bold">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Demo Progress */}
          <button
            type="button"
            onClick={() => {
              playSound('clear');
              triggerHaptic('warning');
              onResetProgress();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#ec4899]/10 hover:bg-[#ec4899]/20 border border-[#ec4899]/30 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#ec4899]" />
              <span className="font-display font-bold text-xs text-[#ec4899]">
                Reset Game Balance & Feed
              </span>
            </div>
            <span className="text-[10px] text-slate-400">1,000 MCH</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            playSound('tap');
            onClose();
          }}
          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#ec4899] text-[#0a0b14] font-display font-extrabold text-xs uppercase tracking-wider transition active:scale-95"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
