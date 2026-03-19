import { useQuery } from "@tanstack/react-query";
import { authApi } from "./auth.api";

export const authKeys = {
    all: ['auth'] as const,
    me: () => [...authKeys.all, 'me'] as const,
}

// Get current user
export const useGetMe = (enabled = true) => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authApi.getMe, 
    staleTime: 5 * 60 * 1000,  
    gcTime: 10 * 60 * 1000, 
    retry: false, 
    //This works but localStorage in the enabled option is read once when the hook mounts
    //It won't react to the token being added or removed.
    //This is fine for now since AuthContext will handle that reactively, but just know that's a limitation here.
    enabled: enabled && !!localStorage.getItem('authToken'), 
  });
};