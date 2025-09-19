import { NotificationType, NotificationTypeEnum, useNotification } from '@/context/NotificationContext';

class AnnouncementManager {
  static sendAnnouncement(message: string, sender: string): void {
    const { notify } = useNotification();
    notify(
      "announcement-id",          // id
      message,                    // content
      null,                       // notificationMessage (if not needed)
      new Date(),                 // date
      NotificationTypeEnum.Info,  // type (choose from your enum)
      "Announcement",             // optional notificationType
      undefined,                  // options
      sender                      // userName
    );
  }
}


export default AnnouncementManager;
