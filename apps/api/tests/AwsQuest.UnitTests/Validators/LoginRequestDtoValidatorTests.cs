namespace AwsQuest.UnitTests.Validators;

using AwsQuest.Application.Dtos.Auth;
using AwsQuest.Application.Validators;
using FluentValidation.TestHelper;

public class LoginRequestDtoValidatorTests
{
    private readonly LoginRequestDtoValidator _validator = new();

    [Fact]
    public void Should_Pass_When_LoginRequest_Is_Valid()
    {
        var model = new LoginRequestDto
        {
            Email = "aprendiz@awsquest.dev",
            Password = "PasswordSeguro123!"
        };

        var result = _validator.TestValidate(model);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-email")]
    public void Should_Have_Error_When_Email_Is_Invalid_Or_Empty(string email)
    {
        var model = new LoginRequestDto
        {
            Email = email,
            Password = "PasswordSeguro123!"
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Have_Error_When_Password_Is_Empty()
    {
        var model = new LoginRequestDto
        {
            Email = "aprendiz@awsquest.dev",
            Password = ""
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}
