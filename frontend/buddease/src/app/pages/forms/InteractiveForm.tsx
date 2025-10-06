// InteractiveForm.tsx
import { AppDevelopmentActions } from '@/app/actions/AppDevelopmentActions';
import BrainstormingPhase from '@/app/components/phases/BrainstormingPhase';
import BrandingPhase from '@/app/components/phases/BrandingPhase';
import UXUIDevelopmentPhase from '@/app/components/phases/UXUIDevelopmentPhase';
import TeamBuildingPhase from '@/app/projects/TeamBuildingPhase';
import PromptComponent from '@/app/components/prompts/PromptComponent';
import IdeationPhase from '@/app/users/userJourney/IdeationPhase';
import React from 'react';
import { AppDevelopmentPhase } from '@/app/components/phases/AppDevelopmentPhase';
import FormInputComponent from '@/pages/forms/FormInputComponent';
import WebDevelopmentPhase from '@/app/components/phases/WebDevelopmentPhase'
import AppDevelopmentPhase from '@/app/components/phases/AppDevelopmentPhase'
import PromptComponent from '@/app/components/prompts/PromptComponent'
import MarketingPhase from '@/app/components/phases/MarketingPhase'

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
