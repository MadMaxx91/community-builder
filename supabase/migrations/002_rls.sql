-- ─────────────────────────────────────────────────────────────
-- 002_rls.sql  ·  Row-level security policies
-- Run after 001_schema.sql
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on every table
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps      ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls             ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options      ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens       ENABLE ROW LEVEL SECURITY;

-- ── Helper functions ──────────────────────────────────────────

-- Is the calling user an approved member of this community?
CREATE OR REPLACE FUNCTION is_community_member(p_community_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = p_community_id
      AND user_id      = auth.uid()
      AND status       = 'approved'
  );
$$;

-- Is the calling user an admin of this community?
CREATE OR REPLACE FUNCTION is_community_admin(p_community_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = p_community_id
      AND user_id      = auth.uid()
      AND role         = 'admin'
      AND status       = 'approved'
  );
$$;

-- ── Profiles ──────────────────────────────────────────────────

CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ── Communities ───────────────────────────────────────────────

-- Public communities are visible to everyone; private only to members
CREATE POLICY "Read visible communities"
  ON communities FOR SELECT TO authenticated
  USING (is_public = true OR is_community_member(id));

CREATE POLICY "Create community"
  ON communities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update community settings"
  ON communities FOR UPDATE TO authenticated
  USING (is_community_admin(id));

-- ── Community members ─────────────────────────────────────────

CREATE POLICY "Members can see the roster"
  ON community_members FOR SELECT TO authenticated
  USING (is_community_member(community_id));

-- Users insert their own row (always starts as 'member' role)
CREATE POLICY "Users can request membership"
  ON community_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'member');

-- Admins update status (approve / deny); users can demote themselves (leave)
CREATE POLICY "Admins approve or deny members"
  ON community_members FOR UPDATE TO authenticated
  USING (is_community_admin(community_id));

-- Users leave; admins remove members
CREATE POLICY "Leave or remove member"
  ON community_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR is_community_admin(community_id));

-- ── Content tables (announcements, events, help, polls, market, share) ──

-- Generic pattern: members read; members write; author/admin delete

CREATE POLICY "Members read announcements"
  ON announcements FOR SELECT TO authenticated USING (is_community_member(community_id));
CREATE POLICY "Members post announcements"
  ON announcements FOR INSERT TO authenticated WITH CHECK (is_community_member(community_id));
CREATE POLICY "Author or admin deletes announcement"
  ON announcements FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR is_community_admin(community_id));

CREATE POLICY "Members read events"
  ON events FOR SELECT TO authenticated USING (is_community_member(community_id));
CREATE POLICY "Members post events"
  ON events FOR INSERT TO authenticated WITH CHECK (is_community_member(community_id));
CREATE POLICY "Author or admin deletes event"
  ON events FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR is_community_admin(community_id));

-- RSVPs: visible to members of the event's community
CREATE POLICY "Members read RSVPs"
  ON event_rsvps FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM events e WHERE e.id = event_id AND is_community_member(e.community_id)));
CREATE POLICY "Users RSVP"
  ON event_rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users cancel RSVP"
  ON event_rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Members read help requests"
  ON help_requests FOR SELECT TO authenticated USING (is_community_member(community_id));
CREATE POLICY "Members post help requests"
  ON help_requests FOR INSERT TO authenticated WITH CHECK (is_community_member(community_id));
CREATE POLICY "Author or admin updates help request"
  ON help_requests FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR is_community_admin(community_id));

CREATE POLICY "Members read polls"
  ON polls FOR SELECT TO authenticated USING (is_community_member(community_id));
CREATE POLICY "Members post polls"
  ON polls FOR INSERT TO authenticated WITH CHECK (is_community_member(community_id));

CREATE POLICY "Members read poll options"
  ON poll_options FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM polls p WHERE p.id = poll_id AND is_community_member(p.community_id)));
CREATE POLICY "Members insert poll options"
  ON poll_options FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM polls p WHERE p.id = poll_id AND is_community_member(p.community_id)));

CREATE POLICY "Members read votes"
  ON poll_votes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM polls p WHERE p.id = poll_id AND is_community_member(p.community_id)));
CREATE POLICY "Users vote"
  ON poll_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users change vote"
  ON poll_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Members read market items"
  ON market_items FOR SELECT TO authenticated USING (is_community_member(community_id));
CREATE POLICY "Members post market items"
  ON market_items FOR INSERT TO authenticated WITH CHECK (is_community_member(community_id));
CREATE POLICY "Author or admin manages market item"
  ON market_items FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR is_community_admin(community_id));

CREATE POLICY "Members read share items"
  ON share_items FOR SELECT TO authenticated USING (is_community_member(community_id));
CREATE POLICY "Members post share items"
  ON share_items FOR INSERT TO authenticated WITH CHECK (is_community_member(community_id));

-- ── Reactions ─────────────────────────────────────────────────

-- No per-row community check: the items themselves are already community-scoped
CREATE POLICY "Authenticated users read reactions"
  ON reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage their own reactions"
  ON reactions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Notifications ─────────────────────────────────────────────

CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ── Push tokens ───────────────────────────────────────────────

CREATE POLICY "Users manage own push tokens"
  ON push_tokens FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
