export interface HidingZone {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconName: 'safe' | 'tree' | 'train' | 'radio' | 'anchor' | 'gamepad' | 'bridge' | 'shield';
  bonusStealth: string;
  iconColor: string;
  sectorIndex: number;
}

export interface ActivityItem {
  id: string;
  user?: string;
  action?: string;
  fullText?: string;
  amount?: number;
  location?: string;
  timestamp: string;
  type?: 'stash' | 'raid' | 'streak';
  dotColor: 'cyan' | 'gold' | 'pink';
}

export interface FriendChip {
  id: string;
  handle: string;
  avatar: string;
  name: string;
}

export interface RaidChallenge {
  id: string;
  challenger: string;
  avatar: string;
  bounty: number;
  clue: string;
  targetZoneId: string;
}
