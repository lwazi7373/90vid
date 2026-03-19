import { apiClient } from "../../api/client";
import type {
    RegisterRequest,
    LoginRequest,
    RegisterResponse,
    LoginResponse,
    GetMeResponse,
} from './auth.types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<GetMeResponse> => {
    const response = await apiClient.get<GetMeResponse>('/auth/me');
    return response.data;
  },
};
