// AnnouncementManager.ts
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/core/state/context/NotificationContext';

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
