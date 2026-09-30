namespace AwsQuest.Application.Validators;

using FluentValidation;
using AwsQuest.Application.Dtos.Challenge;

public class SubmitReflectionAnswerRequestDtoValidator : AbstractValidator<SubmitReflectionAnswerRequestDto>
{
    public SubmitReflectionAnswerRequestDtoValidator()
    {
        RuleFor(x => x.SelectedOptionId)
            .NotEmpty().WithMessage("Debe seleccionar una opción válida para responder al checkpoint de reflexión.")
            .MaximumLength(50).WithMessage("El identificador de la opción no debe exceder 50 caracteres.");
    }
}
