import api from './axios.config';
import type { Eleve, EleveDossier, CreateEleveRequest, UpdateEleveRequest, Classe } from '@/types/eleve.types';

/** Champs communs create + update */
interface BaseEleveFormData {
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string | number;
  classeId?: string;
  nationalite?: string;
  groupeSanguin?: string;
  allergies?: string;
  contactUrgence?: string;
  remarques?: string;
  photo?: File | null;
}

/** Construit un FormData PascalCase pour les endpoints élèves (controller [FromForm]) */
function buildEleveFormData(
  data: BaseEleveFormData & { id?: string; familleId?: string }
): FormData {
  const fd = new FormData();
  // Id requis pour le Update (validator: 'Id must not be empty')
  if (data.id) fd.append('Id', data.id);
  fd.append('Nom', data.nom);
  fd.append('Prenom', data.prenom);
  fd.append('DateNaissance', data.dateNaissance);
  fd.append('LieuNaissance', data.lieuNaissance);
  fd.append('Sexe', String(data.sexe));
  if (data.classeId) fd.append('ClasseId', data.classeId);
  if (data.familleId) fd.append('FamilleId', data.familleId);
  if (data.nationalite) fd.append('Nationalite', data.nationalite);
  if (data.groupeSanguin) fd.append('GroupeSanguin', data.groupeSanguin);
  if (data.allergies) fd.append('Allergies', data.allergies);
  if (data.contactUrgence) fd.append('ContactUrgence', data.contactUrgence);
  if (data.remarques) fd.append('Remarques', data.remarques);
  if (data.photo) fd.append('photo', data.photo);
  return fd;
}

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
    // Toujours FormData — le controller est [Consumes("multipart/form-data")]
    const formData = buildEleveFormData(data);
    const response = await api.post('/api/Eleves', formData);
    return response.data;
  },

  update: async (id: string, data: UpdateEleveRequest): Promise<EleveDossier> => {
    // Toujours FormData — le controller est [Consumes("multipart/form-data")]
    // Id inclus dans le FormData pour satisfaire le validator UpdateEleveCommandValidator
    const formData = buildEleveFormData({ ...data, id });
    const response = await api.put(`/api/Eleves/${id}`, formData);
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