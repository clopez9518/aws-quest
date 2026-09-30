namespace AwsQuest.Application.Common;

using System;
using System.Collections.Generic;

public static class DictionarySlugResolver
{
    private static readonly Dictionary<string, string> CodeToSlug = new(StringComparer.OrdinalIgnoreCase)
    {
        // Compute
        ["AWS_EC2"] = "amazon-ec2",
        ["AWS_LAMBDA"] = "aws-lambda",
        ["AWS_ECS"] = "amazon-ecs",
        ["AWS_ECR"] = "amazon-ecr",
        ["AWS_FARGATE"] = "aws-fargate",
        ["AWS_ASG"] = "auto-scaling-group",

        // Storage & Database
        ["AWS_S3"] = "amazon-s3",
        ["AWS_EBS"] = "amazon-ebs",
        ["AWS_EFS"] = "amazon-efs",
        ["AWS_RDS"] = "amazon-rds",
        ["AWS_AURORA"] = "amazon-aurora",
        ["AWS_DYNAMODB"] = "amazon-dynamodb",
        ["AWS_ELASTICACHE"] = "amazon-elasticache",

        // Networking & Content Delivery
        ["AWS_CLOUDFRONT"] = "amazon-cloudfront",
        ["AWS_ROUTE53"] = "amazon-route-53",
        ["AWS_ALB"] = "application-load-balancer",
        ["AWS_NLB"] = "network-load-balancer",
        ["AWS_APIGATEWAY"] = "amazon-api-gateway",
        ["AWS_APIGW"] = "amazon-api-gateway",

        // Integration & Messaging
        ["AWS_SQS"] = "amazon-sqs",
        ["AWS_SNS"] = "amazon-sns",
        ["AWS_EVENTBRIDGE"] = "amazon-eventbridge",
        ["AWS_STEPFUNCTIONS"] = "aws-step-functions",

        // Security & Identity
        ["AWS_IAM"] = "aws-iam",
        ["AWS_WAF"] = "aws-waf",
        ["AWS_KMS"] = "aws-kms",
        ["AWS_SECRETS_MANAGER"] = "aws-secrets-manager",
        ["AWS_SECRETS"] = "aws-secrets-manager",
        ["AWS_COGNITO"] = "amazon-cognito",

        // Monitoring & Management
        ["AWS_CLOUDWATCH"] = "amazon-cloudwatch",
        ["AWS_CLOUDTRAIL"] = "aws-cloudtrail",
        ["AWS_CLOUDFORMATION"] = "aws-cloudformation",

        // Analytics & Search
        ["AWS_ATHENA"] = "amazon-athena",
        ["AWS_OPENSEARCH"] = "amazon-opensearch",

        // Network Infrastructure & VPC
        ["NET_VPC"] = "amazon-vpc",
        ["NET_SUBNET"] = "subnet-publica",
        ["NET_SUBNET_PUB"] = "subnet-publica",
        ["NET_SUBNET_PRIV"] = "subnet-privada",
        ["NET_IGW"] = "internet-gateway",
        ["NET_INTERNET_GATEWAY"] = "internet-gateway",
        ["NET_NAT_GATEWAY"] = "nat-gateway",
        ["NET_NATGW"] = "nat-gateway",
        ["NET_ROUTE_TABLE"] = "route-table",
        ["NET_RT"] = "route-table",
        ["NET_SECURITY_GROUP"] = "security-group",
        ["SEC_SG"] = "security-group",
        ["NET_NACL"] = "network-acl",
        ["SEC_NACL"] = "network-acl",
        ["SEC_BASTION"] = "bastion-host",
        ["NET_PEERING"] = "vpc-peering",
        ["NET_TGW"] = "transit-gateway",
        ["NET_CIDR"] = "cidr-block",
        ["NET_TG"] = "target-group-health-checks",
        ["NET_VPCE"] = "vpc-endpoint-privatelink"
    };

    public static string ResolveSlug(string? serviceCode, string? explicitSlug = null)
    {
        if (!string.IsNullOrWhiteSpace(explicitSlug)) return explicitSlug;
        if (!string.IsNullOrWhiteSpace(serviceCode) && CodeToSlug.TryGetValue(serviceCode, out var slug))
        {
            return slug;
        }
        if (!string.IsNullOrWhiteSpace(serviceCode))
        {
            var code = serviceCode.ToLowerInvariant().Replace('_', '-');
            if (code.StartsWith("aws-")) return $"amazon-{code[4..]}";
            if (code.StartsWith("net-")) return $"amazon-{code[4..]}";
            return code;
        }
        return string.Empty;
    }
}
