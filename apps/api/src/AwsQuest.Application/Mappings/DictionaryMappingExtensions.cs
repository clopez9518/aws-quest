namespace AwsQuest.Application.Mappings;

using AwsQuest.Application.Dtos.Dictionary;
using AwsQuest.Domain.Entities;

public static class DictionaryMappingExtensions
{
    public static DictionaryTermSummaryDto ToSummaryDto(this DictionaryTerm entity)
    {
        return new DictionaryTermSummaryDto(
            Slug: entity.Slug,
            Title: entity.Title,
            Category: entity.Category,
            ServiceCode: entity.ServiceCode,
            Pillar: entity.Pillar,
            ShortDefinition: entity.ShortDefinition,
            AssociatedChallengesCount: entity.AssociatedChallengeIds.Count,
            RelatedTermsCount: entity.RelatedTermSlugs.Count,
            DisplayOrder: entity.DisplayOrder
        );
    }

    public static DictionaryTradeOffsDto ToDto(this DictionaryTradeOffs entity)
    {
        return new DictionaryTradeOffsDto(
            Pros: entity.Pros,
            Cons: entity.Cons
        );
    }

    public static DictionaryTermDetailDto ToDetailDto(
        this DictionaryTerm entity,
        List<DictionaryRelatedTermDto> relatedTerms,
        List<DictionaryAssociatedChallengeDto> associatedChallenges)
    {
        return new DictionaryTermDetailDto(
            Slug: entity.Slug,
            Title: entity.Title,
            Category: entity.Category,
            ServiceCode: entity.ServiceCode,
            Pillar: entity.Pillar,
            ShortDefinition: entity.ShortDefinition,
            WhatIs: entity.WhatIs,
            WhenToUse: entity.WhenToUse ?? [],
            TradeOffs: entity.TradeOffs?.ToDto() ?? new DictionaryTradeOffsDto(string.Empty, string.Empty),
            RelatedTerms: relatedTerms ?? [],
            AssociatedChallenges: associatedChallenges ?? [],
            DisplayOrder: entity.DisplayOrder
        );
    }
}
