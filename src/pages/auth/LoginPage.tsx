import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import schoolflowLogo from '@/assets/schoolflow-logo.png';
import schoolflowLogoWhite from '@/assets/schoolflow-logo-white.png';

const loginSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => loginMutation.mutate({ username: data.username, password: data.password });

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-primary/20 to-navy" />
        <div className="relative z-10 text-center">
          <img src={schoolflowLogo} alt="SchoolFlow" className="h-24 w-24 mx-auto mb-6 rounded-2xl" />
          <h1 className="text-4xl font-bold text-navy-foreground mb-4">SchoolFlow</h1>
          <p className="text-lg text-navy-foreground/70 max-w-md">
            Gestion scolaire simplifiée. Gérez vos élèves, familles et finances en un seul endroit.
          </p>
        </div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-success/10 rounded-full blur-3xl" />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src={schoolflowLogo} alt="SchoolFlow" className="h-10 w-10 rounded-lg" />
            <span className="text-2xl font-bold text-foreground">SchoolFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Connexion</h2>
          <p className="text-muted-foreground mb-8">Entrez vos identifiants pour accéder à votre espace</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nom d'utilisateur</label>
              <input
                {...register('username')}
                type="text"
                placeholder="admin"
                className="w-full px-4 py-2.5 border rounded-lg bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border rounded-lg bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending && <Loader2 size={18} className="animate-spin" />}
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
