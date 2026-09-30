namespace AwsQuest.UnitTests.Mappings;

using FluentAssertions;
using Xunit;
using AwsQuest.Application.Mappings;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;

public class CatalogMappingExtensionsTests
{
    [Theory]
    [InlineData("BUILDER", null, ChallengeMode.Builder)]
    [InlineData("builder", null, ChallengeMode.Builder)]
    [InlineData("Builder", null, ChallengeMode.Builder)]
    [InlineData("REPAIR", null, ChallengeMode.FixArchitecture)]
    [InlineData("repair", null, ChallengeMode.FixArchitecture)]
    [InlineData("DIAGNOSE", null, ChallengeMode.FixArchitecture)]
    [InlineData("AUDIT", null, ChallengeMode.FixArchitecture)]
    [InlineData("INCIDENT", null, ChallengeMode.FixArchitecture)]
    [InlineData("FIX_ARCHITECTURE", null, ChallengeMode.FixArchitecture)]
    [InlineData("fixArchitecture", null, ChallengeMode.FixArchitecture)]
    [InlineData("FixArchitecture", null, ChallengeMode.FixArchitecture)]
    [InlineData("FIX", null, ChallengeMode.FixArchitecture)]
    [InlineData(null, "{\"components\":[{\"id\":\"c1\"}]}", ChallengeMode.FixArchitecture)]
    [InlineData("", "{\"components\":[{\"id\":\"c1\"}]}", ChallengeMode.FixArchitecture)]
    [InlineData(null, null, ChallengeMode.Builder)]
    [InlineData("UNKNOWN_MODE", null, ChallengeMode.Builder)]
    [InlineData("UNKNOWN_MODE", "{\"components\":[]}", ChallengeMode.FixArchitecture)]
    public void ParseChallengeMode_ShouldMapCorrectly(string? rawMode, string? initialGraphJson, ChallengeMode expectedMode)
    {
        // Act
        var result = CatalogMappingExtensions.ParseChallengeMode(rawMode, initialGraphJson);

        // Assert
        result.Should().Be(expectedMode);
    }

    [Fact]
    public void ToCatalogDto_WhenChallengeIsRepair_ShouldMapModeToFixArchitecture()
    {
        // Arrange
        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Incidente de Base de Datos",
            Difficulty = DifficultyLevel.Intermediate,
            Mode = "REPAIR",
            BaseXP = 150,
            RequiredXP = 100,
            OrderIndex = 3,
            InitialGraphJson = "{\"components\":[{\"id\":\"vpc-1\"}]}"
        };

        // Act
        var dto = challenge.ToCatalogDto(false, null, null);

        // Assert
        dto.Mode.Should().Be(ChallengeMode.FixArchitecture);
        dto.Title.Should().Be("Incidente de Base de Datos");
    }

    [Fact]
    public void ToDetailDto_WhenChallengeIsDiagnose_ShouldMapModeToFixArchitecture()
    {
        // Arrange
        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Detectar Falla en CloudWatch",
            Difficulty = DifficultyLevel.Hard,
            Mode = "DIAGNOSE",
            BaseXP = 200,
            RequiredXP = 150,
            OrderIndex = 2,
            InitialGraphJson = "{\"components\":[{\"id\":\"cw-1\"}]}",
            AllowedServices = []
        };

        // Act
        var dto = challenge.ToDetailDto(null);

        // Assert
        dto.Mode.Should().Be(ChallengeMode.FixArchitecture);
        dto.InitialGraph.Should().NotBeNull();
    }
}
