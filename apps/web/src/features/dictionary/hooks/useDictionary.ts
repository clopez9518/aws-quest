import { useQuery } from '@tanstack/react-query';
import { dictionaryApi } from '../api/dictionaryApi';
import { DictionaryFilterParams } from '../types/dictionary.types';

export const DICTIONARY_QUERY_KEYS = {
  all: ['dictionary'] as const,
  terms: (filters?: DictionaryFilterParams) => ['dictionary', 'terms', filters] as const,
  detail: (slug: string) => ['dictionary', 'detail', slug] as const,
  categories: () => ['dictionary', 'categories'] as const,
};

export function useDictionaryTerms(filters?: DictionaryFilterParams) {
  return useQuery({
    queryKey: DICTIONARY_QUERY_KEYS.terms(filters),
    queryFn: () => dictionaryApi.getTerms(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché fresca
  });
}

export function useDictionaryTermDetail(slug: string | null) {
  return useQuery({
    queryKey: DICTIONARY_QUERY_KEYS.detail(slug ?? ''),
    queryFn: () => dictionaryApi.getTermBySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });
}

export function useDictionaryCategories() {
  return useQuery({
    queryKey: DICTIONARY_QUERY_KEYS.categories(),
    queryFn: () => dictionaryApi.getCategories(),
    staleTime: 1000 * 60 * 15,
  });
}
