// NotificationChannels.ts

import { BaseNotificationSettings } from "../support/NotificationSettings";


interface NotificationChannels {
  email: boolean;
  push: boolean;
  sms: boolean;
  chat: boolean;
  calendar: boolean;
  audioCall: boolean;
  videoCall: boolean;
  screenShare: boolean;
}

interface GeneralNotificationTypes {
  mention: boolean;
  reaction: boolean;
  follow: boolean;
  poke: boolean;
  activity: boolean;
  thread: boolean;
  inviteAccepted: boolean;
  task: boolean;
  file: boolean;
  meeting: boolean;
  directMessage: boolean;


  audioCall: boolean,
  videoCall: boolean,
  screenShare: boolean,
  chat: boolean,
  calendar: boolean,

  announcement: boolean;
  reminder: boolean;
  project: boolean;
  inApp: boolean;
}

interface CryptoNotificationTypes {
  priceAlerts: boolean;
  tradeConfirmation: boolean;
  marketNews: boolean;
}

interface EventNotificationsSettings extends BaseNotificationSettings {
  channels: NotificationChannels;
  types: GeneralNotificationTypes;
}




export type { EventNotificationsSettings, GeneralNotificationTypes, CryptoNotificationTypes, NotificationChannels};
