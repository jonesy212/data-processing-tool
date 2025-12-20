// BasicInfoStep.tsx
import React, { useState } from 'react';
import { GenericStepContainer } from '@/app/components/shared/steps/GenericStepContainer';
import { StepComponentProps } from '@/app/hooks/useStepNavigation';

interface BasicInfoStepProps extends StepComponentProps {
  fields: {
    label: string;
    name: string;
    type: 'text' | 'email' | 'textarea' | 'select';
    options?: string[];
    required?: boolean;
  }[];
  title?: string;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  fields,
  title = "Basic Information",
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
  stepData
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <GenericStepContainer
      title={title}
      onNext={() => onNext(formData)}
      onPrevious={onPrevious}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <form onSubmit={handleSubmit} className="basic-info-form">
        {fields.map(field => (
          <div key={field.name} className="form-field">
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                value={formData[field.name]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [field.name]: e.target.value
                }))}
                required={field.required}
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                value={formData[field.name]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [field.name]: e.target.value
                }))}
                required={field.required}
              >
                <option value="">Select an option</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                value={formData[field.name]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [field.name]: e.target.value
                }))}
                required={field.required}
              />
            )}
          </div>
        ))}
      </form>
    </GenericStepContainer>
  );
};