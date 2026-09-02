import { TranslationKey } from '../i18n/translations';

export const currentUser = {
  id: 'u1',
  name: 'Alex Kim',
  initials: 'AK',
  floor: '6th Floor',
  building: 'Maple House',
};

export type CommunityFeatures = {
  polls: boolean;
  events: boolean;
  share: boolean;
  market: boolean;
  help: boolean;
  wiki: boolean;
  announcements: boolean;
};

export const DEFAULT_FEATURES: CommunityFeatures = {
  polls: true, events: true, share: true, market: true, help: true, wiki: true, announcements: true,
};

export type CommunityMember = {
  id: string;
  name: string;
  initials: string;
  floor: string;
  isAdmin: boolean;
};

export type CommunityType = 'building' | 'complex' | 'neighborhood' | 'street';

export type Community = {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  memberCount: number;
  type: CommunityType;
  adminIds: string[];
  features: CommunityFeatures;
  members: CommunityMember[];
  isPublic: boolean;
  joinCode: string;
  pendingRequestIds: string[];
};

const MAPLE_MEMBERS: CommunityMember[] = [
  { id: 'u1',  name: 'Alex Kim',    initials: 'AK', floor: '6th Floor', isAdmin: true },
  { id: 'u10', name: 'Sarah M.',    initials: 'SM', floor: '4th Floor', isAdmin: true },
  { id: 'u11', name: 'Priya N.',    initials: 'PN', floor: '6th Floor', isAdmin: false },
  { id: 'u12', name: 'Lars T.',     initials: 'LT', floor: '5th Floor', isAdmin: false },
  { id: 'u13', name: 'Nina R.',     initials: 'NR', floor: '5th Floor', isAdmin: false },
  { id: 'u14', name: 'Tom B.',      initials: 'TB', floor: '7th Floor', isAdmin: false },
  { id: 'u15', name: 'Cara M.',     initials: 'CM', floor: '6th Floor', isAdmin: false },
  { id: 'u16', name: 'Ji H.',       initials: 'JH', floor: '4th Floor', isAdmin: false },
];

const DEFAULT_MEMBERS: CommunityMember[] = [
  { id: 'u20', name: 'Sam J.',  initials: 'SJ', floor: '2nd Floor', isAdmin: true },
  { id: 'u21', name: 'Lee P.',  initials: 'LP', floor: '3rd Floor', isAdmin: false },
];

export const allCommunities: Community[] = [
  { id: 'c1',  name: 'Maple House',      subtitle: 'All residents · 84 members',   emoji: '🍁', memberCount: 84,  type: 'building',      adminIds: ['u1', 'u10'], features: { ...DEFAULT_FEATURES }, members: MAPLE_MEMBERS,   isPublic: true,  joinCode: 'MH-4X7K', pendingRequestIds: [] },
  { id: 'c4',  name: 'Oak Building',     subtitle: 'All residents · 60 members',   emoji: '🌳', memberCount: 60,  type: 'building',      adminIds: ['u20'],       features: { ...DEFAULT_FEATURES }, members: DEFAULT_MEMBERS, isPublic: true,  joinCode: 'OB-9R2P', pendingRequestIds: [] },
  { id: 'c8',  name: 'Westside Lofts',   subtitle: 'All residents · 32 members',   emoji: '🏙', memberCount: 32,  type: 'building',      adminIds: ['u20'],       features: { ...DEFAULT_FEATURES }, members: DEFAULT_MEMBERS, isPublic: false, joinCode: 'WL-3T8N', pendingRequestIds: [] },
  { id: 'c5',  name: 'Riverside Complex',subtitle: 'All residents · 120 members',  emoji: '🌊', memberCount: 120, type: 'complex',       adminIds: ['u20'],       features: { ...DEFAULT_FEATURES }, members: DEFAULT_MEMBERS, isPublic: true,  joinCode: 'RC-6F1D', pendingRequestIds: [] },
  { id: 'c6',  name: 'The Pines',        subtitle: 'All residents · 45 members',   emoji: '🌲', memberCount: 45,  type: 'neighborhood',  adminIds: ['u20'],       features: { ...DEFAULT_FEATURES }, members: DEFAULT_MEMBERS, isPublic: true,  joinCode: 'TP-5M2W', pendingRequestIds: [] },
  { id: 'c9',  name: 'Elm Street',       subtitle: 'Local street · 210 members',   emoji: '🛖', memberCount: 210, type: 'street',        adminIds: ['u20'],       features: { ...DEFAULT_FEATURES }, members: DEFAULT_MEMBERS, isPublic: true,  joinCode: 'ES-7Y4Q', pendingRequestIds: [] },
  { id: 'c10', name: 'Riverside Drive',  subtitle: 'Local street · 165 members',   emoji: '🚶', memberCount: 165, type: 'street',        adminIds: ['u20'],       features: { ...DEFAULT_FEATURES }, members: DEFAULT_MEMBERS, isPublic: false, joinCode: 'RD-2K9A', pendingRequestIds: [] },
  { id: 'c11', name: 'Maple Ave',        subtitle: 'Local street · 88 members',    emoji: '🍂', memberCount: 88,  type: 'street',        adminIds: ['u20'],       features: { ...DEFAULT_FEATURES }, members: DEFAULT_MEMBERS, isPublic: true,  joinCode: 'MA-8H6B', pendingRequestIds: [] },
];

export type EventItem = {
  id: string;
  titleKey: TranslationKey;
  dateKey: TranslationKey;
  timeKey: TranslationKey;
  locationKey: TranslationKey;
  host: string;
  attending: number;
  image: string;
  rsvp: boolean;
};

export const events: EventItem[] = [
  { id: 'e1', titleKey: 'event.e1.title', dateKey: 'event.e1.date', timeKey: 'event.e1.time', locationKey: 'event.e1.location', host: 'Sarah M.',      attending: 14, image: 'bbq',     rsvp: true },
  { id: 'e2', titleKey: 'event.e2.title', dateKey: 'event.e2.date', timeKey: 'event.e2.time', locationKey: 'event.e2.location', host: 'Tom & Jan',     attending: 6,  image: 'games',   rsvp: false },
  { id: 'e3', titleKey: 'event.e3.title', dateKey: 'event.e3.date', timeKey: 'event.e3.time', locationKey: 'event.e3.location', host: 'Building Mgmt', attending: 22, image: 'cleanup', rsvp: false },
  { id: 'e4', titleKey: 'event.e4.title', dateKey: 'event.e4.date', timeKey: 'event.e4.time', locationKey: 'event.e4.location', host: 'Nina R.',       attending: 9,  image: 'yoga',    rsvp: false },
];

export type ShareItem = {
  id: string;
  titleKey: TranslationKey;
  category: string;
  owner: string;
  floor: string;
  available: boolean;
  expiresInKey: TranslationKey;
  emoji: string;
};

export const shareItems: ShareItem[] = [
  { id: 's1', titleKey: 'shareItem.s1.title', category: 'Tools',   owner: 'Mark D.', floor: '6F', available: true,  expiresInKey: 'shareItem.expires.3days',    emoji: '🔧' },
  { id: 's2', titleKey: 'shareItem.s2.title', category: 'Food',    owner: 'Lena S.', floor: '6F', available: true,  expiresInKey: 'shareItem.expires.1day',     emoji: '🥚' },
  { id: 's3', titleKey: 'shareItem.s3.title', category: 'Sports',  owner: 'Nina R.', floor: '5F', available: true,  expiresInKey: 'shareItem.expires.5days',    emoji: '🧘' },
  { id: 's4', titleKey: 'shareItem.s4.title', category: 'Food',    owner: 'Tom B.',  floor: '7F', available: true,  expiresInKey: 'shareItem.expires.12hrs',    emoji: '🍞' },
  { id: 's5', titleKey: 'shareItem.s5.title', category: 'Tools',   owner: 'Cara M.', floor: '6F', available: false, expiresInKey: 'shareItem.expires.borrowed', emoji: '🪜' },
  { id: 's6', titleKey: 'shareItem.s6.title', category: 'Kitchen', owner: 'Ji H.',   floor: '4F', available: true,  expiresInKey: 'shareItem.expires.7days',    emoji: '🍲' },
];

export type Announcement = {
  id: string;
  type: 'alert' | 'info' | 'noise';
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  author: string;
  time: string;
};

export const announcements: Announcement[] = [
  { id: 'a1', type: 'noise', titleKey: 'ann.a1.title', bodyKey: 'ann.a1.body', author: 'Alex K.',       time: '2h ago' },
  { id: 'a2', type: 'alert', titleKey: 'ann.a2.title', bodyKey: 'ann.a2.body', author: 'Building Mgmt', time: '5h ago' },
  { id: 'a3', type: 'info',  titleKey: 'ann.a3.title', bodyKey: 'ann.a3.body', author: 'Sarah M.',      time: '1d ago' },
];

export type HelpRequest = {
  id: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  author: string;
  floor: string;
  time: string;
  resolved: boolean;
};

export const helpRequests: HelpRequest[] = [
  { id: 'h1', titleKey: 'help.h1.title', bodyKey: 'help.h1.body', author: 'Priya N.',          floor: '6F', time: '3h ago', resolved: false },
  { id: 'h2', titleKey: 'help.h2.title', bodyKey: 'help.h2.body', author: 'Lars T.',            floor: '5F', time: '6h ago', resolved: true },
  { id: 'h3', titleKey: 'help.h3.title', bodyKey: 'help.h3.body', author: 'Jess & Biscuit 🐶', floor: '7F', time: '1d ago', resolved: false },
];

export type Poll = {
  id: string;
  questionKey: TranslationKey;
  options: { labelKey: TranslationKey; votes: number }[];
  totalVotes: number;
  endsInKey: TranslationKey;
};

export const polls: Poll[] = [
  {
    id: 'p1',
    questionKey: 'poll.p1.question',
    options: [
      { labelKey: 'poll.p1.opt1', votes: 12 },
      { labelKey: 'poll.p1.opt2', votes: 8 },
      { labelKey: 'poll.p1.opt3', votes: 5 },
    ],
    totalVotes: 25,
    endsInKey: 'poll.p1.endsIn',
  },
  {
    id: 'p2',
    questionKey: 'poll.p2.question',
    options: [
      { labelKey: 'poll.p2.opt1', votes: 18 },
      { labelKey: 'poll.p2.opt2', votes: 3 },
      { labelKey: 'poll.p2.opt3', votes: 7 },
    ],
    totalVotes: 28,
    endsInKey: 'poll.p2.endsIn',
  },
];

export type UserPoll = {
  id: string;
  question: string;
  options: { label: string; votes: number }[];
  totalVotes: number;
  endsInLabel: string;
  createdBy: string;
  createdAt: number;
};

export type MarketItem = {
  id: string;
  titleKey: TranslationKey;
  price: string;
  seller: string;
  floor: string;
  emoji: string;
  free: boolean;
};

export const marketItems: MarketItem[] = [
  { id: 'm1', titleKey: 'marketItem.m1.title', price: '$40',  seller: 'Dan W.',   floor: '6F', emoji: '📚', free: false },
  { id: 'm2', titleKey: 'marketItem.m2.title', price: 'Free', seller: 'Soo K.',   floor: '4F', emoji: '☕', free: true },
  { id: 'm3', titleKey: 'marketItem.m3.title', price: '$25',  seller: 'Petra L.', floor: '5F', emoji: '🧥', free: false },
  { id: 'm4', titleKey: 'marketItem.m4.title', price: '$120', seller: 'Omar A.',  floor: '7F', emoji: '🚲', free: false },
];
