// CommonEvent.ts

import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

interface CommonEvent {
    id: string;
    title: string;
    description?: string;

    // Shared date properties
    startDate?: Date;
    endDate?: Date;
    date: Date;

    // Shared time properties
    startTime?: string;
    endTime?: string;

    // Recurrence properties
    recurring?: boolean;
    recurrenceRule?: string;

    // Other common properties
    category?: string;
    timezone?: string;
    participants?: string[];
    language?: string;
    agenda?: string;
    collaborationTool?: string;
    metadata: StructuredMetadata;

}

export default CommonEvent;
