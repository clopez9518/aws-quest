namespace AwsQuest.Infrastructure.Persistence.Configurations;

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class DictionaryTermConfiguration : IEntityTypeConfiguration<DictionaryTerm>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public void Configure(EntityTypeBuilder<DictionaryTerm> builder)
    {
        builder.ToTable("dictionary_terms");

        builder.HasKey(t => t.Slug);

        builder.Property(t => t.Slug)
            .HasColumnName("slug")
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(t => t.Title)
            .HasColumnName("title")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Category)
            .HasColumnName("category")
            .HasMaxLength(64)
            .IsRequired();

        builder.Property(t => t.ServiceCode)
            .HasColumnName("service_code")
            .HasMaxLength(64)
            .IsRequired(false);

        builder.Property(t => t.Pillar)
            .HasColumnName("pillar")
            .HasConversion<string>()
            .HasMaxLength(64)
            .IsRequired(false);

        builder.Property(t => t.ShortDefinition)
            .HasColumnName("short_definition")
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(t => t.WhatIs)
            .HasColumnName("what_is")
            .IsRequired();

        builder.Property(t => t.DisplayOrder)
            .HasColumnName("display_order")
            .HasDefaultValue(0)
            .IsRequired();

        // Mapeo JSON para colecciones y objetos complejos
        builder.Property(t => t.WhenToUse)
            .HasColumnName("when_to_use")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => string.IsNullOrWhiteSpace(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, JsonOptions) ?? new List<string>())
            .HasColumnType("jsonb");

        builder.Property(t => t.RelatedTermSlugs)
            .HasColumnName("related_term_slugs")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => string.IsNullOrWhiteSpace(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, JsonOptions) ?? new List<string>())
            .HasColumnType("jsonb");

        builder.Property(t => t.AssociatedChallengeIds)
            .HasColumnName("associated_challenge_ids")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => string.IsNullOrWhiteSpace(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, JsonOptions) ?? new List<string>())
            .HasColumnType("jsonb");

        builder.Property(t => t.TradeOffs)
            .HasColumnName("trade_offs")
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => string.IsNullOrWhiteSpace(v) ? new DictionaryTradeOffs() : JsonSerializer.Deserialize<DictionaryTradeOffs>(v, JsonOptions) ?? new DictionaryTradeOffs())
            .HasColumnType("jsonb");

        builder.Property(t => t.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(t => t.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired(false);

        // Índices para consultas optimizadas
        builder.HasIndex(t => t.Category);
        builder.HasIndex(t => t.ServiceCode);
        builder.HasIndex(t => t.Pillar);
        builder.HasIndex(t => t.Title);
    }
}
