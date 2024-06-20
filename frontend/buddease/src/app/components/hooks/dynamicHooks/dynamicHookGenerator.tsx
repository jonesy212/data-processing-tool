import { ClipboardData, CustomEventExtensionConstructor } from "../../event/BaseCustomEvent";
import { ProjectPhaseTypeEnum } from "../../models/data/StatusType";
import { RealtimeDataItem } from "../../models/realtime/RealtimeData";
import { RootState } from "../../state/redux/slices/RootSlice";
import { updateCallback } from "../../state/stores/CalendarEvent";
import useRealtimeData from "../commHooks/useRealtimeData";
import { AsyncHook } from "../useAsyncHookLinker";
import useResizablePanels from "../userInterface/useResizablePanels";

export type DynamicHookParams<T> = {
  condition: (idleTimeoutDuration: number) => Promise<boolean>;
  asyncEffect: ({
    idleTimeoutId,
    startIdleTimeout,
  }: {
    idleTimeoutId: NodeJS.Timeout | null;
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  }) => Promise<() => void>; 
  cleanup?: () => void;
  resetIdleTimeout: () => Promise<void>;
  idleTimeoutId?: NodeJS.Timeout | null;
  isActive?: boolean;
  intervalId?: number | undefined;
  initialStartIdleTimeout?: (timeoutDuration: number, onTimeout: () => void) => void;
  startIdleTimeout?: (timeoutDuration: number, onTimeout: () => void) => void;
};

export type DynamicHookResult = {
  isActive: boolean;
  animateIn: (selector: string) => void;
  accessToken?: string | number;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetIdleTimeout?: () => void;
  idleTimeoutId: NodeJS.Timeout | null;
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  intervalId?: number;
  toggleActivation: (accessToken?: string | null | undefined) => void;
};

const createDynamicHook = ({
  condition,
  asyncEffect,
  resetIdleTimeout,
  cleanup,
  isActive: initialIsActive,
  startIdleTimeout,
  initialStartIdleTimeout,
}: DynamicHookParams<RootState>): AsyncHook<RootState> => {
  let isActive = initialIsActive !== undefined ? initialIsActive : false;




  // Define the disposeResource function
  const disposeResource = () => {
    console.log("Disposing resources");
    
    // Example logic for disposing of custom event listeners
    const customEventInstance = new CustomEventExtensionConstructor('customEvent');
    if ('removeEventListener' in customEventInstance) {
      customEventInstance.removeEventListener('customEvent', () => {});
    }
    // Clear any clipboard event listeners
    ClipboardData.onCopy = () => {};
    ClipboardData.onPaste = () => {};
  };


  return {
    name: 'Test Hook',
    progress: {
      id: "",
      value: 0,
      label: "Progress",
      name: "Progress",
      color: "#ff5733",
      description: "This is a progress bar",
      current: 0,
      max: 100,
      min: 0,
      percentage: 0,
      done: false,
    },

    phaseType: ProjectPhaseTypeEnum.Test,
    toggleActivation: async () => {},
    startAnimation: () => {},
    stopAnimation: () => {},
    animateIn: () => {},
    condition: condition,
    asyncEffect: async ({
      idleTimeoutId = null,
      startIdleTimeout,
    }: {
      idleTimeoutId: NodeJS.Timeout | null;
      startIdleTimeout: (
        timeoutDuration: number,
        onTimeout: () => void
      ) => void;
    }) => {
      await asyncEffect({ idleTimeoutId, startIdleTimeout });
      return async () => {
        const { handleResize } = useResizablePanels();

        const timeoutId = setTimeout(() => {
          console.log("Timeout executed");
        }, 10000);

        const initialData: RealtimeDataItem[] = [];

        const { fetchData } = useRealtimeData(initialData, updateCallback);

        const intervalId = setInterval(() => {
          fetchData("userId", (action) => {}).catch(console.error);
        }, 5000);

        const cleanupResize = () =>
          window.removeEventListener(
            "resize",
            handleResize as unknown as EventListener
          );

        clearInterval(intervalId);
        clearTimeout(timeoutId);
        cleanupResize();
        disposeResource();
      };
    },
    resetIdleTimeout: resetIdleTimeout,
    idleTimeoutId: null,
    cleanup: cleanup,
    startIdleTimeout: startIdleTimeout ?? (() => {}), // Provide a default function if startIdleTimeout is undefined
    isActive: isActive,
    initialStartIdleTimeout: initialStartIdleTimeout ?? (() => { }), // Provide a default function if initialStartIdleTimeout is undefined
    duration: "1000", // Default duration
  };
};

export default createDynamicHook;
