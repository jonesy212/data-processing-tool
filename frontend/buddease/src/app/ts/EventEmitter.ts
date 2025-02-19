import { BrandingSettings, brandingSettings } from "../components/projects/branding/BrandingSettings";
// import { brandingSettings } from "../libraries/theme/BrandingService";
interface ProjectEventData {
  projectId: string;
  eventName: string;
  eventData: any;
}

class ProjectEventEmitter {
  private events: Record<string, Function[]>;

  constructor() {
    this.events = {};
  }

  on(eventName: string, callback: Function): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  emit(eventName: string, eventData: any): void {
    const eventHandlers = this.events[eventName];
    if (eventHandlers) {
      eventHandlers.forEach((handler) => handler(eventData));
    }
  }

  getEventIds(): string[] {
    return Object.keys(this.events);
  }



  
  // Extend to handle project-specific events
  emitProjectEvent(eventData: ProjectEventData): void {
    const { projectId, eventName, eventData: projectEventData } = eventData;
    const projectEventName = `${projectId}:${eventName}`;
    this.emit(projectEventName, projectEventData);
  }
}
const projectEventEmitter = new ProjectEventEmitter();

// Usage example:
const projectId = "exampleProjectId";

const eventName = "taskAdded";
const eventData = { taskId: "123", taskName: "Example Task" };

// Emit project event
projectEventEmitter.emitProjectEvent({ projectId, eventName, eventData });
// Initialize ProjectEventEmitter instance

// Function to trigger theme change event
const triggerThemeChangeEvent = (
  projectId: string,
  brandingSettings: BrandingSettings
): void => {
  // Emit a project-specific event to notify other parts of the application about the theme change
  projectEventEmitter.emitProjectEvent({
    projectId,
    eventName: "themeChange",
    eventData: brandingSettings,
  });
};

// Trigger theme change event with brandingSettings for the specific project
triggerThemeChangeEvent(projectId, brandingSettings);

export default ProjectEventEmitter;
