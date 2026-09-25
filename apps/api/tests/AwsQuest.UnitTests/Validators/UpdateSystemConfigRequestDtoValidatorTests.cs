namespace AwsQuest.UnitTests.Validators;

using AwsQuest.Application.Dtos.SystemConfig;
using AwsQuest.Application.Validators;
using AwsQuest.Domain.Enums;
using FluentValidation.TestHelper;

public class UpdateSystemConfigRequestDtoValidatorTests
{
    private readonly UpdateSystemConfigRequestDtoValidator _validator = new();

    [Theory]
    [InlineData(AccessMode.OpenAccess)]
    [InlineData(AccessMode.Progressive)]
    public void Should_Pass_When_AccessMode_Is_Valid_Enum_Value(AccessMode mode)
    {
        var model = new UpdateSystemConfigRequestDto
        {
            AccessMode = mode
        };

        var result = _validator.TestValidate(model);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Have_Error_When_AccessMode_Is_Out_Of_Range()
    {
        var model = new UpdateSystemConfigRequestDto
        {
            AccessMode = (AccessMode)99
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.AccessMode);
    }
}
