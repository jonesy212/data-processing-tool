// OnboardingHooks.ts

import { makeAutoObservable } from 'mobx';
import { useEffect } from 'react';
import { initializeUserData } from '../../pages/onboarding/PersonaBuilderData.js';
import { useAuth } from '../auth/AuthContext';
import { Tracker } from '../models/tracker/Tracker';
import { rootStores } from '../state/stores/RootStores';
import TrackerStore from '../state/stores/TrackerStore';

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
        const userData = initializeUserData(user);

        const tracker: Tracker = {
          id: phase.id,
          name: phase.description,
          phases: [],
        };

        trackerStore.addTracker(tracker);

        // Perform onboarding logic for the current phase (e.g., show a modal or tooltip)
        // ...
      });
    }
  }, [authContext.state.isAuthenticated, authContext.state.user, trackerStore]);
};
