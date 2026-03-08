export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
}

export type UserRole = 'Admin' | 'Directeur' | 'Secretaire' | 'Comptable';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  Admin: ['all'],
  Directeur: ['read:all', 'export'],
  Secretaire: ['crud:eleves', 'crud:familles', 'read:finances'],
  Comptable: ['crud:paiements', 'read:eleves', 'read:familles'],
};
