namespace AwsQuest.Application.Common;

using System;
using System.Collections.Generic;

public static class DictionarySlugResolver
{
    private static readonly Dictionary<string, string> CodeToSlug = new(StringComparer.OrdinalIgnoreCase)
    {
        ["AWS_EC2"] = "amazon-ec2",
        ["AWS_S3"] = "amazon-s3",
        ["AWS_RDS"] = "amazon-rds",
        ["AWS_DYNAMODB"] = "amazon-dynamodb",
        ["AWS_CLOUDFRONT"] = "amazon-cloudfront",
        ["AWS_ROUTE53"] = "amazon-route-53",
        ["AWS_ALB"] = "application-load-balancer",
        ["AWS_NLB"] = "network-load-balancer",
        ["AWS_ASG"] = "auto-scaling-group",
        ["AWS_EBS"] = "amazon-ebs",
        ["AWS_EFS"] = "amazon-efs",
        ["AWS_LAMBDA"] = "aws-lambda",
        ["AWS_APIGW"] = "amazon-api-gateway",
        ["AWS_SQS"] = "amazon-sqs",
        ["AWS_SNS"] = "amazon-sns",
        ["AWS_EVENTBRIDGE"] = "amazon-eventbridge",
        ["AWS_ECS"] = "amazon-ecs",
        ["AWS_FARGATE"] = "aws-fargate",
        ["AWS_WAF"] = "aws-waf",
        ["AWS_SECRETS"] = "aws-secrets-manager",
        ["AWS_CLOUDWATCH"] = "amazon-cloudwatch",
        ["AWS_CLOUDTRAIL"] = "aws-cloudtrail",
        ["AWS_CLOUDFORMATION"] = "aws-cloudformation",
        ["AWS_ELASTICACHE"] = "amazon-elasticache",
        ["AWS_AURORA"] = "amazon-aurora",
        ["AWS_STEPFUNCTIONS"] = "aws-step-functions",
        ["AWS_KMS"] = "aws-kms",
        ["AWS_IAM"] = "aws-iam",
        ["AWS_ATHENA"] = "amazon-athena",
        ["AWS_OPENSEARCH"] = "amazon-opensearch",
        ["AWS_COGNITO"] = "amazon-cognito",
        ["NET_VPC"] = "amazon-vpc",
        ["NET_SUBNET_PUB"] = "subnet-publica",
        ["NET_SUBNET_PRIV"] = "subnet-privada",
        ["NET_IGW"] = "internet-gateway",
        ["NET_NATGW"] = "nat-gateway",
        ["SEC_SG"] = "security-group",
        ["SEC_NACL"] = "network-acl",
        ["NET_RT"] = "route-table",
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
