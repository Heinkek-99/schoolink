import { Bell, Search, User, CalendarDays } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAnneeScolaireStore } from '@/store/anneeScolaireStore';
import { NotificationPanel } from './NotificationPanel';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const { anneeScolaire, setAnneeScolaire, availableYears } = useAnneeScolaireStore();

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3 bg-muted rounded-lg px-3 py-2 w-80">
        <Search size={18} className="text-muted-foreground" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Rechercher..."
          className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Année scolaire selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
          <CalendarDays size={16} className="text-muted-foreground" />
          <select
            value={anneeScolaire}
            onChange={(e) => setAnneeScolaire(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none cursor-pointer text-foreground"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <NotificationPanel />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.prenom} {user?.nom}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
            <User size={18} className="text-primary-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
