import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDictionaryTerms, useDictionaryTermDetail, useDictionaryCategories } from '../useDictionary';
import { dictionaryApi } from '../../api/dictionaryApi';
import { DictionaryTermDetail, DictionaryTermSummary, DictionaryCategoryCount } from '../../types/dictionary.types';

vi.mock('../../api/dictionaryApi', () => ({
  dictionaryApi: {
    getTerms: vi.fn(),
    getTermBySlug: vi.fn(),
    getCategories: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useDictionary hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useDictionaryTerms', () => {
    it('debe obtener y retornar el listado de términos filtrados', async () => {
      const mockTerms: DictionaryTermSummary[] = [
        {
          slug: 'amazon-ec2',
          title: 'Amazon EC2',
          category: 'service',
          serviceCode: 'AWS_EC2',
          pillar: 'CostOptimization',
          shortDefinition: 'Cómputo elástico',
          associatedChallengesCount: 2,
          relatedTermsCount: 4,
          displayOrder: 1,
        },
      ];

      vi.mocked(dictionaryApi.getTerms).mockResolvedValueOnce(mockTerms);

      const { result } = renderHook(() => useDictionaryTerms({ search: 'ec2' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTerms);
      expect(dictionaryApi.getTerms).toHaveBeenCalledWith({ search: 'ec2' });
    });
  });

  describe('useDictionaryTermDetail', () => {
    it('debe obtener la ficha técnica cuando el slug es provisto', async () => {
      const mockDetail: DictionaryTermDetail = {
        slug: 'amazon-s3',
        title: 'Amazon S3',
        category: 'service',
        serviceCode: 'AWS_S3',
        pillar: 'Reliability',
        shortDefinition: 'Almacenamiento de objetos',
        whatIs: 'Detalle de S3',
        whenToUse: ['Archivos estáticos'],
        tradeOffs: { pros: 'Durabilidad', cons: 'No POSIX' },
        relatedTerms: [],
        associatedChallenges: [],
        displayOrder: 2,
      };

      vi.mocked(dictionaryApi.getTermBySlug).mockResolvedValueOnce(mockDetail);

      const { result } = renderHook(() => useDictionaryTermDetail('amazon-s3'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockDetail);
      expect(dictionaryApi.getTermBySlug).toHaveBeenCalledWith('amazon-s3');
    });

    it('no debe ejecutar la consulta si el slug es null o vacío', () => {
      const { result } = renderHook(() => useDictionaryTermDetail(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(dictionaryApi.getTermBySlug).not.toHaveBeenCalled();
    });
  });

  describe('useDictionaryCategories', () => {
    it('debe obtener el resumen de categorías y conteos', async () => {
      const mockCategories: DictionaryCategoryCount[] = [
        { category: 'service', count: 12, label: 'Servicios AWS' },
        { category: 'concept', count: 8, label: 'Conceptos Cloud' },
      ];

      vi.mocked(dictionaryApi.getCategories).mockResolvedValueOnce(mockCategories);

      const { result } = renderHook(() => useDictionaryCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCategories);
      expect(dictionaryApi.getCategories).toHaveBeenCalledTimes(1);
    });
  });
});
