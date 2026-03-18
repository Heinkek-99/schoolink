import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard, User, FileText, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { getModePaiementLabel } from '@/types/paiement.types';
import { paiementsApi } from '@/api/paiements.api';

interface PaiementDetail {
  id: string;
  numeroPaiement: string;
  datePaiement: string;
  montantTotal: number;
  modePaiement: string | number;
  famille: string;
  reference?: string;
  ventilations: Array<{
    eleve: string;
    typeFrais: string;
    montant: number;
  }>;
}


export default function PaiementDetail() {
  const { numero } = useParams<{ numero: string }>();
  const navigate = useNavigate();
  
  const { data: paiement, isLoading, error } = useQuery({
    queryKey: ['paiement', numero],
    queryFn: () => paiementsApi.getByNumero(numero!),
    enabled: !!numero,
  });

  const getModeIcon = (mode: number | string) => {
    const modeStr = typeof mode === 'string' ? mode.toLowerCase() : '';
    const modeNum = typeof mode === 'number' ? mode : 0;
    
    if (modeStr.includes('espe') || modeNum === 1) return '💵';
    if (modeStr.includes('cheq') || modeNum === 2) return '📝';
    if (modeStr.includes('vire') || modeNum === 3) return '🏦';
    if (modeStr.includes('mobile') || modeNum === 4) return '📱';
    if (modeStr.includes('carte') || modeNum === 5) return '💳';
    return '💰';
  };

  const getModeLabel = (mode: number | string) => {
    if (typeof mode === 'string') return mode;
    return getModePaiementLabel(mode);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !paiement) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">
          {error ? 'Erreur lors du chargement du paiement' : 'Paiement non trouvé'}
        </p>
        <button 
          onClick={() => navigate(-1)} 
          className="text-primary hover:underline flex items-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={18} /> Retour
      </button>

      {/* En-tête */}
      <div className="bg-card rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Reçu de paiement
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {paiement.numeroPaiement}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="text-lg font-semibold">{formatDate(paiement.datePaiement)}</p>
          </div>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl border shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-3">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Famille</p>
              <p className="font-semibold">{paiement.famille}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
              <CreditCard className="w-5 h-5 text-green-700 dark:text-green-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Montant total</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {formatCurrency(paiement.montantTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3 text-2xl">
              {getModeIcon(paiement.modePaiement)}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mode de paiement</p>
              <p className="font-semibold">{getModeLabel(paiement.modePaiement)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
              <Calendar className="w-5 h-5 text-purple-700 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date de paiement</p>
              <p className="font-semibold">{formatDate(paiement.datePaiement)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(paiement.datePaiement).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Référence si présente */}
      {paiement.reference && (
        <div className="bg-muted/30 border border-border rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground">Référence</p>
          <p className="font-mono font-semibold">{paiement.reference}</p>
        </div>
      )}

      {/* Ventilation par élève */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ventilation détaillée
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Répartition du paiement par élève et type de frais
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Élève
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type de frais
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {paiement.ventilations?.map((v, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-foreground">{v.eleve}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {v.typeFrais}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(v.montant)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/30 border-t-2 border-border">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-foreground">
                  Total
                </td>
                <td className="px-6 py-4 text-right text-lg font-bold text-primary">
                  {formatCurrency(paiement.montantTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          <Download size={16} /> Imprimer
        </button>
      </div>
    </div>
  );
}