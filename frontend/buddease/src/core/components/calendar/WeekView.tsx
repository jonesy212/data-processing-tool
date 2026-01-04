CalendarWeek.tsx
WeekView.jsx
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import CalendarWeek from '@/core/calendar/CalendarWeek';
import { CommonCalendarProps } from '@/core/components/calendar/Calendar';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import React from 'react';


interface WeekViewProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> extends CommonCalendarProps<CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  weekStartDate: Date;
  events: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

const WeekView: React.FC<WeekViewProps> = ({ weekStartDate, events, ...taskHandlers }) => {
  return (
    <div>
      <h2>Week View</h2>
      {/* Display tasks and events for the week */}
      <CalendarWeek
        weekStartDate={weekStartDate}
        events={events}
        {...taskHandlers} // Pass taskHandlers to CalendarWeek
      />
    </div>
  );
};

export default WeekView;
