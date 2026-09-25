namespace AwsQuest.Application.Common.Exceptions;

public class ChallengeNotFoundException : Exception
{
    public ChallengeNotFoundException(Guid challengeId) 
        : base($"No se encontró el desafío con identificador '{challengeId}'.")
    {
    }
}

public class ChallengeLockedException : Exception
{
    public ChallengeLockedException(string lockReason) 
        : base(lockReason)
    {
    }
}
