namespace AwsQuest.UnitTests.Middlewares;

using System.IO;
using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using NSubstitute;
using AwsQuest.Api.Middlewares;
using AwsQuest.Application.Common.Exceptions;
using AwsQuest.Application.Common.Models;
using AwsQuest.Domain.Exceptions;

public class ApiExceptionMiddlewareTests
{
    private readonly ILogger<ApiExceptionMiddleware> _logger = Substitute.For<ILogger<ApiExceptionMiddleware>>();
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private static (HttpContext context, MemoryStream responseBodyStream) CreateHttpContext()
    {
        var context = new DefaultHttpContext();
        var responseBodyStream = new MemoryStream();
        context.Response.Body = responseBodyStream;
        return (context, responseBodyStream);
    }

    private static async Task<ApiErrorResponse?> ReadErrorResponseAsync(MemoryStream stream)
    {
        stream.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(stream);
        var json = await reader.ReadToEndAsync();
        return JsonSerializer.Deserialize<ApiErrorResponse>(json, JsonOptions);
    }

    [Fact]
    public async Task InvokeAsync_WhenNoExceptionOccurs_CallsNextDelegateSuccessfully()
    {
        // Arrange
        var (context, _) = CreateHttpContext();
        var nextCalled = false;
        RequestDelegate next = (ctx) =>
        {
            nextCalled = true;
            ctx.Response.StatusCode = StatusCodes.Status200OK;
            return Task.CompletedTask;
        };
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        nextCalled.Should().BeTrue();
        context.Response.StatusCode.Should().Be(StatusCodes.Status200OK);
    }

    [Fact]
    public async Task InvokeAsync_WhenValidationExceptionThrown_Returns400WithValidationErrorDetails()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        var failures = new List<ValidationFailure>
        {
            new("Email", "Email no válido") { AttemptedValue = "invalid" },
            new("Password", "Password requerida")
        };
        RequestDelegate next = (_) => throw new ValidationException(failures);
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        context.Response.ContentType.Should().Be("application/json");

        var response = await ReadErrorResponseAsync(stream);
        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Code.Should().Be(ErrorCodes.ValidationError);
        response.Error.Message.Should().Be("Se encontraron errores de validación en la solicitud.");
        response.Error.Details.Should().NotBeNull();
    }

    [Fact]
    public async Task InvokeAsync_WhenInvalidCredentialsExceptionThrown_Returns401WithInvalidCredentialsCode()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        RequestDelegate next = (_) => throw new InvalidCredentialsException();
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Unauthorized);
        var response = await ReadErrorResponseAsync(stream);
        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Code.Should().Be(ErrorCodes.InvalidCredentials);
        response.Error.Message.Should().Be("Las credenciales proporcionadas son incorrectas.");
    }

    [Fact]
    public async Task InvokeAsync_WhenChallengeLockedExceptionThrown_Returns403WithChallengeLockedCode()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        var reason = "El desafío está bloqueado en modo progresivo.";
        RequestDelegate next = (_) => throw new ChallengeLockedException(reason);
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Forbidden);
        var response = await ReadErrorResponseAsync(stream);
        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Code.Should().Be(ErrorCodes.ChallengeLocked);
        response.Error.Message.Should().Be(reason);
    }

    [Fact]
    public async Task InvokeAsync_WhenChallengeNotFoundExceptionThrown_Returns404WithChallengeNotFoundCode()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        var challengeId = Guid.NewGuid();
        RequestDelegate next = (_) => throw new ChallengeNotFoundException(challengeId);
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        var response = await ReadErrorResponseAsync(stream);
        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Code.Should().Be(ErrorCodes.ChallengeNotFound);
        response.Error.Message.Should().Contain(challengeId.ToString());
    }

    [Fact]
    public async Task InvokeAsync_WhenUserNotFoundExceptionThrown_Returns404WithUserNotFoundCode()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        var userId = Guid.NewGuid();
        RequestDelegate next = (_) => throw new UserNotFoundException(userId);
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
        var response = await ReadErrorResponseAsync(stream);
        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Code.Should().Be(ErrorCodes.UserNotFound);
        response.Error.Message.Should().Contain(userId.ToString());
    }

    [Fact]
    public async Task InvokeAsync_WhenDuplicateEmailExceptionThrown_Returns409WithEmailAlreadyExistsCode()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        RequestDelegate next = (_) => throw new DuplicateEmailException("existing@test.com");
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Conflict);
        var response = await ReadErrorResponseAsync(stream);
        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Code.Should().Be(ErrorCodes.EmailAlreadyExists);
        response.Error.Message.Should().Contain("existing@test.com");
    }

    [Fact]
    public async Task InvokeAsync_WhenAllHintsUnlockedExceptionThrown_Returns400WithAllHintsUnlockedCode()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        RequestDelegate next = (_) => throw new AllHintsUnlockedException();
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        var response = await ReadErrorResponseAsync(stream);
        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Code.Should().Be(ErrorCodes.AllHintsUnlocked);
        response.Error.Message.Should().Be("Se han desbloqueado todas las pistas disponibles para este desafío.");
    }

    [Fact]
    public async Task InvokeAsync_WhenInvalidGraphExceptionThrown_Returns400WithInvalidGraphPayloadCode()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        RequestDelegate next = (_) => throw new InvalidGraphException("El grafo no contiene componentes.");
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        var response = await ReadErrorResponseAsync(stream);
        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Code.Should().Be(ErrorCodes.InvalidGraphPayload);
        response.Error.Message.Should().Be("El grafo no contiene componentes.");
    }

    [Fact]
    public async Task InvokeAsync_WhenServiceLimitExceededExceptionThrown_Returns400WithServiceLimitExceededCode()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        RequestDelegate next = (_) => throw new ServiceLimitExceededException("s3", 3, 2);
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        var response = await ReadErrorResponseAsync(stream);
        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Code.Should().Be(ErrorCodes.ServiceLimitExceeded);
        response.Error.Message.Should().Contain("s3");
    }

    [Fact]
    public async Task InvokeAsync_WhenUnhandledExceptionThrown_Returns500WithInternalServerErrorCode()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        RequestDelegate next = (_) => throw new InvalidOperationException("Unexpected internal crash");
        var middleware = new ApiExceptionMiddleware(next, _logger);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        var response = await ReadErrorResponseAsync(stream);
        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Code.Should().Be(ErrorCodes.InternalServerError);
        response.Error.Message.Should().Be("Ha ocurrido un error interno no controlado en el servidor.");
        response.Error.Details.Should().BeNull();
    }
}
