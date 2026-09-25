namespace AwsQuest.Domain.Exceptions;

public class ServiceLimitExceededException(string serviceCode, int maxInstances, int currentInstances)
    : DomainException($"El servicio '{serviceCode}' permite como máximo {maxInstances} instancia(s), pero se encontraron {currentInstances}.")
{
    public string ServiceCode { get; } = serviceCode;
    public int MaxInstances { get; } = maxInstances;
    public int CurrentInstances { get; } = currentInstances;
}
