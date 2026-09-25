namespace AwsQuest.Domain.Engine.Evaluators;

using AwsQuest.Domain.Engine.Context;

public interface IEvaluatorStep
{
    void Evaluate(EvaluationExecutionContext context);
}
