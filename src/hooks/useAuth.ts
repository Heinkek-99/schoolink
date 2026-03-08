import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest } from '@/types/auth.types';
import toast from 'react-hot-toast';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success('Connexion réussie');
      navigate('/');
    },
    onError: () => {
      toast.error("Nom d'utilisateur ou mot de passe incorrect");
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return () => {
    logout();
    navigate('/login');
    toast.success('Déconnexion réussie');
  };
}
