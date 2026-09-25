namespace AwsQuest.Application.Common.Models;

public static class ErrorCodes
{
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string ChallengeNotFound = "CHALLENGE_NOT_FOUND";
    public const string ChallengeLocked = "CHALLENGE_LOCKED";
    public const string InvalidGraphPayload = "INVALID_GRAPH_PAYLOAD";
    public const string ServiceLimitExceeded = "SERVICE_LIMIT_EXCEEDED";
    public const string AllHintsUnlocked = "ALL_HINTS_UNLOCKED";
    public const string EmailAlreadyExists = "EMAIL_ALREADY_EXISTS";
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string ValidationError = "VALIDATION_ERROR";
    public const string InternalServerError = "INTERNAL_SERVER_ERROR";
}
