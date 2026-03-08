import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, User, Users, ClipboardCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCreateEleve, useClasses } from '@/hooks/useEleves';
import { useFamilles } from '@/hooks/useFamilles';
import { generateMatricule, ANNEE_SCOLAIRE } from '@/utils/constants';

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

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;

export default function EleveCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1 | null>(null);
  const { data: classes } = useClasses();
  const { data: familles } = useFamilles();
  const createMutation = useCreateEleve();

  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema), defaultValues: step1Data || undefined });
  const form2 = useForm<Step2>({ resolver: zodResolver(step2Schema) });

  const steps = [
    { num: 1, label: 'Informations', icon: User },
    { num: 2, label: 'Rattachement', icon: Users },
    { num: 3, label: 'Récapitulatif', icon: ClipboardCheck },
  ];

  const onStep1Submit = (data: Step1) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2Submit = (data: Step2) => {
    setStep(3);
  };

  const handleConfirm = () => {
    if (!step1Data) return;
    const step2Values = form2.getValues();
    createMutation.mutate(
      { ...step1Data, ...step2Values },
      { onSuccess: () => navigate('/eleves') }
    );
  };

  const matriculePreview = generateMatricule(2024, Math.floor(Math.random() * 999) + 1);

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
            <div>
              <label className="text-sm font-medium mb-1 block">Famille *</label>
              <select {...form2.register('familleId')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Sélectionner une famille</option>
                {familles?.map((f) => (
                  <option key={f.id} value={f.id}>{f.nom} {f.prenom}</option>
                ))}
              </select>
              {form2.formState.errors.familleId && <p className="text-xs text-destructive mt-1">{form2.formState.errors.familleId.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Classe *</label>
              <select {...form2.register('classeId')} className="w-full px-3 py-2 border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Sélectionner une classe</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
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
            <p><span className="text-muted-foreground">Famille:</span> <strong>{familles?.find((f) => f.id === form2.getValues('familleId'))?.nom || '-'}</strong></p>
            <p><span className="text-muted-foreground">Classe:</span> <strong>{classes?.find((c) => c.id === form2.getValues('classeId'))?.nom || '-'}</strong></p>
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
