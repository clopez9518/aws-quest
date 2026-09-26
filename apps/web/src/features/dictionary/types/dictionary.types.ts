export type DictionaryCategory = 'service' | 'concept' | 'infrastructure' | 'well-architected';

export type WellArchitectedPillar =
  | 'OperationalExcellence'
  | 'Security'
  | 'Reliability'
  | 'PerformanceEfficiency'
  | 'CostOptimization'
  | 'Sustainability';

export interface DictionaryTermSummary {
  slug: string;
  title: string;
  category: DictionaryCategory | string;
  serviceCode: string | null;
  pillar: WellArchitectedPillar | null;
  shortDefinition: string;
  associatedChallengesCount: number;
  relatedTermsCount: number;
  displayOrder: number;
}

export interface DictionaryTradeOffs {
  pros: string;
  cons: string;
}

export interface DictionaryRelatedTerm {
  slug: string;
  title: string;
  category: string;
  serviceCode: string | null;
}

export interface DictionaryAssociatedChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Intermediate' | 'Hard' | 'Integrator';
  baseXP: number;
}

export interface DictionaryTermDetail {
  slug: string;
  title: string;
  category: string;
  serviceCode: string | null;
  pillar: WellArchitectedPillar | null;
  shortDefinition: string;
  whatIs: string;
  whenToUse: string[];
  tradeOffs: DictionaryTradeOffs;
  relatedTerms: DictionaryRelatedTerm[];
  associatedChallenges: DictionaryAssociatedChallenge[];
  displayOrder: number;
}

export interface DictionaryCategoryCount {
  category: string;
  count: number;
  label: string;
}

export interface DictionaryFilterParams {
  search?: string;
  category?: string;
  pillar?: WellArchitectedPillar;
  limit?: number;
  offset?: number;
}
