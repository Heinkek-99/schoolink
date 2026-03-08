import { create } from 'zustand';

function detectCurrentYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  // School year starts in September (month 8)
  if (month >= 8) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

interface AnneeScolaireState {
  anneeScolaire: string;
  setAnneeScolaire: (a: string) => void;
  availableYears: string[];
}

const currentYear = (() => {
  const saved = localStorage.getItem('sf_annee_scolaire');
  return saved || detectCurrentYear();
})();

function generateYears(): string[] {
  const now = new Date().getFullYear();
  const years: string[] = [];
  for (let y = now + 1; y >= now - 5; y--) {
    years.push(`${y}-${y + 1}`);
  }
  return years;
}

export const useAnneeScolaireStore = create<AnneeScolaireState>((set) => ({
  anneeScolaire: currentYear,
  availableYears: generateYears(),
  setAnneeScolaire: (a) => {
    localStorage.setItem('sf_annee_scolaire', a);
    set({ anneeScolaire: a });
  },
}));
