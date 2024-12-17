import { LayerError, LayerErrorCode } from '../errors';
import Docker from 'dockerode';
import { EdgeRuntime } from '@vercel/edge-runtime';
import { LayerRuntimeType } from '../types/layer';

export class LayerSandbox {
  private docker: Docker;
  private edgeRuntime: EdgeRuntime;

  constructor() {
    this.docker = new Docker();
    this.edgeRuntime = new EdgeRuntime();
  }

  async executeLayer(
    layerId: string,
    code: string,
    runtime: LayerRuntimeType,
    args: Record<string, unknown>
  ): Promise<unknown> {
    switch (runtime) {
      case 'node':
        return this.executeInEdge(code, args);
      case 'docker':
        return this.executeInDocker(layerId, code, args);
      default:
        throw new LayerError(
          LayerErrorCode.RUNTIME_ERROR,
          `Unsupported runtime: ${runtime}`
        );
    }
  }

  private async executeInEdge(code: string, args: Record<string, unknown>): Promise<unknown> {
    const contextStr = `const args = ${JSON.stringify(args)};\n${code}`;
    return this.edgeRuntime.evaluate(contextStr);
  }

  private async executeInDocker(
    layerId: string,
    code: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    const container = await this.docker.createContainer({
      Image: 'node:16',
      Cmd: ['node', '-e', code],
      Env: [`ARGS=${JSON.stringify(args)}`]
    });
    return container.start();
  }
} 