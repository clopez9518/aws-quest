namespace AwsQuest.UnitTests.Validators;

using AwsQuest.Application.Dtos.Evaluation;
using AwsQuest.Application.Validators;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using FluentValidation.TestHelper;

public class EvaluateArchitectureRequestDtoValidatorTests
{
    private readonly EvaluateArchitectureRequestDtoValidator _validator = new();

    [Fact]
    public void Should_Pass_When_EvaluateArchitectureRequest_Is_Valid()
    {
        var model = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "node-1", ServiceCode = "AWS_ALB" },
                    new GraphComponent { Id = "node-2", ServiceCode = "AWS_EC2" }
                ],
                Connections =
                [
                    new GraphConnection { FromComponentId = "node-1", ToComponentId = "node-2", ConnectionType = "HTTP_HTTPS" }
                ]
            },
            HintsUsed = 1
        };

        var result = _validator.TestValidate(model);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Have_Error_When_Components_Is_Empty()
    {
        var model = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components = [],
                Connections = []
            },
            HintsUsed = 0
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Graph.Components);
    }

    [Fact]
    public void Should_Have_Error_When_Component_Has_Empty_Id_Or_ServiceCode()
    {
        var model = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "", ServiceCode = "AWS_EC2" },
                    new GraphComponent { Id = "node-2", ServiceCode = "" }
                ]
            }
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor("Graph.Components[0].Id");
        result.ShouldHaveValidationErrorFor("Graph.Components[1].ServiceCode");
    }

    [Fact]
    public void Should_Have_Error_When_Connection_References_Non_Existent_Component()
    {
        var model = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "node-1", ServiceCode = "AWS_EC2" }
                ],
                Connections =
                [
                    new GraphConnection { FromComponentId = "node-1", ToComponentId = "non-existent-node" }
                ]
            }
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Graph);
    }

    [Fact]
    public void Should_Have_Error_When_Connection_Is_Self_Referencing()
    {
        var model = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "node-1", ServiceCode = "AWS_EC2" }
                ],
                Connections =
                [
                    new GraphConnection { FromComponentId = "node-1", ToComponentId = "node-1" }
                ]
            }
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor("Graph.Connections[0]");
    }

    [Fact]
    public void Should_Have_Error_When_HintsUsed_Is_Negative()
    {
        var model = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "node-1", ServiceCode = "AWS_EC2" }
                ]
            },
            HintsUsed = -1
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.HintsUsed);
    }

    [Fact]
    public void Should_Pass_When_Hierarchy_Is_Valid()
    {
        var model = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" },
                    new GraphComponent { Id = "sub-1", ServiceCode = "NET_SUBNET", ParentId = "vpc-1" },
                    new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2", ParentId = "sub-1" }
                ]
            }
        };

        var result = _validator.TestValidate(model);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Have_Error_When_Parent_Component_Does_Not_Exist()
    {
        var model = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2", ParentId = "missing-sub" }
                ]
            }
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Graph)
            .WithErrorMessage("La jerarquía de contención (VPC / Subred) contiene referencias inválidas o ciclos circulares.");
    }

    [Fact]
    public void Should_Have_Error_When_Component_Is_Self_Parented()
    {
        var model = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC", ParentId = "vpc-1" }
                ]
            }
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Graph)
            .WithErrorMessage("La jerarquía de contención (VPC / Subred) contiene referencias inválidas o ciclos circulares.");
    }

    [Fact]
    public void Should_Have_Error_When_Circular_Parent_Cycle_Exists()
    {
        var model = new EvaluateArchitectureRequestDto
        {
            Graph = new SemanticGraph
            {
                Components =
                [
                    new GraphComponent { Id = "node-a", ServiceCode = "NET_VPC", ParentId = "node-b" },
                    new GraphComponent { Id = "node-b", ServiceCode = "NET_SUBNET", ParentId = "node-a" }
                ]
            }
        };

        var result = _validator.TestValidate(model);

        result.ShouldHaveValidationErrorFor(x => x.Graph)
            .WithErrorMessage("La jerarquía de contención (VPC / Subred) contiene referencias inválidas o ciclos circulares.");
    }
}
