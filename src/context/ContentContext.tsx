import React, { createContext, useContext, useState } from 'react';
import { announcements, events, polls, helpRequests, marketItems, Poll, UserPoll } from '../data/mock';

// ─── Notifications ───────────────────────────────────────────────────────────

export type AppNotification = {
  id: string;
  type: 'join_approved' | 'new_announcement' | 'new_event' | 'new_help' | 'new_poll' | 'new_member' | 'reaction';
  title: string;
  body: string;
  time: string;
  read: boolean;
  emoji: string;
};

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', type: 'join_approved',    emoji: '✅', read: false, time: '10m ago', title: 'Request approved',            body: 'You can now participate in Maple Ave' },
  { id: 'n2', type: 'new_announcement', emoji: '📢', read: false, time: '2h ago',  title: 'Party Saturday night 🎉',     body: 'Alex K. posted a new announcement in Maple House' },
  { id: 'n3', type: 'new_event',        emoji: '📅', read: false, time: '3h ago',  title: 'Rooftop BBQ — this Saturday', body: 'Sarah M. created a new event. 14 people going.' },
  { id: 'n4', type: 'new_help',         emoji: '🙋', read: true,  time: '5h ago',  title: 'Help needed on 6F',           body: 'Priya N. is looking for someone to water her plants' },
  { id: 'n5', type: 'new_poll',         emoji: '📊', read: true,  time: '6h ago',  title: 'New poll posted',             body: 'Vote on the best day for the community BBQ (closes in 2 days)' },
  { id: 'n6', type: 'new_member',       emoji: '👋', read: true,  time: '1d ago',  title: 'Lars T. joined the community',body: 'Say hi to your new neighbor on 5F' },
  { id: 'n7', type: 'reaction',         emoji: '👍', read: true,  time: '1d ago',  title: 'Sarah M. reacted to your post', body: '"Party Saturday night 🎉"' },
];

// ─── Feed ─────────────────────────────────────────────────────────────────────

export type FeedItem =
  | { kind: 'announcement'; id: string; data: typeof announcements[number]; time: string }
  | { kind: 'event';        id: string; data: typeof events[number];        time: string }
  | { kind: 'poll';         id: string; data: Poll;                         time: string }
  | { kind: 'userPoll';     id: string; data: UserPoll;                     time: string }
  | { kind: 'help';         id: string; data: typeof helpRequests[number];  time: string }
  | { kind: 'market';       id: string; data: typeof marketItems[number];   time: string };

const BASE_FEED: FeedItem[] = [
  { kind: 'announcement', id: 'f_a1', data: announcements[0], time: '2h ago' },
  { kind: 'event',        id: 'f_e1', data: events[0],        time: '3h ago' },
  { kind: 'help',         id: 'f_h1', data: helpRequests[0],  time: '3h ago' },
  { kind: 'announcement', id: 'f_a2', data: announcements[1], time: '5h ago' },
  { kind: 'poll',         id: 'f_p1', data: polls[0],         time: '6h ago' },
  { kind: 'help',         id: 'f_h2', data: helpRequests[1],  time: '6h ago' },
  { kind: 'market',       id: 'f_m1', data: marketItems[0],   time: '8h ago' },
  { kind: 'event',        id: 'f_e2', data: events[1],        time: '1d ago' },
  { kind: 'announcement', id: 'f_a3', data: announcements[2], time: '1d ago' },
  { kind: 'help',         id: 'f_h3', data: helpRequests[2],  time: '1d ago' },
  { kind: 'poll',         id: 'f_p2', data: polls[1],         time: '2d ago' },
  { kind: 'market',       id: 'f_m2', data: marketItems[1],   time: '2d ago' },
];

// ─── Context ──────────────────────────────────────────────────────────────────

type ContentContextType = {
  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;

  // Reactions: itemId → emoji → count
  getReactions: (itemId: string) => Record<string, number>;
  getUserReaction: (itemId: string) => string | null;
  toggleReaction: (itemId: string, emoji: string) => void;

  // User-created polls
  userPolls: UserPoll[];
  createPoll: (question: string, options: string[], durationDays: number, createdBy: string) => void;

  // Feed
  feedItems: FeedItem[];
};

const ContentContext = createContext<ContentContextType | null>(null);

const INITIAL_REACTIONS: Record<string, Record<string, number>> = {
  'a1': { '👍': 5, '❤️': 2 },
  'a2': { '👍': 12, '😮': 3 },
  'a3': { '❤️': 8, '😄': 4, '👍': 2 },
  'h1': { '❤️': 3 },
  'h2': { '😄': 1, '👍': 2 },
  'h3': { '❤️': 6, '👍': 4 },
  'f_a1': { '👍': 5, '❤️': 2 },
  'f_a2': { '👍': 12, '😮': 3 },
  'f_h3': { '❤️': 6, '👍': 4 },
};

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>(INITIAL_REACTIONS);
  const [userReactions, setUserReactions] = useState<Record<string, string | null>>({});
  const [userPolls, setUserPolls] = useState<UserPoll[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function getReactions(itemId: string): Record<string, number> {
    return reactions[itemId] ?? {};
  }

  function getUserReaction(itemId: string): string | null {
    return userReactions[itemId] ?? null;
  }

  function toggleReaction(itemId: string, emoji: string) {
    const current = userReactions[itemId] ?? null;

    setReactions(prev => {
      const itemReactions = { ...(prev[itemId] ?? {}) };
      if (current === emoji) {
        // Remove
        itemReactions[emoji] = Math.max(0, (itemReactions[emoji] ?? 1) - 1);
        if (itemReactions[emoji] === 0) delete itemReactions[emoji];
      } else {
        if (current) {
          // Swap away from old
          itemReactions[current] = Math.max(0, (itemReactions[current] ?? 1) - 1);
          if (itemReactions[current] === 0) delete itemReactions[current];
        }
        // Add new
        itemReactions[emoji] = (itemReactions[emoji] ?? 0) + 1;
      }
      return { ...prev, [itemId]: itemReactions };
    });

    setUserReactions(prev => ({
      ...prev,
      [itemId]: current === emoji ? null : emoji,
    }));
  }

  function createPoll(question: string, options: string[], durationDays: number, createdBy: string) {
    const id = `up_${Date.now()}`;
    const labels = ['1 day', '3 days', '7 days'];
    const endsInLabel = durationDays === 1 ? labels[0] : durationDays === 3 ? labels[1] : labels[2];
    const newPoll: UserPoll = {
      id,
      question,
      options: options.filter(o => o.trim()).map(label => ({ label, votes: 0 })),
      totalVotes: 0,
      endsInLabel,
      createdBy,
      createdAt: Date.now(),
    };
    setUserPolls(prev => [newPoll, ...prev]);
  }

  const feedItems: FeedItem[] = [
    ...userPolls.map<FeedItem>(p => ({ kind: 'userPoll', id: p.id, data: p, time: 'just now' })),
    ...BASE_FEED,
  ];

  return (
    <ContentContext.Provider value={{
      notifications, unreadCount, markRead, markAllRead,
      getReactions, getUserReaction, toggleReaction,
      userPolls, createPoll,
      feedItems,
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}
