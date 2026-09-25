namespace AwsQuest.Domain.Entities;

public class ChallengeService
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ChallengeId { get; set; }
    public Guid ServiceId { get; set; }
    public int? MaxInstances { get; set; }
    public bool IsDistractor { get; set; } = false;

    public Challenge Challenge { get; set; } = null!;
    public AwsService Service { get; set; } = null!;
}
