import { useQuery } from '@tanstack/react-query';
import { catalogKeys } from './catalogQueryKeys';
import { getUnitsCatalog } from '../api/catalogApi';
import { UnitResponseDto } from '../types/catalog.types';

export function useUnits() {
  return useQuery<UnitResponseDto[], Error>({
    queryKey: catalogKeys.units(),
    queryFn: getUnitsCatalog,
    staleTime: 1000 * 60 * 2, // 2 minutos de datos frescos
  });
}
