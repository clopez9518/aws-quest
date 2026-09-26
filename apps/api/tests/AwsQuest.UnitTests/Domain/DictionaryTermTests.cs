namespace AwsQuest.UnitTests.Domain;

using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using FluentAssertions;
using Xunit;

public class DictionaryTermTests
{
    [Fact]
    public void DictionaryTerm_Instantiation_ShouldHaveValidDefaultValues()
    {
        // Act
        var term = new DictionaryTerm
        {
            Slug = "amazon-ec2",
            Title = "Amazon EC2",
            Category = "service",
            ServiceCode = "AWS_EC2",
            Pillar = WellArchitectedPillar.CostOptimization,
            ShortDefinition = "Servidores virtuales elásticos",
            WhatIs = "Explicación detallada...",
            WhenToUse = ["Cargas monolíticas", "Procesamiento por lotes"],
            TradeOffs = new DictionaryTradeOffs
            {
                Pros = "Control total",
                Cons = "Mantenimiento del SO"
            },
            RelatedTermSlugs = ["amazon-ebs", "auto-scaling-group"],
            AssociatedChallengeIds = ["ch-ec2-single-instance"]
        };

        // Assert
        term.Slug.Should().Be("amazon-ec2");
        term.Title.Should().Be("Amazon EC2");
        term.Category.Should().Be("service");
        term.ServiceCode.Should().Be("AWS_EC2");
        term.Pillar.Should().Be(WellArchitectedPillar.CostOptimization);
        term.WhenToUse.Should().HaveCount(2);
        term.TradeOffs.Pros.Should().Be("Control total");
        term.TradeOffs.Cons.Should().Be("Mantenimiento del SO");
        term.RelatedTermSlugs.Should().Contain("amazon-ebs");
        term.AssociatedChallengeIds.Should().Contain("ch-ec2-single-instance");
        term.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }
}
