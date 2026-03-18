import { useNavigate } from 'react-router-dom';
import { Download, Eye, CreditCard, Calendar, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { getModePaiementLabel } from '@/types/paiement.types';

interface PaiementHistoriqueProps {
  paiements: any[];
  isLoading: boolean;
  familleNom: string;
}

export function PaiementHistorique({ paiements, isLoading, familleNom }: PaiementHistoriqueProps) {
  const navigate = useNavigate();

  const getModeIcon = (mode: number | string) => {
    const modeStr = typeof mode === 'string' ? mode.toLowerCase() : '';
    const modeNum = typeof mode === 'number' ? mode : 0;
    
    if (modeStr === 'especes' || modeNum === 1) return '💵';
    if (modeStr === 'cheque' || modeNum === 2) return '📝';
    if (modeStr === 'virement' || modeNum === 3) return '🏦';
    if (modeStr === 'mobilemoney' || modeNum === 4) return '📱';
    if (modeStr === 'cartecredit' || modeNum === 5) return '💳';
    return '💰';
  };

  const totalPaye = paiements?.reduce((sum, p) => sum + (p.montantTotal || p.montant || 0), 0) || 0;
  const dernierPaiement = paiements?.[0];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total payé */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Total payé</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                {formatCurrency(totalPaye)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">FCFA</p>
            </div>
            <div className="bg-green-200 dark:bg-green-800 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-green-700 dark:text-green-300" />
            </div>
          </div>
        </div>

        {/* Nombre de paiements */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Paiements effectués</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {paiements?.length || 0}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                {(paiements?.length || 0) > 1 ? 'transactions' : 'transaction'}
              </p>
            </div>
            <div className="bg-blue-200 dark:bg-blue-800 rounded-full p-3">
              <Wallet className="w-6 h-6 text-blue-700 dark:text-blue-300" />
            </div>
          </div>
        </div>

        {/* Dernier paiement */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Dernier paiement</p>
              {dernierPaiement ? (
                <>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1 truncate">
                    {formatCurrency(dernierPaiement.montantTotal || dernierPaiement.montant)}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5 truncate">
                    {formatDate(dernierPaiement.datePaiement || dernierPaiement.date)}
                  </p>
                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-200 dark:bg-purple-800 rounded-full">
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                      {getModePaiementLabel(dernierPaiement.modePaiement || dernierPaiement.mode)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">Aucun paiement</p>
              )}
            </div>
            <div className="bg-purple-200 dark:bg-purple-800 rounded-full p-3 flex-shrink-0 ml-2">
              <Calendar className="w-6 h-6 text-purple-700 dark:text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau historique */}
      <div className="bg-card rounded-xl border shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Historique des paiements - {familleNom}
          </h3>
        </div>

        {!paiements?.length ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted" />
            <p>Aucun paiement enregistré pour cette famille</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    N° Reçu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {paiements.map((paiement) => (
                  <tr key={paiement.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-primary">
                        {paiement.numeroPaiement || `PAY-${paiement.id.slice(0, 8)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">
                        {formatDate(paiement.datePaiement || paiement.date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(paiement.montantTotal || paiement.montant)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <span>{getModeIcon(paiement.modePaiement || paiement.mode)}</span>
                        <span>{getModePaiementLabel(paiement.modePaiement || paiement.mode)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {paiement.reference || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/finances/paiement/${paiement.numeroPaiement || paiement.id}`)}
                          className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded hover:bg-primary/10"
                          title="Voir le détail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}