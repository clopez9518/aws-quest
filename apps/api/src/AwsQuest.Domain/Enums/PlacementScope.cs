namespace AwsQuest.Domain.Enums;

public enum PlacementScope
{
    RegionalGlobal = 1,
    SubnetRequired = 2,
    VpcOptional = 3,
    VpcRoot = 4,
    VpcAttached = 5
}
