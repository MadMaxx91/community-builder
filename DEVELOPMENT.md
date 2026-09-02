# Community App — Development Notes

This document describes what has been built, how each feature works, and what is currently mocked and needs real backend implementation before shipping.

---

## Tech Stack

- **React Native / Expo 57** (web target via Metro bundler, `expo start --web`)
- **React Navigation** — bottom tabs + stack navigator for auth
- **React Context** — `AuthContext` (auth + community state), `LanguageContext` (i18n), `ContentContext` (feed, reactions, notifications, user polls)
- **TypeScript** — strict types throughout, including type-safe translation keys

---

## Features Built

### Authentication

- Email + password login screen with validation
- Registration screen (name, email, password, confirm password)
- **Mock "Continue with Google" and "Continue with Apple" buttons** — both log in immediately with a pre-set mock user profile; no real OAuth flow
- Logout from profile screen

### Internationalisation (i18n)

- Full translation support for English and Hungarian
- Language selector in Profile screen — dropdown with search field
- All UI strings, mock data content, and admin strings are translated
- `TranslationKey` type ensures exhaustive coverage at compile time
- Variable interpolation: `t('home.greeting', { name: 'Alex' })` → `"Hello, Alex!"`

### Community Switcher

- Pill button showing active community name + emoji
- **"My communities" tab** — switch between joined communities, leave a community
- **"Find more" tab** — search public communities by name or subtitle, filter by type (building / complex / neighborhood / street), request to join
- **Pending join requests** — appear in "My communities" with a "Pending" badge while awaiting admin approval
- **Join with code** — private communities can be joined by entering a code (e.g. `WL-3T8N`)
- **Create community** — name, emoji picker, type selector, public/private visibility toggle

### Create Community

- Community type: Building, Complex, Neighborhood, Street
- Public: discoverable in search, members need admin approval to join
- Private: hidden from search, joinable only via invite code or direct code entry
- Creator is automatically set as admin

### Community Feed

- Unified chronological stream on the Home screen — replaces the separate "active poll" and "announcements" sections
- Shows: announcements, events, polls, help requests, marketplace listings, interleaved
- User-created polls appear at the top immediately after posting
- Each card shows content type label, timestamp, and a reaction bar
- `ContentContext` merges mock data with user-created content

### Community Directory (People tab)

- First tab in the Community screen — works for any community type (buildings, friend groups, etc.)
- Lists all members with avatar, name, floor, and admin badge
- Live search by name

### Reactions

- Emoji reactions (👍 ❤️ 😄 😮) on: announcements (Home feed + Community screen), help requests, polls, and all community feed cards
- Tapping the `＋` button opens a picker; tapping an existing chip toggles your reaction on/off
- Counts update in real time; your active reaction is highlighted
- State lives in `ContentContext` (in-memory)

### Poll Creation

- "New poll" button in the Polls tab of the Community screen
- Supports 2–5 options, question text, and a 1/3/7-day duration
- User-created polls appear in the Polls tab and at the top of the community feed

### Notification Center

- Bell icon in the Home screen header with unread count badge
- Slide-up modal showing all notifications with emoji, title, body, and time
- Tap a notification to mark it read; "Mark all read" clears all at once
- Mock notifications pre-seeded (join approved, new announcement, new event, new help, new poll, new member, reaction)

### Community Screen (tabs inside a community)

- **People** — community directory with member search (see above)
- **Help requests** — open/resolved status, "I can help" CTA, reactions
- **Polls** — visual bar chart, winner highlighted, vote counts, reactions; create new poll button
- **Marketplace** — item listings with price or "Free" badge, contact button
- **Building Wiki** — static info cards (trash, super, pool, emergency, mailroom)
- Tabs are filtered by the community's enabled features; People tab is always visible
- Tabs scroll horizontally so all 5 fit on small screens

### Community Admin Screen

- Accessible via gear icon — only visible to community admins
- **Details** — rename the community
- **Join code** — displays the community's join code with public/private badge
- **Pending requests** — approve or deny join requests (only shown when requests exist)
- **Features** — toggle 7 features on/off per community (Announcements, Polls, Events, Share & Borrow, Marketplace, Help requests, Building wiki)
- **Members** — view all members, promote/demote admin, remove members
- **Invite by email** — shows "Invite sent!" confirmation for 3 seconds (no real email sent)
- Save button commits all changes

### Events Screen

- List of upcoming events with date, time, location, host, attendee count
- RSVP / Cancel RSVP toggle
- Filter between "All events" and "My RSVPs"

### Share & Borrow Screen

- Item listings with availability status, owner, floor, expiry
- Category filter chips
- Summary stats bar (available now / borrowed / total)

### Profile Screen

- Edit name, bio, floor, building
- Language selector with search
- Log out

### Bottom Navigation

- Home, Events, Share, Community tabs
- Events and Share tabs are hidden when those features are disabled for the active community

---

## What Is Currently Mocked

Everything below uses in-memory state or hardcoded data. It needs real backend integration before production.

### Authentication

| What | Mock behavior | What real implementation needs |
|---|---|---|
| Email/password login | Accepts only `alex@maplehouse.com / password` | Auth service (e.g. Firebase Auth, Supabase, custom JWT) |
| Registration | Creates a local user object, no persistence | User creation API + email verification |
| "Continue with Google" | Instantly logs in as "Google User" with a fixed mock profile | Google OAuth 2.0 / Sign in with Google SDK |
| "Continue with Apple" | Instantly logs in as "Apple User" with a fixed mock profile | Sign in with Apple SDK (required for App Store) |
| Session persistence | State is lost on refresh — no token storage | Secure token storage (`expo-secure-store`), refresh token logic |
| Password reset | Not implemented | Password reset email flow |

### Community Data

| What | Mock behavior | What real implementation needs |
|---|---|---|
| Community list | Hardcoded array in `src/data/mock.ts` | API: `GET /communities` with search/filter |
| Joined communities | In-memory state, resets on refresh | Per-user membership table in database |
| Join requests | In-memory `pendingJoinIds` array | `community_members` table with `status: pending/approved/denied` |
| Join with code | Linear scan over in-memory array | API lookup by code, server-side validation |
| Create community | Pushes to local React state | `POST /communities`, persisted with generated join code |
| Community settings (save) | Updates React state only | `PATCH /communities/:id` |
| Invite by email | Shows "Invite sent!" toast, no email sent | Email delivery service (SendGrid, Postmark, etc.) |
| Approve / deny member | Updates in-memory pendingRequestIds | API call + push notification to the requester |
| Leave community | Removes from local state | `DELETE /community_members/:id` |

### Content / Feed

| What | Mock behavior | What real implementation needs |
|---|---|---|
| Polls | Static data in `mock.ts`; voting is UI-only | `POST /polls`, `POST /polls/:id/vote`, real-time vote counts |
| Poll creation | Local state in `ContentContext`; resets on refresh | `POST /polls` persisted per community; visible to all members |
| Events | Static list; RSVP is local toggle | `POST /events`, `POST /events/:id/rsvp`, calendar integration |
| Help requests | Static list; "I can help" is a no-op button | `POST /help_requests`, response/resolution flow, notifications |
| Marketplace | Static list; "Contact" is a no-op button | `POST /market_items`, in-app messaging or contact reveal |
| Share & Borrow | Static list; "Ask" is a no-op button | `POST /share_items`, borrow request flow |
| Announcements | Static list | `POST /announcements` (admin only), push notifications |
| Building Wiki | Hardcoded entries | CMS or admin-editable wiki entries per community |
| Community feed | Computed from mock arrays + local user polls; static ordering | `GET /feed?communityId=…` with cursor pagination; real-time via WebSocket or polling |
| Reactions | In-memory `ContentContext`; resets on refresh | `POST /reactions` (itemType + itemId + emoji); user can have one reaction per item; counts aggregated on server |
| Notifications | 7 pre-seeded mock items; read state is in-memory | Push notifications via `expo-notifications`; notification feed API (`GET /notifications`); per-event subscription model |

### User Profile

| What | Mock behavior | What real implementation needs |
|---|---|---|
| Profile updates | Updates local React state only | `PATCH /users/me` |
| Profile photo | Not implemented | Image upload (`expo-image-picker`, object storage) |
| Floor / building fields | Free-text inputs | Validated against building directory, or address lookup |

### Notifications

| What | Mock behavior | What real implementation needs |
|---|---|---|
| Push notifications | Not implemented anywhere | `expo-notifications`, per-event subscription, server-side triggers |
| In-app notification centre | Not implemented | Notification feed API, read/unread state |

### Deep Links & Sharing

| What | Mock behavior | What real implementation needs |
|---|---|---|
| Private community invite link | Join code displayed in admin screen | Universal link / dynamic link (e.g. `community.app/join/WL-3T8N`) that opens the app and pre-fills the code |
| Share item / event | Not implemented | Native share sheet, shareable deep link per item |

---

## File Overview

```
src/
├── context/
│   ├── AuthContext.tsx        — auth state, community state, all mock login functions
│   ├── LanguageContext.tsx    — i18n provider, t() helper
│   └── ContentContext.tsx     — feed items, reactions, notifications, user-created polls
├── data/
│   └── mock.ts                — all hardcoded community, poll, event, etc. data; UserPoll type
├── i18n/
│   └── translations.ts        — EN + HU strings, TranslationKey type
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx    — email login + mock Google/Apple buttons
│   │   └── RegisterScreen.tsx
│   ├── HomeScreen.tsx         — greeting, shortcuts, community feed, notification bell
│   ├── CommunityScreen.tsx    — people/help/polls/market/wiki tabs, poll create button
│   ├── CommunityAdminScreen.tsx
│   ├── EventsScreen.tsx
│   ├── ShareScreen.tsx
│   └── ProfileScreen.tsx
├── components/
│   ├── CommunitySwitcher.tsx  — community picker modal, join with code, create
│   ├── CreateCommunityModal.tsx
│   ├── CreatePollModal.tsx    — new poll flow (question, options, duration)
│   ├── NotificationCenter.tsx — notification modal with read/unread state
│   ├── FeedCard.tsx           — unified feed card for all content types
│   ├── ReactionBar.tsx        — emoji reaction picker + count chips
│   ├── AnnouncementCard.tsx
│   ├── EventCard.tsx
│   ├── ShareItemCard.tsx
│   └── ui/                    — Avatar, Badge, Button primitives
└── navigation/
    ├── RootNavigator.tsx
    └── TabNavigator.tsx
```
