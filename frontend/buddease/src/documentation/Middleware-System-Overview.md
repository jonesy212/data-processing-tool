<!-- Middleware-System-Overview -->
# Middleware System Overview

## Purpose
- Centralized handling of cross-cutting concerns for snapshot stores and other operations.
- Each middleware focuses on a specific responsibility (logging, persistence, etc.).
- Context (`MiddlewareContext`) flows through the pipeline.

## Middleware Pipeline Flow
1. Incoming operation is passed into `MiddlewarePipeline.execute()`.
2. Each middleware in the `.middlewares` array is invoked in order.
3. Each middleware calls `await next(context)` to pass control to the next middleware.

## Logging Middleware
- Logs start and end of operations.
- Measures duration for performance monitoring.
- Fire-and-forget strategy: logging is async and non-blocking.
- Can log success or failure without affecting other middleware.

## Persistence Middleware
- Handles persistence of snapshot data according to store options.
- Can operate after logging completes.
- Non-blocking design ensures failures do not prevent subsequent operations.

## Fire-and-Forget Logging Strategy
- Logging does not block `next()` in the middleware chain.
- Asynchronous logging calls prevent performance impact.
- Ensures errors in logging never break the main operation.

## Error Handling
- Middleware errors are either rethrown (for logging) or caught silently (for persistence) to maintain pipeline stability.

## Extending the System
- New middleware can be added using `pipeline.use(newMiddleware)`.
- Middleware should remain focused on a single responsibility.
- Always call `await next(context)` unless you explicitly want to short-circuit.

## Example Pipeline
```ts
pipeline.use(loggingMiddleware);
pipeline.use(persistenceMiddleware);
const result = await pipeline.execute('addSnapshot', snapshotData);

Summary

Keep middlewares separate in code for SRP and reusability.

Unified documentation gives a complete view of how all middlewares interact.

Fire-and-forget logging ensures performance is preserved.