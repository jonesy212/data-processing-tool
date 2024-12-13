// ActionHandlerService.ts
// Define the Action Handlers
type ActionHandler<T extends { type: string }> = (action: T) => void;

class ActionHandlerService<T extends { type: string }> {
  private handlers: Record<string, ActionHandler<T> | undefined> = {};

  // Register a new action type with its handler
  register<K extends T['type']>(actionType: K, handler: ActionHandler<Extract<T, { type: K }>>) {
    this.handlers[actionType] = handler as ActionHandler<T>;
  }
  // Handle an action dynamically
  handle(action: T) {
    const handler = this.handlers[action.type];
    if (handler) {
      handler(action);
    } else {
      console.error(`No handler registered for action type: ${action.type}`);
    }
  }
}
