import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, Banknote, Users as UsersIcon, ListChecks, FileCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useNotificationStore } from '@/store/notificationStore';
import { useFamilles } from '@/hooks/useFamilles';
import { useFamille } from '@/hooks/useFamilles';
import { useCreatePaiement } from '@/hooks/usePaiements';
import { formatCurrency } from '@/utils/formatCurrency';
import { PAYMENT_MODES } from '@/utils/constants';
import { generateReceiptPDF } from '@/utils/generatePDF';
import { MODE_PAIEMENT_MAP } from '@/types/paiement.types';
import type { Famille } from '@/types/famille.types';

const paiementSchema = z.object({
  date: z.string().min(1, 'Date requise'),
  montant: z.number().min(1, 'Montant requis'),
  mode: z.string().min(1, 'Mode requis'),
  reference: z.string().optional(),
});

type PaiementForm = z.infer<typeof paiementSchema>;

export default function PaiementCreate() {
  const navigate = useNavigate();
  const { data: familles } = useFamilles();
  const createMutation = useCreatePaiement();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [step, setStep] = useState(1);
  const [selectedFamilleId, setSelectedFamilleId] = useState<string | null>(null);
  const [familleSearch, setFamilleSearch] = useState('');
  const [ventilations, setVentilations] = useState<Record<string, number>>({});
  const [formValues, setFormValues] = useState<PaiementForm>({ date: new Date().toISOString().split('T')[0], montant: 0, mode: '', reference: '' });

  // Fetch full famille detail when selected
  const { data: familleDetail } = useFamille(selectedFamilleId || '');

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<PaiementForm>({
    resolver: zodResolver(paiementSchema),
    defaultValues: formValues,
  });

  const filteredFamilles = familles?.filter((f) =>
    !familleSearch || `${f.nomPere} ${f.prenomPere}`.toLowerCase().includes(familleSearch.toLowerCase())
  );

  const totalVentile = Object.values(ventilations).reduce((a, b) => a + (b || 0), 0);

  const steps = [
    { num: 1, label: 'Famille', icon: UsersIcon },
    { num: 2, label: 'Détails', icon: Banknote },
    { num: 3, label: 'Ventilation', icon: ListChecks },
    { num: 4, label: 'Confirmation', icon: FileCheck },
  ];

  const onSelectFamille = (f: Famille) => {
    setSelectedFamilleId(f.id);
    setStep(2);
  };

  const onStep2Submit = (data: PaiementForm) => {
    setFormValues(data);
    setStep(3);
    // Initialize ventilations from detail
    if (familleDetail?.enfants) {
      const init: Record<string, number> = {};
      familleDetail.enfants.forEach((e) => { init[e.id] = 0; });
      setVentilations(init);
    }
  };

  const autoDistribute = () => {
    if (!familleDetail?.enfants) return;
    const montant = formValues.montant;
    const totalDue = familleDetail.enfants.reduce((a, e) => a + e.solde, 0);
    const newV: Record<string, number> = {};
    let remaining = montant;

    familleDetail.enfants.forEach((e) => {
      if (totalDue > 0) {
        const share = Math.min(Math.round((e.solde / totalDue) * montant), remaining, e.solde);
        newV[e.id] = share;
        remaining -= share;
      } else {
        newV[e.id] = 0;
      }
    });
    setVentilations(newV);
  };

  const handleConfirm = () => {
    const ventilationsList = Object.entries(ventilations)
      .filter(([, v]) => v > 0)
      .map(([eleveId, montant]) => ({ eleveId, montant }));

    const isoDate = new Date(formValues.date + 'T00:00:00').toISOString();

    const payload = {
      familleId: selectedFamilleId!,
      datePaiement: isoDate,
      montantTotal: formValues.montant,
      modePaiement: MODE_PAIEMENT_MAP[formValues.mode] ?? 0,
      reference: formValues.reference,
      ventilations: ventilationsList,
    };
    console.log('[PaiementCreate] payload:', JSON.stringify(payload, null, 2));

    createMutation.mutate(
      payload,
      {
        onSuccess: () => {
          addNotification({
            type: 'paiement',
            title: 'Paiement enregistré',
            message: `${formatCurrency(formValues.montant)} reçu de ${familleDetail?.nomPere} ${familleDetail?.prenomPere}`,
          });
          generateReceiptPDF({
            familleNom: `${familleDetail?.nomPere} ${familleDetail?.prenomPere}`,
            date: formValues.date,
            montant: formValues.montant,
            mode: formValues.mode,
            reference: formValues.reference,
            ventilations: ventilationsList.map((v) => ({
              eleveNom: familleDetail?.enfants?.find((e) => e.id === v.eleveId)?.prenom || '',
              montant: v.montant,
            })),
          });
          navigate('/finances');
        },
      }
    );
  };

  const selectedFamilleFromList = familles?.find(f => f.id === selectedFamilleId);

  return (
    <div>
      <button onClick={() => navigate('/finances')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={18} /> Retour
      </button>

      <PageHeader title="Nouveau paiement" subtitle="Enregistrer un paiement famille" />

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <s.icon size={16} />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-card rounded-xl border shadow-sm p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Sélectionner une famille</h2>
          <input
            value={familleSearch}
            onChange={(e) => setFamilleSearch(e.target.value)}
            placeholder="Rechercher une famille..."
            className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 mb-4"
          />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredFamilles?.map((f) => (
              <button
                key={f.id}
                onClick={() => onSelectFamille(f)}
                className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                  selectedFamilleId === f.id ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{f.nomPere} {f.prenomPere}</p>
                    <p className="text-xs text-muted-foreground">{f.nombreEnfants} enfant(s) · Solde: {formatCurrency(f.soldeGlobal)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onStep2Submit)} className="bg-card rounded-xl border shadow-sm p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Détails du paiement</h2>
          <p className="text-sm text-muted-foreground mb-4">Famille: <strong>{selectedFamilleFromList?.nomPere} {selectedFamilleFromList?.prenomPere}</strong></p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date *</label>
              <input {...register('date')} type="date" className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Montant total (FCFA) *</label>
              <input {...register('montant', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              {errors.montant && <p className="text-xs text-destructive mt-1">{errors.montant.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mode de paiement *</label>
              <select {...register('mode')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Sélectionner</option>
                {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.mode && <p className="text-xs text-destructive mt-1">{errors.mode.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Référence</label>
              <input {...register('reference')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button type="button" onClick={() => setStep(1)} className="px-6 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Précédent</button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Suivant <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-card rounded-xl border shadow-sm p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ventilation du paiement</h2>
            <button onClick={autoDistribute} className="text-sm text-primary hover:underline">Auto-distribuer</button>
          </div>

          <div className="space-y-3">
            {familleDetail?.enfants?.map((e) => (
              <div key={e.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{e.prenom} {e.nom}</p>
                    <p className="text-xs text-muted-foreground">Solde: {formatCurrency(e.solde)}</p>
                  </div>
                  <input
                    type="number"
                    value={ventilations[e.id] || 0}
                    onChange={(ev) => setVentilations({ ...ventilations, [e.id]: Number(ev.target.value) || 0 })}
                    className="w-32 px-3 py-1.5 border rounded-lg text-sm text-right outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${Math.min(100, e.solde > 0 ? ((ventilations[e.id] || 0) / e.solde) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium">Reste à ventiler:</span>
            <span className={`font-bold ${formValues.montant - totalVentile === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {formatCurrency(formValues.montant - totalVentile)}
            </span>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(2)} className="px-6 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Précédent</button>
            <button
              onClick={() => setStep(4)}
              disabled={formValues.montant !== totalVentile}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Suivant <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="bg-card rounded-xl border shadow-sm p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <p><span className="text-muted-foreground">Famille:</span> <strong>{familleDetail?.nomPere} {familleDetail?.prenomPere}</strong></p>
            <p><span className="text-muted-foreground">Date:</span> <strong>{formValues.date}</strong></p>
            <p><span className="text-muted-foreground">Montant:</span> <strong>{formatCurrency(formValues.montant)}</strong></p>
            <p><span className="text-muted-foreground">Mode:</span> <strong>{formValues.mode}</strong></p>
            {formValues.reference && <p><span className="text-muted-foreground">Référence:</span> <strong>{formValues.reference}</strong></p>}
            <hr className="my-3" />
            <p className="font-medium">Ventilation:</p>
            {familleDetail?.enfants?.filter((e) => ventilations[e.id] > 0).map((e) => (
              <p key={e.id} className="pl-3">{e.prenom} {e.nom}: <strong>{formatCurrency(ventilations[e.id])}</strong></p>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(3)} className="px-6 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Précédent</button>
            <button
              onClick={handleConfirm}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 disabled:opacity-50 transition-colors"
            >
              <Check size={16} /> {createMutation.isPending ? 'Enregistrement...' : 'Confirmer le paiement'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
