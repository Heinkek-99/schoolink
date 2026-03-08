import api from './axios.config';
import type { LoginRequest, LoginResponse } from '@/types/auth.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/api/Auth/login', data);
    return response.data;
  },
};
