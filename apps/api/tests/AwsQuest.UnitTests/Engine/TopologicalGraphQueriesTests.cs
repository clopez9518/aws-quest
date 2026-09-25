namespace AwsQuest.UnitTests.Engine;

using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Enums;
using FluentAssertions;
using Xunit;

public class TopologicalGraphQueriesTests
{
    [Fact]
    public void GetParent_WhenComponentHasParent_ReturnsCorrectContainer()
    {
        // Arrange
        var vpc = new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" };
        var subnet = new GraphComponent { Id = "sub-pub-1", ServiceCode = "NET_SUBNET", ParentId = "vpc-1" };
        var ec2 = new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2", ParentId = "sub-pub-1" };

        var graph = new SemanticGraph
        {
            Components = [vpc, subnet, ec2]
        };

        // Act & Assert
        var ec2Parent = graph.GetParent("ec2-1");
        ec2Parent.Should().NotBeNull();
        ec2Parent!.Id.Should().Be("sub-pub-1");
        ec2Parent.ServiceCode.Should().Be("NET_SUBNET");

        var subnetParent = graph.GetParent("sub-pub-1");
        subnetParent.Should().NotBeNull();
        subnetParent!.Id.Should().Be("vpc-1");

        var vpcParent = graph.GetParent("vpc-1");
        vpcParent.Should().BeNull();
    }

    [Fact]
    public void GetChildren_WhenContainerHasChildren_ReturnsAllNestedComponents()
    {
        // Arrange
        var vpc = new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" };
        var sub1 = new GraphComponent { Id = "sub-1", ServiceCode = "NET_SUBNET", ParentId = "vpc-1" };
        var sub2 = new GraphComponent { Id = "sub-2", ServiceCode = "NET_SUBNET", ParentId = "vpc-1" };
        var ec2 = new GraphComponent { Id = "ec2-1", ServiceCode = "AWS_EC2", ParentId = "sub-1" };

        var graph = new SemanticGraph { Components = [vpc, sub1, sub2, ec2] };

        // Act & Assert
        var vpcChildren = graph.GetChildren("vpc-1").ToList();
        vpcChildren.Should().HaveCount(2);
        vpcChildren.Select(c => c.Id).Should().Contain(["sub-1", "sub-2"]);

        var sub1Children = graph.GetChildren("sub-1").ToList();
        sub1Children.Should().HaveCount(1);
        sub1Children[0].Id.Should().Be("ec2-1");
    }

    [Fact]
    public void GetComponentVpc_WhenNestedInSubnet_ResolvesRootVpc()
    {
        // Arrange
        var vpc = new GraphComponent { Id = "vpc-prod", ServiceCode = "NET_VPC" };
        var subnet = new GraphComponent { Id = "sub-app", ServiceCode = "NET_SUBNET", ParentId = "vpc-prod" };
        var rds = new GraphComponent { Id = "rds-db", ServiceCode = "AWS_RDS", ParentId = "sub-app" };

        var graph = new SemanticGraph { Components = [vpc, subnet, rds] };

        // Act & Assert
        var resolvedVpc = graph.GetComponentVpc("rds-db");
        resolvedVpc.Should().NotBeNull();
        resolvedVpc!.Id.Should().Be("vpc-prod");

        var subnetVpc = graph.GetComponentVpc("sub-app");
        subnetVpc.Should().NotBeNull();
        subnetVpc!.Id.Should().Be("vpc-prod");
    }

    [Fact]
    public void IsLocatedInPublicSubnet_WhenTierIsPublic_ReturnsTrue()
    {
        // Arrange
        var vpc = new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" };
        var publicSubnet = new GraphComponent
        {
            Id = "sub-pub",
            ServiceCode = "NET_SUBNET",
            ParentId = "vpc-1",
            Config = new ComponentConfig { SubnetTier = SubnetTier.Public }
        };
        var alb = new GraphComponent { Id = "alb-1", ServiceCode = "AWS_ALB", ParentId = "sub-pub" };

        var graph = new SemanticGraph { Components = [vpc, publicSubnet, alb] };

        // Act & Assert
        graph.IsLocatedInPublicSubnet("alb-1").Should().BeTrue();
        graph.IsLocatedInPrivateSubnet("alb-1").Should().BeFalse();
    }

    [Fact]
    public void IsLocatedInPrivateSubnet_WhenTierIsPrivateOrIsolated_ReturnsTrue()
    {
        // Arrange
        var vpc = new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" };
        var privateSubnet = new GraphComponent
        {
            Id = "sub-priv",
            ServiceCode = "NET_SUBNET",
            ParentId = "vpc-1",
            Config = new ComponentConfig { SubnetTier = SubnetTier.Private }
        };
        var rds = new GraphComponent { Id = "rds-1", ServiceCode = "AWS_RDS", ParentId = "sub-priv" };

        var graph = new SemanticGraph { Components = [vpc, privateSubnet, rds] };

        // Act & Assert
        graph.IsLocatedInPrivateSubnet("rds-1").Should().BeTrue();
        graph.IsLocatedInPublicSubnet("rds-1").Should().BeFalse();
    }

    [Fact]
    public void HasRouteToInternet_WhenConnectedViaRouteTable_ReturnsTrue()
    {
        // Arrange
        var vpc = new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" };
        var igw = new GraphComponent { Id = "igw-1", ServiceCode = "NET_IGW" };
        var rt = new GraphComponent
        {
            Id = "rt-pub",
            ServiceCode = "NET_ROUTE_TABLE",
            Config = new ComponentConfig
            {
                Routes = [new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "igw-1" }]
            }
        };
        var subnet = new GraphComponent
        {
            Id = "sub-pub",
            ServiceCode = "NET_SUBNET",
            ParentId = "vpc-1",
            Config = new ComponentConfig { RouteTableId = "rt-pub", SubnetTier = SubnetTier.Public }
        };

        var graph = new SemanticGraph { Components = [vpc, igw, rt, subnet] };

        // Act & Assert
        graph.HasRouteToInternet("sub-pub").Should().BeTrue();
        graph.HasOutboundRouteViaNat("sub-pub").Should().BeFalse();
    }

    [Fact]
    public void HasOutboundRouteViaNat_WhenRouteTablePointsToNatGateway_ReturnsTrue()
    {
        // Arrange
        var vpc = new GraphComponent { Id = "vpc-1", ServiceCode = "NET_VPC" };
        var nat = new GraphComponent { Id = "nat-gw-1", ServiceCode = "NET_NAT_GATEWAY" };
        var rt = new GraphComponent
        {
            Id = "rt-priv",
            ServiceCode = "NET_ROUTE_TABLE",
            Config = new ComponentConfig
            {
                Routes = [new RouteEntry { DestinationCidr = "0.0.0.0/0", TargetId = "nat-gw-1" }]
            }
        };
        var subnet = new GraphComponent
        {
            Id = "sub-priv",
            ServiceCode = "NET_SUBNET",
            ParentId = "vpc-1",
            Config = new ComponentConfig { RouteTableId = "rt-priv", SubnetTier = SubnetTier.Private }
        };

        var graph = new SemanticGraph { Components = [vpc, nat, rt, subnet] };

        // Act & Assert
        graph.HasOutboundRouteViaNat("sub-priv").Should().BeTrue();
        graph.HasRouteToInternet("sub-priv").Should().BeFalse();
    }

    [Fact]
    public void GetAttachedSecurityGroups_WhenComponentReferencesSg_ReturnsMatchingComponents()
    {
        // Arrange
        var sgApp = new GraphComponent
        {
            Id = "sg-web",
            ServiceCode = "NET_SECURITY_GROUP",
            Label = "SG Web Layer",
            Config = new ComponentConfig
            {
                SecurityGroupRules =
                [
                    new SecurityGroupRule { Direction = RuleDirection.Ingress, Protocol = "TCP", FromPort = 80, ToPort = 80, Source = "0.0.0.0/0" }
                ]
            }
        };

        var ec2 = new GraphComponent
        {
            Id = "ec2-1",
            ServiceCode = "AWS_EC2",
            Config = new ComponentConfig
            {
                SecurityGroupIds = ["sg-web"]
            }
        };

        var graph = new SemanticGraph { Components = [sgApp, ec2] };

        // Act & Assert
        var attachedSgs = graph.GetAttachedSecurityGroups("ec2-1").ToList();
        attachedSgs.Should().HaveCount(1);
        attachedSgs[0].Id.Should().Be("sg-web");
        attachedSgs[0].Config.SecurityGroupRules.Should().HaveCount(1);
        attachedSgs[0].Config.SecurityGroupRules[0].MatchesPort(80).Should().BeTrue();
        attachedSgs[0].Config.SecurityGroupRules[0].MatchesPort(443).Should().BeFalse();
    }
}
