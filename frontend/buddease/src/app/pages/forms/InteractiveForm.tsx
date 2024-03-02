// InteractiveForm.tsx
import { AppDevelopmentActions } from '@/app/components/phases/AppDevelopmentActions';
import BrainstormingPhase from '@/app/components/phases/BrainstormingPhase';
import BrandingPhase from '@/app/components/phases/BrandingPhase';
import UXUIDevelopmentPhase from '@/app/components/phases/UXUIDevelopmentPhase';
import TeamBuildingPhase from '@/app/components/projects/TeamBuildingPhase';
import PromptComponent from '@/app/components/prompts/PromptComponent';
import IdeationPhase from '@/app/components/users/userJourney/IdeationPhase';
import React from 'react';
import { AppDevelopmentPhase } from '../../components/phases/AppDevelopmentPhase';
import FormInputComponent from './FormInputComponent';
const InteractiveForm: React.FC = () => {
  return (
    <div>
      <h1>Interactive Form for App Development Process</h1>
      <WebDevelopmentPhase />
      <AppDevelopmentPhase />
      <UXUIDevelopmentPhase />
      <MarketingPhase />
      <BrandingPhase />
      <BrainstormingPhase />
      <TeamBuildingPhase />
      <IdeationPhase />
      <PromptComponent />
      <FormInputComponent />
      <AppDevelopmentActions />
      <AppDevelopmentReducer />
      <AppDevelopmentAPI />
      <AppDevelopmentStyles />
      <PhaseEnums />
      <ValidationUtils />
    </div>
  );
};

export default InteractiveForm;
