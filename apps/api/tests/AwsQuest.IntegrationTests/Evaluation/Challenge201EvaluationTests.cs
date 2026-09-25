namespace AwsQuest.IntegrationTests.Evaluation;

using AwsQuest.Application.Dtos.Evaluation;
using AwsQuest.Domain.Engine;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;
using AwsQuest.IntegrationTests.Infrastructure;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

public class Challenge201EvaluationTests : IntegrationTestBase
{
    public Challenge201EvaluationTests(TestDatabaseFixture fixture) : base(fixture)
    {
    }

    [Fact]
    public async Task Evaluate_Challenge201_WithOnlyRds_ShouldFailAndNotReturn100()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // 1. Find challenge-201
        var challenge = await context.Challenges.FirstOrDefaultAsync(c => c.Title.Contains("Aplicación Web"));
        challenge.Should().NotBeNull();

        // 2. Evaluate with only RDS
        var engine = new EvaluationEngine();
        var service = new EvaluationService(context, engine);

        // Create a dedicated test user
        var user = new AwsQuest.Domain.Entities.User
        {
            Id = Guid.NewGuid(),
            Name = $"Test User {Guid.NewGuid():N}",
            Email = $"test-{Guid.NewGuid():N}@example.com",
            PasswordHash = "hash",
            IsGuest = true
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var request = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent
                    {
                        Id = "rds-node-1",
                        ServiceCode = "AWS_RDS",
                        Config = new ComponentConfig { IsMultiAz = false, IsPublic = false }
                    }
                ],
                Connections = []
            },
            HintsUsed = 0
        };

        var result = await service.EvaluateArchitectureAsync(challenge!.Id, user.Id, request);

        result.Passed.Should().BeFalse();
        result.Score.Should().BeLessThan(70);
    }
}
