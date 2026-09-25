namespace AwsQuest.UnitTests.Authentication;

using FluentAssertions;
using AwsQuest.Infrastructure.Authentication;

public class BCryptPasswordHasherTests
{
    private readonly BCryptPasswordHasher _hasher = new();

    [Fact]
    public void HashPassword_WithValidPassword_ReturnsHashedStringAndVerifiesSuccessfully()
    {
        // Arrange
        var password = "StrongPassword123!";

        // Act
        var hash = _hasher.HashPassword(password);
        var isValid = _hasher.VerifyPassword(password, hash);

        // Assert
        hash.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe(password);
        isValid.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_WithWrongPassword_ReturnsFalse()
    {
        // Arrange
        var password = "StrongPassword123!";
        var wrongPassword = "WrongPassword999!";
        var hash = _hasher.HashPassword(password);

        // Act
        var isValid = _hasher.VerifyPassword(wrongPassword, hash);

        // Assert
        isValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void VerifyPassword_WithEmptyOrNull_ReturnsFalse(string? invalidInput)
    {
        // Arrange
        var hash = _hasher.HashPassword("ValidPassword123!");

        // Act & Assert
        _hasher.VerifyPassword(invalidInput!, hash).Should().BeFalse();
        _hasher.VerifyPassword("ValidPassword123!", invalidInput!).Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void HashPassword_WithEmptyOrNullString_ThrowsArgumentException(string? invalidPassword)
    {
        // Act
        var act = () => _hasher.HashPassword(invalidPassword!);

        // Assert
        act.Should().Throw<ArgumentException>();
    }
}
