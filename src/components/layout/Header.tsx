import { Search, User, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { NotificationPanel } from './NotificationPanel';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const { mode, toggleMode } = useThemeStore();

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

      <div className="flex items-center gap-3">
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleMode}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title={mode === 'light' ? 'Mode sombre' : 'Mode clair'}
        >
          {mode === 'light' ? (
            <Moon size={20} strokeWidth={1.5} className="text-muted-foreground" />
          ) : (
            <Sun size={20} strokeWidth={1.5} className="text-muted-foreground" />
          )}
        </button>

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
