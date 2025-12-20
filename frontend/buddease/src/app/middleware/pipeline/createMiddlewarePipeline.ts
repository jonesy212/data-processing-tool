// createMiddlewarePipeline.ts
// pipeline.ts
import { MiddlewareFunction, MiddlewareNext } from '@/app/libraries/cache/client/types';

export const createMiddlewarePipeline = (
  middlewares: MiddlewareFunction[]
): MiddlewareFunction => {
  if (!middlewares.length) {
    return async (context, next) => await next(context);
  }
  
  // Create a composed pipeline where each middleware calls the next
  return middlewares.reduceRight<MiddlewareFunction>(
    (nextMiddleware, currentMiddleware) => {
      return async (context, next) => {
        return await currentMiddleware(context, async (ctx) => {
          return await nextMiddleware(ctx, next);
        });
      };
    },
    async (context, next) => await next(context) // Initial next function
  );
};

// Alternative implementation (left-to-right composition)
export const createMiddlewarePipelineLR = (
  middlewares: MiddlewareFunction[]
): MiddlewareFunction => {
  return async (context, finalNext) => {
    let index = -1;
    
    const dispatch = async (i: number): Promise<any> => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      
      index = i;
      const middleware = middlewares[i];
      
      if (i === middlewares.length) {
        return await finalNext(context);
      }
      
      try {
        return await middleware(context, (ctx) => dispatch(i + 1));
      } catch (error) {
        throw error;
      }
    };
    
    return await dispatch(0);
  };
};