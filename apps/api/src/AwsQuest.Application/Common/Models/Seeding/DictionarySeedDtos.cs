namespace AwsQuest.Application.Common.Models.Seeding;

using AwsQuest.Domain.Enums;

public class DictionarySeedPackageDto
{
    public List<DictionaryTermSeedDto> Terms { get; set; } = [];
}

public class DictionaryTermSeedDto
{
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ServiceCode { get; set; }
    public WellArchitectedPillar? Pillar { get; set; }
    public string ShortDefinition { get; set; } = string.Empty;
    public string WhatIs { get; set; } = string.Empty;
    public List<string> WhenToUse { get; set; } = [];
    public DictionaryTradeOffsSeedDto TradeOffs { get; set; } = new();
    public List<string> RelatedTermSlugs { get; set; } = [];
    public List<string> AssociatedChallengeIds { get; set; } = [];
    public int DisplayOrder { get; set; } = 0;
}

public class DictionaryTradeOffsSeedDto
{
    public string Pros { get; set; } = string.Empty;
    public string Cons { get; set; } = string.Empty;
}
