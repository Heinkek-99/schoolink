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
  },
];

interface ThemeState {
  currentTheme: string;
  setTheme: (name: string) => void;
  applyTheme: () => void;
}

function applyColors(preset: ThemePreset) {
  const root = document.documentElement;
  root.style.setProperty('--primary', preset.colors.primary);
  root.style.setProperty('--success', preset.colors.success);
  root.style.setProperty('--warning', preset.colors.warning);
  root.style.setProperty('--navy', preset.colors.navy);
  root.style.setProperty('--background', preset.colors.background);
  root.style.setProperty('--foreground', preset.colors.foreground);
  root.style.setProperty('--card', preset.colors.card);
  root.style.setProperty('--card-foreground', preset.colors.foreground);
  root.style.setProperty('--popover', preset.colors.card);
  root.style.setProperty('--popover-foreground', preset.colors.foreground);
  root.style.setProperty('--muted', preset.colors.muted);
  root.style.setProperty('--secondary', preset.colors.muted);
  root.style.setProperty('--accent', preset.colors.muted);
  root.style.setProperty('--border', preset.colors.border);
  root.style.setProperty('--input', preset.colors.border);
  root.style.setProperty('--ring', preset.colors.primary);
  root.style.setProperty('--sidebar-background', preset.colors.sidebarBg);
  root.style.setProperty('--sidebar-accent', preset.colors.sidebarAccent);
  root.style.setProperty('--sidebar-border', preset.colors.sidebarAccent);
  root.style.setProperty('--sidebar-primary', preset.colors.primary);
  root.style.setProperty('--sidebar-ring', preset.colors.primary);
  root.style.setProperty('--chart-1', preset.colors.primary);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: localStorage.getItem('app_theme') || 'default',
  setTheme: (name) => {
    localStorage.setItem('app_theme', name);
    set({ currentTheme: name });
    const preset = THEME_PRESETS.find((p) => p.name === name);
    if (preset) applyColors(preset);
  },
  applyTheme: () => {
    const { currentTheme } = get();
    const preset = THEME_PRESETS.find((p) => p.name === currentTheme);
    if (preset && currentTheme !== 'default') applyColors(preset);
  },
}));
