// OnboardingHooks.ts

import { makeAutoObservable } from 'mobx';
import { useEffect } from 'react';
import { initializeUserData } from '../../pages/onboarding/PersonaBuilderData.js';
import { useAuth } from '../auth/AuthContext';
import { Tracker } from '../models/tracker/Tracker';
import { rootStores } from '../state/stores/RootStores';
import TrackerStore from '../state/stores/TrackerStore';
import { DocumentData } from '../documents/DocumentBuilder.jsx';
import { User } from '../users/User.jsx';

class OnboardingPhase {
  id: string;
  description: string;
  constructor(id: string, description: string) {
    this.id = id;
    this.description = description;
    makeAutoObservable(this);
  }
}

const onboardingPhases: OnboardingPhase[] = [
  new OnboardingPhase('phase1', 'Welcome to the onboarding tutorial! This is step 1.'),
  // Add more phases as needed
];

export const useDynamicOnboarding = (): void => {
  const authContext = useAuth();
  const trackerStore = TrackerStore(rootStores);

  useEffect(() => {
    if (authContext.state.isAuthenticated && authContext.state.user) {
      const user = authContext.state.user;

      onboardingPhases.forEach((phase: OnboardingPhase) => {
        // Use initializeUserData to ensure you have the required information
        const userData = initializeUserData(user, id);

        const tracker: Tracker = {
          id: phase.id,
          name: phase.description,
          phases: [],
          trackFileChanges: function (file: DocumentData): void {
            throw new Error('Function not implemented.');
          },
          trackFolderChanges: function (fileLoader: DocumentData): void {
            throw new Error('Function not implemented.');
          },
          getName: function (trackerName: string): string {
            throw new Error('Function not implemented.');
          },
          updateUserProfile: function (userData: User): void {
            throw new Error('Function not implemented.');
          },
          sendNotification: function (notification: string, userData: User): void {
            throw new Error('Function not implemented.');
          }
        };

        trackerStore.addTracker(tracker);

        // Perform onboarding logic for the current phase (e.g., show a modal or tooltip)
        // ...
      });
    }
  }, [authContext.state.isAuthenticated, authContext.state.user, trackerStore]);
};
