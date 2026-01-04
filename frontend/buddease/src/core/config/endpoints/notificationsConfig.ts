config/endpoints/notificationsConfig.ts

export const notificationsConfig = {
  // Basic notification endpoints
  basic: {
    email: '/api/notifications/email',
    push: '/api/notifications/push',
    sms: '/api/notifications/sms',
    inApp: '/api/notifications/in-app',
    webhook: '/api/notifications/webhook',
  },
  
  // Advanced notification endpoints
  advanced: {
    chat: '/api/notifications/chat',
    calendar: '/api/notifications/calendar',
    audioCall: '/api/notifications/audio',
    videoCall: '/api/notifications/video',
    screenShare: '/api/notifications/screenshare',
  },
  
  // Crypto-specific notification endpoints
  crypto: {
    portfolioAlerts: '/api/crypto/notifications/alerts',
    tradeExecutions: '/api/crypto/notifications/trades',
    marketUpdates: '/api/crypto/notifications/market',
  },
  
  // Project management notification endpoints
  project: {
    phaseUpdates: '/api/projects/notifications/phases',
    taskAssignments: '/api/projects/notifications/tasks',
    collaborationUpdates: '/api/projects/notifications/collaboration',
  }
};

Then register in your endpointManager.ts

