namespace AwsQuest.Domain.Engine.Models;

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
    public SubnetTier? SubnetTier { get; set; }
    public string? CidrBlock { get; set; } // ej. "10.0.0.0/16", "10.0.1.0/24"
    public string? RouteTableId { get; set; }
    public string? AttachedVpcId { get; set; }
    public List<string> SecurityGroupIds { get; set; } = [];
    public List<RouteEntry> Routes { get; set; } = [];
    public List<SecurityGroupRule> SecurityGroupRules { get; set; } = [];

    public Dictionary<string, object> CustomProperties { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
