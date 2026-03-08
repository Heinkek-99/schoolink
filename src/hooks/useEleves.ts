import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { elevesApi } from '@/api/eleves.api';
import type { CreateEleveRequest } from '@/types/eleve.types';
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

export function useCreateEleve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEleveRequest) => elevesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['eleves'] });
      toast.success('Élève inscrit avec succès');
    },
    onError: () => toast.error("Erreur lors de l'inscription"),
  });
}
