import { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe } from "../auth.queries";
import { useLogin as useLoginMutation, useLogout as useLogoutMutation, useRegister as useRegisterMutation } from "../auth.mutations";
import { authKeys } from "../auth.queries";
import type { AuthContextType, LoginRequest, RegisterRequest } from "../auth.types";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useGetMe();

  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const registerMutation = useRegisterMutation();

  /**
   * 1. Call login endpoint — get token + minimal user
   * 2. Save token to localStorage
   * 3. Put minimal user in cache so app knows someone is logged in immediately
   * 4. Refetch getMe to replace minimal user with full profile
   */
  const login = useCallback(async (loginData: LoginRequest) => {
    const response = await loginMutation.mutateAsync(loginData);
    queryClient.setQueryData(authKeys.me(), { user: response.user });
    await refetch(); // replaces partial data with full User profile
}, [loginMutation, queryClient, refetch]);

  /**
   * 1. Clear token from localStorage
   * 2. Clear entire cache — no stale data from previous user
   * 3. Redirect to login
   */
  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    queryClient.clear();
    window.location.href = '/login';
}, [logoutMutation, queryClient]);

  /**
   * Register — no cache or token work needed,
   * user still needs to log in after registering
   */
  const register = useCallback(async (data: RegisterRequest) => {
    await registerMutation.mutateAsync(data);
  }, [registerMutation]);

  const value: AuthContextType = {
    user: data?.user ?? null,
    isAuthenticated: !!data?.user || !!localStorage.getItem('authToken'),
    isLoading,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};