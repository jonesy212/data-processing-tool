// dynamicHookGenerator.tsx
import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { ClipboardData } from '@/core/events/BaseCustomEvent';
import { CustomEventExtensionConstructor } from '@/core/events/BaseCustomEvent';
import useRealtimeData from "@/core/hooks/commHooks/useRealtimeData";
import { updateCallback } from "@/core/hooks/commHooks/useUIRealtimeData";
import { AsyncHook } from "@/core/hooks/useAsyncHookLinker";
import useResizablePanels from "@/core/hooks/userInterface/useResizablePanels";
import type { ProjectPhaseTypeEnum } from "@/core/models/data/StatusType";
import type { RootState } from "@/core/state/redux/slices/RootSlice";
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';

export type DynamicHookParams<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> = {
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

const createDynamicHook = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>({

  condition,
  asyncEffect,
  resetIdleTimeout,
  cleanup,
  isActive: initialIsActive,
  startIdleTimeout,
  initialStartIdleTimeout,
}: DynamicHookParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): AsyncHook<RootState> => {
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

        const initialData: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

        const { fetchData } = useRealtimeData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
          initialData, 
          updateCallback as RealtimeUpdateCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        );
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
