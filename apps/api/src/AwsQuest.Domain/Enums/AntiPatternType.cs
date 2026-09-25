namespace AwsQuest.Domain.Enums;

public enum AntiPatternType
{
    SinglePointOfFailure = 1,
    PublicDatabaseExposure = 2,
    MissingMultiAz = 3,
    DirectInternetToCompute = 4,
    MissingAutoScaling = 5,
    MissingLoadBalancer = 6,
    UnusedService = 7,
    InvalidDataFlow = 8
}
