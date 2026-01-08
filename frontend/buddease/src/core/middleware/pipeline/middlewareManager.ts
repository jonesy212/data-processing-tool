// middlewareManager.ts
import type { MiddlewareContext, MiddlewareFunction, MiddlewarePipeline } from '@/core/middleware/core/types';
import { createMiddlewarePipeline } from '@/core/middleware/pipeline/createMiddlewarePipeline';

export class MiddlewareManager implements MiddlewarePipeline {
  private middlewares: MiddlewareFunction[] = [];
  private pipeline: MiddlewareFunction | null = null;

  constructor(initialMiddlewares: MiddlewareFunction[] = []) {
    this.middlewares = [...initialMiddlewares];
    this.updatePipeline();
  }

  use(middleware: MiddlewareFunction): void {
    this.middlewares.push(middleware);
    this.updatePipeline();
  }

  remove(middlewareName: string): void {
    this.middlewares = this.middlewares.filter(mw => {
      // You might want to add name property to middleware functions
      // For now, we'll filter by function reference or other identifier
      return mw.name !== middlewareName;
    });
    this.updatePipeline();
  }

  getMiddlewares(): MiddlewareFunction[] {
    return [...this.middlewares];
  }

  async execute<T>(operation: string, payload: any, context?: Partial<MiddlewareContext<any, any, any, any, any, any>>): Promise<T> {
    if (!this.pipeline) {
      throw new Error('Middleware pipeline not initialized');
    }

    const fullContext: MiddlewareContext<any, any, any, any, any, any> = {
      operation,
      payload,
      store: null,
      timestamp: new Date(),
      plugins: [],
      ...context
    };

    return await this.pipeline(fullContext, async (ctx) => {
      // This is where the final operation execution happens
      // In useSnapshotStore, this will call the actual operation methods
      throw new Error('Final operation handler not implemented - should be provided by useSnapshotStore');
    });
  }

  private updatePipeline(): void {
    this.pipeline = createMiddlewarePipeline(this.middlewares);
  }

  clear(): void {
    this.middlewares = [];
    this.pipeline = null;
  }
}