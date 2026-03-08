import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { famillesApi } from '@/api/familles.api';
import type { CreateFamilleRequest, UpdateFamilleRequest } from '@/types/famille.types';
import toast from 'react-hot-toast';

export function useFamilles() {
  return useQuery({
    queryKey: ['familles'],
    queryFn: famillesApi.getAll,
  });
}

export function useFamille(id: string) {
  return useQuery({
    queryKey: ['familles', id],
    queryFn: () => famillesApi.getById(id),
    enabled: !!id,
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
    onError: () => toast.error('Erreur lors de la création'),
  });
}

export function useUpdateFamille() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFamilleRequest) => famillesApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['familles'] });
      toast.success('Famille mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
}
