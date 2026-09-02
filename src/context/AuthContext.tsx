import React, { createContext, useContext, useState } from 'react';
import { Community, CommunityMember, CommunityType, CommunityFeatures, DEFAULT_FEATURES, allCommunities } from '../data/mock';

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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<User, 'id'>>) => void;
  profileVisible: boolean;
  setProfileVisible: (v: boolean) => void;
  joinedCommunities: Community[];
  activeCommunity: Community | null;
  switchCommunity: (id: string) => void;
  joinCommunity: (id: string) => void;
  requestToJoin: (id: string) => void;
  joinWithCode: (code: string) => JoinCodeResult;
  createCommunity: (data: { name: string; emoji: string; type: CommunityType; isPublic: boolean }) => void;
  leaveCommunity: (id: string) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  pendingJoinIds: string[];
  isAdmin: boolean;
  adminVisible: boolean;
  setAdminVisible: (v: boolean) => void;
  updateActiveCommunity: (updates: Partial<Pick<Community, 'name' | 'features' | 'members'>>) => void;
  approveMember: (userId: string) => void;
  denyMember: (userId: string) => void;
  allKnownCommunities: Community[];
};

const AuthContext = createContext<AuthContextType | null>(null);

function makeInitials(name: string) {
  return name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function generateCode(name: string) {
  const prefix = name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase().padEnd(2, 'X');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${suffix}`;
}

const DEFAULT_COMMUNITIES = [allCommunities[0]];

const MOCK_ACCOUNTS: Record<string, { password: string; user: User }> = {
  'alex@maplehouse.com': {
    password: 'password',
    user: {
      id: 'u1',
      name: 'Alex Kim',
      email: 'alex@maplehouse.com',
      floor: '6th Floor',
      building: 'Maple House',
      bio: '',
      initials: 'AK',
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
  const [joinedCommunities, setJoinedCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [pendingJoinIds, setPendingJoinIds] = useState<string[]>([]);
  const [extraCommunities, setExtraCommunities] = useState<Community[]>([]);

  const allKnownCommunities = [...allCommunities, ...extraCommunities];
  const isAdmin = !!(user && activeCommunity?.adminIds.includes(user.id));

  async function login(email: string, password: string) {
    const account = MOCK_ACCOUNTS[email.toLowerCase()];
    if (!account || account.password !== password) {
      throw new Error('auth.invalidCredentials');
    }
    setUser({ ...account.user });
    setJoinedCommunities(DEFAULT_COMMUNITIES);
    setActiveCommunity(DEFAULT_COMMUNITIES[0]);
  }

  async function register(name: string, email: string, _password: string) {
    if (!name.trim() || !email.trim()) throw new Error('auth.nameEmailRequired');
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      floor: '',
      building: '',
      bio: '',
      initials: makeInitials(name),
    };
    setUser(newUser);
    setJoinedCommunities([DEFAULT_COMMUNITIES[0]]);
    setActiveCommunity(DEFAULT_COMMUNITIES[0]);
  }

  function logout() {
    setUser(null);
    setJoinedCommunities([]);
    setActiveCommunity(null);
    setPendingJoinIds([]);
    setExtraCommunities([]);
  }

  function updateProfile(updates: Partial<Omit<User, 'id'>>) {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      if (updates.name) next.initials = makeInitials(updates.name);
      return next;
    });
  }

  function switchCommunity(id: string) {
    const c = joinedCommunities.find(c => c.id === id);
    if (c) setActiveCommunity(c);
  }

  // Immediate join (legacy, for backward compat)
  function joinCommunity(id: string) {
    const c = allKnownCommunities.find(c => c.id === id);
    if (!c || joinedCommunities.find(j => j.id === id)) return;
    setJoinedCommunities(prev => [...prev, c]);
    setActiveCommunity(c);
  }

  // Request to join — public communities require admin approval
  function requestToJoin(id: string) {
    if (joinedCommunities.find(j => j.id === id)) return;
    if (pendingJoinIds.includes(id)) return;
    setPendingJoinIds(prev => [...prev, id]);
  }

  function joinWithCode(code: string): JoinCodeResult {
    const c = allKnownCommunities.find(c => c.joinCode.toLowerCase() === code.trim().toLowerCase());
    if (!c) return 'not_found';
    if (joinedCommunities.find(j => j.id === c.id)) return 'already_joined';
    if (pendingJoinIds.includes(c.id)) return 'pending';
    setPendingJoinIds(prev => [...prev, c.id]);
    return 'pending';
  }

  function createCommunity(data: { name: string; emoji: string; type: CommunityType; isPublic: boolean }) {
    if (!user) return;
    const id = `c_${Date.now()}`;
    const member: CommunityMember = {
      id: user.id,
      name: user.name,
      initials: user.initials,
      floor: user.floor || 'Unknown',
      isAdmin: true,
    };
    const newCommunity: Community = {
      id,
      name: data.name.trim(),
      subtitle: `1 member`,
      emoji: data.emoji,
      memberCount: 1,
      type: data.type,
      adminIds: [user.id],
      features: { ...DEFAULT_FEATURES },
      members: [member],
      isPublic: data.isPublic,
      joinCode: generateCode(data.name),
      pendingRequestIds: [],
    };
    setExtraCommunities(prev => [...prev, newCommunity]);
    setJoinedCommunities(prev => [...prev, newCommunity]);
    setActiveCommunity(newCommunity);
  }

  async function loginWithGoogle() {
    const mockUser: User = {
      id: `u_google_${Date.now()}`,
      name: 'Google User',
      email: 'google.user@gmail.com',
      floor: '',
      building: '',
      bio: '',
      initials: 'GU',
    };
    setUser(mockUser);
    setJoinedCommunities(DEFAULT_COMMUNITIES);
    setActiveCommunity(DEFAULT_COMMUNITIES[0]);
  }

  async function loginWithApple() {
    const mockUser: User = {
      id: `u_apple_${Date.now()}`,
      name: 'Apple User',
      email: 'apple.user@icloud.com',
      floor: '',
      building: '',
      bio: '',
      initials: 'AU',
    };
    setUser(mockUser);
    setJoinedCommunities(DEFAULT_COMMUNITIES);
    setActiveCommunity(DEFAULT_COMMUNITIES[0]);
  }

  function leaveCommunity(id: string) {
    setJoinedCommunities(prev => {
      const next = prev.filter(c => c.id !== id);
      if (activeCommunity?.id === id) {
        setActiveCommunity(next[0] ?? null);
      }
      return next;
    });
  }

  function updateActiveCommunity(updates: Partial<Pick<Community, 'name' | 'features' | 'members'>>) {
    if (!activeCommunity) return;
    const updated = { ...activeCommunity, ...updates };
    setActiveCommunity(updated);
    setJoinedCommunities(prev => prev.map(c => c.id === updated.id ? updated : c));
    setExtraCommunities(prev => prev.map(c => c.id === updated.id ? updated : c));
  }

  function approveMember(userId: string) {
    if (!activeCommunity || !user) return;
    const communityInAll = allKnownCommunities.find(c => c.id === activeCommunity.id);
    const newMember: CommunityMember = {
      id: userId,
      name: userId === user.id ? user.name : `Member ${userId.slice(-4)}`,
      initials: userId === user.id ? user.initials : userId.slice(-2).toUpperCase(),
      floor: 'Unknown',
      isAdmin: false,
    };
    const updated: Community = {
      ...activeCommunity,
      members: [...activeCommunity.members, newMember],
      pendingRequestIds: activeCommunity.pendingRequestIds.filter(id => id !== userId),
    };
    setActiveCommunity(updated);
    setJoinedCommunities(prev => prev.map(c => c.id === updated.id ? updated : c));
    setExtraCommunities(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (userId === user.id) {
      setPendingJoinIds(prev => prev.filter(id => id !== activeCommunity.id));
    }
  }

  function denyMember(userId: string) {
    if (!activeCommunity) return;
    const updated: Community = {
      ...activeCommunity,
      pendingRequestIds: activeCommunity.pendingRequestIds.filter(id => id !== userId),
    };
    setActiveCommunity(updated);
    setJoinedCommunities(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (userId === user?.id) {
      setPendingJoinIds(prev => prev.filter(id => id !== activeCommunity.id));
    }
  }

  return (
    <AuthContext.Provider value={{
      user, login, register, logout, updateProfile,
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
