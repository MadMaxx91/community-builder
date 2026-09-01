export const Colors = {
  background: '#F5F4F0',
  surface: '#FFFFFF',
  surfaceAlt: '#EEEDE9',
  ink: '#1A1A1A',
  inkSoft: '#6B6B6B',
  inkMuted: '#A0A0A0',
  border: '#E4E3DF',
  accent: '#1A1A1A',
  accentFg: '#FFFFFF',
  tag: {
    share: { bg: '#E8F4EC', text: '#2D6A4F' },
    event: { bg: '#EAE8F8', text: '#3D35A0' },
    help: { bg: '#FFF0E6', text: '#A0440C' },
    alert: { bg: '#FDE8E8', text: '#991B1B' },
    poll: { bg: '#E6F0FF', text: '#1B4FBF' },
    market: { bg: '#F5F0E8', text: '#7A5C2E' },
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
};

export const Typography = {
  h1: { fontSize: 26, fontWeight: '700' as const, color: Colors.ink },
  h2: { fontSize: 20, fontWeight: '600' as const, color: Colors.ink },
  h3: { fontSize: 16, fontWeight: '600' as const, color: Colors.ink },
  body: { fontSize: 14, fontWeight: '400' as const, color: Colors.inkSoft },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.inkMuted },
  label: { fontSize: 13, fontWeight: '500' as const, color: Colors.ink },
};
