import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, User, Users, ClipboardCheck, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCreateEleve, useClasses } from '@/hooks/useEleves';
import { useFamilles, useCreateFamille } from '@/hooks/useFamilles';
import { generateMatricule, ANNEE_SCOLAIRE } from '@/utils/constants';
import { TableSkeleton } from '@/components/shared/Skeletons';

const step1Schema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100),
  prenom: z.string().min(1, 'Prénom requis').max(100),
  dateNaissance: z.string().min(1, 'Date de naissance requise'),
  lieuNaissance: z.string().min(1, 'Lieu de naissance requis').max(100),
  sexe: z.enum(['M', 'F'], { required_error: 'Sexe requis' }),
});

const step2Schema = z.object({
  familleId: z.string().min(1, 'Famille requise'),
  classeId: z.string().min(1, 'Classe requise'),
});

const newFamilleSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100),
  prenom: z.string().min(1, 'Prénom requis').max(100),
  telephone: z.string().min(1, 'Téléphone requis').max(20),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  adresse: z.string().optional(),
  ville: z.string().optional(),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type NewFamilleForm = z.infer<typeof newFamilleSchema>;

export default function EleveCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1 | null>(null);
  const [showNewFamille, setShowNewFamille] = useState(false);
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: familles, isLoading: famillesLoading } = useFamilles();
  const createMutation = useCreateEleve();
  const createFamilleMutation = useCreateFamille();

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: step1Data || undefined });
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema) });
  const formFamille = useForm<NewFamilleForm>({ resolver: zodResolver(newFamilleSchema) });

  const steps = [
    { num: 1, label: 'Informations', icon: User },
    { num: 2, label: 'Rattachement', icon: Users },
    { num: 3, label: 'Récapitulatif', icon: ClipboardCheck },
  ];

  const onStep1Submit = (data: Step1) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2Submit = () => {
    setStep(3);
  };

  const handleCreateFamille = (data: NewFamilleForm) => {
    createFamilleMutation.mutate(
      { nom: data.nom, prenom: data.prenom, telephone: data.telephone, email: data.email, adresse: data.adresse, ville: data.ville },
      {
        onSuccess: (newFamille) => {
          form2.setValue('familleId', newFamille.id);
          setShowNewFamille(false);
          formFamille.reset();
        },
      }
    );
  };

  const handleConfirm = () => {
    if (!step1Data) return;
    const step2Values = form2.getValues();
    createMutation.mutate(
      {
        nom: step1Data.nom,
        prenom: step1Data.prenom,
        dateNaissance: step1Data.dateNaissance,
        lieuNaissance: step1Data.lieuNaissance,
        sexe: step1Data.sexe,
        classeId: step2Values.classeId,
        familleId: step2Values.familleId,
      },
      { onSuccess: () => navigate('/eleves') }
    );
  };

  const matriculePreview = generateMatricule(2024, Math.floor(Math.random() * 999) + 1);
  const selectedFamille = familles?.find((f) => f.id === form2.watch('familleId'));
  const selectedClasse = classes?.find((c) => c.id === form2.watch('classeId'));

  return (
    <div>
      <button onClick={() => navigate('/eleves')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={18} /> Retour
      </button>

      <PageHeader title="Nouvelle inscription" subtitle="Inscrire un nouvel élève" />

      {/* Steps indicator */}
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
        <form onSubmit={form1.handleSubmit(onStep1Submit)} className="bg-card rounded-xl border shadow-sm p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nom *</label>
              <input {...form1.register('nom')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              {form1.formState.errors.nom && <p className="text-xs text-destructive mt-1">{form1.formState.errors.nom.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Prénom *</label>
              <input {...form1.register('prenom')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              {form1.formState.errors.prenom && <p className="text-xs text-destructive mt-1">{form1.formState.errors.prenom.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date de naissance *</label>
              <input {...form1.register('dateNaissance')} type="date" className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              {form1.formState.errors.dateNaissance && <p className="text-xs text-destructive mt-1">{form1.formState.errors.dateNaissance.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Lieu de naissance *</label>
              <input {...form1.register('lieuNaissance')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              {form1.formState.errors.lieuNaissance && <p className="text-xs text-destructive mt-1">{form1.formState.errors.lieuNaissance.message}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Sexe *</label>
            <div className="flex gap-4">
              {['M', 'F'].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input {...form1.register('sexe')} type="radio" value={s} className="accent-[hsl(var(--primary))]" />
                  <span className="text-sm">{s === 'M' ? 'Masculin' : 'Féminin'}</span>
                </label>
              ))}
            </div>
            {form1.formState.errors.sexe && <p className="text-xs text-destructive mt-1">{form1.formState.errors.sexe.message}</p>}
          </div>
          <div className="flex justify-end mt-6">
            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Suivant <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2Submit)} className="bg-card rounded-xl border shadow-sm p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Rattachement</h2>
          <div className="space-y-4">
            {/* Famille selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Famille *</label>
                <button
                  type="button"
                  onClick={() => setShowNewFamille(!showNewFamille)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus size={14} /> {showNewFamille ? 'Choisir existante' : 'Nouvelle famille'}
                </button>
              </div>

              {showNewFamille ? (
                <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Créer une nouvelle famille</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Nom *</label>
                      <input {...formFamille.register('nom')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                      {formFamille.formState.errors.nom && <p className="text-xs text-destructive mt-1">{formFamille.formState.errors.nom.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Prénom *</label>
                      <input {...formFamille.register('prenom')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                      {formFamille.formState.errors.prenom && <p className="text-xs text-destructive mt-1">{formFamille.formState.errors.prenom.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Téléphone *</label>
                    <input {...formFamille.register('telephone')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    {formFamille.formState.errors.telephone && <p className="text-xs text-destructive mt-1">{formFamille.formState.errors.telephone.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Email</label>
                      <input {...formFamille.register('email')} type="email" className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Ville</label>
                      <input {...formFamille.register('ville')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={formFamille.handleSubmit(handleCreateFamille)}
                    disabled={createFamilleMutation.isPending}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {createFamilleMutation.isPending ? 'Création...' : 'Créer la famille'}
                  </button>
                </div>
              ) : (
                <>
                  {famillesLoading ? (
                    <div className="p-4"><TableSkeleton rows={3} cols={1} /></div>
                  ) : !familles?.length ? (
                    <div className="border rounded-lg p-4 text-center text-sm text-muted-foreground">
                      <p>Aucune famille trouvée.</p>
                      <button
                        type="button"
                        onClick={() => setShowNewFamille(true)}
                        className="mt-2 text-primary hover:underline flex items-center gap-1 mx-auto"
                      >
                        <Plus size={14} /> Créer une famille
                      </button>
                    </div>
                  ) : (
                    <select {...form2.register('familleId')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Sélectionner une famille</option>
                      {familles.map((f) => (
                        <option key={f.id} value={f.id}>{f.nom} {f.prenom} — {f.telephone}</option>
                      ))}
                    </select>
                  )}
                  {form2.formState.errors.familleId && <p className="text-xs text-destructive mt-1">{form2.formState.errors.familleId.message}</p>}
                  {selectedFamille && (
                    <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                      <p className="font-medium">{selectedFamille.nom} {selectedFamille.prenom}</p>
                      <p className="text-muted-foreground text-xs">{selectedFamille.telephone} · {selectedFamille.nombreEnfants} enfant(s)</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Classe selection */}
            <div>
              <label className="text-sm font-medium mb-1 block">Classe *</label>
              {classesLoading ? (
                <div className="p-2"><TableSkeleton rows={1} cols={1} /></div>
              ) : (
                <select {...form2.register('classeId')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Sélectionner une classe</option>
                  {classes?.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom} — {c.niveau}</option>
                  ))}
                </select>
              )}
              {form2.formState.errors.classeId && <p className="text-xs text-destructive mt-1">{form2.formState.errors.classeId.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Année scolaire</label>
              <input value={ANNEE_SCOLAIRE} readOnly className="w-full px-3 py-2 border rounded-lg bg-muted text-sm" />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button type="button" onClick={() => setStep(1)} className="px-6 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              Précédent
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Suivant <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-card rounded-xl border shadow-sm p-6 max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <p><span className="text-muted-foreground">Nom:</span> <strong>{step1Data?.prenom} {step1Data?.nom}</strong></p>
            <p><span className="text-muted-foreground">Date de naissance:</span> <strong>{step1Data?.dateNaissance}</strong></p>
            <p><span className="text-muted-foreground">Lieu:</span> <strong>{step1Data?.lieuNaissance}</strong></p>
            <p><span className="text-muted-foreground">Sexe:</span> <strong>{step1Data?.sexe === 'M' ? 'Masculin' : 'Féminin'}</strong></p>
            <p><span className="text-muted-foreground">Famille:</span> <strong>{selectedFamille?.nom} {selectedFamille?.prenom}</strong></p>
            <p><span className="text-muted-foreground">Classe:</span> <strong>{selectedClasse?.nom || '-'}</strong></p>
            <p><span className="text-muted-foreground">Matricule (prévisualisation):</span> <span className="status-badge-active font-mono">{matriculePreview}</span></p>
            <p><span className="text-muted-foreground">Année scolaire:</span> <strong>{ANNEE_SCOLAIRE}</strong></p>
          </div>
          <div className="flex justify-between mt-6">
            <button type="button" onClick={() => setStep(2)} className="px-6 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
              Précédent
            </button>
            <button
              onClick={handleConfirm}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 disabled:opacity-50 transition-colors"
            >
              <Check size={16} /> {createMutation.isPending ? 'Inscription...' : "Confirmer l'inscription"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
