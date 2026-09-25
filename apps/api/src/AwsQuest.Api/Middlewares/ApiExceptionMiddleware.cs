namespace AwsQuest.Api.Middlewares;

using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using FluentValidation;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Application.Common.Models;
using AwsQuest.Domain.Exceptions;

public class ApiExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiExceptionMiddleware> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, errorCode, message, details) = exception switch
        {
            ValidationException validationEx => (
                HttpStatusCode.BadRequest,
                ErrorCodes.ValidationError,
                "Se encontraron errores de validación en la solicitud.",
                (object)validationEx.Errors.Select(e => new ValidationErrorDetail
                {
                    Field = e.PropertyName,
                    Message = e.ErrorMessage,
                    AttemptedValue = e.AttemptedValue
                }).ToList()
            ),
            DuplicateEmailException dupEx => (
                HttpStatusCode.Conflict,
                ErrorCodes.EmailAlreadyExists,
                dupEx.Message,
                null
            ),
            InvalidCredentialsException credEx => (
                HttpStatusCode.Unauthorized,
                ErrorCodes.InvalidCredentials,
                credEx.Message,
                null
            ),
            UserNotFoundException userNotFoundEx => (
                HttpStatusCode.NotFound,
                ErrorCodes.UserNotFound,
                userNotFoundEx.Message,
                null
            ),
            ChallengeNotFoundException challengeNotFoundEx => (
                HttpStatusCode.NotFound,
                ErrorCodes.ChallengeNotFound,
                challengeNotFoundEx.Message,
                null
            ),
            ChallengeLockedException challengeLockedEx => (
                HttpStatusCode.Forbidden,
                ErrorCodes.ChallengeLocked,
                challengeLockedEx.Message,
                null
            ),
            AllHintsUnlockedException allHintsEx => (
                HttpStatusCode.BadRequest,
                ErrorCodes.AllHintsUnlocked,
                allHintsEx.Message,
                null
            ),
            InvalidGraphException graphEx => (
                HttpStatusCode.BadRequest,
                ErrorCodes.InvalidGraphPayload,
                graphEx.Message,
                null
            ),
            ServiceLimitExceededException limitEx => (
                HttpStatusCode.BadRequest,
                ErrorCodes.ServiceLimitExceeded,
                limitEx.Message,
                null
            ),
            DomainException domainEx => (
                HttpStatusCode.BadRequest,
                ErrorCodes.ValidationError,
                domainEx.Message,
                null
            ),
            BadHttpRequestException => (
                HttpStatusCode.BadRequest,
                ErrorCodes.ValidationError,
                "Formato de solicitud HTTP no válido o JSON mal formado.",
                null
            ),
            JsonException => (
                HttpStatusCode.BadRequest,
                ErrorCodes.ValidationError,
                "Error al procesar el cuerpo JSON de la solicitud.",
                null
            ),
            _ => (
                HttpStatusCode.InternalServerError,
                ErrorCodes.InternalServerError,
                "Ha ocurrido un error interno no controlado en el servidor.",
                null
            )
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Error no controlado en el servidor: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning("Excepción de aplicación controlada ({ErrorCode}): {Message}", errorCode, exception.Message);
        }

        context.Response.StatusCode = (int)statusCode;

        var errorResponse = new ApiErrorResponse
        {
            Success = false,
            Error = new ApiErrorDetails
            {
                Code = errorCode,
                Message = message,
                Details = details
            }
        };

        var json = JsonSerializer.Serialize(errorResponse, JsonOptions);
        await context.Response.WriteAsync(json);
    }
}
