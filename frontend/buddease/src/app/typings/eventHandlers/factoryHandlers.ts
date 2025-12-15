// factoryHandlers.ts
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { ReactiveEventHandler } from '@/app/typings/eventHandlers/eventTypes'
import { ReactiveMouseEvent } from '@/app/typings/eventHandlers/eventTypes'
import { AppMessage } from '@/app/typings/entities/MessageEntity'

const isReactiveEventHandler = (
  handler: ReactiveEventHandler | EventListenerOrEventListenerObject
): handler is ReactiveEventHandler => {
  return typeof (handler as any).preventDefault !== "undefined";
};

const createEventHandler =
  (
    eventName: string,
    customLogic?: (event: React.MouseEvent<HTMLElement> | MouseEvent) => void
  ) =>
  (event: React.MouseEvent<HTMLElement> | MouseEvent) => {
    const message: Partial<AppMessage> = {  // Use specific type
      content: `Event '${eventName}' occurred. Details: ${JSON.stringify(
        event
      )}`,
    };
    if (customLogic) {
      customLogic(event);
    }
  };

const generateNextPhaseRoute = (condition: boolean, dynamicData: any): string => {
  // Logic to generate the next phase route based on condition and dynamic data
  if (condition) {
    // For example, if condition is true, append dynamic data to the route
    return `/next-phase/${dynamicData}`;
  } else {
    // Otherwise, return a default route
    return '/default-next-phase-route';
  }
};

function stopImmediatePropagation(
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
): void {
  event.stopPropagation(); // Stop the propagation of the event
  event.nativeEvent.stopImmediatePropagation(); // Stop the immediate propagation of the event
}

// Function to check if the event is of type ReactiveMouseEvent
function isReactiveMouseEvent(event: any): event is ReactiveMouseEvent {
  return (event as ReactiveMouseEvent).settings !== undefined;
}

// Export all the functions
export { 
  isReactiveEventHandler,
  createEventHandler,
  generateNextPhaseRoute,
  stopImmediatePropagation,
  isReactiveMouseEvent
};