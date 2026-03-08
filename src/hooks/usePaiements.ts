import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paiementsApi } from '@/api/paiements.api';
import type { CreatePaiementRequest, CreateTypeFraisRequest } from '@/types/paiement.types';
import toast from 'react-hot-toast';

export function usePaiementsByFamille(familleId: string) {
  return useQuery({
    queryKey: ['paiements', familleId],
    queryFn: () => paiementsApi.getByFamille(familleId),
    enabled: !!familleId,
  });
}

export function useCreatePaiement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaiementRequest) => paiementsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paiements'] });
      qc.invalidateQueries({ queryKey: ['familles'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Paiement enregistré avec succès');
    },
    onError: () => toast.error("Erreur lors de l'enregistrement du paiement"),
  });
}

export function useTypeFrais() {
  return useQuery({
    queryKey: ['typeFrais'],
    queryFn: paiementsApi.getTypeFrais,
  });
}

export function useCreateTypeFrais() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTypeFraisRequest) => paiementsApi.createTypeFrais(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['typeFrais'] });
      toast.success('Type de frais créé avec succès');
    },
    onError: () => toast.error('Erreur lors de la création du type de frais'),
  });
}
