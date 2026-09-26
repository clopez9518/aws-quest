import { httpClient } from '../../../shared/api/httpClient';
import { ApiResponse } from '../../../shared/types/api.types';
import {
  DictionaryCategoryCount,
  DictionaryFilterParams,
  DictionaryTermDetail,
  DictionaryTermSummary,
} from '../types/dictionary.types';

export const dictionaryApi = {
  async getTerms(params?: DictionaryFilterParams): Promise<DictionaryTermSummary[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.pillar) query.append('pillar', params.pillar);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const queryString = query.toString();
    const url = `/dictionary${queryString ? `?${queryString}` : ''}`;
    const response = await httpClient.get<ApiResponse<DictionaryTermSummary[]>>(url);
    return response.data.data;
  },

  async getTermBySlug(slug: string): Promise<DictionaryTermDetail> {
    const response = await httpClient.get<ApiResponse<DictionaryTermDetail>>(`/dictionary/${slug}`);
    return response.data.data;
  },

  async getCategories(): Promise<DictionaryCategoryCount[]> {
    const response = await httpClient.get<ApiResponse<DictionaryCategoryCount[]>>('/dictionary/categories');
    return response.data.data;
  },
};
