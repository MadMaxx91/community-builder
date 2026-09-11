import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Community, CommunityFeatures, CommunityMember, CommunityType, DEFAULT_FEATURES } from '../lib/database.types';

// ── Types ─────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  floor: string;
  building: string;
  bio: string;
  initials: string;
};

type JoinCodeResult = 'ok' | 'pending' | 'not_found' | 'already_joined';

type AuthContextType = {
  user: User | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<User, 'id'>>) => Promise<void>;
  profileVisible: boolean;
  setProfileVisible: (v: boolean) => void;
  joinedCommunities: Community[];
  activeCommunity: Community | null;
  switchCommunity: (id: string) => void;
  joinCommunity: (id: string) => void;
  requestToJoin: (id: string) => Promise<void>;
  joinWithCode: (code: string) => Promise<JoinCodeResult>;
  createCommunity: (data: { name: string; emoji: string; type: CommunityType; isPublic: boolean }) => Promise<void>;
  leaveCommunity: (id: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  pendingJoinIds: string[];
  isAdmin: boolean;
  adminVisible: boolean;
  setAdminVisible: (v: boolean) => void;
  updateActiveCommunity: (updates: Partial<Pick<Community, 'name' | 'features' | 'members'>>) => Promise<void>;
  approveMember: (userId: string) => Promise<void>;
  denyMember: (userId: string) => Promise<void>;
  allKnownCommunities: Community[];
};

const AuthContext = createContext<AuthContextType | null>(null);

// ── Helpers ───────────────────────────────────────────────────

function makeInitials(name: string) {
  return name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function generateCode(name: string) {
  const prefix = name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase().padEnd(2, 'X');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${suffix}`;
}

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Transform a DB community + members into the app's Community type
function toCommunity(
  row: {
    id: string; name: string; emoji: string;
    type: string; subtitle: string; is_public: boolean;
    join_code: string; features: CommunityFeatures;
  },
  memberRows: { user_id: string; role: string; status: string; profiles: { name: string; floor: string } | null }[],
): Community {
  const approved = memberRows.filter(m => m.status === 'approved');
  const members: CommunityMember[] = approved.map(m => ({
    id: m.user_id,
    name: m.profiles?.name ?? 'Unknown',
    initials: makeInitials(m.profiles?.name ?? '?'),
    floor: m.profiles?.floor ?? 'Unknown',
    isAdmin: m.role === 'admin',
  }));
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle || `${approved.length} member${approved.length !== 1 ? 's' : ''}`,
    emoji: row.emoji,
    memberCount: approved.length,
    type: row.type as CommunityType,
    adminIds: approved.filter(m => m.role === 'admin').map(m => m.user_id),
    features: row.features ?? { ...DEFAULT_FEATURES },
    members,
    isPublic: row.is_public,
    joinCode: row.join_code,
    pendingRequestIds: memberRows.filter(m => m.status === 'pending').map(m => m.user_id),
  };
}

// ── Provider ──────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [pendingJoinIds, setPendingJoinIds] = useState<string[]>([]);
  const [publicCommunities, setPublicCommunities] = useState<Community[]>([]);

  const isAdmin = !!(user && activeCommunity?.adminIds.includes(user.id));
  const allKnownCommunities = [
    ...joinedCommunities,
    ...publicCommunities.filter(p => !joinedCommunities.find(j => j.id === p.id)),
  ];

  // ── Session bootstrap ────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUserData(session.user.id);
      else setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        resetState();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load public communities (for "Find more" tab) independently
  useEffect(() => {
    loadPublicCommunities();
  }, []);

  function resetState() {
    setUser(null);
    setJoinedCommunities([]);
    setActiveCommunity(null);
    setPendingJoinIds([]);
    setInitialized(true);
  }

  async function loadUserData(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        floor: profile.floor,
        building: profile.building,
        bio: profile.bio,
        initials: makeInitials(profile.name),
      });
    }

    await loadUserCommunities(userId);
    setInitialized(true);
  }

  async function loadUserCommunities(userId: string) {
    // Fetch all communities this user has a membership row for (any status)
    const { data } = await supabase
      .from('community_members')
      .select(`
        user_id, role, status,
        communities (
          id, name, emoji, type, subtitle, is_public, join_code, features,
          community_members ( user_id, role, status, profiles ( name, floor ) )
        )
      `)
      .eq('user_id', userId);

    if (!data) return;

    const approved: Community[] = [];
    const pending: string[] = [];

    for (const row of data) {
      const c = row.communities as any;
      if (!c) continue;
      if (row.status === 'approved') {
        approved.push(toCommunity(c, c.community_members ?? []));
      } else if (row.status === 'pending') {
        pending.push(c.id);
      }
    }

    setJoinedCommunities(approved);
    setPendingJoinIds(pending);
    setActiveCommunity(prev => {
      if (prev) return approved.find(c => c.id === prev.id) ?? approved[0] ?? null;
      return approved[0] ?? null;
    });
  }

  async function loadPublicCommunities() {
    const { data } = await supabase
      .from('communities')
      .select(`
        id, name, emoji, type, subtitle, is_public, join_code, features,
        community_members ( user_id, role, status, profiles ( name, floor ) )
      `)
      .eq('is_public', true)
      .order('name');

    if (!data) return;
    setPublicCommunities(data.map(c => toCommunity(c as any, (c as any).community_members ?? [])));
  }

  // ── Auth actions ─────────────────────────────────────────────

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error('auth.invalidCredentials');
  }

  async function register(name: string, email: string, password: string) {
    if (!name.trim() || !email.trim()) throw new Error('auth.nameEmailRequired');
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error || !data.user) throw new Error('auth.registerFailed');
    // Profile is created by the DB trigger; update it with extra fields
    await supabase.from('profiles').upsert({
      id: data.user.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    });
  }

  function logout() {
    supabase.auth.signOut();
  }

  async function updateProfile(updates: Partial<Omit<User, 'id'>>) {
    if (!user) return;
    const patch: Record<string, string> = {};
    if (updates.name)     { patch.name = updates.name; patch.initials = makeInitials(updates.name); }
    if (updates.email)    patch.email = updates.email;
    if (updates.bio)      patch.bio = updates.bio;
    if (updates.floor)    patch.floor = updates.floor;
    if (updates.building) patch.building = updates.building;
    await supabase.from('profiles').update(patch).eq('id', user.id);
    setUser(prev => prev ? { ...prev, ...updates, initials: patch.initials ?? prev.initials } : prev);
  }

  // ── Social auth (works on web; native requires expo-auth-session setup) ──

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window?.location?.origin ?? 'torbu://auth/callback' },
    });
  }

  async function loginWithApple() {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window?.location?.origin ?? 'torbu://auth/callback' },
    });
  }

  // ── Community actions ─────────────────────────────────────────

  function switchCommunity(id: string) {
    const c = joinedCommunities.find(c => c.id === id);
    if (c) setActiveCommunity(c);
  }

  function joinCommunity(id: string) {
    // Legacy shim — requestToJoin is the real path
    requestToJoin(id);
  }

  async function requestToJoin(communityId: string) {
    if (!user) return;
    if (joinedCommunities.find(j => j.id === communityId)) return;
    if (pendingJoinIds.includes(communityId)) return;

    await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: user.id,
      role: 'member',
      status: 'pending',
    });
    setPendingJoinIds(prev => [...prev, communityId]);
  }

  async function joinWithCode(code: string): Promise<JoinCodeResult> {
    if (!user) return 'not_found';

    const { data: community } = await supabase
      .from('communities')
      .select('id')
      .ilike('join_code', code.trim())
      .single();

    if (!community) return 'not_found';

    const { data: existing } = await supabase
      .from('community_members')
      .select('status')
      .eq('community_id', community.id)
      .eq('user_id', user.id)
      .single();

    if (existing?.status === 'approved') return 'already_joined';
    if (existing?.status === 'pending')  return 'pending';

    await supabase.from('community_members').insert({
      community_id: community.id,
      user_id: user.id,
      role: 'member',
      status: 'pending',
    });
    setPendingJoinIds(prev => [...prev, community.id]);
    return 'pending';
  }

  async function createCommunity(data: { name: string; emoji: string; type: CommunityType; isPublic: boolean }) {
    if (!user) return;

    const { data: community, error } = await supabase
      .from('communities')
      .insert({
        name: data.name.trim(),
        emoji: data.emoji,
        type: data.type,
        is_public: data.isPublic,
        join_code: generateCode(data.name),
        created_by: user.id,
      })
      .select()
      .single();

    if (error || !community) return;

    await supabase.from('community_members').insert({
      community_id: community.id,
      user_id: user.id,
      role: 'admin',
      status: 'approved',
    });

    await loadUserCommunities(user.id);
    if (!data.isPublic) await loadPublicCommunities();
  }

  async function leaveCommunity(communityId: string) {
    if (!user) return;
    await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id);

    setJoinedCommunities(prev => {
      const next = prev.filter(c => c.id !== communityId);
      if (activeCommunity?.id === communityId) setActiveCommunity(next[0] ?? null);
      return next;
    });
  }

  async function updateActiveCommunity(updates: Partial<Pick<Community, 'name' | 'features' | 'members'>>) {
    if (!activeCommunity) return;
    const patch: Record<string, unknown> = {};
    if (updates.name)     patch.name = updates.name;
    if (updates.features) patch.features = updates.features;

    if (Object.keys(patch).length > 0) {
      await supabase.from('communities').update(patch).eq('id', activeCommunity.id);
    }

    const updated = { ...activeCommunity, ...updates };
    setActiveCommunity(updated);
    setJoinedCommunities(prev => prev.map(c => c.id === updated.id ? updated : c));
  }

  async function approveMember(userId: string) {
    if (!activeCommunity) return;
    await supabase
      .from('community_members')
      .update({ status: 'approved' })
      .eq('community_id', activeCommunity.id)
      .eq('user_id', userId);

    await loadUserCommunities(user!.id);
  }

  async function denyMember(userId: string) {
    if (!activeCommunity) return;
    await supabase
      .from('community_members')
      .update({ status: 'denied' })
      .eq('community_id', activeCommunity.id)
      .eq('user_id', userId);

    const updated: Community = {
      ...activeCommunity,
      pendingRequestIds: activeCommunity.pendingRequestIds.filter(id => id !== userId),
    };
    setActiveCommunity(updated);
    setJoinedCommunities(prev => prev.map(c => c.id === updated.id ? updated : c));
  }

  return (
    <AuthContext.Provider value={{
      user, initialized,
      login, register, logout, updateProfile,
      profileVisible, setProfileVisible,
      joinedCommunities, activeCommunity, switchCommunity,
      joinCommunity, requestToJoin, joinWithCode, createCommunity, leaveCommunity,
      loginWithGoogle, loginWithApple,
      pendingJoinIds,
      isAdmin, adminVisible, setAdminVisible, updateActiveCommunity,
      approveMember, denyMember,
      allKnownCommunities,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
