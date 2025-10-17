import { ParsedData } from "@/app/crypto/dataIntegration";
import { YourResponseType, YourSettingsResponseType } from '@/app/typings/responseTypes';

function isYourSettingsResponseType<
  T extends BaseDataEntity = AppEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
    data: ParsedData<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): data is ParsedData<YourSettingsResponseType<T, K, Meta, AttachmentType, ExcludedFields>> {
    return (
        data.data !== undefined &&
        typeof data.data.id === "string" &&
        typeof data.data.appName === "string" &&
        typeof data.data.pageNumber === "string" &&
        Array.isArray(data.data.calendarEvents) &&
        Array.isArray(data.data.todos) &&
        Array.isArray(data.data.tasks) &&
        Array.isArray(data.data.snapshotStores) &&
        (typeof data.data.currentPhase === "string" || data.data.currentPhase === null) &&
        typeof data.data.comment === "string" &&
        typeof data.data.browserCheckStore === "object" &&
        typeof data.data.trackerStore === "object" &&
        typeof data.data.todoStore === "object" &&
        typeof data.data.taskManagerStore === "object" &&
        typeof data.data.iconStore === "object" &&
        typeof data.data.calendarStore === "object"
    );
}


function convertToYourSettingsResponseType(
    data: ParsedData<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): YourSettingsResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return {
        id: data.id,
        appName: data.appName,
        // Populate other properties as necessary...
        calendarEvents: data.calendarEvents,
        todos: data.todos,
        tasks: data.tasks,
        snapshotStores: data.snapshotStores,
        pageNumber: data.pageNumber,
        currentPhase: data.currentPhase,
        comment: data.comment,
        browserCheckStore: data.browserCheckStore,
       
        trackerStore: data.trackerStore,
        todoStore: data.todoStore,
        taskManagerStore: data.taskManagerStore,
        iconStore: data.iconStore,
       
        // Include any other necessary properties here...
    };
}

export {
  convertToYourSettingsResponseType, isYourSettingsResponseType
};
