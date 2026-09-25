namespace AwsQuest.UnitTests.Seeding;

using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence.Seeding;
using FluentAssertions;
using Xunit;

public class JsonChallengeContentReaderTests
{
    private readonly JsonChallengeContentReader _reader = new();

    private static string FindContentDirectory()
    {
        var current = AppContext.BaseDirectory;
        while (!string.IsNullOrEmpty(current))
        {
            var candidate = Path.Combine(current, "content");
            if (Directory.Exists(candidate) && File.Exists(Path.Combine(candidate, "system-config.json")))
            {
                return candidate;
            }
            var parent = Directory.GetParent(current);
            if (parent == null) break;
            current = parent.FullName;
        }
        return Path.Combine(AppContext.BaseDirectory, "content");
    }

    [Fact]
    public async Task ReadContentAsync_WhenContentDirectoryExists_ShouldReadPackageCorrectly()
    {
        // Arrange
        var contentPath = FindContentDirectory();

        // Act
        var package = await _reader.ReadContentAsync(contentPath);

        // Assert
        package.Should().NotBeNull();
        package.SystemConfig.AccessMode.Should().Be(AccessMode.OpenAccess);

        // Validar Servicios
        package.Services.Count.Should().BeGreaterThanOrEqualTo(4);
        package.Services.Should().Contain(s => s.Code == "AWS_ALB");
        package.Services.Should().Contain(s => s.Code == "AWS_EC2");
        package.Services.Should().Contain(s => s.Code == "AWS_RDS");
        package.Services.Should().Contain(s => s.Code == "AWS_S3");

        // Validar Unidades
        package.Units.Count.Should().Be(12);
        
        var unit1 = package.Units.FirstOrDefault(u => u.OrderIndex == 1);
        unit1.Should().NotBeNull();
        unit1!.Challenges.Count.Should().Be(4);

        var challenge101 = unit1.Challenges[0];
        challenge101.Title.Should().Contain("EC2");
        challenge101.EvaluationRules.RequiredServices.Should().Contain("AWS_EC2");

        var unit6 = package.Units.FirstOrDefault(u => u.OrderIndex == 6);
        unit6.Should().NotBeNull();
        unit6!.Challenges.Count.Should().Be(5);
        unit6.Challenges.Should().Contain(c => c.EvaluationRules.RequiredServices.Contains("AWS_LAMBDA"));

        var unit7 = package.Units.FirstOrDefault(u => u.OrderIndex == 7);
        unit7.Should().NotBeNull();
        unit7!.Challenges.Count.Should().Be(4);
        unit7.Challenges.Should().Contain(c => c.EvaluationRules.RequiredServices.Contains("AWS_SQS"));

        var unit8 = package.Units.FirstOrDefault(u => u.OrderIndex == 8);
        unit8.Should().NotBeNull();
        unit8!.Challenges.Count.Should().Be(4);
        unit8.Challenges.Should().Contain(c => c.EvaluationRules.RequiredServices.Contains("AWS_ROUTE53"));

        var unit9 = package.Units.FirstOrDefault(u => u.OrderIndex == 9);
        unit9.Should().NotBeNull();
        unit9!.Challenges.Count.Should().Be(3);
        unit9.Challenges.Should().Contain(c => c.EvaluationRules.RequiredServices.Contains("AWS_ECS"));

        var unit10 = package.Units.FirstOrDefault(u => u.OrderIndex == 10);
        unit10.Should().NotBeNull();
        unit10!.Challenges.Count.Should().Be(4);
        unit10.Challenges.Should().Contain(c => c.EvaluationRules.RequiredServices.Contains("AWS_CLOUDWATCH"));

        var unit11 = package.Units.FirstOrDefault(u => u.OrderIndex == 11);
        unit11.Should().NotBeNull();
        unit11!.Challenges.Count.Should().Be(3);
        unit11.Challenges.Should().Contain(c => c.EvaluationRules.RequiredServices.Contains("AWS_CLOUDFORMATION"));

        var unit12 = package.Units.FirstOrDefault(u => u.OrderIndex == 12);
        unit12.Should().NotBeNull();
        unit12!.Challenges.Count.Should().Be(6);
        unit12.Challenges.Should().Contain(c => c.EvaluationRules.RequiredServices.Contains("AWS_ALB"));
    }

    [Fact]
    public async Task ReadContentAsync_WhenDirectoryDoesNotExist_ShouldThrowDirectoryNotFoundException()
    {
        var invalidPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        var act = async () => await _reader.ReadContentAsync(invalidPath);

        await act.Should().ThrowAsync<DirectoryNotFoundException>();
    }
}
