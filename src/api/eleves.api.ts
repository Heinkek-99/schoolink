import api from './axios.config';
import type { Eleve, EleveDossier, CreateEleveRequest, Classe } from '@/types/eleve.types';

export const elevesApi = {
  getAll: async (): Promise<Eleve[]> => {
    const response = await api.get('/api/Eleves');
    return response.data;
  },
  getById: async (id: string): Promise<EleveDossier> => {
    const response = await api.get(`/api/Eleves/${id}`);
    return response.data;
  },
  create: async (data: CreateEleveRequest): Promise<Eleve> => {
    const response = await api.post('/api/Eleves', data);
    return response.data;
  },
  getClasses: async (): Promise<Classe[]> => {
    const response = await api.get('/api/Classes');
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/Eleves/${id}`);
  },
};
