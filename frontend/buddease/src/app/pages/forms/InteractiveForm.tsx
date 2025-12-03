// InteractiveForm.tsx
import { AppDevelopmentActions } from '@/app/actions/AppDevelopmentActions';
import { AppDevelopmentPhase } from '@/app/components/phases/AppDevelopmentPhase';
import BrainstormingPhase from '@/app/components/phases/BrainstormingPhase';
import BrandingPhase from '@/app/components/phases/BrandingPhase';
import MarketingPhase from '@/app/components/phases/MarketingPhase';
import UXUIDevelopmentPhase from '@/app/components/phases/UXUIDevelopmentPhase';
import WebDevelopmentPhase from '@/app/components/phases/WebDevelopmentPhase';
import PromptComponent from '@/app/components/prompts/PromptComponent';
import FormInputComponent from '@/app/pages/forms/FormInputComponent';
import TeamBuildingPhase from '@/app/projects/TeamBuildingPhase';
import IdeationPhase from '@/app/users/userJourney/IdeationPhase';
import React from 'react';

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
