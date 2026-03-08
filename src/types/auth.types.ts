export interface LoginRequest {
  username: string;
  password: string;
}

// API returns flat: { userId, username, nom, prenom, role, token } after camelCase conversion
export interface LoginResponse {
  userId: string;
  username: string;
  nom: string;
  prenom: string;
  role: UserRole;
  token: string;
}

export interface User {
  id: string;
  username: string;
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
