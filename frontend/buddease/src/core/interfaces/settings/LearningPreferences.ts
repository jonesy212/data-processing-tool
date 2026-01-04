LearningPreferences.ts
interface LearningPreferences {
  style?: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | 'mixed';
  pace?: 'slow' | 'moderate' | 'fast' | 'self-paced';
  focusAreas?: string[]; // Topics or skills the user wants to prioritize
  preferredResources?: ('videos' | 'articles' | 'interactive' | 'courses')[];
  remindersEnabled?: boolean; // Whether the user wants learning reminders
  reminderFrequency?: 'daily' | 'weekly' | 'monthly';
  progressTracking?: boolean; // Track progress in learning modules
  goalSetting?: {
    enabled: boolean;
    shortTermGoals?: string[];
    longTermGoals?: string[];
  };
  preferredLearningTimes?: ('morning' | 'afternoon' | 'evening' | 'night')[];
  socialLearning?: {
    enabled: boolean; // Whether collaborative learning or peer sessions are preferred
    groupSizePreference?: 'small' | 'medium' | 'large';
    discussionParticipation?: 'active' | 'passive' | 'none';
  };
}


const userLearningPreferences: LearningPreferences = {
  style: 'visual',
  pace: 'self-paced',
  focusAreas: ['AI', 'Blockchain', 'TypeScript'],
  preferredResources: ['videos', 'interactive'],
  remindersEnabled: true,
  reminderFrequency: 'weekly',
  progressTracking: true,
  goalSetting: {
    enabled: true,
    shortTermGoals: ['Finish React course'],
    longTermGoals: ['Build a full-stack app'],
  },
  preferredLearningTimes: ['morning', 'evening'],
  socialLearning: {
    enabled: true,
    groupSizePreference: 'small',
    discussionParticipation: 'active',
  },
};
