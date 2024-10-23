// OnboardingPage.tsx
import OnboardingComponent from "@/app/components/onboarding/OnboardingComponent";
import React from "react";
import  RootLayout  from '@/app/RootLayout';

const OnboardingPage: React.FC = () => {
  return (
    <RootLayout>
      <div>
        <h1>Welcome to Onboarding!</h1>
        {/* Add any additional content for the onboarding page */}
        <OnboardingComponent />
      </div>
    </RootLayout>
  );
};

export default OnboardingPage;
