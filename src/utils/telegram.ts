// Native Telegram Mini-App (WebApp SDK) integration helpers

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  initDataUnsafe?: {
    user?: TelegramUser;
    start_param?: string;
  };
}

export const TELEGRAM_MINIAPP_BASE_URL = 'https://t.me/mycoinharvest_bot/treasure';

function getTg(): TelegramWebApp | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
}

export function initTelegramWebApp(): void {
  try {
    const tg = getTg();
    if (!tg) return;
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#0a0b14');
    tg.setBackgroundColor?.('#0a0b14');
    tg.disableVerticalSwipes?.();
  } catch {
    // Running outside Telegram WebView
  }
}

export function getTelegramUser(): TelegramUser | null {
  try {
    return getTg()?.initDataUnsafe?.user ?? null;
  } catch {
    return null;
  }
}

export function triggerHaptic(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'
): void {
  try {
    const haptics = getTg()?.HapticFeedback;
    if (!haptics) return;
    if (type === 'selection') {
      haptics.selectionChanged();
    } else if (type === 'success' || type === 'warning' || type === 'error') {
      haptics.notificationOccurred(type);
    } else {
      haptics.impactOccurred(type);
    }
  } catch {
    // Ignore on unsupported devices/browsers
  }
}

export interface ParsedStartChallenge {
  zoneId?: string;
  zoneName?: string;
  challenger: string;
  bounty: number;
  clue?: string;
}

export function encodeChallengeStartParam(data: {
  zoneId: string;
  friendHandle: string;
  bounty: number;
}): string {
  const cleanFriend = data.friendHandle.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24) || 'Friend';
  return `${data.zoneId}__${cleanFriend}__${data.bounty}`;
}

export function getIncomingStartChallenge(): ParsedStartChallenge | null {
  try {
    const tgParam = getTg()?.initDataUnsafe?.start_param;
    const urlParams = new URLSearchParams(window.location.search);
    const param = tgParam || urlParams.get('tgWebAppStartParam') || urlParams.get('startapp');
    if (!param) return null;

    // Support both new `zoneId__friend__bounty` and legacy `location_friend_bounty`
    const parts = param.includes('__') ? param.split('__') : param.split('_');
    if (parts.length < 3) return null;

    const bounty = parseInt(parts[parts.length - 1], 10);
    const friendRaw = parts[parts.length - 2];
    const zoneRaw = parts.slice(0, parts.length - 2).join(' ');

    if (!zoneRaw || Number.isNaN(bounty) || bounty <= 0) return null;

    return {
      zoneId: zoneRaw.includes('-') ? zoneRaw : undefined,
      zoneName: zoneRaw,
      challenger: friendRaw.startsWith('@') ? friendRaw : `@${friendRaw}`,
      bounty,
    };
  } catch {
    return null;
  }
}

export function buildChallengeShareUrl(data: {
  zoneId: string;
  friendHandle: string;
  bounty: number;
}): string {
  const startParam = encodeChallengeStartParam(data);
  return `${TELEGRAM_MINIAPP_BASE_URL}?startapp=${encodeURIComponent(startParam)}`;
}

export function shareInTelegram(shareUrl: string, text: string): void {
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  const tg = getTg();
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(telegramShareUrl);
    return;
  }
  window.open(telegramShareUrl, '_blank', 'noopener,noreferrer');
}

export async function copyTextSafely(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to execCommand below (common inside mobile WebViews)
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
