namespace AwsQuest.UnitTests.Seeding;

using AwsQuest.Infrastructure.Persistence.Seeding;
using FluentAssertions;
using Xunit;

public class DictionaryContentReaderTests
{
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
    public async Task ReadDictionaryAsync_ValidContentDirectory_ShouldReadTermsSuccessfully()
    {
        // Arrange
        var reader = new DictionaryContentReader();
        var contentDir = FindContentDirectory();

        // Act
        var package = await reader.ReadDictionaryAsync(contentDir);

        // Assert
        package.Should().NotBeNull();
        package.Terms.Should().NotBeNull();
        package.Terms.Count.Should().BeGreaterThanOrEqualTo(20);

        var ec2 = package.Terms.FirstOrDefault(t => t.Slug == "amazon-ec2");
        ec2.Should().NotBeNull();
        ec2!.Category.Should().Be("service");
        ec2.ServiceCode.Should().Be("AWS_EC2");
        ec2.WhenToUse.Should().NotBeEmpty();
        ec2.TradeOffs.Pros.Should().NotBeEmpty();
        ec2.TradeOffs.Cons.Should().NotBeEmpty();
        ec2.RelatedTermSlugs.Should().Contain("auto-scaling-group");
    }

    [Fact]
    public async Task ReadDictionaryAsync_NonExistentDirectory_ShouldThrowDirectoryNotFoundException()
    {
        // Arrange
        var reader = new DictionaryContentReader();
        var invalidPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        // Act
        var act = async () => await reader.ReadDictionaryAsync(invalidPath);

        // Assert
        await act.Should().ThrowAsync<DirectoryNotFoundException>();
    }
}
