// RegistrationPhaseComponent.tsx

// app/features/registration/components/RegistrationPhaseComponent.tsx
import React, { useState } from 'react';
import { useNotification } from '@/app/context/NotificationContext';
import { useAuth } from '@/app/context/AuthContext';
import { PhaseDefault } from '@/app/types/phase-types';
import { GenericStepContainer } from '@/app/components/shared/steps/GenericStepContainer';
import { useStepNavigation } from '@/app/hooks/useStepNavigation';

interface RegistrationPhaseComponentProps {
  onSuccess: (userData?: any) => void;
  onPhaseComplete?: (phaseData: any) => void;
  currentPhase?: PhaseDefault;
  onNext?: () => void;
  onPrevious?: () => void;
}

const RegistrationPhaseComponent: React.FC<RegistrationPhaseComponentProps> = ({ 
  onSuccess, 
  onPhaseComplete,
  currentPhase,
  onNext,
  onPrevious 
}) => {
  const { notify } = useNotification();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Define registration steps
  const registrationSteps = [
    {
      id: 'account-info',
      title: 'Account Information',
      component: AccountInfoStep
    },
    {
      id: 'personal-details', 
      title: 'Personal Details',
      component: PersonalDetailsStep
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      component: ConfirmationStep
    }
  ];

  const {
    currentStep,
    stepData,
    goToNext,
    goToPrevious,
    isFirstPhase,
    isLastPhase
  } = useStepNavigation(registrationSteps);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      notify('Passwords do not match', 'error');
      return;
    }

    if (!formData.agreeToTerms) {
      notify('Please agree to the terms and conditions', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call your registration API
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      if (result.success) {
        notify('Registration successful!', 'success');
        onPhaseComplete?.(formData);
        onSuccess(result.user);
      } else {
        notify(result.message || 'Registration failed', 'error');
      }
    } catch (error) {
      notify('Registration failed. Please try again.', 'error');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = registrationSteps[currentStep]?.component;

  return (
    <div className="registration-phase">
      <div className="phase-header">
        <h2>Registration</h2>
        <div className="step-indicator">
          Step {currentStep + 1} of {registrationSteps.length}
        </div>
      </div>

      {CurrentStepComponent && (
        <CurrentStepComponent
          formData={formData}
          onInputChange={handleInputChange}
          onNext={goToNext}
          onPrevious={goToPrevious}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          currentStep={currentStep}
          totalSteps={registrationSteps.length}
        />
      )}
    </div>
  );
};

// Step Components
interface StepProps {
  formData: any;
  onInputChange: (field: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
}

const AccountInfoStep: React.FC<StepProps> = ({
  formData,
  onInputChange,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}) => {
  const handleNext = () => {
    if (!formData.email || !formData.password) {
      notify('Please fill in all required fields', 'error');
      return;
    }
    onNext();
  };

  return (
    <GenericStepContainer
      title="Account Information"
      onNext={handleNext}
      onPrevious={onPrevious}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            placeholder="Create a password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => onInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </div>
      </div>
    </GenericStepContainer>
  );
};

const PersonalDetailsStep: React.FC<StepProps> = ({
  formData,
  onInputChange,
  onNext,
  onPrevious,
  currentStep,
  totalSteps
}) => {
  const handleNext = () => {
    if (!formData.firstName || !formData.lastName) {
      notify('Please fill in your name', 'error');
      return;
    }
    onNext();
  };

  return (
    <GenericStepContainer
      title="Personal Details"
      onNext={handleNext}
      onPrevious={onPrevious}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => onInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => onInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>
    </GenericStepContainer>
  );
};

const ConfirmationStep: React.FC<StepProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onPrevious,
  isLoading,
  currentStep,
  totalSteps
}) => {
  return (
    <GenericStepContainer
      title="Confirmation"
      onNext={onSubmit}
      onPrevious={onPrevious}
      currentStep={currentStep}
      totalSteps={totalSteps}
      showNavigation={true}
    >
      <div className="confirmation-content">
        <div className="review-section">
          <h3>Review Your Information</h3>
          <div className="review-details">
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
          </div>
        </div>

        <div className="terms-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => onInputChange('agreeToTerms', e.target.checked)}
            />
            <span>I agree to the Terms of Service and Privacy Policy</span>
          </label>
        </div>

        <div className="submit-section">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !formData.agreeToTerms}
            className="btn-primary w-full"
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </div>
      </div>
    </GenericStepContainer>
  );
};

export default RegistrationPhaseComponent;