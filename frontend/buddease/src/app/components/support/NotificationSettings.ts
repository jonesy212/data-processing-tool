interface NotificationSettings {
  email: boolean; // Enable/disable email notifications
  push: boolean; // Enable/disable push notifications
  sms: boolean; // Enable/disable SMS notifications
  chat: boolean; // Enable/disable chat notifications
  calendar: boolean; // Enable/disable calendar notifications
  audioCall: boolean;
  videoCall: boolean;
  screenShare: boolean;
  mention: boolean;
  reaction: boolean;
  follow: boolean;
  poke: boolean;
  activity: boolean;
  thread: boolean;
  inviteAccepted: boolean;
  task: boolean; // Enable/disable task notifications
  file: boolean; // Enable/disable file notifications
  meeting: boolean; // Enable/disable meeting notifications
  directMessage: boolean;
  announcement: boolean; // Enable/disable announcement notifications
  reminder: boolean; // Enable/disable reminder notifications
  project: boolean; // Enable/disable project notifications
  // Add more notification settings as needed

  enabled: boolean;
  notificationType: "email" | "sms" | "push"; // Example types of notifications
}
