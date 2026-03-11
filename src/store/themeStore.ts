import { create } from 'zustand';

export interface ThemePreset {
  name: string;
  label: string;
  colors: {
    primary: string;
    success: string;
    warning: string;
    navy: string;
    background: string;
    foreground: string;
    card: string;
    muted: string;
    border: string;
    sidebarBg: string;
    sidebarAccent: string;
  };
  dark: {
    background: string;
    foreground: string;
    card: string;
    muted: string;
    border: string;
    sidebarBg: string;
    sidebarAccent: string;
  };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'default',
    label: 'Bleu Classique',
    colors: {
      primary: '217 91% 60%',
      success: '160 84% 39%',
      warning: '38 92% 50%',
      navy: '213 52% 24%',
      background: '210 40% 98%',
      foreground: '215 25% 27%',
      card: '0 0% 100%',
      muted: '210 40% 96%',
      border: '214 32% 91%',
      sidebarBg: '213 52% 24%',
      sidebarAccent: '213 52% 30%',
    },
    dark: {
      background: '222 47% 11%',
      foreground: '210 40% 98%',
      card: '222 47% 15%',
      muted: '217 33% 17%',
      border: '217 33% 22%',
      sidebarBg: '222 47% 8%',
      sidebarAccent: '222 47% 14%',
    },
  },
  {
    name: 'emerald',
    label: 'Vert Émeraude',
    colors: {
      primary: '160 84% 39%',
      success: '160 84% 39%',
      warning: '38 92% 50%',
      navy: '160 40% 20%',
      background: '150 30% 98%',
      foreground: '160 25% 20%',
      card: '0 0% 100%',
      muted: '150 20% 95%',
      border: '150 20% 90%',
      sidebarBg: '160 40% 20%',
      sidebarAccent: '160 40% 26%',
    },
    dark: {
      background: '160 30% 8%',
      foreground: '150 30% 95%',
      card: '160 30% 12%',
      muted: '160 20% 15%',
      border: '160 20% 20%',
      sidebarBg: '160 30% 6%',
      sidebarAccent: '160 30% 12%',
    },
  },
  {
    name: 'purple',
    label: 'Violet Royal',
    colors: {
      primary: '270 60% 55%',
      success: '160 84% 39%',
      warning: '38 92% 50%',
      navy: '270 40% 22%',
      background: '270 20% 98%',
      foreground: '270 20% 20%',
      card: '0 0% 100%',
      muted: '270 15% 95%',
      border: '270 15% 90%',
      sidebarBg: '270 40% 22%',
      sidebarAccent: '270 40% 28%',
    },
    dark: {
      background: '270 30% 8%',
      foreground: '270 15% 95%',
      card: '270 30% 12%',
      muted: '270 20% 15%',
      border: '270 20% 20%',
      sidebarBg: '270 30% 6%',
      sidebarAccent: '270 30% 12%',
    },
  },
  {
    name: 'ocean',
    label: 'Océan Profond',
    colors: {
      primary: '200 80% 50%',
      success: '160 84% 39%',
      warning: '38 92% 50%',
      navy: '200 50% 18%',
      background: '200 30% 98%',
      foreground: '200 25% 20%',
      card: '0 0% 100%',
      muted: '200 20% 95%',
      border: '200 20% 90%',
      sidebarBg: '200 50% 18%',
      sidebarAccent: '200 50% 24%',
    },
    dark: {
      background: '200 40% 8%',
      foreground: '200 20% 95%',
      card: '200 40% 12%',
      muted: '200 30% 15%',
      border: '200 30% 20%',
      sidebarBg: '200 40% 6%',
      sidebarAccent: '200 40% 12%',
    },
  },
  {
    name: 'sunset',
    label: 'Coucher de Soleil',
    colors: {
      primary: '15 80% 55%',
      success: '160 84% 39%',
      warning: '38 92% 50%',
      navy: '15 40% 22%',
      background: '30 30% 98%',
      foreground: '15 25% 20%',
      card: '0 0% 100%',
      muted: '30 20% 95%',
      border: '30 20% 90%',
      sidebarBg: '15 40% 22%',
      sidebarAccent: '15 40% 28%',
    },
    dark: {
      background: '15 30% 8%',
      foreground: '30 20% 95%',
      card: '15 30% 12%',
      muted: '15 20% 15%',
      border: '15 20% 20%',
      sidebarBg: '15 30% 6%',
      sidebarAccent: '15 30% 12%',
    },
  },
];

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  currentTheme: string;
  mode: ThemeMode;
  setTheme: (name: string) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  applyTheme: () => void;
}

function applyColors(preset: ThemePreset, mode: ThemeMode) {
  const root = document.documentElement;
  const isDark = mode === 'dark';
  const darkColors = isDark ? preset.dark : null;

  root.style.setProperty('--primary', preset.colors.primary);
  root.style.setProperty('--success', preset.colors.success);
  root.style.setProperty('--warning', preset.colors.warning);
  root.style.setProperty('--navy', preset.colors.navy);
  root.style.setProperty('--ring', preset.colors.primary);
  root.style.setProperty('--chart-1', preset.colors.primary);
  root.style.setProperty('--sidebar-primary', preset.colors.primary);
  root.style.setProperty('--sidebar-ring', preset.colors.primary);

  const bg = isDark ? darkColors!.background : preset.colors.background;
  const fg = isDark ? darkColors!.foreground : preset.colors.foreground;
  const card = isDark ? darkColors!.card : preset.colors.card;
  const muted = isDark ? darkColors!.muted : preset.colors.muted;
  const border = isDark ? darkColors!.border : preset.colors.border;
  const sbBg = isDark ? darkColors!.sidebarBg : preset.colors.sidebarBg;
  const sbAccent = isDark ? darkColors!.sidebarAccent : preset.colors.sidebarAccent;

  root.style.setProperty('--background', bg);
  root.style.setProperty('--foreground', fg);
  root.style.setProperty('--card', card);
  root.style.setProperty('--card-foreground', fg);
  root.style.setProperty('--popover', card);
  root.style.setProperty('--popover-foreground', fg);
  root.style.setProperty('--muted', muted);
  root.style.setProperty('--muted-foreground', isDark ? '215 20% 55%' : '215 16% 47%');
  root.style.setProperty('--secondary', muted);
  root.style.setProperty('--secondary-foreground', fg);
  root.style.setProperty('--accent', muted);
  root.style.setProperty('--accent-foreground', fg);
  root.style.setProperty('--border', border);
  root.style.setProperty('--input', border);
  root.style.setProperty('--sidebar-background', sbBg);
  root.style.setProperty('--sidebar-foreground', isDark ? '210 40% 90%' : '210 40% 96%');
  root.style.setProperty('--sidebar-accent', sbAccent);
  root.style.setProperty('--sidebar-accent-foreground', isDark ? '210 40% 90%' : '210 40% 96%');
  root.style.setProperty('--sidebar-border', sbAccent);
  root.style.setProperty('--sidebar-muted', isDark ? '213 40% 50%' : '213 40% 40%');

  // Primary foreground stays white for both modes
  root.style.setProperty('--primary-foreground', '0 0% 100%');
  root.style.setProperty('--success-foreground', '0 0% 100%');
  root.style.setProperty('--warning-foreground', '0 0% 100%');
  root.style.setProperty('--navy-foreground', '0 0% 100%');
  root.style.setProperty('--destructive-foreground', '0 0% 100%');
  root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: localStorage.getItem('app_theme') || 'default',
  mode: (localStorage.getItem('app_theme_mode') as ThemeMode) || 'light',
  setTheme: (name) => {
    localStorage.setItem('app_theme', name);
    set({ currentTheme: name });
    const preset = THEME_PRESETS.find((p) => p.name === name);
    if (preset) applyColors(preset, get().mode);
  },
  setMode: (mode) => {
    localStorage.setItem('app_theme_mode', mode);
    set({ mode });
    const { currentTheme } = get();
    const preset = THEME_PRESETS.find((p) => p.name === currentTheme) || THEME_PRESETS[0];
    applyColors(preset, mode);
  },
  toggleMode: () => {
    const newMode = get().mode === 'light' ? 'dark' : 'light';
    get().setMode(newMode);
  },
  applyTheme: () => {
    const { currentTheme, mode } = get();
    const preset = THEME_PRESETS.find((p) => p.name === currentTheme) || THEME_PRESETS[0];
    applyColors(preset, mode);
  },
}));
