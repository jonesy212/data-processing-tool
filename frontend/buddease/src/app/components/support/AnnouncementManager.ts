import { useNotification } from "./NotificationContext";

class AnnouncementManager {
  static sendAnnouncement(message: string, sender: string): void {
    const { notify } = useNotification();
    // Use the notification context to send announcements
    notify(message, sender, new Date(), "Announcement");
  }
}

export default AnnouncementManager;
