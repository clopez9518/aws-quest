namespace AwsQuest.UnitTests.Services;

using Microsoft.EntityFrameworkCore;
using FluentAssertions;
using AwsQuest.Domain.Entities;
using AwsQuest.Domain.Enums;
using AwsQuest.Infrastructure.Persistence;
using AwsQuest.Infrastructure.Services;

public class MasterServicesServiceTests
{
    private static AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetServicesAsync_WithoutFilter_ReturnsAllActiveServicesOrderedByCategoryAndName()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();

        var s3 = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_S3",
            Name = "Amazon S3",
            Category = "Storage",
            ShortDescription = "Almacenamiento escalable",
            IconUrl = "/icons/s3.svg",
            IsActive = true
        };

        var ec2 = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_EC2",
            Name = "Amazon EC2",
            Category = "Compute",
            ShortDescription = "Cómputo en la nube",
            IconUrl = "/icons/ec2.svg",
            IsActive = true
        };

        var lambda = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_LAMBDA",
            Name = "AWS Lambda",
            Category = "Compute",
            ShortDescription = "Cómputo serverless",
            IconUrl = "/icons/lambda.svg",
            IsActive = true
        };

        var inactiveService = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_INACTIVE",
            Name = "Inactive Service",
            Category = "Compute",
            IsActive = false
        };

        dbContext.AwsServices.AddRange(s3, ec2, lambda, inactiveService);
        await dbContext.SaveChangesAsync();

        var sut = new MasterServicesService(dbContext);

        // Act
        var result = await sut.GetServicesAsync();

        // Assert
        result.Should().HaveCount(3);
        result.Should().NotContain(s => s.Code == "AWS_INACTIVE");

        // Order: Category asc, Name asc
        // Compute (Amazon EC2, AWS Lambda), Storage (Amazon S3)
        result[0].Code.Should().Be("AWS_EC2");
        result[0].Kind.Should().Be(ResourceKind.ManagedService);
        result[0].PlacementScope.Should().Be(PlacementScope.RegionalGlobal);
        result[1].Code.Should().Be("AWS_LAMBDA");
        result[2].Code.Should().Be("AWS_S3");
    }

    [Fact]
    public async Task GetServicesAsync_WithCategoryFilter_ReturnsOnlyMatchingCategory()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();

        var s3 = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_S3",
            Name = "Amazon S3",
            Category = "Storage",
            IsActive = true
        };

        var ec2 = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_EC2",
            Name = "Amazon EC2",
            Category = "Compute",
            IsActive = true
        };

        dbContext.AwsServices.AddRange(s3, ec2);
        await dbContext.SaveChangesAsync();

        var sut = new MasterServicesService(dbContext);

        // Act
        var result = await sut.GetServicesAsync("Compute");

        // Assert
        result.Should().HaveCount(1);
        result[0].Code.Should().Be("AWS_EC2");
        result[0].Category.Should().Be("Compute");
    }

    [Fact]
    public async Task GetServicesAsync_WithCaseInsensitiveCategory_ReturnsMatchingCategory()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();

        var ec2 = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_EC2",
            Name = "Amazon EC2",
            Category = "Compute",
            IsActive = true
        };

        dbContext.AwsServices.Add(ec2);
        await dbContext.SaveChangesAsync();

        var sut = new MasterServicesService(dbContext);

        // Act
        var result = await sut.GetServicesAsync("cOmPuTe");

        // Assert
        result.Should().HaveCount(1);
        result[0].Code.Should().Be("AWS_EC2");
    }

    [Fact]
    public async Task GetServicesAsync_WithNonExistentCategory_ReturnsEmptyList()
    {
        // Arrange
        await using var dbContext = CreateInMemoryDbContext();

        var ec2 = new AwsService
        {
            Id = Guid.NewGuid(),
            Code = "AWS_EC2",
            Name = "Amazon EC2",
            Category = "Compute",
            IsActive = true
        };

        dbContext.AwsServices.Add(ec2);
        await dbContext.SaveChangesAsync();

        var sut = new MasterServicesService(dbContext);

        // Act
        var result = await sut.GetServicesAsync("Blockchain");

        // Assert
        result.Should().BeEmpty();
    }
}
