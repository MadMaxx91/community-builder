-- ─────────────────────────────────────────────────────────────
-- 001_schema.sql  ·  Torbu core schema
-- Run in: Supabase dashboard → SQL editor
-- ─────────────────────────────────────────────────────────────

-- User profiles (one row per auth.users row)
CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  bio         TEXT        NOT NULL DEFAULT '',
  floor       TEXT        NOT NULL DEFAULT '',
  building    TEXT        NOT NULL DEFAULT '',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Communities
CREATE TABLE communities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  emoji       TEXT        NOT NULL DEFAULT '🏘',
  type        TEXT        NOT NULL CHECK (type IN ('building','complex','neighborhood','street')),
  subtitle    TEXT        NOT NULL DEFAULT '',
  is_public   BOOLEAN     NOT NULL DEFAULT false,
  join_code   TEXT        NOT NULL UNIQUE,
  -- Feature flags stored as JSONB — maps directly to CommunityFeatures type
  features    JSONB       NOT NULL DEFAULT '{"polls":true,"events":true,"share":true,"market":true,"help":true,"wiki":true,"announcements":true}',
  created_by  UUID        REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community membership (pending → approved or denied)
CREATE TABLE community_members (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES profiles(id)    ON DELETE CASCADE,
  role          TEXT        NOT NULL DEFAULT 'member'   CHECK (role   IN ('admin','member')),
  status        TEXT        NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','denied')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

-- Announcements
CREATE TABLE announcements (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id     UUID        NOT NULL REFERENCES profiles(id),
  type          TEXT        NOT NULL DEFAULT 'info' CHECK (type IN ('alert','info','noise')),
  title         TEXT        NOT NULL,
  body          TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events
CREATE TABLE events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id     UUID        NOT NULL REFERENCES profiles(id),
  title         TEXT        NOT NULL,
  description   TEXT        NOT NULL DEFAULT '',
  location      TEXT        NOT NULL DEFAULT '',
  starts_at     TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Event RSVPs
CREATE TABLE event_rsvps (
  event_id    UUID        NOT NULL REFERENCES events(id)    ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Help requests
CREATE TABLE help_requests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id     UUID        NOT NULL REFERENCES profiles(id),
  title         TEXT        NOT NULL,
  body          TEXT        NOT NULL,
  floor         TEXT        NOT NULL DEFAULT '',
  resolved      BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Polls
CREATE TABLE polls (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id     UUID        NOT NULL REFERENCES profiles(id),
  question      TEXT        NOT NULL,
  ends_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Poll options
CREATE TABLE poll_options (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id   UUID    NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label     TEXT    NOT NULL,
  position  INTEGER NOT NULL DEFAULT 0
);

-- Poll votes — one vote per user per poll (on delete/insert to change vote)
CREATE TABLE poll_votes (
  poll_id    UUID        NOT NULL REFERENCES polls(id)        ON DELETE CASCADE,
  option_id  UUID        NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id)     ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (poll_id, user_id)
);

-- Marketplace listings
CREATE TABLE market_items (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID          NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id     UUID          NOT NULL REFERENCES profiles(id),
  title         TEXT          NOT NULL,
  description   TEXT          NOT NULL DEFAULT '',
  price         NUMERIC(10,2),
  is_free       BOOLEAN       NOT NULL DEFAULT false,
  emoji         TEXT          NOT NULL DEFAULT '📦',
  sold          BOOLEAN       NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Share / borrow items
CREATE TABLE share_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  owner_id      UUID        NOT NULL REFERENCES profiles(id),
  title         TEXT        NOT NULL,
  category      TEXT        NOT NULL DEFAULT '',
  available     BOOLEAN     NOT NULL DEFAULT true,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reactions (polymorphic — one per user per item)
CREATE TABLE reactions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_type  TEXT        NOT NULL CHECK (item_type IN ('announcement','event','poll','help_request','market_item')),
  item_id    UUID        NOT NULL,
  emoji      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

-- In-app notifications
CREATE TABLE notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL,
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  emoji      TEXT        NOT NULL DEFAULT '📢',
  read       BOOLEAN     NOT NULL DEFAULT false,
  data       JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expo push tokens (one user can have many devices)
CREATE TABLE push_tokens (
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token      TEXT        NOT NULL,
  platform   TEXT        NOT NULL CHECK (platform IN ('ios','android','web')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, token)
);
