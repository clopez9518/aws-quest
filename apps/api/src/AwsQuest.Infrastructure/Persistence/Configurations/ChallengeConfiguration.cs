namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class ChallengeConfiguration : IEntityTypeConfiguration<Challenge>
{
    public void Configure(EntityTypeBuilder<Challenge> builder)
    {
        builder.ToTable("challenges");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).HasMaxLength(150).IsRequired();
        builder.Property(e => e.Description).IsRequired();
        builder.Property(e => e.Difficulty)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();
        builder.Property(e => e.Mode).HasMaxLength(50).HasDefaultValue("BUILDER").IsRequired();
        builder.Property(e => e.RequiredXP).HasDefaultValue(0).IsRequired();
        builder.Property(e => e.BaseXP).HasDefaultValue(100).IsRequired();
        builder.Property(e => e.OrderIndex).IsRequired();

        // Columnas JSONB
        builder.Property(e => e.EvaluationRulesJson)
            .HasColumnName("evaluation_rules_json")
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(e => e.HintsJson)
            .HasColumnName("hints_json")
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(e => e.InitialGraphJson)
            .HasColumnName("initial_graph_json")
            .HasColumnType("jsonb")
            .IsRequired(false);

        builder.Property(e => e.BriefingJson)
            .HasColumnName("briefing_json")
            .HasColumnType("jsonb")
            .IsRequired(false);

        builder.Property(e => e.ReflectionPromptJson)
            .HasColumnName("reflection_prompt_json")
            .HasColumnType("jsonb")
            .IsRequired(false);

        builder.Property(e => e.CreatedAt).IsRequired();

        // Índices
        builder.HasIndex(e => new { e.UnitId, e.OrderIndex }).IsUnique();
        builder.HasIndex(e => e.PrerequisiteChallengeId);

        // Relaciones
        builder.HasOne(e => e.Unit)
            .WithMany(u => u.Challenges)
            .HasForeignKey(e => e.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Prerequisite)
            .WithMany(c => c.DependentChallenges)
            .HasForeignKey(e => e.PrerequisiteChallengeId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
