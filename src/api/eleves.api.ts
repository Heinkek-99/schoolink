import api from './axios.config';
import type { Eleve, EleveDossier, CreateEleveRequest, UpdateEleveRequest, Classe } from '@/types/eleve.types';

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
  update: async (id: string, data: UpdateEleveRequest): Promise<EleveDossier> => {
    const response = await api.put(`/api/Eleves/${id}`, data);
    return response.data;
  },
  getClasses: async (): Promise<Classe[]> => {
    const response = await api.get('/api/Classes');
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/Eleves/${id}`);
  },
  getArchived: async (): Promise<Eleve[]> => {
    try {
      const response = await api.get('/api/Eleves', { params: { statut: 'Archivé' } });
      return response.data;
    } catch {
      return [];
    }
  },
  restore: async (id: string): Promise<void> => {
    await api.put(`/api/Eleves/${id}/restore`);
  },
};
