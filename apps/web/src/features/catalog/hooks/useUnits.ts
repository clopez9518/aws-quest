import { useQuery } from '@tanstack/react-query';
import { catalogKeys } from './catalogQueryKeys';
import { getUnitsCatalog } from '../api/catalogApi';
import { UnitResponseDto } from '../types/catalog.types';
import { useAuthStore } from '../../../shared/stores/useAuthStore';

export function useUnits() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery<UnitResponseDto[], Error>({
    queryKey: catalogKeys.units(),
    queryFn: getUnitsCatalog,
    enabled: isInitialized && Boolean(accessToken),
    staleTime: 1000 * 60 * 2, // 2 minutos de datos frescos
  });
}
