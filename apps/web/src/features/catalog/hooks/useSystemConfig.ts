import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemConfigKeys, catalogKeys } from './catalogQueryKeys';
import { getSystemConfig, updateSystemConfig } from '../api/systemConfigApi';
import { AccessMode, SystemConfigResponseDto } from '../types/systemConfig.types';
import { useAuthStore } from '../../../shared/stores/useAuthStore';

export function useSystemConfig() {
  const queryClient = useQueryClient();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const accessToken = useAuthStore((state) => state.accessToken);

  const configQuery = useQuery<SystemConfigResponseDto, Error>({
    queryKey: systemConfigKeys.config(),
    queryFn: getSystemConfig,
    enabled: isInitialized && Boolean(accessToken),
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: (mode: AccessMode) => updateSystemConfig(mode),
    onSuccess: (newConfig) => {
      // Actualiza la caché de la configuración del sistema
      queryClient.setQueryData(systemConfigKeys.config(), newConfig);
      // Invalida el catálogo de unidades para recalcular el bloqueo de desafíos según la nueva política
      queryClient.invalidateQueries({ queryKey: catalogKeys.units() });
    },
  });

  return {
    config: configQuery.data,
    accessMode: configQuery.data?.accessMode ?? 'openAccess',
    isLoading: configQuery.isLoading,
    isError: configQuery.isError,
    error: configQuery.error,
    updateAccessMode: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
