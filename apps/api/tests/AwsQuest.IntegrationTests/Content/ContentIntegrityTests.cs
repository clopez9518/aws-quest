namespace AwsQuest.IntegrationTests.Content;

using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence.Seeding;
using FluentAssertions;
using Xunit;

public class ContentIntegrityTests
{
    private readonly string _contentPath;
    private readonly JsonChallengeContentReader _reader;

    public ContentIntegrityTests()
    {
        // Ruta canónica hacia content/ en la raíz del repositorio
        _contentPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../../../content"));
        if (!Directory.Exists(_contentPath))
        {
            _contentPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "../../../../../content"));
        }
        if (!Directory.Exists(_contentPath))
        {
            _contentPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "content"));
        }

        _reader = new JsonChallengeContentReader();
    }

    [Fact]
    public async Task ContentReader_ShouldLoadComplete12UnitsAnd49ChallengesCurriculum()
    {
        // Act
        var package = await _reader.ReadContentAsync(_contentPath);

        // Assert
        package.Should().NotBeNull();
        package.SystemConfig.Should().NotBeNull();
        package.SystemConfig.AccessMode.Should().Be(AccessMode.OpenAccess);

        // Servicios Maestros
        package.Services.Should().HaveCount(32);
        package.Services.Select(s => s.Code).Should().Contain(["AWS_ALB", "AWS_EC2", "AWS_RDS", "AWS_S3", "AWS_CLOUDFRONT", "AWS_DYNAMODB", "AWS_EBS", "AWS_EFS", "AWS_SECRETS_MANAGER", "AWS_LAMBDA", "AWS_APIGATEWAY", "AWS_SQS", "AWS_SNS", "AWS_EVENTBRIDGE", "AWS_ROUTE53", "AWS_WAF", "AWS_ECS", "AWS_ECR", "AWS_FARGATE", "AWS_CLOUDTRAIL", "AWS_CLOUDFORMATION", "AWS_CLOUDWATCH"]);

        // 12 Unidades Temáticas
        package.Units.Should().HaveCount(12);
        package.Units.Select(u => u.OrderIndex).Should().BeEquivalentTo([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

        // 49 Desafíos en total a lo largo de las 12 unidades
        var allChallenges = package.Units.SelectMany(u => u.Challenges).ToList();
        allChallenges.Should().HaveCount(49);

        foreach (var unit in package.Units)
        {
            unit.Title.Should().NotBeNullOrWhiteSpace();
            unit.Description.Should().NotBeNullOrWhiteSpace();
            unit.Challenges.Should().HaveCountGreaterThanOrEqualTo(3, $"la unidad '{unit.Title}' debe contener al menos 3 desafíos");
        }
    }

    [Fact]
    public async Task ContentReader_AllChallenges_ShouldHaveValidReferentialIntegrityAgainstMasterCatalog()
    {
        // Act
        var package = await _reader.ReadContentAsync(_contentPath);
        var validServiceCodes = package.Services.Select(s => s.Code).ToHashSet();

        // Assert
        foreach (var unit in package.Units)
        {
            foreach (var challenge in unit.Challenges)
            {
                challenge.Title.Should().NotBeNullOrWhiteSpace();
                challenge.Description.Should().NotBeNullOrWhiteSpace();
                challenge.BaseXP.Should().BeGreaterThan(0);
                challenge.EvaluationRules.PassingScoreThreshold.Should().Be(70);

                // Validar AllowedServices
                foreach (var allowed in challenge.AllowedServices)
                {
                    validServiceCodes.Should().Contain(allowed.ServiceCode,
                        $"el servicio permitido '{allowed.ServiceCode}' en desafío '{challenge.Title}' debe existir en aws-services.json");
                }

                // Validar RequiredServices
                foreach (var required in challenge.EvaluationRules.RequiredServices)
                {
                    validServiceCodes.Should().Contain(required,
                        $"el servicio requerido '{required}' en desafío '{challenge.Title}' debe existir en aws-services.json");
                }

                // Validar RequiredConnections
                foreach (var conn in challenge.EvaluationRules.RequiredConnections)
                {
                    validServiceCodes.Should().Contain(conn.FromServiceCode);
                    validServiceCodes.Should().Contain(conn.ToServiceCode);
                    conn.PenaltyIfMissing.Should().BeGreaterThan(0);
                }

                // Validar ForbiddenConnections
                foreach (var forbidden in challenge.EvaluationRules.ForbiddenConnections)
                {
                    validServiceCodes.Should().Contain(forbidden.FromServiceCode);
                    validServiceCodes.Should().Contain(forbidden.ToServiceCode);
                    forbidden.Penalty.Should().BeGreaterThan(0);
                }

                // Validar Hints (4 pistas socráticas progresivas)
                challenge.Hints.Should().HaveCountGreaterThanOrEqualTo(3, $"el desafío '{challenge.Title}' debe tener al menos 3 pistas");
                for (int i = 0; i < challenge.Hints.Count; i++)
                {
                    var hint = challenge.Hints[i];
                    hint.OrderIndex.Should().Be(i + 1, "los índices de las pistas deben ser consecutivos empezando en 1");
                    hint.Text.Should().NotBeNullOrWhiteSpace();
                    hint.PenaltyPoints.Should().BeGreaterThan(0);
                }
            }
        }
    }

    [Fact]
    public async Task ContentReader_RepairChallenges_ShouldContainValidInitialGraphs()
    {
        // Act
        var package = await _reader.ReadContentAsync(_contentPath);
        var repairChallenges = package.Units.SelectMany(u => u.Challenges)
            .Where(c => c.Mode == "REPAIR")
            .ToList();

        // Desafíos 403, 501, 505, 605, 704, 903, 1103 y 1203 son de tipo REPAIR
        repairChallenges.Should().HaveCount(8);

        foreach (var challenge in repairChallenges)
        {
            challenge.AllowedServices.Should().NotBeEmpty();
            challenge.InitialGraph.Should().NotBeNull($"el desafío de reparación '{challenge.Title}' debe tener InitialGraph");
            challenge.InitialGraph!.Components.Should().NotBeEmpty();
            challenge.EvaluationRules.Should().NotBeNull();
            challenge.EvaluationRules.RequiredServices.Should().NotBeEmpty();
        }
    }
}
