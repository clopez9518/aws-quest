namespace AwsQuest.UnitTests.Validators;

using AwsQuest.Application.Dtos.Challenge;
using AwsQuest.Application.Validators;
using FluentValidation.TestHelper;
using Xunit;

public class SubmitReflectionAnswerRequestDtoValidatorTests
{
    private readonly SubmitReflectionAnswerRequestDtoValidator _validator = new();

    [Fact]
    public void Should_Pass_When_SelectedOptionId_Is_Valid()
    {
        var model = new SubmitReflectionAnswerRequestDto
        {
            SelectedOptionId = "opt-alb-cross-az"
        };

        var result = _validator.TestValidate(model);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_Have_Error_When_SelectedOptionId_Is_Empty(string? optionId)
    {
        var model = new SubmitReflectionAnswerRequestDto
        {
            SelectedOptionId = optionId!
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.SelectedOptionId);
    }

    [Fact]
    public void Should_Have_Error_When_SelectedOptionId_Exceeds_MaxLength()
    {
        var model = new SubmitReflectionAnswerRequestDto
        {
            SelectedOptionId = new string('a', 51)
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.SelectedOptionId);
    }
}
