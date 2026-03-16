import { User, Sun, Moon, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useAppStore } from '@/store/appStore';
import { NotificationPanel } from './NotificationPanel';
import { GlobalSearch } from './GlobalSearch';
import { useIsMobile } from '@/hooks/use-mobile';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const { mode, toggleMode } = useThemeStore();
  const toggleMobileSidebar = useAppStore((s) => s.toggleMobileSidebar);
  const isMobile = useIsMobile();

  const schoolLogo = localStorage.getItem('school_logo');
  const schoolName = localStorage.getItem('school_name');

  return (
    <header className="h-14 sm:h-16 bg-card border-b flex items-center justify-between px-3 sm:px-6 shrink-0 gap-2">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {isMobile && (
          <button onClick={toggleMobileSidebar} className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0">
            <Menu size={22} className="text-foreground" />
          </button>
        )}

        {(schoolLogo || schoolName) && (
          <div className="flex items-center gap-2 shrink-0">
            {schoolLogo && (
              <img src={schoolLogo} alt="Logo" className="h-8 w-8 rounded-md object-contain" />
            )}
            {schoolName && !isMobile && (
              <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{schoolName}</span>
            )}
          </div>
        )}

        <GlobalSearch />
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={toggleMode}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors"
          title={mode === 'light' ? 'Mode sombre' : 'Mode clair'}
        >
          {mode === 'light' ? (
            <Moon size={18} strokeWidth={1.5} className="text-muted-foreground" />
          ) : (
            <Sun size={18} strokeWidth={1.5} className="text-muted-foreground" />
          )}
        </button>

        <NotificationPanel />

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.prenom} {user?.nom}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary flex items-center justify-center">
            <User size={16} className="text-primary-foreground" />
              {/* {user?.prenom?.[0]}{user?.nom?.[0]}
            </span> */}
          </div>
        </div>
      </div>
    </header>
  );
}
