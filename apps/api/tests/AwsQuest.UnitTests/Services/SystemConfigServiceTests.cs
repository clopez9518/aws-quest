namespace AwsQuest.UnitTests.Services;

using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using AwsQuest.Application.Dtos.SystemConfig;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;

public class SystemConfigServiceTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetConfigAsync_WhenConfigExists_ReturnsExistingConfig()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var initialDate = DateTime.UtcNow.AddHours(-1);

        dbContext.SystemConfigs.Add(new SystemConfig
        {
            Id = "global_config",
            AccessMode = AccessMode.Progressive,
            UpdatedAt = initialDate
        });
        await dbContext.SaveChangesAsync();

        var sut = new SystemConfigService(dbContext);

        // Act
        var result = await sut.GetConfigAsync();

        // Assert
        result.Should().NotBeNull();
        result.AccessMode.Should().Be(AccessMode.Progressive);
        result.UpdatedAt.Should().BeCloseTo(initialDate, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task GetConfigAsync_WhenConfigDoesNotExist_CreatesDefaultOpenAccessConfig()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var sut = new SystemConfigService(dbContext);

        // Act
        var result = await sut.GetConfigAsync();

        // Assert
        result.Should().NotBeNull();
        result.AccessMode.Should().Be(AccessMode.OpenAccess);

        // Verify persistence
        var persisted = await dbContext.SystemConfigs.FirstOrDefaultAsync(c => c.Id == "global_config");
        persisted.Should().NotBeNull();
        persisted!.AccessMode.Should().Be(AccessMode.OpenAccess);
    }

    [Fact]
    public async Task UpdateConfigAsync_WhenUpdatingMode_PersistsNewModeAndRefreshesTimestamp()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();

        dbContext.SystemConfigs.Add(new SystemConfig
        {
            Id = "global_config",
            AccessMode = AccessMode.OpenAccess,
            UpdatedAt = DateTime.UtcNow.AddHours(-2)
        });
        await dbContext.SaveChangesAsync();

        var sut = new SystemConfigService(dbContext);

        var request = new UpdateSystemConfigRequestDto
        {
            AccessMode = AccessMode.Progressive
        };

        // Act
        var result = await sut.UpdateConfigAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.AccessMode.Should().Be(AccessMode.Progressive);
        result.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));

        var persisted = await dbContext.SystemConfigs.FindAsync("global_config");
        persisted!.AccessMode.Should().Be(AccessMode.Progressive);
    }

    [Fact]
    public async Task UpdateConfigAsync_WhenConfigDoesNotExistInitially_CreatesAndAppliesNewMode()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();
        var sut = new SystemConfigService(dbContext);

        var request = new UpdateSystemConfigRequestDto
        {
            AccessMode = AccessMode.Progressive
        };

        // Act
        var result = await sut.UpdateConfigAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.AccessMode.Should().Be(AccessMode.Progressive);

        var persisted = await dbContext.SystemConfigs.FindAsync("global_config");
        persisted.Should().NotBeNull();
        persisted!.AccessMode.Should().Be(AccessMode.Progressive);
    }
}
