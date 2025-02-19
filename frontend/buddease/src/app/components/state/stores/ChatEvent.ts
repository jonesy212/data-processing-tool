// ChatEvent.ts
class ChatEvent {
    eventId: string;
    eventName: string;
    eventDescription: string;
    eventDate: Date;
    
    constructor(eventId: string, eventName: string, eventDescription: string, eventDate: Date) {
      this.eventId = eventId;
      this.eventName = eventName;
      this.eventDescription = eventDescription;
      this.eventDate = eventDate;
    }
    
    // Getter methods
    getEventId(): string {
      return this.eventId;
    }
    
    getEventName(): string {
      return this.eventName;
    }
    
    getEventDescription(): string {
      return this.eventDescription;
    }
    
    getEventDate(): Date {
      return this.eventDate;
    }
    
    // Setter methods
    setEventName(eventName: string): void {
      this.eventName = eventName;
    }
    
    setEventDescription(eventDescription: string): void {
      this.eventDescription = eventDescription;
    }
    
    setEventDate(eventDate: Date): void {
      this.eventDate = eventDate;
    }
  }
  
  export default ChatEvent;
  