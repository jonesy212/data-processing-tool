// CalendarWeek.tsx
// WeekView.jsx
import React from 'react';
import { CommonCalendarProps } from '@/app/components/calendar/Calendar';
import { CalendarEvent } from '@/app/calendar/CalendarEvent'
import CalendarWeek from '@/app/calendar/CalendarWeek';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';


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
