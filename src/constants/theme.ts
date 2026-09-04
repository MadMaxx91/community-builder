// Torbu brand design tokens
export const Colors = {
  // Backgrounds
  background: '#F2EFE6',   // Torbu cream
  surface: '#FFFFFF',
  surfaceAlt: '#EAF2EC',   // soft sage tint

  // Text
  ink: '#1E4D3F',          // forest green (primary text + buttons)
  inkSoft: '#3A6655',      // medium green
  inkMuted: '#7DBEA1',     // sage green (secondary text)

  // Border
  border: '#C8DDD4',

  // Button foreground
  accentFg: '#FFFFFF',

  // Brand palette
  yellow: '#F5C15D',
  coral: '#FF7F6E',
  sage: '#7DBEA1',
  cream: '#F2EFE6',

  // Category / tag chips
  tag: {
    share:  { bg: '#E4F2EB', text: '#1E4D3F' },  // green
    event:  { bg: '#FEF4E2', text: '#9A6B15' },  // yellow
    help:   { bg: '#FEEDE9', text: '#B3412F' },  // coral
    alert:  { bg: '#FEEDE9', text: '#B3412F' },  // coral
    poll:   { bg: '#E4F2EB', text: '#1E4D3F' },  // green
    market: { bg: '#FEF4E2', text: '#9A6B15' },  // yellow/amber
    info:   { bg: '#E4F2EB', text: '#1E4D3F' },  // green
    noise:  { bg: '#FEF4E2', text: '#9A6B15' },  // yellow
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

// Font family tokens — loaded in App.tsx via expo-font
export const Font = {
  heading:     'Poppins_700Bold',
  headingSemi: 'Poppins_600SemiBold',
  body:        'Inter_400Regular',
  bodyMedium:  'Inter_500Medium',
  bodySemi:    'Inter_600SemiBold',
};

export const Typography = {
  h1:      { fontFamily: Font.heading,     fontSize: 26, color: Colors.ink },
  h2:      { fontFamily: Font.headingSemi, fontSize: 20, color: Colors.ink },
  h3:      { fontFamily: Font.headingSemi, fontSize: 16, color: Colors.ink },
  body:    { fontFamily: Font.body,        fontSize: 14, color: Colors.inkSoft },
  caption: { fontFamily: Font.body,        fontSize: 12, color: Colors.inkMuted },
  label:   { fontFamily: Font.bodyMedium,  fontSize: 13, color: Colors.ink },
};
