import { Bell, Search, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function Header() {
  const user = useAuthStore((s) => s.user);

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
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell size={20} strokeWidth={1.5} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
        </button>

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
