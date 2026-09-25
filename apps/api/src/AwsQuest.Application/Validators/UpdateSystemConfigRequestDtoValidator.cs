namespace AwsQuest.Application.Validators;

using FluentValidation;
using AwsQuest.Application.Dtos.SystemConfig;

public class UpdateSystemConfigRequestDtoValidator : AbstractValidator<UpdateSystemConfigRequestDto>
{
    public UpdateSystemConfigRequestDtoValidator()
    {
        RuleFor(x => x.AccessMode)
            .IsInEnum().WithMessage("El modo de acceso especificado no es válido.");
    }
}
