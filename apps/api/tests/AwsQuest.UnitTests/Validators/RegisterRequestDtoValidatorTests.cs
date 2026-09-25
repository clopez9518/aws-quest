namespace AwsQuest.UnitTests.Validators;

using AwsQuest.Application.Dtos.Auth;
using AwsQuest.Application.Validators;
using FluentValidation.TestHelper;

public class RegisterRequestDtoValidatorTests
{
    private readonly RegisterRequestDtoValidator _validator = new();

    [Fact]
    public void Should_Pass_When_RegisterRequest_Is_Valid()
    {
        var model = new RegisterRequestDto
        {
            Email = "aprendiz@awsquest.dev",
            Password = "PasswordSeguro123!",
            Name = "Carlos López"
        };

        var result = _validator.TestValidate(model);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-email")]
    [InlineData("test@")]
    [InlineData("@example.com")]
    public void Should_Have_Error_When_Email_Is_Invalid(string email)
    {
        var model = new RegisterRequestDto
        {
            Email = email,
            Password = "PasswordSeguro123!",
            Name = "Carlos"
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Theory]
    [InlineData("")] // Vacío
    [InlineData("short1!")] // Menos de 8 caracteres
    [InlineData("alllowercase123!")] // Sin mayúscula
    [InlineData("ALLUPPERCASE123!")] // Sin minúscula
    [InlineData("NoDigitsOrSymbols")] // Sin dígitos ni símbolos
    public void Should_Have_Error_When_Password_Is_Weak(string password)
    {
        var model = new RegisterRequestDto
        {
            Email = "valid@awsquest.dev",
            Password = password,
            Name = "Carlos"
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Theory]
    [InlineData("")]
    [InlineData("A")] // Menos de 2 caracteres
    public void Should_Have_Error_When_Name_Is_Too_Short_Or_Empty(string name)
    {
        var model = new RegisterRequestDto
        {
            Email = "valid@awsquest.dev",
            Password = "PasswordSeguro123!",
            Name = name
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }
}
