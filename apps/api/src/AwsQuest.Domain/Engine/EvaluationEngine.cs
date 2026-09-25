namespace AwsQuest.Domain.Engine;

using AwsQuest.Domain.Engine.Context;
using AwsQuest.Domain.Engine.Evaluators;
using AwsQuest.Domain.Engine.Models;
using AwsQuest.Domain.Exceptions;

public class EvaluationEngine : IEvaluationEngine
{
    private readonly List<IEvaluatorStep> _steps;
    private readonly ScoreCalculator _scoreCalculator;

    public EvaluationEngine()
        : this(null, null)
    {
    }

    public EvaluationEngine(IEnumerable<IEvaluatorStep>? customSteps, ScoreCalculator? scoreCalculator = null)
    {
        var stepsList = customSteps?.ToList();
        _steps = (stepsList != null && stepsList.Count > 0)
            ? stepsList
            : [
                new ServicePresenceEvaluator(),
                new PlacementEvaluator(),
                new NetworkTopologyEvaluator(),
                new SecurityGroupEvaluator(),
                new ConnectionEvaluator(),
                new AntiPatternEvaluator()
              ];
        _scoreCalculator = scoreCalculator ?? new ScoreCalculator();
    }

    public EvaluationResult Evaluate(
        SemanticGraph graph,
        ChallengeEvaluationRules rules,
        int hintsUsed = 0,
        int hintPenalties = 0)
    {
        ArgumentNullException.ThrowIfNull(graph);
        ArgumentNullException.ThrowIfNull(rules);

        if (graph.IsEmpty)
        {
            throw new InvalidGraphException("No se puede evaluar una arquitectura vacía sin componentes.");
        }

        var context = new EvaluationExecutionContext(graph, rules, hintsUsed, hintPenalties);

        foreach (var step in _steps)
        {
            step.Evaluate(context);
        }

        return _scoreCalculator.Calculate(context);
    }
}
