import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2, Lock, User as UserIcon } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

const loginSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginForm = z.infer<typeof loginSchema>;

const stats = [
  { value: '1,200+', label: 'Élèves' },
  { value: '95%', label: 'Recouvrement' },
  { value: '50+', label: 'Classes' },
  { value: '800+', label: 'Familles' },
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => loginMutation.mutate({ username: data.username, password: data.password });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Dark navy with gradient */}
      <div className="hidden lg:flex lg:w-[55%] bg-navy flex-col justify-between p-10 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-[hsl(213,52%,28%)] to-navy" />
        <div className="absolute top-0 right-0 w-[60%] h-48 bg-gradient-to-bl from-primary/15 via-primary/5 to-transparent rounded-bl-[120px]" />

        {/* Logo top */}
        <div className="relative z-10">
          <Logo size="md" variant="full" />
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          <h1 className="text-4xl font-bold text-navy-foreground leading-tight mb-4">
            Gestion scolaire simplifiée
          </h1>
          <p className="text-navy-foreground/60 text-base leading-relaxed mb-10">
            Gérez efficacement vos inscriptions, paiements et suivi des élèves en un seul endroit.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-navy-foreground/5 border border-navy-foreground/10 rounded-xl px-5 py-4 backdrop-blur-sm"
              >
                <p className="text-2xl font-bold text-navy-foreground">{s.value}</p>
                <p className="text-sm text-navy-foreground/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-navy-foreground/30">
          © 2024-2025 SchoolFlow. Tous droits réservés.
        </p>

        {/* Decorative blurs */}
        <div className="absolute top-32 left-10 w-40 h-40 bg-primary/8 rounded-full blur-[80px]" />
        <div className="absolute bottom-24 right-16 w-56 h-56 bg-success/6 rounded-full blur-[100px]" />
      </div>

      {/* Right Panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-muted/30">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Logo size="lg" variant="full" />
          </div>

          {/* Card */}
          <div className="bg-card rounded-2xl shadow-lg border p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Entrez vos identifiants pour accéder à votre espace
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Identifiant</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <UserIcon size={16} />
                  </div>
                  <input
                    {...register('username')}
                    type="text"
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock size={16} />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border rounded-lg bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-primary/20"
              >
                {loginMutation.isPending && <Loader2 size={18} className="animate-spin" />}
                Se connecter
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Problème de connexion ?{' '}
              <a href="#" className="text-primary hover:underline font-medium">
                Contactez l'administrateur
              </a>
            </p>
          </div>

          {/* Mobile footer */}
          <div className="lg:hidden mt-8 text-center">
            <Logo size="sm" variant="icon" />
          </div>
        </div>
      </div>
    </div>
  );
}
