import React, { useState } from 'react';
import { MchEmblem } from './MchEmblem';
import { X, ShieldCheck, ExternalLink, Copy, Check } from 'lucide-react';
import { playSound } from '../utils/sound';
import { copyTextSafely, triggerHaptic } from '../utils/telegram';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  onConnect: (address: string, providerName: string) => void;
  onDisconnect: () => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  onConnect,
  onDisconnect,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelect = async (provider: string, fallbackAddress: string) => {
    playSound('coin');
    triggerHaptic('success');

    // Attempt native EIP-1193 connection if injected (e.g. MetaMask Mobile / Trust DApp browser)
    if (provider !== 'Telegram TON Wallet') {
      try {
        const eth = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
        if (eth?.request) {
          const accounts = await eth.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts[0]) {
            const addr = `${accounts[0].slice(0, 5)}...${accounts[0].slice(-4)}`;
            onConnect(addr, provider);
            onClose();
            return;
          }
        }
      } catch {
        // Fall back to demo wallet connection if rejected or unavailable
      }
    }

    onConnect(fallbackAddress, provider);
    onClose();
  };

  const handleCopy = async () => {
    if (!walletAddress) return;
    playSound('tap');
    const ok = await copyTextSafely(walletAddress);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleDisconnect = () => {
    playSound('clear');
    triggerHaptic('light');
    onDisconnect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0d111e] w-full max-w-sm rounded-3xl p-5 border border-[#00f0ff]/40 shadow-[0_0_32px_rgba(0,240,255,0.25)] space-y-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MchEmblem size={36} showGoldRing={true} />
            <div>
              <h3 className="font-display font-extrabold text-base text-white">
                {walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
              </h3>
              <p className="text-[11px] text-[#00f0ff] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Polygon PoS &amp; TON • Non-Custodial
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
            aria-label="Close wallet modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {walletAddress ? (
          <div className="bg-[#080b16] border border-[#00f0ff]/35 rounded-2xl p-3 flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Active Address</div>
              <div className="font-mono text-sm font-bold text-[#00f0ff]">{walletAddress}</div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-300 leading-relaxed">
            Connect your self-custody wallet to <strong className="text-[#00f0ff]">mycoinharvest.com</strong>. Your private keys stay safely in your control.
          </p>
        )}

        {/* Provider Options */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleSelect('MetaMask', '0x71C...9A4E')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#13192c] hover:bg-white/10 border border-white/10 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🦊</span>
              <span className="font-display font-bold text-sm text-white">MetaMask</span>
            </div>
            <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1">
              {walletAddress ? 'Switch' : 'Connect'} <ExternalLink className="w-3 h-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('Trust Wallet', '0x94B...5F22')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#13192c] hover:bg-white/10 border border-white/10 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🛡️</span>
              <span className="font-display font-bold text-sm text-white">Trust Wallet</span>
            </div>
            <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1">
              {walletAddress ? 'Switch' : 'Connect'} <ExternalLink className="w-3 h-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('Telegram TON Wallet', 'UQAf...889A')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#13192c] hover:bg-white/10 border border-white/10 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💎</span>
              <span className="font-display font-bold text-sm text-white">Telegram TON Wallet</span>
            </div>
            <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1">
              {walletAddress ? 'Switch' : 'Connect'} <ExternalLink className="w-3 h-3" />
            </span>
          </button>
        </div>

        {/* Disconnect option */}
        {walletAddress && (
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleDisconnect}
              className="w-full py-2.5 rounded-2xl bg-[#ec4899]/15 hover:bg-[#ec4899]/25 border border-[#ec4899]/50 text-[#ec4899] font-display font-bold text-xs transition active:scale-95"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
