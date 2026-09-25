namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Email)
            .HasMaxLength(255)
            .IsRequired(false);

        builder.HasIndex(e => e.Email)
            .IsUnique()
            .HasFilter("\"Email\" IS NOT NULL");

        builder.Property(e => e.Name).HasMaxLength(120).IsRequired();
        builder.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired(false);
        builder.Property(e => e.IsGuest).IsRequired();
        builder.Property(e => e.TotalXP).HasDefaultValue(0).IsRequired();
        builder.Property(e => e.Level).HasDefaultValue(1).IsRequired();
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();
    }
}
