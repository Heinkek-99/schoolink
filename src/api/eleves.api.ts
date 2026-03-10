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
    if (data.photo) {
      const formData = new FormData();
      formData.append('Nom', data.nom);
      formData.append('Prenom', data.prenom);
      formData.append('DateNaissance', data.dateNaissance);
      formData.append('LieuNaissance', data.lieuNaissance);
      formData.append('Sexe', String(data.sexe));
      formData.append('ClasseId', data.classeId);
      formData.append('FamilleId', data.familleId);
      if (data.nationalite) formData.append('Nationalite', data.nationalite);
      if (data.groupeSanguin) formData.append('GroupeSanguin', data.groupeSanguin);
      if (data.allergies) formData.append('Allergies', data.allergies);
      if (data.contactUrgence) formData.append('ContactUrgence', data.contactUrgence);
      if (data.remarques) formData.append('Remarques', data.remarques);
      formData.append('Photo', data.photo);
      const response = await api.post('/api/Eleves', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const { photo, ...jsonData } = data;
    const response = await api.post('/api/Eleves', jsonData);
    return response.data;
  },
  update: async (id: string, data: UpdateEleveRequest): Promise<EleveDossier> => {
    if (data.photo) {
      const formData = new FormData();
      formData.append('nom', data.nom);
      formData.append('prenom', data.prenom);
      formData.append('dateNaissance', data.dateNaissance);
      formData.append('lieuNaissance', data.lieuNaissance);
      formData.append('sexe', String(data.sexe));
      if (data.classeId) formData.append('classeId', data.classeId);
      if (data.nationalite) formData.append('nationalite', data.nationalite);
      if (data.groupeSanguin) formData.append('groupeSanguin', data.groupeSanguin);
      if (data.allergies) formData.append('allergies', data.allergies);
      if (data.contactUrgence) formData.append('contactUrgence', data.contactUrgence);
      if (data.remarques) formData.append('remarques', data.remarques);
      formData.append('photo', data.photo);
      const response = await api.put(`/api/Eleves/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const { photo, ...jsonData } = data;
    const response = await api.put(`/api/Eleves/${id}`, jsonData);
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
    // No dedicated endpoint — fetch all and filter archived
    const response = await api.get('/api/Eleves');
    const all: Eleve[] = response.data;
    return all.filter((e) => e.statut === 'Archivé');
  },
  archive: async (id: string): Promise<void> => {
    await api.put(`/api/Eleves/${id}/archive`);
  },
  restore: async (id: string): Promise<void> => {
    await api.put(`/api/Eleves/${id}/restore`);
  },
};
