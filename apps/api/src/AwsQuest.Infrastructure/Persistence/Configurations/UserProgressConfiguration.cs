namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class UserProgressConfiguration : IEntityTypeConfiguration<UserProgress>
{
    public void Configure(EntityTypeBuilder<UserProgress> builder)
    {
        builder.ToTable("user_progress");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(e => e.HighScore).HasDefaultValue(0).IsRequired();
        builder.Property(e => e.HintsUsed).HasDefaultValue(0).IsRequired();

        // Columna JSONB
        builder.Property(e => e.LastAttemptGraphJson)
            .HasColumnName("last_attempt_graph_json")
            .HasColumnType("jsonb")
            .IsRequired(false);

        builder.Property(e => e.ReflectionCompleted)
            .HasColumnName("reflection_completed")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(e => e.ReflectionSelectedOptionId)
            .HasColumnName("reflection_selected_option_id")
            .HasMaxLength(50)
            .IsRequired(false);

        builder.Property(e => e.ReflectionAnsweredAt)
            .HasColumnName("reflection_answered_at")
            .IsRequired(false);

        builder.Property(e => e.FirstCompletedAt).IsRequired(false);
        builder.Property(e => e.UpdatedAt).IsRequired();

        // Índices
        builder.HasIndex(e => new { e.UserId, e.ChallengeId }).IsUnique();
        builder.HasIndex(e => new { e.UserId, e.Status });
        builder.HasIndex(e => e.ChallengeId);

        // Relaciones
        builder.HasOne(e => e.User)
            .WithMany(u => u.Progress)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Challenge)
            .WithMany(c => c.ProgressRecords)
            .HasForeignKey(e => e.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
