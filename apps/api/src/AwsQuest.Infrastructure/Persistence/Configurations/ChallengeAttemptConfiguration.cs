namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class ChallengeAttemptConfiguration : IEntityTypeConfiguration<ChallengeAttempt>
{
    public void Configure(EntityTypeBuilder<ChallengeAttempt> builder)
    {
        builder.ToTable("challenge_attempts");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Score).IsRequired();
        builder.Property(e => e.Passed).IsRequired();
        builder.Property(e => e.HintsUsed).HasDefaultValue(0).IsRequired();

        // Columnas JSONB
        builder.Property(e => e.GraphSubmittedJson)
            .HasColumnName("graph_submitted_json")
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(e => e.EvaluationResultJson)
            .HasColumnName("evaluation_result_json")
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(e => e.CreatedAt).IsRequired();

        // Índices de consulta e historial
        builder.HasIndex(e => new { e.ProgressId, e.CreatedAt });

        // Relaciones
        builder.HasOne(e => e.Progress)
            .WithMany(p => p.Attempts)
            .HasForeignKey(e => e.ProgressId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
