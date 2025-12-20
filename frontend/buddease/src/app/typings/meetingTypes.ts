// meetingTypes.ts

import { MeetingBaseParams } from '@/app/typings/entities/MeetingEntity';
import { Meeting } from '@/app/components/communications/scheduler/Meeting';
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { Todo } from '@/app/todos/Todo';

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
  AppMeeting,
  AppCalendarEvent,
  AppTodo
};