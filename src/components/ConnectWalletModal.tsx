import React from 'react';
import { MchEmblem } from './MchEmblem';
import { X, ShieldCheck, ExternalLink } from 'lucide-react';
import { playSound } from '../utils/sound';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  onConnect,
  onDisconnect,
}) => {
  if (!isOpen) return null;

  const handleSelect = (_provider: string, address: string) => {
    playSound('coin');
    onConnect(address);
    onClose();
  };

  const handleDisconnect = () => {
    playSound('clear');
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
                Connect Wallet
              </h3>
              <p className="text-[11px] text-[#00f0ff] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Polygon PoS & TON • Non-Custodial
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

        <p className="text-xs text-slate-300 leading-relaxed">
          Connect your self-custody wallet to <strong className="text-[#00f0ff]">mycoinharvest.com</strong>. Your private keys stay safely in your control.
        </p>

        {/* Provider Options */}
        <div className="space-y-2">
          <button
            onClick={() => handleSelect('MetaMask', '0x71C...9A4E')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#13192c] hover:bg-white/10 border border-white/10 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🦊</span>
              <span className="font-display font-bold text-sm text-white">MetaMask</span>
            </div>
            <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1">
              Connect <ExternalLink className="w-3 h-3" />
            </span>
          </button>

          <button
            onClick={() => handleSelect('Trust Wallet', '0x94B...5F22')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#13192c] hover:bg-white/10 border border-white/10 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🛡️</span>
              <span className="font-display font-bold text-sm text-white">Trust Wallet</span>
            </div>
            <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1">
              Connect <ExternalLink className="w-3 h-3" />
            </span>
          </button>

          <button
            onClick={() => handleSelect('Telegram TON Wallet', 'UQAf...889A')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#13192c] hover:bg-white/10 border border-white/10 transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💎</span>
              <span className="font-display font-bold text-sm text-white">Telegram TON Wallet</span>
            </div>
            <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1">
              Connect <ExternalLink className="w-3 h-3" />
            </span>
          </button>
        </div>

        {/* If already connected, show disconnect option */}
        {walletAddress && (
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handleDisconnect}
              className="w-full py-2.5 rounded-2xl bg-[#ec4899]/15 hover:bg-[#ec4899]/25 border border-[#ec4899]/50 text-[#ec4899] font-display font-bold text-xs transition active:scale-95"
            >
              Disconnect {walletAddress}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
