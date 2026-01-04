meetingTypes.ts

import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { Meeting } from '@/core/components/communications/scheduler/Meeting';
import { Todo } from '@/core/todos/Todo';
import { MeetingBaseParams } from '@/core/typings/entities/MeetingEntity';

type AppMeeting = Meeting<
  MeetingBaseParams['T'],
  MeetingBaseParams['K'],
  MeetingBaseParams['Meta'],
  MeetingBaseParams['AttachmentType'],
  MeetingBaseParams['ExcludedFields'],
  MeetingBaseParams['IncludedFields']
>;

type AppCalendarEvent = CalendarEvent<
  MeetingBaseParams['T'],
  MeetingBaseParams['K'],
  MeetingBaseParams['Meta'],
  MeetingBaseParams['AttachmentType'],
  MeetingBaseParams['ExcludedFields'],
  MeetingBaseParams['IncludedFields']
>;

type AppTodo = Todo<
  MeetingBaseParams['T'],
  MeetingBaseParams['K'],
  MeetingBaseParams['Meta'],
  MeetingBaseParams['AttachmentType'],
  MeetingBaseParams['ExcludedFields'],
  MeetingBaseParams['IncludedFields']
>;

export type {
    AppCalendarEvent, AppMeeting, AppTodo
};
