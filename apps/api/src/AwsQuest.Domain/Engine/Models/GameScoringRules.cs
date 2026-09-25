namespace AwsQuest.Domain.Engine.Models;

public static class GameScoringRules
{
    public const int DefaultPassingThreshold = 70;
    public const int XpPerLevel = 150;

    /// <summary>
    /// Calcula la experiencia (XP) ganada sin re-farmeo (RN-10).
    /// XP = floor((NewScore - PreviousHighScore) * (BaseXP / 100))
    /// </summary>
    public static int CalculateEarnedXp(int newScore, int previousHighScore, int baseXP)
    {
        if (newScore <= previousHighScore || newScore < DefaultPassingThreshold)
        {
            return 0;
        }

        var scoreDelta = newScore - previousHighScore;
        var earnedXp = (int)Math.Floor(scoreDelta * (baseXP / 100.0));
        return Math.Max(0, earnedXp);
    }

    /// <summary>
    /// Calcula el nivel de usuario a partir del XP total acumulado:
    /// Nivel = 1 + floor(TotalXP / 150)
    /// </summary>
    public static int CalculateLevel(int totalXp)
    {
        if (totalXp <= 0) return 1;
        return 1 + (totalXp / XpPerLevel);
    }
}
