import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { elevesApi } from '@/api/eleves.api';
import type { CreateEleveRequest, UpdateEleveRequest } from '@/types/eleve.types';
import toast from 'react-hot-toast';

export function useEleves() {
  return useQuery({
    queryKey: ['eleves'],
    queryFn: elevesApi.getAll,
  });
}

export function useEleve(id: string) {
  return useQuery({
    queryKey: ['eleves', id],
    queryFn: () => elevesApi.getById(id),
    enabled: !!id,
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: elevesApi.getClasses,
  });
}

export function useArchivedEleves() {
  return useQuery({
    queryKey: ['eleves', 'archived'],
    queryFn: elevesApi.getArchived,
  });
}

export function useCreateEleve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEleveRequest) => elevesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eleves'] });
      qc.invalidateQueries({ queryKey: ['familles'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Élève inscrit avec succès');
    },
    onError: (err: any) => toast.error(err?.message || "Erreur lors de l'inscription"),
  });
}

export function useUpdateEleve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEleveRequest }) => elevesApi.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['eleves'] });
      qc.invalidateQueries({ queryKey: ['eleves', variables.id] });
      toast.success('Élève mis à jour');
    },
    onError: (err: any) => toast.error(err?.message || 'Erreur lors de la mise à jour'),
  });
}

export function useArchiveEleve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => elevesApi.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eleves'] });
      qc.invalidateQueries({ queryKey: ['familles'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Élève archivé');
    },
    onError: (err: any) => toast.error(err?.message || "Erreur lors de l'archivage"),
  });
}

export function useRestoreEleve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => elevesApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eleves'] });
      qc.invalidateQueries({ queryKey: ['eleves', 'archived'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Élève restauré');
    },
    onError: (err: any) => toast.error(err?.message || 'Erreur lors de la restauration'),
  });
}
