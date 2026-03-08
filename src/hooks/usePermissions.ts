import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types/auth.types';

// Role-based permissions matrix
const ROLE_ACCESS: Record<UserRole, {
  canCreate: string[];
  canEdit: string[];
  canDelete: string[];
  canView: string[];
  navItems: string[];
}> = {
  Admin: {
    canCreate: ['eleves', 'familles', 'paiements', 'typefrais', 'utilisateurs'],
    canEdit: ['eleves', 'familles', 'paiements', 'typefrais', 'utilisateurs', 'etablissement'],
    canDelete: ['eleves', 'familles', 'paiements', 'typefrais', 'utilisateurs'],
    canView: ['dashboard', 'familles', 'eleves', 'finances', 'academique', 'parametres', 'notifications'],
    navItems: ['/', '/familles', '/eleves', '/finances', '/academique', '/parametres'],
  },
  Directeur: {
    canCreate: [],
    canEdit: ['etablissement'],
    canDelete: [],
    canView: ['dashboard', 'familles', 'eleves', 'finances', 'academique', 'parametres', 'notifications'],
    navItems: ['/', '/familles', '/eleves', '/finances', '/academique', '/parametres'],
  },
  Secretaire: {
    canCreate: ['eleves', 'familles'],
    canEdit: ['eleves', 'familles'],
    canDelete: [],
    canView: ['dashboard', 'familles', 'eleves', 'academique'],
    navItems: ['/', '/familles', '/eleves', '/academique'],
  },
  Comptable: {
    canCreate: ['paiements'],
    canEdit: ['paiements'],
    canDelete: [],
    canView: ['dashboard', 'familles', 'eleves', 'finances'],
    navItems: ['/', '/familles', '/eleves', '/finances'],
  },
};

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role || 'Secretaire';
  const access = ROLE_ACCESS[role] || ROLE_ACCESS.Secretaire;

  return {
    role,
    canCreate: (resource: string) => access.canCreate.includes(resource),
    canEdit: (resource: string) => access.canEdit.includes(resource),
    canDelete: (resource: string) => access.canDelete.includes(resource),
    canView: (resource: string) => access.canView.includes(resource),
    allowedNavItems: access.navItems,
    isAdmin: role === 'Admin',
    isDirecteur: role === 'Directeur',
  };
}
