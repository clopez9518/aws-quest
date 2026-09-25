import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../shared/stores/useAuthStore';
import { authApi } from '../api/authApi';
import { LoginRequestDto, RegisterRequestDto } from '../types/auth.types';

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const
};

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, accessToken, isInitialized, isLoading, setSession, clearSession, updateUser } = useAuthStore();

  // 1. Query: Perfil de usuario (/auth/me)
  const profileQuery = useQuery({
    queryKey: authKeys.profile(),
    queryFn: authApi.getMe,
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60 * 2 // 2 minutos
  });

  // 2. Mutation: Login
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequestDto) => authApi.login(credentials),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      navigate('/catalog');
    }
  });

  // 3. Mutation: Register (con soporte para migración de invitado RN-13 / CU-08)
  const registerMutation = useMutation({
    mutationFn: (dto: RegisterRequestDto) => {
      const currentGuestToken = user?.isGuest ? accessToken : null;
      return authApi.register(dto, currentGuestToken);
    },
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      navigate('/catalog');
    }
  });

  // 4. Logout
  const logout = () => {
    clearSession();
    queryClient.clear();
    navigate('/catalog');
  };

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(accessToken && user),
    isGuest: Boolean(user?.isGuest),
    isInitialized,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    
    // Acciones y Mutaciones
    login: loginMutation.mutateAsync,
    loginMutation,
    register: registerMutation.mutateAsync,
    registerMutation,
    logout,
    updateUser,
    
    // Datos de perfil adicionales
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
    refetchProfile: profileQuery.refetch
  };
}
