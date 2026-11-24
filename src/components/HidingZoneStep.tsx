import React from 'react';
import { HidingZone } from '../types';
import { HIDING_ZONES } from '../data/constants';
import { playSound } from '../utils/sound';
import { 
  Lock, 
  TreePine, 
  Train, 
  Radio, 
  Anchor, 
  Gamepad2, 
  Milestone, 
  ShieldCheck 
} from 'lucide-react';

interface HidingZoneStepProps {
  selectedZoneId: string;
  onSelectZone: (zone: HidingZone) => void;
}

export const HidingZoneStep: React.FC<HidingZoneStepProps> = ({
  selectedZoneId,
  onSelectZone,
}) => {
  const currentZone = HIDING_ZONES.find((z) => z.id === selectedZoneId) || HIDING_ZONES[0];

  const renderSectorIcon = (iconName: HidingZone['iconName'], color: string) => {
    const iconClass = "w-5 h-5";
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

  const handleCardClick = (zone: HidingZone) => {
    playSound('tap');
    onSelectZone(zone);
  };

  return (
    <div className="bg-[#0d111e]/90 border border-white/10 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-lg backdrop-blur-md">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-sm text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-0.5 rounded-md border border-[#00f0ff]/30">
            02
          </span>
          <h2 className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
            Pick Hiding Zone (8 Spots)
          </h2>
        </div>
        <span className="text-xs font-bold text-[#00f0ff] tracking-wide font-display">
          {currentZone.name}
        </span>
      </div>

      {/* 2-column x 4-row Grid of 8 Sector Cards */}
      <div className="grid grid-cols-2 gap-2">
        {HIDING_ZONES.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          return (
            <button
              key={zone.id}
              onClick={() => handleCardClick(zone)}
              className={`relative p-2.5 rounded-xl text-left transition-all duration-200 active:scale-[0.98] flex items-start gap-2.5 ${
                isSelected
                  ? 'bg-[#0e2d3a] border-2 border-[#00f0ff] shadow-glow-cyan'
                  : 'bg-[#13192c] border border-white/10 hover:border-white/20 hover:bg-[#182038]'
              }`}
            >
              {/* Icon Container */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected ? 'bg-[#00f0ff]/20' : 'bg-[#0a0d18]'
                }`}
              >
                {renderSectorIcon(zone.iconName, zone.iconColor)}
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-xs sm:text-[13px] text-white truncate leading-tight">
                  {zone.name}
                </div>
                <div className="text-[10px] font-semibold text-[#00f0ff] truncate leading-tight mt-0.5">
                  {zone.subtitle}
                </div>
                <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                  {zone.description}
                </div>
              </div>

              {/* Active Selector Pill Indicator */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
