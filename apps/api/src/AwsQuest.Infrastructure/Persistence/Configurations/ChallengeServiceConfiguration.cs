namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class ChallengeServiceConfiguration : IEntityTypeConfiguration<ChallengeService>
{
    public void Configure(EntityTypeBuilder<ChallengeService> builder)
    {
        builder.ToTable("challenge_services");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.MaxInstances).IsRequired(false);
        builder.Property(e => e.IsDistractor).HasDefaultValue(false).IsRequired();

        builder.HasIndex(e => new { e.ChallengeId, e.ServiceId }).IsUnique();
        builder.HasIndex(e => e.ChallengeId);
        builder.HasIndex(e => e.ServiceId);

        builder.HasOne(e => e.Challenge)
            .WithMany(c => c.AllowedServices)
            .HasForeignKey(e => e.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Service)
            .WithMany(s => s.ChallengeServices)
            .HasForeignKey(e => e.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
