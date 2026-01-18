// TrainingSession.tsx

// Define the TrainingSession class
class TrainingSession {
    private sessionId: string;
    private sessionTopic: string;
    private sessionDate: Date;
    private attendees: string[];
  
    constructor(sessionId: string, sessionTopic: string, sessionDate: Date) {
      this.sessionId = sessionId;
      this.sessionTopic = sessionTopic;
      this.sessionDate = sessionDate;
      this.attendees = []; // Initialize attendees as an empty array
    }
  
    // Method to add an attendee to the training session
    addAttendee(attendee: string): void {
      this.attendees.push(attendee);
    }
  
    // Method to remove an attendee from the training session
    removeAttendee(attendee: string): void {
      const index = this.attendees.indexOf(attendee);
      if (index !== -1) {
        this.attendees.splice(index, 1);
      }
    }
  
    // Method to get the number of attendees in the training session
    getAttendeeCount(): number {
      return this.attendees.length;
    }
  }

  
// Example usage of TrainingSession
const sessionDate = new Date('2024-04-20');
const trainingSession = new TrainingSession("TS-001", "Data Security Best Practices", sessionDate);
trainingSession.addAttendee("John");
trainingSession.addAttendee("Alice");
trainingSession.addAttendee("Bob");
console.log(`Number of attendees: ${trainingSession.getAttendeeCount()}`);
trainingSession.removeAttendee("Alice");
console.log(`Number of attendees after removal: ${trainingSession.getAttendeeCount()}`);