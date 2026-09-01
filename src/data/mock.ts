export const currentUser = {
  id: 'u1',
  name: 'Alex Kim',
  initials: 'AK',
  floor: '6th Floor',
  building: 'Maple House',
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  host: string;
  attending: number;
  image: string;
  rsvp: boolean;
};

export const events: EventItem[] = [
  {
    id: 'e1',
    title: 'Rooftop BBQ',
    date: 'Sep 6',
    time: '5:00 PM',
    location: 'Rooftop, Maple House',
    host: 'Sarah M.',
    attending: 14,
    image: 'bbq',
    rsvp: true,
  },
  {
    id: 'e2',
    title: 'Board Game Night',
    date: 'Sep 12',
    time: '7:00 PM',
    location: 'Common Room, 3F',
    host: 'Tom & Jan',
    attending: 6,
    image: 'games',
    rsvp: false,
  },
  {
    id: 'e3',
    title: 'Building Cleanup',
    date: 'Sep 20',
    time: '10:00 AM',
    location: 'Main Entrance',
    host: 'Building Mgmt',
    attending: 22,
    image: 'cleanup',
    rsvp: false,
  },
  {
    id: 'e4',
    title: 'Yoga on the Lawn',
    date: 'Sep 21',
    time: '8:30 AM',
    location: 'Garden',
    host: 'Nina R.',
    attending: 9,
    image: 'yoga',
    rsvp: false,
  },
];

export type ShareItem = {
  id: string;
  title: string;
  category: string;
  owner: string;
  floor: string;
  available: boolean;
  expiresIn: string;
  emoji: string;
};

export const shareItems: ShareItem[] = [
  { id: 's1', title: 'Power Drill', category: 'Tools', owner: 'Mark D.', floor: '6F', available: true, expiresIn: '3 days', emoji: '🔧' },
  { id: 's2', title: 'Eggs (6 free)', category: 'Food', owner: 'Lena S.', floor: '6F', available: true, expiresIn: '1 day', emoji: '🥚' },
  { id: 's3', title: 'Yoga Mat', category: 'Sports', owner: 'Nina R.', floor: '5F', available: true, expiresIn: '5 days', emoji: '🧘' },
  { id: 's4', title: 'Bread Loaf', category: 'Food', owner: 'Tom B.', floor: '7F', available: true, expiresIn: '12 hrs', emoji: '🍞' },
  { id: 's5', title: 'Step Ladder', category: 'Tools', owner: 'Cara M.', floor: '6F', available: false, expiresIn: 'borrowed', emoji: '🪜' },
  { id: 's6', title: 'Instant Pot', category: 'Kitchen', owner: 'Ji H.', floor: '4F', available: true, expiresIn: '7 days', emoji: '🍲' },
];

export type Announcement = {
  id: string;
  type: 'alert' | 'info' | 'noise';
  title: string;
  body: string;
  author: string;
  time: string;
};

export const announcements: Announcement[] = [
  { id: 'a1', type: 'noise', title: 'Party Saturday night 🎉', body: "We're hosting a birthday on 6F, expect some music until midnight. Apologies in advance!", author: 'Alex K.', time: '2h ago' },
  { id: 'a2', type: 'alert', title: 'Elevator out of service', body: 'Elevator B is under maintenance. Expected back by Monday.', author: 'Building Mgmt', time: '5h ago' },
  { id: 'a3', type: 'info', title: 'New neighbor on 6F!', body: 'Please welcome Jamie & Rina who just moved into 6C. Wave hello!', author: 'Sarah M.', time: '1d ago' },
];

export type HelpRequest = {
  id: string;
  title: string;
  body: string;
  author: string;
  floor: string;
  time: string;
  resolved: boolean;
};

export const helpRequests: HelpRequest[] = [
  { id: 'h1', title: 'Can someone water my plants?', body: "Away Sep 8–14, 2 small succulents on windowsill. 5 mins tops.", author: 'Priya N.', floor: '6F', time: '3h ago', resolved: false },
  { id: 'h2', title: 'Looking for a corkscrew', body: 'Need one tonight for a dinner party, can return tomorrow morning.', author: 'Lars T.', floor: '5F', time: '6h ago', resolved: true },
  { id: 'h3', title: 'Dog walk this Thursday?', body: 'Need a 30-min walk for Biscuit around 2pm. Happy to pay!', author: 'Jess & Biscuit 🐶', floor: '7F', time: '1d ago', resolved: false },
];

export type Poll = {
  id: string;
  question: string;
  options: { label: string; votes: number }[];
  totalVotes: number;
  endsIn: string;
};

export const polls: Poll[] = [
  {
    id: 'p1',
    question: 'Best day for the community BBQ?',
    options: [
      { label: 'Saturday Sep 6', votes: 12 },
      { label: 'Sunday Sep 7', votes: 8 },
      { label: 'Saturday Sep 13', votes: 5 },
    ],
    totalVotes: 25,
    endsIn: '2 days',
  },
  {
    id: 'p2',
    question: 'Should we add a bike storage room?',
    options: [
      { label: 'Yes, great idea', votes: 18 },
      { label: 'No', votes: 3 },
      { label: 'Maybe, need more info', votes: 7 },
    ],
    totalVotes: 28,
    endsIn: '5 days',
  },
];

export type MarketItem = {
  id: string;
  title: string;
  price: string;
  seller: string;
  floor: string;
  emoji: string;
  free: boolean;
};

export const marketItems: MarketItem[] = [
  { id: 'm1', title: 'IKEA bookshelf', price: '$40', seller: 'Dan W.', floor: '6F', emoji: '📚', free: false },
  { id: 'm2', title: 'Coffee table', price: 'Free', seller: 'Soo K.', floor: '4F', emoji: '☕', free: true },
  { id: 'm3', title: 'Winter jacket (M)', price: '$25', seller: 'Petra L.', floor: '5F', emoji: '🧥', free: false },
  { id: 'm4', title: 'Bike (city)', price: '$120', seller: 'Omar A.', floor: '7F', emoji: '🚲', free: false },
];
