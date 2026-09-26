namespace AwsQuest.UnitTests.Seeding;

using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence.Seeding;
using FluentAssertions;
using Xunit;

public class DictionaryCurriculumTests
{
    private static string FindContentDirectory()
    {
        var current = AppContext.BaseDirectory;
        while (!string.IsNullOrEmpty(current))
        {
            var candidate = Path.Combine(current, "content");
            if (Directory.Exists(candidate) && File.Exists(Path.Combine(candidate, "system-config.json")))
            {
                return candidate;
            }
            var parent = Directory.GetParent(current);
            if (parent == null) break;
            current = parent.FullName;
        }
        return Path.Combine(AppContext.BaseDirectory, "content");
    }

    [Fact]
    public async Task DictionaryCurriculum_ShouldContainAtLeast75Terms_WithStrictIntegrity()
    {
        // Arrange
        var reader = new DictionaryContentReader();
        var contentDir = FindContentDirectory();

        // Act
        var package = await reader.ReadDictionaryAsync(contentDir);

        // Assert
        package.Should().NotBeNull();
        package.Terms.Should().NotBeNull();
        package.Terms.Count.Should().BeGreaterThanOrEqualTo(75, "el currículo de AWS Quest debe contar con al menos 75 términos curados");

        var slugs = new HashSet<string>();
        var titles = new HashSet<string>();
        var orders = new HashSet<int>();

        foreach (var term in package.Terms)
        {
            // 1. Unicidad
            slugs.Add(term.Slug).Should().BeTrue($"el slug '{term.Slug}' no debe estar duplicado");
            titles.Add(term.Title).Should().BeTrue($"el título '{term.Title}' no debe estar duplicado");
            orders.Add(term.DisplayOrder).Should().BeTrue($"el displayOrder '{term.DisplayOrder}' debe ser único");

            // 2. Campos obligatorios no vacíos
            term.Slug.Should().NotBeNullOrWhiteSpace();
            term.Title.Should().NotBeNullOrWhiteSpace();
            term.Category.Should().NotBeNullOrWhiteSpace();
            term.ShortDefinition.Should().NotBeNullOrWhiteSpace();
            term.WhatIs.Should().NotBeNullOrWhiteSpace();
            term.WhenToUse.Should().NotBeNull();
            term.WhenToUse.Count.Should().BeGreaterThanOrEqualTo(2, $"el término '{term.Slug}' debe tener al menos 2 casos de uso");
            term.TradeOffs.Should().NotBeNull();
            term.TradeOffs.Pros.Should().NotBeNullOrWhiteSpace($"el término '{term.Slug}' debe tener pros");
            term.TradeOffs.Cons.Should().NotBeNullOrWhiteSpace($"el término '{term.Slug}' debe tener cons");

            // 3. Validez de Pilares WAF
            term.Pillar.HasValue.Should().BeTrue($"el término '{term.Slug}' debe tener un pilar asignado");
            Enum.IsDefined(typeof(WellArchitectedPillar), term.Pillar!.Value)
                .Should().BeTrue($"el pilar '{term.Pillar}' en el término '{term.Slug}' debe ser un pilar válido del WAF");
        }

        // 4. Integridad del Grafo de Conocimiento (Cero Enlaces Rotos)
        foreach (var term in package.Terms)
        {
            if (term.RelatedTermSlugs != null)
            {
                foreach (var relSlug in term.RelatedTermSlugs)
                {
                    slugs.Should().Contain(relSlug, $"el término '{term.Slug}' referencia a '{relSlug}' que debe existir en el catálogo");
                }
            }
        }
    }

    [Fact]
    public async Task DictionaryCurriculum_ShouldCoverAllFourCoreCategories()
    {
        // Arrange
        var reader = new DictionaryContentReader();
        var contentDir = FindContentDirectory();

        // Act
        var package = await reader.ReadDictionaryAsync(contentDir);

        // Assert
        var serviceCount = package.Terms.Count(t => t.Category == "service");
        var conceptCount = package.Terms.Count(t => t.Category == "concept");
        var infraCount = package.Terms.Count(t => t.Category == "infrastructure");
        var wafCount = package.Terms.Count(t => t.Category == "well-architected");

        serviceCount.Should().BeGreaterThanOrEqualTo(30, "deben existir al menos 30 servicios de AWS");
        conceptCount.Should().BeGreaterThanOrEqualTo(20, "deben existir al menos 20 conceptos de arquitectura");
        infraCount.Should().BeGreaterThanOrEqualTo(10, "deben existir al menos 10 componentes de infraestructura");
        wafCount.Should().Be(6, "deben existir exactamente los 6 pilares de Well-Architected Framework");
    }
}
