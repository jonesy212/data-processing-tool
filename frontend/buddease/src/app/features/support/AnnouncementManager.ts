import { NotificationTypeEnum, useNotification } from '@/state/context/NotificationContext';

class AnnouncementManager {
  static sendAnnouncement(message: string, sender: string): void {
    const { notify } = useNotification();
    notify(
      "announcement-id",          // id
      message,                    // content
      null,                       // notificationMessage (if not needed)
      new Date(),                 // date
      NotificationTypeEnum.INFO,  // type (choose from your enum)
      "Announcement",             // optional notificationType
      undefined,                  // options
      sender                      // userName
    );
  }
}


export default AnnouncementManager;
