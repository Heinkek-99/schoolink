import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, Banknote,
  BookOpen, Settings, ChevronLeft, ChevronRight, LogOut, Archive,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLogout } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import schoolflowLogo from '@/assets/schoolflow-logo.png';

const allNavItems = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/familles', label: 'Familles', icon: Users },
  { to: '/eleves', label: 'Élèves', icon: GraduationCap },
  { to: '/finances', label: 'Finances', icon: Banknote },
  { to: '/academique', label: 'Académique', icon: BookOpen },
  { to: '/archives', label: 'Archives', icon: Archive },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const location = useLocation();
  const logout = useLogout();
  const { allowedNavItems, isAdmin } = usePermissions();

  const navItems = allNavItems.filter((item) => {
    if (item.to === '/archives') return isAdmin;
    return allowedNavItems.includes(item.to);
  });

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-navy z-30 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <img src={schoolflowLogo} alt="SchoolFlow" className="h-8 w-8 object-contain rounded" />
            <span className="text-sidebar-foreground font-bold text-lg">SchoolFlow</span>
          </div>
        ) : (
          <img src={schoolflowLogo} alt="SchoolFlow" className="h-8 w-8 object-contain rounded mx-auto" />
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={20} strokeWidth={1.5} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={logout}
          className="sidebar-link sidebar-link-inactive w-full"
          title={!sidebarOpen ? 'Déconnexion' : undefined}
        >
          <LogOut size={20} strokeWidth={1.5} />
          {sidebarOpen && <span>Déconnexion</span>}
        </button>
        <button
          onClick={toggleSidebar}
          className="sidebar-link sidebar-link-inactive w-full justify-center"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  );
}
