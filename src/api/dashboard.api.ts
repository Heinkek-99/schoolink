import api from './axios.config';
import type { DashboardStats, FamilleImpayee } from '@/types/dashboard.types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/Dashboard/stats');
    return response.data;
  },
  getTopImpayes: async (): Promise<FamilleImpayee[]> => {
    const response = await api.get('/api/Dashboard/top-impayes');
    return response.data;
  },
};
