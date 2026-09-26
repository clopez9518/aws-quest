namespace AwsQuest.UnitTests.Services;

using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using AwsQuest.Application.Dtos.Dictionary;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;
using Xunit;

public class DictionaryServiceTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static async Task SeedSampleTermsAsync(AppDbContext context)
    {
        var challenge1 = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Desafío EC2 Single Instance",
            Description = "Despliega una instancia EC2",
            Difficulty = DifficultyLevel.Easy,
            BaseXP = 100,
            EvaluationRulesJson = "{}",
            HintsJson = "[]"
        };

        var challenge2 = new Challenge
        {
            Id = Guid.NewGuid(),
            Title = "Desafío S3 Static Hosting",
            Description = "Aloja un sitio estático en S3",
            Difficulty = DifficultyLevel.Intermediate,
            BaseXP = 200,
            EvaluationRulesJson = "{}",
            HintsJson = "[]"
        };

        context.Challenges.AddRange(challenge1, challenge2);

        var terms = new List<DictionaryTerm>
        {
            new()
            {
                Slug = "amazon-ec2",
                Title = "Amazon EC2",
                Category = "service",
                ServiceCode = "AWS_EC2",
                Pillar = WellArchitectedPillar.CostOptimization,
                ShortDefinition = "Servidores virtuales elásticos en la nube",
                WhatIs = "Amazon EC2 proporciona capacidad informática escalable...",
                WhenToUse = ["Cargas monolíticas", "Procesamiento por lotes"],
                TradeOffs = new DictionaryTradeOffs { Pros = "Control total", Cons = "Mantenimiento SO" },
                RelatedTermSlugs = ["amazon-ebs", "escalabilidad-horizontal"],
                AssociatedChallengeIds = [challenge1.Id.ToString()],
                DisplayOrder = 1
            },
            new()
            {
                Slug = "amazon-ebs",
                Title = "Amazon EBS",
                Category = "service",
                ServiceCode = "AWS_EBS",
                Pillar = WellArchitectedPillar.Reliability,
                ShortDefinition = "Almacenamiento de bloques de alto rendimiento para EC2",
                WhatIs = "Amazon Elastic Block Store proporciona volúmenes de almacenamiento...",
                WhenToUse = ["Sistemas de archivos de SO", "Bases de datos relacionales"],
                TradeOffs = new DictionaryTradeOffs { Pros = "Baja latencia", Cons = "Atado a una única AZ" },
                RelatedTermSlugs = ["amazon-ec2"],
                AssociatedChallengeIds = [],
                DisplayOrder = 2
            },
            new()
            {
                Slug = "amazon-s3",
                Title = "Amazon S3",
                Category = "service",
                ServiceCode = "AWS_S3",
                Pillar = WellArchitectedPillar.Reliability,
                ShortDefinition = "Almacenamiento de objetos escalable con 11 9s de durabilidad",
                WhatIs = "Amazon S3 es un servicio de almacenamiento de objetos...",
                WhenToUse = ["Archivos estáticos", "Data Lakes"],
                TradeOffs = new DictionaryTradeOffs { Pros = "Durabilidad masiva", Cons = "No es POSIX" },
                RelatedTermSlugs = ["caching-perimetral"],
                AssociatedChallengeIds = [challenge2.Id.ToString()],
                DisplayOrder = 3
            },
            new()
            {
                Slug = "escalabilidad-horizontal",
                Title = "Escalabilidad Horizontal",
                Category = "concept",
                ServiceCode = null,
                Pillar = WellArchitectedPillar.PerformanceEfficiency,
                ShortDefinition = "Añadir más nodos en paralelo para distribuir la carga",
                WhatIs = "Consiste en agregar más instancias para escalar...",
                WhenToUse = ["Sistemas stateless"],
                TradeOffs = new DictionaryTradeOffs { Pros = "Crecimiento sin techo", Cons = "Requiere balanceador" },
                RelatedTermSlugs = ["amazon-ec2"],
                AssociatedChallengeIds = [],
                DisplayOrder = 10
            },
            new()
            {
                Slug = "seguridad-cloud",
                Title = "Pilar de Seguridad Cloud",
                Category = "well-architected",
                ServiceCode = null,
                Pillar = WellArchitectedPillar.Security,
                ShortDefinition = "Protección de datos y sistemas en la nube",
                WhatIs = "Abarca la protección integral...",
                WhenToUse = ["Diseño de VPCs", "Mínimo privilegio"],
                TradeOffs = new DictionaryTradeOffs { Pros = "Protección integral", Cons = "Requiere gobernanza" },
                RelatedTermSlugs = [],
                AssociatedChallengeIds = [],
                DisplayOrder = 50
            }
        };

        context.DictionaryTerms.AddRange(terms);
        await context.SaveChangesAsync();
    }

    [Fact]
    public async Task GetTermsAsync_WithoutFilter_ReturnsAllTermsOrderedByDisplayOrderAndTitle()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        await SeedSampleTermsAsync(context);
        var service = new DictionaryService(context);

        // Act
        var result = await service.GetTermsAsync(new DictionaryFilterParams());

        // Assert
        result.Should().HaveCount(5);
        result[0].Slug.Should().Be("amazon-ec2");
        result[1].Slug.Should().Be("amazon-ebs");
        result[2].Slug.Should().Be("amazon-s3");
    }

    [Fact]
    public async Task GetTermsAsync_WithSearchQuery_ReturnsMatchingTerms()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        await SeedSampleTermsAsync(context);
        var service = new DictionaryService(context);

        // Act
        var result = await service.GetTermsAsync(new DictionaryFilterParams(Search: "bloques"));

        // Assert
        result.Should().HaveCount(1);
        result[0].Slug.Should().Be("amazon-ebs");
    }

    [Fact]
    public async Task GetTermsAsync_WithCategoryFilter_ReturnsTermsInThatCategory()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        await SeedSampleTermsAsync(context);
        var service = new DictionaryService(context);

        // Act
        var result = await service.GetTermsAsync(new DictionaryFilterParams(Category: "concept"));

        // Assert
        result.Should().HaveCount(1);
        result[0].Slug.Should().Be("escalabilidad-horizontal");
    }

    [Fact]
    public async Task GetTermsAsync_WithPillarFilter_ReturnsTermsAssociatedWithPillar()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        await SeedSampleTermsAsync(context);
        var service = new DictionaryService(context);

        // Act
        var result = await service.GetTermsAsync(new DictionaryFilterParams(Pillar: WellArchitectedPillar.Reliability));

        // Assert
        result.Should().HaveCount(2);
        result.Select(r => r.Slug).Should().Contain(["amazon-ebs", "amazon-s3"]);
    }

    [Fact]
    public async Task GetTermBySlugAsync_ExistingSlug_ResolvesGraphAndAssociatedChallenges()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        await SeedSampleTermsAsync(context);
        var service = new DictionaryService(context);

        // Act
        var result = await service.GetTermBySlugAsync("amazon-ec2");

        // Assert
        result.Should().NotBeNull();
        result!.Slug.Should().Be("amazon-ec2");
        result.Title.Should().Be("Amazon EC2");
        result.WhenToUse.Should().HaveCount(2);
        result.TradeOffs.Pros.Should().Be("Control total");
        
        // Relaciones resueltas
        result.RelatedTerms.Should().HaveCount(2);
        result.RelatedTerms.Select(r => r.Slug).Should().Contain(["amazon-ebs", "escalabilidad-horizontal"]);
        var ebsRelated = result.RelatedTerms.First(r => r.Slug == "amazon-ebs");
        ebsRelated.Title.Should().Be("Amazon EBS");
        ebsRelated.ServiceCode.Should().Be("AWS_EBS");

        // Desafíos resueltos
        result.AssociatedChallenges.Should().HaveCount(1);
        result.AssociatedChallenges[0].Title.Should().Be("Desafío EC2 Single Instance");
        result.AssociatedChallenges[0].BaseXP.Should().Be(100);
    }

    [Fact]
    public async Task GetTermBySlugAsync_NonExistentSlug_ReturnsNull()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        await SeedSampleTermsAsync(context);
        var service = new DictionaryService(context);

        // Act
        var result = await service.GetTermBySlugAsync("inexistente-slug");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetCategoriesSummaryAsync_ReturnsAggregatedCountsAndFormattedLabels()
    {
        // Arrange
        await using var context = CreateInMemoryDbContext();
        await SeedSampleTermsAsync(context);
        var service = new DictionaryService(context);

        // Act
        var result = await service.GetCategoriesSummaryAsync();

        // Assert
        result.Should().HaveCount(3);
        var serviceCategory = result.FirstOrDefault(c => c.Category == "service");
        serviceCategory.Should().NotBeNull();
        serviceCategory!.Count.Should().Be(3);
        serviceCategory.Label.Should().Be("Servicios AWS");

        var conceptCategory = result.FirstOrDefault(c => c.Category == "concept");
        conceptCategory.Should().NotBeNull();
        conceptCategory!.Count.Should().Be(1);
        conceptCategory.Label.Should().Be("Conceptos Cloud");
    }
}
