namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class AwsServiceConfiguration : IEntityTypeConfiguration<AwsService>
{
    public void Configure(EntityTypeBuilder<AwsService> builder)
    {
        builder.ToTable("aws_services");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Code).HasMaxLength(50).IsRequired();
        builder.HasIndex(e => e.Code).IsUnique();
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Category).HasMaxLength(50).IsRequired();
        builder.Property(e => e.ShortDescription).HasMaxLength(300).IsRequired();
        builder.Property(e => e.IconUrl).HasMaxLength(255).IsRequired();
        builder.Property(e => e.IsActive).HasDefaultValue(true).IsRequired();
        builder.Property(e => e.CreatedAt).IsRequired();

        builder.Property(e => e.Kind)
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(ResourceKind.ManagedService)
            .IsRequired();

        builder.Property(e => e.PlacementScope)
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(PlacementScope.RegionalGlobal)
            .IsRequired();

        builder.Property(e => e.DefaultConfigJson)
            .HasColumnName("default_config_json")
            .HasColumnType("jsonb")
            .IsRequired(false);
    }
}
