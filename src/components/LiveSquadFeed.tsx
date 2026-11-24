import React from 'react';
import { ActivityItem } from '../types';

interface LiveSquadFeedProps {
  activity: ActivityItem[];
}

export const LiveSquadFeed: React.FC<LiveSquadFeedProps> = ({ activity }) => {
  const getDotClass = (dotColor: ActivityItem['dotColor']) => {
    switch (dotColor) {
      case 'cyan':
        return 'bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]';
      case 'gold':
        return 'bg-[#fbbf24] shadow-[0_0_6px_#fbbf24]';
      case 'pink':
        return 'bg-[#ec4899] shadow-[0_0_6px_#ec4899]';
      default:
        return 'bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]';
    }
  };

  // Show latest 6 entries so the mobile feed remains compact and readable
  const visibleItems = activity.slice(0, 6);

  return (
    <div className="bg-[#0d111e]/90 border border-white/10 rounded-2xl p-3.5 space-y-2.5 shadow-md backdrop-blur-md">
      {/* Header: Green status dot + "Recent Raids & Tags" on left, "Live Squad Feed" in gray on right */}
      <div className="flex items-center justify-between">
        <span className="font-display font-bold text-xs sm:text-[13px] text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_6px_#22c55e]" />
          Recent Raids & Tags
        </span>
        <span className="text-[10px] text-slate-400 font-mono tracking-wider">
          Live Squad Feed
        </span>
      </div>

      {/* List of Live Activity Rows (allows clean wrapping instead of cutting off names/bounties) */}
      <div className="space-y-1.5 text-xs">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-2.5 bg-[#090c17]/95 border border-white/5 rounded-xl px-3 py-2 transition-colors hover:border-white/15"
          >
            {/* Left: Colored Status Dot + Readable Text */}
            <div className="flex items-start gap-2 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 mt-1.5 transition-all ${getDotClass(
                  item.dotColor
                )}`}
              />
              <span className="text-slate-300 text-[11px] sm:text-xs leading-snug break-words">
                {item.fullText ? (
                  item.fullText
                ) : (
                  <>
                    <strong className="text-white font-semibold">{item.user}</strong>{' '}
                    {item.action}
                  </>
                )}
              </span>
            </div>

            {/* Right: Relative Timestamp in Gray */}
            <span className="text-[10px] text-slate-500 font-mono shrink-0 whitespace-nowrap mt-0.5">
              {item.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
