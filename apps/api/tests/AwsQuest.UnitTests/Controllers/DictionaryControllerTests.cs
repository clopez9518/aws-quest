namespace AwsQuest.UnitTests.Controllers;

using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using FluentAssertions;
using AwsQuest.Api.Controllers;
using AwsQuest.Application.Common.Interfaces;
using AwsQuest.Application.Common.Models;
using AwsQuest.Application.Dtos.Dictionary;
using AwsQuest.Domain.Enums;
using Xunit;

public class DictionaryControllerTests
{
    private readonly IDictionaryService _dictionaryService = Substitute.For<IDictionaryService>();

    [Fact]
    public async Task GetTerms_ReturnsOkWithApiResponse()
    {
        // Arrange
        var termsList = new List<DictionaryTermSummaryDto>
        {
            new("amazon-ec2", "Amazon EC2", "service", "AWS_EC2", WellArchitectedPillar.CostOptimization, "Def", 2, 3, 1)
        };

        _dictionaryService.GetTermsAsync(Arg.Any<DictionaryFilterParams>(), Arg.Any<CancellationToken>())
            .Returns(termsList);

        var controller = new DictionaryController(_dictionaryService);

        // Act
        var result = await controller.GetTerms(search: "ec2", category: "service", pillar: null);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ApiResponse<List<DictionaryTermSummaryDto>>>().Subject;
        response.Success.Should().BeTrue();
        response.Data.Should().HaveCount(1);
        response.Data![0].Slug.Should().Be("amazon-ec2");
    }

    [Fact]
    public async Task GetTermBySlug_WhenFound_ReturnsOkWithDetail()
    {
        // Arrange
        var detail = new DictionaryTermDetailDto(
            Slug: "amazon-s3",
            Title: "Amazon S3",
            Category: "service",
            ServiceCode: "AWS_S3",
            Pillar: WellArchitectedPillar.Reliability,
            ShortDefinition: "Storage",
            WhatIs: "Full desc",
            WhenToUse: ["Static assets"],
            TradeOffs: new DictionaryTradeOffsDto("High durability", "Not POSIX"),
            RelatedTerms: [],
            AssociatedChallenges: [],
            DisplayOrder: 2
        );

        _dictionaryService.GetTermBySlugAsync("amazon-s3", Arg.Any<CancellationToken>())
            .Returns(detail);

        var controller = new DictionaryController(_dictionaryService);

        // Act
        var result = await controller.GetTermBySlug("amazon-s3");

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ApiResponse<DictionaryTermDetailDto>>().Subject;
        response.Success.Should().BeTrue();
        response.Data!.Slug.Should().Be("amazon-s3");
    }

    [Fact]
    public async Task GetTermBySlug_WhenNotFound_ReturnsNotFoundWithFailureResponse()
    {
        // Arrange
        _dictionaryService.GetTermBySlugAsync("unknown-slug", Arg.Any<CancellationToken>())
            .Returns((DictionaryTermDetailDto?)null);

        var controller = new DictionaryController(_dictionaryService);

        // Act
        var result = await controller.GetTermBySlug("unknown-slug");

        // Assert
        var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
        var response = notFoundResult.Value.Should().BeOfType<ApiErrorResponse>().Subject;
        response.Success.Should().BeFalse();
        response.Error.Message.Should().Contain("unknown-slug");
    }

    [Fact]
    public async Task GetCategories_ReturnsOkWithCategoryList()
    {
        // Arrange
        var categories = new List<DictionaryCategoryCountDto>
        {
            new("service", 15, "Servicios AWS"),
            new("concept", 8, "Conceptos Cloud")
        };

        _dictionaryService.GetCategoriesSummaryAsync(Arg.Any<CancellationToken>())
            .Returns(categories);

        var controller = new DictionaryController(_dictionaryService);

        // Act
        var result = await controller.GetCategories();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ApiResponse<List<DictionaryCategoryCountDto>>>().Subject;
        response.Success.Should().BeTrue();
        response.Data.Should().HaveCount(2);
        response.Data![0].Category.Should().Be("service");
    }
}
