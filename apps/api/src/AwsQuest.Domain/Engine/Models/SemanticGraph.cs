namespace AwsQuest.Domain.Engine.Models;

using AwsQuest.Domain.Enums;

public class SemanticGraph
{
    public List<GraphComponent> Components { get; set; } = [];
    public List<GraphConnection> Connections { get; set; } = [];

    // ─── Consultas Básicas Existentes ───
    public GraphComponent? GetComponentById(string id) =>
        Components.FirstOrDefault(c => string.Equals(c.Id, id, StringComparison.OrdinalIgnoreCase));

    public IEnumerable<GraphComponent> GetComponentsByServiceCode(string serviceCode) =>
        Components.Where(c => string.Equals(c.ServiceCode, serviceCode, StringComparison.OrdinalIgnoreCase));

    public int GetComponentCount(string serviceCode) =>
        Components.Count(c => string.Equals(c.ServiceCode, serviceCode, StringComparison.OrdinalIgnoreCase));

    public int GetEffectiveInstanceCount(string serviceCode)
    {
        var matching = GetComponentsByServiceCode(serviceCode).ToList();
        if (matching.Count == 0) return 0;
        return matching.Sum(c => Math.Max(1, c.Config.InstanceCount ?? 1));
    }

    public IEnumerable<GraphConnection> GetOutboundConnections(string componentId) =>
        Connections.Where(c => string.Equals(c.FromComponentId, componentId, StringComparison.OrdinalIgnoreCase));

    public IEnumerable<GraphConnection> GetInboundConnections(string componentId) =>
        Connections.Where(c => string.Equals(c.ToComponentId, componentId, StringComparison.OrdinalIgnoreCase));

    public bool HasConnectionBetweenServices(string fromServiceCode, string toServiceCode)
    {
        var fromIds = GetComponentsByServiceCode(fromServiceCode)
            .Select(c => c.Id)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var toIds = GetComponentsByServiceCode(toServiceCode)
            .Select(c => c.Id)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        return Connections.Any(conn => fromIds.Contains(conn.FromComponentId) && toIds.Contains(conn.ToComponentId));
    }

    public bool IsEmpty => Components.Count == 0;

    // ─── Consultas Topológicas de Contención ───
    public GraphComponent? GetParent(string componentId)
    {
        var comp = GetComponentById(componentId);
        if (comp == null || string.IsNullOrWhiteSpace(comp.ParentId)) return null;
        return GetComponentById(comp.ParentId);
    }

    public IEnumerable<GraphComponent> GetChildren(string containerId) =>
        Components.Where(c => string.Equals(c.ParentId, containerId, StringComparison.OrdinalIgnoreCase));

    public GraphComponent? GetComponentSubnet(string componentId)
    {
        var parent = GetParent(componentId);
        if (parent == null) return null;
        if (string.Equals(parent.ServiceCode, "NET_SUBNET", StringComparison.OrdinalIgnoreCase))
            return parent;
        return null;
    }

    public GraphComponent? GetComponentVpc(string componentId)
    {
        var current = GetComponentById(componentId);
        while (current != null && !string.IsNullOrWhiteSpace(current.ParentId))
        {
            var parent = GetComponentById(current.ParentId);
            if (parent == null) break;
            if (string.Equals(parent.ServiceCode, "NET_VPC", StringComparison.OrdinalIgnoreCase))
                return parent;
            current = parent;
        }
        return null;
    }

    public bool IsLocatedInPublicSubnet(string componentId)
    {
        var subnet = GetComponentSubnet(componentId);
        if (subnet == null) return false;
        if (subnet.Config.SubnetTier == SubnetTier.Public) return true;
        if (string.Equals(subnet.Config.SubnetType, "Public", StringComparison.OrdinalIgnoreCase)) return true;
        return false;
    }

    public bool IsLocatedInPrivateSubnet(string componentId)
    {
        var subnet = GetComponentSubnet(componentId);
        if (subnet == null) return false;
        if (subnet.Config.SubnetTier == SubnetTier.Private || subnet.Config.SubnetTier == SubnetTier.Isolated) return true;
        if (string.Equals(subnet.Config.SubnetType, "Private", StringComparison.OrdinalIgnoreCase)) return true;
        return false;
    }

    // ─── Consultas de Ruteo y Accesibilidad ───
    public bool HasRouteToGateway(string subnetId, string gatewayServiceCode)
    {
        var subnet = GetComponentById(subnetId);
        if (subnet == null) return false;

        var gatewayComponents = GetComponentsByServiceCode(gatewayServiceCode).ToList();
        var gwIds = gatewayComponents.Select(g => g.Id).ToHashSet(StringComparer.OrdinalIgnoreCase);
        if (gwIds.Count == 0) return false;

        // 1. Revisar si la subred apunta a una RouteTable explícita
        if (!string.IsNullOrWhiteSpace(subnet.Config.RouteTableId))
        {
            var routeTable = GetComponentById(subnet.Config.RouteTableId);
            if (routeTable != null)
            {
                var targetIds = routeTable.Config.Routes.Select(r => r.TargetId).ToHashSet(StringComparer.OrdinalIgnoreCase);
                if (gatewayComponents.Any(gw => targetIds.Contains(gw.Id)))
                {
                    return true;
                }
            }
        }

        // 2. Revisar si hay conexión dirigida o implícita en la configuración de rutas de la subred
        if (subnet.Config.Routes.Any(r => gwIds.Contains(r.TargetId)))
        {
            return true;
        }

        // 3. Revisar si hay una arista de conexión hacia el Gateway o hacia una RouteTable que conecta al Gateway
        var directToGw = Connections.Any(c => string.Equals(c.FromComponentId, subnetId, StringComparison.OrdinalIgnoreCase) && gwIds.Contains(c.ToComponentId));
        if (directToGw) return true;

        var routeTables = GetComponentsByServiceCode("NET_ROUTE_TABLE").ToList();
        foreach (var rt in routeTables)
        {
            var subnetToRt = Connections.Any(c => string.Equals(c.FromComponentId, subnetId, StringComparison.OrdinalIgnoreCase) && string.Equals(c.ToComponentId, rt.Id, StringComparison.OrdinalIgnoreCase));
            var rtToGw = Connections.Any(c => string.Equals(c.FromComponentId, rt.Id, StringComparison.OrdinalIgnoreCase) && gwIds.Contains(c.ToComponentId));
            var rtConfigHasGw = rt.Config.Routes.Any(r => gwIds.Contains(r.TargetId));
            if (subnetToRt && (rtToGw || rtConfigHasGw)) return true;
        }

        // 4. Revisar si la VPC contenedora está conectada al Gateway (o el Gateway está adjunto a la VPC)
        var vpc = GetComponentVpc(subnetId);
        if (vpc != null)
        {
            var vpcToGw = Connections.Any(c =>
                (string.Equals(c.FromComponentId, vpc.Id, StringComparison.OrdinalIgnoreCase) && gwIds.Contains(c.ToComponentId)) ||
                (gwIds.Contains(c.FromComponentId) && string.Equals(c.ToComponentId, vpc.Id, StringComparison.OrdinalIgnoreCase)));
            if (vpcToGw) return true;

            var gwAttachedToVpc = gatewayComponents.Any(gw =>
                string.Equals(gw.Config.AttachedVpcId, vpc.Id, StringComparison.OrdinalIgnoreCase));
            if (gwAttachedToVpc) return true;
        }

        return false;
    }

    public bool HasRouteToInternet(string subnetId) => HasRouteToGateway(subnetId, "NET_IGW");

    public bool HasOutboundRouteViaNat(string subnetId) => HasRouteToGateway(subnetId, "NET_NAT_GATEWAY");

    // ─── Consultas de Security Groups ───
    public IEnumerable<GraphComponent> GetAttachedSecurityGroups(string componentId)
    {
        var comp = GetComponentById(componentId);
        if (comp == null) return [];

        var directSgIds = comp.Config.SecurityGroupIds.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var connectedSgIds = Connections
            .Where(c => string.Equals(c.FromComponentId, componentId, StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(c.ToComponentId, componentId, StringComparison.OrdinalIgnoreCase))
            .Select(c => string.Equals(c.FromComponentId, componentId, StringComparison.OrdinalIgnoreCase) ? c.ToComponentId : c.FromComponentId)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var allSgIds = directSgIds.Union(connectedSgIds, StringComparer.OrdinalIgnoreCase);

        return Components.Where(c => string.Equals(c.ServiceCode, "NET_SECURITY_GROUP", StringComparison.OrdinalIgnoreCase) && allSgIds.Contains(c.Id));
    }
}
