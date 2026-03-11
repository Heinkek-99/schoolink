import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, Banknote,
  BookOpen, Settings, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLogout } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Logo } from '@/components/shared/Logo';

const allNavItems = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/familles', label: 'Familles', icon: Users },
  { to: '/eleves', label: 'Élèves', icon: GraduationCap },
  { to: '/finances', label: 'Finances', icon: Banknote },
  { to: '/academique', label: 'Académique', icon: BookOpen },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const location = useLocation();
  const logout = useLogout();
  const { allowedNavItems } = usePermissions();

  const navItems = allNavItems.filter((item) => {
    return allowedNavItems.includes(item.to);
  });

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-sidebar z-30 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        {sidebarOpen ? (
          <Logo size="sm" variant="full" />
        ) : (
          <Logo size="sm" variant="icon" />
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              } ${!sidebarOpen ? 'justify-center' : ''}`}
            >
              <Icon size={20} strokeWidth={1.5} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors text-sm"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          {sidebarOpen && <span>Réduire</span>}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors text-sm"
        >
          <LogOut size={20} strokeWidth={1.5} />
          {sidebarOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}
