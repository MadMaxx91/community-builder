import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DbAnnouncement, DbEvent, DbHelpRequest, DbMarketItem, DbNotification, DbPoll, DbShareItem, DbWikiEntry } from '../lib/database.types';
import { useAuth } from './AuthContext';

// ── Public types ──────────────────────────────────────────────
// These use raw strings (not TranslationKeys) — real user-created content.

export type { DbAnnouncement, DbEvent, DbHelpRequest, DbMarketItem, DbNotification, DbPoll, DbShareItem, DbWikiEntry };

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  emoji: string;
};

export type FeedItem =
  | { kind: 'announcement'; id: string; data: DbAnnouncement; time: string }
  | { kind: 'event';        id: string; data: DbEvent;        time: string }
  | { kind: 'poll';         id: string; data: DbPoll;         time: string }
  | { kind: 'help';         id: string; data: DbHelpRequest;  time: string }
  | { kind: 'market';       id: string; data: DbMarketItem;   time: string };

type ContentContextType = {
  // Per-tab data
  announcements: DbAnnouncement[];
  events: DbEvent[];
  polls: DbPoll[];
  helpRequests: DbHelpRequest[];
  marketItems: DbMarketItem[];
  shareItems: DbShareItem[];
  wikiEntries: DbWikiEntry[];

  // Feed (unified, sorted by time)
  feedItems: FeedItem[];

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;

  // Reactions
  getReactions: (itemId: string) => Record<string, number>;
  getUserReaction: (itemId: string) => string | null;
  toggleReaction: (itemId: string, emoji: string, itemType: DbAnnouncement['id'] extends string ? string : string) => Promise<void>;

  // Create content
  createPoll: (question: string, options: string[], durationDays: number, createdBy: string) => Promise<void>;
  createEvent: (title: string, description: string, location: string, startsAt: string) => Promise<void>;
  createHelpRequest: (title: string, body: string, floor: string) => Promise<void>;
  createMarketItem: (title: string, description: string, price: number | null, isFree: boolean, emoji: string) => Promise<void>;
  createShareItem: (title: string, category: string, expiresAt: string | null) => Promise<void>;
  createWikiEntry: (title: string, body: string, emoji: string) => Promise<void>;

  // Delete content
  deleteAnnouncement: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  deletePoll: (id: string) => Promise<void>;
  deleteHelpRequest: (id: string) => Promise<void>;
  deleteMarketItem: (id: string) => Promise<void>;
  deleteShareItem: (id: string) => Promise<void>;
  deleteWikiEntry: (id: string) => Promise<void>;

  // Update content
  updateAnnouncement: (id: string, title: string, body: string) => Promise<void>;
  updateEvent: (id: string, title: string, description: string, location: string, startsAt: string) => Promise<void>;
  updateHelpRequest: (id: string, title: string, body: string, floor: string) => Promise<void>;
  updateMarketItem: (id: string, title: string, description: string, price: number | null, isFree: boolean, emoji: string) => Promise<void>;
  updateShareItem: (id: string, title: string, category: string, expiresAt: string | null) => Promise<void>;
  updateWikiEntry: (id: string, title: string, body: string, emoji: string) => Promise<void>;

  // RSVP
  toggleRsvp: (eventId: string) => Promise<void>;
};

const ContentContext = createContext<ContentContextType | null>(null);

// ── Helpers ───────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Provider ──────────────────────────────────────────────────

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const { user, activeCommunity } = useAuth();

  const [announcements, setAnnouncements] = useState<DbAnnouncement[]>([]);
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [polls, setPolls] = useState<DbPoll[]>([]);
  const [helpRequests, setHelpRequests] = useState<DbHelpRequest[]>([]);
  const [marketItems, setMarketItems] = useState<DbMarketItem[]>([]);
  const [shareItems, setShareItems] = useState<DbShareItem[]>([]);
  const [wikiEntries, setWikiEntries] = useState<DbWikiEntry[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string | null>>({});

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const communityId = activeCommunity?.id ?? null;

  // ── Load all content when community changes ───────────────────
  useEffect(() => {
    if (!communityId) {
      setAnnouncements([]); setEvents([]); setPolls([]);
      setHelpRequests([]); setMarketItems([]); setShareItems([]); setWikiEntries([]);
      return;
    }
    loadAllContent(communityId);
    subscribeToContent(communityId);
    return () => { channelRef.current?.unsubscribe(); };
  }, [communityId]);

  // Load notifications whenever the user changes
  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    loadNotifications(user.id);
    subscribeToNotifications(user.id);
  }, [user?.id]);

  // ── Data loaders ──────────────────────────────────────────────

  async function loadAllContent(cid: string) {
    await Promise.all([
      loadAnnouncements(cid),
      loadEvents(cid),
      loadPolls(cid),
      loadHelpRequests(cid),
      loadMarketItems(cid),
      loadShareItems(cid),
      loadWikiEntries(cid),
    ]);
  }

  async function loadAnnouncements(cid: string) {
    const { data } = await supabase
      .from('announcements')
      .select('*, profiles!author_id(name)')
      .eq('community_id', cid)
      .order('created_at', { ascending: false });
    if (data) setAnnouncements(data.map(r => ({ ...r, author_name: (r as any).profiles?.name ?? 'Unknown' })));
  }

  async function loadEvents(cid: string) {
    const uid = user?.id;
    const { data } = await supabase
      .from('events')
      .select('*, profiles!author_id(name), event_rsvps(user_id)')
      .eq('community_id', cid)
      .order('starts_at', { ascending: true });
    if (data) {
      setEvents(data.map(r => ({
        ...r,
        author_name: (r as any).profiles?.name ?? 'Unknown',
        rsvp_count: (r as any).event_rsvps?.length ?? 0,
        user_rsvped: !!(r as any).event_rsvps?.find((rv: any) => rv.user_id === uid),
      })));
    }
  }

  async function loadPolls(cid: string) {
    const uid = user?.id;
    const { data: pollRows } = await supabase
      .from('polls')
      .select('*, profiles!author_id(name), poll_options(id, label, position, poll_votes(user_id))')
      .eq('community_id', cid)
      .order('created_at', { ascending: false });

    if (!pollRows) return;

    const mapped: DbPoll[] = pollRows.map(p => {
      const opts = ((p as any).poll_options ?? []) as { id: string; label: string; position: number; poll_votes: { user_id: string }[] }[];
      opts.sort((a, b) => a.position - b.position);
      const total = opts.reduce((sum, o) => sum + o.poll_votes.length, 0);
      const userVote = opts.find(o => o.poll_votes.some(v => v.user_id === uid));
      return {
        ...p,
        author_name: (p as any).profiles?.name ?? 'Unknown',
        options: opts.map(o => ({ id: o.id, label: o.label, position: o.position, votes: o.poll_votes.length })),
        total_votes: total,
        user_vote_option_id: userVote?.id ?? null,
      };
    });
    setPolls(mapped);
  }

  async function loadHelpRequests(cid: string) {
    const { data } = await supabase
      .from('help_requests')
      .select('*, profiles!author_id(name)')
      .eq('community_id', cid)
      .order('created_at', { ascending: false });
    if (data) setHelpRequests(data.map(r => ({ ...r, author_name: (r as any).profiles?.name ?? 'Unknown' })));
  }

  async function loadMarketItems(cid: string) {
    const { data } = await supabase
      .from('market_items')
      .select('*, profiles!author_id(name)')
      .eq('community_id', cid)
      .order('created_at', { ascending: false });
    if (data) setMarketItems(data.map(r => ({ ...r, author_name: (r as any).profiles?.name ?? 'Unknown' })));
  }

  async function loadShareItems(cid: string) {
    const { data } = await supabase
      .from('share_items')
      .select('*, profiles!owner_id(name)')
      .eq('community_id', cid)
      .order('created_at', { ascending: false });
    if (data) setShareItems(data.map(r => ({ ...r, owner_name: (r as any).profiles?.name ?? 'Unknown' })));
  }

  async function loadWikiEntries(cid: string) {
    const { data } = await supabase
      .from('wiki_entries')
      .select('*, profiles!author_id(name)')
      .eq('community_id', cid)
      .order('created_at', { ascending: true });
    if (data) setWikiEntries(data.map(r => ({ ...r, author_name: (r as any).profiles?.name ?? 'Unknown' })));
  }

  async function loadNotifications(uid: string) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) {
      setNotifications(data.map(n => ({
        ...n,
        time: timeAgo(n.created_at),
      })));
    }
  }

  // ── Realtime subscriptions ────────────────────────────────────

  function subscribeToContent(cid: string) {
    channelRef.current?.unsubscribe();
    channelRef.current = supabase
      .channel(`community:${cid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements',  filter: `community_id=eq.${cid}` }, () => loadAnnouncements(cid))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events',          filter: `community_id=eq.${cid}` }, () => loadEvents(cid))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls',            filter: `community_id=eq.${cid}` }, () => loadPolls(cid))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes'                                        }, () => loadPolls(cid))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_rsvps'                                       }, () => loadEvents(cid))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_requests',   filter: `community_id=eq.${cid}` }, () => loadHelpRequests(cid))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_items',    filter: `community_id=eq.${cid}` }, () => loadMarketItems(cid))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions'                                         }, () => loadReactions(cid))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wiki_entries',   filter: `community_id=eq.${cid}` }, () => loadWikiEntries(cid))
      .subscribe();
  }

  function subscribeToNotifications(uid: string) {
    supabase
      .channel(`notifications:${uid}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` },
        (payload) => {
          const n = payload.new as any;
          setNotifications(prev => [{
            ...n, time: 'just now',
          }, ...prev]);
        })
      .subscribe();
  }

  // ── Reactions ─────────────────────────────────────────────────

  async function loadReactions(cid: string) {
    const allIds = [
      ...announcements.map(a => a.id),
      ...events.map(e => e.id),
      ...polls.map(p => p.id),
      ...helpRequests.map(h => h.id),
      ...marketItems.map(m => m.id),
    ];
    if (!allIds.length) return;

    const { data } = await supabase
      .from('reactions')
      .select('item_id, emoji, user_id')
      .in('item_id', allIds);

    if (!data) return;

    const counts: Record<string, Record<string, number>> = {};
    const mine: Record<string, string | null> = {};

    for (const r of data) {
      counts[r.item_id] ??= {};
      counts[r.item_id][r.emoji] = (counts[r.item_id][r.emoji] ?? 0) + 1;
      if (r.user_id === user?.id) mine[r.item_id] = r.emoji;
    }
    setReactions(counts);
    setUserReactions(mine);
  }

  function getReactions(itemId: string): Record<string, number> {
    return reactions[itemId] ?? {};
  }

  function getUserReaction(itemId: string): string | null {
    return userReactions[itemId] ?? null;
  }

  async function toggleReaction(itemId: string, emoji: string, itemType: string) {
    if (!user) return;
    const current = userReactions[itemId] ?? null;

    // Optimistic update
    setReactions(prev => {
      const next = { ...(prev[itemId] ?? {}) };
      if (current === emoji) {
        next[emoji] = Math.max(0, (next[emoji] ?? 1) - 1);
        if (next[emoji] === 0) delete next[emoji];
      } else {
        if (current) {
          next[current] = Math.max(0, (next[current] ?? 1) - 1);
          if (next[current] === 0) delete next[current];
        }
        next[emoji] = (next[emoji] ?? 0) + 1;
      }
      return { ...prev, [itemId]: next };
    });
    setUserReactions(prev => ({ ...prev, [itemId]: current === emoji ? null : emoji }));

    // Persist
    if (current === emoji) {
      await supabase.from('reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);
    } else {
      await supabase.from('reactions')
        .upsert({ user_id: user.id, item_id: itemId, item_type: itemType as any, emoji })
        .eq('user_id', user.id)
        .eq('item_id', itemId);
    }
  }

  // ── Notifications ─────────────────────────────────────────────

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  // ── Poll creation ─────────────────────────────────────────────

  async function createPoll(question: string, options: string[], durationDays: number, _createdBy: string) {
    if (!user || !communityId) return;

    const endsAt = new Date(Date.now() + durationDays * 86400000).toISOString();

    const { data: poll } = await supabase
      .from('polls')
      .insert({ community_id: communityId, author_id: user.id, question, ends_at: endsAt })
      .select()
      .single();

    if (!poll) return;

    const validOptions = options.filter(o => o.trim());
    await supabase.from('poll_options').insert(
      validOptions.map((label, position) => ({ poll_id: poll.id, label, position })),
    );

    await loadPolls(communityId);
  }

  // ── Create content ────────────────────────────────────────────

  async function createEvent(title: string, description: string, location: string, startsAt: string) {
    if (!user || !communityId) return;
    await supabase.from('events').insert({
      community_id: communityId,
      author_id: user.id,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      starts_at: startsAt,
    });
    await loadEvents(communityId);
  }

  async function createHelpRequest(title: string, body: string, floor: string) {
    if (!user || !communityId) return;
    await supabase.from('help_requests').insert({
      community_id: communityId,
      author_id: user.id,
      title: title.trim(),
      body: body.trim(),
      floor: floor.trim(),
    });
    await loadHelpRequests(communityId);
  }

  async function createMarketItem(title: string, description: string, price: number | null, isFree: boolean, emoji: string) {
    if (!user || !communityId) return;
    await supabase.from('market_items').insert({
      community_id: communityId,
      author_id: user.id,
      title: title.trim(),
      description: description.trim(),
      price: isFree ? null : price,
      is_free: isFree,
      emoji: emoji || '🏷️',
    });
    await loadMarketItems(communityId);
  }

  async function createShareItem(title: string, category: string, expiresAt: string | null) {
    if (!user || !communityId) return;
    await supabase.from('share_items').insert({
      community_id: communityId,
      owner_id: user.id,
      title: title.trim(),
      category: category || 'Other',
      available: true,
      expires_at: expiresAt,
    });
    await loadShareItems(communityId);
  }

  async function createWikiEntry(title: string, body: string, emoji: string) {
    if (!user || !communityId) return;
    await supabase.from('wiki_entries').insert({
      community_id: communityId,
      author_id: user.id,
      title: title.trim(),
      body: body.trim(),
      emoji: emoji || '📄',
    });
    await loadWikiEntries(communityId);
  }

  // ── Delete content ────────────────────────────────────────────

  async function deleteAnnouncement(id: string) {
    if (!communityId) return;
    await supabase.from('announcements').delete().eq('id', id);
    await loadAnnouncements(communityId);
  }

  async function deleteEvent(id: string) {
    if (!communityId) return;
    await supabase.from('events').delete().eq('id', id);
    await loadEvents(communityId);
  }

  async function deletePoll(id: string) {
    if (!communityId) return;
    await supabase.from('polls').delete().eq('id', id);
    await loadPolls(communityId);
  }

  async function deleteHelpRequest(id: string) {
    if (!communityId) return;
    await supabase.from('help_requests').delete().eq('id', id);
    await loadHelpRequests(communityId);
  }

  async function deleteMarketItem(id: string) {
    if (!communityId) return;
    await supabase.from('market_items').delete().eq('id', id);
    await loadMarketItems(communityId);
  }

  async function deleteShareItem(id: string) {
    if (!communityId) return;
    await supabase.from('share_items').delete().eq('id', id);
    await loadShareItems(communityId);
  }

  async function deleteWikiEntry(id: string) {
    if (!communityId) return;
    await supabase.from('wiki_entries').delete().eq('id', id);
    await loadWikiEntries(communityId);
  }

  // ── Update content ────────────────────────────────────────────

  async function updateAnnouncement(id: string, title: string, body: string) {
    if (!communityId) return;
    await supabase.from('announcements').update({ title, body }).eq('id', id);
    await loadAnnouncements(communityId);
  }

  async function updateEvent(id: string, title: string, description: string, location: string, startsAt: string) {
    if (!communityId) return;
    await supabase.from('events').update({ title, description, location, starts_at: startsAt }).eq('id', id);
    await loadEvents(communityId);
  }

  async function updateHelpRequest(id: string, title: string, body: string, floor: string) {
    if (!communityId) return;
    await supabase.from('help_requests').update({ title, body, floor }).eq('id', id);
    await loadHelpRequests(communityId);
  }

  async function updateMarketItem(id: string, title: string, description: string, price: number | null, isFree: boolean, emoji: string) {
    if (!communityId) return;
    await supabase.from('market_items').update({ title, description, price: isFree ? null : price, is_free: isFree, emoji }).eq('id', id);
    await loadMarketItems(communityId);
  }

  async function updateShareItem(id: string, title: string, category: string, expiresAt: string | null) {
    if (!communityId) return;
    await supabase.from('share_items').update({ title, category, expires_at: expiresAt }).eq('id', id);
    await loadShareItems(communityId);
  }

  async function updateWikiEntry(id: string, title: string, body: string, emoji: string) {
    if (!communityId) return;
    await supabase.from('wiki_entries').update({ title, body, emoji }).eq('id', id);
    await loadWikiEntries(communityId);
  }

  // ── RSVP ──────────────────────────────────────────────────────

  async function toggleRsvp(eventId: string) {
    if (!user) return;
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.user_rsvped) {
      await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('user_id', user.id);
    } else {
      await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: user.id });
    }
    if (communityId) loadEvents(communityId);
  }

  // ── Feed (unified, sorted descending) ─────────────────────────

  const feedItems: FeedItem[] = [
    ...announcements.map<FeedItem>(a => ({ kind: 'announcement', id: a.id, data: a, time: timeAgo(a.created_at) })),
    ...events.map<FeedItem>(e       => ({ kind: 'event',         id: e.id, data: e, time: timeAgo(e.created_at) })),
    ...polls.map<FeedItem>(p        => ({ kind: 'poll',          id: p.id, data: p, time: timeAgo(p.created_at) })),
    ...helpRequests.map<FeedItem>(h => ({ kind: 'help',          id: h.id, data: h, time: timeAgo(h.created_at) })),
    ...marketItems.map<FeedItem>(m  => ({ kind: 'market',        id: m.id, data: m, time: timeAgo(m.created_at) })),
  ].sort((a, b) => {
    const getDate = (item: FeedItem) => item.data.created_at;
    return new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime();
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ContentContext.Provider value={{
      announcements, events, polls, helpRequests, marketItems, shareItems, wikiEntries,
      feedItems,
      notifications, unreadCount, markRead, markAllRead,
      getReactions, getUserReaction, toggleReaction,
      createPoll, createEvent, createHelpRequest, createMarketItem, createShareItem, createWikiEntry,
      deleteAnnouncement, deleteEvent, deletePoll, deleteHelpRequest, deleteMarketItem, deleteShareItem, deleteWikiEntry,
      updateAnnouncement, updateEvent, updateHelpRequest, updateMarketItem, updateShareItem, updateWikiEntry,
      toggleRsvp,
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
