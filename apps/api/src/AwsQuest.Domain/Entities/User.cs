namespace AwsQuest.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Email { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public bool IsGuest { get; set; } = false;
    public int TotalXP { get; set; } = 0;
    public int Level { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserProgress> Progress { get; set; } = new List<UserProgress>();
}
