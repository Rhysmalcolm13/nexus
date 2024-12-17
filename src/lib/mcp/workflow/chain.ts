import { LayerManager } from '../layers/manager';
import { LayerError, LayerErrorCode } from '../errors';

interface WorkflowStep {
  layerId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export class LayerChain {
  constructor(private manager: LayerManager) {}

  async execute(steps: WorkflowStep[]): Promise<unknown[]> {
    const results: unknown[] = [];
    let previousResult: unknown;

    for (const step of steps) {
      try {
        const args = this.interpolateArgs(step.args, previousResult);
        const result = await this.manager.getClient(step.layerId)?.callTool(
          step.toolName,
          args
        );
        
        if (!result) {
          throw new LayerError(
            LayerErrorCode.RUNTIME_ERROR,
            `Failed to execute tool: ${step.toolName} on layer: ${step.layerId}`
          );
        }

        results.push(result);
        previousResult = result;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorInstance = error instanceof Error ? error : new Error(errorMessage);
        
        throw new LayerError(
          LayerErrorCode.RUNTIME_ERROR,
          `Workflow step failed: ${errorMessage}`,
          errorInstance
        );
      }
    }

    return results;
  }

  private interpolateArgs(
    args: Record<string, unknown>,
    previousResult: unknown
  ): Record<string, unknown> {
    return Object.entries(args).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value === '$previous' ? previousResult : value,
      }),
      {}
    );
  }
} 