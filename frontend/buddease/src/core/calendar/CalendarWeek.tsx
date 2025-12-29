// app/components/calendar/CalendarWeek.tsx
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { Task } from '@/core/components/models/tasks/Task';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';

// Simplified interface focusing on week-specific needs
interface WeekViewCoreProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  weekStartDate: Date;
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  events: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  onTaskClick: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onEventClick: (event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  // Add only week-specific handlers
}

const CalendarWeek = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  weekStartDate,
  tasks,
  events,
  onTaskClick,
  onEventClick,
}: WeekViewCoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  
  // Week-specific logic here
  const getDaysOfWeek = () => {
    const days = [];
    const start = new Date(weekStartDate);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const daysOfWeek = getDaysOfWeek();

  return (
    <div className="calendar-week">
      <div className="week-header">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="week-day-header">
            {day.toLocaleDateString('en-US', { weekday: 'short' })}
            <br />
            {day.getDate()}
          </div>
        ))}
      </div>
      
      <div className="week-body">
        {daysOfWeek.map((day, dayIndex) => {
          const dayTasks = tasks.filter(task => 
            task.dueDate && 
            task.dueDate.toDateString() === day.toDateString()
          );
          const dayEvents = events.filter(event =>
            event.startDate.toDateString() === day.toDateString()
          );
          
          return (
            <div key={dayIndex} className="week-day-cell">
              <div className="day-tasks">
                {dayTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="day-task"
                    onClick={() => onTaskClick(task)}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
              <div className="day-events">
                {dayEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="day-event"
                    onClick={() => onEventClick(event)}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWeek;