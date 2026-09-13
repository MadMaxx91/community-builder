# Torbu – Community Builder

## Expo version

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo 57, targeting **web** (Expo Go / web browser) |
| Backend | **Supabase** – PostgreSQL, Auth, Realtime, Storage |
| Navigation | React Navigation v7, custom animated pill tab bar |
| Styling | `StyleSheet.create` + shared constants in `src/constants/theme.ts` |
| i18n | `src/i18n/translations.ts` – EN + HU, `useLanguage()` hook |
| Fonts | `@expo-google-fonts/poppins`, `@expo-google-fonts/inter`, `expo-font` |

---

## Project structure

```
src/
  constants/       theme.ts (Colors, Spacing, Typography, Radius, Font)
  context/
    AuthContext.tsx       user, isAdmin, activeCommunity, setAdminVisible …
    ContentContext.tsx    all CRUD for every content type
    LanguageContext.tsx   t() translation helper
  components/
    ItemActionMenu.tsx    "…" overflow menu (Modal-based, root-level rendering)
    Edit*Modal.tsx        per-type edit modals
    Create*Modal.tsx      per-type create modals (accept optional `item` prop for edit mode)
    *Card.tsx             canEdit / onEdit / onDelete props
  screens/
    HomeScreen.tsx        Announcements feed
    CalendarScreen.tsx    Mini calendar + event list
    ShareScreen.tsx       Share items
    EventsScreen.tsx      Full events list
    CommunityScreen.tsx   Tabs: Help / Polls / Market / Wiki
    CommunityAdminScreen.tsx  Admin modal (features, wiki policy, members, invites)
  navigation/
    TabNavigator.tsx      4-tab animated pill bar (Home · Calendar · Share · Community)
  lib/
    supabase.ts           Supabase client
    database.types.ts     All DB row types + app-level derived types
```

---

## Supabase integration status

- **Auth**: email/password sign-up + sign-in via `supabase.auth`.
- **Data**: all content types (announcements, events, help requests, polls, market items, share items, wiki entries, RSVPs, reactions) are read from and written to Supabase.
- **Realtime**: subscriptions set up in `ContentContext` for live updates.
- **RLS**: policies use `is_community_member()` and `is_community_admin()` Postgres functions.
- **JSONB features column**: `communities.features` stores `CommunityFeatures` as JSONB. No migration needed to add new keys (e.g. `wiki_edit_policy`).

---

## Edit / delete permissions

All editable content follows this pattern:

```tsx
canEdit={user?.id === item.author_id || isAdmin}
onEdit={() => setEditing(item)}
onDelete={() => deleteItem(item.id)}
```

Exception — **Wiki**: permission is policy-based, controlled by admin:

```tsx
canEdit={isAdmin || features?.wiki_edit_policy !== 'admin_only'}
```

`wiki_edit_policy` is stored in the `features` JSONB column. Default (key absent) = members can edit.

---

## ItemActionMenu

`src/components/ItemActionMenu.tsx` renders the "…" overflow button.

- Uses React Native `Modal` (transparent, no animation) so the dropdown renders **at page root level**, bypassing all z-index / stacking context issues in RN Web.
- Position calculated via `measureInWindow` + `window.innerWidth` for web.
- `collapsable={false}` on the trigger `View` is required for `measureInWindow` to work in RN Web.
- If `onEdit` is omitted, the Edit option is hidden (used for Polls: delete-only).
- Renders nothing when `canEdit` is false.

---

## CommunityFeatures JSONB schema

```ts
type CommunityFeatures = {
  polls: boolean; events: boolean; share: boolean;
  market: boolean; help: boolean; wiki: boolean; announcements: boolean;
  wiki_edit_policy?: 'members' | 'admin_only';   // absent = members (default)
};
```

---

## i18n keys to know

- `admin.featureWiki` → `'Wiki'` (was "Building wiki" — already renamed)
- `home.buildingWiki` → `'Wiki'`
- All translation keys live in `src/i18n/translations.ts`

---

## Known gotchas

- **Tab bar initial tab**: `initialRouteName="Calendar"` in `TabNavigator`; `INITIAL_INDEX = 1`.
- **Calendar is static**: month/year/today are hardcoded constants at the top of `CalendarScreen.tsx`. Filter logic uses `getFullYear/getMonth/getDate` against those constants.
- **Scale on web**: the browser preview renders at 0.5 scale — screenshot coordinates are halved. Actual click coordinates are in the full 742×800 frame.
- **Font packages**: `@expo-google-fonts/poppins`, `@expo-google-fonts/inter`, and `expo-font` must be installed (`npm install`) after any fresh clone or `_main_` merge.

---

## Next steps / missing features

### High priority

- [ ] **Apple Sign-In** (`expo-apple-authentication`) — required for App Store apps that offer social login.
- [ ] **Google Sign-In** (`@react-native-google-signin/google-signin` or Expo AuthSession) — configure OAuth app in Google Cloud Console + Supabase Auth provider.
- [ ] **Push notifications** (`expo-notifications` + Supabase Edge Function) — store device tokens in `push_tokens` table (schema already exists), send on new announcement / event / mention via an Edge Function triggered by a DB webhook.
- [ ] **Real-time calendar**: replace hardcoded `MONTH`, `YEAR`, `TODAY` constants with `new Date()` so the calendar reflects the actual current month.

### Auth & onboarding

- [ ] **Password reset flow** — "Forgot password" → Supabase `resetPasswordForEmail` → deep-link back to app.
- [ ] **Email verification** — prompt unverified users to verify before posting content.
- [ ] **Profile photo upload** — `supabase.storage` bucket + `expo-image-picker`; update `profiles.avatar_url`.
- [ ] **Onboarding flow** — first-launch screens: create or join a community, set name/floor/building.

### Community features

- [ ] **Reactions** — `reactions` table and `reaction_counts` view already exist; UI for emoji-react on announcements/events/polls/help/market items is not yet built.
- [ ] **Poll creation restrictions** — currently any member can create polls; consider `poll_create_policy` similar to `wiki_edit_policy`.
- [ ] **Event RSVP cap** — optional max attendees field + waitlist logic.
- [ ] **Market item "sold" toggle** — UI button for owner to mark item as sold; `market_items.sold` column exists.
- [ ] **Share item "available" toggle** — UI for owner to mark availability; `share_items.available` exists.
- [ ] **Help request "resolved" toggle** — `help_requests.resolved` exists but no UI to mark resolved.
- [ ] **Notifications screen** — `notifications` table exists; build a UI list with mark-as-read.
- [ ] **Multiple communities** — `AuthContext` has `activeCommunity` but community switching UI is minimal.

### Infrastructure

- [ ] **Supabase Edge Functions** — needed for push notifications, invite emails, and any server-side logic.
- [ ] **RLS hardening** — audit all policies; ensure members can only edit/delete their own rows (currently rely on app-level `canEdit` guard, not enforced at DB level for updates).
- [ ] **File storage** — announcements and market items have no image support yet; add `supabase.storage` upload + CDN URL storage.
- [ ] **Offline support** — no local cache; all screens show empty on network loss.
- [ ] **Error boundaries** — no global error handling; Supabase errors are silently swallowed in most context functions.
- [ ] **CI / EAS Build** — no build pipeline configured; set up EAS Build + submit for iOS/Android.
