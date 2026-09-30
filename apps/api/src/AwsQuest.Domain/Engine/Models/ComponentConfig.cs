namespace AwsQuest.Domain.Engine.Models;

using System.Text.Json.Serialization;
using AwsQuest.Domain.Enums;

public class ComponentConfig
{
    // Propiedades Legadas (Preservadas para 100% de compatibilidad)
    public bool? IsMultiAz { get; set; }
    public bool? AutoScaling { get; set; }
    public int? InstanceCount { get; set; }
    public bool? IsPublic { get; set; }
    public string? SubnetType { get; set; } // Legado ("Public", "Private")
    public string? StorageClass { get; set; }

    // Nuevas Propiedades de Infraestructura de Red y Seguridad
    [JsonPropertyName("subnetTier")]
    public SubnetTier? SubnetTier { get; set; }

    [JsonPropertyName("tier")]
    public string? TierAlias
    {
        get => SubnetTier?.ToString();
        set
        {
            if (!string.IsNullOrWhiteSpace(value) && Enum.TryParse<SubnetTier>(value, true, out var t))
            {
                SubnetTier = t;
                SubnetType = value;
            }
        }
    }

    [JsonPropertyName("cidrBlock")]
    public string? CidrBlock { get; set; } // ej. "10.0.0.0/16", "10.0.1.0/24"

    [JsonPropertyName("cidr")]
    public string? CidrAlias
    {
        get => CidrBlock;
        set { if (!string.IsNullOrWhiteSpace(value)) CidrBlock = value; }
    }

    public string? RouteTableId { get; set; }
    public string? AttachedVpcId { get; set; }
    public List<string> SecurityGroupIds { get; set; } = [];
    public List<RouteEntry> Routes { get; set; } = [];
    public List<SecurityGroupRule> SecurityGroupRules { get; set; } = [];

    public Dictionary<string, object> CustomProperties { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
