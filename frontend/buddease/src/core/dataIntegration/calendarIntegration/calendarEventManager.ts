// calendarEventManager.ts
import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { ProjectLogger } from '@/core/dataIntegration/projectIntegration/ProjectLogger';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { AllStatus, StatusType } from '@/core/models/data/StatusType';
import { Member } from '@/core/models/members/Member';
import { ProjectPhase } from '@/core/projects/projectManagement/ProjectManager';
import type { Snapshot } from '@/core/snapshots/Snapshot';

export interface CalendarEventManagerOptions {
  enableRealTimeUpdates?: boolean;
  autoSync?: boolean;
  enableProjectIntegration?: boolean;
  validationStrict?: boolean;
}

export class CalendarEventManager<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  private events: Map<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = new Map();
  private options: CalendarEventManagerOptions;

  constructor(options: CalendarEventManagerOptions = {}) {
    this.options = {
      enableRealTimeUpdates: true,
      autoSync: true,
      enableProjectIntegration: true,
      validationStrict: false,
      ...options
    };
  }

  /**
   * Add a calendar event with project integration
   */
  async addEvent(
    event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    projectId?: string
  ): Promise<CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    try {
      // Validate event structure
      const validationResult = this.validateEvent(event);
      if (!validationResult.isValid) {
        throw new Error(`Invalid event structure: ${validationResult.errors.join(', ')}`);
      }

      // Generate project ID if not provided
      const eventProjectId = projectId || `calendar-project-${event.id || Date.now()}`;

      // Log event creation
      ProjectLogger.logProjectCreation(
        eventProjectId,
        `Calendar Event: ${event.title}`,
        ProjectPhase.PHASE_1,
        event.createdBy || 'system',
        {
          eventId: event.id,
          eventTitle: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          participants: event.participants?.length || 0
        }
      );

      // Store the event
      this.events.set(event.id, event);

      // Log successful event addition
      ProjectLogger.logTaskCreation(
        eventProjectId,
        event.id,
        `Calendar event: ${event.title}`,
        event.createdBy,
        this.calculateEventDuration(event)
      );

      return event;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      ProjectLogger.logProjectError(
        projectId || `calendar-project-${event.id}`,
        "CALENDAR_EVENT_ADD_FAILED",
        `Failed to add calendar event: ${errorMessage}`,
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
   * Update calendar event
   */
  async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    projectId?: string
  ): Promise<CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    try {
      const existingEvent = this.events.get(eventId);
      if (!existingEvent) {
        throw new Error(`Event with ID ${eventId} not found`);
      }

      const updatedEvent = { ...existingEvent, ...updates, updatedAt: new Date() };

      // Validate updated event
      const validationResult = this.validateEvent(updatedEvent);
      if (!validationResult.isValid) {
        throw new Error(`Invalid event updates: ${validationResult.errors.join(', ')}`);
      }

      // Store updated event
      this.events.set(eventId, updatedEvent);

      // Log event update
      ProjectLogger.logTaskUpdate(
        projectId || `calendar-project-${eventId}`,
        eventId,
        Object.keys(updates),
        updates.updatedBy || existingEvent.createdBy || 'system'
      );

      return updatedEvent;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      ProjectLogger.logProjectError(
        projectId || `calendar-project-${eventId}`,
        "CALENDAR_EVENT_UPDATE_FAILED",
        `Failed to update calendar event: ${errorMessage}`,
        {
          eventId,
          updates: Object.keys(updates)
        }
      );

      throw error;
    }
  }

  /**
   * Remove calendar event
   */
  async removeEvent(eventId: string, projectId?: string, removedBy?: string): Promise<boolean> {
    try {
      const event = this.events.get(eventId);
      if (!event) {
        return false;
      }

      this.events.delete(eventId);

      // Log event removal
      ProjectLogger.logTaskCompletion(
        projectId || `calendar-project-${eventId}`,
        eventId,
        `Calendar event: ${event.title}`,
        removedBy || event.createdBy || 'system',
        this.calculateEventDuration(event),
        'Event removed from calendar'
      );

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      ProjectLogger.logProjectError(
        projectId || `calendar-project-${eventId}`,
        "CALENDAR_EVENT_REMOVE_FAILED",
        `Failed to remove calendar event: ${errorMessage}`,
        {
          eventId
        }
      );

      throw error;
    }
  }

  /**
   * Convert snapshot to calendar event
   */
  async convertSnapshotToCalendarEvent(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    projectId?: string
  ): Promise<CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    try {
      const eventProjectId = projectId || `snapshot-calendar-project-${snapshot.id}`;

      // Extract event data from snapshot
      const eventData = this.extractEventDataFromSnapshot(snapshot);

      // Create calendar event from snapshot data
      const calendarEvent: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
        id: snapshot.id?.toString() || `event-${Date.now()}`,
        title: eventData.title || 'Untitled Event',
        startDate: eventData.startDate || new Date(),
        endDate: eventData.endDate || new Date(),
        description: eventData.description,
        status: eventData.status || StatusType.Pending,
        createdBy: eventData.createdBy || 'system',
        participants: eventData.participants || [],
        metadata: snapshot.meta as Meta,
        ...eventData
      };

      // Log conversion
      ProjectLogger.logSnapshotConversion(
        eventProjectId,
        snapshot.id?.toString() || 'unknown',
        'import',
        true,
        {
          snapshotType: snapshot.type,
          convertedEventTitle: calendarEvent.title
        }
      );

      return calendarEvent;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      ProjectLogger.logProjectError(
        projectId || `snapshot-calendar-project-${snapshot.id}`,
        "SNAPSHOT_TO_CALENDAR_CONVERSION_FAILED",
        `Failed to convert snapshot to calendar event: ${errorMessage}`,
        {
          snapshotId: snapshot.id,
          snapshotType: snapshot.type
        }
      );

      throw error;
    }
  }

  /**
   * Batch process calendar events
   */
  async batchProcessEvents(
    events: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    operation: 'add' | 'update' | 'remove',
    projectId?: string
  ): Promise<{
    successful: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    failed: { event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; error: string }[];
  }> {
    const successful: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
    const failed: { event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; error: string }[] = [];

    for (const event of events) {
      try {
        let result: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | boolean | null = null;

        switch (operation) {
          case 'add':
            result = await this.addEvent(event, projectId);
            break;
          case 'update':
            result = await this.updateEvent(event.id, event, projectId);
            break;
          case 'remove':
            result = await this.removeEvent(event.id, projectId);
            break;
        }

        if (result && typeof result !== 'boolean') {
          successful.push(result);
        } else if (result === true) {
          // For remove operations that return boolean
          successful.push(event);
        }
      } catch (error) {
        failed.push({
          event,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log batch operation
    ProjectLogger.logBatchOperation(
      `calendar_events_${operation}`,
      events.length,
      successful.length,
      failed.length,
      'system',
      undefined
    );

    return { successful, failed };
  }

  /**
   * Get event by ID
   */
  getEvent(eventId: string): CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    return this.events.get(eventId);
  }

  /**
   * Get all events
   */
  getAllEvents(): CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return Array.from(this.events.values());
  }

  /**
   * Get events by status
   */
  getEventsByStatus(status: AllStatus): CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.getAllEvents().filter(event => event.status === status);
  }

  /**
   * Get events by date range
   */
  getEventsByDateRange(startDate: Date, endDate: Date): CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.getAllEvents().filter(event => 
      event.startDate >= startDate && event.endDate <= endDate
    );
  }

  /**
   * Validate event structure
   */
  private validateEvent(event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!event.id) {
      errors.push('Event ID is required');
    }

    if (!event.title) {
      errors.push('Event title is required');
    }

    if (!event.startDate) {
      errors.push('Start date is required');
    }

    if (!event.endDate) {
      errors.push('End date is required');
    }

    if (event.startDate && event.endDate && event.startDate > event.endDate) {
      errors.push('Start date cannot be after end date');
    }

    if (!event.status) {
      errors.push('Event status is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Extract event data from snapshot
   */
  private extractEventDataFromSnapshot(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    status?: AllStatus;
    createdBy?: string;
    participants?: Member<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  } {
    // Extract event data from snapshot based on your data structure
    const data = snapshot.data as any;
    
    return {
      title: data.title || data.name,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: data.status,
      createdBy: data.createdBy,
      participants: data.participants
    };
  }

  /**
   * Calculate event duration in hours
   */
  private calculateEventDuration(event: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): number {
    if (!event.startDate || !event.endDate) return 0;
    
    const durationMs = event.endDate.getTime() - event.startDate.getTime();
    return durationMs / (1000 * 60 * 60); // Convert to hours
  }

  /**
   * Clear all events (for testing/reset)
   */
  clearAllEvents(): void {
    this.events.clear();
    
    ProjectLogger.logBatchOperation(
      "calendar_events_clear",
      this.events.size,
      this.events.size,
      0,
      "system",
      undefined
    );
  }
}

// Default instance with common types
export const defaultCalendarEventManager = new CalendarEventManager<
  BaseDataEntity,
  BaseDataEntity,
  StructuredMetadata<any, any>,
  Attachment,
  never,
  keyof BaseDataEntity
>();