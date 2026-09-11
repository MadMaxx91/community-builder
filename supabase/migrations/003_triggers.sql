-- ─────────────────────────────────────────────────────────────
-- 003_triggers.sql  ·  Triggers and helper functions
-- Run after 002_rls.sql
-- ─────────────────────────────────────────────────────────────

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Aggregate reaction counts as a convenience view
-- Used by the app to quickly fetch all reactions for a set of items
CREATE OR REPLACE VIEW reaction_counts AS
  SELECT
    item_type,
    item_id,
    emoji,
    COUNT(*) AS count
  FROM reactions
  GROUP BY item_type, item_id, emoji;

-- Aggregate RSVP counts per event
CREATE OR REPLACE VIEW event_rsvp_counts AS
  SELECT event_id, COUNT(*) AS count
  FROM event_rsvps
  GROUP BY event_id;

-- Aggregate poll vote counts per option
CREATE OR REPLACE VIEW poll_option_votes AS
  SELECT
    po.poll_id,
    po.id AS option_id,
    po.label,
    po.position,
    COUNT(pv.user_id) AS votes
  FROM poll_options po
  LEFT JOIN poll_votes pv ON pv.option_id = po.id
  GROUP BY po.poll_id, po.id, po.label, po.position;
