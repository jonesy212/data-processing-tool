import { useSecureStoreId } from '@/app/hooks/useSecureStoreId';
// OnboardingHooks.ts

import { Tracker } from '@/app/models/tracker/Tracker';
import { initializeUserData } from '@/app/pages/onboarding/PersonaBuilderData.js';
import { rootStores } from '@/app/state/stores/RootStores';
import TrackerStore from '@/app/state/stores/TrackerStore';
import { DocumentData } from '@/components/documents/DocumentBuilder';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/users/User.jsx';
import { makeAutoObservable } from 'mobx';
import { useEffect } from 'react';

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

export const useDynamicOnboarding = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): void => {
  const authContext = useAuth();
  const trackerStore = TrackerStore(rootStores);

  useEffect(() => {
    if (authContext.state.isAuthenticated && authContext.state.user) {
      const user = authContext.state.user;

      onboardingPhases.forEach((phase: OnboardingPhase) => {
         const id = useSecureStoreId()
        // Use initializeUserData to ensure you have the required information
        const userData = initializeUserData(this.user, id);

        const tracker: Tracker = {
          id: phase.id,
          name: phase.description,
          phases: [],
          trackFileChanges: function (file: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
            throw new Error('Function not implemented.');
          },
          trackFolderChanges: function (fileLoader: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
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
