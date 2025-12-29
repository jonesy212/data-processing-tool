// payloadUtils.ts 
import { Payload, UpdateSnapshotPayload } from '@/core/interfaces/payload/payloadTypes';

const mapToPayload = (updatePayload: UpdateSnapshotPayload<Data<BaseData<any>>>): Payload => {
    return {
      error: updatePayload.error || undefined,
      meta: updatePayload.meta
        ? {
            ...updatePayload.meta,
            name: updatePayload.meta.name,
            timestamp: updatePayload.meta.timestamp,
            type: updatePayload.meta.type,
            startDate: updatePayload.meta.startDate,
            endDate: updatePayload.meta.endDate,
            status: updatePayload.meta.status,
            id: updatePayload.meta.id,
            isSticky: updatePayload.meta.isSticky,
            isDismissable: updatePayload.meta.isDismissable,
            isClickable: updatePayload.meta.isClickable,
            isClosable: updatePayload.meta.isClosable,
            isAutoDismiss: updatePayload.meta.isAutoDismiss,
            isAutoDismissable: updatePayload.meta.isAutoDismissable,
            isAutoDismissOnNavigation: updatePayload.meta.isAutoDismissOnNavigation,
            isAutoDismissOnAction: updatePayload.meta.isAutoDismissOnAction,
            isAutoDismissOnTimeout: updatePayload.meta.isAutoDismissOnTimeout,
            isAutoDismissOnTap: updatePayload.meta.isAutoDismissOnTap,
            optionalData: updatePayload.meta.optionalData,
            data: updatePayload.meta.data,
          }
        : undefined,
    };
  };
  

  export { mapToPayload };
