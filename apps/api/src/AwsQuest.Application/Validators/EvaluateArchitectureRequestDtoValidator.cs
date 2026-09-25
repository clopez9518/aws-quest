namespace AwsQuest.Application.Validators;

using FluentValidation;
using AwsQuest.Application.Dtos.Evaluation;
using AwsQuest.Domain.Engine.Models;

public class EvaluateArchitectureRequestDtoValidator : AbstractValidator<EvaluateArchitectureRequestDto>
{
    public EvaluateArchitectureRequestDtoValidator()
    {
        RuleFor(x => x.Graph)
            .NotNull().WithMessage("El grafo semántico de arquitectura no puede ser nulo.");

        RuleFor(x => x.Graph.Components)
            .NotEmpty().WithMessage("La arquitectura debe contener al menos un servicio colocado en el canvas.");

        RuleForEach(x => x.Graph.Components).SetValidator(new GraphComponentValidator());

        RuleForEach(x => x.Graph.Connections).SetValidator(new GraphConnectionValidator());

        RuleFor(x => x.Graph)
            .Must(HaveValidConnectionEndpoints)
            .WithMessage("Todas las conexiones deben enlazar componentes existentes dentro de la arquitectura.");

        RuleFor(x => x.Graph)
            .Must(HaveValidHierarchy)
            .WithMessage("La jerarquía de contención (VPC / Subred) contiene referencias inválidas o ciclos circulares.");

        RuleFor(x => x.HintsUsed)
            .GreaterThanOrEqualTo(0).WithMessage("El número de pistas utilizadas no puede ser negativo.");
    }

    private static bool HaveValidConnectionEndpoints(SemanticGraph graph)
    {
        if (graph.Connections.Count == 0) return true;
        var componentIds = graph.Components.Select(c => c.Id).ToHashSet(StringComparer.OrdinalIgnoreCase);
        return graph.Connections.All(conn => 
            componentIds.Contains(conn.FromComponentId) && 
            componentIds.Contains(conn.ToComponentId));
    }

    private static bool HaveValidHierarchy(SemanticGraph graph)
    {
        if (graph.Components.Count == 0) return true;
        var componentMap = graph.Components.ToDictionary(c => c.Id, c => c, StringComparer.OrdinalIgnoreCase);

        foreach (var comp in graph.Components)
        {
            if (string.IsNullOrWhiteSpace(comp.ParentId)) continue;

            // 1. Validar que el padre existe
            if (!componentMap.TryGetValue(comp.ParentId, out _))
            {
                return false;
            }

            // 2. Validar que no hay autoreferencia ni ciclos en la jerarquía
            var visited = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { comp.Id };
            var currentParentId = comp.ParentId;

            while (!string.IsNullOrWhiteSpace(currentParentId))
            {
                if (!visited.Add(currentParentId))
                {
                    return false; // Ciclo circular detectado
                }

                if (!componentMap.TryGetValue(currentParentId, out var parentComp))
                {
                    return false;
                }

                currentParentId = parentComp.ParentId;
            }
        }

        return true;
    }
}

public class GraphComponentValidator : AbstractValidator<GraphComponent>
{
    public GraphComponentValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("El identificador del componente de arquitectura no puede estar vacío.");

        RuleFor(x => x.ServiceCode)
            .NotEmpty().WithMessage("El código del servicio AWS asociado al componente no puede estar vacío.");
    }
}

public class GraphConnectionValidator : AbstractValidator<GraphConnection>
{
    public GraphConnectionValidator()
    {
        RuleFor(x => x.FromComponentId)
            .NotEmpty().WithMessage("El identificador del nodo de origen no puede estar vacío.");

        RuleFor(x => x.ToComponentId)
            .NotEmpty().WithMessage("El identificador del nodo de destino no puede estar vacío.");

        RuleFor(x => x)
            .Must(x => !string.Equals(x.FromComponentId, x.ToComponentId, StringComparison.OrdinalIgnoreCase))
            .WithMessage("Un componente no puede conectarse a sí mismo.");
    }
}
