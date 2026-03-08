import api from './axios.config';
import type { Famille, CreateFamilleRequest, UpdateFamilleRequest } from '@/types/famille.types';

export const famillesApi = {
  getAll: async (): Promise<Famille[]> => {
    const response = await api.get('/api/Familles');
    return response.data;
  },
  getById: async (id: string): Promise<Famille> => {
    const response = await api.get(`/api/Familles/${id}`);
    return response.data;
  },
  create: async (data: CreateFamilleRequest): Promise<Famille> => {
    const response = await api.post('/api/Familles', data);
    return response.data;
  },
  update: async (data: UpdateFamilleRequest): Promise<Famille> => {
    const response = await api.put(`/api/Familles/${data.id}`, data);
    return response.data;
  },
};
