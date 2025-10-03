interface MeetingsSettings {
  enableMeetings: boolean;
  meetingPlatform: "zoom" | "teams" | "googleMeet" | "custom"; // Preferred meeting platform
  customMeetingPlatformDetails?: string; // Custom details for the meeting platform if 'custom' is selected
  recurringMeetings: boolean; // Enable recurring meetings
  meetingDuration: number; // Default meeting duration in minutes
  meetingReminders: "email" | "slack" | "custom"; // Preferred method of meeting reminders
  customReminderSettings?: string; // Custom reminder settings if method is 'custom'
  agendaManagement: "centralized" | "decentralized" | "custom"; // Approach to agenda management
  customAgendaManagementDetails?: string; // Custom details for agenda management if 'custom' is selected
  meetingNotesEnabled: boolean; // Enable meeting notes
  recordingEnabled: boolean; // Enable meeting recordings
  // Add any other specific settings for meetings based on project needs
}

// Example usage
const meetingsSettings: MeetingsSettings = {
  enableMeetings: true,
  meetingPlatform: "zoom",
  recurringMeetings: true,
  meetingDuration: 60,
  meetingReminders: "slack",
  agendaManagement: "centralized",
  meetingNotesEnabled: true,
  recordingEnabled: false,
  // Add other specific settings based on your project needs
};
