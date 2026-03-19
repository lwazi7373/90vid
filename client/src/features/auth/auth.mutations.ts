import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { authApi } from './auth.api';
import { authKeys } from './auth.queries';
import type { LoginRequest, RegisterRequest } from './auth.types';


export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      toast.success('Registration completed!');
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.authToken);
      queryClient.setQueryData(authKeys.me(), { user: data.user });
      toast.success('Login successful!');
    },
  });
};

// Logout mutation (client-side only)
export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('authToken');
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });
}