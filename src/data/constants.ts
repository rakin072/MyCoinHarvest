import { HidingZone, FriendChip, ActivityItem, RaidChallenge } from '../types';

export const HIDING_ZONES: HidingZone[] = [
  {
    id: 'shadow-vault',
    name: 'Shadow Vault',
    subtitle: 'High Stealth',
    description: 'Encrypted cipher lock',
    iconName: 'safe',
    bonusStealth: '+20% Stealth Bonus',
    iconColor: '#00f0ff', // Cyan
    sectorIndex: 1,
  },
  {
    id: 'neon-canopy',
    name: 'Neon Canopy',
    subtitle: 'Treehouse Grid',
    description: 'High branches & vines',
    iconName: 'tree',
    bonusStealth: '+15% Stealth Bonus',
    iconColor: '#22c55e', // Green
    sectorIndex: 2,
  },
  {
    id: 'subway-tunnel',
    name: 'Subway Tunnel',
    subtitle: 'Underground Line',
    description: 'Echoing metro tracks',
    iconName: 'train',
    bonusStealth: '+18% Stealth Bonus',
    iconColor: '#a855f7', // Purple
    sectorIndex: 3,
  },
  {
    id: 'rooftop-relay',
    name: 'Rooftop Relay',
    subtitle: 'Signal Tower',
    description: 'Skyline antenna dish',
    iconName: 'radio',
    bonusStealth: '+22% Stealth Bonus',
    iconColor: '#00f0ff', // Cyan
    sectorIndex: 4,
  },
  {
    id: 'sunken-pier',
    name: 'Sunken Pier',
    subtitle: 'Harbor Docks',
    description: 'Foggy tide pilings',
    iconName: 'anchor',
    bonusStealth: '+16% Stealth Bonus',
    iconColor: '#14b8a6', // Teal
    sectorIndex: 5,
  },
  {
    id: 'cyber-arcade',
    name: 'Cyber Arcade',
    subtitle: 'Backroom Locker',
    description: 'Retro cabinet alley',
    iconName: 'gamepad',
    bonusStealth: '+14% Stealth Bonus',
    iconColor: '#ec4899', // Pink
    sectorIndex: 6,
  },
  {
    id: 'canyon-bridge',
    name: 'Canyon Bridge',
    subtitle: 'Outpost Gorge',
    description: 'Suspended steel span',
    iconName: 'bridge',
    bonusStealth: '+20% Stealth Bonus',
    iconColor: '#fbbf24', // Yellow/Gold
    sectorIndex: 7,
  },
  {
    id: 'obsidian-bunker',
    name: 'Obsidian Bunker',
    subtitle: 'Deep Core',
    description: 'Sub-level blast door',
    iconName: 'shield',
    bonusStealth: '+25% Stealth Bonus',
    iconColor: '#f97316', // Red/Orange
    sectorIndex: 8,
  },
];

export const PRESET_RIDDLES = [
  'Follow the neon hum underground...',
  'High above the trees where signals bounce.',
  'Behind heavy steel in the dark.',
];

export const SQUAD_FRIENDS: FriendChip[] = [
  { id: 'alex', handle: '@Alex', avatar: '⚡', name: 'Alex' },
  { id: 'maya', handle: '@Maya', avatar: '🦊', name: 'Maya' },
  { id: 'jordan', handle: '@Jordan', avatar: '🎯', name: 'Jordan' },
  { id: 'sam', handle: '@Sam', avatar: '🛡️', name: 'Sam' },
];

export const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    fullText: '@Maya hid 220 MCH in Subway Tunnel and tagged @Alex',
    timestamp: '1m ago',
    dotColor: 'cyan',
    type: 'stash',
  },
  {
    id: 'act-2',
    fullText: "@Jordan cracked @Sam's stash in Neon Canopy (+180 MCH)",
    timestamp: '4m ago',
    dotColor: 'gold',
    type: 'raid',
  },
  {
    id: 'act-3',
    fullText: '@Alex locked a decoy trap in Cyber Arcade',
    timestamp: '9m ago',
    dotColor: 'pink',
    type: 'streak',
  },
];

export const RAID_CHALLENGES: RaidChallenge[] = [
  {
    id: 'chal-jordan-1',
    challenger: '@Jordan',
    avatar: '🦊',
    bounty: 180,
    clue: 'Sealed three floors below bedrock behind a blast hatch...',
    targetZoneId: 'obsidian-bunker',
  },
  {
    id: 'chal-maya-1',
    challenger: '@Maya',
    avatar: '🦊',
    bounty: 220,
    clue: 'Beneath concrete rails where midnight trains hum in the dark...',
    targetZoneId: 'subway-tunnel',
  },
  {
    id: 'chal-sam-1',
    challenger: '@Sam',
    avatar: '🛡️',
    bounty: 160,
    clue: 'Suspended in bioluminescent branches and treehouse vines...',
    targetZoneId: 'neon-canopy',
  },
  {
    id: 'chal-alex-1',
    challenger: '@Alex',
    avatar: '⚡',
    bounty: 250,
    clue: 'High on the skyline where microwave satellite dishes scan the clouds...',
    targetZoneId: 'rooftop-relay',
  },
  {
    id: 'chal-kai-1',
    challenger: '@Kai',
    avatar: '🌊',
    bounty: 210,
    clue: 'Moored beneath rusted pilings where neon reflects off dark harbor water...',
    targetZoneId: 'sunken-pier',
  },
  {
    id: 'chal-nova-1',
    challenger: '@Nova',
    avatar: '🕹️',
    bounty: 195,
    clue: 'Behind a glowing CRT cabinet in the backroom locker alley...',
    targetZoneId: 'cyber-arcade',
  },
];
