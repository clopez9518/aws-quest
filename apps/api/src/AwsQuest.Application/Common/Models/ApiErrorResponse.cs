namespace AwsQuest.Application.Common.Models;

public class ApiErrorResponse
{
    public bool Success { get; init; } = false;
    public ApiErrorDetails Error { get; init; } = new();

    public static ApiErrorResponse Create(string code, string message, object? details = null) => new()
    {
        Success = false,
        Error = new ApiErrorDetails
        {
            Code = code,
            Message = message,
            Details = details
        }
    };
}

public class ApiErrorDetails
{
    public string Code { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public object? Details { get; init; }
}

public class ValidationErrorDetail
{
    public string Field { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public object? AttemptedValue { get; init; }
}
