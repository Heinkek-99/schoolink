import api from './axios.config';
import type { Famille, FamilleDetail, CreateFamilleRequest, UpdateFamilleRequest } from '@/types/famille.types';

export const famillesApi = {
  getAll: async (): Promise<Famille[]> => {
    const response = await api.get('/api/Familles');
    return response.data;
  },
  getById: async (id: string): Promise<FamilleDetail> => {
    const response = await api.get(`/api/Familles/${id}`);
    return response.data;
  },
  create: async (data: CreateFamilleRequest): Promise<Famille> => {
    const response = await api.post('/api/Familles', data);
    return response.data;
  },
  update: async (data: UpdateFamilleRequest): Promise<FamilleDetail> => {
    const response = await api.put(`/api/Familles/${data.id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/Familles/${id}`);
  },
  getArchived: async (): Promise<Famille[]> => {
    const response = await api.get('/api/Familles/archives');
    return response.data;
  },
  restore: async (id: string): Promise<void> => {
    await api.put(`/api/Familles/${id}/restore`);
  },
};
