// InteractiveForm.tsx
import { AppDevelopmentActions } from '@/core/actions/AppDevelopmentActions';
import { AppDevelopmentPhase } from '@/core/components/phases/AppDevelopmentPhase';
import BrainstormingPhase from '@/core/components/phases/BrainstormingPhase';
import BrandingPhase from '@/core/components/phases/BrandingPhase';
import MarketingPhase from '@/core/components/phases/MarketingPhase';
import UXUIDevelopmentPhase from '@/core/components/phases/UXUIDevelopmentPhase';
import WebDevelopmentPhase from '@/core/components/phases/WebDevelopmentPhase';
import PromptComponent from '@/core/components/prompts/PromptComponent';
import FormInputComponent from '@/core/pages/forms/FormInputComponent';
import TeamBuildingPhase from '@/core/projects/TeamBuildingPhase';
import IdeationPhase from '@/core/users/userJourney/IdeationPhase';
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
