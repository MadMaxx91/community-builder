// Auto-generate this from your Supabase project with:
//   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
// The hand-written version below keeps the same shape.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CommunityFeatures = {
  polls: boolean; events: boolean; share: boolean;
  market: boolean; help: boolean; wiki: boolean; announcements: boolean;
  wiki_edit_policy?: 'members' | 'admin_only';
};

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ── Row types per table ───────────────────────────────────────

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  bio: string;
  floor: string;
  building: string;
  avatar_url: string | null;
  created_at: string;
}

export interface CommunityRow {
  id: string;
  name: string;
  emoji: string;
  type: 'building' | 'complex' | 'neighborhood' | 'street';
  subtitle: string;
  is_public: boolean;
  join_code: string;
  features: CommunityFeatures;
  created_by: string | null;
  created_at: string;
}

export interface CommunityMemberRow {
  id: string;
  community_id: string;
  user_id: string;
  role: 'admin' | 'member';
  status: 'pending' | 'approved' | 'denied';
  joined_at: string;
}

export interface AnnouncementRow {
  id: string;
  community_id: string;
  author_id: string;
  type: 'alert' | 'info' | 'noise';
  title: string;
  body: string;
  created_at: string;
}

export interface EventRow {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  created_at: string;
}

export interface EventRsvpRow {
  event_id: string;
  user_id: string;
  created_at: string;
}

export interface HelpRequestRow {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  body: string;
  floor: string;
  resolved: boolean;
  created_at: string;
}

export interface PollRow {
  id: string;
  community_id: string;
  author_id: string;
  question: string;
  ends_at: string | null;
  created_at: string;
}

export interface PollOptionRow {
  id: string;
  poll_id: string;
  label: string;
  position: number;
}

export interface PollVoteRow {
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
}

export interface MarketItemRow {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  description: string;
  price: number | null;
  is_free: boolean;
  emoji: string;
  sold: boolean;
  created_at: string;
}

export interface ShareItemRow {
  id: string;
  community_id: string;
  owner_id: string;
  title: string;
  category: string;
  available: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface ReactionRow {
  id: string;
  user_id: string;
  item_type: 'announcement' | 'event' | 'poll' | 'help_request' | 'market_item';
  item_id: string;
  emoji: string;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  emoji: string;
  read: boolean;
  data: Json;
  created_at: string;
}

export interface PushTokenRow {
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  updated_at: string;
}

export interface WikiEntryRow {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  body: string;
  emoji: string;
  created_at: string;
}

// ── Database type map (used by supabase-js generic) ──────────

export interface Database {
  public: {
    Tables: {
      profiles:          { Row: ProfileRow;       Insert: MakeOptional<ProfileRow, 'created_at' | 'bio' | 'floor' | 'building' | 'avatar_url'>;         Update: Partial<ProfileRow> };
      communities:       { Row: CommunityRow;     Insert: MakeOptional<CommunityRow, 'id' | 'created_at' | 'subtitle' | 'features'>;                      Update: Partial<CommunityRow> };
      community_members: { Row: CommunityMemberRow; Insert: MakeOptional<CommunityMemberRow, 'id' | 'joined_at' | 'role' | 'status'>;                    Update: Partial<CommunityMemberRow> };
      announcements:     { Row: AnnouncementRow;  Insert: MakeOptional<AnnouncementRow, 'id' | 'created_at' | 'type'>;                                   Update: Partial<AnnouncementRow> };
      events:            { Row: EventRow;         Insert: MakeOptional<EventRow, 'id' | 'created_at' | 'description' | 'location'>;                       Update: Partial<EventRow> };
      event_rsvps:       { Row: EventRsvpRow;     Insert: MakeOptional<EventRsvpRow, 'created_at'>;                                                       Update: never };
      help_requests:     { Row: HelpRequestRow;   Insert: MakeOptional<HelpRequestRow, 'id' | 'created_at' | 'floor' | 'resolved'>;                      Update: Partial<HelpRequestRow> };
      polls:             { Row: PollRow;          Insert: MakeOptional<PollRow, 'id' | 'created_at' | 'ends_at'>;                                        Update: Partial<PollRow> };
      poll_options:      { Row: PollOptionRow;    Insert: MakeOptional<PollOptionRow, 'id' | 'position'>;                                                 Update: Partial<PollOptionRow> };
      poll_votes:        { Row: PollVoteRow;      Insert: MakeOptional<PollVoteRow, 'created_at'>;                                                        Update: never };
      market_items:      { Row: MarketItemRow;    Insert: MakeOptional<MarketItemRow, 'id' | 'created_at' | 'description' | 'price' | 'is_free' | 'emoji' | 'sold'>; Update: Partial<MarketItemRow> };
      share_items:       { Row: ShareItemRow;     Insert: MakeOptional<ShareItemRow, 'id' | 'created_at' | 'category' | 'available' | 'expires_at'>;     Update: Partial<ShareItemRow> };
      reactions:         { Row: ReactionRow;      Insert: MakeOptional<ReactionRow, 'id' | 'created_at'>;                                                Update: never };
      notifications:     { Row: NotificationRow;  Insert: MakeOptional<NotificationRow, 'id' | 'created_at' | 'emoji' | 'read' | 'data'>;               Update: Partial<NotificationRow> };
      push_tokens:       { Row: PushTokenRow;     Insert: MakeOptional<PushTokenRow, 'updated_at'>;                                                      Update: Partial<PushTokenRow> };
      wiki_entries:      { Row: WikiEntryRow;     Insert: MakeOptional<WikiEntryRow, 'id' | 'created_at' | 'body' | 'emoji'>;                            Update: Partial<WikiEntryRow> };
    };
    Views: {
      reaction_counts: { Row: { item_type: string; item_id: string; emoji: string; count: number } };
      event_rsvp_counts: { Row: { event_id: string; count: number } };
      poll_option_votes: { Row: { poll_id: string; option_id: string; label: string; position: number; votes: number } };
    };
    Functions: {
      is_community_member: { Args: { p_community_id: string }; Returns: boolean };
      is_community_admin: { Args: { p_community_id: string }; Returns: boolean };
    };
  };
}

// ── App-level types derived from DB rows ──────────────────────
// These are what the screens consume — raw strings, no TranslationKeys.

export type DbAnnouncement = AnnouncementRow & { author_name: string };

export type DbEvent = EventRow & {
  author_name: string;
  rsvp_count: number;
  user_rsvped: boolean;
};

export type DbPoll = PollRow & {
  author_name: string;
  options: { id: string; label: string; votes: number; position: number }[];
  total_votes: number;
  user_vote_option_id: string | null;
};

export type DbHelpRequest = HelpRequestRow & { author_name: string };

export type DbMarketItem = MarketItemRow & { author_name: string };

export type DbShareItem = ShareItemRow & { owner_name: string };

export type DbNotification = NotificationRow;

export type DbWikiEntry = WikiEntryRow & { author_name: string };

// ── App-level community domain types ─────────────────────────
// Shared across AuthContext, screens, and components.

export type CommunityType = 'building' | 'complex' | 'neighborhood' | 'street';

export type CommunityMember = {
  id: string;
  name: string;
  initials: string;
  floor: string;
  isAdmin: boolean;
};

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

export const DEFAULT_FEATURES: CommunityFeatures = {
  polls: true, events: true, share: true,
  market: true, help: true, wiki: true, announcements: true,
};
