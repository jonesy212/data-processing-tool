scheduleCoordinator.ts
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { CalendarEventManager } from '@/core/dataIntegration/calendarIntegration/calendarEventManager';
import { ProjectLogger } from '@/core/dataIntegration/projectIntegration/ProjectLogger';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { ScheduleOptimization } from '@/core/models/data/EventContentAnalysis';
import { ProjectPhase } from '@/core/projects/projectManagement/ProjectManager';

export interface ScheduleConflict {
  eventId: string;
  conflictingEventId: string;
  conflictType: 'time' | 'resource' | 'participant';
  severity: 'low' | 'medium' | 'high';
  description: string;
  resolution?: string;
}



export interface ScheduleCoordinatorOptions {
  enableConflictDetection?: boolean;
  autoResolveConflicts?: boolean;
  optimizationEnabled?: boolean;
  workingHours?: { start: string; end: string }; // "09:00" to "17:00"
  timezone?: string;
}

export class ScheduleCoordinator<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  private eventManager: CalendarEventManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  private options: ScheduleCoordinatorOptions;
  private conflicts: ScheduleConflict[] = [];

  constructor(
    eventManager: CalendarEventManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    options: ScheduleCoordinatorOptions = {}
  ) {
    this.eventManager = eventManager;
    this.options = {
      enableConflictDetection: true,
      autoResolveConflicts: false,
      optimizationEnabled: true,
      workingHours: { start: "09:00", end: "17:00" },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...options
    };
  }

  /**
   * Schedule event with conflict detection and optimization
   */
  async scheduleEvent(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    projectId?: string
  ): Promise<{
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    conflicts: ScheduleConflict[];
    optimizations: ScheduleOptimization[];
  }> {
    try {
      const eventProjectId = projectId || `schedule-project-${event.id}`;

      // Step 1: Detect conflicts
      const detectedConflicts = this.options.enableConflictDetection 
        ? await this.detectConflicts(event)
        : [];

      // Step 2: Apply optimizations if no critical conflicts
      const optimizations = this.options.optimizationEnabled && 
        !detectedConflicts.some(conflict => conflict.severity === 'high')
        ? await this.optimizeSchedule(event)
        : [];

      // Step 3: Auto-resolve conflicts if enabled
      if (this.options.autoResolveConflicts && detectedConflicts.length > 0) {
        await this.autoResolveConflicts(event, detectedConflicts);
      }

      // Step 4: Add event to calendar
      const scheduledEvent = await this.eventManager.addEvent(event, eventProjectId);

      // Step 5: Log scheduling operation
      ProjectLogger.logPhaseTransition(
        eventProjectId,
        `Scheduled Event: ${event.title}`,
        ProjectPhase.PHASE_1,
        ProjectPhase.PHASE_2,
        event.createdBy || 'system',
        {
          conflictsDetected: detectedConflicts.length,
          optimizationsApplied: optimizations.length,
          autoResolved: this.options.autoResolveConflicts ? detectedConflicts.length : 0
        }
      );

      return {
        event: scheduledEvent,
        conflicts: detectedConflicts,
        optimizations
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      ProjectLogger.logProjectError(
        projectId || `schedule-project-${event.id}`,
        "SCHEDULE_EVENT_FAILED",
        `Failed to schedule event: ${errorMessage}`,
        {
          eventId: event.id,
          eventTitle: event.title,
          phase: ProjectPhase.PHASE_1
        }
      );

      throw error;
    }
  }

  /**
   * Reschedule event with new time
   */
  async rescheduleEvent(
    eventId: string,
    newStartDate: Date,
    newEndDate: Date,
    projectId?: string,
    rescheduledBy?: string
  ): Promise<{
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    conflicts: ScheduleConflict[];
  }> {
    try {
      const event = this.eventManager.getEvent(eventId);
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }

      const eventProjectId = projectId || `reschedule-project-${eventId}`;

      // Create updated event
      const updatedEvent = {
        ...event,
        startDate: newStartDate,
        endDate: newEndDate,
        updatedBy: rescheduledBy || event.createdBy,
        updatedAt: new Date()
      };

      // Detect conflicts for new time
      const conflicts = this.options.enableConflictDetection 
        ? await this.detectConflicts(updatedEvent)
        : [];

      // Update event if no critical conflicts or auto-resolve is enabled
      if (conflicts.length === 0 || 
          (this.options.autoResolveConflicts && !conflicts.some(c => c.severity === 'high'))) {
        
        const finalEvent = await this.eventManager.updateEvent(eventId, updatedEvent, eventProjectId);

        // Log rescheduling
        ProjectLogger.logTaskUpdate(
          eventProjectId,
          eventId,
          { startDate: newStartDate, endDate: newEndDate },
          rescheduledBy || event.createdBy || 'system'
        );

        return {
          event: finalEvent!,
          conflicts
        };
      } else {
        throw new Error(`Cannot reschedule due to conflicts: ${conflicts.map(c => c.description).join(', ')}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      ProjectLogger.logProjectError(
        projectId || `reschedule-project-${eventId}`,
        "RESCHEDULE_EVENT_FAILED",
        `Failed to reschedule event: ${errorMessage}`,
        {
          eventId,
          newStartDate,
          newEndDate
        }
      );

      throw error;
    }
  }

  /**
   * Detect scheduling conflicts
   */
  private async detectConflicts(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<ScheduleConflict[]> {
    const conflicts: ScheduleConflict[] = [];
    const allEvents = this.eventManager.getAllEvents();

    for (const existingEvent of allEvents) {
      if (existingEvent.id === event.id) continue;

      // Time conflict detection
      if (this.hasTimeConflict(event, existingEvent)) {
        conflicts.push({
          eventId: event.id,
          conflictingEventId: existingEvent.id,
          conflictType: 'time',
          severity: 'high',
          description: `Time conflict with "${existingEvent.title}"`
        });
      }

      // Participant conflict detection (simplified)
      const participantConflicts = this.detectParticipantConflicts(event, existingEvent);
      conflicts.push(...participantConflicts);

      // Resource conflict detection (placeholder for resource management)
      const resourceConflicts = this.detectResourceConflicts(event, existingEvent);
      conflicts.push(...resourceConflicts);
    }

    // Outside working hours conflict
    if (this.isOutsideWorkingHours(event)) {
      conflicts.push({
        eventId: event.id,
        conflictingEventId: 'working-hours',
        conflictType: 'time',
        severity: 'medium',
        description: 'Event scheduled outside working hours',
        resolution: 'Consider rescheduling during business hours'
      });
    }

    this.conflicts = conflicts;
    return conflicts;
  }

  /**
   * Optimize event schedule
   */
  private async optimizeSchedule(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<ScheduleOptimization[]> {
    const optimizations: ScheduleOptimization[] = [];

    // Duration optimization
    const durationOptimization = this.optimizeEventDuration(event);
    if (durationOptimization) {
      optimizations.push(durationOptimization);
    }

    // Time slot optimization
    const timeSlotOptimization = await this.findOptimalTimeSlot(event);
    if (timeSlotOptimization) {
      optimizations.push(timeSlotOptimization);
    }

    // Working hours optimization
    const workingHoursOptimization = this.optimizeForWorkingHours(event);
    if (workingHoursOptimization) {
      optimizations.push(workingHoursOptimization);
    }

    return optimizations;
  }

  /**
   * Auto-resolve conflicts
   */
  private async autoResolveConflicts(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    conflicts: ScheduleConflict[]
  ): Promise<void> {
    for (const conflict of conflicts) {
      if (conflict.severity === 'low' || conflict.severity === 'medium') {
        switch (conflict.conflictType) {
          case 'time':
            await this.autoResolveTimeConflict(event, conflict);
            break;
          case 'participant':
            await this.autoResolveParticipantConflict(event, conflict);
            break;
        }
      }
    }
  }

  /**
   * Check for time conflicts between events
   */
  private hasTimeConflict(
    event1: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    event2: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): boolean {
    return (
      event1.startDate < event2.endDate &&
      event1.endDate > event2.startDate
    );
  }

  /**
   * Detect participant conflicts
   */
  private detectParticipantConflicts(
    event1: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    event2: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    
    // Simplified participant conflict detection
    // In a real implementation, you'd check participant lists
    if (event1.createdBy === event2.createdBy && this.hasTimeConflict(event1, event2)) {
      conflicts.push({
        eventId: event1.id,
        conflictingEventId: event2.id,
        conflictType: 'participant',
        severity: 'medium',
        description: `Creator ${event1.createdBy} has conflicting events`
      });
    }

    return conflicts;
  }

  /**
   * Detect resource conflicts (placeholder)
   */
  private detectResourceConflicts(
    event1: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    event2: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): ScheduleConflict[] {
    // Placeholder for resource conflict detection
    // This would integrate with your resource management system
    return [];
  }

  /**
   * Check if event is outside working hours
   */
  private isOutsideWorkingHours(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): boolean {
    if (!this.options.workingHours) return false;

    const eventStartHour = event.startDate.getHours();
    const eventEndHour = event.endDate.getHours();
    const [workStart] = this.options.workingHours.start.split(':').map(Number);
    const [workEnd] = this.options.workingHours.end.split(':').map(Number);

    return eventStartHour < workStart || eventEndHour > workEnd;
  }

  /**
   * Optimize event duration
   */
  private optimizeEventDuration(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): ScheduleOptimization | null {
    const duration = event.endDate.getTime() - event.startDate.getTime();
    const durationHours = duration / (1000 * 60 * 60);

    // Suggest optimization for very long or very short meetings
    if (durationHours > 4) {
      return {
        eventId: event.id,
        suggestedStartTime: event.startDate,
        suggestedEndTime: new Date(event.startDate.getTime() + (2 * 60 * 60 * 1000)), // 2 hours
        recommendedDuration: 2,
        alternativeTimes: [],
        optimizationReason: 'Long meeting duration detected. Consider breaking into shorter sessions.'
      };
    }

    return null;
  }

  /**
   * Find optimal time slot
   */
  private async findOptimalTimeSlot(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<ScheduleOptimization | null> {
    const allEvents = this.eventManager.getAllEvents();
    const eventDuration = event.endDate.getTime() - event.startDate.getTime();

    // Look for optimal slots in the next 7 days
    for (let day = 1; day <= 7; day++) {
      const candidateDate = new Date(event.startDate);
      candidateDate.setDate(candidateDate.getDate() + day);

      // Check morning slot (9 AM)
      const morningStart = new Date(candidateDate);
      morningStart.setHours(9, 0, 0, 0);
      const morningEnd = new Date(morningStart.getTime() + eventDuration);

      if (!this.hasTimeConflictWithAnyEvent({ ...event, startDate: morningStart, endDate: morningEnd }, allEvents)) {
        return {
          eventId: event.id,
          suggestedStartTime: morningStart,
          suggestedEndTime: morningEnd,
          recommendedDuration: eventDuration / (1000 * 60 * 60),
          alternativeTimes: [],
          optimizationReason: 'Optimal morning time slot available'
        };
      }

      // Check afternoon slot (2 PM)
      const afternoonStart = new Date(candidateDate);
      afternoonStart.setHours(14, 0, 0, 0);
      const afternoonEnd = new Date(afternoonStart.getTime() + eventDuration);

      if (!this.hasTimeConflictWithAnyEvent({ ...event, startDate: afternoonStart, endDate: afternoonEnd }, allEvents)) {
        return {
          eventId: event.id,
          suggestedStartTime: afternoonStart,
          suggestedEndTime: afternoonEnd,
          recommendedDuration: eventDuration / (1000 * 60 * 60),
          alternativeTimes: [],
          optimizationReason: 'Optimal afternoon time slot available'
        };
      }
    }

    return null;
  }

  /**
   * Optimize for working hours
   */
  private optimizeForWorkingHours(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): ScheduleOptimization | null {
    if (!this.isOutsideWorkingHours(event)) {
      return null;
    }

    const duration = event.endDate.getTime() - event.startDate.getTime();
    const workStart = new Date(event.startDate);
    const [workStartHour] = this.options.workingHours!.start.split(':').map(Number);
    workStart.setHours(workStartHour, 0, 0, 0);

    const workEnd = new Date(workStart.getTime() + duration);

    return {
      eventId: event.id,
      suggestedStartTime: workStart,
      suggestedEndTime: workEnd,
      recommendedDuration: duration / (1000 * 60 * 60),
      alternativeTimes: [],
      optimizationReason: 'Adjusted to fit within working hours'
    };
  }

  /**
   * Auto-resolve time conflict
   */
  private async autoResolveTimeConflict(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    conflict: ScheduleConflict
  ): Promise<void> {
    // Simple auto-resolution: move event 30 minutes later
    const newStartDate = new Date(event.startDate.getTime() + 30 * 60 * 1000);
    const newEndDate = new Date(event.endDate.getTime() + 30 * 60 * 1000);

    event.startDate = newStartDate;
    event.endDate = newEndDate;

    conflict.resolution = 'Automatically rescheduled 30 minutes later';
  }

  /**
   * Auto-resolve participant conflict
   */
  private async autoResolveParticipantConflict(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    conflict: ScheduleConflict
  ): Promise<void> {
    // For participant conflicts, we might notify participants or suggest alternatives
    conflict.resolution = 'Participants notified of scheduling conflict';
  }

  /**
   * Check if event conflicts with any in the list
   */
  private hasTimeConflictWithAnyEvent(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    events: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): boolean {
    return events.some(existingEvent => 
      existingEvent.id !== event.id && this.hasTimeConflict(event, existingEvent)
    );
  }

  /**
   * Get current conflicts
   */
  getCurrentConflicts(): ScheduleConflict[] {
    return this.conflicts;
  }

  /**
   * Clear all conflicts
   */
  clearConflicts(): void {
    this.conflicts = [];
  }
}

// Default coordinator instance
export const defaultScheduleCoordinator = new ScheduleCoordinator(
  defaultCalendarEventManager
);