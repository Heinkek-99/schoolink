import api from './axios.config';
import type { DashboardStats, FamilleImpayee } from '@/types/dashboard.types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/Dashboard/stats');
    return response.data;
  },
  getFamillesImpayes: async (): Promise<FamilleImpayee[]> => {
    const response = await api.get('/api/Dashboard/familles-impayes');
    return response.data;
  },
};
