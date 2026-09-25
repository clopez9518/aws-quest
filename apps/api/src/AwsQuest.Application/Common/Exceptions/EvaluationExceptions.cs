namespace AwsQuest.Application.Common.Exceptions;

public class AllHintsUnlockedException : Exception
{
    public AllHintsUnlockedException() 
        : base("Se han desbloqueado todas las pistas disponibles para este desafío.")
    {
    }
}
