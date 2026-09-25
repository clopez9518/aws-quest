namespace AwsQuest.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using AwsQuest.Domain.Entities;

public class UnitConfiguration : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("units");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).HasMaxLength(150).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500).IsRequired();
        builder.Property(e => e.OrderIndex).IsRequired();
        builder.HasIndex(e => e.OrderIndex).IsUnique();
        builder.Property(e => e.CreatedAt).IsRequired();
    }
}
