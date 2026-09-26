namespace AwsQuest.Application.Dtos.Dictionary;

using AwsQuest.Domain.Enums;

/// <summary>
/// DTO liviano para resultados de búsqueda, listados rápidos y Command Palette Spotlight.
/// </summary>
public record DictionaryTermSummaryDto(
    string Slug,
    string Title,
    string Category,
    string? ServiceCode,
    WellArchitectedPillar? Pillar,
    string ShortDefinition,
    int AssociatedChallengesCount,
    int RelatedTermsCount,
    int DisplayOrder
);

/// <summary>
/// DTO completo para la ficha técnica del Drawer lateral y vista individual.
/// </summary>
public record DictionaryTermDetailDto(
    string Slug,
    string Title,
    string Category,
    string? ServiceCode,
    WellArchitectedPillar? Pillar,
    string ShortDefinition,
    string WhatIs,
    List<string> WhenToUse,
    DictionaryTradeOffsDto TradeOffs,
    List<DictionaryRelatedTermDto> RelatedTerms,
    List<DictionaryAssociatedChallengeDto> AssociatedChallenges,
    int DisplayOrder
);

public record DictionaryTradeOffsDto(
    string Pros,
    string Cons
);

public record DictionaryRelatedTermDto(
    string Slug,
    string Title,
    string Category,
    string? ServiceCode
);

public record DictionaryAssociatedChallengeDto(
    string Id,
    string Title,
    DifficultyLevel Difficulty,
    int BaseXP
);

/// <summary>
/// Métricas agregadas por categoría para navegación y badges.
/// </summary>
public record DictionaryCategoryCountDto(
    string Category,
    int Count,
    string Label
);

/// <summary>
/// Parámetros de consulta y filtrado para el endpoint de listado.
/// </summary>
public record DictionaryFilterParams(
    string? Search = null,
    string? Category = null,
    WellArchitectedPillar? Pillar = null,
    int Limit = 100,
    int Offset = 0
);
