import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { famillesApi } from '@/api/familles.api';
import type { CreateFamilleRequest, UpdateFamilleRequest } from '@/types/famille.types';
import toast from 'react-hot-toast';

export function useFamilles(searchQuery?: string) {
  return useQuery({
    queryKey: ['familles', searchQuery || ''],
    queryFn: () => searchQuery ? famillesApi.search(searchQuery) : famillesApi.getAll(),
  });
}

export function useFamille(id: string) {
  return useQuery({
    queryKey: ['familles', id],
    queryFn: () => famillesApi.getById(id),
    enabled: !!id,
  });
}

export function useArchivedFamilles() {
  return useQuery({
    queryKey: ['familles', 'archived'],
    queryFn: famillesApi.getArchived,
  });
}

export function useCreateFamille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFamilleRequest) => famillesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['familles'] });
      toast.success('Famille créée avec succès');
    },
    onError: (err: any) => toast.error(err?.message || 'Erreur lors de la création'),
  });
}

export function useUpdateFamille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFamilleRequest) => famillesApi.update(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['familles'] });
      qc.invalidateQueries({ queryKey: ['familles', variables.id] });
      toast.success('Famille mise à jour');
    },
    onError: (err: any) => toast.error(err?.message || 'Erreur lors de la mise à jour'),
  });
}

export function useDeleteFamille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => famillesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['familles'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Famille supprimée');
    },
    onError: (err: any) => toast.error(err?.message || 'Erreur lors de la suppression'),
  });
}

export function useRestoreFamille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => famillesApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['familles'] });
      qc.invalidateQueries({ queryKey: ['familles', 'archived'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Famille restaurée');
    },
    onError: (err: any) => toast.error(err?.message || 'Erreur lors de la restauration'),
  });
}
