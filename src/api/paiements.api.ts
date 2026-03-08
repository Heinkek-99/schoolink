import api from './axios.config';
import type { Paiement, CreatePaiementRequest, TypeFrais, CreateTypeFraisRequest } from '@/types/paiement.types';

export const paiementsApi = {
  create: async (data: CreatePaiementRequest): Promise<Paiement> => {
    const response = await api.post('/api/Paiements', data);
    return response.data;
  },
  getByFamille: async (familleId: string): Promise<Paiement[]> => {
    const response = await api.get(`/api/Paiements/famille/${familleId}`);
    return response.data;
  },
  getTypeFrais: async (): Promise<TypeFrais[]> => {
    const response = await api.get('/api/TypeFrais');
    return response.data;
  },
  createTypeFrais: async (data: CreateTypeFraisRequest): Promise<TypeFrais> => {
    const response = await api.post('/api/TypeFrais', data);
    return response.data;
  },
};
